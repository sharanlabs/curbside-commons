/**
 * Blocker-diagnosis & reactivation-routing layer — the domain depth that sits ON TOP of
 * the pinned 6-step core (lib/core is NOT touched; the differential oracle stays green).
 *
 * WHY this earns its keep (the discrimination test, from the 2026-06-19 research digest):
 * the core already maps steps_completed -> current_blocker_code 1:1, so a layer that just
 * re-derives "step N => blocker X" adds nothing. This layer adds what the core can't say:
 *   (1) ENGAGEMENT STATE — actively-stuck vs ghosted vs new vs progressing, computed from
 *       last_login_days_ago × steps_completed × days_since_signup (the one discriminator
 *       available with NO new fields; maps to the existing risk_reason_codes primitives).
 *   (2) A ROUTED REACTIVATION PLAY that VARIES by engagement, not just by step — the core's
 *       next_best_action is fixed per step; here the SAME blocker routes differently when a
 *       merchant is ghosted (re-engage first) vs actively-stuck (send the step nudge). The
 *       research's #1 reactivation-failure cause is generic outreach not matched to the
 *       actual disengagement reason — this is the fix.
 *   (3) BLOCKER SOURCE — merchant-side (nudge) vs platform-side (ops-escalation, never a
 *       "finish your setup" nudge). The synthetic 6-step model is all merchant-side; the
 *       platform-side category is modeled + labeled as needs-instrumentation, not faked.
 *
 * HONESTY: engagement state is a SNAPSHOT INFERENCE, not a measured event. Deeper root cause
 * (why verification failed, menu blank vs QA-blocked, a fraud hold) needs instrumentation —
 * each is named as the upgrade signal, never invented. Sources: DoorDash SSIO/Help docs +
 * CS-onboarding + SaaS-activation literature + the FTC/Moffatt failure frontier (digest
 * 2026-06-19); see docs for citations.
 */
import type { Merchant } from "@/lib/core/types";

export type EngagementState = "new" | "actively_stuck" | "ghosted" | "progressing";
export type Touch = "self_serve_nudge" | "re_engagement" | "ops_escalation" | "high_touch" | "wait";
export type BlockerSource = "merchant_side" | "platform_side";
export type BlockerGroup = "A_step_aligned" | "B_cross_cutting";

export interface ReactivationPlay {
  touch: Touch;
  action: string;
  rationale: string;
}

export interface Diagnosis {
  blocker_code: string;
  blocker_label: string;
  blocker_group: BlockerGroup;
  blocker_source: BlockerSource;
  engagement_state: EngagementState;
  root_cause_hypothesis: string;
  play: ReactivationPlay;
  /** True = derived from existing fields today; false = the precise root cause needs a new signal. */
  detectable_now: boolean;
  /** Honest boundary: what is inferred vs what needs instrumentation. */
  caveat: string;
}

interface BlockerMeta {
  label: string;
  group: BlockerGroup;
  source: BlockerSource;
  /** The step-specific self-serve nudge (used when the merchant is engaged). */
  nudge: string;
  /** The signal that would pin the precise root cause (honesty: not in the current model). */
  upgradeSignal: string;
}

/**
 * The 6 onboarding blockers are all Group-A (step-aligned), merchant-side. The taxonomy is
 * intentionally broader than the data: platform-side (B6) blockers exist in reality
 * (duplicate location, virtual-brand/self-delivery detected, already-live, fraud hold) but
 * are NOT in the synthetic self-serve model — they are an instrumentation target, labeled
 * as such in classifyPlatformSide(), never fabricated into a merchant's record.
 */
