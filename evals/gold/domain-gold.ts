/**
 * GOLD SET for the domain-quality ("Effective"-axis) judge (Track B1, `docs/spec-domain-judge.md`).
 * Typed TS LITERALS, SO THAT the calibration test runs the REAL `runGatekeeper` AND the faithfulness
 * `mockJudge` over every item LIVE (R-DCAL-1 enforced, never assumed).
 *
 * CONSTRUCTION (R-DCAL-4, objective-by-construction labels): every positive starts from
 * `mockDraft(merchant)` — a matched, gate-passing, FAITHFUL draft — and swaps ONLY its BODY for a
 * domain-DEFECTIVE variant (generic / wrong-play / implied-over-promise), KEEPING the valid claims so
 * the gatekeeper still passes. The label (`draftDefective` + the violated `dimension`) follows from the
 * construction, not subjective taste. Each positive is designed to fail EXACTLY ONE dimension so
 * per-dimension recall (R-DCAL-2) is attributable.
 *
 * MARGINAL VALUE (R-DCAL-1, advisor #2): every positive is built to PASS the deterministic gatekeeper
 * AND be FAITHFUL (the faithfulness mock finds no fabrication) — so the catch is a PURE domain residual,
 * not a re-catch of the gate or the faithfulness judge. The harness enforces both LIVE, per item.
 *
 * HONESTY (R-DCAL-4 / AM-7): all positives are SYNTHETIC / planted + labeled `source:"planted"` (the
 * recorded live drafts are matched + well-grounded → organic domain-defects ≈ 0; mined here only as
 * clean negatives). Metrics derived from this set are measured on SYNTHETIC domain-defects; docs say so.
 *
 * OVER-PROMISE residual (R-DCAL-3): the §4.2 positives use IMPLIED / typicality / hype phrasing that
 * DODGES the deterministic guardrail (verified against `lib/core/guardrail.ts`: revenue claims need a
 * verb {increase|boost|double|triple|grow} NEAR a money word {sales|revenue|orders|income}; these dodge
 * that, the %/Nx patterns, urgency, and the tense-aware completion check). Their genuine residual is
 * vs the LIVE faithfulness judge is partial (an implied benefit can be borderline-unsupported) — hence
 * §4.2 is isolated + reported per-dimension; dimensions 1 & 2 are the cleanly-marginal core.
 */
import { normalizeRow } from "@/lib/core/pipeline";
import type { Merchant, MerchantInput } from "@/lib/core/types";
import { mockDraft, type OutreachDraft } from "@/lib/agents/draft";
import type { DomainDimension } from "@/lib/domain/effective-rubric";

export type DomainFailureMode =
  | "generic_not_matched" // dim 1
  | "wrong_play_for_state" // dim 2
  | "implied_over_promise" // dim 3
  | "clean";

export interface DomainGoldItem {
  id: string;
  failureMode: DomainFailureMode;
  /** The single dimension this item violates (null for clean negatives). */
  dimension: DomainDimension | null;
  planted: boolean;
  source: "planted" | "mock-clean" | "live-snapshot";
  /** Calibration split (R-DCAL-5/7): tune the threshold on "tune", report performance on "test". */
  split: "tune" | "test";
  merchant: Merchant;
  draft: OutreachDraft;
  /** Draft-level gold label: is this draft domain-defective (bad practice)? */
  draftDefective: boolean;
  /** R-DCAL-1: this item must CLEAR the real gatekeeper to be domain-judge territory (enforced live). */
  expectGatekeeperApproves: boolean;
  /** R-DCAL-1: this item must be FAITHFUL (faithfulness mock finds no fabrication) to be judge territory. */
  expectFaithful: boolean;
  /** Written critique (few-shot material + audit trail). */
  critique: string;
}

const m = (idx: number, input: MerchantInput): Merchant => normalizeRow(input, idx);

/** Actively-stuck (recently active, blocked) — a precise step nudge is the appropriate play. */
const at = (name: string, idx: number, steps: number, risk: MerchantInput["source_risk_level"] = "Medium"): Merchant =>
  m(idx, {
    merchant_name: name,
    merchant_category: "Restaurant",
    days_since_signup: 16,
    last_login_days_ago: 2,
    steps_completed: steps,
    source_risk_level: risk,
  });

