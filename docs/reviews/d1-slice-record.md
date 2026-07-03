# D1 slice record — the demo (spec-faithful actor vs a spec-valid-but-false surface)

**Status:** BUILT, not committed (orchestrator judges first). Date 2026-07-03 (night).
**Plan basis:** `docs/plan-truth-audit-execution.md` §4 (C1/C2/C7/C10), §5 (D1 row), §2 condition 5 (slice-C cut). Dispatch packet: implementer lane, spec-adherence mode.
**Baseline → after:** `npm test` 515+5 → **557+5** (+42); `npm run test:legacy` **306+5** (untouched); `npm run build` green, `/demo` = Static; typecheck + lint clean.
**Verify evidence (executed, verbatim):** `docs/reviews/d1-verify-evidence.log` (full-suite + 4× red-green revert→RED→restore→GREEN).

## Demo claim (VERBATIM, C7 / Codex amendment 6)
> a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch

Single-sourced as `DEMO_CLAIM` in `lib/packs/listings/demo/copy.ts`; both renderers import it. Never "the agent gets caught" as a headline anywhere (machine-forbidden). Actor labeled **"spec-faithful demonstration actor — simulated"** on every surface.

## Architecture built (as decided in the packet — not deviated)
ONE deterministic transcript engine + two thin renderers.

- **Engine** — `lib/packs/listings/demo/`
  - `copy.ts` — single source of all honesty-critical strings (C7 claim, actor label, SIMULATED banner reused verbatim from the report page, foil line, per-beat leads). Browser-safe.
  - `types.ts` — `DemoTranscript` / `DemoBeat` (with the unused-now `annotation` slot for future owner-gated Gemini color) / `ActorSelection`. Browser-safe.
  - `actor.ts` — SOR-BLIND. `selectFromSurface(feed)`: fixed scripted intent (order "Smoked Brisket Plate" if the surface lists it in-stock), reads the surface at face value. Imports ONLY `../acp-feed.ts` (a type) + `./copy.ts` + `./types.ts` — no `reference.ts`, no fixtures. Throws (never no-ops) if the target is absent.
  - `transcript.ts` — the engine. Beats COMPUTE: (a) actor reads surface; (b) actor selects; (c) verifier runs the REAL `runListingsVerification(acpFeedToClaims(feed), sor)`, findings filtered to exactly the selected row and labeled a FILTERED view against the full count ("N findings for the selected item; full report: M findings"); (d) conformance-foil — REAL `runUcpConformance(doc)` passes AND the REAL truth leg `ucpSearchResponseToClaims(doc)` catches the price lie, both verdicts derived from results. Not browser-safe (pulls `conformance.ts` → `node:fs`); used by CLI + evals + generator only.
  - `render-text.ts` — pure deterministic text renderer (byte-frozen golden). Browser-safe.
  - `index.ts` — barrel.
- **CLI renderer** — `bin/check.mjs` new `demo` command + `runDemo()` in `cli.ts`. `--json` emits the transcript JSON; default emits the frozen text. Strict-flag discipline mirrors the check legs: only `--json` accepted; any other flag or any positional exits 2 loudly. Always exit 0 (walkthrough, not a gate). `npm run demo`.
- **Web renderer** — `app/demo/page.tsx` (server metadata) + `components/demo/DemoView.tsx` (Static, no hooks) rendering the COMMITTED transcript golden `expected-demo.json` + `copy.ts` — mirrors the report page exactly (which renders committed golden reports, since the fs-touching engine cannot run in the web build). Two registers per beat (plain lead leads, technical detail under, receipts last). SIMULATED banner. Nav link added. `dmo-*` CSS reusing the report's Ledger system.

## Selected demo item (why)
`item-006-v1 "Smoked Brisket Plate"` — a **price-value** drift (served $12.00 vs SOR $10.00), **in-stock on both** the faithful and drifted feeds. This makes the actor's SELECTION stable across both feeds (spec-faithfully availability-gated), so only the verifier's verdict changes between them — a crisp beats-compute red-green — while the harm ("the agent would transact at $12.00; the records say $10.00") is legible and quantified. Full drifted report = 16 findings; selected-item view = 1 (with the full count stated). Foil (`conformant-but-false.json`): conformance PASS, truth catches 1 price lie (item-001-v1, $23.50 vs $21.50).

