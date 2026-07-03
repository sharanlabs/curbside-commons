# UC-1 Codified Rule Table — NYC § 20-563.3 Fee Caps (as amended by Local Law 79 of 2025)

**Type:** reference (Diátaxis). **Serves:** UC-1 fee-statement audit pack (plan `docs/plan-truth-audit-execution.md` §5 P1, §7 fee-line classes, C8). Machine-readable twin: [`uc1-rule-table.draft.json`](uc1-rule-table.draft.json). Provenance + verified/unverified ledger: [`ll79-source-memo.md`](ll79-source-memo.md).
**As-of:** 2026-07-03. **Register:** professional leads; *plain-English marked ▸*. **Quarantine (Law 11):** sources treated as untrusted data; facts extracted only.

▸ *Plain: this is the rulebook our fee-audit engine checks a delivery platform's monthly statement against. Each row is one legal limit turned into a yes/no test, tied to the exact clause it comes from, and tagged with the kind of cheating it catches.*

---

## Answer-first summary

NYC caps what a third-party delivery platform (DoorDash / Uber Eats / Grubhub-class) may charge a restaurant, per online order, as a **percentage of the order's purchase price**, in **four permitted fee categories** — and **forbids any charge outside those four**. Local Law 79 of 2025 replaced the old flat scheme with this tiered one, **effective 2025-06-30** (it *became law* 2025-05-31; see the source memo for the resolved date conflict).

| Category | Cap | Base | Monthly-avg alternative? | Refund safe harbor? |
| --- | --- | --- | --- | --- |
| Delivery fee | **15%** | purchase price / order | Yes (subd. a) | Yes (subd. e) |
| Basic service fee | **5%** | purchase price / order | Yes (subd. b) | Yes (subd. e) |
| Transaction fee | **3%** | purchase price / order | **No** | **No** |
| Enhanced service fee | **20%** | purchase price / order | Yes (subd. d) | Yes (subd. e) |
| *Anything else* | **forbidden** | — | — | — |

▸ *Plain: delivery ≤15%, being-listed ≤5%, card-processing ≤3%, optional extras ≤20%, and nothing else allowed. Three of the four can be measured as a monthly average instead of order-by-order, and platforms get a 30-day grace to refund an over-charge on those three — but never on the 3% processing fee.*

**Glossary terms** (new; also for `docs/GLOSSARY.md`): *basic service fee*, *enhanced service fee*, *transaction fee*, *purchase price base*, *monthly-average alternative*, *over-cap refund safe harbor*, *category lock*.

---

## The rule table

Each rule maps to one or more **fee-line drift classes** from plan §7: *bundling · relabeling · misclassification · over-cap · promotion-deduction mischaracterization · processing-fee base inflation.* Every row cites its verbatim clause and carries a verified/UNVERIFIED status. Full predicates are in the JSON twin.

