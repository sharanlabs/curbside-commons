/**
 * THE STRATEGIST (A3-2) — and, FIRST, the STRONG deterministic baseline it must beat.
 *
 * WHY a strong baseline (advisor-cross-checked; AM-2 "no agent costumes" + R-A3-1): grading the LLM
 * Strategist against the naive A2 stand-in (`defaultRecommend`, which sets `strategy = play.touch`)
 * would let a costume "pass" — R-A3-1's literal wording ("diverges from `diagnose().play`") is WEAKER
 * than AM-2 requires. `diagnose().play` routes ONLY on `engagement_state × blocker_source`; it provably
 * IGNORES `risk_level`, tenure, and the specific root-cause. The honest anti-theater bar is therefore
 * "beats `strongRecommend`" — a deterministic function that ALREADY reads those ignored factors and
 * produces differentiated strategy/tone/caution.
 *
 * `strongRecommend` is THREE things at once: (1) the honest anti-theater BASELINE; (2) the DEMOTION
 * FALLBACK if the Strategist cannot beat it (AM-7: demote-to-tool + correct the "4 agents" count is a
 * SUCCESS of the process, not a failure); (3) an UPGRADE to the deterministic recommend regardless of
 * the LLM verdict (it already beats the naive stand-in).
 *
 * RECOMMEND-ONLY (R-A3-3 / R-LOOP-1b): `route` is ADVISORY and never feeds the send. The send transition
 * is `computeSendEligible`'s alone; the agent — LLM or deterministic — cannot move eligibility. Any
 * LLM-proposed route is CLAMPED to the deterministically-allowed envelope in code, never trusted.
 */
import { z } from "zod";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { Merchant } from "@/lib/core/types";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import type { Recommendation, RecommendedRoute } from "@/lib/agents/loop/orchestrator";
import type { BudgetContext } from "@/lib/agents/gemini";
import { liveGroqGenerateObject, resolvedGroqModel } from "@/lib/agents/groq";
import { groqLiveEnabled } from "@/lib/server/env-flags";

/**
 * The structured anti-theater DISCRIMINATOR (R-A3-1): compliance caution, which SHOULD track
 * `risk_level` — a factor `diagnose().play` ignores. It is a FINITE enum on purpose: a deterministic
 * baseline can match it, which is exactly the point — the structural axis is meant to be deterministically
 * reproducible, so the eval can show whether the LLM adds anything BEYOND a finite decision table.
 */
export type ComplianceCaution = "standard" | "elevated";

/** Honest provenance of a Strategist recommendation (mirrors the draft mode taxonomy). */
export type StrategistMode = "LIVE_AI" | "DETERMINISTIC_RULES" | "FAILED_TO_FALLBACK";

/** A Strategist recommendation = the base Recommendation + the structured discriminator the eval scores. */
export interface StrategistRecommendation extends Recommendation {
  caution: ComplianceCaution;
  /** Narrows the base Recommendation.mode to the Strategist taxonomy: LIVE_AI = Groq ran;
   *  DETERMINISTIC_RULES = the strong baseline answered; FAILED_TO_FALLBACK = the live call failed and
   *  the baseline answered. Undefined on the pure `strongRecommend` baseline (the eval path). The honest
   *  `errorClass` (on FAILED_TO_FALLBACK) is inherited from the base Recommendation. */
  mode?: StrategistMode;
}

/** The deterministically-allowed route envelope (recommend-only; never feeds the send — R-A3-3). */
export function allowedRoute(merchant: Merchant): RecommendedRoute {
  if (merchant.suppression_reason.trim() !== "" || !merchant.contact_eligible) return "suppress";
  if (merchant.review_required) return "hold_for_review";
  return "contact";
}

/**
 * Clamp an (e.g. LLM-proposed) route to the deterministically-allowed envelope — NEVER trust the LLM
 * to relax caution. The firewall only allows the recommendation to be MORE cautious than the floor, never
 * less: suppress floor ⇒ suppress only; hold floor ⇒ hold or suppress (never contact); contact floor ⇒
 * any (recommending extra caution on an eligible merchant is permissible advice).
 */
export function clampRouteToEnvelope(route: RecommendedRoute, merchant: Merchant): RecommendedRoute {
  const floor = allowedRoute(merchant);
  if (floor === "suppress") return "suppress";
  if (floor === "hold_for_review") return route === "suppress" ? "suppress" : "hold_for_review";
  return route;
}

/** Compliance caution — reads `risk_level` (which `diagnose().play` ignores) + the review gate. */
function caution(merchant: Merchant): ComplianceCaution {
  if (merchant.risk_level === "High") return "elevated";
  if (merchant.review_required) return "elevated";
  return "standard";
}

