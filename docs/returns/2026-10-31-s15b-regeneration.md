# Return packet — S1.5b: UCP pin flip + three plainLine register fixes, one regeneration (Wave 2, lane 9) — 2026-10-31

**Plain English:** the checker now pins the newer UCP spec (`2026-08-25`), and three finding sentences use the record's wording ("vs the record's", "is served on the copy"). Every expected report was regenerated once, in one pass. The crew's exam records pin those report bytes, so they were re-pinned once, by re-running the engine. What the checker finds did not change: no finding was added or removed, and no rule id, finding id, severity, verdict or class moved. The bundled tally is unchanged (FAIL · 16 findings · 11 errors · 5 warnings · 25 rows). The full suite is green at the same count. One public-facing figure is now stale and sits outside this lane's files (OPEN 1).

## SLICE

S1.5b per `docs/packets/2026-10-31-s15b-regeneration.md`, under `docs/wave2-lane-contract-2026-10-31.md`. Worktree `.worktrees/s15b-regeneration`, branch `wave2/s15b-regeneration`, cut at `230537d`. `main` was fast-forward merged to `22b9220` on the orchestrator's note (the `W3` pilot-label fix, `3a53d60`) before the first full vitest. `stamp-case-digests.mts --check` printed `0 file(s) out of date` at start, as briefed.

| CP | State |
| --- | --- |
| CP1 plainLine fixes | **done.** `detectors.ts:147` "is being served to customers." → "is served on the copy." · `:166` and `:177` `vs the real "${expected}"` → `vs the record's "${expected}"`. The code's double quotes are kept; the packet's single quotes were notation. |
| CP2 pin flip | **done.** `ucp.ts:43` → `"2026-08-25"`. `ucp-conformance.test.ts` asserts the new active pin, with both vendored folders still exercised. The oracle diff gives **33/35 agree · 2 documented format-class divergences · 0 disagree** at `2026-08-25`. |
| One regeneration | **done.** Both source edits were committed first, as two commits. Every generator then ran once, the hashes were re-pinned once, and the digests were re-stamped once, all in one commit (`cc8d76b`). |
| CP3 record | **done.** One paragraph in `docs/model-risk-register.md` § 1 (see DEVIATIONS 4 for where it sits). `pilot-figures.ts` STATE: nothing to flip. `fixtures/scenarios/README.md` does not name the pin ("engine (spec version, read from code)"), so it has no change. |
| CP4 gates | **done**: all green, and the test count is unchanged. |

## GIT

