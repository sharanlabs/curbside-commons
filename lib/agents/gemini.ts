/**
 * The single Gemini boundary for the product's LLM drafting. Ported from resilix
 * lib/agents/run.ts (the generic parts). Three jobs: resolve the model id from ONE
 * source, preflight that it's actually available on the key (fail loud, not a silent
 * mid-run 404 -> fallback), and wrap every live call in the budget hard-stop.
 *
 * In this slice the live path is OFF by default (env-flags.liveAiEnabled), so nothing
 * here bills; tests drive it via an injected `generate` (no network, no spend).
 *
 * ARMING REQUIREMENT (2026-07-24): the budget hard-stop here is a PRE-call guard that
 * bounds only the reserved ESTIMATE. The paired POST-call overflow stop that bounds a
 * single call's actual-vs-reserved overshoot exists ONLY in the archived legacy
 * activation orchestrator (legacy/activation/lib/agents/loop/orchestrator.ts) — there is
 * NO active non-legacy driver wired to this boundary. Any future non-legacy live driver
 * MUST re-implement that post-call overflow stop before arming; the docstrings below name
 * it "the arming-required post-call overflow stop" to mark it as that mandated (not yet
 * active) control, never a live safety net that already exists here.
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { z } from "zod";
import { assertWithinBudget, DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";
import { costUsd } from "@/lib/agents/pricing";
import { liveAiEnabled } from "@/lib/server/env-flags";

/**
 * The run mode a draft was produced in (the honesty taxonomy surfaced in the UI):
 * - DETERMINISTIC_RULES — the bounded stub ran (AI disabled by config); healthy.
 * - LIVE_AI            — a live Gemini call succeeded.
 * - REPLAY             — served from a recorded snapshot (the public demo).
 * - FAILED_TO_FALLBACK — a live call was attempted and failed; the stub answered. Degraded.
 */
export type AgentMode = "DETERMINISTIC_RULES" | "LIVE_AI" | "REPLAY" | "FAILED_TO_FALLBACK";

/** Provider-reported usage for the cost ledger (fields are number|undefined per the SDK). */
export type AgentRunUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  /**
   * Thinking ("reasoning") tokens (the SDK maps Gemini's thoughtsTokenCount here). SEPARATE from
   * outputTokens, and Google bills them at the OUTPUT rate — so the cost ledger MUST price them too
   * (Codex slice-1 P1). IMPORTANT (Codex slice-1 confirming P1): reasoning tokens are NOT bounded by
   * maxOutputTokens (that cap governs only the response/completion candidate; thoughtsTokenCount is a
   * separate budget). So the pre-call estimate reserves them SEPARATELY (MAX_LIVE_REASONING_TOKENS_
   * RESERVED, below) as a CONSERVATIVE BEST-EFFORT bound — Gemini's thinking budget is soft, so this
   * is not a provider-proven hard ceiling; the arming-required post-call overflow stop covers the
   * residual (legacy-only today; see the file-header ARMING REQUIREMENT). With thinkingBudget=0 this
   * should be 0; non-zero here is the fingerprint of the "model
   * ignored thinkingBudget" path (and the reason it must be priced).
   */
  reasoningTokens?: number;
  finishReason?: string | null;
};

/**
 * Default GA model. Re-verify at use-time (RULES §6) — never trust this from memory; the
 * preflight below turns a Google retirement into a one-line config bump, not a silent
 * mid-run failure. Override per deployment with GEMINI_MODEL.
 */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** The configured model id, resolved once (GEMINI_MODEL override wins, else the GA default). */
export function resolvedGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

/** Normalize "models/gemini-2.5-flash" <-> "gemini-2.5-flash" before comparing. */
function bareModelId(id: string): string {
  return id.replace(/^models\//, "").trim();
}

/** The Gemini handle, keyed on OUR env var (GEMINI_API_KEY), resolved at CALL time. */
function geminiModel(modelId: string) {
  const provider = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  return provider(modelId);
}

/** ListModels over the documented REST surface (the SDK exposes no listing method). */
export async function listGeminiModels(): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("listGeminiModels: GEMINI_API_KEY is not set; cannot preflight models.");
  // Send the key as a header, never a URL query param — query strings leak into proxy/server logs.
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    headers: { "x-goog-api-key": key },
  });
  if (!res.ok) {
    throw new Error(
      `listGeminiModels: request failed (${res.status} ${res.statusText}). ` +
        `Check the key and that the Generative Language API is enabled.`,
    );
  }
  const data = (await res.json()) as { models?: Array<{ name?: string }> };
  return (data.models ?? []).map((m) => m.name).filter((n): n is string => typeof n === "string");
}

/**
 * Preflight (live-AI startup ONLY): assert the configured model is available on the key,
 * else FAIL LOUD listing what IS available. listModels is injected so a fixture proves
 * both the pass and the fail path with no network.
 */
