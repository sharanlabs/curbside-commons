# F1b Slice Record — the classification layer (plan §5 F1, C8)

**Date:** 2026-07-04. **Route:** implementer@opus (dispatch 2 of the advisor-approved
two-dispatch F1 shape) → Fable-equivalence review + inline tail on the Fable seat.
**Baseline:** F1a committed `896ab59`, verify 668 passed + 5 skipped.
**Result:** verify EXIT 0 — **715 passed + 5 skipped** (+47 tests, +4 files);
`test:legacy` 306 + 5 UNCHANGED; all F1a goldens byte-identical (asserted twice over).

▸ *Plain: the fee checker's AI seam — the grading set, the dumb-but-honest benchmark,
the fully-designed-but-unplugged AI classifier, and the advisory lane — built and
measured, with nothing claimed for the AI until an owner-approved live run beats the
benchmark on held-out examples.*

## Deviation on record (process)

The delegated builder died TWICE: (1) subagent seat limit — raw verbatim: "You've
hit your session limit · resets 6pm (America/New_York)"; the owner's `resume`
confirmed the retry, which resumed the same builder with context intact; (2) the
resumed builder completed all build artifacts (58 tool uses) then died on a raw
"API Error: Overloaded" BEFORE writing the evidence log, slice record, and
same-breath doc rows. Per the NO-WAIT precedent (W1, decision-log 2026-07-03) the
TAIL was executed inline on the Fable seat: red-green cycles executed independently
(doubling as review authentication), evidence log + this record + GLOSSARY (+3
terms) + PLAIN-ENGLISH row written inline. **Maker≠judge exposure is limited to
that tail; every build artifact was builder-authored and Fable-reviewed. The M2
full ceremony (ONE batched Codex + independent acceptance-gate over the whole F1
module) is the named, already-scheduled independent leg — nothing new to schedule.**

## What shipped (builder-authored)

