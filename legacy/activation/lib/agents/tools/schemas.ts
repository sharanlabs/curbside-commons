/**
 * Shared Zod schemas for the A1 agent-tool layer (Phase A1 — tool-ify the deterministic core).
 *
 * One source of truth for the typed tool I/O contracts. These schemas MIRROR the existing
 * domain types (Merchant, OutreachDraft, GatekeeperReport, JudgeResult, DraftScore, Diagnosis,
 * AuditEntry) EXACTLY — they reuse the existing const vocab arrays (CATEGORIES / RISK_LEVELS /
 * APPROVAL_STATES / OUTREACH_STATES) so `z.infer<...>` is structurally identical to the source
 * interface. A tool's `run` parses input on entry and validates output on exit through these
 * schemas; because the schemas are faithful, the parse is an identity on valid values (proven
 * byte-for-byte by evals/tools-differential.test.ts), so the wrappers add NO behavior (R-TOOL-1).
 *
 * This file lives alongside the tools (NOT in the §5.4 file list) to break the registry<->tool
 * import cycle (registry imports the tools; the tools import these schemas). Additive only.
 */
import { z } from "zod";
import {
  APPROVAL_STATES,
  CATEGORIES,
  OUTREACH_STATES,
  RISK_LEVELS,
} from "@/legacy/activation/lib/core/constants";
import { JudgeVerdictSchema } from "@/legacy/activation/lib/agents/semantic-judge";

// ----------------------------- core merchant I/O -----------------------------

/** Mirrors MerchantInput (lib/core/types.ts). */
export const MerchantInputSchema = z.object({
  merchant_name: z.string(),
  merchant_category: z.enum(CATEGORIES),
  days_since_signup: z.number(),
  last_login_days_ago: z.number(),
  steps_completed: z.number(),
  source_risk_level: z.enum(RISK_LEVELS),
});

/** Mirrors Merchant (lib/core/types.ts) — all 32 normalized columns (= MERCHANT_COLUMNS). */
export const MerchantSchema = z.object({
  merchant_id: z.string(),
  merchant_name: z.string(),
  merchant_category: z.enum(CATEGORIES),
  source_row_index: z.number(),
  as_of_date: z.string(),
  days_since_signup: z.number(),
  last_login_days_ago: z.number(),
  signup_at: z.string(),
  last_login_at: z.string(),
  steps_completed: z.number(),
  total_steps: z.number(),
  current_blocker_code: z.string(),
  next_best_action: z.string(),
  risk_score: z.number(),
  risk_score_formula_version: z.string(),
  risk_level: z.enum(RISK_LEVELS),
  risk_level_source: z.string(),
  risk_reason_codes: z.array(z.string()),
  contact_email: z.string(),
  contact_is_synthetic: z.boolean(),
  email_opt_in_status: z.string(),
  suppression_reason: z.string(),
  contact_eligible: z.boolean(),
  review_required: z.boolean(),
  review_reason: z.string(),
  approval_state: z.enum(APPROVAL_STATES),
  send_eligible: z.boolean(),
  outreach_status: z.enum(OUTREACH_STATES),
  last_outreach_at: z.string(),
  idempotency_key: z.string(),
  cooldown_window: z.string(),
  normalized_at: z.string(),
});

// ----------------------------- draft I/O -----------------------------

/** Mirrors DraftClaim (lib/agents/draft.ts). */
export const DraftClaimSchema = z.object({
  field: z.string(),
  value: z.union([z.string(), z.number()]),
});

/** Mirrors OutreachDraft = Draft + claims (lib/agents/draft.ts). */
export const OutreachDraftSchema = z.object({
  merchant_id: z.string(),
  risk_explanation: z.string(),
  blocker_summary: z.string(),
  next_best_action: z.string(),
  draft_subject: z.string(),
  draft_body: z.string(),
  guardrail_flags: z.array(z.string()),
  prompt_version: z.string(),
  model_version: z.string(),
  schema_version: z.string(),
  claims: z.array(DraftClaimSchema),
});

// ----------------------------- gatekeeper / judge / score / diagnosis -----------------------------

/** Mirrors GatekeeperReport (lib/agents/gatekeeper.ts). */
export const GatekeeperReportSchema = z.object({
  status: z.enum(["PASS", "WARN", "BLOCKED"]),
  failures: z.array(z.string()),
  warnings: z.array(z.string()),
  guardrailFlags: z.array(z.string()),
  approvedForHumanReview: z.boolean(),
  checkedAt: z.string(),
});

/** Mirrors AgentRunUsage (lib/agents/gemini.ts) — all fields optional per the SDK. */
export const AgentRunUsageSchema = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  finishReason: z.string().nullable().optional(),
});

/** Mirrors JudgeResult (lib/agents/semantic-judge.ts). Reuses JudgeVerdictSchema for the verdict. */
export const JudgeResultSchema = z.object({
  verdict: JudgeVerdictSchema,
  mode: z.enum(["DETERMINISTIC_JUDGE", "LIVE_JUDGE", "REPLAY", "FAILED_TO_FALLBACK"]),
  modelId: z.string(),
  provider: z.string(),
  costUsd: z.number(),
  usage: AgentRunUsageSchema.optional(),
  errorClass: z.string().optional(),
});

/** Mirrors GraderResult (lib/evals/draft-quality.ts). */
export const GraderResultSchema = z.object({
  grader: z.enum(["structure", "state-consistency", "policy", "no-leakage"]),
  pass: z.boolean(),
  failures: z.array(z.string()),
});

/** Mirrors DraftScore (lib/evals/draft-quality.ts). */
export const DraftScoreSchema = z.object({
  results: z.array(GraderResultSchema),
  pass: z.boolean(),
  passed: z.number(),
  total: z.number(),
});

/** Mirrors ReactivationPlay (lib/domain/diagnosis.ts). */
export const ReactivationPlaySchema = z.object({
  touch: z.enum(["self_serve_nudge", "re_engagement", "ops_escalation", "high_touch", "wait"]),
  action: z.string(),
  rationale: z.string(),
});

/** Mirrors Diagnosis (lib/domain/diagnosis.ts). */
export const DiagnosisSchema = z.object({
  blocker_code: z.string(),
  blocker_label: z.string(),
  blocker_group: z.enum(["A_step_aligned", "B_cross_cutting"]),
  blocker_source: z.enum(["merchant_side", "platform_side"]),
  engagement_state: z.enum(["new", "actively_stuck", "ghosted", "dormant", "progressing"]),
  root_cause_hypothesis: z.string(),
  play: ReactivationPlaySchema,
  detectable_now: z.boolean(),
  caveat: z.string(),
});

// ----------------------------- send / audit -----------------------------

/** The idempotent-send tool's output (mirrors runCore's send-loop transition). */
export const SimulateSendOutputSchema = z.object({
  send_eligible: z.boolean(),
  idempotency_key: z.string(),
  outreach_status: z.enum(OUTREACH_STATES),
});

/** Mirrors AuditEntry (lib/replay/run.ts) — keep the actor vocab in lockstep with it (incl. "domain"). */
export const AuditEntrySchema = z.object({
  at: z.string(),
  actor: z.enum(["system", "draft", "gatekeeper", "judge", "domain", "eval"]),
  action: z.string(),
  detail: z.string(),
});

/** The audit log: an order-preserving array of audit entries. */
export const AuditLogSchema = z.array(AuditEntrySchema);
