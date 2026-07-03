/**
 * Deterministic core constants — a faithful TypeScript port of scripts/config.py
 * (the Python v1 prototype, kept as the differential-test oracle).
 *
 * Reproducible, as-of-based timestamps (no wall-clock) so runs are deterministic.
 * No secrets, no network, no AI. See docs/v1-data-dictionary.md.
 */

// Fixed reference points (no wall-clock; owner may change the as-of date).
export const AS_OF_DATE = "2026-06-01";
export const RUN_TIMESTAMP = "2026-06-01T00:00:00Z";
export const TASK_ID = "T-001"; // lineage tag carried from the Python prototype

// Versions recorded on every generation / score.
export const RISK_FORMULA_VERSION = "risk.v1";
export const THRESHOLDS_VERSION = "thresholds.v1";
export const PROMPT_VERSION = "prompt.v1";
export const MODEL_VERSION = "stub-deterministic.v1";
export const SCHEMA_VERSION = "draft.v1";
export const TEMPLATE_ID = "blocker_nudge.v1";

/**
 * The platform name used by the deterministic stub draft + the guardrail's
 * impact-claim check. Defaults to "DoorDash" so the differential test matches
 * the frozen Python oracle exactly. The PRODUCT passes a company-agnostic name
 * (Phase A de-brand / owner platform-name gate) — the logic is identical, only
 * the token differs (proven by the differential staying green with this default).
 */
export const REFERENCE_PLATFORM_NAME = "DoorDash";

export const TOTAL_STEPS = 5;
export const CATEGORIES = ["Restaurant", "Retail", "Grocery", "Convenience"] as const;
export const RISK_LEVELS = ["Low", "Medium", "High"] as const;
export const APPROVAL_STATES = ["not_required", "pending_review", "approved", "rejected"] as const;
export const OUTREACH_STATES = ["none", "drafted", "draft_rejected", "simulated_sent"] as const;

export type MerchantCategory = (typeof CATEGORIES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ApprovalState = (typeof APPROVAL_STATES)[number];
export type OutreachStatus = (typeof OUTREACH_STATES)[number];

/** steps_completed -> (blocker, next-best-action). Recovered from source nudge order. */
export const STEP_MAP: Record<number, { blocker: string; action: string }> = {
  0: { blocker: "business_verification_needed", action: "verify_business" },
  1: { blocker: "menu_upload_needed", action: "upload_menu" },
  2: { blocker: "photos_needed", action: "add_photos" },
  3: { blocker: "business_hours_needed", action: "set_business_hours" },
  4: { blocker: "bank_verification_needed", action: "verify_bank" },
  5: { blocker: "final_verification_needed", action: "complete_final_verification" },
};

/** Human-readable phrase for the deterministic stub draft generator. */
export const ACTION_PHRASE: Record<string, string> = {
  verify_business: "verify your business information",
  upload_menu: "upload your menu",
  add_photos: "add photos of your items",
  set_business_hours: "set your business hours",
  verify_bank: "verify your bank information",
  complete_final_verification: "complete your final verification",
};

export const NEXT_ACTIONS = new Set<string>(Object.values(STEP_MAP).map((v) => v.action));

/**
 * thresholds.v1 — a DOCUMENTED ASSUMPTION used only for a consistency check.
 * NOT asserted as correct; a merchant's risk_level carries the source label.
 * See docs/v1-data-dictionary.md §6.
 */
export function classifyRiskLevel(score: number): RiskLevel {
  if (score < 50) return "Low";
  if (score < 80) return "Medium";
  return "High";
}

/** Column order of the normalized merchant entity (matches the Python CSV). */
export const MERCHANT_COLUMNS = [
  "merchant_id", "merchant_name", "merchant_category", "source_row_index",
  "as_of_date", "days_since_signup", "last_login_days_ago", "signup_at", "last_login_at",
  "steps_completed", "total_steps", "current_blocker_code", "next_best_action",
  "risk_score", "risk_score_formula_version", "risk_level", "risk_level_source",
  "risk_reason_codes",
  "contact_email", "contact_is_synthetic", "email_opt_in_status", "suppression_reason",
  "contact_eligible",
  "review_required", "review_reason",
  "approval_state", "send_eligible",
  "outreach_status", "last_outreach_at", "idempotency_key", "cooldown_window",
  "normalized_at",
] as const;