`git status --short` → empty (before this packet's commit).

```
2af8573 wip(s15b-regeneration): CP3 — one dated paragraph in docs/model-risk-register.md § 1 …
cc8d76b wip(s15b-regeneration): ONE regeneration for CP1+CP2 — every generator run once …
078fa60 wip(s15b-regeneration): deviations for the pin move — ucp-corpus schemaSource … four hard-coded pin literals …
b748af6 wip(s15b-regeneration): CP2 source — UCP_PINNED_VERSION 2026-04-08 → 2026-08-25 …
48bb904 wip(s15b-regeneration): CP1 source — three plainLine register fixes in detectors.ts …
22b9220 docs(state): session-50 blocks after the S2-crew merge   ← main, merged in
```

Totals: 101 files changed, 165 insertions, 162 deletions (against `22b9220`, before this packet). `git ls-files node_modules` → empty.

## CHANGED

**Source (allowed):**
- `lib/packs/listings/detectors.ts`: the three plainLine sentences (CP1).
- `lib/packs/listings/ucp.ts`: `UCP_PINNED_VERSION` `2026-04-08` → `2026-08-25` (CP2).
- `evals/packs/ucp-conformance.test.ts`: the pin assertion, its `it` title, and the header comment that says which pin is active.
- `docs/model-risk-register.md`: one paragraph (CP3).

**Source (outside the allowed list; DEVIATIONS 1–2):**
- `lib/packs/listings/ucp-corpus.ts:186`: `schemaSource` is now derived from `UCP_PINNED_VERSION`.
- `evals/packs/cli-c1.test.ts:152,204,222` and `evals/packs/report-view-c1.test.ts:160`: the pin literal.

**Regenerated through committed generators (spec string or CP1 copy only, line-classified below):**
- `fixtures/synthetic-restaurant/`: `expected-report.acp.json` (spec ×1, copy ×3) · `expected-report.ucp.json` (spec ×2, one being the `LST-SPECVER-MISMATCH` sentence that quotes the pin; copy ×3) · `expected-demo.json`, `expected-demo.txt`, `drift-manifest.json`, `ucp-catalog-response.faithful.json` (spec ×1 each).
- `fixtures/ucp-conformance-ci/`: 34 documents (`ucp.version`) · `manifest.json` (`specVersion`, `schemaSource`).
- `fixtures/scenarios/`: 6 `manifest.json` `engine` (spec-valid-lie also `ucp_version`) · 6 `expected/report.json` `specVersion` · `spec-valid-lie/expected/ucp-truth-report.json` · `spec-valid-lie/inputs/ucp-response.json` (`ucp.version`) · `spec-valid-lie/brief.md` ("UCP version 2026-08-25").
- `docs/assets/demo.svg` (`Spec pin:` line; `render-demo-svg.mts`) · `evals/mcp/gold/mcp-session.transcript.json` (3 pin strings; `record-transcript.mjs`).
- `evals/crew/cases-live/*.case.json`: 9 `expectedEngineReportHash` lines, written by `generate-l1-live-cases.mts`, the folder's committed generator. The generator rewrote all 20 files; 11 came back byte-identical.

**Re-derived by running the harness (no committed script exists; one-off scripts in the appendix, not committed):**
- `evals/crew/cases/*.case.json` (6) and `evals/crew/cases-s2/*.case.json` (8): `expectedEngineReportHash`.
- `evals/crew/cases/{evi-conf-valid-clean,int-route-conf-happy}.case.json` and `evals/crew/cases/recorded-turns.json` (2 entries): `manifestDigest`, by `stamp-case-digests.mts`.
- `evals/crew/gold/replay-records-a2.golden.json` (6 `engineReportHash`) · `evals/crew/gold/l1-live-records.json` and `consistency/rep-{1,2,3}/l1-live-records.json` (9 `engineReportHash` each) · `render-s2-im-agent-86-orders.golden.txt` and `render-s2-rc-sync-outage.golden.txt` (the "engine report consumed: sha256" line).
- `evals/tools/gold/{check_feed,check_conformance,run_demo}.golden.json`: spec string, plus copy ×3 inside check_feed's canonical. The other three envelope goldens were rewritten byte-identical.
- `evals/delivery/gold/slack-feed-drifted.golden.json`: copy ×3. The two fees goldens were rewritten byte-identical.
- `fixtures/landing/finding-browse.golden.json`: copy ×3. Its lock asks for a **human-reviewed re-commit**; the three lines are below for that review.

**Not changed, and checked:** `member-case-matrix.golden.json`, the four `l1-live-matrix.json`, `consistency-report.json`, the two A2 render goldens, every `l1-live-turns.json`, `evals/crew/cases-s2/recorded-turns.json`, every lock file (`l1-*-lock`, `crew-composition-lock*.test.ts`), `lib/landing/test-guide.ts` and its test, all fee fixtures, the browser and CSV fixtures, and the orders and entity corpora.

### Every changed golden line, classified

A classifier (appendix C) walked every changed line of all 101 changed files against `22b9220`. Each changed line must reduce to its old line under only the pin substitution, the three sentence rewordings, or a 64-hex hash value. Result: **71 pin lines** (66 in goldens, plus the `ucp.ts` constant and the four test literals) · **16 copy lines** (13 in goldens, plus the three `detectors.ts` source lines) · **71 hash lines** (23 `expectedEngineReportHash`, 4 `manifestDigest`, 42 record `engineReportHash`, 2 render lines; all in `evals/crew/**`). It flagged exactly three files, all intentional: the `ucp-corpus.ts` source line (DEVIATIONS 1), and two hand-written edits that change line counts (the register paragraph, and the `ucp-conformance.test.ts` header comment). **No golden carries any other changed line.**

The landing re-commit, line by line (`fixtures/landing/finding-browse.golden.json`, page copy a reader sees):
- index 1, LST-AVAIL-HIDDEN-SHOWN: "…but is being served to customers." → "…but is served on the copy."
- LST-ENC-TRUNC: `… "Margherita…" vs the real "Margherita Pizza (Medium)".` → `… vs the record's "Margherita Pizza (Medium)".`
- LST-ENC-UTF8: `… served "JalapeÃ±o Poppers (Large)" vs the real "Jalapeño Poppers (Large)".` → `… vs the record's "Jalapeño Poppers (Large)".`

### Crew hashes re-pinned, by folder

| Folder | Re-pinned | Unchanged (fees-backed) | Null (refused or blocked; stays null) |
| --- | --- | --- | --- |
| `evals/crew/cases` | **6** | 9 | 5 |
| `evals/crew/cases-live` | **9** | 7 | 4 |
| `evals/crew/cases-s2` | **8** | 1 (`s2-im-fee-precheck`) | 0 |
| **Total `expectedEngineReportHash`** | **23** | 17 | 9 |

Derived record hashes re-derived: replay-records-a2 6 · l1-live-records 9 × 4 files · S2 renders 2, for **44** in all. `manifestDigest`: 2 cases and 2 turn entries (`evals/crew/cases` only).

Hash map (old → new, first 12 hex): `756a27ee7aa0→b5ef1e775b0b` ACP faithful (aud-feed-clean, l1-int-route-feed-faithful) · `3aabaaacda38→a52e64697540` ACP drifted (evi-feed-drifted-refs, int-route-feed-happy, rev-approve-violations) · `0f6dbc79c8be→1aa0ef5d77a0` UCP drifted (l1-aud-feed-ucp-drifted, l1-evi-feed-ucp-drifted-refs) · `d15f079b8e14→63840b2dc982` l1-evi-injection-feed · `0f034e4bd79e→6e241ae574b0` conformance clean (evi-conf-valid-clean, l1-evi-conf-enriched-clean, l1-int-route-conf-valid) · `2fe187bab9c5→b8b42ae8678c` int-route-conf-happy · `77f1e021c6ed→f62fc033e29a` l1-aud-conf-invalid · `4fc243233232→c55436a3458f` l1-evi-conf-invalid-refs · `64b8b9e55751→3169bc7857bc` l1-rev-approve-conf-invalid · `3e90810909ff→c642bcb72b31` agent-86 (four S2 cases) · `b8a08ba6a223→77be527f86cb` sync-outage (two) · `cf3e432ecfee→9850db697873` partner-onboarding · `fb2dfabf5fc1→8bd4269264f6` platform-override.

**Proof that each re-pin is the spec label and the copy, and nothing else** (appendix D). For all 40 hashed cases, the engine canonical was dumped at `22b9220` (old lib, fixtures and cases) and at HEAD. Three things held for every case: the old pinned hash equals sha256 of the old canonical; the new pinned hash equals sha256 of the new canonical; and the new canonical equals the old one under the pin and copy substitution alone. Result: 40 cases, 23 canonicals moved, **0 bad**. The re-derived matrices and the consistency report are byte-identical, so a missed hash would have shown as `safetyPass:false`.

### INPUT artifacts whose bytes moved (caller's addition 1), spec label only

- `fixtures/ucp-conformance-ci/{valid,invalid}/*.json` (34): `ucp.version` `2026-04-08` → `2026-08-25`. The corpus recipe stamps `UCP_PINNED_VERSION` into each envelope. A2 cases read two of them (`valid/search-single-product.json` → evi-conf-valid-clean; `invalid/pattern-currency-lowercase.json` → int-route-conf-happy), which is why those two cases and their turn entries were re-stamped. `cases-live` reads five more but is not a stamped folder.
- `fixtures/synthetic-restaurant/expected-demo.json`: the `specVersion` inside the demo payload. l1-aud-demo-refused-live reads it (a refused result, hash null).
- `fixtures/synthetic-restaurant/ucp-catalog-response.faithful.json`: one `supported_versions` entry. No crew case reads it.
- `fixtures/scenarios/spec-valid-lie/inputs/ucp-response.json`: `ucp.version`. No crew case reads it.
- No S2 input moved (`agent-86`, `sync-outage`, `partner-onboarding`, `platform-override`, `fee-precheck` inputs are byte-identical), so `cases-s2` needed no re-stamp.

`stamp-case-digests.mts` → `3 file(s) stamped`; `--check` → `0 file(s) out of date`. Recorded turns: no `decision`, `raw` or `usage` byte moved anywhere. In `evals/crew/cases/recorded-turns.json`, only the two `manifestDigest` values the stamp script owns moved. **The live turns' `quarantinedArtifactExcerpt` strings still quote `2026-04-08`.** That is what the live model was shown on 2026-07-07 and 2026-07-27, kept as provenance. The locks consume `.decision` only.

## TESTS

- Before (main `22b9220`, after build-offline): **2293 passed + 8 skipped** (147 files + 7 skipped).
- After: **2293 passed + 8 skipped** (147 files + 7 skipped). The count is unchanged, and no test was added or removed.
- Reds observed and cleared: after the regeneration, before the literal fixes, the full suite gave 4 failed (`cli-c1` ×3, `report-view-c1` ×1, all on the hard-coded `2026-04-08`). Nothing else went red.
- Mutation (the new pin assertion bites): `UCP_PINNED_VERSION` was set back to `"2026-04-08"` with the fixtures left regenerated. `ucp-conformance.test.ts` → 3 failed / 18 passed: the pin assertion, plus the corpus and manifest freeze, which catch the corpus recipe's pin stamp. Restored with `git checkout -- lib/packs/listings/ucp.ts` → 21 passed.

## COMMANDS (exit codes)

- `node scripts-ts/stamp-case-digests.mts --check` at start → 0 (`0 file(s) out of date`)
- `git merge main` → fast-forward to `22b9220`
- `node scripts/build-offline.mjs` → 0 (run before each of the three full vitest runs)
- `npx vitest run` baseline → 0 · 2293 + 8 skipped
- generators, each → 0: `generate-wedge-fixtures` · `generate-fee-fixtures` · `generate-orders` · `generate-browser-fixtures` · `generate-csv-templates` · `generate-ucp-conformance-corpus` · `generate-scenarios` · `generate-demo-transcript` · `generate-entity-corpus` · `render-demo-svg` · `node evals/mcp/record-transcript.mjs` (first to a scratch `--out`, diffed as pin-only, then in place)
- `node <scratch>/repin-hashes.mts --check` then without the flag → 0 (`moved 14 · unchanged 10 · null 5`)
- `node scripts-ts/generate-l1-live-cases.mts` → 0
- `node scripts-ts/stamp-case-digests.mts` → 0 (`3 file(s) stamped`); `--check` → 0 (`0 file(s) out of date`)
- `npx vitest run evals/zz-s15b-regen.test.ts` (one-off, then deleted) → 0
- `npx vitest run` after the regeneration → 1 (4 failed, the literals); after the literal fixes, the two files → 0 · 33 passed
- `node scripts-ts/ucp-oracle-diff.mts` → 0 · **33/35 agree · 2 documented (LST-CONF-FORMAT: format-product-url, format-media-url) · 0 disagree**, against `DEFAULT_UCP_SCHEMA_DIR`, which now resolves to `fixtures/ucp-schemas/2026-08-25/schemas`
- `npx tsc --noEmit` → 0 · `npx eslint . --max-warnings=0` → 0
- `npx vitest run` final → 0 · **2293 passed + 8 skipped**
- named suites, each → 0: `honesty-c10` 281 · `scenarios` 123 · `scenario-cli` 6 · `test-guide` 14 · `ucp-conformance` 21 · `landing-browse-drift-lock` 2 · `demo-svg-freshness` 4 · `registry-envelope-goldens` 6 · `mcp-transcript-freeze` 4 · `delivery` 31 · `evals/crew` 278
- the canonical proof (appendix D) → 40 hashed · 23 moved · 0 bad
- bundled tally from `expected-report.acp.json`: ok=false · 16 findings · 11 error · 5 warn · 25 feed rows
- `git ls-files node_modules` → empty
- after the packet commit: `npx vitest run evals/packs/honesty-c10.test.ts` → 1 (3 failed). This is the known sandbox case: the canonical proof's `git checkout` round-trip touched `lib/` mtimes, so the rendered leg tried `npm run build` and was denied `fonts.googleapis.com`. Then `node scripts/build-offline.mjs` → 0, honesty-c10 → 0 · 281, the full `npx vitest run` → 0 · 2293 passed + 8 skipped, and `stamp-case-digests --check` → 0.

## DEVIATIONS

1. **`lib/packs/listings/ucp-corpus.ts:186` (outside the allowed list).** `schemaSource` was the literal `"fixtures/ucp-schemas/2026-04-08 (… @ v2026-04-08, Apache-2.0)"`. After the flip, the corpus is validated against the `2026-08-25` folder (`DEFAULT_UCP_SCHEMA_DIR` follows the pin), so the regenerated `fixtures/ucp-conformance-ci/manifest.json` would have named the wrong folder beside `specVersion: 2026-08-25`: a false provenance line in a committed fixture. It is now `` `fixtures/ucp-schemas/${UCP_PINNED_VERSION} (Universal-Commerce-Protocol/ucp @ v${UCP_PINNED_VERSION}, Apache-2.0)` ``. The 2026-08-25 PROVENANCE.json confirms tag `v2026-08-25` and Apache-2.0. The manifest line that moved is the spec string only. S1.5 OPEN 1 named this line as a mislabel.
2. **`evals/packs/cli-c1.test.ts:152,204,222` and `evals/packs/report-view-c1.test.ts:160` (outside the allowed list).** Four `toContain("…2026-04-08")` literals went red on the flip, and no generator owns them. Each now reads the new pin as a literal. The constant was not imported, so the next pin move stays a deliberate edit and not a silent pass. These were the only reds (S1.5 OPEN 1 listed them as "in scope, ready to edit in the same change"). The alternative was to stop with the done-test ("full suite green") unmet.
3. **Goldens with no committed regeneration script were re-derived by one-off harness code** (appendices A and B; neither file is committed). Each writes exactly what the golden's own freeze test computes: `replayAll()`, the committed-turn `runCase` replay used by `l1-live-lock` and `l1-consistency-lock`, `renderTrajectory`, `callTool` with the registry-envelope params verbatim, `buildSlackReportPayload`, and `FINDINGS_INDEX`. The harness file was placed at `evals/zz-s15b-regen.test.ts` only so vitest's `@/` alias resolves, ran once, and was deleted before any commit. Every written byte was then line-classified (appendix C). No hash or golden was typed by hand.
4. **The register has no "§ exam records" heading.** The paragraph sits in § 1, directly after the existing "On the Intake and Reviewer exam" paragraph, which carries the earlier 2026-07-24 derivation note. Nothing else in the register was touched.
5. **`replay-records-a2.golden.json`'s `note` was left as written** ("dumped from cd0d347 BEFORE any S2-crew lib edit"), because only hash lines may move. Its records now carry the re-pinned hashes; see OPEN 5.

## OPEN

1. **Public figure now stale: the /proof page states the old pin as active.** `lib/dashboard/evidence.ts:156-162` holds `ucpSchemaCount: 78`, `ucpSpecVersion: "2026-04-08"` and `ucpProvenance` → `fixtures/ucp-schemas/2026-04-08/PROVENANCE.json` (frozenAt `1d0697e`). `app/proof/page.tsx:495-501` renders "Official schemas, spec version {ENGINE.ucpSpecVersion}", and `lib/landing/specimen.ts:237` carries `schemas: ENGINE.ucpSchemaCount`. The checker now validates against the `2026-08-25` folder (116 files). `evals/packs/dashboard-evidence.test.ts` only checks ENGINE against the folder ENGINE itself names, so it stays green. **This should be fixed before this lane's merge is deployed.** The likely edit: `ucpSchemaCount: 116`, `ucpSpecVersion: "2026-08-25"`, `ucpProvenance: { file: "fixtures/ucp-schemas/2026-08-25/PROVENANCE.json", frozenAt: "9d0eedb", date: "2026-10-12" }` (9d0eedb is the commit that vendored the folder; 17bddd5, the last commit to touch the file, changed only its note; the test checks only the SHA format), plus a new assertion `expect(ENGINE.ucpSpecVersion).toBe(UCP_PINNED_VERSION)` so this cannot go stale silently again. It changes a reader-visible figure (78 → 116), so a page and landing review should follow.
2. **Vendored-folder notes now false:** `fixtures/ucp-schemas/2026-08-25/PROVENANCE.json` `note` ("VENDORED, NOT ACTIVE: the active pin stays 2026-04-08") and `fixtures/ucp-schemas/2026-08-25/README.md:10` ("the listings pack still pins `2026-04-08`"). `2026-04-08/README.md` still reads as the pinned folder. These are provenance documents next to verbatim upstream bytes, and they are outside this lane.
3. **Docs that still name `v2026-04-08` as the pin:** `README.md:75` ("78 pinned official UCP JSON Schemas (spec `v2026-04-08`)") and `:114` · `docs/PUBLICATION.md:43` ("the 78 UCP JSON Schemas") · `docs/GLOSSARY.md:79` · `fixtures/README.md:28,122` · `docs/demo-recording.md:21` (`Spec pin:` transcript) · `NOTICE:6` (names both tags, so it is still accurate). The RAG snapshots (`evals/rag/**`, `lib/rag/corpus-manifest.json`) quote dated docs; they are untouched and green.
4. **Stale comments outside the lane:** `lib/packs/listings/run.ts:36-47` still says the S1.5 pin and plainLine work is "NOT DONE". The pin and plainLine parts are now done. The `+menu-model-<date>` segment of `LISTINGS_SPEC_VERSION` is still deferred, and it would be a second exam-record re-pin, best batched with the next deliberate engine-string change. `evals/crew/crew-ledger-handoff.test.ts:19` passes a fixed `RULES` input naming the old strings. It is green: it is a ledger input, not an engine comparison.
5. **`replay-records-a2.golden.json` note:** suggest appending "engineReportHash re-pinned 2026-10-31 (S1.5b, spec label + three finding sentences)" at merge, if the orchestrator wants the note exact.
6. **Landing copy review:** the three re-worded lines in `fixtures/landing/finding-browse.golden.json` are page copy (its lock requires a human-reviewed re-commit). "served on the copy" relies on the page's own decode of "copy" (the platform's copy of the menu); worth one read on the rendered landing.
7. **Codex gates owed** (contract § 7): a review of this diff, especially DEVIATIONS 1–2 and the exam-record re-pin, when limits reset.

