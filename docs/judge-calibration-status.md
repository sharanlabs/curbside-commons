# Semantic Judge — P3 Calibration Status

**Status (2026-06-25): the clean calibration run RAN ($0, cross-family Groq `gpt-oss-120b`). The HELD-OUT (test) split CLEARED the pre-registered bar.** The result is **DIRECTIONAL** (held-out n=15, ~30-item gold set) — the "built + calibrated, metrics = X" claim still waits for **P4** (eval-lock + Codex gate) and the **~100+ validation floor** (R-HON-1/3).

## The run (2026-06-25)

- Live cross-family judge: Groq `openai/gpt-oss-120b`, strict structured outputs, `reasoningEffort:"low"`, temp 0, **K=3 reps/item over the 30-item gold set**. **$0** (free tier). Snapshot: `lib/data/judge-calibration.snapshot.json`.
- **Pre-registered pass/fail bar (pinned BEFORE reading numbers, on the held-out test split — R-CAL-7):** recall **≥ 0.78**, precision **≥ 0.70** (reported), Cohen's κ **≥ 0.60** (raw agreement ≥ 0.80), test-retest flip-rate **≤ 0.10**.

## Metrics (gatekeeper-passing subset, R-CAL-1)

| Split | n | Recall | Precision | F1 | Matrix (tp/fp/tn/fn) |
|---|---|---|---|---|---|
| **Held-out (test) — THE bar** | 15 | **1.000** (CI95 0.70–1.0) | **1.000** | 1.000 | 9 / 0 / 6 / 0 |
| Tune | 13 | 0.714 | 0.833 | 0.769 | 5 / 1 / 5 / 2 |
| Overall | 28 | 0.875 | 0.933 | 0.903 | 14 / 1 / 11 / 2 |

- Cohen's κ (judge vs gold, passing subset): **0.784** (substantial; raw agreement 0.893).
- Test-retest flip-rate (K=3): **0.071**.

**Verdict: the held-out split CLEARS all four pre-registered thresholds** — recall 1.0 ≥ 0.78; precision 1.0 ≥ 0.70; κ 0.78 ≥ 0.60 (agreement 0.89 ≥ 0.80); flip 0.071 ≤ 0.10. The held-out split was committed in the gold set before the run (not chosen after), so this is honest pre-registration, not goalpost-moving.

## Honest caveats (NOT buried)

1. **The live runner reported FAIL on an over-strict assertion — fixed (test-harness bug, NOT a judge change).** Line 168 asserted *every* gatekeeper-passing item carries ≥1 claim, but **clean drafts legitimately return 0 unsupported claims** (`C-mock-2/3`, `C-mock-grocery`, …) and 2 flippy tune-split positives returned a clean rep-0. Corrected to the real plumbing invariant: a draft the judge **flags** must carry its claim breakdown (clean drafts may have 0); quality thresholds stay eval-locked at P4 on the FROZEN report (R-HON-2/3). **Verified against the recorded snapshot — NOT re-run** (the shared 200K/day Groq window is not re-burned).
2. **The tune split is weaker** (recall 0.714, precision 0.833): 2 false-negatives the judge flips on at temp 0 (`P-timeline-3` "wraps up early next week"-class; `P-specific-3`) and 1 debatable false-positive (`C-live-sunset`'s "listed on Curbside Commons" — the platform-grounding edge). **Real, bounded failure modes — do not overclaim a "perfect judge."**
3. **Small n** (held-out 15; gold 30) → **DIRECTIONAL** (R-HON-1). The ~100+ floor is the eventual validation target; **no "calibrated, metrics = X" public claim before P4 + the Codex gate** (R-HON-3).

## Effect on the build

- **AM-1 satisfied:** P3 completed and cleared the held-out bar → **A2's LIVE self-correction milestone (R-LOOP-10) is UNBLOCKED.** R-LOOP-10 operates on exactly the 9 held-out planted positives, **all of which the judge caught** (recall 1.0 there) — a strong catcher for the loop.
- **Remaining judge work (P4 — deferred, owner/Codex-gated):** eval-lock the bar against the FROZEN snapshot (offline regression, R-HON-2 — assert the fixture, never a live re-run); the Codex cross-model gate on the calibration honesty; only then flip the docs from "designed boundary" → "built + calibrated, metrics = X"; grow toward the ~100+ floor. The 3 SHOWABLE surfaces (R-DEMO-2/3/4) render the recorded fixture at $0.

## How to re-run (P4 / fresh window only — do NOT re-burn the window casually)

```
node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts
```
~30K of the 200K/day shared Groq window; auto-skips offline (`npm test` does not load `.env`).