/** Inactive (≥7 days): ghosted if steps ≤ 1, dormant if steps > 1 — both need re-engagement FIRST. */
const gh = (name: string, idx: number, steps: number, risk: MerchantInput["source_risk_level"] = "Medium"): Merchant =>
  m(idx, {
    merchant_name: name,
    merchant_category: "Restaurant",
    days_since_signup: 24,
    last_login_days_ago: 11,
    steps_completed: steps,
    source_risk_level: risk,
  });

/** Swap a grounded matched draft's BODY (keep its valid claims, so the gatekeeper still passes). */
const swap = (merchant: Merchant, body: string): OutreachDraft => ({ ...mockDraft(merchant), draft_body: body });

interface PositiveArgs {
  id: string;
  failureMode: Exclude<DomainFailureMode, "clean">;
  dimension: DomainDimension;
  merchant: Merchant;
  body: string;
  critique: string;
  split: "tune" | "test";
}
function positive(a: PositiveArgs): DomainGoldItem {
  return {
    id: a.id,
    failureMode: a.failureMode,
    dimension: a.dimension,
    planted: true,
    source: "planted",
    split: a.split,
    merchant: a.merchant,
    draft: swap(a.merchant, a.body),
    draftDefective: true,
    expectGatekeeperApproves: true, // gate-passing by construction (enforced live, R-DCAL-1)
    expectFaithful: true, // faithful by construction (enforced live, R-DCAL-1)
    critique: a.critique,
  };
}

/** Clean negative — fully matched + engagement-appropriate + non-over-promising. */
function cleanItem(
  id: string,
  merchant: Merchant,
  draft: OutreachDraft,
  split: "tune" | "test",
  source: "mock-clean" | "live-snapshot",
  critique: string,
): DomainGoldItem {
  return {
    id,
    failureMode: "clean",
    dimension: null,
    planted: false,
    source,
    split,
    merchant,
    draft,
    draftDefective: false,
    expectGatekeeperApproves: true,
    expectFaithful: true,
    critique,
  };
}

// ── DIMENSION 1 — generic_not_matched (matched_to_blocker fails; engagement + over-promise PASS) ──
// Actively-stuck merchants (a nudge is the right play) given a GENERIC body that ignores the blocker.
const D1: DomainGoldItem[] = [
  positive({ id: "D1-verif-1", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Lantern Noodle", 301, 0), split: "tune",
    body: "Welcome! Complete your setup to start receiving orders on our marketplace.",
    critique: "Business-verification blocker, but the body is a generic 'complete your setup' nudge that names no specific step — the #1 reactivation-failure mode (KB §2.1). Truthful + gate-passing, so only the domain judge catches it." }),
  positive({ id: "D1-menu-1", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Harbor Dumpling", 302, 1), split: "tune",
    body: "You're almost there — just finish your onboarding to go live!",
    critique: "Menu blocker, but a generic 'almost there / finish onboarding' nudge with no mention of the menu. Generic, not matched." }),
  positive({ id: "D1-photos-1", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Cable Car Curry", 303, 2), split: "tune",
    body: "Hi there, your account setup is incomplete. Please finish the remaining steps so customers can find you.",
    critique: "Photos blocker, but the body never says photos — a generic 'finish the remaining steps' message." }),
  positive({ id: "D1-hours-1", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Presidio Pho", 304, 3), split: "tune",
    body: "Just a reminder to wrap up your account so your store can launch.",
    critique: "Hours blocker, but a generic 'wrap up your account' nudge — no mention of setting hours." }),
  positive({ id: "D1-bank-1", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Twin Peaks Tea", 305, 4), split: "test",
    body: "Your store isn't live yet. Complete your profile to get started.",
    critique: "Banking blocker, but a generic 'complete your profile' message that never mentions verifying a bank/payout." }),
  positive({ id: "D1-verif-2", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Ferry Plaza Falafel", 306, 0), split: "test",
    body: "Thanks for signing up! There are a few steps left before you can go live.",
    critique: "Verification blocker, but a generic 'a few steps left' nudge with no specific action named." }),
  positive({ id: "D1-photos-2", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Nob Hill Noodle", 307, 2), split: "test",
    body: "Don't forget to finish setting up your account on our platform.",
    critique: "Photos blocker, but a generic 'finish setting up' reminder — not matched to the photos step." }),
  positive({ id: "D1-hours-2", failureMode: "generic_not_matched", dimension: "matched_to_blocker",
    merchant: at("Sutro Sushi", 308, 3), split: "test",
    body: "You have a few items left to complete before your store goes live.",
    critique: "Hours blocker, but a generic 'a few items left' message — no mention of business hours." }),
];

