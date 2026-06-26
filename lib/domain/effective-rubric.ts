/**
 * The EFFECTIVE-axis domain rubric — the STANDARD the domain-quality judge applies (Track B1,
 * `docs/spec-domain-judge.md`). Where the faithfulness judge asks "is every claim true to the
 * data?", this rubric defines "is this draft GOOD merchant-activation practice?"
 *
 * HONESTY BANNER (R-DHON-2 / AM-7): this rubric is RESEARCHED + SOURCE-CITED domain knowledge
 * (every dimension cites `knowledge/domain/merchant-activation-kb.md`, Track B0) + owner judgment —
 * NOT a credentialed practitioner's or marketplace-insider's expertise. There is no real DoorDash /
 * Uber Eats / Grubhub internal access behind it.
 *
 * SITUATION-IN, NOT ANSWER-IN (R-DARCH-2, the make-or-break design choice): `domainSituation()`
 * surfaces ONLY the merchant's *situation* (engagement state, blocker, facts) for the judge — never
 * the pre-computed correct play (`diagnose().play` / `.root_cause_hypothesis`, which name the
 * recommended tactic). The live judge infers strategy-fit from the situation + the rubric standard
 * below; feeding it the answer would collapse calibration into a near-deterministic string-compare
 * (a wrapper, not a judge). The gold-set LABELS are objective by construction (R-DCAL-4) — that is
 * separate from, and must never leak into, the judge's runtime input.
 */
import type { Merchant } from "@/lib/core/types";
import { diagnose, type EngagementState } from "@/lib/domain/diagnosis";

/** The three dimensions UNDER calibration (B1) — calibration is owner-gated + not yet run. Platform-side
 *  escalation is documented + DEFERRED below. */
export type DomainDimension = "matched_to_blocker" | "engagement_appropriate" | "no_over_promise";

export const DOMAIN_DIMENSIONS: readonly DomainDimension[] = [
  "matched_to_blocker",
  "engagement_appropriate",
  "no_over_promise",
] as const;

/** One rubric dimension: the standard, stated GENERALLY (not a per-merchant answer) + its KB source. */
export interface DimensionSpec {
  dimension: DomainDimension;
  title: string;
  /** The cited source (R-DHON-2: every rule cites a KB section). */
  kbCitation: string;
  /** The standard the judge applies — a general principle, never the answer for a given merchant. */
  rule: string;
  goodExample: string;
  badExample: string;
}

export const DIMENSION_SPECS: Record<DomainDimension, DimensionSpec> = {
  matched_to_blocker: {
    dimension: "matched_to_blocker",
    title: "Matched to the merchant's actual blocker",
    kbCitation: "merchant-activation-kb.md §2 + §2.1",
    rule:
      "Good outreach is MATCHED to the merchant's specific stuck step: it names the concrete blocker " +
      "and the concrete fix. The #1 documented reactivation-failure mode is generic, untargeted outreach " +
      "('Complete your signup!', 'You're almost there!') that ignores the known blocker — it reads as spam, " +
      "whereas a message grounded in the actual blocker reads as helpful.",
    goodExample:
      "Menu blank → 'Add your menu with the builder — that's the step holding your store back right now.'",
    badExample: "Menu blank → 'Complete your setup to get started!' (generic; ignores the known blocker).",
  },
  engagement_appropriate: {
    dimension: "engagement_appropriate",
    title: "Right play for the engagement state",
    kbCitation: "merchant-activation-kb.md §3 + §2.3",
    rule:
      "The play must fit the engagement state, not just the step. ACTIVELY-STUCK (recently active, " +
      "blocked) → send the precise step nudge. GHOSTED / DORMANT (inactive) → re-prove value FIRST (a " +
      "reason to return), NOT a bare step-completion nudge — a step-only nudge to a disengaged merchant " +
      "fails. NEW (just signed up) → a light welcome, not reactivation pressure.",
    goodExample:
      "Ghosted merchant → 're-prove the value of going live (a time-limited reason to return), then the step.'",
    badExample: "Ghosted merchant → 'Just finish step 3!' (a bare step nudge to a disengaged merchant).",
  },
  no_over_promise: {
    dimension: "no_over_promise",
    title: "No over-promising (incl. implied / typicality claims)",
    kbCitation: "merchant-activation-kb.md §4.2",
    rule:
      "Outreach must avoid unsubstantiated outcome/earnings claims, performance guarantees, fabricated " +
      "urgency, and — critically — IMPLIED / TYPICALITY claims ('stores like yours grow…', 'restaurants " +
      "like you quickly become favorites') that imply a typical result without substantiation. Implied " +
      "claims count the same as explicit ones. Default to factual / process / conditional framing; soft, " +
      "non-guaranteed benefit language ('adding photos can help customers find you') is acceptable.",
    goodExample: "'Adding photos can help customers find your items.' (soft, non-guaranteed, conditional).",
    badExample:
      "'Stores like yours quickly become neighborhood favorites.' (implied typicality, no substantiation).",
  },
};

