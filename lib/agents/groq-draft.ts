/**
 * The A2 Groq drafting ACTION — the same-family drafter from the A2 loop, RETAINED as the historical
 * A2 reference (its direct unit tests in evals/agent-loop.test.ts still pin the shared injection-cut +
 * the free-tier cost model). A3-3 swapped the LOOP's Drafter to cross-family Gemini (lib/agents/draft.ts
 * `draftOutreach`), so this function is **no longer wired into the orchestrator** — it is kept for those
 * tests and as the A2 same-family reference, NOT called by the live loop. It mirrors draftOutreach's
 * contract (mode taxonomy, fail-closed boundary, injectable `generate`), on the Groq provider, at $0.
 *
 * SHARED, NOT FORKED (R-LOOP-7): it reuses buildPrompt + GeneratedDraftSchema + applyInjectionCut +
 * withRevision from draft.ts verbatim, so the constrained prompt, the §4.2 rules, and the
 * lethal-trifecta injection cut are identical to the Gemini path. The ONLY differences are the provider
 * (Groq) and the cost model.
 *
 * COST MODEL (the mock-fallback trap, closed): Groq's free tier is $0 and KNOWN regardless of reported
 * usage — exactly priceJudge()'s groq short-circuit in semantic-judge.ts. It deliberately does NOT reuse
 * draft.ts's priceLive (which fail-closes to UNKNOWN_USAGE -> mockDraft when usage is absent); on the
 * free tier absent usage is $0, not unknown, so a Groq draft stays LIVE_AI and never silently mocks.
 *
 * SAME-FAMILY (R-LOOP-5): this drafter AND the reverse-faithfulness judge are both Groq gpt-oss-120b —
 * the A2 same-family configuration (convergence, NOT calibrated faithfulness). The loop's CURRENT
 * cross-family maker!=judge (Gemini drafts, Groq judges) lives in the orchestrator (A3-3, R-A3-2).
 */
import type { z } from "zod";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { Merchant } from "@/lib/core/types";
import type { AgentRunUsage, BudgetContext } from "@/lib/agents/gemini";
import { BudgetExceededError } from "@/lib/agents/budget";
import {
  applyInjectionCut,
  buildPrompt,
  GeneratedDraftSchema,
  mockDraft,
  withRevision,
  type DraftResult,
} from "@/lib/agents/draft";
import { liveGroqGenerateObject, resolvedGroqModel } from "@/lib/agents/groq";
import { groqLiveEnabled } from "@/lib/server/env-flags";

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
 * Produce an outreach draft on Groq gpt-oss-120b. Default = the deterministic stub (no spend). The
 * live path runs only when `live` (default = the A2 Groq gate groqLiveEnabled(), which checks
 * ENABLE_LIVE_AI + GROQ_API_KEY with NO provider switch — the drafter is always Groq) OR an injected
 * `generate` is supplied (test/DI, never bills). A live failure -> FAILED_TO_FALLBACK, honestly labeled.
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
  const live = opts.live ?? groqLiveEnabled();

  // Deterministic path (live off, no injected generate): the bounded stub, $0.
  if (!live && !opts.generate) {
    return { draft: mockDraft(merchant, platformName), mode: "DETERMINISTIC_RULES", modelId: "deterministic-rules", costUsd: 0 };
  }

  // Provider boundary (defense-in-depth): a REAL (non-injected) live call REQUIRES the Groq key.
  if (!opts.generate && !groqLiveEnabled()) return fallback(merchant, platformName, "LIVE_AI_DISABLED");

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