// ── DIMENSION 2 — wrong_play_for_state (engagement_appropriate fails; matched + over-promise PASS) ──
// Ghosted/dormant merchants (need re-engagement FIRST) given a MATCHED but BARE step nudge.
const D2: DomainGoldItem[] = [
  positive({ id: "D2-ghost-menu-1", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Glen Park Grill", 311, 1), split: "tune",
    body: "Please upload your menu — that's the next step in your onboarding.",
    critique: "Ghosted merchant (inactive, barely started): a bare step nudge to upload the menu. Matched to the blocker, but the engagement state needs re-proving value FIRST (KB §3), not a step-completion poke." }),
  positive({ id: "D2-ghost-verif-1", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Bernal Bites", 312, 0), split: "tune",
    body: "Please verify your business details to continue your onboarding.",
    critique: "Ghosted merchant given a bare verification nudge. Matched, but no re-engagement for a disengaged merchant — wrong play for the state." }),
  positive({ id: "D2-dorm-photos-1", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Dogpatch Deli", 313, 2), split: "tune",
    body: "Add your photos to keep moving through onboarding.",
    critique: "Dormant merchant (made progress, then went quiet): a bare 'add your photos' nudge. Matched, but momentum is lost — re-engage before the step nudge (KB §3)." }),
  positive({ id: "D2-dorm-hours-1", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Excelsior Eatery", 314, 3), split: "tune",
    body: "Set your business hours — it's the next step to finish.",
    critique: "Dormant merchant given a bare 'set your hours' nudge. Matched, but a step-only poke to a quiet merchant under-performs." }),
  positive({ id: "D2-dorm-bank-1", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("SoMa Smoothies", 315, 4), split: "test",
    body: "Verify your bank to finish your onboarding.",
    critique: "Dormant merchant given a bare bank-verification nudge. Matched, but no re-engagement for a lapsed merchant — wrong play for the state." }),
  positive({ id: "D2-ghost-menu-2", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Mission Market", 316, 1), split: "test",
    body: "Your menu still needs to be uploaded. Please add it to proceed.",
    critique: "Ghosted merchant given a bare menu nudge. Matched, but a disengaged merchant needs value re-proven first." }),
  positive({ id: "D2-ghost-verif-2", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Cathedral Cafe", 317, 0), split: "test",
    body: "Please confirm your business information to keep setting up.",
    critique: "Ghosted merchant given a bare verification nudge. Matched, but wrong play for a disengaged state." }),
  positive({ id: "D2-dorm-photos-2", failureMode: "wrong_play_for_state", dimension: "engagement_appropriate",
    merchant: gh("Inner Sunset Udon", 318, 2), split: "test",
    body: "Add your menu photos to continue your onboarding.",
    critique: "Dormant merchant given a bare photos nudge. Matched, but the engagement state calls for re-engagement first." }),
];