/** Tone — calibrated by engagement_state AND risk (the play's touch carries neither). */
function strongTone(merchant: Merchant, d: Diagnosis): string {
  const measured = caution(merchant) === "elevated";
  switch (d.engagement_state) {
    case "ghosted":
    case "dormant":
      return measured
        ? "warm but measured; low-pressure re-engagement, compliance-aware"
        : "warm, low-pressure, encouraging re-engagement";
    case "actively_stuck":
      return measured ? "helpful, concise, measured — pre-empt the verification concern" : "helpful, concise, encouraging";
    case "new":
      return "light, welcoming, no pressure";
    default:
      return measured ? "concise, measured" : "concise, encouraging";
  }
}

/** Strategy — the emphasis the routed touch does NOT carry: framing + tenure + risk pre-emption. */
function strongStrategy(merchant: Merchant, d: Diagnosis): string {
  const parts: string[] = [];
  if (d.engagement_state === "dormant") parts.push("Acknowledge their earlier progress before the step nudge");
  else if (d.engagement_state === "ghosted") parts.push("Re-establish value before asking for the step");
  else if (d.engagement_state === "new") parts.push("Welcome them; defer reactivation pressure");
  else parts.push(`Lead with the specific ${d.blocker_label.toLowerCase()} fix`);
  // Tenure magnitude: a long-stalled merchant needs different framing than a fresh one (play ignores this).
  if (d.engagement_state !== "new" && merchant.days_since_signup >= 45) {
    parts.push("name the long gap candidly and make returning frictionless");
  }
  // Risk: pre-empt the compliance/verification objection; never over-promise (the §4.2 spirit).
  if (caution(merchant) === "elevated") {
    parts.push("pre-empt the verification/compliance concern; do not promise timelines or outcomes");
  }
  return parts.join("; ") + ".";
}

/**
 * The STRONG deterministic baseline (and demotion fallback). Reads risk + tenure + engagement + root
 * cause and produces a differentiated strategy/tone/caution — everything a finite decision table can do.
 * RECOMMEND-ONLY: `route` is the deterministically-allowed envelope; it never feeds the send.
 */
export function strongRecommend(merchant: Merchant, diagnosis: Diagnosis): StrategistRecommendation {
  const route = allowedRoute(merchant);
  if (route === "suppress") {
    return {
      route,
      strategy: diagnosis.play.touch,
      tone: "n/a",
      rationale: "Contact suppressed/ineligible — do not draft outreach.",
      caution: "elevated",
    };
  }
  return {
    route,
    strategy: strongStrategy(merchant, diagnosis),
    tone: strongTone(merchant, diagnosis),
    rationale: `engagement=${diagnosis.engagement_state}, risk=${merchant.risk_level}, tenure=${merchant.days_since_signup}d → ${diagnosis.root_cause_hypothesis}`,
    caution: caution(merchant),
  };
}

// ─────────────────────────────── THE LLM STRATEGIST (A3-2) ───────────────────────────────

/** The structured output the LLM Strategist returns. `route` is ADVISORY — clamped in code, never trusted. */
const StrategistOutputSchema = z.object({
  strategy: z.string().min(1),
  tone: z.string().min(1),
  caution: z.enum(["standard", "elevated"]),
  route: z.enum(["contact", "hold_for_review", "suppress"]),
  rationale: z.string().min(1),
});

/** The injectable generate (test/DI) — same shape as groq-draft.ts / semantic-judge.ts. */
type GenerateObjectFn = (a: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
}) => Promise<{ object: unknown; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; finishReason?: string | null } }>;

/**
 * The Strategist prompt — STRUCTURED FACTS ONLY. It deliberately does NOT include the raw merchant_name:
 * the Strategist reasons over the deterministic diagnosis, not free text, so there is no prompt-injection
 * surface here (the untrusted name reaches only the Drafter, behind the {{MERCHANT}} injection-cut
 * placeholder). It has NO eligibility authority — `route` is advisory and clamped after the call.
 */
