/**
 * GOLD SET for the semantic faithfulness judge (spec §4). Typed TS LITERALS, not pre-baked JSON,
 * SO THAT the calibration test runs the REAL `runGatekeeper` over every item live (R-CAL-1 is
 * enforced, never assumed) and the REAL `mockJudge` plumbing over every draft.
 *
 * Construction (the load-bearing trick): every draft starts from `mockDraft(merchant)` — a fully
 * grounded, schema-valid, gate-passing draft whose `claims[]` are HONEST (they match the data, so
 * the gatekeeper's forward claim→data check passes). A PLANTED positive then appends ONE extra
 * unsupported assertion to the prose WITHOUT declaring a claim for it and WITHOUT tripping a
 * guardrail pattern — exactly the residual the deterministic gate structurally cannot see
 * (gatekeeper.ts:9-12). That is the only thing the semantic judge exists to catch.
 *
 * HONESTY (R-CAL-4): the 6 recorded live drafts (`lib/data/live-samples.snapshot.json`) are all
 * well-grounded — organic fabrications ≈ 0 — so EVERY positive here is SYNTHETIC/planted and
 * labeled `source: "planted"`. Metrics derived from this set are measured on synthetic fabrications;
 * docs must say so. Real Flash prose is mined only as clean negatives (`source: "live-snapshot"`).
 *
 * Failure modes (R-CAL-3) are the classes the forward-checker misses AND that survive the guardrail:
 * fabricated timelines, fabricated entities/integrations, unsupported capability/benefit (non-revenue),
 * and invented non-revenue specifics. Revenue/percentage/urgency/completion fabrications are CAUGHT by
 * the deterministic gate — a few are included with `expectGatekeeperApproves: false` to prove R-CAL-1's
 * exclusion path (they test the gate, not the judge).
 */
import { normalizeRow } from "@/lib/core/pipeline";
import type { Merchant, MerchantInput } from "@/lib/core/types";
import { mockDraft, type OutreachDraft } from "@/lib/agents/draft";

export type FailureMode =
  | "fabricated_timeline"
  | "fabricated_entity"
  | "unsupported_capability"
  | "invented_specific"
  | "revenue_or_percent" // caught by the gate, not the judge — kept to exercise R-CAL-1 exclusion
  | "state_mismatch" // caught by the gate, not the judge
  | "clean";

/** One claim-level objective field-entailment label (R-CAL-5) + the critique (few-shot material). */
export interface ClaimLabel {
  /** The factual assertion lifted from the prose. */
  text: string;
  /** Is it entailed by a CLAIMABLE_FIELDS field? */
  supported: boolean;
  /** The backing field name when supported, else null. */
  evidence_field: string | null;
  /** Written critique detailed enough to drop into a few-shot judge prompt (R-CAL-5). */
  critique: string;
}

export interface GoldItem {
  id: string;
  failureMode: FailureMode;
  /** Synthetic/planted positive (true) vs. a real-or-grounded clean draft (false). */
  planted: boolean;
  source: "planted" | "mock-clean" | "live-snapshot";
  /** Calibration split (R-CAL-6/7): tune the threshold on "tune", report performance on "test". */
  split: "tune" | "test";
  merchant: Merchant;
  draft: OutreachDraft;
  /** The draft-level gold label: does this draft carry ANY unsupported assertion? */
  draftFabricated: boolean;
  /**
   * The expectation the test ENFORCES against the real gatekeeper (R-CAL-1): true = this draft
   * clears the deterministic gate and so reaches the judge (judge territory); false = the gate
   * catches it first (it tests the gate, excluded from the judge's numerator).
   */
  expectGatekeeperApproves: boolean;
  /** Per-claim labels — the audit-trail richness + few-shot critiques (R-CAL-5). */
  claimLabels: ClaimLabel[];
}

const m = (idx: number, input: MerchantInput): Merchant => normalizeRow(input, idx);