## Hard constraints — how each was met (machine-enforced where stated)
- **Honesty single-sourced** — `evals/packs/honesty-c10.test.ts` extended: verbatim `DEMO_CLAIM` asserted present in `copy.ts`; banned "agent caught" framing asserted ABSENT from all demo files (source + committed goldens); simulated label asserted on every demo surface; the existing real-platform-access grep-gate now also scans the demo files. (RED-GREEN 3.)
- **Beats compute, never narrate** — `evals/packs/demo-transcript.test.ts`: faithful-feed mutation flips the selected-item verdict; faithful UCP-doc mutation flips the foil's truth verdict; conformance stays PASS in both. (RED-GREEN 1.)
- **Actor SOR-blindness machine-verified** — `evals/packs/demo-blindness.test.ts`: transitive import walk (alias-capable resolver) from `actor.ts` forbids `reference.ts` + fixtures + the LLM/provider ban set. (RED-GREEN 2.)
- **$0-LLM** — same import-graph discipline: the CLI demo path is covered by the existing `cli-c1` walk (now alias-capable); the WEB demo path has its own ban scan in `demo-blindness` (and asserts it renders the committed JSON, NOT the fs-engine).
- **Determinism** — no `Date.now()`/`Math.random()`/locale output; CLI text + transcript JSON byte-frozen goldens (`expected-demo.{txt,json}`, regen `npm run fixtures:demo`). (RED-GREEN 4.)
- **Fold-in i** — dead third clause removed from `listings-differential-c3.test.ts` `covers()` (strictly implied by the `referenceRowId` clause above it; comment cites the removal).
- **Fold-in ii (done FIRST)** — `cli-c1.test.ts`'s import walk adopted `report-view-c1.test.ts`'s alias-capable resolver; the blindness eval uses the same resolver.
- **No new npm deps.** No Gemini/live-AI (`ENABLE_LIVE_AI` untouched).
- **Untouchables** — `legacy/activation/` 306+5 (untouched); differential-oracle semantics, existing fixtures' bytes, and the check-mode exit contract all unchanged (freeze/golden tests stay green).

## Escalations (E-numbered — for orchestrator review)
- **E-1 (conservative reading): web renders a COMMITTED transcript golden, not live computation.** The packet says the web renderer "prerenders Static" and renders the transcript, and separately that beats must call the real entry points. `conformance.ts` reads pinned schemas via `node:fs`, so the engine cannot run in the Next.js web build. I mirrored the established W3 report pattern exactly: the engine computes the transcript (CLI + generator + evals exercise it live and prove beats-compute), and the web imports the committed `expected-demo.json`. This keeps `/demo` Static + $0 and single-sources the render data. Flagging in case the orchestrator wanted the web to compute in-process (would require a browser-safe conformance path — out of scope here).
- **E-2 (scripted intent choice): named-item intent on `item-006-v1` (price drift), availability-gated.** The packet allowed "pick a named item / cheapest qualifying item." I chose a NAMED item that is a price-value drift and in-stock on both feeds, so the actor's selection is stable and only the verdict changes (clean red-green + genuinely spec-faithful availability gating). "Cheapest qualifying" was rejected because the cheapest drifted-feed row is faithful (no drift on it), which would not demonstrate the claim. Documented so the choice is reviewable.
- **E-3 (PLAIN-ENGLISH correction, same-breath):** the pre-existing demo paragraph (line 54) described "a real AI agent" being "caught before the order happens" — divergent from what was built (scripted simulated actor; ends at selection; mechanism framing). Per documentation-standard ("divergence between registers is a defect — fix in the same task") I corrected it to the built reality + added a status row. Flagging because it touches narrative copy beyond the strict code scope.
- **E-4 (demo exit code): `demo` always exits 0**, even though the verifier finds drift. Rationale: the demo is a walkthrough of the mechanism, not a pass/fail gate (the `check` leg owns non-zero-on-drift). The packet says "Exit 0." Confirmed against the packet; noted in case a non-zero "drift present" signal was wanted.

