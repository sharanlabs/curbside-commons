"""Canonical entry point for the T-001 offline thin slice.

Produces a clean out/ from one deterministic run (append-only logs start fresh).
Run from the repo root:  python scripts/run.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import config as C  # noqa: E402
from scripts.pipeline import run_pipeline  # noqa: E402


def main(approvals=None):
    out = C.DEFAULT_OUT_DIR
    out.mkdir(parents=True, exist_ok=True)
    # Start the canonical run clean so the committed artifact is from one run.
    for name in ("merchants_v1.csv", "model_runs.csv", "audit_log.csv", "review_queue.csv"):
        p = out / name
        if p.exists():
            p.unlink()

    result = run_pipeline(C.SOURCE_CSV, out, approvals=approvals)
    c = result["counts"]
    print("ActivationOps AI - T-001 offline thin slice (dummy data, no integrations)")
    print(f"  merchants:          {c['total']}")
    print(f"  review queue:       {c['review_required']}")
    print(f"  drafted (held):     {c['drafted']}")
    print(f"  draft_rejected:     {c['draft_rejected']}")
    print(f"  simulated_sent:     {c['simulated_sent']}")
    print(f"  simulated_send ev:  {c['simulated_send_events']}")
    print(f"  skipped_duplicate:  {c['skipped_duplicate_events']}")
    print(f"  outputs written to: {out}/")
    return result


if __name__ == "__main__":
    main()