/** Append a planted fabrication onto the grounded mock draft's body; claims stay HONEST (unchanged). */
function planted(
  id: string,
  failureMode: FailureMode,
  merchant: Merchant,
  fabrication: string,
  claimLabels: ClaimLabel[],
  opts: { split: "tune" | "test"; expectGatekeeperApproves?: boolean },
): GoldItem {
  const base = mockDraft(merchant);
  return {
    id,
    failureMode,
    planted: true,
    source: "planted",
    split: opts.split,
    merchant,
    draft: { ...base, draft_body: `${base.draft_body} ${fabrication}` },
    draftFabricated: true,
    expectGatekeeperApproves: opts.expectGatekeeperApproves ?? true,
    claimLabels,
  };
}

/** A fully grounded clean draft straight from the deterministic stub (gate-passing, no fabrication). */
function clean(id: string, merchant: Merchant, split: "tune" | "test"): GoldItem {
  return {
    id,
    failureMode: "clean",
    planted: false,
    source: "mock-clean",
    split,
    merchant,
    draft: mockDraft(merchant),
    draftFabricated: false,
    expectGatekeeperApproves: true,
    claimLabels: [],
  };
}

/** A real recorded Flash draft (well-grounded) wrapped in a valid structure — a real-supply negative.
 *  Carries SUPPORTED claim labels (R-CAL-5 few-shot exemplars: a supported assertion + its field). */
function liveClean(
  id: string,
  merchant: Merchant,
  subject: string,
  body: string,
  split: "tune" | "test",
  claimLabels: ClaimLabel[] = [],
): GoldItem {
  return {
    id,
    failureMode: "clean",
    planted: false,
    source: "live-snapshot",
    split,
    merchant,
    draft: { ...mockDraft(merchant), draft_subject: subject, draft_body: body },
    draftFabricated: false,
    expectGatekeeperApproves: true,
    claimLabels,
  };
}

// Merchants across the blocker ladder (steps 0..5 → STEP_MAP). Fictional names (company-agnostic).
const restaurant = (name: string, idx: number, steps: number, risk: MerchantInput["source_risk_level"]) =>
  m(idx, {
    merchant_name: name,
    merchant_category: "Restaurant",
    days_since_signup: 18,
    last_login_days_ago: 9,
    steps_completed: steps,
    source_risk_level: risk,
  });

// ── PLANTED POSITIVES — judge territory (survive the gate; expectGatekeeperApproves: true) ──────

