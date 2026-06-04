"""T-002 offline evaluation and regression harness.

Runs the canonical pipeline against golden merchant labels and the guardrail
regression corpus; writes a versioned baseline JSON. Stdlib only; no network.
"""

import argparse
import hashlib
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import config as C  # noqa: E402
from scripts import pipeline as P  # noqa: E402
from scripts.guardrail import run_guardrail, scan_text  # noqa: E402

REPO_ROOT = C.REPO_ROOT
DEFAULT_GOLDEN = REPO_ROOT / "eval" / "golden_merchants.v1.json"
DEFAULT_REGRESSION = REPO_ROOT / "eval" / "guardrail_regression.v1.json"
DEFAULT_BASELINE = REPO_ROOT / "eval" / "eval_baseline.v1.json"

GOLDEN_MERCHANT_FIELDS = [
    "merchant_id",
    "source_row_index",
    "steps_completed",
    "current_blocker_code",
    "next_best_action",
    "risk_score",
    "risk_level",
    "risk_reason_codes",
    "review_required",
    "review_reason",
    "approval_state",
    "send_eligible",
    "outreach_status",
    "contact_eligible",
]

INCLUSION_KINDS = frozenset({"regex_positive", "structural_positive"})
EXACT_EMPTY_KINDS = frozenset({"regex_negative", "source_corpus", "stub_clean"})

# GR-POS-009: assemble assignment-form api_key text from fragments (no contiguous sk_live literal in repo).
REGRESSION_TEXT_SENTINELS = {
    "__REGRESSION_PII_API_KEY_ASSIGNMENT__": (
        "Use "
        + "api"
        + "_"
        + "key"
        + "="
        + "sk"
        + "_"
        + "live"
        + "_"
        + "abcdefghijklmnop"
        + " to connect."
    ),
}


def resolve_regression_text(text: str) -> str:
    """Expand regression sentinels to scan text (keeps secrets out of committed JSON)."""
    return REGRESSION_TEXT_SENTINELS.get(text, text)


# Minimum corpus floors (docs/t002-slice-plan.md) — truncated fixtures must fail checks.
REGRESSION_MIN_COUNTS = {
    "cases_total": 43,
    "regex_positive": 11,
    "structural_positive": 1,
    "regex_negative": 6,
    "source_corpus": 20,
    "stub_clean": 5,
}
T001_PARITY_REGEX_POSITIVE = 5


def validate_golden_metadata(golden: dict, source_path: Path) -> list:
    """Fail on drift between golden file and current config / source CSV."""
    failures = []
    expected_config = {
        "as_of_date": C.AS_OF_DATE,
        "risk_formula_version": C.RISK_FORMULA_VERSION,
        "thresholds_version": C.THRESHOLDS_VERSION,
    }
    for field, expected in expected_config.items():
        actual = golden.get(field)
        if actual != expected:
            failures.append({
                "scope": "golden_metadata",
                "field": field,
                "expected": expected,
                "actual": actual,
            })

    source_hash = sha256_file(source_path)
    golden_hash = golden.get("source_csv_sha256")
    if golden_hash != source_hash:
        failures.append({
            "scope": "golden_metadata",
            "field": "source_csv_sha256",
            "expected": golden_hash,
            "actual": source_hash,
        })
    return failures


def validate_regression_corpus(regression: dict) -> list:
    """Return failures when the regression fixture is below minimum corpus floors."""
    cases = regression.get("cases") or []
    failures = []
    by_kind = {}
    for case in cases:
        by_kind[case["kind"]] = by_kind.get(case["kind"], 0) + 1

    counts = {"cases_total": len(cases), **by_kind}
    for key, minimum in REGRESSION_MIN_COUNTS.items():
        if counts.get(key, 0) < minimum:
            failures.append({
                "scope": "regression_corpus",
                "metric": key,
                "minimum": minimum,
                "actual": counts.get(key, 0),
            })

    parity = 0
    for c in cases:
        if c.get("kind") != "regex_positive":
            continue
        cid = str(c.get("case_id", ""))
        if not cid.startswith("GR-POS-"):
            continue
        try:
            num = int(cid.rsplit("-", 1)[-1])
        except ValueError:
            continue
        if num <= T001_PARITY_REGEX_POSITIVE:
            parity += 1
    if parity < T001_PARITY_REGEX_POSITIVE:
        failures.append({
            "scope": "regression_corpus",
            "metric": "t001_regex_parity",
            "minimum": T001_PARITY_REGEX_POSITIVE,
            "actual": parity,
        })
    return failures



