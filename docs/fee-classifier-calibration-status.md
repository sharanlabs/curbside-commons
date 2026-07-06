# F1b Fee-Line Classifier — Live Calibration Status

**Status (2026-07-05, pre-run): OWNER-ARMED — the pre-registration below is pinned
BEFORE any live call.** The owner armed the run 2026-07-05 ("all four", decision-log),
after the M2 ceremony accepted the F1 module (gate record
`docs/reviews/gate-2026-07-04-m2-f1-module.md`). Results are appended below the
pre-registration after the run; nothing above the RESULTS marker may change after it.

▸ *Plain: this page locks the grading rules before the AI takes the test, so the
grade can't be argued with afterwards. The owner said GO; the test happens once;
the score gets written here exactly as it lands.*

This is the fee-classifier analogue of `docs/domain-calibration-status.md`
(R-DHON-3 / R-DCAL-7 precedent). The design + floors live in
`docs/plan-f1b-classifier.md`; this doc pins the RUN protocol and records the outcome.

## Pre-registration (pinned 2026-07-05, before the run)

**The floors are `docs/plan-f1b-classifier.md` §3.1 VERBATIM** (including the M2
pre-run amendment: held-out accuracy **≥ 20/21, strictly beating the pinned 19/21
deterministic baseline; a tie = DEFER**; macro precision ≥ 0.85; per-class recall
≥ 0.70 all five labels and ≥ 0.80 on `enhanced_service_fee` +
`not-a-permitted-fee`; flip-rate ≤ 0.15 at K=3 temp 0; macro one-vs-rest Cohen's
κ ≥ 0.60). None of them moves, in either direction.

**Protocol amendments + mechanics, all pinned pre-run** (frontier-advisor consult
2026-07-05 — PROCEED-WITH-CONSTRAINTS, all adopted):

1. **DECISION-RULE TIGHTENING (dated amendment, owner-sourced).** Plan §3.2's ELSE
   branch ("tune the prompt on the tune split and re-run") is SUPERSEDED for this
   arming by the owner's stricter 2026-07-04 arming directive (HANDOFF): **any
   missed floor → the label honestly DEFERS; no same-split re-run toward green; no
   post-hoc floor amendment.** One scored pass decides. This tightens (never
   loosens) the registered rule, and is recorded here BEFORE the run.
2. **Prediction of record = rep-0** of K=3 (the `judge-calibration.live.test.ts`
   precedent). Flip-rate = fraction of items whose 3 reps are not unanimous
   (`multiClassFlipRate`, typed multi-class analogue of the ported `flipRate`;
   unit-tested).
3. **Macro-precision 0/0 convention:** the ported `ratio()` returns 0 on 0/0, so a
   never-predicted class contributes precision 0 — macro precision degrades toward
   FAILURE, never toward a pass. Recorded so it cannot be relitigated post-run.
4. **Harness red semantics (the slice-2 precedent):** vitest HARD-asserts RUN
   INTEGRITY only — every call a real `LIVE_CLASSIFIER` verdict (any
   `FAILED_TO_FALLBACK` fails the run loudly = provider-degraded → diagnostic,
   never enshrined, bail rule), K=3 complete, per-class held-out denominators ≥ 3
   (non-vacuous rule; composition-locked upstream). The FLOORS are computed, frozen
   into the snapshot, and judged VERBATIM here for the label decision — they are
   not vitest assertions, so an honest below-floor run records itself rather than
   masquerading as a code regression.
5. **Tune-split use:** Phase A = the full 21-item TUNE split at K=1, prompt-shape
   sanity ONLY (plan §3.2 licenses tune-split use); reported as context; moves no
   floor, decides nothing. One TPM-window cool-down separates it from the scored
   pass; `groq-preflight` runs immediately before the harness starts.
6. **Prompt provenance (leak honesty):** the live prompt's rubric is authored from
   the codified rule table (`docs/research/uc1-rule-table.md`, §20-563.3(d)) and
   the pre-existing `SEVEN_CLASS_TRUE_CATEGORY_NOTE` mapping ONLY — no
   gold-item-specific wording or pattern. The prompt input is the leak-free
   `ClassifierInput` alone; an offline eval walks the ENTIRE gold set asserting no
   prompt carries the answer-key field, the gold rationale, or the §7 stratum name
   (`evals/agents/fee-classifier-live-lane.test.ts`). Residual caveat, stated
   plainly: the prompt author has read the held-out split (unavoidable in this
   repo); the mitigations are this provenance rule, the tune-only adjustment
   discipline, and the pre-registered floors.
