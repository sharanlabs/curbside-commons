# W3 slice record — one-page report (web + machine JSON) + corpus packaging

**Slice:** W3 (plan `docs/plan-truth-audit-execution.md` §5 row W3 + §4 C1/C2/C4/C9/C10 + §3 "the report IS a document"/S-9). **Mode:** SPEC-ADHERENCE (delegated builder, Opus @ xhigh; Fable orchestrates/judges). **Date:** 2026-07-03. **Status:** built + self-verified; **NOT committed** (awaits Fable equivalence review of the diff → M1 Codex batch + acceptance-gate).

Professional register leads; *plain-English lines are marked ▸*.

▸ *Plain: W1/W2 built the checker and its two questions. W3 builds the two ways you READ the answer: a clean printable web page a person understands at a glance, and a machine-JSON version a CI robot can fail a build on — both from the same frozen result, for $0 with no AI. Plus it packages all the test data as one publishable set with a front-page guide (license still the owner's call).*

## 1 · What was built (grouped)

**Machine-JSON leg (C1) — the CLI output contract:**
- `bin/check.mjs` — documented `--json` trailing alias on BOTH legs (truth + conformance); header comment + USAGE state the machine-JSON contract. Default serialization unchanged (byte-identical), so the frozen golden reports stay locked; exit 0/1/2 unchanged.

**Web view leg (C4/C10) — the `/report` page:**
- `app/report/page.tsx` — thin server wrapper (exports `metadata` only) rendering the client view.
- `components/report/ReportView.tsx` — `"use client"`; surface toggle (ACP static feed / UCP catalog response); statically imports the COMMITTED golden fixture reports; renders one `VerifierReport` as one page — plain line leads each finding, the four C2 receipts always visible, verdict + C10 header ledger, unmissable SIMULATED banner.
- `lib/packs/listings/report-view.ts` — the PURE view transform `toReportView()` (no fs/fetch/LLM/clock); preserves every C2 field, leads with the C4 plain line, surfaces the C10 header, deterministic.
- `app/globals.css` — `rpt-*` report styles over the existing Ledger-Enterprise tokens + a `@media print` block (hides nav/footer/toggle, forces honesty labels + severity colors to print, `break-inside: avoid` per finding).
- `components/Nav.tsx` — `/report` nav link added.

**Corpus packaging (C9):**
- `fixtures/README.md` — top-level corpus index over BOTH fixture sets (regen commands, how-to-run, taxonomy keying on two axes kept separate, the `ucp-catalog-response.*` shape-honesty caveat VERBATIM, `License: pending owner decision`). Additive documentation only — no frozen fixture bytes touched, no LICENSE file added.

**Evals (red-green surfaces):**
- `evals/packs/report-view-c1.test.ts` — report-path $0-LLM import-graph proof + bare-`fetch(` scan; C2 four-field visibility through the view; C4 plain-line lead; C10 header surface; determinism.
- `evals/packs/corpus-packaging-c9.test.ts` — index self-containment (both sets, regen, run), taxonomy-key files exist, shape-honesty caveat verbatim in both READMEs, license-pending + no-LICENSE-added guard, upstream schemas' Apache-2.0 LICENSE intact.
- Edits: `cli-c1.test.ts` (machine-JSON leg: `--json` byte-identity + C10 header on both legs; **importsOf hardened** — see E-4); `honesty-c10.test.ts` + `listings-coverage-c6.test.ts` (scan `fixtures/README.md`).

**No new npm dependencies** (Next.js + existing stack sufficed; static JSON import + Node-24 type-stripping).

## 2 · Deviations / escalations (judgment calls for the orchestrator to overrule)

- **E-1 — the machine-JSON leg already EXISTS as the CLI default; `--json` is a documented alias, not a new format.** The CLI's only/default output is already canonical `serializeReport` JSON (`JSON.stringify(report, null, 2)`), which is exactly the "machine-readable, CI-usable" leg the task asks for. **My reading:** the smallest spec-adherent move is (a) keep the default byte-identical (frozen goldens must not move — `cli-c1` byte-compares them), (b) add `--json` as an explicit, documented, trailing alias so CI scripts can request JSON by name, and (c) make the genuinely NEW guarantee — the **C10 header surface** (specVersion pin · matchingMode · simulated) — a tested contract on both legs. `--json` is therefore a self-documentation convenience; the load-bearing red-green is on the header surface (RG-1), not the flag. **Overrule path:** if you want `--json` to gate a *second* (human-text) format instead, say so — that would require a non-default output and a goldens migration.
- **E-2 — "one page" = one cohesive printable document per report, NOT a hard one-physical-page cap.** The ACP golden has 16 findings, the UCP 13. Literally fitting 16 findings on one printed A4 page would require hiding evidence — but C2 forbids dropping any of the four receipts. **My reading:** "one-page report" (S-9, "the report IS a document") means one self-contained, print-clean document that renders one `VerifierReport` at a time (surface toggle switches which), with the print stylesheet keeping any single finding from splitting across a page break. It is compact (dense ledger rows) and needs no explanation, but it is not artificially truncated to one sheet. **Overrule path:** if a literal single sheet is required, the only honest way is per-severity pagination or a "top-N + count" summary — both hide findings, so I did not do that unasked.
- **E-3 — the corpus is taxonomy-keyed on TWO different axes; the index keeps them separate rather than conflating.** C9 says "taxonomy-keyed". synthetic-restaurant fixtures key to the plan §7 **drift** taxonomy (via `drift-manifest.json`); ucp-conformance-ci fixtures key to the 8 **structural conformance** classes `LST-CONF-*` (via `manifest.json`). These are different axes (menu-truth drift vs. schema-shape conformance). **My reading:** honest packaging labels each set to ITS taxonomy and states plainly they are different axes — the whole thesis is that a spec-shaped doc can still be untrue, so merging the two into one "taxonomy" would misrepresent the corpus. **Overrule path:** none expected; flagged for visibility.
- **E-4 — closed a real gap in the shared import-graph walk (touches a W2-owned test).** While red-greening the report-path $0-LLM proof (RG-2), a planted bare side-effect import `import "@/lib/agents/gemini";` did NOT go RED: the walk's `importsOf` regex only matched `... from "x"` and dynamic `import("x")`, missing the side-effect `import "x"` form — a latent hole shared with the existing `cli-c1` proof. **I hardened BOTH walks** (`report-view-c1` + `cli-c1`) to also catch `import "x"`. This is a strictly STRONGER proof (nothing weakened; goldens/semantics/ban-list untouched) and RG-2 now proves it bites on the sneakiest form. Editing the W2-owned `cli-c1` is beyond a minimal report-only change, so I flag it: leaving a known hole in the wedge's $0-LLM proof once discovered was the worse option. **Overrule path:** if you want the `cli-c1` change reverted and the gap tracked as a separate ticket instead, it is a one-line regex revert.
- **E-5 — the surface toggle requires a client component.** Rendering one `VerifierReport` at a time with an ACP/UCP toggle needs interactivity, so `ReportView` is `"use client"` and `page.tsx` stays a thin server wrapper (metadata). The client state is pure ($0, no network; both goldens bundled at build); the route still prerenders `○ Static` (SSR default = ACP, fully readable with JS off / under reduced motion). This matches the existing console idiom (Nav, Reveal, CatchPanel are all client). **My reading:** smallest idiomatic way to honor "renders A VerifierReport as one page" while using both golden fixtures. **Overrule path:** a zero-JS variant would use `/report/[surface]` static params or stack both reports (the latter breaks "one page").
- **advisor unavailable (8th consecutive session, surfaced verbatim).** maker=judge mitigated by RED-GREEN ×7 + this record + the standing M1 Codex cross-model batch. Family bias remains for M1 to catch.

## 3 · Red-green index (raw in `docs/reviews/w3-verify-evidence.log`)

| # | Change proven | Mutation → RED | Target eval |
| --- | --- | --- | --- |
| RG-1 | C1 machine-JSON / C10 header surface | `buildReport` specVersion → `""` | `cli-c1` (5 failed) |
| RG-2 | Report-path $0-LLM import-graph (side-effect form) | plant `import "@/lib/agents/gemini";` in ReportView | `report-view-c1` (2 failed) — see E-4 |
| RG-3 | C2 evidence visibility in the view | drop `referenceRowId` in `toReportView` | `report-view-c1` (2 failed) |
| RG-4 | C4 plain-line lead | blank `plainLine` in `toReportView` | `report-view-c1` (2 failed) |
| RG-5 | C9 shape-honesty caveat verbatim | soften the caveat in `fixtures/README.md` | `corpus-packaging-c9` (1 failed) |
| RG-6 | C9 license-is-owner-call | plant a `LICENSE` in synthetic-restaurant/ | `corpus-packaging-c9` (1 failed) |
| RG-7 | C10 header surface in the view | drop `specVersion` passthrough in `toReportView` | `report-view-c1` (1 failed) |

Each: mutate → RED → restore → GREEN (all reverted; only intended W3 files remain changed).

## 4 · Gates

- `npm run verify` → **exit 0** — Test Files 39 passed | 4 skipped (43); **Tests 505 passed | 5 skipped** (W2 baseline 478; +27); `next build` ✓, `/report` prerenders `○ Static` (29/29 static pages).
- `npm run test:legacy` → **exit 0** — **306 passed | 5 skipped** (unchanged, hard constraint).
- CLI machine-JSON demos: `check ... --json` (drifted) → 1; `check ...` (faithful) → 0; `check ... --conformance --json` → 0.
- Prerender spot-check (static HTML): SIMULATED label · `ucp-pin-2026-04-08` · `synthetic-controlled` · 16 finding cards · both surface tabs · per-card claim/reference-row/rule receipts · FAIL verdict — all present without JS.
- `git status`: only intended W3 files changed; no frozen fixture bytes mutated; no residue (RG-6 LICENSE plant removed).

## 5 · Acceptance-criteria self-check (against §4 wording)

- **C1 (one-command validator / $0-LLM):** machine-JSON leg is the CLI default + `--json` alias (`bin/check.mjs`); report-page path proven LLM/provider/network-free by `report-view-c1` (import-graph, hardened to catch side-effect imports). ✓
- **C2 (evidence-cited findings):** `toReportView` (`lib/packs/listings/report-view.ts`) maps each finding → one row carrying claim · referenceRowId · ruleId · severity verbatim; the renderer shows all four per card; eval asserts no field dropped/synthesized. ✓
- **C4 (one-page report, plain line, printable):** `/report` renders one report as one cohesive printable page; plain line leads every finding; print stylesheet (`@media print` in globals.css) prints clean, no finding split across a page break. "One page" reading recorded (E-2). ✓ (final human-judged C4 doc-standard gate = M1/gate-4)
- **C9 (corpus publishable):** `fixtures/README.md` — self-contained index over both sets, taxonomy-keyed (E-3), shape-honesty caveat verbatim, **License: pending owner decision** (no LICENSE added). ✓
- **C10 (honesty surface):** every report header pins specVersion + matchingMode + simulated (web + JSON); SIMULATED banner visually unmissable + print-forced; C10 grep-gate extended to `fixtures/README.md`; no real-platform-access / "all edge cases" claims. ✓

## 6 · Fable equivalence review + elevation pass (orchestrator seat, 2026-07-03)

**Verdict: PASS with three elevation fixes applied directly** (reversible; owner elevation mandate 2026-07-03). The line-level diff review confirmed §1–§5 claims at file:line; the RG log was authenticated (7 cycles, failure counts match §3); React keys checked unique on both goldens; print block verified. Three findings, all fixed on the Fable seat:

- **F-1 (defect, fixed + RG-8): `--json` was documented but never parsed.** The CLI's arg scanning ignored unknown flags entirely — `--jsn`, `--banana` behaved identically to `--json`, and a CI typo silently fell back to defaults. E-1's alias reading stands, but a documented flag must be REAL: `bin/check.mjs` now validates flags against a known-flag table (`--against/--surface/--conformance/--op/--json`) and exits 2 loudly on anything unknown. Red-green executed (RG-8 in the evidence log: RED = typo'd flag exited 0; GREEN = 14/14).
- **F-2 (honesty polish, fixed): `/report` UCP-tab label + banner wording.** The tab's plain label now states the UCP report renders a *constructed simulation, normalized shape, not wire format* (consistent with the corpus shape-honesty note); the SIMULATED banner no longer implies the truth-leg reference is a schema (it is the simulated SOR).
- **F-3 (flake, fixed): the orchestrator's independent full-verify re-run failed 2 W2-era spawn tests on the default 20s timeout** ("Test timed out in 20000ms", raw in the evidence log) — W3's added spawns slowed the file under parallel load; the builder had fixed this class only for its own new tests. All 7 W2-era spawn tests now carry the same 60s timeout. No assertion weakened.

Same-breath PLAIN-ENGLISH/GLOSSARY check (the W2 builder-miss): both were already updated by the builder this slice — verified present, no gap.

## 7 · Deferred / not done (by design)

- **License choice** — owner call, left as "pending owner decision" (plan O6 / Pub slice). Not chosen, not added.
- **Design overhaul / deploy** — deferred by owner ruling; the page matches the existing console idiom, no new design language introduced.
- **Mobile** — out of scope (desktop web only, owner 2026-07-02); the page is responsive-degrading but not mobile-designed.
- **C5 differential-oracle (cargo)** — unchanged from W2 (UNMEASURED locally; owner escalation still open).
- **Commit / push / publish** — not done; diff left uncommitted for Fable equivalence review → M1.