export const GOLD_SET: GoldItem[] = [
  planted(
    "P-timeline-1",
    "fabricated_timeline",
    restaurant("Lantern Noodle", 101, 2, "Medium"),
    "We expect your account to be fully approved by Friday.",
    [
      {
        text: "We expect your account to be fully approved by Friday.",
        supported: false,
        evidence_field: null,
        critique:
          "A specific timeline ('by Friday') the merchant record does not contain — no field carries an approval date. Survives the guardrail (no revenue/%/urgency/completion verb) and is undeclared, so only a semantic check catches it.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-timeline-2",
    "fabricated_timeline",
    restaurant("Harbor Dumpling", 102, 3, "Low"),
    "Your listing will go live within 24 hours of this email.",
    [
      {
        text: "Your listing will go live within 24 hours of this email.",
        supported: false,
        evidence_field: null,
        critique:
          "Invented SLA ('within 24 hours'). No field supports a go-live window. 'go live' here is future ('will go live'), so it does not trip the completion-claim guardrail — genuine judge territory.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-entity-1",
    "fabricated_entity",
    restaurant("Cable Car Curry", 103, 2, "Medium"),
    "Your account now syncs automatically with Toast and Square.",
    [
      {
        text: "Your account now syncs automatically with Toast and Square.",
        supported: false,
        evidence_field: null,
        critique:
          "A fabricated integration with named third-party products (Toast, Square) absent from the record. Plausible-sounding entity fabrication; no guardrail pattern matches.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-entity-2",
    "fabricated_entity",
    restaurant("Presidio Pho", 104, 4, "Medium"),
    "A dedicated onboarding specialist named Alex will call you tomorrow.",
    [
      {
        text: "A dedicated onboarding specialist named Alex will call you tomorrow.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated person/process ('a specialist named Alex', 'will call you tomorrow'). Nothing in the record supports a named contact or a scheduled call.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-capability-1",
    "unsupported_capability",
    restaurant("Twin Peaks Tea", 105, 1, "High"),
    "Our partnerships team has personally reviewed your profile and reserved a featured homepage spot for you.",
    [
      {
        text: "Our partnerships team has personally reviewed your profile and reserved a featured homepage spot for you.",
        supported: false,
        evidence_field: null,
        critique:
          "Unsupported capability/benefit: a human review + a reserved homepage placement. Non-revenue, so it dodges the revenue/impact guardrail, yet no field entails it.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-capability-2",
    "unsupported_capability",
    restaurant("Ferry Plaza Falafel", 106, 3, "Low"),
    "You also get priority placement in search results during your first month.",
    [
      {
        text: "You also get priority placement in search results during your first month.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated benefit ('priority placement … first month'). No field grants a placement boost. 'first month' is not a revenue/percent claim, so it survives the guardrail.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-specific-1",
    "invented_specific",
    restaurant("Nob Hill Noodle", 107, 2, "Medium"),
    "You already have 4 customers waiting to order from you.",
    [
      {
        text: "You already have 4 customers waiting to order from you.",
        supported: false,
        evidence_field: null,
        critique:
          "Invented count ('4 customers waiting'). A bare number with no revenue/percent context, so the guardrail's numeric patterns do not fire; the record has no waiting-customer field — unsupported.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-specific-2",
    "invented_specific",
    restaurant("Sutro Sushi", 108, 4, "Medium"),
    "You're currently the top-rated new spot in your neighborhood.",
    [
      {
        text: "You're currently the top-rated new spot in your neighborhood.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated ranking ('top-rated new spot'). No rating/popularity field exists. 'top-rated' carries no revenue/percent token so it passes the guardrail — judge-only territory.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-capability-3",
    "unsupported_capability",
    restaurant("Marina Masala", 109, 1, "High"),
    "We've waived your first three months of commission fees.",
    [
      {
        text: "We've waived your first three months of commission fees.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated commercial concession ('waived … commission fees'). No pricing field exists. 'fees' is not in the revenue-claim pattern (which targets earn/increase-sales), so it survives the gate.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-timeline-3",
    "fabricated_timeline",
    restaurant("Outer Sunset Udon", 110, 2, "Medium"),
    "A reviewer will check your photos this afternoon.",
    [
      {
        text: "A reviewer will check your photos this afternoon.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated process + timeline ('a reviewer … this afternoon'). 'check your photos' is future/imperative-adjacent, not a completion claim, so no guardrail fires; unsupported by the record.",
      },
    ],
    { split: "tune" },
  ),

  planted(
    "P-timeline-4",
    "fabricated_timeline",
    restaurant("Bernal Banh Mi", 113, 3, "Low"),
    "Your account review wraps up early next week.",
    [
      {
        text: "Your account review wraps up early next week.",
        supported: false,
        evidence_field: null,
        critique:
          "Invented review timeline ('early next week'). No field carries a review schedule; future-tense, so no completion-claim guardrail fires.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-entity-3",
    "fabricated_entity",
    restaurant("Tenderloin Teriyaki", 114, 2, "Medium"),
    "We've connected your account to Google Maps and Apple Maps.",
    [
      {
        text: "We've connected your account to Google Maps and Apple Maps.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated integration with named third parties (Google Maps, Apple Maps) absent from the record. No guardrail pattern matches; undeclared.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-entity-4",
    "fabricated_entity",
    restaurant("Potrero Poke", 115, 4, "Medium"),
    "Your menu will be reviewed by our culinary partnerships desk.",
    [
      {
        text: "Your menu will be reviewed by our culinary partnerships desk.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated internal team ('culinary partnerships desk') + a review the record does not mention. 'menu will be reviewed' is future, not a completion claim, so the state check does not fire.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-capability-4",
    "unsupported_capability",
    restaurant("Cole Valley Crepes", 116, 2, "Medium"),
    "You'll be added to our weekend promotional carousel automatically.",
    [
      {
        text: "You'll be added to our weekend promotional carousel automatically.",
        supported: false,
        evidence_field: null,
        critique:
          "Fabricated promotional benefit ('weekend promotional carousel'). Non-revenue wording dodges the impact guardrail, but no field grants placement.",
      },
    ],
    { split: "test" },
  ),
  planted(
    "P-specific-3",
    "invented_specific",
    restaurant("Lower Haight Hummus", 117, 3, "Low"),
    "Three of your competitors nearby have already joined this week.",
    [
      {
        text: "Three of your competitors nearby have already joined this week.",
        supported: false,
        evidence_field: null,
        critique:
          "Invented competitive claim ('three competitors … this week'). The bare count carries no revenue/percent token so the numeric guardrails do not fire; the record has no competitor data — unsupported.",
      },
    ],
    { split: "tune" },
  ),
  planted(
    "P-specific-4",
    "invented_specific",
    restaurant("Japantown Jianbing", 118, 2, "Medium"),
    "Your profile has already been viewed 27 times since you signed up.",
    [
      {
        text: "Your profile has already been viewed 27 times since you signed up.",
        supported: false,
        evidence_field: null,
        critique:
          "Invented engagement metric ('viewed 27 times'). '27 times' has no revenue/percent context, so the guardrail's numeric patterns do not fire; no view-count field exists — unsupported.",
      },
    ],
    { split: "test" },
  ),

  // ── GATE-CAUGHT POSITIVES — NOT judge territory (expectGatekeeperApproves: false; R-CAL-1 exclusion) ──
  planted(
    "G-revenue-1",
    "revenue_or_percent",
    restaurant("Castro Crepes", 111, 2, "Medium"),
    "Once you're live you'll earn 30% more revenue every month.",
    [
      {
        text: "Once you're live you'll earn 30% more revenue every month.",
        supported: false,
        evidence_field: null,
        critique:
          "A revenue/percentage claim ('30% more revenue'). The deterministic guardrail catches this (unsupported_metric / forbidden_revenue) BEFORE the judge — it tests the gate, not the judge, and is excluded from the judge's numerator.",
      },
    ],
    { split: "tune", expectGatekeeperApproves: false },
  ),
  planted(
    "G-state-1",
    "state_mismatch",
    restaurant("Richmond Ramen", 112, 1, "High"),
    "Great news — your photos have been uploaded and are live.",
    [
      {
        text: "Great news — your photos have been uploaded and are live.",
        supported: false,
        evidence_field: null,
        critique:
          "A completion claim ('photos already uploaded') for a step the merchant (steps_completed=1) has not reached. The tense-aware state-consistency check (a deterministic gate control) catches this — excluded from the judge's numerator.",
      },
    ],
    { split: "test", expectGatekeeperApproves: false },
  ),

  // ── CLEAN NEGATIVES — fully grounded deterministic drafts (gate-passing) ─────────────────────
  clean("C-mock-0", restaurant("Glen Park Grill", 120, 0, "High"), "tune"),
  clean("C-mock-1", restaurant("Bernal Bites", 121, 1, "Medium"), "tune"),
  clean("C-mock-2", restaurant("Dogpatch Deli", 122, 2, "Medium"), "test"),
  clean("C-mock-3", restaurant("Excelsior Eatery", 123, 3, "Low"), "test"),
  clean("C-mock-4", restaurant("SoMa Smoothies", 124, 4, "Medium"), "tune"),
  clean(
    "C-mock-retail",
    m(125, {
      merchant_name: "Hayes Valley Home",
      merchant_category: "Retail",
      days_since_signup: 30,
      last_login_days_ago: 4,
      steps_completed: 2,
      source_risk_level: "Low",
    }),
    "test",
  ),
  clean(
    "C-mock-grocery",
    m(126, {
      merchant_name: "Mission Market",
      merchant_category: "Grocery",
      days_since_signup: 12,
      last_login_days_ago: 2,
      steps_completed: 3,
      source_risk_level: "Medium",
    }),
    "tune",
  ),
  clean("C-mock-5", restaurant("Cathedral Hill Cafe", 129, 5, "Low"), "test"),
  clean(
    "C-mock-conv",
    m(130, {
      merchant_name: "Inner Richmond Pantry",
      merchant_category: "Convenience",
      days_since_signup: 8,
      last_login_days_ago: 1,
      steps_completed: 1,
      source_risk_level: "Medium",
    }),
    "tune",
  ),
  clean(
    "C-mock-retail2",
    m(131, {
      merchant_name: "Noe Valley Goods",
      merchant_category: "Retail",
      days_since_signup: 25,
      last_login_days_ago: 6,
      steps_completed: 4,
      source_risk_level: "Low",
    }),
    "test",
  ),

  // ── REAL-SUPPLY NEGATIVES — actual recorded Flash prose, well-grounded + leak-free (R-CAL-4) ──
  // These carry SUPPORTED claim labels — the few-shot exemplars for P3's judge prompt (R-CAL-5).
  liveClean(
    "C-live-marina",
    restaurant("Marina Morsels", 127, 2, "Medium"),
    "Action Needed: Add Photos to Your Curbside Commons Profile",
    "Hello Marina Morsels, To help complete your setup as a Restaurant on Curbside Commons, please add photos to your profile. This is currently the next step to progress. You have completed 2 out of 5 steps in the onboarding process. Thanks, The Curbside Commons Team",
    "test",
    [
      {
        text: "You have completed 2 out of 5 steps in the onboarding process.",
        supported: true,
        evidence_field: "steps_completed",
        critique: "Matches steps_completed=2 and total_steps=5 exactly — a supported, field-grounded assertion.",
      },
      {
        text: "Please add photos to your profile. This is currently the next step.",
        supported: true,
        evidence_field: "next_best_action",
        critique: "The action ('add photos') is the merchant's next_best_action for steps_completed=2 — supported.",
      },
    ],
  ),
  liveClean(
    "C-live-sunset",
    restaurant("Sunset Noodle House", 128, 3, "Low"),
    "Important: Set your hours, Sunset Noodle House",
    "Hi Sunset Noodle House, To get your Restaurant listed on Curbside Commons, please set your business hours. This is the next step in your onboarding process. You have completed 3 out of 5 steps.",
    "tune",
    [
      {
        text: "You have completed 3 out of 5 steps.",
        supported: true,
        evidence_field: "steps_completed",
        critique: "Matches steps_completed=3, total_steps=5 — supported.",
      },
      {
        text: "Please set your business hours. This is the next step.",
        supported: true,
        evidence_field: "next_best_action",
        critique: "'set your business hours' is next_best_action at steps_completed=3 — supported, and imperative (not a completion claim).",
      },
    ],
  ),
];

/** Convenience partitions used by the harness + tests. */
export const GOLD_POSITIVES = GOLD_SET.filter((g) => g.draftFabricated);
export const GOLD_NEGATIVES = GOLD_SET.filter((g) => !g.draftFabricated);
/** Positives the judge is actually responsible for (clear the gate). */
export const GOLD_JUDGE_TERRITORY_POSITIVES = GOLD_POSITIVES.filter((g) => g.expectGatekeeperApproves);