// ── DIMENSION 3 — implied_over_promise (no_over_promise fails; matched + engagement PASS) ──
// Actively-stuck merchants given a MATCHED body PLUS implied/typicality phrasing that dodges the regex.
const D3: DomainGoldItem[] = [
  positive({ id: "D3-photos-1", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Lower Haight Hummus", 321, 2), split: "tune",
    body: "Add your photos to your profile. Stores like yours quickly become neighborhood favorites.",
    critique: "Matched + engagement-appropriate, but appends an IMPLIED-typicality claim ('stores like yours become favorites') — an unsubstantiated outcome (KB §4.2 rule 1). Dodges the revenue/%/urgency guardrail (no money word, no number)." }),
  positive({ id: "D3-menu-1", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Japantown Jianbing", 322, 1), split: "tune",
    body: "Upload your menu when you can. Restaurants like you really thrive once they're listed.",
    critique: "Matched, but 'restaurants like you thrive' implies a typical result without substantiation. No revenue word near a verb, so it dodges the guardrail." }),
  positive({ id: "D3-bank-1", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Tenderloin Teriyaki", 323, 4), split: "tune",
    body: "Verify your bank to get set up, and watch your orders roll in.",
    critique: "Matched, but 'watch your orders roll in' implies guaranteed demand. 'roll in' is not in the revenue verb list {increase|boost|double|triple|grow}, so it dodges the guardrail." }),
  positive({ id: "D3-hours-1", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Potrero Poke", 324, 3), split: "tune",
    body: "Set your business hours — places like yours take off fast on our platform.",
    critique: "Matched, but 'places like yours take off fast' is an implied performance claim. No guarded token, so it survives the guardrail." }),
  positive({ id: "D3-verif-1", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Cole Valley Crepes", 325, 0), split: "test",
    body: "Verify your business details. Businesses like yours become local favorites here.",
    critique: "Matched, but 'businesses like yours become local favorites' implies typicality without substantiation (KB §4.2)." }),
  positive({ id: "D3-photos-2", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Outer Sunset Donuts", 326, 2), split: "test",
    body: "Add photos to your listing; you'll become a neighborhood favorite in no time.",
    critique: "Matched, but 'you'll become a neighborhood favorite in no time' is an unsubstantiated outcome promise. Dodges the guardrail (no money/number/urgency token)." }),
  positive({ id: "D3-menu-2", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Marina Masala", 327, 1), split: "test",
    body: "Upload your menu — stores like yours double their visibility once they're live.",
    critique: "Matched, but 'double their visibility' is an implied claim; 'visibility' is not a money word so the revenue regex (needs a sales/revenue/orders word) does not fire, and 'they're live' is not the 'you're now live' completion claim." }),
  positive({ id: "D3-hours-2", failureMode: "implied_over_promise", dimension: "no_over_promise",
    merchant: at("Bernal Banh Mi", 328, 3), split: "test",
    body: "Set your hours and thrive in your neighborhood from day one.",
    critique: "Matched, but 'thrive in your neighborhood from day one' is an unsubstantiated outcome promise that dodges the guardrail." }),
];