## NOT DONE

- Nothing in the packet's objective is undone. Explicitly **not** done, because outside the lane: OPEN 1 (`lib/dashboard/evidence.ts`, the public figure), OPEN 2 (vendored provenance notes), OPEN 3 (docs), OPEN 4 (the `run.ts` comment and the `+menu-model-` segment).
- Codex review: deferred by owner word (contract § 7).

## MODEL

Claude Opus 5.5 (`claude-opus-5-5`), the Opus seat the packet names, so there is no build to compare against. The judgment calls, for checking:
- I edited four test literals and one generator label outside the allowed list rather than stop. Each is a pin string, each is listed above, and the alternative left the done-test unmet. The `/proof` figure (OPEN 1) changes a public number, so it was left for review, not edited.
- I proved the re-pin directly, beyond the matrices staying byte-identical: for all 40 hashed cases, the old and new canonicals differ only by the pin and the three sentences. I kept the live turns' old excerpts as provenance and did not regenerate them.

## Appendix A — `repin-hashes.mts` (one-off, scratchpad; not committed)

```ts
/**
 * S1.5b one-off re-pin (NOT committed; text recorded in the return packet).
 * For every case in evals/crew/cases and evals/crew/cases-s2 whose
 * expectedEngineReportHash is non-null, RUN the engine through the registry on
 * the case's own contracted first call — exactly as crew-composition-lock-s2 and
 * l1-live-composition-lock re-derive it: callTool → assertDecisionGrade →
 * reportHash(result.canonical). Rewrites ONLY that one value; refuses a file that
 * does not round-trip byte-exactly under the plain or ASCII-escaped serializer. Null stays null.
 * Usage (cwd = worktree root): node <this> [--check]
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const { assertDecisionGrade, callTool } = await import(join(root, "lib/tools/registry.ts"));
const { reportHash } = await import(join(root, "lib/crew/orchestrator.ts"));
const check = process.argv.includes("--check");
// Same two serializers as scripts-ts/stamp-case-digests.mts (plain, or \uXXXX-escaped ASCII).
const asciiEscape = (t: string): string => t.replace(/[\u007f-\uffff]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
const ser = (v: unknown, mode: "plain" | "ascii"): string => { const t = JSON.stringify(v, null, 2); return `${mode === "ascii" ? asciiEscape(t) : t}\n`; };
let moved = 0, same = 0, nulls = 0;
for (const rel of ["evals/crew/cases", "evals/crew/cases-s2"]) {
  for (const f of readdirSync(join(root, rel)).filter((x) => x.endsWith(".case.json")).sort()) {
    const p = join(root, rel, f);
    const text = readFileSync(p, "utf8");
    const raw = JSON.parse(text);
    const mode = ser(raw, "plain") === text ? "plain" : ser(raw, "ascii") === text ? "ascii" : null;
    if (mode === null) throw new Error(`${p} does not round-trip under either serializer — refusing`);
    const old = raw.expectedEngineReportHash;
    if (old === null) { nulls++; continue; }
    const call = raw.expectedToolCalls[0];
    const result = callTool(call.tool, call.params);
    assertDecisionGrade(result);
    const h = reportHash(result.canonical);
    if (h === old) { same++; console.log(`same   ${rel}/${f}`); continue; }
    moved++;
    console.log(`moved  ${rel}/${f}  ${old.slice(0, 12)} → ${h.slice(0, 12)}`);
    if (!check) {
      raw.expectedEngineReportHash = h;
      const out = ser(raw, mode);
      // the only changed line must be the hash line
      const a = text.split("\n"), b = out.split("\n");
      const diff = a.map((l, i) => (l === b[i] ? null : i)).filter((x) => x !== null);
      if (a.length !== b.length || diff.length !== 1 || !a[diff[0]].includes(old)) throw new Error(`${p}: unexpected diff shape`);
      writeFileSync(p, out);
    }
  }
}
console.log(`moved ${moved} · unchanged ${same} · null ${nulls}`);
```

