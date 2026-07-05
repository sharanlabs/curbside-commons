(a) CONFIRMED — `ClaimSource` adds `"classifier"` only in [lib/verifier-core/claim.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/verifier-core/claim.ts:21). Grep found no exhaustive source switch and listings consumers only render/pass through `claim.source`.

(b) CONFIRMED — the reviewer-executed red-greens have real teeth by code structure. Baseline target flip breaks pinned accuracy/matrices, golden byte tamper is caught by both freeze paths, and split mutation breaks size/count/ID locks. The first RG-A mutation was correctly recorded as too weak.

(c) REFUTED — monthly-average OR, e-1 states, c exclusion, U1 marker, and 17-rule set coverage are mostly consistent, but c-2 pass-through logic does not match the rule table’s “actual processor charge + proof” requirement.

(d) REFUTED — leak-free input, split locks, baseline pin, documented misses, and no live LLM path are confirmed; however the pre-registered accuracy floor does not actually require beating the 19/21 baseline.

1. P1 · [lib/packs/fees/audit.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/audit.ts:188) · c-2 pass-through is treated as a boolean escape hatch.  
   Why it matters: the rule table requires a fee above 3% to equal the actual processor charge and have proof available ([docs/research/uc1-rule-table.draft.json](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/docs/research/uc1-rule-table.draft.json:99)); `passthroughDocumented === true` skips the finding entirely ([rules.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/rules.ts:171)). A self-labeled pass-through can hide processing-fee base inflation.  
   Suggested fix: model `actualProcessorChargeCents` + proof fields and verify equality, or mark c-2 unresolved/non-statement-checkable and emit a provisional/advisory finding instead of clearing it.

2. P1 · [docs/plan-f1b-classifier.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/docs/plan-f1b-classifier.md:134) · the live classifier accuracy floor is `>= 0.90`, not “beat baseline.”  
   Why it matters: the baseline is pinned at 19/21 = 0.9047619 in [evals/gold/fee-baseline-measurement.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/gold/fee-baseline-measurement.test.ts:43), so 19/21 passes the floor while merely tying the baseline. That weakens the anti-theater gate.  
   Suggested fix: pre-register the discrete floor as `>= 20/21` or explicitly change the claim from “beat baseline accuracy” to “match baseline accuracy plus beat specified miss-class recall floors.”

3. P2 · [lib/packs/fees/parser.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/parser.ts:153) · parser accepts lines whose `month` differs from `meta.month`.  
   Why it matters: audit uses `meta.month` for the refund window while summing all non-refund lines regardless of line month ([audit.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/audit.ts:136), [audit.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/audit.ts:178)). A mixed-month statement can corrupt monthly averages and refund cure logic.  
   Suggested fix: reject any line whose `line.month !== meta.month`; add a parser regression.

4. P2 · [lib/packs/fees/audit.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/audit.ts:192) · claim IDs are not unique for repeated same-order/same-category fee lines.  
   Why it matters: `ORD-1#transaction_fee` can identify multiple distinct charges, weakening C2 evidence traceability. Advisory findings have the same pattern in [classified-audit.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/packs/fees/classified-audit.ts:103).  
   Suggested fix: add a parsed `lineId` or deterministic line index and include it in every claim id.

5. P3 · [evals/packs/fees-drift-lock.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/packs/fees-drift-lock.test.ts:79) · drift-lock does not actually lock all mirrored metadata.  
   Why it matters: it checks `cap_pct`, `base`, and `drift_classes`, but not `kind` or `source_clause`, despite code comments saying metadata mirrors the twin field-for-field.  
   Suggested fix: assert `kind` and `sourceClause` against the JSON twin too.

VERDICT: BLOCK — blocking findings: #1 c-2 statutory mismatch, #2 pre-registered floor does not beat baseline accuracy.

Process adherence note: slice records/logs exist and the F1b inline-tail deviation is recorded; I did not run tests because this session is read-only, so this verdict is based on static diff/code/doc verification.