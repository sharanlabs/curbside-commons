/**
 * The Groq provider boundary for the A2 verify-and-self-correct loop — a SIBLING of the Gemini
 * boundary (lib/agents/gemini.ts), same shape, different provider. A2's loop runs entirely on FREE
 * Groq gpt-oss-120b (the drafter) and Gemini is reserved for A3 (Constraint #2): this file makes
 * ZERO Gemini calls.
 *
 * Mirrors gemini.ts's liveGenerateObject: (1) the budget hard-stop fires BEFORE the call (defense-
 * in-depth — on Groq's free tier it never trips, so it is NOT the real guard; the real guards are
 * the loop's maxIterations cap + Groq-window pacing, R-LOOP-4 — named honestly); (2) call
 * generateObject through @ai-sdk/groq with gpt-oss strict structured outputs; (3) return the object
 * + reported usage. An injected `generate` keeps this unit-reachable with no network, no spend
 * (the test/DI path mirrored from draft.ts / semantic-judge.ts).
 *
 * Live AI is OFF by default (judgeLiveEnabled / a Groq key); the offline machinery test drives this
 * via an injected `generate` and never touches the shared Groq window.
 */
import type { z } from "zod";
import { assertWithinBudget, DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";
import type { AgentRunUsage, BudgetContext } from "@/lib/agents/gemini";

/**
 * The A2 loop drafter. SAME FAMILY as the reverse-faithfulness judge (semantic-judge.ts default
 * DEFAULT_JUDGE_MODEL = "openai/gpt-oss-120b") — this is deliberate and load-bearing for R-LOOP-5:
 * A2 proves loop CONVERGENCE/machinery, NOT calibrated cross-family faithfulness. Cross-family
 * maker!=judge (R-ARCH-3) is restored at A3 when Gemini becomes the drafter. Re-verify the model id
 * at use-time (RULES §6 — the Groq deprecation list moves); override per deployment with
 * GROQ_DRAFT_MODEL.
 */
const DEFAULT_GROQ_DRAFT_MODEL = "openai/gpt-oss-120b";

/** The configured Groq drafting model, resolved from ONE place (env override wins, else the default). */
export function resolvedGroqModel(): string {
  return process.env.GROQ_DRAFT_MODEL?.trim() || DEFAULT_GROQ_DRAFT_MODEL;
}

/**
 * Output-token ceiling for one draft (prose + ~4-8 claims). Sized like gemini's MAX_LIVE_OUTPUT_TOKENS
 * so the JSON object is never truncated mid-claim; Groq reserves this against the free-tier per-minute
 * window at request time, so it is kept modest. Truncation degrades to the honest FAILED_TO_FALLBACK.
 */
const MAX_GROQ_DRAFT_OUTPUT_TOKENS = 2_000;

/** The default live Groq call (gpt-oss strict structured outputs). Mirrors semantic-judge's groq branch. */
async function defaultGroqGenerate(a: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
}): Promise<{ object: unknown; usage?: AgentRunUsage }> {
  const [{ createGroq }, { generateObject }] = await Promise.all([import("@ai-sdk/groq"), import("ai")]);
  const provider = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const r = await generateObject({
    model: provider(a.model),
    schema: a.schema,
    prompt: a.prompt,
    maxOutputTokens: MAX_GROQ_DRAFT_OUTPUT_TOKENS,
    temperature: 0,
    // structuredOutputs -> gpt-oss constrained decoding (strict JSON). reasoningEffort "low": drafting
    // an onboarding nudge from fixed facts needs little reasoning, and it roughly halves token use so
    // a paced loop fits the free-tier window.
    providerOptions: { groq: { structuredOutputs: true, reasoningEffort: "low" } },
  });
  return {
    object: r.object,
    usage: {
      inputTokens: r.usage?.inputTokens,
      outputTokens: r.usage?.outputTokens,
      totalTokens: r.usage?.totalTokens,
      finishReason: r.finishReason ?? null,
    } satisfies AgentRunUsage,
  };
}

/**
 * The SINGLE live-Groq call boundary. Budget hard-stop BEFORE the (free) call, then generateObject.
 * Injected `generate` = the test/DI path (no network, no spend).
 */
export async function liveGroqGenerateObject(args: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
  budget: BudgetContext;
  generate?: (a: {
    model: string;
    schema: z.ZodTypeAny;
    prompt: string;
  }) => Promise<{ object: unknown; usage?: AgentRunUsage }>;
}): Promise<{ object: unknown; usage: AgentRunUsage }> {
  const { model, schema, prompt, budget } = args;
  // Defense-in-depth only (free tier => never trips). The real guards live in the orchestrator.
  assertWithinBudget(budget.spentUsd, budget.estimatedNextUsd, budget.capUsd ?? DEFAULT_BUDGET_CAP_USD);
  const generate = args.generate ?? defaultGroqGenerate;
  const out = await generate({ model, schema, prompt });
  return { object: out.object, usage: out.usage ?? {} };
}