## Appendix B — `evals/zz-s15b-regen.test.ts` (one-off, run once via vitest for the `@/` alias, then deleted)

```ts
/**
 * S1.5b ONE-OFF golden re-derivation (run once, then deleted — NOT committed;
 * its text is recorded in docs/returns/2026-10-31-s15b-regeneration.md).
 *
 * Every golden written here is computed by the SAME call its own freeze test
 * makes, so the written bytes are exactly what that test compares against:
 *  - evals/crew/gold/replay-records-a2.golden.json   ← replayAll() (crew-replay-manifest.test.ts)
 *  - evals/crew/gold/l1-live-records.json + consistency/rep-N/l1-live-records.json
 *        ← runCase(case, committedModelFor(turns, caseId)) (l1-live-lock / l1-consistency-lock)
 *  - evals/crew/gold/render-*.golden.txt             ← renderTrajectory(record) (crew-render / crew-s2-replay)
 *  - evals/tools/gold/*.golden.json                  ← callTool(...) with the registry-envelope-goldens params
 *  - evals/delivery/gold/slack-*.golden.json         ← buildSlackReportPayload (delivery.test.ts)
 *  - fixtures/landing/finding-browse.golden.json     ← FINDINGS_INDEX (landing-browse-drift-lock; human-reviewed re-commit)
 * Committed turns, cases and every non-record key of the record files are read, never written.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "vitest";
import type { CrewModel, IntakeDecision, ReviewerDecision } from "@/lib/crew/model.ts";
import { runCase } from "@/lib/crew/orchestrator.ts";
import { renderTrajectory } from "@/lib/crew/render.ts";
import type { CrewCase } from "@/lib/crew/types.ts";
import { callTool } from "@/lib/tools/registry.ts";
import { buildSlackReportPayload, serializeSlackPayload } from "@/lib/delivery/slack.ts";
import { FINDINGS_INDEX } from "@/lib/landing/specimen";
import { loadCases, loadRecordedModel, replayAll } from "./crew/harness.ts";
import { replayS2 } from "./crew/harness-s2.ts";

const root = process.cwd();
const GOLD = join(root, "evals", "crew", "gold");
const json = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`;

