"""ActivationOps AI — V1 offline thin-slice pipeline (T-001).

Reads the source CSV READ-ONLY, normalizes the 20 rows, derives deterministic
risk / blocker / eligibility / send-gating fields, generates one stubbed
structured draft per merchant, runs the guardrail, gates simulated sends behind
approval, and writes out/ artifacts.

Storage model (data-dictionary §2/§11):
- merchants_v1.csv, review_queue.csv : regenerated snapshots (entity views).
- model_runs.csv, audit_log.csv      : append-only logs.
The send step is idempotent: it loads existing simulated_send keys from
audit_log.csv and emits `skipped_duplicate` for a repeat (data-dictionary §10).

No network, no AI/LLM call, no external integrations, no randomness.
"""

import csv
import json
import re
from datetime import date, timedelta
from pathlib import Path

from scripts import config as C
from scripts.guardrail import run_guardrail

BLOCKERS = {b for (b, _) in C.STEP_MAP.values()}
NEXT_ACTIONS = {a for (_, a) in C.STEP_MAP.values()}

DRAFT_REQUIRED_FIELDS = [
    "merchant_id", "risk_explanation", "blocker_summary", "next_best_action",
    "draft_subject", "draft_body", "guardrail_flags",
    "prompt_version", "model_version", "schema_version",
]


# ----------------------------- pure helpers -----------------------------

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")


def parse_int(value) -> int:
    return int(float(str(value).strip()))


def date_minus_days(as_of: str, days: int) -> str:
    y, m, d = (int(x) for x in as_of.split("-"))
    return (date(y, m, d) - timedelta(days=days)).isoformat()


def compute_risk_score(days_since_signup: int, last_login_days_ago: int, steps_completed: int) -> int:
    return 2 * days_since_signup + 3 * last_login_days_ago + 10 * (C.TOTAL_STEPS - steps_completed)


def compute_reason_codes(days_since_signup: int, last_login_days_ago: int, steps_completed: int) -> list:
    codes = []
    if steps_completed <= 2:
        codes.append("low_completion")
    if last_login_days_ago >= 7:
        codes.append("inactivity")
    if days_since_signup >= 14:
        codes.append("tenure_pressure")
    return codes


def diagnose_blocker(steps_completed: int):
    return C.STEP_MAP[steps_completed]


def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""))


def compute_contact_eligible(email: str, opt_in_status: str, suppression_reason: str) -> bool:
    return (
        is_valid_email(email)
        and opt_in_status != "opted_out"
        and not (suppression_reason or "").strip()
    )


def compute_review(risk_level: str, contact_eligible: bool):
    reasons = []
    if risk_level == "High":
        reasons.append("high_risk")
    if not contact_eligible:
        reasons.append("ineligible_contact")
    return (len(reasons) > 0, ";".join(reasons))


def compute_approval_state(review_required: bool, approval) -> str:
    if not review_required:
        return "not_required"
    if approval in ("approved", "rejected"):
        return approval
    return "pending_review"


def compute_send_eligible(contact_eligible: bool, review_required: bool, approval_state: str) -> bool:
    return contact_eligible and (not review_required or approval_state == "approved")


def idempotency_key(merchant_id: str, blocker_code: str) -> str:
    return f"{merchant_id}:{blocker_code}:{C.TEMPLATE_ID}:{C.AS_OF_DATE}"


def make_draft(merchant: dict) -> dict:
    """Stubbed deterministic structured draft (no LLM)."""
    name = merchant["merchant_name"]
    action = merchant["next_best_action"]
    phrase = C.ACTION_PHRASE[action]
    blocker = merchant["current_blocker_code"]
    steps = merchant["steps_completed"]
    return {
        "merchant_id": merchant["merchant_id"],
        "risk_explanation": (
            f"{name} has completed {steps} of {C.TOTAL_STEPS} onboarding steps; "
            f"the current blocker is {blocker}."
        ),
        "blocker_summary": f"Current blocker: {blocker}.",
        "next_best_action": action,
        "draft_subject": "Your next onboarding step with DoorDash",
        "draft_body": (
            f"Hi {name}, thanks for getting started on your DoorDash onboarding. "
            f"Your next step is to {phrase}. Reply to this message if you would like a hand."
        ),
        "guardrail_flags": [],
        "prompt_version": C.PROMPT_VERSION,
        "model_version": C.MODEL_VERSION,
        "schema_version": C.SCHEMA_VERSION,
    }


