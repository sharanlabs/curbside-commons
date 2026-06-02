"""Acceptance tests T1-T18 for the T-001 offline thin slice.

Each test maps to a row in docs/v1-slice-plan.md. Tests write to temp dirs and
never touch the source CSV. Standard-library unittest only (no third-party deps).

Run from the repo root:  python -m unittest tests.test_t001 -v
"""

import csv
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO))

from scripts import config as C  # noqa: E402
from scripts import pipeline as P  # noqa: E402
from scripts import run as R  # noqa: E402
from scripts.guardrail import run_guardrail, scan_text  # noqa: E402

FIXTURES = Path(__file__).resolve().parent / "fixtures"


def _sha256(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _read_csv(path) -> list:
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def _run(approvals=None):
    """Run the pipeline into a fresh temp dir; return (out_dir, result)."""
    out = Path(tempfile.mkdtemp())
    result = P.run_pipeline(C.SOURCE_CSV, out, approvals=approvals)
    return out, result


def _load_approvals():
    rows = _read_csv(FIXTURES / "approvals.csv")
    return {r["merchant_id"]: r["approval"] for r in rows}


def _source_nudges() -> list:
    """Column 7 (0-indexed) of the source CSV = the AI Nudge Message."""
    with open(C.SOURCE_CSV, newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    return [r[7] for r in rows[1:]]


class T001(unittest.TestCase):

    # T1
    def test_t01_source_unchanged(self):
        before = _sha256(C.SOURCE_CSV)
        _run()
        self.assertEqual(before, _sha256(C.SOURCE_CSV), "source CSV must be byte-identical after a run")

    # T2
    def test_t02_header_normalized(self):
        out, _ = _run()
        header = _read_csv(out / "merchants_v1.csv")[0].keys()
        self.assertIn("merchant_name", header)
        self.assertIn("merchant_category", header)
        self.assertNotIn("Merchant Name", header)
        self.assertEqual(len(set(header)), len(list(header)), "no duplicate column names")

    # T3
    def test_t03_unique_ids(self):
        _, res = _run()
        ids = [m["merchant_id"] for m in res["merchants"]]
        self.assertEqual(len(ids), 20)
        self.assertEqual(len(set(ids)), 20)
        for mid in ids:
            self.assertRegex(mid, r"^M\d{3}$")

    # T4 (genuine: formula is over-determined by 20 rows)
    def test_t04_risk_score_equals_source(self):
        _, res = _run()
        for m in res["merchants"]:
            self.assertEqual(
                m["risk_score"], m["_source_risk_score"],
                f"{m['merchant_id']}: recomputed risk_score must equal source",
            )

    # T5 (consistency only - NOT a thresholds-correctness claim)
    def test_t05_threshold_consistency(self):
        _, res = _run()
        for m in res["merchants"]:
            self.assertEqual(
                C.classify_risk_level(m["risk_score"]), m["risk_level"],
                f"{m['merchant_id']}: thresholds.v1 must not contradict the carried source label",
            )

    # T6
    def test_t06_timestamps_derive(self):
        _, res = _run()
        for m in res["merchants"]:
            self.assertEqual(m["signup_at"], P.date_minus_days(C.AS_OF_DATE, m["days_since_signup"]))
            self.assertEqual(m["last_login_at"], P.date_minus_days(C.AS_OF_DATE, m["last_login_days_ago"]))
            self.assertGreaterEqual(m["last_login_at"], m["signup_at"])

    # T7
    def test_t07_blocker_mapping(self):
        _, res = _run()
        for m in res["merchants"]:
            self.assertEqual(
                (m["current_blocker_code"], m["next_best_action"]),
                C.STEP_MAP[m["steps_completed"]],
            )

    # T8
    def test_t08_review_queue(self):
        _, res = _run()
        queue = res["review_queue"]
        highs = [m for m in res["merchants"] if m["risk_level"] == "High"]
        self.assertEqual(len(highs), 8)
        # product data has no ineligible contacts, so the queue == the High set
        self.assertEqual({m["merchant_id"] for m in queue}, {m["merchant_id"] for m in highs})
        for m in queue:
            self.assertTrue(m["review_required"])
            self.assertFalse(m["send_eligible"], "review-required merchants are not send-eligible without approval")

    # T9
    def test_t09_draft_schema(self):
        _, res = _run()
        for m in res["merchants"]:
            draft = P.make_draft(m)
            self.assertEqual(P.validate_draft(draft), [], f"{m['merchant_id']}: draft must satisfy draft.v1 schema")
            self.assertIn(draft["next_best_action"], P.NEXT_ACTIONS)

    # T10
    def test_t10_guardrail_planted_vs_clean(self):
        _, res = _run()
        m = res["merchants"][0]
        clean = P.make_draft(m)
        self.assertEqual(run_guardrail(clean, m), [], "clean stub draft must pass")
        bad = P.make_draft(m)
        bad["draft_body"] = "We guarantee you will earn $1000 more per week."
        self.assertIn("forbidden_revenue_claim", run_guardrail(bad, m))

    # T11 (over-flagging check on real text)
    def test_t11_no_overflag_on_source_nudges(self):
        for nudge in _source_nudges():
            flags = scan_text(nudge)
            self.assertEqual(flags, [], f"source nudge wrongly flagged {flags}: {nudge[:70]}...")

    # T12
    def test_t12_draft_state_consistency(self):
        _, res = _run()
        for m in res["merchants"]:
            draft = P.make_draft(m)
            self.assertEqual(draft["next_best_action"], m["next_best_action"])
            self.assertIn(m["current_blocker_code"], draft["blocker_summary"])
            self.assertNotIn("state_mismatch", run_guardrail(draft, m))

    # T13 (idempotent simulated send across runs, append-only audit_log)
    def test_t13_idempotent_send(self):
        out = Path(tempfile.mkdtemp())
        r1 = P.run_pipeline(C.SOURCE_CSV, out)
        r2 = P.run_pipeline(C.SOURCE_CSV, out)
        n = r1["counts"]["simulated_send_events"]
        self.assertGreater(n, 0)
        self.assertEqual(r2["counts"]["simulated_send_events"], 0, "second run must send nothing new")
        self.assertEqual(r2["counts"]["skipped_duplicate_events"], n, "second run skips every prior send")
        audit = _read_csv(out / "audit_log.csv")
        sends = [e for e in audit if e["event_type"] == "simulated_send"]
        self.assertEqual(len(sends), n, "audit_log must hold exactly one simulated_send per merchant")
        keys = [e["idempotency_key"] for e in sends]
        self.assertEqual(len(keys), len(set(keys)), "idempotency keys are unique per send")

    # T14 (determinism of the snapshot)
    def test_t14_determinism(self):
        out = Path(tempfile.mkdtemp())
        P.run_pipeline(C.SOURCE_CSV, out)
        a = (out / "merchants_v1.csv").read_text(encoding="utf-8")
        P.run_pipeline(C.SOURCE_CSV, out)
        b = (out / "merchants_v1.csv").read_text(encoding="utf-8")
        self.assertEqual(a, b, "merchants_v1.csv must be identical across runs")

    # T15 (eligibility routing via fixture - not product data)
    def test_t15_eligibility_routing_fixture(self):
        for fx in _read_csv(FIXTURES / "ineligible_contacts.csv"):
            eligible = P.compute_contact_eligible(
                fx["contact_email"], fx["email_opt_in_status"], fx["suppression_reason"]
            )
            self.assertFalse(eligible, f"{fx['fixture_id']} should be contact-ineligible")
            review_required, _ = P.compute_review("Low", eligible)  # even Low risk -> review
            self.assertTrue(review_required)
            approval_state = P.compute_approval_state(review_required, None)
            self.assertFalse(
                P.compute_send_eligible(eligible, review_required, approval_state),
                f"{fx['fixture_id']} must not be send-eligible",
            )

    # T16
    def test_t16_dictionary_validation(self):
        out, res = _run()
        for m in res["merchants"]:
            self.assertEqual(P.validate_merchant_row(m), [], f"{m['merchant_id']} must validate")
        # also validate the written CSV rows parse with the expected columns
        rows = _read_csv(out / "merchants_v1.csv")
        self.assertEqual(len(rows), 20)
        self.assertEqual(list(rows[0].keys()), C.MERCHANT_COLUMNS)

    # T17 (the send gate - the control this slice exists to prove)
    def test_t17_send_gate(self):
        # (a) no approvals: no High/review-required merchant is sent
        _, res = _run(approvals=None)
        for m in res["merchants"]:
            if m["review_required"]:
                self.assertNotEqual(
                    m["outreach_status"], "simulated_sent",
                    f"{m['merchant_id']} review-required must NOT be auto-sent",
                )
        sent = [m for m in res["merchants"] if m["outreach_status"] == "simulated_sent"]
        self.assertEqual(len(sent), 12, "only the 12 non-review, contact-eligible merchants send")

        # (b) with a synthetic approval, exactly that High merchant becomes sent
        approvals = _load_approvals()  # approves M006
        _, res2 = _run(approvals=approvals)
        by_id = {m["merchant_id"]: m for m in res2["merchants"]}
        self.assertEqual(by_id["M006"]["approval_state"], "approved")
        self.assertTrue(by_id["M006"]["send_eligible"])
        self.assertEqual(by_id["M006"]["outreach_status"], "simulated_sent")
        # other High merchants remain held
        for mid, m in by_id.items():
            if m["risk_level"] == "High" and mid != "M006":
                self.assertEqual(m["outreach_status"], "drafted")
                self.assertEqual(m["approval_state"], "pending_review")
        self.assertEqual(res2["counts"]["simulated_sent"], 13)

    # T18 (guardrail under-flag coverage: one fixture per category)
    def test_t18_guardrail_underflag_coverage(self):
        cases = json.loads((FIXTURES / "guardrail_cases.json").read_text(encoding="utf-8"))
        _, res = _run()
        m = res["merchants"][0]
        for category, text in cases.items():
            if category.startswith("_"):
                continue
            draft = P.make_draft(m)
            draft["draft_body"] = text
            flags = run_guardrail(draft, m)
            self.assertIn(category, flags, f"category {category} not flagged for: {text}")
        # state_mismatch is structural: a draft recommending the wrong action
        mismatch = P.make_draft(m)
        wrong = next(a for a in P.NEXT_ACTIONS if a != m["next_best_action"])
        mismatch["next_best_action"] = wrong
        self.assertIn("state_mismatch", run_guardrail(mismatch, m))

    # ----- Codex P2 fix coverage (added 2026-06-02) -----

    # P2-1: the documented app command (scripts/run.py) preserves audit history,
    # so a re-run dedups instead of re-sending; --fresh is an explicit reset.
    def test_p2_1_app_command_preserves_idempotency(self):
        tmp = Path(tempfile.mkdtemp())
        r1 = R.main(out_dir=tmp)                 # default = preserve history
        r2 = R.main(out_dir=tmp)                 # second documented run
        n = r1["counts"]["simulated_send_events"]
        self.assertGreater(n, 0)
        self.assertEqual(r2["counts"]["simulated_send_events"], 0, "app re-run must not re-send")
        self.assertEqual(r2["counts"]["skipped_duplicate_events"], n)
        sends = [e for e in _read_csv(tmp / "audit_log.csv") if e["event_type"] == "simulated_send"]
        self.assertEqual(len(sends), n, "audit_log keeps exactly one simulated_send per merchant")
        r3 = R.main(out_dir=tmp, fresh=True)     # explicit reset re-sends
        self.assertEqual(r3["counts"]["simulated_send_events"], n)

    # P2-2: integer fields reject genuinely fractional values (fail fast).
    def test_p2_2_reject_fractional(self):
        self.assertEqual(P.parse_int("3.00"), 3)
        self.assertEqual(P.parse_int("5"), 5)
        for bad in ("3.50", "2.9"):
            with self.assertRaises(ValueError):
                P.parse_int(bad)
        # end-to-end: a malformed source row makes the pipeline fail fast
        tmp = Path(tempfile.mkdtemp())
        bad_csv = tmp / "bad.csv"
        bad_csv.write_text(
            "Merchant Name,Merchant Name,Days Since Signup,Steps Completed,"
            "Last Login (days ago),Risk Score,Risk Level,AI Nudge Message,Estimated Time Saved (min)\n"
            "Test Cafe,Restaurant,3.00,2.50,2.00,42.00,Low Risk,hi,15\n",
            encoding="utf-8",
        )
        with self.assertRaises(ValueError):
            P.run_pipeline(bad_csv, tmp / "out")

    # P2-3: appended model_runs.csv IDs stay unique across repeated runs.
    def test_p2_3_unique_model_run_ids(self):
        tmp = Path(tempfile.mkdtemp())
        P.run_pipeline(C.SOURCE_CSV, tmp)
        P.run_pipeline(C.SOURCE_CSV, tmp)
        ids = [r["model_run_id"] for r in _read_csv(tmp / "model_runs.csv")]
        self.assertEqual(len(ids), 40)
        self.assertEqual(len(set(ids)), 40, "model_run_id must be unique across appended runs")

    # P2-4: prose claiming a not-yet-completed step is done is flagged, even when
    # next_best_action is correct.
    def test_p2_4_state_mismatch_prose(self):
        _, res = _run()
        m = next(x for x in res["merchants"] if x["steps_completed"] == 2)  # steps 3/4 not done
        cases = json.loads((FIXTURES / "guardrail_cases.json").read_text(encoding="utf-8"))
        draft = P.make_draft(m)
        self.assertEqual(draft["next_best_action"], m["next_best_action"])  # action still correct
        draft["draft_body"] = cases["_state_mismatch_prose_body"]            # but prose lies
        self.assertIn("state_mismatch", run_guardrail(draft, m))

    # P2-A (final review): verb-before-step false completion is also flagged,
    # while imperative TODO phrasing ("add photos"/"set your hours") is not.
    def test_p2_5_state_mismatch_verb_first(self):
        _, res = _run()
        m = next(x for x in res["merchants"] if x["steps_completed"] == 2)  # steps 3+ not done
        cases = json.loads((FIXTURES / "guardrail_cases.json").read_text(encoding="utf-8"))
        draft = P.make_draft(m)
        self.assertEqual(draft["next_best_action"], m["next_best_action"])   # action still correct
        draft["draft_body"] = cases["_state_mismatch_verb_first_body"]        # "we've added your photos..."
        self.assertIn("state_mismatch", run_guardrail(draft, m))
        # negative control: the clean stub draft (TODO phrasing) must NOT be flagged
        self.assertEqual(run_guardrail(P.make_draft(m), m), [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
