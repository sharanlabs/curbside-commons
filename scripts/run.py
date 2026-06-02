"""Canonical entry point for the T-001 offline thin slice.

Run from the repo root:
  python3 scripts/run.py            # preserve audit history (idempotent re-runs)
  python3 scripts/run.py --fresh    # explicit: start a clean out/ (drops history)

By default this does NOT delete the append-only logs, so re-running the documented
command emits `skipped_duplicate` instead of fresh duplicate `simulated_send` rows
(the send-idempotency control holds through the app path). Use --fresh to reset.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import config as C  # noqa: E402
from scripts.pipeline import run_pipeline  # noqa: E402


def main(out_dir=None, approvals=None, fresh=False):
    out = Path(out_dir) if out_dir else C.DEFAULT_OUT_DIR
    out.mkdir(parents=True, exist_ok=True)

    if fresh:
        # Explicit, non-default: reset the artifact (also clears audit history).
        for name in ("merchants_v1.csv", "model_runs.csv", "audit_log.csv", "review_queue.csv"):
            p = out / name
            if p.exists():
                p.unlink()

    result = run_pipeline(C.SOURCE_CSV, out, approvals=approvals)
    c = result["counts"]
    print("ActivationOps AI - T-001 offline thin slice (dummy data, no integrations)")
    print(f"  mode:               {'fresh' if fresh else 'preserve-history'}")
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
    main(fresh="--fresh" in sys.argv[1:])
