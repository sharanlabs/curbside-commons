/**
 * The single Gemini boundary for the product's LLM drafting. Ported from resilix
 * lib/agents/run.ts (the generic parts). Three jobs: resolve the model id from ONE
 * source, preflight that it's actually available on the key (fail loud, not a silent
 * mid-run 404 -> fallback), and wrap every live call in the budget hard-stop.
 *
 * In this slice the live path is OFF by default (env-flags.liveAiEnabled), so nothing
 * here bills; tests drive it via an injected `generate` (no network, no spend).
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
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
  );
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
 * Hard output-token ceiling on every live call — what makes the pre-call cost ESTIMATE
 * a true upper bound (and thus the $5 hard-stop a guarantee). Sized with headroom for
 * one outreach draft + its claims; too tight truncates the JSON mid-object.
 */
const MAX_LIVE_OUTPUT_TOKENS = 2_000;

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
        maxOutputTokens: MAX_LIVE_OUTPUT_TOKENS,
      });
      return {
        object: result.object,
        usage: {
          inputTokens: result.usage?.inputTokens,
          outputTokens: result.usage?.outputTokens,
          totalTokens: result.usage?.totalTokens,
          finishReason: result.finishReason ?? null,
        } satisfies AgentRunUsage,
      };
    });

  const out = await generate({ model, schema, prompt });
  return { object: out.object, usage: out.usage ?? {} };
}

/**
 * A conservative upper-bound USD estimate for one live call (used as estimatedNextUsd
 * for the budget pre-check). Prices a fixed envelope at the call's model; the output
 * leg is locked to the live output cap so the estimate can never under-price a call.
 */
export function estimateLiveCallCostUsd(
  model: string,
  envelope: { inputTokens: number; outputTokens: number } = {
    inputTokens: 2_000,
    outputTokens: MAX_LIVE_OUTPUT_TOKENS,
  },
): number {
  return costUsd(model, envelope.inputTokens, envelope.outputTokens);
}
