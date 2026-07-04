# F1a slice record — UC-1 fee-audit deterministic spine

**Date:** 2026-07-04 · **Mode:** spec-adherence (implementer lane) · **Commit:** NONE (Fable seat reviews first)
**Plan:** `docs/plan-truth-audit-execution.md` §5 F1, §7 fee-line classes, C1/C2/C6/C8/C10 ·
**Rule authority:** `docs/research/uc1-rule-table.draft.json` (the JSON twin) + `uc1-rule-table.md`

## Scope delivered

The UC-1 fee-audit **deterministic spine**: offline, $0-LLM, categories audited
AS-DECLARED (the LLM line-item classifier is deferred to F1b). All 10 deliverables:
typed statement schema, seeded generator + byte-frozen fixtures + answer key, loud
parser, 17 rules as typed predicates with a both-directions drift-lock, U1
provisionality (one constant + a marker-enforcing finding wrapper + provisional
rendering), §20-563.3(e) refund window as a verdict *state*, fee report model
(machine JSON + two-register CLI text), a strict `fees` CLI leg, a measured C6
coverage eval, and honesty/docs extension.

## Files changed

Created (lib/packs/fees/):
- `statement.ts` — typed monthly-statement schema; integer cents; mandatory simulated marker; declared-vs-true seam; `PURCHASE_PRICE_BASE_STATUS`/`ASSUMED_PURCHASE_PRICE_BASE` (U1, one place).
- `parser.ts` — raw JSON → typed statement; loud `StatementParseError` on every malformed path; no silent defaulting.
- `rules.ts` — 17 rules: 11 typed predicates (metadata mirrors the twin 1:1) + `NON_STATEMENT_CHECKABLE` (6, with reasons); `BASE_DERIVED_RULE_IDS` derived from the twin `base` field; drift-class normalizer.
- `finding.ts` — `FeeFinding`/`FeeVerdict`; `makeFeeFinding` wraps core `makeFinding` (C2) + enforces the `U1-base` marker on base-derived rules + two registers; `FeeAuditReport` + `serializeFeeReport`.
- `audit.ts` — the engine (`auditStatement`): d-1 category lock, per-order∨monthly-average (a/b/d), c hard-cap + c-2 exception, d-4 gate, e-1 verdict states; pure (asOf as data, no clock).
- `generate.ts` — seeded builders (faithful/drifted/cured/conditional) + machine answer key + golden reports.
- `index.ts` — extended barrel (pack descriptor status → `f1a-deterministic-spine`; full public surface; CLI intentionally not re-exported).
- `cli.ts` — `runFeeCheck` (text default + `--json`), honest scope label.

Created (elsewhere):
- `scripts-ts/generate-fee-fixtures.mts` + `fixtures/synthetic-restaurant/fees/` (4 statements, `fee-answer-key.json`, 4 golden reports, `README.md`).
- Evals (evals/packs/): `fees-drift-lock`, `fees-parser`, `fees-finding-u1`, `fees-audit-e1`, `fees-freeze`, `fees-coverage-c6`, `fees-cli`, `fees-honesty-c10`.

Modified:
- `bin/check.mjs` — added the strict `fees` leg (+ usage).
- `package.json` — `fixtures:fees`, `check:fees`, `check:fees:clean`.
- `docs/GLOSSARY.md` — 5 new terms; `docs/PLAIN-ENGLISH.md` — 2026-07-04 row; `fixtures/README.md` — fees set indexed.

Untouched (HARD CONSTRAINTS honored): `lib/packs/listings/` internals, `legacy/`,
`evals/gold/`, `lib/verifier-core` internals (reused via `makeFinding` only), all
existing snapshots/goldens. No new npm deps. No network/LLM anywhere in the fees path.

## Test-count delta

- Baseline: 557 passed + 5 skipped (full); 306 passed + 5 skipped (legacy).
- After F1a: **668 passed + 5 skipped** (full, +111); **306 passed + 5 skipped** (legacy, UNCHANGED).

## Escalations (E-n) — genuine ambiguities, conservative resolutions