type Turn = { caseId: string; member: "intake" | "reviewer"; ok: boolean; decision?: IntakeDecision | ReviewerDecision };
function committedModelFor(turns: Turn[], caseId: string): CrewModel {
  const intake = turns.find((t) => t.caseId === caseId && t.member === "intake");
  if (!intake?.ok || intake.decision === undefined) throw new Error(`no committed OK intake turn for ${caseId}`);
  const reviewer = turns.find((t) => t.caseId === caseId && t.member === "reviewer");
  return {
    intakeTurn: () => intake.decision as IntakeDecision,
    reviewerTurn: () => {
      if (!reviewer?.ok || reviewer.decision === undefined) throw new Error(`reviewer turn consulted but none for ${caseId}`);
      return reviewer.decision as ReviewerDecision;
    },
  };
}

it("re-derives the S1.5b goldens by running the harness", () => {
  // A2 full-record gold
  const a2Path = join(GOLD, "replay-records-a2.golden.json");
  const a2 = JSON.parse(readFileSync(a2Path, "utf8")) as { records: Array<{ caseId: string; record: unknown }> };
  const { records: a2Records } = replayAll();
  a2.records = a2.records.map((r) => ({ caseId: r.caseId, record: a2Records.get(r.caseId) }));
  writeFileSync(a2Path, json(a2));

  // L-1 live records (main + consistency reps): replay the COMMITTED turns
  const liveDir = join(root, "evals", "crew", "cases-live");
  const liveCases = new Map(
    readdirSync(liveDir).filter((f) => f.endsWith(".case.json")).map((f) => {
      const c = JSON.parse(readFileSync(join(liveDir, f), "utf8")) as CrewCase;
      return [c.caseId, c] as const;
    }),
  );
  for (const dir of [GOLD, ...["rep-1", "rep-2", "rep-3"].map((r) => join(GOLD, "consistency", r))]) {
    const turns = (JSON.parse(readFileSync(join(dir, "l1-live-turns.json"), "utf8")) as { turns: Turn[] }).turns;
    const recPath = join(dir, "l1-live-records.json");
    const file = JSON.parse(readFileSync(recPath, "utf8")) as { records: Array<{ caseId: string; record: unknown }> };
    file.records = file.records.map((r) => ({ caseId: r.caseId, record: runCase(liveCases.get(r.caseId) as CrewCase, committedModelFor(turns, r.caseId)) }));
    writeFileSync(recPath, json(file));
  }

  // render goldens
  const model = loadRecordedModel();
  const a2Cases = new Map(loadCases().map((c) => [c.caseId, c]));
  for (const id of ["int-injection-steered", "evi-fees-drifted-refs"]) {
    writeFileSync(join(GOLD, `render-${id}.golden.txt`), renderTrajectory(runCase(a2Cases.get(id) as CrewCase, model)));
  }
  const { records: s2Records } = replayS2();
  for (const id of ["s2-rc-sync-outage", "s2-im-agent-86-orders"]) {
    writeFileSync(join(GOLD, `render-${id}.golden.txt`), renderTrajectory(s2Records.get(id)!));
  }

  // registry envelope goldens (registry-envelope-goldens.test.ts params, verbatim)
  const tgold = join(root, "evals", "tools", "gold");
  const fx = join(root, "fixtures", "synthetic-restaurant");
  const fees = join(fx, "fees");
  const ucp = join(root, "fixtures", "ucp-conformance-ci");
  const calls: Array<[string, string, Record<string, unknown>]> = [
    ["check_feed", "check_feed", { feedPath: join(fx, "acp-feed.drifted.json"), catalogPath: join(fx, "sor.catalog.json"), surface: "acp" }],
    ["check_conformance", "check_conformance", { docPath: join(ucp, "valid", "search-full-catalog.json"), op: "search" }],
    ["audit_statement", "audit_statement", { statementPath: join(fees, "statement.drifted.json") }],
    ["classify_and_audit", "classify_and_audit", { statementPath: join(fees, "statement.drifted.json") }],
    ["get_rule", "get_rule", { ruleId: "NYC-563.3-a-1" }],
    ["run_demo", "run_demo", { format: "json" }],
  ];
  for (const [name, tool, params] of calls) writeFileSync(join(tgold, `${name}.golden.json`), json(callTool(tool, params)));

  // delivery slack goldens (delivery.test.ts inputs, verbatim)
  const dgold = join(root, "evals", "delivery", "gold");
  const feesCanonical = callTool("audit_statement", { statementPath: "fixtures/synthetic-restaurant/fees/statement.drifted.json" }).canonical;
  const feedCanonical = callTool("check_feed", {
    feedPath: "fixtures/synthetic-restaurant/acp-feed.drifted.json",
    catalogPath: "fixtures/synthetic-restaurant/sor.catalog.json",
    surface: "acp",
  }).canonical;
  const cleanCanonical = callTool("audit_statement", { statementPath: "fixtures/synthetic-restaurant/fees/statement.faithful.json" }).canonical;
  const slack = [
    { name: "slack-fees-drifted", canonical: feesCanonical, meta: { tool: "audit_statement", subject: "statement 2026-06 (simulated)" } },
    { name: "slack-feed-drifted", canonical: feedCanonical, meta: { tool: "check_feed", subject: "ACP feed vs catalog (simulated)" } },
    { name: "slack-fees-clean", canonical: cleanCanonical, meta: { tool: "audit_statement", subject: "statement 2026-06 faithful (simulated)" } },
  ] as const;
  for (const c of slack) writeFileSync(join(dgold, `${c.name}.golden.json`), serializeSlackPayload(buildSlackReportPayload(c.canonical, c.meta)));

  // landing finding-browse golden (human-reviewed re-commit; same serialization the lock compares)
  writeFileSync(join(root, "fixtures", "landing", "finding-browse.golden.json"), json(FINDINGS_INDEX));
});
```

## Appendix C — `classify-diff.py` (the line classifier; run as `python3 classify-diff.py <base>`)

```python
"""S1.5b diff classifier: every changed line (working tree vs a base ref) must reduce to its
old line under ONLY these substitutions: the UCP pin 2026-04-08 -> 2026-08-25, the three
plainLine rewordings, and (counted separately) a 64-hex hash value. Anything else is printed
as OTHER. Usage: python3 classify-diff.py [base-ref]"""
import re, subprocess, sys
base = sys.argv[1] if len(sys.argv) > 1 else "HEAD"
files = subprocess.run(["git", "diff", "--name-only", base], capture_output=True, text=True, check=True).stdout.split()
H = re.compile(r"[0-9a-f]{64}")
def norm_pin(s): return s.replace("2026-04-08", "2026-08-25")
def norm_copy(s): return s.replace("vs the real ", "vs the record's ").replace("is being served to customers.", "is served on the copy.")
tot = {}
other = 0
for f in files:
    try:
        old = subprocess.run(["git", "show", f"{base}:{f}"], capture_output=True, text=True, check=True).stdout.split("\n")
    except subprocess.CalledProcessError:
        print("NEW/DELETED", f); other += 1; continue
    try: new = open(f, encoding="utf8").read().split("\n")
    except FileNotFoundError: print("DELETED", f); other += 1; continue
    if len(old) != len(new):
        print("LINECOUNT", f, len(old), len(new)); other += 1; continue
    c = {"pin": 0, "copy": 0, "hash": 0, "other": 0}
    for i, (a, b) in enumerate(zip(old, new)):
        if a == b: continue
        kinds = []
        x = a
        if norm_pin(x) != x: x = norm_pin(x); kinds.append("pin")
        if norm_copy(x) != x: x = norm_copy(x); kinds.append("copy")
        if x != b and H.sub("<H>", x) == H.sub("<H>", b): x = b; kinds.append("hash")
        if x == b:
            for k in kinds: c[k] += 1
        else:
            c["other"] += 1; other += 1
            print("OTHER", f, i + 1, a[:160], "|", b[:160])
    tot[f] = c