def validate_draft(draft: dict) -> list:
    errors = []
    for f in DRAFT_REQUIRED_FIELDS:
        if f not in draft:
            errors.append(f"missing:{f}")
    if draft.get("next_best_action") not in NEXT_ACTIONS:
        errors.append("bad:next_best_action")
    for f in ("risk_explanation", "blocker_summary", "draft_subject", "draft_body"):
        if not str(draft.get(f, "")).strip():
            errors.append(f"empty:{f}")
    return errors


def validate_merchant_row(m: dict) -> list:
    """Validate a normalized merchant against the data dictionary (T16)."""
    errors = []
    if not re.match(r"^M\d{3}$", m["merchant_id"]):
        errors.append("merchant_id")
    if m["merchant_category"] not in C.CATEGORIES:
        errors.append("merchant_category")
    if not (0 <= m["steps_completed"] <= C.TOTAL_STEPS):
        errors.append("steps_completed")
    if (m["current_blocker_code"], m["next_best_action"]) != C.STEP_MAP[m["steps_completed"]]:
        errors.append("blocker_mapping")
    if m["risk_level"] not in C.RISK_LEVELS:
        errors.append("risk_level")
    if m["risk_score"] != compute_risk_score(
        m["days_since_signup"], m["last_login_days_ago"], m["steps_completed"]
    ):
        errors.append("risk_score_recompute")
    if not str(m["contact_email"]).endswith("@example.com"):
        errors.append("contact_email")
    if m["approval_state"] not in C.APPROVAL_STATES:
        errors.append("approval_state")
    if m["outreach_status"] not in C.OUTREACH_STATES:
        errors.append("outreach_status")
    # send-gate invariants
    expected_send = compute_send_eligible(
        m["contact_eligible"], m["review_required"], m["approval_state"]
    )
    if m["send_eligible"] != expected_send:
        errors.append("send_eligible_rule")
    if m["outreach_status"] == "simulated_sent" and not m["send_eligible"]:
        errors.append("sent_without_eligibility")
    if m["outreach_status"] == "simulated_sent" and not m["idempotency_key"]:
        errors.append("sent_without_idempotency_key")
    return errors


# ----------------------------- io helpers -----------------------------

def _fmt(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, list):
        return ";".join(v)
    return v


def _write_csv(path: Path, columns: list, rows: list):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=columns)
        w.writeheader()
        for r in rows:
            w.writerow({c: _fmt(r.get(c, "")) for c in columns})


def _append_csv(path: Path, columns: list, rows: list):
    exists = path.exists()
    with open(path, "a", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=columns)
        if not exists:
            w.writeheader()
        for r in rows:
            w.writerow({c: _fmt(r.get(c, "")) for c in columns})