7. **Run parameters:** Groq free tier (`openai/gpt-oss-120b`, live-confirmed
   HTTP 200 by preflight 2026-07-05 — the RULES §6 model-id check), $0 — the lane
   has NO paid branch (`lib/agents/fee-classifier.ts` is Groq-only by
   construction); K=3, temp 0, `reasoningEffort:"low"`, `maxOutputTokens` 1,024,
   strict structured outputs; 14s pacing (~4.3 calls/min × ~1,750 reserved ≈ 7,500
   of the ~8,000 TPM window); ONE paced pass, 84 calls total (21 tune + 63
   scored), ≈ 50K tokens ≪ the ~200K TPD window on a fresh calendar day (no TPD
   header exists — freshness argued from date + zero prior runs today, the honest
   A3-7-lesson statement).
8. **Wired ≠ calibrated.** `LIVE_CLASSIFIER_DESIGN.wired` flipped to `true` with
   the lane's code landing (2026-07-05, pre-run — code reality); the "calibrated"
   label is decided ONLY by this run's outcome. A DEFER outcome ends as: wired,
   env-gated, NOT calibrated — a complete, honest, shippable state (plan §3.5).

**Decision rule (restated):** floors ALL clear → eval-lock the frozen snapshot
(`lib/data/fee-classifier-calibration.snapshot.json` + an offline regression test
that never re-runs live — the R-DHON-4 pattern) and flip the docs to **"calibrated
— directional, n=21 synthetic"** (R-DHON-3 wording; plan §4 bounds what that may
ever claim). ANY floor missed → **the label DEFERS**, this doc records the numbers
as they landed, and the deterministic baseline remains the only measured artifact.

---

## RESULTS (appended after the run — nothing above this line changes post-run)

### Run #1 (2026-07-05, ~09:00–09:22 ET) — RESULTS LOST TO AN OUTPUT-PATH DEFECT (outcome-blind; no number was ever observed)

The first armed pass executed all 84 live calls (~21.5 min, paced as registered)
and **passed every mid-run integrity assertion** (tune phase: 21/21 real
`LIVE_CLASSIFIER` verdicts, zero fallbacks — the assertion that would have
aborted on degradation did not fire). It then FAILED at the final step: the
harness wrote the snapshot to `lib/data/…`, a directory that no longer exists in
the restructured tree (W0 moved it to `legacy/activation/lib/data/`), and
`writeFileSync` threw ENOENT **after the spend and before the metrics line
printed**. The per-item results existed only in memory and are unrecoverable.
**No metric, floor value, or per-item outcome from run #1 was observed by anyone
or any log.**

**Disposition:** outcome-blind infrastructure loss — NOT a floor miss, so the
pre-registered "no same-split re-run toward green" amendment is not implicated
(that rule forbids outcome-driven retries; there was no outcome). Run #2 is an
outcome-blind recovery re-run under the UNCHANGED protocol and floors. Harness
fixes applied first (both now part of the reviewed diff): (1) the snapshot path
is created + probe-written BEFORE any call is spent; (2) the snapshot is frozen
BEFORE the integrity assertions so even a degraded run leaves its diagnostic
record; (3) the snapshot carries an explicit `runIntegrity.degraded` flag.
TPD accounting: run #1 consumed ~50K of the ~200K daily window; run #2 adds
~50K — comfortably within it, re-preflighted immediately before launch.
Lesson routed to `~/claude-os/tasks/lessons.md`: probe the output path before
spending unrecoverable work.

### Run #2 (2026-07-05, 09:24–09:45 ET) — AUTHORITATIVE. VERDICT: **the label DEFERS** (5 of 6 floors cleared; one missed)

**Run integrity: CLEAN** — 21/21 tune (K=1) + 21/21 held-out (K=3) all real
`LIVE_CLASSIFIER` verdicts, **zero fallbacks**, `degraded: false`, vitest exit 0.
Groq `openai/gpt-oss-120b`, temp 0, `reasoningEffort:"low"`, 14s pacing, **$0**.
Frozen record: `lib/data/fee-classifier-calibration.snapshot.json` (eval-locked by
`evals/gold/fee-classifier-calibration.lock.test.ts` — offline, never a live re-run).

**The floors (verbatim from §3.1 as pre-registered; conjunctive):**

