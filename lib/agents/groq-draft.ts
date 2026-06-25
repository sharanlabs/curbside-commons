/**
 * The A2 Groq drafting ACTION — the LLM action the single-agent loop takes (Constraint #2: A2's loop
 * is FREE Groq gpt-oss-120b; ZERO Gemini). It mirrors lib/agents/draft.ts's draftOutreach contract
 * (mode taxonomy, fail-closed boundary, injectable `generate`), but on the Groq provider and at $0.
 *
 * SHARED, NOT FORKED (R-LOOP-7): it reuses buildPrompt + GeneratedDraftSchema + applyInjectionCut from
 * draft.ts verbatim, so the constrained prompt and the lethal-trifecta injection cut are identical to
 * the Gemini path. The ONLY differences are the provider (Groq) and the cost model.
 *
 * COST MODEL (the mock-fallback trap, closed): Groq's free tier is $0 and KNOWN regardless of reported
 * usage — exactly priceJudge()'s groq short-circuit in semantic-judge.ts. We deliberately do NOT reuse
 * draft.ts's priceLive (which fail-closes to UNKNOWN_USAGE -> mockDraft when usage is absent). An
 * injected `generate` returns no usage; on the free tier that is $0, not unknown — so the loop stays on
 * the LIVE_AI path and never silently degrades to the mock (which would make R-LOOP-8 pass for the
 * wrong reason).
 *
 * SAME-FAMILY (R-LOOP-5): the drafter here AND the reverse-faithfulness judge are both Groq
 * gpt-oss-120b. A2 asserts loop convergence/machinery, NOT calibrated faithfulness. Documented, not
 * overclaimed.
 */
import type { z } from "zod";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { Merchant } from "@/lib/core/types";
import type { AgentRunUsage, BudgetContext } from "@/lib/agents/gemini";
import { BudgetExceededError } from "@/lib/agents/budget";
import { applyInjectionCut, buildPrompt, GeneratedDraftSchema, mockDraft, type DraftResult } from "@/lib/agents/draft";
import { liveGroqGenerateObject, resolvedGroqModel } from "@/lib/agents/groq";
import { judgeLiveEnabled } from "@/lib/server/env-flags";

/** The injectable generate (test/DI) — same shape as draft.ts / semantic-judge.ts. */
type GenerateObjectFn = (a: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
}) => Promise<{ object: unknown; usage?: AgentRunUsage }>;

/** A FAILED_TO_FALLBACK result on the Groq path: the deterministic stub answers, honestly labeled. */
function fallback(merchant: Merchant, platformName: string, errorClass: string): DraftResult {
  return {
    draft: mockDraft(merchant, platformName),
    mode: "FAILED_TO_FALLBACK",
    modelId: resolvedGroqModel(),
    costUsd: 0, // free tier — a Groq failure never billed
    errorClass,
  };
}

/**
 * Append the reflect->redraft revision instruction to the constrained prompt, keeping the untrusted-
 * data framing (the instruction is OUR text, but we frame the whole appendix as "do not add new facts"
 * so a future LLM-authored reflection can't smuggle a fabrication back in).
 */
function withRevision(prompt: string, instruction: string): string {
  return [
    prompt,
    "",
    "REVISION REQUIRED — a faithfulness check flagged the previous draft. Rewrite so the flagged",
    "content is REMOVED. Do NOT introduce any fact that is not in FACTS above (no timelines, named",
    "entities, capabilities, benefits, or counts the record does not contain). Flagged issue:",
    instruction,
  ].join("\n");
}

/**
 * Produce an outreach draft on Groq gpt-oss-120b. Default = the deterministic stub (no spend). The
 * live path runs only when `live` (default = the A2 Groq gate judgeLiveEnabled(), which checks
 * ENABLE_LIVE_AI + GROQ_API_KEY) OR an injected `generate` is supplied (test/DI, never bills). A live
 * failure -> FAILED_TO_FALLBACK with the stub, honestly labeled.
 *
 * `instruction` is the reflect-step revision instruction (R-LOOP-2); when present the prompt asks the
 * model to remove the flagged content without adding new facts.
 */
export async function draftOutreachGroq(
  merchant: Merchant,
  opts: {
    platformName?: string;
    instruction?: string;
    live?: boolean;
    budget?: BudgetContext;
    generate?: GenerateObjectFn;
  } = {},
): Promise<DraftResult> {
  const platformName = opts.platformName ?? REFERENCE_PLATFORM_NAME;
  const live = opts.live ?? judgeLiveEnabled();

  // Deterministic path (live off, no injected generate): the bounded stub, $0.
  if (!live && !opts.generate) {
    return { draft: mockDraft(merchant, platformName), mode: "DETERMINISTIC_RULES", modelId: "deterministic-rules", costUsd: 0 };
  }

  // Provider boundary (defense-in-depth): a REAL (non-injected) live call REQUIRES the Groq key.
  if (!opts.generate && !judgeLiveEnabled()) return fallback(merchant, platformName, "LIVE_AI_DISABLED");

  // The cumulative ledger is required on the live path — no ledger => fail closed (no call). On the
  // free tier this never actually trips; it is threaded for honesty/symmetry, not as the real guard.
  if (!opts.budget) return fallback(merchant, platformName, "NO_BUDGET_LEDGER");
  const budget = opts.budget;

  const modelId = resolvedGroqModel();
  const base = buildPrompt(merchant, platformName);
  const prompt = opts.instruction ? withRevision(base, opts.instruction) : base;

  try {
    const { object } = await liveGroqGenerateObject({
      model: modelId,
      schema: GeneratedDraftSchema,
      prompt,
      budget,
      generate: opts.generate,
    });
    // FREE + KNOWN: Groq free tier is $0 regardless of usage (no UNKNOWN_USAGE fail-closed here).
    const cut = applyInjectionCut(object, merchant, modelId);
    if (!cut.ok) return fallback(merchant, platformName, cut.errorClass);
    return { draft: cut.draft, mode: "LIVE_AI", modelId, costUsd: 0 };
  } catch (err) {
    if (err instanceof BudgetExceededError) return fallback(merchant, platformName, err.message);
    const message = err instanceof Error ? err.message : "GROQ_DRAFT_CALL_THREW";
    return fallback(merchant, platformName, message);
  }
}