const BLOCKER_META: Record<string, BlockerMeta> = {
  business_verification_needed: {
    label: "Business / identity verification",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "Send the 'match your business name + tax ID to your IRS records' fix with the exact field to correct.",
    upgradeSignal: "verification_status / business_info_match_flag (IRS/Stripe mismatch vs not-yet-submitted)",
  },
  menu_upload_needed: {
    label: "Menu setup",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "Link the menu tool and offer auto-populate from their existing web presence.",
    upgradeSignal: "menu_status (blank / import-failed / QA-blocked / qualified) + menu_item_count",
  },
  photos_needed: {
    label: "Menu photos",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "Send the photo spec + the in-app photo tool, and the specific rejection reason when known.",
    upgradeSignal: "photo_rejection_reason (1 of the 11 documented reasons) + photos_pending_count",
  },
  business_hours_needed: {
    label: "Hours & availability",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "One-click 'set your store hours to go live' checklist nudge.",
    upgradeSignal: "hours_populated_flag",
  },
  bank_verification_needed: {
    label: "Banking / payout",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "Send 'add or verify your bank to get paid'; escalate to ops if it's a Stripe fraud hold.",
    upgradeSignal: "bank_verification_status / fraud_hold_flag",
  },
  final_verification_needed: {
    label: "Final verification",
    group: "A_step_aligned",
    source: "merchant_side",
    nudge: "Nudge the final review step that flips the store live.",
    upgradeSignal: "final_review_status",
  },
};

const FALLBACK_META: BlockerMeta = {
  label: "Unknown blocker",
  group: "B_cross_cutting",
  source: "merchant_side",
  nudge: "Confirm the current onboarding step before sending anything.",
  upgradeSignal: "current_onboarding_step",
};

/**
 * Engagement state — the one discriminator computable with NO new fields. Order matters:
 * brand-new merchants are not "stalled" yet; early-inactive = ghosted (abandonment); recently
 * active but not done = actively stuck; everything else = progressing.
 */
export function engagementState(m: Merchant): EngagementState {
  if (m.days_since_signup < 7) return "new";
  if (m.last_login_days_ago >= 7 && m.steps_completed <= 1) return "ghosted";
  if (m.last_login_days_ago <= 3 && m.steps_completed < 5) return "actively_stuck";
  return "progressing";
}

function play(meta: BlockerMeta, state: EngagementState): ReactivationPlay {
  if (meta.source === "platform_side") {
    return {
      touch: "ops_escalation",
      action: "Route to an ops/BD queue — do NOT send a 'finish your setup' nudge.",
      rationale: "A platform-side block isn't the merchant's unfinished work; nudging them is wrong and erodes trust.",
    };
  }
  switch (state) {
    case "new":
      return {
        touch: "wait",
        action: "Light welcome nudge only; give them a few days before reactivation pressure.",
        rationale: "Signed up <7 days ago — too early to treat as stalled.",
      };
    case "ghosted":
      return {
        touch: "re_engagement",
        action: `Re-engage first (value-prove + a time-limited reason to return), THEN: ${meta.nudge}`,
        rationale: "Inactive + barely started = a motivation/value gap; a step-only nudge to a disengaged merchant fails (research: generic-vs-matched outreach).",
      };
    case "actively_stuck":
      return {
        touch: "self_serve_nudge",
        action: meta.nudge,
        rationale: "Recently active but blocked at this step — a precise, step-matched self-serve nudge is the highest-yield, lowest-cost play.",
      };
    default:
      return {
        touch: "self_serve_nudge",
        action: meta.nudge,
        rationale: "Engaged and progressing — a step-matched self-serve nudge keeps momentum.",
      };
  }
}

function rootCause(meta: BlockerMeta, state: EngagementState): string {
  if (state === "ghosted") {
    return `Stalled early and disengaged — likely a motivation/value gap, not a ${meta.label.toLowerCase()} problem per se.`;
  }
  if (state === "new") {
    return `Recently signed up; sitting at ${meta.label.toLowerCase()} is expected this early, not yet a stall.`;
  }
  return `Engaged but blocked at ${meta.label.toLowerCase()}; the precise cause needs the ${meta.upgradeSignal} signal.`;
}

/** Diagnose one merchant: engagement + root-cause hypothesis + a routed reactivation play. */
export function diagnose(m: Merchant): Diagnosis {
  const meta = BLOCKER_META[m.current_blocker_code] ?? FALLBACK_META;
  const state = engagementState(m);
  return {
    blocker_code: m.current_blocker_code,
    blocker_label: meta.label,
    blocker_group: meta.group,
    blocker_source: meta.source,
    engagement_state: state,
    root_cause_hypothesis: rootCause(meta, state),
    play: play(meta, state),
    detectable_now: true, // engagement + step are computed from existing fields
    caveat: `Engagement state is a snapshot inference (last_login × steps × tenure), not a measured event. Pinning the exact root cause needs instrumentation: ${meta.upgradeSignal}.`,
  };
}