| Floor | Result | Pass |
| --- | --- | --- |
| Held-out accuracy ≥ 20/21, strictly > the 19/21 baseline | **20/21 = 0.952** (baseline 19/21 — strictly beaten) | ✅ |
| Macro precision ≥ 0.85 | **0.971** | ✅ |
| Per-class recall ≥ 0.70 (all five) | 1.00 / 1.00 / 1.00 / **0.75** / 1.00 | ✅ |
| Per-class recall ≥ 0.80 on `enhanced_service_fee` + `not-a-permitted-fee` | not-a-permitted-fee **1.00** ✅ · enhanced_service_fee **0.75 (3/4)** | ❌ |
| Flip-rate ≤ 0.15 (K=3) | **0.000** (63/63 unanimous) | ✅ |
| Macro κ ≥ 0.60 | **0.944** | ✅ |

**Verdict, per the pre-registered conjunctive rule + the owner's arming directive:
the "calibrated" label DEFERS.** No re-run toward green, no floor amendment. The
classifier's honest status is **"wired, env-gated, NOT calibrated"** — the
deterministic 19/21 baseline remains the only floor-bearing measured artifact, and
this run's numbers stand as a frozen, directional measurement (n=21, synthetic —
plan §4 bounds).

**The one miss, in full (nothing buried):** `relabel-test-2` — label "Service &
delivery relabel fee", declared `delivery_fee`, gold `enhanced_service_fee`. All
THREE reps unanimously predicted `not-a-permitted-fee`, rationale (rep-0,
verbatim): "The label combines both service and delivery elements, indicating a
bundled charge that cannot be described by a single permitted category." A stable,
coherently-reasoned reading of the gold set's hardest case — the model treats the
"&"-joined label as a bundle where the gold intends a relabeled enhanced charge.
The enhanced-class recall CI95 on 3/4 is [0.30, 0.95] — a single-item miss at
denominator 4, exactly why plan §4 says this gold set cannot carry a production
claim in either direction.

**Provenance addendum (2026-07-05, from the Codex cross-model reconciliation —
appended HERE because nothing above the RESULTS marker may change post-run):**
the Codex reviewer correctly observed that this file's pre-registration and
results live in one uncommitted working tree, so the file alone cannot prove the
rules predate the run. The precise, checkable provenance is: **(i) the six
floors** — committed PRE-RUN in `docs/plan-f1b-classifier.md` §3.1 at `bda6314`
(2026-07-04), including the ≥20/21 amendment at `550e3cb` (2026-07-04, the M2
reconciliation) — both commits predate any live call; **(ii) the
no-same-split-re-run tightening** — the owner's arming directive, committed
pre-run in the HANDOFF top block at `c73c100` (2026-07-04: "NEVER re-run to
green on the same split, NEVER amend a floor post-hoc"); **(iii) rep-0 as
prediction-of-record and the 0/0-precision convention** — working-tree-only
(this file, written before the run but with no committed boundary to prove it).
Neither (iii) element was outcome-bearing on this run: all 63 scored reps were
UNANIMOUS (flip-rate 0.000), so rep-0 ≡ majority ≡ any-rep — the accuracy and
recall numbers are identical under every prediction-of-record convention — and
every one of the five labels had ≥1 predicted positive, so the 0/0 convention
was never invoked. Lesson routed to `~/claude-os/tasks/lessons.md`: COMMIT the
pre-registration before arming the run, so the boundary is provable, not argued.

- The live classifier **strictly beat the deterministic baseline overall** (20/21
  vs 19/21) and **resolved one of the two cases the baseline structurally cannot**
  (`bundle-test-2`: "Delivery & marketing combo fee" → correctly
  `not-a-permitted-fee`; the keyword floor mislabels it enhanced). It did NOT
  resolve `relabel-test-2` — the RELABELING class remains the measured frontier
  for model and baseline alike (the tune-split context echoes this: 20/21 with
  `relabel-tune-1` the only miss, also a relabeling item).
- Per AM-7 the bar is the bar: beating the baseline on 5 of 6 floors is a DEFER,
  not a partial credit. Any future attempt (prompt shape informed by the TUNE
  split only, a different model lane, a larger gold set) is a NEW owner-gated
  arming with its own pre-registration — this split is now exposed and may not
  be re-scored for label purposes.

▸ *Plain: the AI took the locked test once, for free, with no do-overs. It scored
20 out of 21 — better than the dumb-rules floor's 19 — but the rules we wrote down
in advance required it to also catch at least 4 of the 5 sneaky-relabel-type cases,
and it caught 3 of 4 in that one category. Close is not cleared: it does not get to
call itself "calibrated." The score sheet is frozen exactly as it landed, the one
question it got wrong is written out above, and any second attempt would be a new,
separately-approved test — never a quiet retake of this one.*