| Rule id | Clause | Machine-checkable rule (professional) | ▸ Plain-English | Drift classes caught | Status |
| --- | --- | --- | --- | --- | --- |
| **NYC-563.3-a-1** | §20-563.3(a) | delivery fee ≤ 15% × purchase price, per order | ▸ delivery can't exceed 15% of the order | over-cap · misclassification | VERIFIED |
| **NYC-563.3-a-2** | §20-563.3(a) | OR Σ(delivery fees in month) ≤ 15% × Σ(purchase price in month) | ▸ …or 15% averaged over the whole month | over-cap · relabeling | VERIFIED |
| **NYC-563.3-a-3** | §20-563.3(a) | charging a delivery fee ⇒ must deliver ≥1 mile unless *exigent circumstances* | ▸ if they bill delivery, they must actually deliver (weather/disaster excepted) | — (obligation, not a fee-number) | VERIFIED |
| **NYC-563.3-b-1** | §20-563.3(b) | basic service fee ≤ 5% × purchase price, per order | ▸ being listed/discoverable can't exceed 5% | over-cap · misclassification | VERIFIED |
| **NYC-563.3-b-2** | §20-563.3(b) | OR monthly average ≤ 5% | ▸ …or 5% averaged over the month | over-cap · relabeling | VERIFIED |
| **NYC-563.3-c-1** | §20-563.3(c) | transaction fee ≤ 3% × purchase price, per order (no averaging) | ▸ card-processing can't exceed 3%, order by order | over-cap · processing-fee base inflation | VERIFIED |
| **NYC-563.3-c-2** | §20-563.3(c)(i)–(ii) | transaction fee > 3% allowed ONLY if = actual processor charge AND proof available to dept + establishment | ▸ they can bill more than 3% only if it's an exact pass-through of the real card cost, with receipts | processing-fee base inflation · over-cap | VERIFIED |
| **NYC-563.3-d-1** | §20-563.3(d) | fee category ∈ {delivery, basic service, transaction, enhanced}; any other fee is unlawful | ▸ only four fee types are legal — anything else is illegal, no matter what it's called | misclassification · relabeling · promotion-deduction mischaracterization · bundling | VERIFIED |
| **NYC-563.3-d-2** | §20-563.3(d) | enhanced service fee ≤ 20% × purchase price, per order | ▸ optional extras can't exceed 20% | over-cap | VERIFIED |
| **NYC-563.3-d-3** | §20-563.3(d) | OR monthly average ≤ 20% | ▸ …or 20% averaged over the month | over-cap · relabeling | VERIFIED |
| **NYC-563.3-d-4** | §20-563.3(d) | charging an enhanced fee ⇒ platform also offers (and charges a basic service fee for) the basic service | ▸ they can only bill "extras" if they also offer the plain basic plan | misclassification | VERIFIED |
| **NYC-563.3-e-1** | §20-563.3(e) | over-cap on a/b/d is not a violation if refunded within 30 days of the month-end; **c excluded** | ▸ a monthly over-charge on delivery/basic/enhanced isn't a violation if refunded within 30 days of month-end — but the 3% processing fee gets no such grace | over-cap · promotion-deduction mischaracterization | VERIFIED |
| **NYC-563.3-g-1-iv** | §20-563.3(g)(1)(iv) | a fee change takes effect ≥ 30 days after notice to the establishment | ▸ they must give 30 days' notice before a fee change kicks in | relabeling | VERIFIED |
| **NYC-563.3-g-3** | §20-563.3(g)(3) | every fee/commission/charge must be disclosed clear-and-conspicuous | ▸ every charge must be shown plainly, not hidden | bundling · relabeling | VERIFIED |
| **NYC-563.3-h-1** | §20-563.3(h) | monthly itemized list of each transaction incl. every fee charged, for the prior month | ▸ they owe the restaurant a monthly line-by-line statement of every charge | bundling · relabeling | VERIFIED |
| **NYC-563.3-f-1** | §20-563.3(f) | paying a basic service fee ⇒ searchable on all platforms, not omitted from relevant results | ▸ if you pay to be listed, they can't bury you in search | — (obligation) | VERIFIED |
| **NYC-563.3-l-1** | §20-563.3(l) | commissioner fee-cap report due ≤ 2026-09-30 (factors incl. penalties/restitution) | ▸ the city must report on how the caps are working by Sep 30 2026 | — (context) | VERIFIED |

**Coverage note (C6 discipline):** this table codifies the enforceable constraints **within §20-563.3 and its LL79 definition amendments**. It does **not** claim to cover all edge cases, the full Subchapter 36, or penalty computation. Penalty/restitution provisions sit outside this section — see UNVERIFIED U2.

---

## How the drift classes map to the rules (plan §7 crosswalk)

▸ *Plain: the six ways a platform can shade its fee statement, and which rules catch each.*