// ── CLEAN NEGATIVES — matched + engagement-appropriate + non-over-promising ──
const CLEAN: DomainGoldItem[] = [
  cleanItem("C-at-photos", at("SoMa Sushi", 331, 2), mockDraft(at("SoMa Sushi", 331, 2)), "tune", "mock-clean",
    "Actively-stuck merchant + the matched deterministic draft (addresses the photos step, no over-promise). Domain-good."),
  cleanItem("C-at-menu", at("Hayes Hummus", 332, 1), mockDraft(at("Hayes Hummus", 332, 1)), "tune", "mock-clean",
    "Actively-stuck + matched menu draft. Domain-good."),
  cleanItem("C-at-verif", at("Castro Crepes", 333, 0), mockDraft(at("Castro Crepes", 333, 0)), "test", "mock-clean",
    "Actively-stuck + matched verification draft. Domain-good."),
  cleanItem("C-at-bank", at("Richmond Ramen", 334, 4), mockDraft(at("Richmond Ramen", 334, 4)), "test", "mock-clean",
    "Actively-stuck + matched bank draft. Domain-good."),
  // Re-engagement negatives: ghosted/dormant merchants whose draft LEADS with re-engagement, then the step.
  cleanItem("C-reengage-ghost-menu", gh("Noe Valley Noodle", 335, 1),
    swap(gh("Noe Valley Noodle", 335, 1),
      "It's been a while — here's why getting listed is worth it, and when you're ready, uploading your menu is the quick next step."),
    "tune", "mock-clean",
    "Ghosted merchant whose draft re-proves value FIRST ('been a while', 'why it's worth it'), THEN names the menu step. Matched + engagement-appropriate + no over-promise."),
  cleanItem("C-reengage-dorm-hours", gh("Sunset Udon", 336, 3),
    swap(gh("Sunset Udon", 336, 3),
      "We noticed you stepped away — here's why going live is worth it, and the last step is setting your business hours."),
    "test", "mock-clean",
    "Dormant merchant whose draft re-engages on lost momentum ('why … is worth it'), then names the hours step. Engagement-appropriate, no completion claim ('going live', not 'you're live')."),
  cleanItem("C-reengage-ghost-verif", gh("Pacific Pierogi", 339, 0),
    swap(gh("Pacific Pierogi", 339, 0),
      "It's been a while since we've seen you — here's why finishing setup is worth it, and verifying your business details is the quick next step."),
    "tune", "mock-clean",
    "Ghosted merchant whose draft re-proves value first ('been a while', 'why … worth it'), then the verification step. Engagement-appropriate, imperative ('verifying', not a completion claim)."),
  cleanItem("C-reengage-dorm-photos", gh("Ocean Beach Bowls", 340, 2),
    swap(gh("Ocean Beach Bowls", 340, 2),
      "We noticed you've been away — a reminder of why going live is worth it, and adding your photos is the next step."),
    "test", "mock-clean",
    "Dormant merchant whose draft re-engages, then names the photos step. Engagement-appropriate, no over-promise."),
  // Category-varied matched negatives (the use case is company-agnostic across Restaurant/Retail/Grocery).
  cleanItem(
    "C-at-retail",
    m(341, { merchant_name: "Hayes Valley Home", merchant_category: "Retail", days_since_signup: 14, last_login_days_ago: 2, steps_completed: 2, source_risk_level: "Low" }),
    mockDraft(m(341, { merchant_name: "Hayes Valley Home", merchant_category: "Retail", days_since_signup: 14, last_login_days_ago: 2, steps_completed: 2, source_risk_level: "Low" })),
    "tune", "mock-clean",
    "Actively-stuck Retail merchant + the matched deterministic draft (photos step). Domain-good across categories."),
  cleanItem(
    "C-at-grocery",
    m(342, { merchant_name: "Mission Market", merchant_category: "Grocery", days_since_signup: 20, last_login_days_ago: 1, steps_completed: 3, source_risk_level: "Medium" }),
    mockDraft(m(342, { merchant_name: "Mission Market", merchant_category: "Grocery", days_since_signup: 20, last_login_days_ago: 1, steps_completed: 3, source_risk_level: "Medium" })),
    "test", "mock-clean",
    "Actively-stuck Grocery merchant + the matched deterministic draft (hours step). Domain-good across categories."),
  // Real-supply negatives: actual recorded Flash prose (matched, well-grounded, leak-free).
  cleanItem("C-live-marina", at("Marina Morsels", 337, 2),
    {
      ...mockDraft(at("Marina Morsels", 337, 2)),
      draft_subject: "Action Needed: Add Photos to Your Curbside Commons Profile",
      draft_body:
        "Hello Marina Morsels, To help complete your setup as a Restaurant on Curbside Commons, please add photos to your profile. This is currently the next step to progress. You have completed 2 out of 5 steps in the onboarding process. Thanks, The Curbside Commons Team",
    },
    "tune", "live-snapshot",
    "Recorded live Flash draft: matched to the photos step, no over-promise, appropriate for an active merchant. A real-supply clean negative (R-DCAL-4)."),
  cleanItem("C-live-sunset", at("Sunset Noodle House", 338, 3),
    {
      ...mockDraft(at("Sunset Noodle House", 338, 3)),
      draft_subject: "Important: Set your hours, Sunset Noodle House",
      draft_body:
        "Hi Sunset Noodle House, To get your Restaurant listed on Curbside Commons, please set your business hours. This is the next step in your onboarding process. You have completed 3 out of 5 steps.",
    },
    "test", "live-snapshot",
    "Recorded live Flash draft: matched to the hours step, no over-promise. A real-supply clean negative."),
];

export const DOMAIN_GOLD_SET: DomainGoldItem[] = [...D1, ...D2, ...D3, ...CLEAN];

/** Convenience partitions used by the harness + tests. */
export const DOMAIN_GOLD_POSITIVES = DOMAIN_GOLD_SET.filter((g) => g.draftDefective);
export const DOMAIN_GOLD_NEGATIVES = DOMAIN_GOLD_SET.filter((g) => !g.draftDefective);
/** Positives the domain judge is actually responsible for (clear the gate AND are faithful). */
export const DOMAIN_JUDGE_TERRITORY_POSITIVES = DOMAIN_GOLD_POSITIVES.filter(
  (g) => g.expectGatekeeperApproves && g.expectFaithful,
);