for f, c in sorted(tot.items()):
    print(f"{f}: " + " ".join(f"{k}={v}" for k, v in c.items() if v))
print("FILES", len(files), "OTHER", other)
```

## Appendix D — `dump-canonicals.mts` and the comparison

Run at HEAD → `canon-new.json`. Then `git checkout 22b9220 -- lib fixtures evals/crew/cases evals/crew/cases-live evals/crew/cases-s2`, run again → `canon-old.json`, and `git checkout HEAD -- <same paths>` (tree clean afterwards). Compared: `sha256(old) == old case hash`, `sha256(new) == new case hash`, and `sub(old) == new`, where `sub` replaces only `2026-04-08`→`2026-08-25`, `vs the real `→`vs the record's ` and `is being served to customers.`→`is served on the copy.`.

```ts
/** S1.5b check (not committed): dump the engine canonical for every hashed crew case, keyed by caseId. */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const { callTool } = await import(join(root, "lib/tools/registry.ts"));
const out: Record<string, string> = {};
for (const rel of ["evals/crew/cases", "evals/crew/cases-live", "evals/crew/cases-s2"]) {
  for (const f of readdirSync(join(root, rel)).filter((x) => x.endsWith(".case.json")).sort()) {
    const c = JSON.parse(readFileSync(join(root, rel, f), "utf8"));
    if (c.expectedEngineReportHash === null) continue;
    const call = c.expectedToolCalls[0];
    out[`${rel}/${c.caseId}`] = callTool(call.tool, call.params).canonical;
  }
}
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(Object.keys(out).length, "canonicals");
```
