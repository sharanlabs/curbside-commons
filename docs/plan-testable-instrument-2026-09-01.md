# Plan — the testable instrument (goal re-fixed 2026-09-01)

**Status (2026-09-01, later the same session):** owner GO given on D-1..D-6 as recommended (D-1 two files · D-3 default to drop-day, structured ask). **S1 BUILT** — see § S1 status. S2–S4 not started.
**Owner words (verbatim, 2026-09-01):** *"lets rework and adjust to the right goal and also where user able to test it."* Structured answers the same turn: who tests → **"Both: an obvious guided path on bundled data first, then a bring-your-own-data path"** · how far → **"Re-fix the goal in the repo AND build the user-testable input path (CSV/template or guided form) + on-site test guide"** · phone tier → **"No — desktop/tablet only, state it plainly."**
**Basis:** `docs/assessment` findings of 2026-09-01 (session 46, in `CURRENT_TASK.md`): the build is complete, no post-pivot definition of done existed, and an outside visitor could only test the instrument on our bundled data in our own JSON shape.
**Process:** full loop (public surface + data-model change). This plan is owed a Codex cross-check before the design decisions are treated as settled; Codex hosts have measured `000` from the sandbox on every session since 2026-07-31 — the check is owner-shell, recorded as owed, not skipped silently.

---

## The goal, fixed

> **Curbside Commons is complete as a capability. Its remaining goal is to be an instrument a stranger can test — on the live site, with the bundled data in one click and with their own menu data via a spreadsheet they can edit — and then to be shown to people. Desktop and tablet only. Nothing else is built unless a tester's reaction says so.**

What "done" means for this goal (declarative — each line has a test named in § SC):

1. A first-time visitor, on the live site, with no repo access, can run the bundled pair and can follow an **on-site** guide that tells them what to click and what result to expect.
2. The same visitor can download a **spreadsheet template** for each input slot, open it in Excel / Numbers / Google Sheets, change a cell, drop the file back, and see the verifier catch exactly that change.
3. Every honesty property that holds for JSON input holds for spreadsheet input: provenance is a fact about the action, `simulated` is an OR over both sides, the C10 gate is green, nothing is sent, nothing leaves the tab.
4. The public record (README, `/docs`, `docs/how-to-test.md`) says the same thing the site does, and says "desktop and tablet only" as a decision, not a gap.

---

## Why a spreadsheet, and why it is small

The engine reads very little of the ACP/UCP documents it accepts. Measured against `verify-in-browser.ts` and `lib/verifier-core/*`:

- **Feed side** (what an agent reads): `item_id` · `title` · `price` · `currency` · `availability` (`in_stock` / `out_of_stock` / `pre_order`) · optional `availability_date` · `expiration_date` · `group_id` · `variant_dict.variation` · `is_eligible_search` / `is_eligible_checkout`.
- **Record side** (the merchant's truth): `asOf` · per row `variations[].id` · `.name` · `.priceCents` · `.stock` (`in_stock` / `soldout_86` / `hidden`); `items[].id` + `.name` as the naming policy.
- **Matching** is exact shared id (`variations[].id == item_id`). No fuzzy resolution runs on this seam.

Everything else in the fixture JSON (seller URLs, privacy-policy links, brand, images, target countries) is protocol ceremony no tester should type. A CSV with five to seven columns per side carries every field a rule reads. The adapter is a **pure, deterministic, dependency-free** function from CSV text to the existing `AcpFeed` / `SyntheticCatalog` types — the engine, the report, the delivery builders and every existing test stay untouched.

---

## D — design decisions (owner GO needed; recommendation first)

- **D-1 One CSV per slot (recommended)** vs one combined sheet. Two files keep the product's thesis visible (feed ≠ record) and reuse the two existing slots unchanged; a combined sheet is lower friction but blurs the very distinction the instrument exists to draw.
- **D-2 Columns.** *(As built in S1 — widened from the draft once the engine's read-set was measured: the cross-field and pricing rules need `sale_price`, `currency`, `searchable`, `buyable`, and the claim payload carries `group`. Blank cells take documented defaults, so the first five columns are all a tester must touch.)*
  Feed template `menu-as-published.csv`: `item_id, name, variation, price, sale_price, currency, availability, available_from, expires, searchable, buyable, group`.
  Record template `menu-record.csv`: `item_id, name, variation, price, stock, as_of, group` (`as_of` optional, see D-3; `group` optional — rows group into items by `group`, else by `name`).
  Plain words in cells: `stock` accepts `in stock` / `sold out` / `hidden`; `availability` accepts `in stock` / `out of stock` / `pre-order`; `searchable`/`buyable` accept yes/no. Prices accept `21.50`, `21.5`, `12`, `$21.50`, `1,250.00`. Headers match case- and space-insensitively; extra columns are ignored. Templates ship **pre-filled with the bundled pair**, so a tester edits rather than authors, and the two files already share ids.
  **Declared limit (recorded, tested):** feed prices are normalized to two decimals because spreadsheets drop trailing zeros and the engine compares price strings exactly. The fixture's cents-as-decimal row (`2150`) therefore arrives as `2150.00` and is caught as `LST-PRICE-VALUE`, not `LST-PRICE-CENTS-AS-DECIMAL` — a JSON-serialization defect a spreadsheet cannot carry. Same row, same severity, same tally; different rule id. The round-trip test asserts this exception by name rather than skipping it.
- **D-3 `as_of` when the column is absent: default to the drop-day at `00:00:00Z` and SAY SO in the report header (recommended)** vs refuse. The JSON path refuses a missing `asOf` because a clock makes the same document give different verdicts on different days — that reasoning is about a *committed* document. A tester's spreadsheet is dropped once; the honest move is to use today, label it ("record dated 2026-09-01, taken from the day you dropped the file"), and let the staleness rules run. Refusing would make the most likely first tester fail on a column they have never heard of.
- **D-4 Where the guide lives: a "Test it yourself" section on `/docs` plus a one-line affordance in the INPUTS station ("Prefer a spreadsheet? Download the template") (recommended)** vs a new `/test` route. A new route belongs in the nav, and the nav is the repo's most pinned component (`canonical.spec.ts`); `/docs` is already reachable from every footer.
- **D-5 Fee statement as a spreadsheet — slice 4, after the listings pair lands.** Columns would be `order_id, month, category, label, amount, order_subtotal, refund, passthrough_documented`. Same adapter pattern, same tests. Not in the first GO.
- **D-6 CSV parsing: hand-rolled RFC 4180 (recommended)** vs a library. ~60 lines: quoted fields, escaped quotes, CRLF, a UTF-8 BOM (Excel writes one), trailing blank rows. Zero dependencies keeps the browser path inside the fail-closed import allowlist without a new exception, and the parser is small enough to test exhaustively.

---

## SC — success criteria, each with its test

- **SC-1 Guided path.** `evals/e2e/test-guide.spec.ts` walks the `/docs` guide's numbered steps against the built site and asserts the guide's expected counts (findings / errors / warnings for the bundled pair) **match the engine's committed golden** — the numbers in the guide are derived from `fixtures/`, never typed, so the guide cannot drift from the engine.
- **SC-2 Round trip.** `evals/packs/csv-adapters.test.ts`: the pre-filled templates → adapters → engine produce a report **identical** to the bundled JSON pair's report (same findings, same claim ids, same rule ids) — *as built: identical on every row but one, the declared cents-as-decimal exception in D-2, which the test rewrites in the expected report and asserts by name; the faithful pair round-trips to zero findings exactly.* This is the proof the templates and the JSON describe the same menu.
- **SC-3 The edit is caught.** Mutation tests on the CSV text: change one `price` → exactly one new `LST-PRICE-VALUE` finding on that `item_id`; set `stock` to `sold out` while the feed says `in stock` → `LST-AVAIL-STATE` on that row; delete a record row → `LST-EXIST-GHOST`; duplicate an id → refusal naming the row. Denominator declared before the run (one mutant per rule family the CSV can reach), never from observations.
- **SC-4 Refusals are honest and row-numbered.** Missing `item_id`, non-numeric `price`, unknown `stock` word, an id containing `#`, the reserved id `catalog` → refused with the row number and the reason. **Wrong VALUES are never refused** — a price that disagrees is the product's purpose and must reach the engine as a finding (existing rule, extended to CSV).
- **SC-5 Provenance + `simulated`.** A CSV run is `reader` on the side it was supplied; `simulated` is true iff any side is bundled; `matchingMode` stays `synthetic-controlled`. Existing provenance tests gain the CSV branch.
- **SC-6 Zero egress.** New modules appear in the delivery/egress import-graph tooth's walked set; the tooth stays green; adding a `fetch` to the adapter turns it red (proven once, recorded).
- **SC-7 C10 + register.** The rendered honesty scan is green over the new copy; `BANNED_PROBES` controls still bite; no sentence implies real platform access or a real merchant. Template file names and headers carry no "sample"/"demo" captioning (production register, owner-fixed 2026-07-31) — the data inside is labelled by the `simulated` flag the report already carries.
- **SC-8 Public record.** README's limitations line states desktop/tablet as a decision; `docs/how-to-test.md` gains the spreadsheet path with the same expected numbers as the on-site guide (one source, `fixtures/`); `readme-route-claims.test.ts` stays green; the README test count is re-measured on the day it is edited.
- **SC-9 Excel reality.** Adapter tests include a BOM-prefixed, CRLF, quoted-comma file exported from a real spreadsheet app (committed as a fixture under `fixtures/synthetic-restaurant/csv/`).

---

## S — slices (each closes on its own gate; the owner commits)

- **S1 — adapters, offline. DONE 2026-09-01.** `lib/playground/csv.ts` (RFC 4180 reader/writer: BOM, CRLF, quoted newlines, unterminated-quote refusal by line) · `lib/playground/csv-adapters.ts` (`feedFromCsv`, `recordFromCsv({today})`, `feedToCsv`, `catalogToCsv`, column contracts, template filenames) · `lib/playground/csv-fixtures.ts` (the constructed spreadsheet re-save shape, labelled UNVERIFIED against a real export) · `scripts-ts/generate-csv-templates.mts` → `fixtures/synthetic-restaurant/csv/` (three files, freeze-locked) · `evals/packs/csv-adapters.test.ts` **49 tests**: FREEZE (regenerate ⇒ bytes match; browser projections produce identical bytes so S2 needs no bundled file) · ROUND (drifted pair → golden finding-for-finding with the one declared exception; faithful pair → zero; catalog shape equal on every rule-read field) · MUTATE (13 declared edits on the faithful pair → exactly the named rule(s) on that row; denominator check that every golden rule is either declared reachable or named unreachable; GHOST/MISSING/ID-MISMATCH/STALE-AVAILDATE via the sweep) · REFUSE (empty/header-only/missing column/ragged row/`#` and `catalog` ids/duplicates/unreadable prices/unknown words/bad dates/conflicting `as_of`, each by spreadsheet row; wrong VALUES proven to reach the engine) · ARRIVE (BOM+CRLF+trailing-zeros re-save reads to the identical catalog and verdict; `$`/commas/`21.5`/`12`; Title-Case headers; extra columns; word variants) · `as_of` default reported and shown to change staleness verdicts exactly as a dated record would · grouping by `group` else `name` · SAFE (import walk: no Node builtin, no network capability). **Proven to bite:** a one-byte template edit → 2 FREEZE reds, regenerate restores byte-exact (sha256); removing the 2-dp normalization → ROUND + ARRIVE red (and, tellingly, the golden's cents-as-decimal row comes back — the trade-off is real and is the one declared). Engine, report, delivery builders, existing tests: untouched.
- **S2 — the slot accepts a spreadsheet. DONE 2026-09-01 (owner: "do best recommended steps next").** `verify-in-browser.ts` gained `detectInputFormat` (content, not extension), `parseFeedInput` / `parseRecordInput` (the ONLY parse the workbench now calls; the 5 MB cap applied before either branch; text that is neither shape is told so rather than handed a missing-column message), `RecordDated` (`record` | `drop-day`), and `feedTemplateText()` / `recordTemplateText()` (byte-identical to the committed fixtures). `FileDrop` `accept` += `.csv,text/csv`; a second control "Download the spreadsheet template"; paste labels read "Feed — JSON or spreadsheet (CSV)" / "Record — …"; the slot status says "from a spreadsheet". `run-bus` carries `recordDated`; `VerdictSlab` states the drop-day default aloud with the date in a `<time>`. Tests: `evals/packs/csv-input-dispatch.test.ts` (13) · `landing-delivery-egress.test.ts` +1 tooth proving the walk REACHES `csv-adapters.ts`/`csv.ts` · `evals/packs/workbench-spreadsheet.test.tsx` (7, jsdom-mounted `AuditWorkbench` + `VerdictSlab`, driven through the native file input and the paste box) · `evals/e2e/spreadsheet.spec.ts` (5, authored; one pin moved in `workbench.spec.ts` with its reason). **Rendered in a real browser: NOT from this seat** — Chromium SIGSEGV/SIGABRT under this sandbox (three binaries tried, raw on record), the out-of-sandbox request could not be granted, the IDE browser was unregistered; the offline build succeeded and the static server bound a port, so the export is servable. **CI's battery adjudicates the e2e on push.** Mutation: dispatcher forced to JSON → 11 reds. Gates: tsc 0 · eslint 0 · vitest 1683 + 8 (1662 + 21, accounted).
- **S3 — the guide.** `/docs` "Test it yourself" section (bundled path in three clicks · spreadsheet path in five · what you should see, numbers derived from fixtures) + INPUTS affordance + `docs/how-to-test.md` sync + README limitation line. Full loop (public claims). Gate: SC-1/8, C10 rendered scan.
- **S4 — fee statement spreadsheet (optional, after S1–S3 are live).**
- **Close.** Codex changed-files review of S2 + S3 (public surfaces) · one-push deploy window (the pattern in `header-policy.test.ts`) · four-point live verify · re-walk the on-site guide on production · record.

**Out of scope, by decision:** a phone tier (owner: no) · engine or rule changes · fuzzy id matching on this seam · live sends · new routes in the nav · redesign of anything owner-fixed in `DESIGN.md`.

---

## Risks named before building

- **Exact-id matching surprises a tester whose two sheets use different ids** — they get GHOST + MISSING findings, which is correct and confusing. Mitigation: the templates share ids by construction, and the guide's first sentence says the two sheets match on `item_id`.
- **A spreadsheet app rewrites the data on save** — `$` signs, thousands separators, dates reformatted to locale, a BOM, CRLF. D-2 and SC-9 exist for this; anything the adapter cannot read is refused by row, never guessed.
- **The guide's numbers drift from the engine.** SC-1 derives them from `fixtures/`; a hand-typed number in the guide is a test failure, not a style choice.
- **Register slip.** A template file called `sample-menu.csv` would reintroduce the demo captioning the owner retired on 2026-07-31. Names describe what the file *is* (`menu-as-published.csv`, `menu-record.csv`); the SIMULATED labelling stays where the builders enforce it.
- **Scope creep toward a "guided form."** The owner's option named both CSV and form; this plan picks CSV because a form is a second input UI to design, test and pin against an owner-fixed design, and a spreadsheet is the tool every intended tester already has. A form is a later decision if testers ask for one.
