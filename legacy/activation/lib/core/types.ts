/** Domain types for the deterministic core. */
import type {
  ApprovalState,
  MerchantCategory,
  OutreachStatus,
  RiskLevel,
} from "./constants";

/**
 * The minimal input a merchant row needs before normalization. In the rebuild
 * these come from the HYBRID dataset: merchant_name + merchant_category from the
 * real open-source layer (sanitized — untrusted text); the rest synthetic.
 */
export interface MerchantInput {
  merchant_name: string;
  merchant_category: MerchantCategory;
  days_since_signup: number;
  last_login_days_ago: number;
  steps_completed: number;
  /** Carried from source as authoritative (data-dictionary §6). */
  source_risk_level: RiskLevel;
}

/** A fully normalized + decisioned merchant entity. */
export interface Merchant {
  merchant_id: string;
  merchant_name: string;
  merchant_category: MerchantCategory;
  source_row_index: number;
  as_of_date: string;
  days_since_signup: number;
  last_login_days_ago: number;
  signup_at: string;
  last_login_at: string;
  steps_completed: number;
  total_steps: number;
  current_blocker_code: string;
  next_best_action: string;
  risk_score: number;
  risk_score_formula_version: string;
  risk_level: RiskLevel;
  risk_level_source: string;
  risk_reason_codes: string[];
  contact_email: string;
  contact_is_synthetic: boolean;
  email_opt_in_status: string;
  suppression_reason: string;
  contact_eligible: boolean;
  review_required: boolean;
  review_reason: string;
  approval_state: ApprovalState;
  send_eligible: boolean;
  outreach_status: OutreachStatus;
  last_outreach_at: string;
  idempotency_key: string;
  cooldown_window: string;
  normalized_at: string;
}

/** A structured outreach draft (stub today; bounded Gemini in Phase B). */
export interface Draft {
  merchant_id: string;
  risk_explanation: string;
  blocker_summary: string;
  next_best_action: string;
  draft_subject: string;
  draft_body: string;
  guardrail_flags: string[];
  prompt_version: string;
  model_version: string;
  schema_version: string;
}