| Piece | File(s) |
| --- | --- |
| Metrics port (conscious migration, W0-ledger style) | `evals/gold/metrics.ts` + `metrics.test.ts` — the reusable core (per-class matrix, precision/recall/F1, Wilson 95% CI, accuracy) ported VERBATIM-shape from `legacy/activation/lib/evals/judge-metrics.ts` at `896ab59` with a provenance header; legacy untouched/frozen. Semantic-judge-specific parts (κ, flip-rate, R-CAL-1 subset logic) consciously left behind, recorded in the port header — ported when a consumer exists. |
| Classifier seam | `lib/packs/fees/classifier.ts` — `LineItemClassifier` DI interface (`earnsLabel: false` BY TYPE this slice); 5-label TRUE-category vocabulary (4 legal + `not-a-permitted-fee`); documented §7-class → true-category mapping; **leak-free `ClassifierInput` contract** (no trueCategory, no answer key, ever); `DeterministicBaselineClassifier` (ordered keyword rules — deliberately imperfect, the AM-7 floor); `makeMockOracleClassifier` (answer-reading WIRING STUB, cannot earn); `LIVE_CLASSIFIER_DESIGN` typed design constant + `LiveClassifierNotWiredError` (no provider wired, zero network imports). |
| Stratified gold set | `evals/gold/fee-lines-gold.ts` — **N=42** typed TS literals (all synthetic/simulated): 6 §7 classes + clean stratum × (3 tune + 3 test) = 21/21 disjoint split, pinned IDs; `fee-lines-gold-composition.test.ts` enforces sizes, per-class-per-split counts, disjointness, pinned-ID set equality. No statistical-sufficiency claim — the set bounds what may be claimed (stated in-file). |
| Baseline measurement (pinned) | `evals/gold/fee-baseline-measurement.test.ts` — deterministic baseline on the HELD-OUT test split: **accuracy 19/21 ≈ 0.905**; per-category precision/recall/F1 + Wilson CIs pinned as a snapshot (regressions loud); the two misses pinned BY ID (`relabel-test-2`, `bundle-test-2`) = the honest anti-theater gap keyword rules cannot resolve. Tune split measured (18/21) but explicitly NOT the headline (R-DHON-3 discipline machine-checked). |
| Advisory wiring | `lib/packs/fees/classified-audit.ts` — `auditWithClassification` = UNCHANGED `auditStatement` + a SEPARATE `advisoryFindings` array; candidates flow through the core C2 guard (`makeFinding`) with `claim.source: "classifier"`, severity `info`, provenance + non-earned status in both registers; never merges into `base.findings`, never gates `ok`. Wiring proof: the mock oracle surfaces the deferred relabeling candidates; the honest baseline does not; the C6 coverage eval (unmodified) keeps reporting them deferred. |
| Design + recalibration plan | `docs/plan-f1b-classifier.md` — Groq free-tier primary lane (domain-judge precedent), leak-free prompt-input contract, structured output, FAILED_TO_FALLBACK semantics; **R-DHON-3 pre-registered floors FIXED BEFORE any run** (beat baseline test accuracy; per-class recall ≥ 0.70 all 5 labels; ≥ 0.80 on `enhanced_service_fee` + `not-a-permitted-fee` — the two classes carrying the baseline's misses); K=3 reps/item, temp 0; Groq TPD pacing lesson carried from `docs/a3-7-live-run-status.md`; cost $0 (free tier), no Gemini spend; **explicit OWNER GATE — no live run, and no "calibrated" claim below the floors**. Two-register throughout. |
| Core type extension | `lib/verifier-core/claim.ts` — `ClaimSource` gains `"classifier"` (additive string-literal union member, documented advisory-only; no exhaustive switch exists over the union — verified; listings surfaces untouched). Flagged for M2's attention as the slice's one shared-core touch. |
| Honesty + docs | `evals/packs/fees-honesty-c10.test.ts` extended to the new files/doc; `evals/packs/fees-classifier.test.ts` extends the $0-LLM/zero-network structural proof to classifier.ts + classified-audit.ts; GLOSSARY +3 (advisory finding · anti-theater floor · tune/test split); PLAIN-ENGLISH row (inline tail). |

## Escalations

- **E-1 (builder; ACCEPTED on review):** advisory findings do NOT flow through
  `makeFeeFinding` — its `FeeVerdict` members are all statutory dispositions, and a
  fourth member would grow `verdictTally` into EVERY frozen F1a golden's JSON
  (byte-breaking the hard constraint). Resolution: same universal C2 constructor
  (`makeFinding`) + a separate `ClassifierAdvisoryFinding` type outside
  `FeeVerdict`/`buildFeeReport`. Judged correct — freeze-safety over literal packet
  wording; the C2 property (no finding without receipts) is fully preserved.
- **E-2 (reviewer note):** professionalLine's earned-label ternary renders a
  dangling "— " when `earnsLabel` is true — unreachable this slice (`earnsLabel:
  false` by type); fix belongs to the slice that first wires a live classifier.

## Gold-set composition (pinned)

6 §7 classes (over-cap · misclassification · relabeling · bundling ·
promotion-deduction-mischaracterization · processing-fee-base-inflation) + clean
stratum, each **3 tune + 3 test**, N=42, splits disjoint, IDs pinned.

## What may NOT be claimed yet (C8 honesty box)

- NO LLM classifier exists in running code — the live lane is a design + a typed
  contract; nothing is wired to a provider.
- The 19/21 baseline number is the deterministic FLOOR on a SMALL synthetic gold
  set — it is not the C8 held-out-LLM claim and is never called "calibrated".
- "Calibrated" may only ever be claimed after an OWNER-GATED live run clears every
  pre-registered floor in `docs/plan-f1b-classifier.md` §3.1, scored on the test
  split — and a run below any floor is reported honestly, never recomposed.
- Judge-recalibration itself (the existing semantic/domain judges re-measured on
  fee-domain text) rides the same plan and the same owner gate.

## Fable-equivalence review — PASS

Line-level review of every load-bearing file; independent `npm run verify` re-run
EXIT 0 (715+5) + `test:legacy` 306+5; RED-GREEN ×3 EXECUTED by the reviewer
(baseline pin — first mutation honestly recorded as too weak, strengthened to red ·
frozen-golden byte tamper caught independently by BOTH the F1a freeze test and
F1b's own re-assertion · composition split-flip); shared-core `claim.ts` diff
verified additive-only; leak-free contract verified (no trueCategory/answer-key
reachable from `ClassifierInput`); E-1 verified against the frozen goldens'
serialization. Elevation: GLOSSARY/PLAIN-ENGLISH same-breath rows (the builder died
before them), E-2 noted forward.
