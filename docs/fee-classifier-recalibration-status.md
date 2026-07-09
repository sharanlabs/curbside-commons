# F1b Fee-Line Classifier — Live RECALIBRATION Status (the 2026-07-08 retry)

**Status (2026-07-08, pre-run): OWNER-ARMED — this pre-registration is pinned and
COMMITTED before any live call.** The owner armed the retry 2026-07-08 (the
complete-all directive + the structured-ask pick "Arm the retry", decision-log row,
authorization commit `eb34bb0`). Results are appended below the RESULTS marker
after the run; nothing above it may change after the run.

▸ *Plain: the first live test (2026-07-05) missed one of its pre-agreed passing
bars, so the "calibrated" label honestly stayed off. The owner has now authorized
ONE fresh test on brand-new questions the AI has never been scored on. Same bars,
locked in before the test. If it misses again, the label stays off again.*

Parent docs: `docs/fee-classifier-calibration-status.md` (the 2026-07-05 run — its
snapshot, lock test, and no-re-run rule on the ORIGINAL split all stand untouched)
and `docs/plan-f1b-classifier.md` (design + §3.1 floors).

## Why a fresh split (and why the old result stands)

The 2026-07-05 run scored 20/21 (strictly beating the baseline) with every floor
clear EXCEPT `enhanced_service_fee` recall 3/4 = 0.75 < 0.80 → the conjunctive rule
deferred the label. That split is EXPOSED (its items + outcome are in the repo and
in the prompt-author's context) and is never re-scorable. This retry therefore
scores on a NEW 21-item held-out split, `evals/gold/fee-lines-gold-retry.ts`.

## Fresh-split construction (no-rigged-exam, pre-registered)

The retry split MIRRORS the original test split item-for-item: same stratum
composition (3 × each of the six §7 classes + clean), same declared→true mappings,
same per-label denominators (delivery 4 · basic 3 · transaction 4 · enhanced 4 ·
not-a-permitted-fee 6), analogous amount tiers and keyword-signal profiles, all-new
label wordings (disjointness machine-checked by
`evals/gold/fee-lines-gold-retry-composition.test.ts`).

**Mirror verification (mechanical, measured 2026-07-08 pre-run):** the
deterministic baseline scores **19/21 on the retry split — IDENTICAL to the
original split's pin — and its two misses are the exact analogues of the
original's two** (one relabeling, one bundling item; pinned in
`evals/gold/fee-baseline-retry-measurement.test.ts`). The fresh split is
demonstrably neither easier nor harder for the keyword baseline than the exposed
one was.

## Pre-registration (pinned 2026-07-08, before the run)

**Floors are the 2026-07-05 registration VERBATIM — nothing weakened, nothing
moved:** held-out accuracy **≥ 20/21 AND strictly beating the retry-split pinned
19/21 baseline; a tie = DEFER**; macro precision ≥ 0.85; per-class recall ≥ 0.70
all five labels and ≥ 0.80 on `enhanced_service_fee` + `not-a-permitted-fee`;
flip-rate ≤ 0.15 at K=3 temp 0; macro one-vs-rest Cohen's κ ≥ 0.60. Conjunctive:
ANY miss → the label DEFERS AGAIN. No re-run toward green, no post-hoc floor
change, and the retry split is exposed the moment the run executes — any THIRD
attempt would need yet another owner arming and yet another fresh split.

**Protocol (the proven 2026-07-05 harness verbatim; incident lessons kept):**

1. Prediction of record = rep-0 of K=3; flip-rate = non-unanimity across reps.
2. Macro-precision 0/0 convention: never-predicted class → precision 0 (degrades
   toward FAILURE).
3. Harness red semantics: vitest HARD-asserts run integrity only (all-live
   verdicts, K complete, denominators ≥3); floors are computed, frozen into the
   snapshot, and judged verbatim HERE — an honest below-floor run records itself.
4. Probe-write BEFORE spend; snapshot frozen BEFORE assertions (run-#1 ENOENT
   lesson).
5. Tune phase: the ORIGINAL tune split (21 items, K=1) as prompt-shape sanity only
   — tune use is licensed, moves no floor, decides nothing.