def load_sent_keys(out_dir: Path) -> set:
    path = Path(out_dir) / "audit_log.csv"
    keys = set()
    if path.exists():
        with open(path, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                if row.get("event_type") == "simulated_send" and row.get("idempotency_key"):
                    keys.add(row["idempotency_key"])
    return keys


def _next_audit_seq(out_dir: Path) -> int:
    path = Path(out_dir) / "audit_log.csv"
    if not path.exists():
        return 0
    with open(path, newline="", encoding="utf-8") as fh:
        return sum(1 for _ in csv.DictReader(fh))


def read_source(source_path: Path) -> list:
    with open(source_path, newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    return rows[1:]  # drop the (duplicate-header) row; index by position


# ----------------------------- normalization -----------------------------

def normalize_row(raw: list, idx: int, approvals: dict) -> dict:
    name = raw[0].strip()
    category = raw[1].strip()
    days_since_signup = parse_int(raw[2])
    steps_completed = parse_int(raw[3])
    last_login_days_ago = parse_int(raw[4])
    source_risk_score = parse_int(raw[5])
    # Source uses "Low Risk"/"Medium Risk"/"High Risk"; the data-dictionary enum
    # is Low/Medium/High. Carry the source label, normalized to the enum form.
    source_risk_level = raw[6].strip().replace(" Risk", "").strip()

    merchant_id = f"M{idx:03d}"
    blocker, action = diagnose_blocker(steps_completed)
    risk_score = compute_risk_score(days_since_signup, last_login_days_ago, steps_completed)
    reason_codes = compute_reason_codes(days_since_signup, last_login_days_ago, steps_completed)

    email = f"{slugify(name)}@example.com"
    opt_in = "unknown"
    suppression = ""
    contact_eligible = compute_contact_eligible(email, opt_in, suppression)

    review_required, review_reason = compute_review(source_risk_level, contact_eligible)
    approval = (approvals or {}).get(merchant_id)
    approval_state = compute_approval_state(review_required, approval)
    send_eligible = compute_send_eligible(contact_eligible, review_required, approval_state)

    return {
        "merchant_id": merchant_id,
        "merchant_name": name,
        "merchant_category": category,
        "source_row_index": idx,
        "as_of_date": C.AS_OF_DATE,
        "days_since_signup": days_since_signup,
        "last_login_days_ago": last_login_days_ago,
        "signup_at": date_minus_days(C.AS_OF_DATE, days_since_signup),
        "last_login_at": date_minus_days(C.AS_OF_DATE, last_login_days_ago),
        "steps_completed": steps_completed,
        "total_steps": C.TOTAL_STEPS,
        "current_blocker_code": blocker,
        "next_best_action": action,
        "risk_score": risk_score,
        "risk_score_formula_version": C.RISK_FORMULA_VERSION,
        "risk_level": source_risk_level,        # carried from source (authoritative)
        "risk_level_source": "source_csv",
        "risk_reason_codes": reason_codes,
        "contact_email": email,
        "contact_is_synthetic": True,
        "email_opt_in_status": opt_in,
        "suppression_reason": suppression,
        "contact_eligible": contact_eligible,
        "review_required": review_required,
        "review_reason": review_reason,
        "approval_state": approval_state,
        "send_eligible": send_eligible,
        "outreach_status": "none",
        "last_outreach_at": "",
        "idempotency_key": "",
        "cooldown_window": C.AS_OF_DATE,
        "normalized_at": C.RUN_TIMESTAMP,
        "_source_risk_score": source_risk_score,  # kept for T4; not written to CSV
    }


# ----------------------------- orchestration -----------------------------

def run_pipeline(source_path=None, out_dir=None, approvals=None) -> dict:
    source_path = Path(source_path or C.SOURCE_CSV)
    out_dir = Path(out_dir or C.DEFAULT_OUT_DIR)
    out_dir.mkdir(parents=True, exist_ok=True)
    approvals = approvals or {}

    audit = []
    model_runs = []
    seq = {"audit": _next_audit_seq(out_dir)}

    def log(event_type, merchant_id="", idem="", details=""):
        seq["audit"] += 1
        audit.append({
            "audit_event_id": f"AE-{seq['audit']:06d}",
            "task_id": C.TASK_ID,
            "merchant_id": merchant_id,
            "event_type": event_type,
            "actor": "system",
            "idempotency_key": idem,
            "details": details,
            "created_at": C.RUN_TIMESTAMP,
        })

    log("source_read", details=f"source={source_path.name}")
    raw_rows = read_source(source_path)

    merchants = []
    for idx, raw in enumerate(raw_rows, start=1):
        m = normalize_row(raw, idx, approvals)
        errs = validate_merchant_row(m)
        if errs:
            raise ValueError(f"row {idx} ({m['merchant_id']}) failed validation: {errs}")
        merchants.append(m)
        log("normalized", m["merchant_id"], details=f"row={idx}")
        log("risk_scored", m["merchant_id"], details=f"{m['risk_score']}/{m['risk_level']}")
        log("blocker_diagnosed", m["merchant_id"], details=m["current_blocker_code"])
        if m["review_required"]:
            log("review_queued", m["merchant_id"], details=m["review_reason"])

    # drafts + guardrail
    for i, m in enumerate(merchants, start=1):
        draft = make_draft(m)
        flags = run_guardrail(draft, m)
        draft["guardrail_flags"] = flags
        schema_errors = validate_draft(draft)
        passed = (not flags) and (not schema_errors)
        if passed:
            m["outreach_status"] = "drafted"
            m["last_outreach_at"] = C.AS_OF_DATE
            log("draft_generated", m["merchant_id"], details="ok")
        else:
            m["outreach_status"] = "draft_rejected"
            log("draft_rejected", m["merchant_id"], details=";".join(flags + schema_errors))
        model_runs.append({
            "model_run_id": f"MR-{C.TASK_ID}-{i:03d}",
            "task_id": C.TASK_ID,
            "merchant_id": m["merchant_id"],
            "generator": "stub",
            "prompt_version": C.PROMPT_VERSION,
            "model_version": C.MODEL_VERSION,
            "schema_version": C.SCHEMA_VERSION,
            "input_summary": (
                f"steps={m['steps_completed']};blocker={m['current_blocker_code']};"
                f"risk={m['risk_score']}/{m['risk_level']}"
            ),
            "output_json": json.dumps(draft, sort_keys=True),
            "validation_result": "pass" if passed else "fail",
            "guardrail_flags": ";".join(flags),
            "cost_estimate_usd": 0,
            "created_at": C.RUN_TIMESTAMP,
        })

    # simulated sends (idempotent; append-only audit_log)
    existing_keys = load_sent_keys(out_dir)
    for m in merchants:
        if not m["send_eligible"] or m["outreach_status"] != "drafted":
            continue
        key = idempotency_key(m["merchant_id"], m["current_blocker_code"])
        m["idempotency_key"] = key
        m["outreach_status"] = "simulated_sent"
        m["last_outreach_at"] = C.AS_OF_DATE
        if key in existing_keys:
            log("skipped_duplicate", m["merchant_id"], idem=key, details="already sent")
        else:
            existing_keys.add(key)
            log("simulated_send", m["merchant_id"], idem=key, details="simulated (no real email)")

    # re-validate after state transitions
    for m in merchants:
        errs = validate_merchant_row(m)
        if errs:
            raise ValueError(f"{m['merchant_id']} failed post-send validation: {errs}")

    # write snapshots; append logs
    _write_csv(out_dir / "merchants_v1.csv", C.MERCHANT_COLUMNS,
               [{k: m[k] for k in C.MERCHANT_COLUMNS} for m in merchants])
    review_queue = [m for m in merchants if m["review_required"]]
    _write_csv(out_dir / "review_queue.csv", C.REVIEW_QUEUE_COLUMNS, review_queue)
    _append_csv(out_dir / "model_runs.csv", C.MODEL_RUN_COLUMNS, model_runs)
    _append_csv(out_dir / "audit_log.csv", C.AUDIT_COLUMNS, audit)

    return {
        "merchants": merchants,
        "review_queue": review_queue,
        "model_runs": model_runs,
        "audit": audit,
        "counts": {
            "total": len(merchants),
            "review_required": len(review_queue),
            "drafted": sum(1 for m in merchants if m["outreach_status"] == "drafted"),
            "draft_rejected": sum(1 for m in merchants if m["outreach_status"] == "draft_rejected"),
            "simulated_sent": sum(1 for m in merchants if m["outreach_status"] == "simulated_sent"),
            "simulated_send_events": sum(1 for e in audit if e["event_type"] == "simulated_send"),
            "skipped_duplicate_events": sum(1 for e in audit if e["event_type"] == "skipped_duplicate"),
        },
    }