## Files (absolute)
Created: `lib/packs/listings/demo/{copy,types,actor,transcript,render-text,index}.ts` · `components/demo/DemoView.tsx` · `app/demo/page.tsx` · `scripts-ts/generate-demo-transcript.mts` · `fixtures/synthetic-restaurant/expected-demo.{json,txt}` · `evals/packs/{demo-transcript,demo-blindness,demo-cli}.test.ts` · this record + `d1-verify-evidence.log`.
Modified: `bin/check.mjs` (demo command + USAGE) · `lib/packs/listings/cli.ts` (runDemo) · `package.json` (demo + fixtures:demo scripts) · `components/Nav.tsx` (Demo link) · `app/globals.css` (dmo-* + print) · `evals/packs/{cli-c1,listings-differential-c3,honesty-c10}.test.ts` · `docs/{PLAIN-ENGLISH,GLOSSARY,task-log}.md`.

## FABLE-EQUIVALENCE REVIEW (orchestrator/final judge, 2026-07-03) — PASS

Line-level diff reviewed (engine · actor · CLI mode discipline · web path · all 3 new evals · both fold-ins · doc diffs). Independent live re-run on the Fable seat: `npm run verify` exit 0 (557 passed + 5 skipped, +42 vs 515 baseline; `/demo` prerenders Static) · `npm run test:legacy` 306+5 untouched · CLI smokes re-executed (demo=0 · `--json` valid 4 beats · mixed=2 · surplus=2 · output byte-matches golden across two runs). Red-green authenticated: 4 executed probes with verbatim RED failure lines in `d1-verify-evidence.log`; each probe's mechanism independently read and confirmed real.

**Escalations adjudicated (final call):** E-1 ACCEPTED — the web-renders-committed-golden reading is correct AND fully mitigated: `demo --json` (live engine output) is byte-asserted against `expected-demo.json`, the exact file `/demo` renders, so the web demo provably cannot drift from the real verifier; blindness eval additionally forbids the web path from reaching the fs engine. E-2 ACCEPTED (named-item intent is the only choice that demonstrates the claim; reasoning sound). E-3 ACCEPTED with credit — a genuine honesty catch: the pre-existing PLAIN-ENGLISH paragraph used the banned "caught before the order happens" framing and a "real AI agent" claim; the correction was required, not scope creep. E-4 ACCEPTED (walkthrough-not-gate matches the packet and C7).

**Pre-approach advisor consult (frontier-advisor, PROCEED on shape C):** all four advisor constraints landed — single-sourced honesty copy (`copy.ts` + C10 extension with a bites-check) · machine-verified SOR-blindness with the alias-capable resolver adopted FIRST · beats compute from real entry points (mutation red-green) · scoped-evidence FILTERED-view label present in beat 3. The optional annotation slot for the future owner-gated Gemini color exists on the beat type.

**ELEVATION PASS (reversible fixes applied directly on the Fable seat):** 1 gap found and fixed — `fixtures/README.md` (the C9 corpus front page) did not index the two new `expected-demo.{json,txt}` goldens living inside the packaged corpus dir; added the `fixtures:demo` regen line, the goldens' role (web-render source, byte-locked to the live engine), and the demo-leg run instructions. Re-ran `corpus-packaging-c9` + `honesty-c10` after the edit: 65/65 green. Same-breath check: PLAIN-ENGLISH + GLOSSARY were already updated by the builder (glossary +2 terms; demo section + status row) — no drift found.

**Gate (per plan §5 D1):** verify green ✓ · red-green ✓ · zero live Gemini spend (owner gate untouched) ✓. The scripted D1 core is DONE at this record; the Gemini color variant remains OWNER-GATED (non-load-bearing; ≤$0.50) and the cargo/Rust C5 measurement call remains open at D1 close. Full ceremony (Codex batch + acceptance-gate) lands at M2 per S-4.
