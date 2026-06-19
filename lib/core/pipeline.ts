/**
 * Deterministic core pipeline — a faithful TypeScript port of scripts/pipeline.py.
 * Pure functions; no file I/O, no network, no AI. The Python prototype remains
 * the differential-test oracle (evals/core-differential.test.ts).
 */
import {
  ACTION_PHRASE,
  APPROVAL_STATES,
  AS_OF_DATE,
  CATEGORIES,
  MODEL_VERSION,
  NEXT_ACTIONS,
  OUTREACH_STATES,
  PROMPT_VERSION,
  REFERENCE_PLATFORM_NAME,
  RISK_FORMULA_VERSION,
  RISK_LEVELS,
  RUN_TIMESTAMP,
  SCHEMA_VERSION,
  STEP_MAP,
  TEMPLATE_ID,
  TOTAL_STEPS,
} from "./constants";
import type { ApprovalState, RiskLevel } from "./constants";
import { runGuardrail } from "./guardrail";
import type { Draft, Merchant, MerchantInput } from "./types";

const DRAFT_REQUIRED_FIELDS: (keyof Draft)[] = [
  "merchant_id", "risk_explanation", "blocker_summary", "next_best_action",
  "draft_subject", "draft_body", "guardrail_flags",
  "prompt_version", "model_version", "schema_version",
];

// ----------------------------- pure helpers -----------------------------

export function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Parse an integer field; accepts integer-valued decimals ("3.00"), rejects "3.50". */
export function parseIntField(value: string | number): number {
  const f = parseFloat(String(value).trim());
  if (!Number.isFinite(f) || f !== Math.trunc(f)) {
    throw new Error(`non-integer value not allowed for an integer field: ${String(value)}`);
  }
  return Math.trunc(f);
}

/** as-of date minus N days, in UTC, as ISO YYYY-MM-DD (no TZ drift). */
export function dateMinusDays(asOf: string, days: number): string {
  const [y, m, d] = asOf.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
}

export function computeRiskScore(daysSinceSignup: number, lastLoginDaysAgo: number, stepsCompleted: number): number {
  return 2 * daysSinceSignup + 3 * lastLoginDaysAgo + 10 * (TOTAL_STEPS - stepsCompleted);
}

export function computeReasonCodes(daysSinceSignup: number, lastLoginDaysAgo: number, stepsCompleted: number): string[] {
  const codes: string[] = [];
  if (stepsCompleted <= 2) codes.push("low_completion");
  if (lastLoginDaysAgo >= 7) codes.push("inactivity");
  if (daysSinceSignup >= 14) codes.push("tenure_pressure");
  return codes;
}

export function diagnoseBlocker(stepsCompleted: number): { blocker: string; action: string } {
  return STEP_MAP[stepsCompleted];
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "");
}

export function computeContactEligible(email: string, optInStatus: string, suppressionReason: string): boolean {
  return isValidEmail(email) && optInStatus !== "opted_out" && (suppressionReason ?? "").trim() === "";
}

export function computeReview(riskLevel: RiskLevel, contactEligible: boolean): [boolean, string] {
  const reasons: string[] = [];
  if (riskLevel === "High") reasons.push("high_risk");
  if (!contactEligible) reasons.push("ineligible_contact");
  return [reasons.length > 0, reasons.join(";")];
}

export function computeApprovalState(reviewRequired: boolean, approval: string | undefined): ApprovalState {
  if (!reviewRequired) return "not_required";
  if (approval === "approved" || approval === "rejected") return approval;
  return "pending_review";
}

export function computeSendEligible(contactEligible: boolean, reviewRequired: boolean, approvalState: ApprovalState): boolean {
  return contactEligible && (!reviewRequired || approvalState === "approved");
}

export function idempotencyKey(merchantId: string, blockerCode: string): string {
  return `${merchantId}:${blockerCode}:${TEMPLATE_ID}:${AS_OF_DATE}`;
}

