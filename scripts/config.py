"""Constants for the ActivationOps AI V1 offline thin slice (T-001).

Deterministic, as-of-based timestamps (no wall-clock) so runs are reproducible
(RULES.md; docs/v1-data-dictionary.md §11). No secrets, no network, no AI.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = REPO_ROOT / "legacy" / "activation" / "merchant-directory.dummy.csv"
DEFAULT_OUT_DIR = REPO_ROOT / "legacy" / "activation" / "oracle"

# Fixed reference points (no wall-clock; owner may change the as-of date).
AS_OF_DATE = "2026-06-01"
RUN_TIMESTAMP = "2026-06-01T00:00:00Z"
TASK_ID = "T-001"

# Versions recorded on every generation / score.
RISK_FORMULA_VERSION = "risk.v1"
THRESHOLDS_VERSION = "thresholds.v1"
PROMPT_VERSION = "prompt.v1"
MODEL_VERSION = "stub-deterministic.v1"
SCHEMA_VERSION = "draft.v1"
TEMPLATE_ID = "blocker_nudge.v1"

TOTAL_STEPS = 5
CATEGORIES = ("Restaurant", "Retail", "Grocery", "Convenience")
RISK_LEVELS = ("Low", "Medium", "High")

# steps_completed -> (current_blocker_code, next_best_action). Step order
# recovered from the source nudge messages (data-dictionary §5).
STEP_MAP = {
    0: ("business_verification_needed", "verify_business"),
    1: ("menu_upload_needed", "upload_menu"),
    2: ("photos_needed", "add_photos"),
    3: ("business_hours_needed", "set_business_hours"),
    4: ("bank_verification_needed", "verify_bank"),
    5: ("final_verification_needed", "complete_final_verification"),
}

# Human-readable phrase for the stubbed draft generator.
ACTION_PHRASE = {
    "verify_business": "verify your business information",
    "upload_menu": "upload your menu",
    "add_photos": "add photos of your items",
    "set_business_hours": "set your business hours",
    "verify_bank": "verify your bank information",
    "complete_final_verification": "complete your final verification",
}


def classify_risk_level(score: int) -> str:
    """thresholds.v1 — a DOCUMENTED ASSUMPTION used only for the T5 consistency
    check. NOT asserted as correct; merchants_v1.risk_level carries the source
    label. See data-dictionary §6.
    """
    if score < 50:
        return "Low"
    if score < 80:
        return "Medium"
    return "High"


MERCHANT_COLUMNS = [
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
]

MODEL_RUN_COLUMNS = [
    "model_run_id", "task_id", "merchant_id", "generator", "prompt_version",
    "model_version", "schema_version", "input_summary", "output_json",
    "validation_result", "guardrail_flags", "cost_estimate_usd", "created_at",
]

AUDIT_COLUMNS = [
    "audit_event_id", "task_id", "merchant_id", "event_type", "actor",
    "idempotency_key", "details", "created_at",
]

REVIEW_QUEUE_COLUMNS = [
    "merchant_id", "merchant_name", "merchant_category", "risk_level", "risk_score",
    "current_blocker_code", "next_best_action", "review_reason", "approval_state",
]

APPROVAL_STATES = ("not_required", "pending_review", "approved", "rejected")
OUTREACH_STATES = ("none", "drafted", "draft_rejected", "simulated_sent")
