# Data-request spec — what a platform prepares for its own run

**Type:** reference · **Audience:** a platform's data owner, privacy counsel and the operator who will run the tool · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** plan § 6 (control register, data row), § 17, decision D-7(a) (`docs/decision-log.md`, 2026-10-12), gap sheet pages 3 and 5 (`docs/plan-wave2-gap-sheet-2026-10-12.md`).

## The answer first

**This project asks the platform for no data.** The six-week pilot is **synthetic throughout**: every input is ours and labeled. There is no ingest of platform data in this pilot. **The sections below describe what a platform would need to supply itself in a later deployment on its own data**, if that separate decision is ever made — not what this pilot requests.

*In plain words:* nothing is mailed to us for the pilot. The field lists are a reference for a possible future run behind the platform's walls, not an ask for this proposal.

## What this document is not claiming

- **Synthetic on our side, always.** No input this project ships is real; every one is labeled.
- **"Shaped like the public integration docs, not from the platform."** The field lists below follow public documentation and the project's own spreadsheet template. They are not copied from a platform's systems, and no platform supplied them.
- **No affiliation, partnership, endorsement, access or real-world impact is claimed or implied.**
- **This is not legal advice.** Which privacy statute applies to a given platform's data is a question for that platform's counsel (United States only; state consumer-privacy law, the FTC, and for fees NYC's DCWP). That question is UNVERIFIED here.
- Human-led, AI-assisted, professionally reviewed (`RULES.md` §4).

## 1 · This pilot — nothing requested

The scenario library carries invented merchants, menus, orders and fee statements. Platform-shaped inputs say "shaped like the public integration docs, not from the platform". No data request applies.

## 2 · Future deployment (NOT this pilot) — what a platform's operator would prepare

If a platform later deploys the tool on its own data — a **separate decision** with its own data boundary and security assessment — that run would use **Tier A (replay) or Tier D (a local model) only**, on a machine inside the platform's environment. No hosted model would be reached, so no sub-processor would receive anything (`security-one-pager.md`).

| # | Input | What it is | Format | Status of the reader |
| --- | --- | --- | --- | --- |
| 1 | **The platform's copy of the menu** for the pilot cohort | What the marketplace shows: items, variations, prices, availability, modifier groups and options with their prices | The spreadsheet shape the site's template already uses (`menu-as-published.csv`, matched on `item_id`) today; platform-shaped JSON adapters arrive in S3 | Spreadsheet path BUILT; modifier checks (option price, missing option) BUILT in the listings engine (S1); platform-shaped adapters ARRIVE S3 |
| 2 | **The merchant's record** | What the merchant holds: the same items and prices, stock, an as-of date | The site's second template (`menu-record.csv`) today, or a point-of-sale read | Spreadsheet path BUILT |
| 3 | **An id-mapping sheet** | A human-owned, versioned table that says which marketplace id is which record id, so no id is guessed | CSV | ARRIVES S3 |
| 4 | **The platform's own order-error export** | The platform's own instrument for order errors (the public documentation of one platform's Order Errors CSV lists issue type, item in error, refund, merchant charge and platform-absorbed amount; plan § 3, read 2026-10-09) | CSV, with customer fields **removed by the platform before the tool sees it** | Reader ARRIVES S3 |
| 5 | **Reviewer minutes** | A few named reviewers for the weekly batch | Calendar time | Not a system |

**One export per input, one cohort, one date range.** Keep the cohort small and named in `success-metrics.md` at pilot start.

## 3 · Data classification

| Class | What it is | Needed by the tool? | Rule |
| --- | --- | --- | --- |
| **C0** | Synthetic or public content (the scenario library, public schemas, public documentation) | Yes | Ours; shipped in the repository |
| **C1** | Merchant catalog data: item names, variations, prices, modifier groups and options, availability, hours, as-of dates | **Yes** | Stays inside the platform's environment in a future deployment |
| **C2** | Order-level business records with **no person identifiers**: order id, timestamp, channel (app or agent), line items, status, refund amount, reason code | **Only as needed** to size impact | Stays inside the platform's environment; strip any person identifier first |
| **C3** | Personal data about a customer, courier or merchant staff member: names, addresses, phone numbers, email addresses, payment details, device or account identifiers, free-text notes that can identify a person | **Never** | Removed by the platform **before** the export; and dropped by the tool's ingest allow-list as a second line |

**The second line of defence (ARRIVES S3).** The ingest allow-list works by **dropping by default**: only named columns are read, and anything else is discarded and counted. A planted-customer-field test **would** prove that a deliberately planted personal field does not survive ingest (planned, gap sheet page 5). **Today neither the rule nor its test is built.** Until S3, do not feed any export that contains C3.

**Free text is the risk.** A notes or comments column can hold a person's name or address even when no column is named for it. The allow-list drops unnamed columns; the platform should also drop free-text columns it does not need.

## 4 · What the tool does with the data

- **Reads** it in the tab or on the operator's machine. In a future platform-side deployment nothing is sent to us or to any model host.
- **Writes** a run ledger on the operator's machine (the run-ledger library MERGED on `main` 2026-10-31 (`lib/ledger`); a crew run that writes to it ARRIVES S2 (in progress)): hashed inputs, rule versions, model versions, recommendations, signer, timestamp. The ledger is local, append-only and exportable as JSON-lines.
- **Builds** Slack, email and partner-ticket artifacts. **It does not send them.**
- **Would carry** a deployment provenance label on every artifact in a future platform-side run. That label belongs to the separate deployment decision and is not planned in any current slice (the input-provenance flag was dropped from S3 on 2026-10-14, `docs/decision-log.md`). Our pilot artifacts remain synthetic.

## 5 · Retention and deletion

| Item | Where it lives | Retention |
| --- | --- | --- |
| Exports | The platform's environment | The platform's policy. The tool does not copy them elsewhere. |
| The run ledger | The operator's machine, platform-owned | Platform-owned and deletable. **Proposal:** delete at pilot close unless the platform's own records policy says otherwise. The platform decides. |
| Anything held by this project | Nothing from a platform-side deployment | There is nothing to retain or delete: this project never receives it. |

## 6 · The one-page data-handling statement

1. This project is a prototype run on demand. It is not a hosted service.
2. All data this project ships is synthetic and labeled.
3. A later deployment on the platform's own data, if ever agreed, is a separate decision with its own data boundary and security assessment; nothing in this pilot touches platform data.
4. This project never holds, receives or renders real platform data. If an export were offered to us, we would decline it.
5. The tool needs C1 data, and C2 only as needed. It never needs C3. The platform removes C3 before export; the tool's allow-list drops anything unnamed (from S3).
6. In a future platform-side deployment only replay or a local model would be used. No hosted model host would receive platform data.
7. The tool builds messages and does not send them.
8. Anything that would act requires a signed human decision.
9. The ledger is local, platform-owned and deletable.
10. This statement is a description of the design, not a legal opinion. United States only.

## Sources and dates

Plan §§ 3, 6, 17 (2026-10-09); `docs/decision-log.md` 2026-10-12 (D-7(a), United States only, free-only); gap sheet pages 3 and 5 (2026-10-12); the site's spreadsheet template files named above (`lib/playground/csv-adapters.ts`). The order-error export's columns are as recorded in plan § 3 from a platform's public documentation, **not re-read by this lane**.