/** Deterministic stub draft (no LLM) — the differential oracle + the live-AI fallback. */
export function makeDraft(merchant: Merchant, platformName = REFERENCE_PLATFORM_NAME): Draft {
  const name = merchant.merchant_name;
  const action = merchant.next_best_action;
  const phrase = ACTION_PHRASE[action];
  const blocker = merchant.current_blocker_code;
  const steps = merchant.steps_completed;
  return {
    merchant_id: merchant.merchant_id,
    risk_explanation: `${name} has completed ${steps} of ${TOTAL_STEPS} onboarding steps; the current blocker is ${blocker}.`,
    blocker_summary: `Current blocker: ${blocker}.`,
    next_best_action: action,
    draft_subject: `Your next onboarding step with ${platformName}`,
    draft_body: `Hi ${name}, thanks for getting started on your ${platformName} onboarding. Your next step is to ${phrase}. Reply to this message if you would like a hand.`,
    guardrail_flags: [],
    prompt_version: PROMPT_VERSION,
    model_version: MODEL_VERSION,
    schema_version: SCHEMA_VERSION,
  };
}

export function validateDraft(draft: Draft): string[] {
  const errors: string[] = [];
  for (const f of DRAFT_REQUIRED_FIELDS) {
    if (!(f in draft) || draft[f] === undefined) errors.push(`missing:${String(f)}`);
  }
  if (!NEXT_ACTIONS.has(draft.next_best_action)) errors.push("bad:next_best_action");
  for (const f of ["risk_explanation", "blocker_summary", "draft_subject", "draft_body"] as const) {
    if (String(draft[f] ?? "").trim() === "") errors.push(`empty:${f}`);
  }
  return errors;
}

export function validateMerchantRow(m: Merchant): string[] {
  const errors: string[] = [];
  if (!/^M\d{3}$/.test(m.merchant_id)) errors.push("merchant_id");
  if (!CATEGORIES.includes(m.merchant_category)) errors.push("merchant_category");
  if (!(m.steps_completed >= 0 && m.steps_completed <= TOTAL_STEPS)) errors.push("steps_completed");
  const expected = STEP_MAP[m.steps_completed];
  if (!expected || m.current_blocker_code !== expected.blocker || m.next_best_action !== expected.action) {
    errors.push("blocker_mapping");
  }
  if (!RISK_LEVELS.includes(m.risk_level)) errors.push("risk_level");
  if (m.risk_score !== computeRiskScore(m.days_since_signup, m.last_login_days_ago, m.steps_completed)) {
    errors.push("risk_score_recompute");
  }
  if (!m.contact_email.endsWith("@example.com")) errors.push("contact_email");
  if (!APPROVAL_STATES.includes(m.approval_state)) errors.push("approval_state");
  if (!OUTREACH_STATES.includes(m.outreach_status)) errors.push("outreach_status");
  const expectedSend = computeSendEligible(m.contact_eligible, m.review_required, m.approval_state);
  if (m.send_eligible !== expectedSend) errors.push("send_eligible_rule");
  if (m.outreach_status === "simulated_sent" && !m.send_eligible) errors.push("sent_without_eligibility");
  if (m.outreach_status === "simulated_sent" && !m.idempotency_key) errors.push("sent_without_idempotency_key");
  return errors;
}

// ----------------------------- normalization -----------------------------

