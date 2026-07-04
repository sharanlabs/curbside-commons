# The fee-audit corpus (UC-1, F1a deterministic spine)

**Plain-English:** this folder is a set of made-up monthly delivery-platform
**bills** (fee statements) plus an **answer key** saying exactly which illegal or
over-the-cap fees are planted in each — and which our deterministic checker can
catch today versus which wait for the AI line-item classifier (a later slice).
Everything here is **SIMULATED and labeled so**: the bills are invented, but they
are audited against **real, codified NYC law** (Administrative Code §20-563.3, as
amended by Local Law 79 of 2025).

**Professional register:** a seeded, byte-frozen fixture corpus that drives the
UC-1 fee-statement **truth leg** — a typed monthly itemized statement (per
§20-563.3(h)) audited against the 17-rule codified cap table
(`docs/research/uc1-rule-table.md` + its JSON twin). Freeze-integrity evals lock
the committed files to their generator, so the corpus cannot be hand-tampered
without CI failing.

> **SIMULATED statements, REAL codified law.** No real platform, merchant, order,
> or fee data. The audit detects violations against the statute; it is **not**
> legal advice and does **not** compute penalties.

---

## Contents

| File | What it is |
| --- | --- |
| `statement.faithful.json` | A compliant monthly statement — every fee within cap. Audits to zero findings. |
| `statement.drifted.json` | A rigged statement planting the six plan §7 fee-line classes (see the answer key). Exits non-zero. |
| `statement.cured.json` | A delivery over-cap **refunded within the §20-563.3(e) 30-day window** → `cured-by-refund` (not a violation). |
| `statement.conditional.json` | The same over-cap evaluated while the window is **still open** → `conditional-pending-refund-window` (not yet a violation). |
| `fee-answer-key.json` | Ground truth: every planted violation labeled with its §7 class, expected rule id, expected verdict, and **detection mode** (`deterministic` vs `deferred-to-classifier`). |
| `expected-report.*.json` | The golden fee-audit reports, byte-compared by the freeze-integrity eval. |

## The six fee-line classes (measured, never "all")

Keyed to the plan §7 fee-line taxonomy — coverage is **measured** by
`evals/packs/fees-coverage-c6.test.ts`, which reports the honest split:

| Class | Caught by | Detection (F1a) |
| --- | --- | --- |
| over-cap | a-1/a-2 (delivery), c-1 (transaction), etc. + e-1 verdict | **deterministic** |
| processing-fee-base-inflation | c-1 / c-2 (hard 3% + pass-through) | **deterministic** |
| bundling | d-1 category lock (non-permitted label) | **deterministic** (+ a deferred variant) |
| promotion-deduction-mischaracterization | d-1 category lock | **deterministic** |
| misclassification | d-4 (enhanced-without-basic) | **deterministic** (+ a deferred variant) |
| relabeling | a-2/b-2/d-3 + g-1-iv | **deferred-to-classifier** (pure cross-month relabeling needs multi-month data + fee-change-notice records; g-1-iv is non-statement-checkable) |

Five of the six classes are caught deterministically; **relabeling is deferred**,
recorded honestly — never faked as deterministic. Bundles and misclassifications
hidden under a *legal, within-cap* category label are also deferred to the F1b
line-item classifier (the deterministic spine audits categories **as declared**).

## The U1 asterisk (purchase-price base, unresolved)

Every over-cap call depends on the statutory cap **base** — "purchase price of
each online order" — whose exact inclusions/exclusions (tax, tip, pre- vs
post-discount) are **UNVERIFIED** (source-memo U1). The corpus declares ONE
assumed base convention (recorded in every statement's `meta` and in the answer
key), and every base-derived verdict is rendered **provisional (`U1-base`)** —
never an unqualified violation — until U1 is resolved.

## The §20-563.3(e) refund window as a verdict STATE

An over-cap on delivery / basic / enhanced (subd. a/b/d) is not automatically a
violation: it is `violation` only once the 30-day refund window closes with no
covering refund; `conditional-pending-refund-window` while the window is open;
`cured-by-refund` if refunded in time. The transaction fee (subd. c) gets **no
safe harbor** — an over-3% transaction fee is a violation immediately.

## Regenerate (seeded, deterministic)

```
npm run fixtures:fees   # rebuilds this folder from the pinned seed (20260703)
```

## Run the audit (zero-config, C1)

```
# a rigged statement exits 1 and prints every catch with receipts (two registers)
node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json

# the machine report (CI-usable JSON)
node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json --json
```

npm shortcuts: `npm run check:fees` · `npm run check:fees:clean`. No LLM or
network call happens on any path (C1: $0-LLM, enforced by an import-graph eval).

## Honesty box

- All statement data is simulated — the merchant, orders, and fees are invented.
- The audit checks simulated statements against **real codified law** (NYC
  §20-563.3 / LL79-2025); it is not legal advice and computes no penalties.
- The purchase-price base is an **assumed** convention (U1 unresolved) — every
  base-derived verdict is labeled provisional.
- Category classification is **as-declared by the platform**; the LLM line-item
  classifier (true-vs-declared category) is **deferred to F1b**.
- The monthly-average denominator sums the purchase prices of orders **appearing
  on the statement**; an order with zero fee lines is invisible to it, so the
  denominator can undercount the statutory "all orders" base and bias the
  average toward flagging — one reason monthly-average verdicts stay provisional.
- No claim of real platform access, real fee rates, or real business impact.
- Human-led, AI-assisted, professionally reviewed.