- **E-1 — base-derived set excludes c-2.** The spec says the base-derived set is
  "derived from the JSON twin's base field." c-2 (passthrough_exception) has NO
  `base` field in the twin, though its predicate references purchase price.
  **Resolution:** the enforced set is exactly the twin's base-bearing rules
  {a-1,a-2,b-1,b-2,c-1,d-2,d-3} (drift-proof, per spec's mechanical definition). c-2
  never emits standalone (it only *permits* an exception); the c-line finding is
  c-1, which IS base-derived and carries `U1-base`. So no base-dependent c verdict
  escapes the provisional marker.

- **E-2 — NON_STATEMENT_CHECKABLE membership (g-1-iv/g-3/h-1 decided honestly).**
  Registered non-checkable: a-3 (delivery obligation), f-1 (search obligation),
  l-1 (agency reporting) — as the spec expected — PLUS **g-1-iv** (needs
  fee-change notice_date/effective_date, absent from the §h itemized statement),
  **g-3** (clear-and-conspicuous *presentation* duty, not a numeric field; its
  bundling teeth live deterministically in d-1), and **h-1** (the itemization duty
  DEFINES the input contract; the audit presupposes a parsed itemized statement; a
  bundled/non-itemized charge surfaces via d-1). Implemented = 11
  {a-1,a-2,b-1,b-2,c-1,c-2,d-1,d-2,d-3,d-4,e-1}. 11 + 6 = 17 (set-equality asserted).

- **E-3 — exit-code / `ok` semantics for e-1 states.** `report.ok = (no finding
  with verdict "violation")`; `conditional-pending-refund-window` and
  `cured-by-refund` are reported but do NOT set exit 1. **Rationale (conservative,
  anti-overclaim):** the statute says an over-cap inside the refund window is *not
  yet* a violation — calling it one would overclaim. The drifted corpus contains
  real (window-closed) violations, so `check:fees` still exits 1.

- **E-4 — per-order vs monthly-average interaction.** The cap is met if EITHER the
  per-order cap holds OR the monthly average holds (the statute's averaging
  alternative). The engine reports an a/b/d over-cap ONLY when the monthly average
  ALSO fails (cited to the monthly rule a-2/b-2/d-3), so a per-order overage the
  averaging alternative rescues is never overclaimed. Denominator = Σ purchase over
  DISTINCT orders (deduped), per the twin's `sum_..._all_orders_in_month` base.

- **E-5 — relabeling is deferred, not faked.** Pure cross-month relabeling needs
  multi-month data + fee-change-notice records (g-1-iv, non-checkable). Within a
  single monthly itemized statement it is DEFERRED-TO-CLASSIFIER; the answer key
  records it as such and C6 reports 5/6 classes deterministic, 6/6 injected.
  Bundling/misclassification hidden under a *legal within-cap* label are likewise
  deferred; their deterministic teeth (non-legal label → d-1; enhanced-without-basic
  → d-4) are separately planted and caught.

- **E-6 — "seeded generator" implemented as a pinned-seed pure builder with fixed
  amounts.** Unlike the listings PRNG generator, fee amounts are FIXED by design so
  each plants an exact, answer-keyed violation at a known cap boundary (random
  amounts would make boundary-exact planting fragile). The seed pins
  provenance/reproducibility; output is byte-identical every run (freeze-integrity
  enforced). Judged the faithful reading of "seeded/deterministic" for a
  boundary-exact fee corpus.

## NON_STATEMENT_CHECKABLE registered (with why)

| Rule | Reason |
| --- | --- |
| NYC-563.3-a-3 | Delivery-service obligation (≥1 mile) — a service fact, not a fee number. |
| NYC-563.3-f-1 | Search/discoverability obligation — a serving-surface fact, not statement-auditable. |
| NYC-563.3-l-1 | Commissioner report duty — city-agency obligation, not a statement fact. |
| NYC-563.3-g-1-iv | Fee-change 30-day-notice — needs notice/effective dates absent from the §h itemized statement. |
| NYC-563.3-g-3 | Clear-and-conspicuous disclosure — a presentation duty; bundling teeth live in d-1. |
| NYC-563.3-h-1 | Itemization duty — defines the audit's INPUT contract; bundled charges surface via d-1. |

## Verification

See `docs/reviews/f1a-verify-evidence.log` for the executed RED→GREEN cycles
(drift-lock, U1 marker, e-1 states, freeze-integrity, parser rejections, CLI exit
codes, coverage/completeness) and the final gates: `npm run verify` EXIT 0 (668
passed + 5 skipped), `npm run test:legacy` EXIT 0 (306 passed + 5 skipped). typecheck
clean · lint clean · build succeeded.

## Fable-equivalence review (2026-07-04, Fable seat) — PASS

Independent line-level review of every load-bearing file (rules/audit/finding/
statement/parser/drift-lock/coverage) + an INDEPENDENT live re-run: `npm run
verify` EXIT 0 (668 passed + 5 skipped) and `npm run test:legacy` EXIT 0 (306+5,
unchanged). RED-GREEN AUTHENTICATED LIVE by the reviewer's own mutation (delivery
cap 15→14 in audit.ts → 5 failures across coverage answer-key + frozen goldens;
restore → 22/22 green). E-4's statutory math independently proved: if every
per-order cap holds, the monthly average necessarily holds, so monthly-fail ⟺
both compliance bases fail — reporting only on monthly-fail is exact, not lenient.
All six escalations E-1..E-6 ACCEPTED.

**Elevation (1 fix applied directly):** the monthly-average DENOMINATOR limitation
was undocumented — a statement only shows orders carrying fee lines, so the
statutory "all orders" base can be undercounted, biasing the average toward
flagging (a bias AGAINST the platform, unlike U1). Documented at
`sumDistinctOrderPurchase` (audit.ts) + a new Honesty-box line in the fees corpus
README. Pack evals 346/346 + typecheck + lint re-run green after the edit.
Same-breath check: GLOSSARY (+5 terms) and PLAIN-ENGLISH row confirmed present.

Route: frontier-advisor PROCEED pre-approach (option B — two dispatches; 4
constraints, all landed) → implementer@opus build → this review. Harness advisor()
unavailable (10th consecutive session, surfaced).