export async function assertConfiguredModelAvailable({
  listModels,
  enabled = liveAiEnabled,
  model = resolvedGeminiModel,
}: {
  listModels: () => Promise<string[]>;
  enabled?: () => boolean;
  model?: () => string;
}): Promise<void> {
  if (!enabled()) return; // live path never runs -> nothing to preflight, no fetch
  const wanted = bareModelId(model());
  const available = (await listModels()).map(bareModelId);
  if (!available.includes(wanted)) {
    throw new Error(
      `Configured Gemini model "${wanted}" is not available on this key. ` +
        `Available: ${available.join(", ") || "(none)"}. Set GEMINI_MODEL or update the default.`,
    );
  }
}

export type BudgetContext = { spentUsd: number; estimatedNextUsd: number; capUsd?: number };
export type LiveGenerateResult = { object: unknown; usage: AgentRunUsage };

/**
 * The completion-token ceiling on every live call. The pre-call cost ESTIMATE reserves it (plus a
 * separate thinking reserve, MAX_LIVE_REASONING_TOKENS_RESERVED) as a CONSERVATIVE BEST-EFFORT bound —
 * the $5 hard-stop is fail-closed, NOT a provider-proven hard guarantee (Gemini's thinking budget is a
 * soft limit; see budget.ts + the arming-required post-call overflow stop). Sized with headroom for one
 * outreach draft + its claims; too tight truncates the JSON mid-object.
 *
 * RAISED 2_000 -> 4_096 (drafter-reliability slice, 2026-06-28). The A3-7 live run found the
 * Gemini 2.5 Flash redraft failed to parse ~75% of the time ("No object generated: could not
 * parse the response" = the AI SDK's NoObjectGeneratedError, finishReason "length"). ROOT CAUSE
 * (RULES §6, freshness-checked 2026-06-28 against the AI SDK + Google docs): gemini-2.5-flash is
 * a THINKING model with thinking ON by default, and thinking tokens are billed against
 * maxOutputTokens — so a 2_000 ceiling let internal reasoning starve the JSON, truncating
 * structured output (sources: github.com/valentinfrlch/ha-llmvision#609; github.com/vercel/ai#14377).
 * The PRIMARY fix is disabling thinking (LIVE_THINKING_BUDGET_TOKENS=0, below); this larger ceiling
 * is cheap insurance for the case where the model ignores thinkingBudget=0 (a reported intermittent
 * behavior) — it leaves room for both reasoning AND the JSON to finish. Cost impact is negligible:
 * the ceiling only sizes the pre-call ESTIMATE (an upper bound), not actual spend; a full R-A3-9
 * run stays far under the $5 cap. The live confirmation (finishReason no longer "length") is the
 * owner-gated slice-2 re-run; this slice wires + proves the fix offline only.
 */
const MAX_LIVE_OUTPUT_TOKENS = 4_096;

/**
 * Worst-case THINKING (reasoning) tokens to reserve in the pre-call cost ESTIMATE (Codex slice-1
 * confirming P1). Reasoning tokens are billed at the output rate but are NOT bounded by
 * maxOutputTokens (Gemini's thoughtsTokenCount is a separate budget), so the estimate must reserve
 * them separately or it under-reserves the thinkingBudget-ignored path. 24_576 is gemini-2.5-flash's
 * DOCUMENTED maximum CONFIGURABLE thinking budget (RULES §6, dated 2026-06-29). HONEST LIMIT (Codex
 * slice-1 confirming P1): Google documents the thinking budget as a SOFT limit that can overflow, so
 * this is a CONSERVATIVE BEST-EFFORT reservation covering the expected ceiling — NOT a provider-proven
 * hard cap. The residual (a soft-budget overflow beyond this) is bounded to a single call by the
 * arming-required post-call fail-closed overflow stop (it halts the run if any call's actual cost
 * exceeds its reservation). With thinking actually disabled (thinkingBudget=0) real reasoning is 0, so
 * in practice this just makes the reservation conservative. Re-verify the max at use-time if the model
 * id changes.
 */
const MAX_LIVE_REASONING_TOKENS_RESERVED = 24_576;

/**
 * Thinking-token budget for the structured drafting call. 0 DISABLES Gemini 2.5 thinking
 * (per the @ai-sdk/google thinkingConfig contract — "0 disables thinking, if the model
 * supports it"; gemini-2.5-flash supports 0). This is the PRIMARY drafter-reliability fix:
 * for a bounded, schema-constrained outreach draft, extended reasoning adds no value but DOES
 * compete with the JSON for the output budget (the A3-7 truncation root cause). Disabling it
 * also keeps cost honest — no thinking tokens billed at the output rate. RULES §6 freshness-
 * checked 2026-06-28; the live EFFECT (parse rate recovers) is PENDING — measured at the
 * owner-gated slice-2 run, not yet confirmed.
 */
