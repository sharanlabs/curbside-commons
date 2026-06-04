"""Acceptance tests E1–E10 for the T-002 offline eval harness.

Run from repo root:
  python3 -m unittest tests.test_t002 -v
  python3 -m unittest tests.test_t001 tests.test_t002 -v
"""

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO))

from scripts import config as C  # noqa: E402
from scripts import eval as E  # noqa: E402
from scripts import pipeline as P  # noqa: E402

GOLDEN_PATH = REPO / "eval" / "golden_merchants.v1.json"
REGRESSION_PATH = REPO / "eval" / "guardrail_regression.v1.json"
EVAL_SCRIPT = REPO / "scripts" / "eval.py"


def _sha256(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _baseline_comparable(baseline: dict) -> dict:
    out = dict(baseline)
    out.pop("git_head", None)
    return out


class T002(unittest.TestCase):

    # E1
    def test_e01_golden_file_schema(self):
        self.assertTrue(GOLDEN_PATH.is_file())
        golden = E.load_json(GOLDEN_PATH)
        self.assertEqual(golden["eval_version"], "golden_merchants.v1")
        self.assertEqual(len(golden["merchants"]), 20)
        for m in golden["merchants"]:
            for key in E.GOLDEN_MERCHANT_FIELDS:
                self.assertIn(key, m, f"{m['merchant_id']} missing {key}")


    # E1b — regression corpus minimum floors (truncated fixtures cannot pass)
    def test_e01b_regression_corpus_minimum_counts(self):
        regression = E.load_json(REGRESSION_PATH)
        failures = E.validate_regression_corpus(regression)
        self.assertEqual(failures, [], failures)
        cases = regression["cases"]
        by_kind = {}
        for case in cases:
            by_kind[case["kind"]] = by_kind.get(case["kind"], 0) + 1
        self.assertGreaterEqual(len(cases), E.REGRESSION_MIN_COUNTS["cases_total"])
        for kind, minimum in E.REGRESSION_MIN_COUNTS.items():
            if kind == "cases_total":
                continue
            self.assertGreaterEqual(by_kind.get(kind, 0), minimum, kind)

    # E2b — golden metadata matches current config
    def test_e02b_golden_metadata_matches_config(self):
        golden = E.load_json(GOLDEN_PATH)
        failures = E.validate_golden_metadata(golden, C.SOURCE_CSV)
        self.assertEqual(failures, [], failures)

    # E2
    def test_e02_golden_source_hash_matches_live(self):
        golden = E.load_json(GOLDEN_PATH)
        self.assertEqual(golden["source_csv_sha256"], _sha256(C.SOURCE_CSV))

    # E3
    def test_e03_pipeline_matches_golden_merchants(self):
        golden = E.load_json(GOLDEN_PATH)
        out = Path(tempfile.mkdtemp())
        result = P.run_pipeline(C.SOURCE_CSV, out, approvals=None)
        merchant_eval = E.compare_merchants(golden["merchants"], result["merchants"])
        self.assertEqual(merchant_eval["merchants_matched"], 20)
        self.assertEqual(merchant_eval["failures"], [])

    # E4
    def test_e04_aggregate_expectations(self):
        golden = E.load_json(GOLDEN_PATH)
        out = Path(tempfile.mkdtemp())
        result = P.run_pipeline(C.SOURCE_CSV, out, approvals=None)
        agg, ok = E._check_aggregate(result, golden["aggregate_expectations"])
        self.assertTrue(ok, agg.get("failures"))
        self.assertEqual(agg["review_required"], 8)
        self.assertEqual(agg["simulated_sent"], 12)
        self.assertEqual(agg["draft_rejected"], 0)
        self.assertEqual(agg["simulated_send_events"], 12)

    # E5
    def test_e05_all_regression_cases_pass(self):
        regression = E.load_json(REGRESSION_PATH)
        guard = E.eval_guardrail(regression["cases"])
        self.assertEqual(guard["cases_passed"], guard["cases_total"])
        self.assertEqual(guard["regression_pass_rate"], 1.0)
        self.assertEqual(guard["source_nudge_overflags"], 0)
        self.assertEqual(guard["failures"], [])

    # E6
    def test_e06_eval_cli_writes_baseline(self):
        with tempfile.TemporaryDirectory() as tmp:
            baseline_path = Path(tmp) / "eval_baseline.v1.json"
            proc = subprocess.run(
                [
                    sys.executable,
                    str(EVAL_SCRIPT),
                    "--baseline-path",
                    str(baseline_path),
                ],
                cwd=REPO,
                capture_output=True,
                text=True,
            )
            self.assertEqual(proc.returncode, 0, proc.stderr or proc.stdout)
            self.assertTrue(baseline_path.is_file())
            baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
            for key in (
                "baseline_version",
                "task_id",
                "eval_run_at",
                "source_csv_sha256",
                "passed",
                "merchant_eval",
                "guardrail_eval",
                "aggregate_pipeline",
                "failures",
            ):
                self.assertIn(key, baseline)
            self.assertTrue(baseline["passed"])
            self.assertIn("MERCHANT 20/20", proc.stdout)
            self.assertIn("PASS", proc.stdout)

    # E7
    def test_e07_two_eval_runs_identical_baseline(self):
        b1 = E.run_eval()
        b2 = E.run_eval()
        self.assertEqual(_baseline_comparable(b1), _baseline_comparable(b2))

    # E8
    def test_e08_source_csv_unchanged_after_eval(self):
        before = _sha256(C.SOURCE_CSV)
        E.run_eval()
        self.assertEqual(before, _sha256(C.SOURCE_CSV))

    # E9
    def test_e09_golden_risk_scores_match_formula(self):
        golden = E.load_json(GOLDEN_PATH)
        out = Path(tempfile.mkdtemp())
        result = P.run_pipeline(C.SOURCE_CSV, out, approvals=None)
        by_id = {m["merchant_id"]: m for m in result["merchants"]}
        for g in golden["merchants"]:
            m = by_id[g["merchant_id"]]
            expected = P.compute_risk_score(
                m["days_since_signup"],
                m["last_login_days_ago"],
                m["steps_completed"],
            )
            self.assertEqual(g["risk_score"], expected, g["merchant_id"])
            self.assertEqual(m["risk_score"], expected, g["merchant_id"])

    # E10
    def test_e10_regression_has_near_miss_negative(self):
        regression = E.load_json(REGRESSION_PATH)
        negatives = [
            c for c in regression["cases"]
            if c["kind"] == "regex_negative" and c.get("category") == "near_miss"
        ]
        self.assertGreaterEqual(len(negatives), 1)
        for case in negatives:
            passed, actual = E.eval_regression_case(case)
            self.assertTrue(passed, f"{case['case_id']} flagged {actual}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