export function normalizeRow(input: MerchantInput, idx: number, approvals: Record<string, string> = {}): Merchant {
  const name = input.merchant_name.trim();
  const category = input.merchant_category;
  const daysSinceSignup = input.days_since_signup;
  const stepsCompleted = input.steps_completed;
  const lastLoginDaysAgo = input.last_login_days_ago;
  const sourceRiskLevel = input.source_risk_level;

  const merchantId = `M${String(idx).padStart(3, "0")}`;
  const { blocker, action } = diagnoseBlocker(stepsCompleted);
  const riskScore = computeRiskScore(daysSinceSignup, lastLoginDaysAgo, stepsCompleted);
  const reasonCodes = computeReasonCodes(daysSinceSignup, lastLoginDaysAgo, stepsCompleted);

  const email = `${slugify(name)}@example.com`;
  const optIn = "unknown";
  const suppression = "";
  const contactEligible = computeContactEligible(email, optIn, suppression);

  const [reviewRequired, reviewReason] = computeReview(sourceRiskLevel, contactEligible);
  const approval = approvals[merchantId];
  const approvalState = computeApprovalState(reviewRequired, approval);
  const sendEligible = computeSendEligible(contactEligible, reviewRequired, approvalState);

  return {
    merchant_id: merchantId,
    merchant_name: name,
    merchant_category: category,
    source_row_index: idx,
    as_of_date: AS_OF_DATE,
    days_since_signup: daysSinceSignup,
    last_login_days_ago: lastLoginDaysAgo,
    signup_at: dateMinusDays(AS_OF_DATE, daysSinceSignup),
    last_login_at: dateMinusDays(AS_OF_DATE, lastLoginDaysAgo),
    steps_completed: stepsCompleted,
    total_steps: TOTAL_STEPS,
    current_blocker_code: blocker,
    next_best_action: action,
    risk_score: riskScore,
    risk_score_formula_version: RISK_FORMULA_VERSION,
    risk_level: sourceRiskLevel,
    risk_level_source: "source_csv",
    risk_reason_codes: reasonCodes,
    contact_email: email,
    contact_is_synthetic: true,
    email_opt_in_status: optIn,
    suppression_reason: suppression,
    contact_eligible: contactEligible,
    review_required: reviewRequired,
    review_reason: reviewReason,
    approval_state: approvalState,
    send_eligible: sendEligible,
    outreach_status: "none",
    last_outreach_at: "",
    idempotency_key: "",
    cooldown_window: AS_OF_DATE,
    normalized_at: RUN_TIMESTAMP,
  };
}

// ----------------------------- orchestration -----------------------------

export interface CoreResult {
  merchants: Merchant[];
  drafts: Draft[];
}

/**
 * Run the deterministic pipeline over inputs: normalize -> validate -> stub draft
 * + guardrail (drafted/rejected) -> idempotent simulated send -> re-validate.
 * Returns merchants + per-merchant drafts. No file I/O (callers persist).
 */
export function runCore(
  inputs: MerchantInput[],
  approvals: Record<string, string> = {},
  platformName = REFERENCE_PLATFORM_NAME,
): CoreResult {
  const merchants = inputs.map((input, i) => {
    const m = normalizeRow(input, i + 1, approvals);
    const errs = validateMerchantRow(m);
    if (errs.length) throw new Error(`row ${i + 1} (${m.merchant_id}) failed validation: ${errs.join(",")}`);
    return m;
  });

  const drafts: Draft[] = [];
  for (const m of merchants) {
    const draft = makeDraft(m, platformName);
    const flags = runGuardrail(draft, m, platformName);
    draft.guardrail_flags = flags;
    const schemaErrors = validateDraft(draft);
    const passed = flags.length === 0 && schemaErrors.length === 0;
    if (passed) {
      m.outreach_status = "drafted";
      m.last_outreach_at = AS_OF_DATE;
    } else {
      m.outreach_status = "draft_rejected";
    }
    drafts.push(draft);
  }

  // simulated sends (idempotent within a run; a fresh run has no existing keys)
  const existingKeys = new Set<string>();
  for (const m of merchants) {
    if (!m.send_eligible || m.outreach_status !== "drafted") continue;
    const key = idempotencyKey(m.merchant_id, m.current_blocker_code);
    m.idempotency_key = key;
    m.outreach_status = "simulated_sent";
    m.last_outreach_at = AS_OF_DATE;
    existingKeys.add(key);
  }

  for (const m of merchants) {
    const errs = validateMerchantRow(m);
    if (errs.length) throw new Error(`${m.merchant_id} failed post-send validation: ${errs.join(",")}`);
  }

  return { merchants, drafts };
}