export function buildStrategistPrompt(merchant: Merchant, d: Diagnosis, platformName: string): string {
  return [
    `You are an onboarding-activation STRATEGIST for ${platformName}. Given a stalled merchant's`,
    "deterministic diagnosis, choose the OUTREACH APPROACH — what to emphasize, which objection to",
    "pre-empt, and the tone — calibrated to engagement, tenure, and compliance risk. You do NOT write the",
    "email and you do NOT decide eligibility; you recommend strategy only.",
    "",
    "DIAGNOSIS (reason ONLY from these structured facts; invent nothing):",
    `- engagement_state: ${d.engagement_state}`,
    `- blocker: ${d.blocker_label} (${d.blocker_code}); source: ${d.blocker_source}`,
    `- root_cause_hypothesis: ${d.root_cause_hypothesis}`,
    `- routed touch (channel/template only): ${d.play.touch}`,
    `- tenure (days_since_signup): ${merchant.days_since_signup}`,
    `- risk_level: ${merchant.risk_level}; review_required: ${merchant.review_required}`,
    "",
    "Return JSON { strategy, tone, caution, route, rationale }:",
    "- caution = 'elevated' when risk_level is High OR review_required is true, else 'standard'.",
    "- route is ADVISORY ('contact' | 'hold_for_review' | 'suppress'); you may recommend only MORE caution, never less.",
    "- Calibrate strategy/tone to engagement_state, tenure, and risk — do NOT merely restate the routed touch.",
    "- Never promise timelines, approvals, or outcomes (over-promise guard).",
  ].join("\n");
}

/**
 * THE STRATEGIST (A3-2) — the LLM strategy-synthesis seam on free Groq gpt-oss-120b. Mirrors
 * lib/agents/groq-draft.ts: DI `generate`, deterministic-stub default ($0), honest FAILED_TO_FALLBACK.
 *
 * RECOMMEND-ONLY (R-A3-3): the LLM's proposed `route` is CLAMPED to the deterministically-allowed
 * envelope (clampRouteToEnvelope) — the agent can only advise MORE caution, never relax it; the route
 * never feeds the send regardless. On ANY failure it falls back to `strongRecommend`, labeled honestly.
 *
 * TOOL-UNTIL-EARNED (AM-2 / R-A3-1): wiring this LLM does NOT make the plan step a "strategist" in the
 * trajectory. The structural discriminator (`caution`) is a finite enum a deterministic baseline computes
 * perfectly, so on that axis the Strategist can at best TIE `strongRecommend` — the A3-2 eval is a
 * NECESSARY anti-theater FLOOR (it fails a Strategist worse than the baseline), not a label-earning
 * ceiling. The `strategist` label is expected to DEFER to the A3-3 cross-family judge that can score
 * open-ended strategy/tone synthesis (a demote/defer is an AM-7 success, not a failure).
 */
export async function strategistRecommend(
  merchant: Merchant,
  diagnosis: Diagnosis,
  opts: {
    platformName?: string;
    live?: boolean;
    budget?: BudgetContext;
    generate?: GenerateObjectFn;
  } = {},
): Promise<StrategistRecommendation> {
  const live = opts.live ?? groqLiveEnabled();

  // Deterministic path (live off, no injected generate): the strong baseline, $0.
  if (!live && !opts.generate) {
    return { ...strongRecommend(merchant, diagnosis), mode: "DETERMINISTIC_RULES" };
  }
  // Provider boundary (defense-in-depth): a REAL (non-injected) live call REQUIRES the Groq key.
  if (!opts.generate && !groqLiveEnabled()) {
    return { ...strongRecommend(merchant, diagnosis), mode: "FAILED_TO_FALLBACK", errorClass: "LIVE_AI_DISABLED" };
  }
  // The cumulative ledger is required on the live path (free Groq => never trips; threaded for symmetry).
  if (!opts.budget) {
    return { ...strongRecommend(merchant, diagnosis), mode: "FAILED_TO_FALLBACK", errorClass: "NO_BUDGET_LEDGER" };
  }

  const platformName = opts.platformName ?? REFERENCE_PLATFORM_NAME;
  const modelId = resolvedGroqModel();
  const prompt = buildStrategistPrompt(merchant, diagnosis, platformName);

  try {
    const { object } = await liveGroqGenerateObject({
      model: modelId,
      schema: StrategistOutputSchema,
      prompt,
      budget: opts.budget,
      generate: opts.generate,
    });
    const parsed = StrategistOutputSchema.parse(object);
    // NEVER trust the LLM route — clamp to the deterministically-allowed envelope (R-A3-3).
    const route = clampRouteToEnvelope(parsed.route, merchant);
    return { route, strategy: parsed.strategy, tone: parsed.tone, rationale: parsed.rationale, caution: parsed.caution, mode: "LIVE_AI" };
  } catch (err) {
    // Any live failure (incl. BudgetExceededError, a Groq error, or a schema-parse throw) falls back to
    // the strong baseline, labeled honestly with the underlying message.
    const errorClass = err instanceof Error ? err.message : "STRATEGIST_CALL_THREW";
    return { ...strongRecommend(merchant, diagnosis), mode: "FAILED_TO_FALLBACK", errorClass };
  }
}