/**
 * DOCUMENTED-BUT-DEFERRED rule (R-DCAL-3, advisor #4): platform-side blocks (duplicate location,
 * fraud hold, ineligibility) require OPS ESCALATION, never a "finish your setup" nudge. NOT calibrated
 * in B1 — `lib/domain/diagnosis.ts` emits only `merchant_side`, so calibrating it would require
 * fabricating data the synthetic model does not carry (a KB-honesty / enterprise-claims violation).
 * Revisit at B2 once a real `blocker_source` signal exists.
 */
export const DEFERRED_PLATFORM_SIDE_RULE = {
  title: "Platform-side blocks → escalate, never nudge (DEFERRED from B1 calibration)",
  kbCitation: "merchant-activation-kb.md §1.3 (B6) + §2.1 (last row)",
  rule:
    "When the block is platform-side (the marketplace is blocking the merchant — duplicate location, " +
    "fraud hold, ineligibility), the correct play is ops escalation, never a 'finish your setup' nudge " +
    "(which is wrong and erodes trust).",
  deferredReason:
    "diagnosis.ts emits only merchant_side; no synthetic merchant is labeled platform_side. Calibrating " +
    "this needs a real blocker_source instrumentation signal — deferred to B2, documented not faked.",
} as const;

/**
 * The merchant SITUATION the judge sees (R-DARCH-2). Facts only — engagement state + the blocker +
 * the structured numbers. Deliberately OMITS `diagnose().play` and `.root_cause_hypothesis`, which
 * encode the recommended tactic (the answer). The judge must infer strategy-fit from these + the rubric.
 */
export interface DomainSituation {
  engagement_state: EngagementState;
  current_blocker_code: string;
  blocker_label: string;
  blocker_source: string;
  merchant_category: Merchant["merchant_category"];
  steps_completed: number;
  total_steps: number;
  risk_level: Merchant["risk_level"];
}

export function domainSituation(m: Merchant): DomainSituation {
  const d = diagnose(m);
  // NB (R-DARCH-2): we read `diagnose()` for the engagement state + blocker label, but we DO NOT
  // surface d.play / d.root_cause_hypothesis — those name the correct tactic and would leak the answer.
  return {
    engagement_state: d.engagement_state,
    current_blocker_code: d.blocker_code,
    blocker_label: d.blocker_label,
    blocker_source: d.blocker_source,
    merchant_category: m.merchant_category,
    steps_completed: m.steps_completed,
    total_steps: m.total_steps,
    risk_level: m.risk_level,
  };
}

/**
 * Render the rubric standard for the judge prompt — the general principles + KB citations, the SAME
 * for every merchant (it is the standard, not the answer). The judge applies these to the situation.
 */
export function renderRubricStandard(): string {
  const lines: string[] = [
    "DOMAIN-QUALITY RUBRIC (the standard for good merchant-activation outreach). Apply each dimension",
    "to the merchant's situation and the draft; a dimension FAILS if the draft violates its rule.",
    "",
  ];
  for (const dim of DOMAIN_DIMENSIONS) {
    const s = DIMENSION_SPECS[dim];
    lines.push(
      `• ${s.dimension} — ${s.title} [${s.kbCitation}]`,
      `    Rule: ${s.rule}`,
      `    Good: ${s.goodExample}`,
      `    Bad:  ${s.badExample}`,
      "",
    );
  }
  return lines.join("\n");
}