def sha256_file(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load_json(path) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def normalize_reason_codes(value) -> list:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return sorted(str(x) for x in value)
    if isinstance(value, str):
        parts = [p.strip() for p in value.split(";") if p.strip()]
        return sorted(parts)
    return sorted([str(value)])


def merchant_from_pipeline(m: dict) -> dict:
    out = {}
    for field in GOLDEN_MERCHANT_FIELDS:
        val = m.get(field)
        if field == "risk_reason_codes":
            val = normalize_reason_codes(val)
        elif field in ("review_required", "contact_eligible", "send_eligible"):
            val = bool(val)
        out[field] = val
    return out


def flags_include(actual: list, expected: list) -> bool:
    actual_set = set(actual or [])
    return all(flag in actual_set for flag in (expected or []))


def case_passes(case: dict, actual: list) -> bool:
    kind = case["kind"]
    expected = case.get("expect_flags") or []
    if kind in INCLUSION_KINDS:
        return flags_include(actual, expected)
    if kind in EXACT_EMPTY_KINDS:
        return actual == []
    raise ValueError(f"unknown regression case kind: {kind!r}")


def _merchant_context_for_draft(ctx: dict) -> dict:
    """Minimal merchant dict for make_draft / run_guardrail."""
    out = dict(ctx)
    out.setdefault("merchant_name", "Eval Merchant")
    return out


def eval_regression_case(case: dict) -> tuple:
    """Return (passed, actual_flags)."""
    kind = case["kind"]
    if kind in ("regex_positive", "regex_negative", "source_corpus"):
        actual = scan_text(resolve_regression_text(case.get("text") or ""))
    elif kind == "structural_positive":
        ctx = _merchant_context_for_draft(case["merchant_context"])
        draft = P.make_draft(ctx)
        draft.update(case.get("draft_overrides") or {})
        actual = run_guardrail(draft, ctx)
    elif kind == "stub_clean":
        ctx = _merchant_context_for_draft(case["merchant_context"])
        draft = P.make_draft(ctx)
        actual = run_guardrail(draft, ctx)
    else:
        raise ValueError(f"unknown regression case kind: {kind!r}")
    return case_passes(case, actual), sorted(actual)


def _field_equal(field: str, expected, actual) -> bool:
    if field == "risk_reason_codes":
        return normalize_reason_codes(expected) == normalize_reason_codes(actual)
    return expected == actual


def _skipped_merchant_eval(total: int) -> dict:
    field_accuracy = {f: {"correct": 0, "total": 0} for f in GOLDEN_MERCHANT_FIELDS}
    return {
        "merchants_total": total,
        "merchants_matched": 0,
        "field_accuracy": field_accuracy,
        "blocker_exact_match_rate": 0.0,
        "risk_score_exact_match_rate": 0.0,
        "risk_level_exact_match_rate": 0.0,
        "send_eligible_exact_match_rate": 0.0,
        "outreach_status_exact_match_rate": 0.0,
        "failures": [],
        "skipped": True,
    }


def _skipped_guardrail_eval(total: int) -> dict:
    return {
        "cases_total": total,
        "cases_passed": 0,
        "regression_pass_rate": 0.0,
        "source_nudge_overflags": 0,
        "by_category": {},
        "failures": [],
        "skipped": True,
    }


def _skipped_aggregate() -> dict:
    return {
        "review_required": None,
        "simulated_sent": None,
        "draft_rejected": None,
        "simulated_send_events": None,
        "failures": [],
        "skipped": True,
    }


def _build_eval_result(
    *,
    failures: list,
    passed: bool,
    source_hash: str,
    merchant_eval: dict,
    guardrail_eval: dict,
    aggregate_pipeline: dict,
    fail_fast_stopped: bool = False,
) -> dict:
    out = {
        "baseline_version": "eval_baseline.v1",
        "task_id": "T-002",
        "eval_run_at": C.RUN_TIMESTAMP,
        "source_csv_sha256": source_hash,
        "passed": passed,
        "merchant_eval": merchant_eval,
        "guardrail_eval": guardrail_eval,
        "aggregate_pipeline": aggregate_pipeline,
        "failures": failures,
    }
    if fail_fast_stopped:
        out["fail_fast_stopped"] = True
    return out


def compare_merchants(golden_merchants: list, pipeline_merchants: list, *, fail_fast: bool = False) -> dict:
    by_id = {m["merchant_id"]: merchant_from_pipeline(m) for m in pipeline_merchants}
    failures = []
    matched = 0
    field_accuracy = {f: {"correct": 0, "total": 0} for f in GOLDEN_MERCHANT_FIELDS}

    blocker_ok = 0
    risk_score_ok = 0
    risk_level_ok = 0
    send_eligible_ok = 0
    outreach_ok = 0
    total = len(golden_merchants)

    for golden in golden_merchants:
        mid = golden["merchant_id"]
        actual = by_id.get(mid)
        if actual is None:
            for field in GOLDEN_MERCHANT_FIELDS:
                field_accuracy[field]["total"] += 1
                failures.append({
                    "merchant_id": mid,
                    "field": field,
                    "expected": golden.get(field),
                    "actual": None,
                })
                if fail_fast:
                    break
            if fail_fast and failures and failures[-1]["merchant_id"] == mid:
                break
            continue

        row_ok = True
        for field in GOLDEN_MERCHANT_FIELDS:
            exp = golden[field]
            act = actual[field]
            if field == "risk_reason_codes":
                exp = normalize_reason_codes(exp)
                act = normalize_reason_codes(act)
            field_accuracy[field]["total"] += 1
            if _field_equal(field, exp, act):
                field_accuracy[field]["correct"] += 1
            else:
                row_ok = False
                failures.append({
                    "merchant_id": mid,
                    "field": field,
                    "expected": exp,
                    "actual": act,
                })
                if fail_fast:
                    break

        if (
            golden["current_blocker_code"] == actual["current_blocker_code"]
            and golden["next_best_action"] == actual["next_best_action"]
        ):
            blocker_ok += 1
        if golden["risk_score"] == actual["risk_score"]:
            risk_score_ok += 1
        if golden["risk_level"] == actual["risk_level"]:
            risk_level_ok += 1
        if golden["send_eligible"] == actual["send_eligible"]:
            send_eligible_ok += 1
        if golden["outreach_status"] == actual["outreach_status"]:
            outreach_ok += 1
        if row_ok:
            matched += 1

    def _rate(n: int) -> float:
        return n / total if total else 0.0

    return {
        "merchants_total": total,
        "merchants_matched": matched,
        "field_accuracy": field_accuracy,
        "blocker_exact_match_rate": _rate(blocker_ok),
        "risk_score_exact_match_rate": _rate(risk_score_ok),
        "risk_level_exact_match_rate": _rate(risk_level_ok),
        "send_eligible_exact_match_rate": _rate(send_eligible_ok),
        "outreach_status_exact_match_rate": _rate(outreach_ok),
        "failures": failures,
    }


def eval_guardrail(cases: list, *, fail_fast: bool = False) -> dict:
    passed = 0
    failures = []
    by_category = {}
    source_nudge_overflags = 0

    for case in cases:
        ok, actual = eval_regression_case(case)
        cat = case.get("category") or case["kind"]
        bucket = by_category.setdefault(cat, {"passed": 0, "failed": 0})
        if ok:
            passed += 1
            bucket["passed"] += 1
        else:
            bucket["failed"] += 1
            failures.append({
                "case_id": case["case_id"],
                "kind": case["kind"],
                "category": cat,
                "expected": case.get("expect_flags") or [],
                "actual": actual,
            })
            if case["kind"] == "source_corpus":
                source_nudge_overflags += 1
            if fail_fast:
                break

    total = len(cases)
    return {
        "cases_total": total,
        "cases_passed": passed,
        "regression_pass_rate": passed / total if total else 0.0,
        "source_nudge_overflags": source_nudge_overflags,
        "by_category": by_category,
        "failures": failures,
    }


def _check_aggregate(pipeline_result: dict, expectations: dict) -> tuple:
    merchants = pipeline_result["merchants"]
    counts = pipeline_result["counts"]
    failures = []

    if len(merchants) != expectations.get("merchant_count", 20):
        failures.append({
            "metric": "merchant_count",
            "expected": expectations["merchant_count"],
            "actual": len(merchants),
        })

    high_risk = sum(1 for m in merchants if m["risk_level"] == "High")
    if high_risk != expectations.get("high_risk_count"):
        failures.append({
            "metric": "high_risk_count",
            "expected": expectations["high_risk_count"],
            "actual": high_risk,
        })

    if counts["review_required"] != expectations.get("review_queue_count"):
        failures.append({
            "metric": "review_queue_count",
            "expected": expectations["review_queue_count"],
            "actual": counts["review_required"],
        })

    if counts["simulated_sent"] != expectations.get("simulated_sent_count"):
        failures.append({
            "metric": "simulated_sent_count",
            "expected": expectations["simulated_sent_count"],
            "actual": counts["simulated_sent"],
        })

    if counts["draft_rejected"] != expectations.get("draft_rejected_count", 0):
        failures.append({
            "metric": "draft_rejected_count",
            "expected": expectations.get("draft_rejected_count", 0),
            "actual": counts["draft_rejected"],
        })

    expected_send_events = expectations.get("simulated_send_events_count")
    if expected_send_events is not None:
        if counts["simulated_send_events"] != expected_send_events:
            failures.append({
                "metric": "simulated_send_events",
                "expected": expected_send_events,
                "actual": counts["simulated_send_events"],
            })

    if expectations.get("review_required_high_only"):
        for m in merchants:
            if m["review_required"] and m["review_reason"] != "high_risk":
                failures.append({
                    "metric": "review_required_high_only",
                    "merchant_id": m["merchant_id"],
                    "review_reason": m["review_reason"],
                })
                break

    aggregate_pipeline = {
        "review_required": counts["review_required"],
        "simulated_sent": counts["simulated_sent"],
        "draft_rejected": counts["draft_rejected"],
        "simulated_send_events": counts["simulated_send_events"],
        "failures": failures,
    }
    return aggregate_pipeline, len(failures) == 0


def run_eval(
    *,
    source_path=None,
    out_dir=None,
    golden_path=None,
    regression_path=None,
    approvals=None,
    fail_fast=False,
) -> dict:
    source_path = Path(source_path or C.SOURCE_CSV)
    golden_path = Path(golden_path or DEFAULT_GOLDEN)
    regression_path = Path(regression_path or DEFAULT_REGRESSION)

    temp_out = out_dir is None
    if temp_out:
        out_dir = Path(tempfile.mkdtemp())
    else:
        out_dir = Path(out_dir)

    golden = load_json(golden_path)
    regression = load_json(regression_path)
    cases = regression["cases"]
    merchant_total = len(golden.get("merchants") or [])
    guardrail_total = len(cases)

    failures = []
    failures.extend(
        {"scope": "golden_metadata", **f} for f in validate_golden_metadata(golden, source_path)
    )
    failures.extend(
        {"scope": "regression_corpus", **f} for f in validate_regression_corpus(regression)
    )
    source_hash = sha256_file(source_path)

    if fail_fast and failures:
        return _build_eval_result(
            failures=failures,
            passed=False,
            source_hash=source_hash,
            merchant_eval=_skipped_merchant_eval(merchant_total),
            guardrail_eval=_skipped_guardrail_eval(guardrail_total),
            aggregate_pipeline=_skipped_aggregate(),
            fail_fast_stopped=True,
        )

    pipeline_result = P.run_pipeline(source_path, out_dir, approvals=approvals)

    merchant_eval = compare_merchants(
        golden["merchants"],
        pipeline_result["merchants"],
        fail_fast=fail_fast,
    )
    merchant_failures = [
        {"scope": "merchant", **f} for f in merchant_eval.pop("failures")
    ]
    failures.extend(merchant_failures)

    if fail_fast and merchant_failures:
        return _build_eval_result(
            failures=failures,
            passed=False,
            source_hash=source_hash,
            merchant_eval=merchant_eval,
            guardrail_eval=_skipped_guardrail_eval(guardrail_total),
            aggregate_pipeline=_skipped_aggregate(),
            fail_fast_stopped=True,
        )

    guardrail_eval = eval_guardrail(cases, fail_fast=fail_fast)
    guardrail_failures = [
        {"scope": "guardrail", **f} for f in guardrail_eval.pop("failures")
    ]
    failures.extend(guardrail_failures)

    if fail_fast and guardrail_failures:
        aggregate_pipeline, _ = _check_aggregate(
            pipeline_result, golden.get("aggregate_expectations", {}),
        )
        return _build_eval_result(
            failures=failures,
            passed=False,
            source_hash=source_hash,
            merchant_eval=merchant_eval,
            guardrail_eval=guardrail_eval,
            aggregate_pipeline=aggregate_pipeline,
            fail_fast_stopped=True,
        )

    aggregate_pipeline, agg_ok = _check_aggregate(
        pipeline_result, golden.get("aggregate_expectations", {}),
    )
    failures.extend(
        {"scope": "aggregate", **f} for f in aggregate_pipeline.get("failures", [])
    )

    merchants_pass = merchant_eval["merchants_matched"] == merchant_eval["merchants_total"]
    guardrail_pass = (
        guardrail_eval["regression_pass_rate"] == 1.0
        and guardrail_eval["source_nudge_overflags"] == 0
    )
    metadata_ok = not any(
        f.get("scope") in ("golden_metadata", "regression_corpus") for f in failures
    )
    passed = merchants_pass and guardrail_pass and agg_ok and metadata_ok

    return _build_eval_result(
        failures=failures,
        passed=passed,
        source_hash=source_hash,
        merchant_eval=merchant_eval,
        guardrail_eval=guardrail_eval,
        aggregate_pipeline=aggregate_pipeline,
    )


def _print_summary(baseline: dict) -> None:
    me = baseline["merchant_eval"]
    ge = baseline["guardrail_eval"]
    status = "PASS" if baseline["passed"] else "FAIL"
    print(
        f"MERCHANT {me['merchants_matched']}/{me['merchants_total']} | "
        f"GUARDRAIL {ge['cases_passed']}/{ge['cases_total']} | {status}"
    )
    if not baseline["passed"]:
        for f in baseline["failures"][:5]:
            print(f"  - {f}")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="T-002 offline eval harness")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Pipeline output directory (default: fresh temp dir)",
    )
    parser.add_argument(
        "--baseline-path",
        type=Path,
        default=DEFAULT_BASELINE,
        help="Where to write eval_baseline.v1.json",
    )
    parser.add_argument(
        "--golden-path",
        type=Path,
        default=DEFAULT_GOLDEN,
        help="Golden merchants fixture",
    )
    parser.add_argument(
        "--regression-path",
        type=Path,
        default=DEFAULT_REGRESSION,
        help="Guardrail regression corpus",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop after first failure; skip remaining checks (still writes baseline + summary)",
    )
    args = parser.parse_args(argv)

    baseline = run_eval(
        out_dir=args.out_dir,
        golden_path=args.golden_path,
        regression_path=args.regression_path,
        fail_fast=args.fail_fast,
    )

    args.baseline_path.parent.mkdir(parents=True, exist_ok=True)
    with open(args.baseline_path, "w", encoding="utf-8") as fh:
        json.dump(baseline, fh, indent=2, sort_keys=True)
        fh.write("\n")

    _print_summary(baseline)
    if args.fail_fast and (baseline["failures"] or not baseline["passed"]):
        return 1
    return 0 if baseline["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