| Fee-line drift class (plan §7) | Caught by | Mechanism |
| --- | --- | --- |
| **over-cap** | a-1/a-2, b-1/b-2, c-1, d-2/d-3, gated by e-1 | direct percentage-of-base comparison, per order or monthly average; e-1 defers the "violation" verdict until the 30-day refund window closes (a/b/d only) |
| **misclassification** (e.g. marketing billed as delivery) | a-1, b-1, d-1, d-4 | category lock (d-1) + each cap tied to its own category; a charge relabeled into a lower-cap bucket still fails its true-category cap once reclassified |
| **relabeling across months** | a-2, b-2, d-3, g-1-iv | monthly-average denominators + the 30-day fee-change-notice rule expose a fee that migrates category or amount between months |
| **bundling into single line items** | d-1, g-3, h-1 | itemization (h-1) + clear-and-conspicuous disclosure (g-3) + category lock (d-1): a single lumped line can't be classified and is a defect |
| **promotion-deduction mischaracterization** | d-1, e-1 | a charge dressed as a "promotion deduction" is not a permitted fee category (d-1); a mislabeled "refund" doesn't satisfy the safe harbor (e-1) |
| **processing-fee base inflation** | c-1, c-2 | 3% hard cap with no averaging; anything above 3% must be an exact, provable pass-through of the real processor charge |

**Load-bearing dependency (blocks trustworthy over-cap + base-inflation checks):** the meaning of the cap **base** — *"purchase price of each online order"* — is quoted verbatim from the statute but its **inclusions/exclusions (tax, tip, pre- vs post-discount subtotal) are UNVERIFIED** (source-memo U1). Until resolved in F1, base-derived verdicts are provisional.

---

## JSON schema (documenting the twin)

The machine-readable twin `uc1-rule-table.draft.json` uses this schema (our design; to be wired into `lib/packs/fees/` in slice F1, not now):

- **`meta`** — jurisdiction, statute + amending law, `enacted_became_law_date`, `effective_date` (+ `_status`), `cap_base_term` (+ `_status`), `as_of`, source, quarantine + coverage disclaimers.
- **`definitions[]`** — `{term, ref, text, status}` for each defined term LL79 adds/changes.
- **`fee_categories[]`** — the four permitted categories (the category-lock whitelist).
- **`rules[]`** — each rule:
  - `id` (e.g. `NYC-563.3-a-1`) · `source_clause` (verbatim clause ref) · `category` · `kind` (`per_order_cap` | `monthly_average_cap` | `passthrough_exception` | `category_whitelist` | `eligibility_gate` | `over_cap_refund_safe_harbor` | `service_obligation` | `disclosure_duty` | `itemization_duty` | `fee_change_notice` | `agency_reporting`)
  - `cap_pct` + `base` (where numeric) · `predicate` (machine-checkable pseudo-expression over normalized statement fields) · `window`/`exception`/`excludes` where relevant
  - `drift_classes[]` (plan §7 crosswalk) · `note` · `status` (`VERIFIED_PRIMARY` | `PARTIAL...` | `UNVERIFIED`)
- **`open_gaps[]`** — `{id, gap, impact, resolve_in}` for the UNVERIFIED items (U1–U4).

**Statement-input contract implied by the rules** (for F1 parser design): each normalized statement line needs at least `{order_id, month, category (classified), amount, order_purchase_price, is_refund, passthrough_documented}`. Subd. h guarantees a per-transaction itemized statement exists as the audit's minimum input.

---

## Honesty box (what this table does NOT claim)

- Not a compliance guarantee or legal advice — it is a codification of statutory text for an audit prototype.
- Not "all edge cases": coverage is bounded to §20-563.3 + LL79 definitions; C6 coverage is measured, never asserted total.
- The cap **base** ("purchase price") is quoted verbatim but **not defined** here (U1) — base-derived verdicts are provisional until F1.
- **Penalty/restitution amounts are outside this section** (U2) — this table detects violations; it does not compute fines.
- Pre-2025-06-30 statement periods need the **prior (LL103/2021) text** (U3), not yet extracted.
- Codified against the **enacted LL79**; the live amlegal codification was not directly reconciled (403); no later amendment found as of 2026-07-03 (U4).