export const LIVE_THINKING_BUDGET_TOKENS = 0;

/**
 * The non-model generateObject options for a live drafting call, as a PURE function so the
 * thinking-disable + output-ceiling + no-retry wiring is unit-provable offline (the default
 * `generate` closure below only runs live). Spread into generateObject alongside the
 * model/schema/prompt.
 */
export function liveGenerationOptions(): {
  maxOutputTokens: number;
  maxRetries: number;
  providerOptions: { google: { thinkingConfig: { thinkingBudget: number; includeThoughts: boolean } } };
} {
  return {
    maxOutputTokens: MAX_LIVE_OUTPUT_TOKENS,
    // maxRetries=0 (Codex slice-1 P1): keeps ONE pre-call reservation (estimateLiveCallCostUsd)
    // mapped to exactly ONE billed SDK provider attempt. The AI SDK default is 2, which would let a
    // single reserve silently cover up to THREE billed attempts — breaking that 1:1 accounting. This
    // does NOT make the reserve a provider-proven hard ceiling: a soft thinking-budget overflow or an
    // oversized prompt can still bill above the reservation on that one attempt — that residual is
    // caught by the arming-required post-call budget_overflow stop (the fail-closed best-effort bound),
    // NOT here. A structured-output parse failure is non-retryable anyway, and the LOOP re-drafts on a
    // verify failure (retry at the right layer).
    maxRetries: 0,
    providerOptions: {
      google: { thinkingConfig: { thinkingBudget: LIVE_THINKING_BUDGET_TOKENS, includeThoughts: false } },
    },
  };
}

/**
 * The SINGLE live-call boundary. (1) budget hard-stop BEFORE the billable call (a breach
 * throws, so generateObject never fires and cannot bill); (2) call generateObject and
 * return the object + reported usage for the cost ledger. Injected `generate` keeps this
 * unit-reachable without network.
 */
export async function liveGenerateObject(args: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
  budget: BudgetContext;
  generate?: (a: {
    model: string;
    schema: z.ZodTypeAny;
    prompt: string;
  }) => Promise<{ object: unknown; usage?: AgentRunUsage }>;
}): Promise<LiveGenerateResult> {
  const { model, schema, prompt, budget } = args;

  assertWithinBudget(budget.spentUsd, budget.estimatedNextUsd, budget.capUsd ?? DEFAULT_BUDGET_CAP_USD);

  const generate =
    args.generate ??
    (async (a: { model: string; schema: z.ZodTypeAny; prompt: string }) => {
      const result = await generateObject({
        model: geminiModel(a.model),
        schema: a.schema,
        prompt: a.prompt,
        ...liveGenerationOptions(),
      });
      return {
        object: result.object,
        usage: {
          inputTokens: result.usage?.inputTokens,
          outputTokens: result.usage?.outputTokens,
          totalTokens: result.usage?.totalTokens,
          reasoningTokens: result.usage?.reasoningTokens, // billed at the output rate — priced in the ledger (Codex P1)
          finishReason: result.finishReason ?? null,
        } satisfies AgentRunUsage,
      };
    });

  const out = await generate({ model, schema, prompt });
  return { object: out.object, usage: out.usage ?? {} };
}

/**
 * A conservative upper-bound USD estimate for one live call (used as estimatedNextUsd for the budget
 * pre-check). Prices a fixed envelope at the call's model. The output leg reserves the FULL billable
 * output domain that priceLive() charges — completion (MAX_LIVE_OUTPUT_TOKENS) PLUS the worst-case
 * reasoning budget (MAX_LIVE_REASONING_TOKENS_RESERVED) — because Gemini bills thinking tokens at the
 * output rate and they are NOT capped by maxOutputTokens (Codex slice-1 confirming P1). This makes the
 * estimate a CONSERVATIVE BEST-EFFORT reservation over the documented thinking ceiling — it covers the
 * expected worst case, but Gemini's thinking budget is a SOFT limit, so it is not a provider-proven
 * hard bound; the arming-required post-call fail-closed overflow stop bounds any soft-overflow to one
 * call. With thinking actually disabled the real cost is far lower — the reservation is deliberately
 * conservative, never under-priced in the expected case.
 */
export function estimateLiveCallCostUsd(
  model: string,
  envelope: { inputTokens: number; outputTokens: number } = {
    inputTokens: 2_000,
    outputTokens: MAX_LIVE_OUTPUT_TOKENS + MAX_LIVE_REASONING_TOKENS_RESERVED,
  },
): number {
  return costUsd(model, envelope.inputTokens, envelope.outputTokens);
}