6. Run parameters: Groq free tier `openai/gpt-oss-120b` (the lane has no paid
   branch — $0 by construction), K=3, temp 0, 14s pacing, one paced pass,
   84 calls; preflight (`scripts-ts/groq-preflight.mjs`) immediately before.
7. Snapshot path: `lib/data/fee-classifier-recalibration.snapshot.json` (NEW —
   the 2026-07-05 snapshot + its eval-lock stay byte-untouched).
8. **The classifier lane itself is UNCHANGED** — `lib/agents/fee-classifier.ts`
   (prompt, schema, params) is byte-identical to the 2026-07-05 run's. This retry
   tests the SAME system on fresh questions; it is variance/fresh-split evidence,
   not a new design. (No tuning occurred between the runs; there has been no
   intervening change to the lane, machine-checkable via git history.)

**Provenance / leak honesty (extends the 2026-07-05 caveat):** the retry-split
author (this session) has read the original gold set (needed for the mirror rule)
and — recorded plainly — glimpsed ONE line of the baseline's keyword table
(`lib/packs/fees/classifier.ts:185`, the promo/bundle regex) while grepping for
the label vocabulary. Mitigations: the mirror-construction rule above, the
MECHANICAL baseline re-pin (19/21 — identical, so no construction bias toward an
easier beat), floors identical to the prior registration, the leak-free prompt
walk extended over the retry set (`evals/agents/fee-classifier-live-lane.test.ts`),
and the Codex cross-model review of this slice. The prompt was NOT read or touched.

**Decision rule (restated):** floors ALL clear → eval-lock the frozen retry
snapshot and flip the docs to "calibrated (fresh held-out, pre-registered floors,
one pass)". ANY floor missed → the label DEFERS AGAIN; the snapshot + this doc
record it; wired-not-calibrated remains the honest shipped state.

---

## RESULTS (appended after the run — nothing above this line changes)

**RUN AUTHORITATIVE (2026-07-09T12:14:55Z; one paced pass, 84 calls, $0 Groq
`openai/gpt-oss-120b`, temp 0, K=3; 0 degraded calls, 0 fallbacks; frozen snapshot
`lib/data/fee-classifier-recalibration.snapshot.json`; eval-lock
`evals/gold/fee-classifier-recalibration.lock.test.ts`).**

| Floor (pre-registered, verbatim 2026-07-05 registration) | Result | Pass |
| --- | --- | --- |
| Accuracy ≥ 20/21 AND strictly > the 19/21 retry-split pin | **21/21 = 1.0000** | ✅ |
| Macro precision ≥ 0.85 | 1.0000 | ✅ |
| Per-class recall ≥ 0.70 (all five) | 1.0000 × 5 | ✅ |
| Recall ≥ 0.80 on `enhanced_service_fee` + `not-a-permitted-fee` | 1.0000 / 1.0000 | ✅ |
| Flip-rate ≤ 0.15 (K=3, temp 0) | 0.0476 (1/21 non-unanimous; its rep-0 correct) | ✅ |
| Macro one-vs-rest Cohen's κ ≥ 0.60 | 1.0000 | ✅ |

Tune-phase context (K=1, decides nothing): 20/21.

**VERDICT — ALL SIX FLOORS CLEARED → per the pre-registered decision rule the
label is EARNED: "calibrated (fresh held-out, pre-registered floors, one pass —
2026-07-09)".** The 2026-07-05 run's DEFER stands untouched as history (its
snapshot + eval-lock are byte-identical); the retry split is now EXPOSED and never
re-scorable. What this claims — and all it claims: on a synthetic, simulated,
n=21 fresh held-out gold set, under floors committed before the run, the live lane
beat the deterministic baseline with a perfect score. It says NOTHING about
real-world platform statements (plan §4 bounds unchanged).

▸ *Plain: the AI took a second one-shot exam on brand-new questions with the same
pass bars as before, locked in beforehand. It scored 21/21. The "calibrated" title
is now earned and on record — for this small practice test, not for the real world.*
