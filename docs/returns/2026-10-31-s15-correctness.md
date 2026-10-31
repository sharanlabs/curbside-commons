# Return packet — S1.5 correctness + S1 completion (Wave 2, lane 1) — 2026-10-31

**Plain English:** the two engine bugs Codex found are fixed and tested (a catalog that uses one row id twice is now refused instead of passing; dates are compared as moments in time, not as text, and an unreadable date is reported). The honesty gate now catches endorsement, "platform data" and "we saved $" claims, including in image alt text and page metadata. Four security-review defects in the same files are fixed. Scenarios 2 and 6 are built. **Two items could not be done inside this lane's files: the UCP pin flip (CP2) and the three plainLine wording fixes.** Both change the bundled engine report, and that report's hash is pinned in the crew's pre-registered exam records (`evals/crew/**`), which this lane may not edit. The exact file map and the decision needed are under OPEN.

## SLICE

Wave 2 lane S1.5, packet `docs/packets/2026-10-31-s15-correctness.md` plus three orchestrator amendments (01:1x review items, 01:29 security items, 01:5x merge-main sequencing). Worktree `.worktrees/s15-correctness`, branch `wave2/s15-correctness`, from `cd0d347`; main merged in twice (`204ade5`, then `e151c5c`), both clean.

| Checkpoint | State |
| --- | --- |
| CP1(a) duplicate variation ids | **done** — one predicate (`findDuplicateVariationId` / `assertUniqueVariationIds`, reference.ts) called by `runListingsVerification`; typed `DuplicateVariationIdError`; CLI exit 2 (no `bin/check.mjs` change needed: it already maps any throw to 2); MCP `isError` |
| CP1(b) timestamps | **done** — `lib/packs/listings/instants.ts` `parseInstant`; both staleness detectors compare instants; new rule `LST-DATE-INVALID` (error · staleness) |
| CP1(e) C10 probes | **done** — endorsement · access/affiliation · saved-money families (sentence-scoped) + attribute probe over built HTML; re-validated on main `204ade5` |
| Security F1 · F4 · F6 · F7 (amendment 2) | **done** |
| Review items (amendment 1) | (2) README **done** · (3) c6 restore sha **done** · (4) C10 RED proof **done** · (5) PROVENANCE note **done** · **(1) plainLine fixes NOT DONE — blocked** (OPEN 1) |
| CP2 UCP pin flip | **NOT DONE — blocked** (OPEN 1); trial-measured, every changed golden line classified, oracle diff run at both pins |
| CP3 scenarios 2 and 6 | **done** on the active pin `2026-04-08` (DEVIATIONS 3) |
| CP4 gates + packet | **done** |

## GIT

`git status --short` (before this packet's commit): clean. `git ls-files node_modules`: empty (the symlink is ignored since main's `6fb6590`; before that merge every commit staged with `':!node_modules'`).

`git log --oneline -6` (lane commits only, newest first; two merges of main interleave):

```
6a2c8e9 wip(s15-correctness): spec-valid-lie follows the feed→report convention the merged scenario CLI reads; the UCP answer's truth-leg report is byte-locked beside it
d6c153f Merge branch 'main' into wave2/s15-correctness
dec3ba2 wip(s15-correctness): CP3 green — scenarios 2 (modifier-drift) and 6 (spec-valid-lie) in the one generator (1.1.0)
38db9d0 wip(s15-correctness): C10 probes re-validated on main @204ade5; Google/OpenAI join the platform anchor
2ec2551 Merge branch 'main' into wave2/s15-correctness
3c3ee8c wip(s15-correctness): CP1(e) green — C10 probe families + attribute probe
```

Earlier lane commits: `17bddd5` (c6 restore sha + PROVENANCE note) · `4544a5c` (security F1/F4/F6/F7) · `ad97ac2` (CP1(b)) · `06bb797` (CP1(a)).

## CHANGED (against main @ `e151c5c`)

- `lib/packs/listings/reference.ts` — `ListingsInputError` base; `reservedIdProblem` (moved here from the two UI adapters, F1); `ReservedIdError` + `assertNoReservedVariationIds`; `findDuplicateVariationId` · `duplicateVariationIdMessage` · `DuplicateVariationIdError` · `assertUniqueVariationIds`.
- `lib/packs/listings/run.ts` — `runListingsVerification` refuses reserved and duplicate catalog ids before any claim is judged.
- `lib/packs/listings/instants.ts` (new) — `parseInstant` (RFC 3339 profile; zone-less date-times, impossible calendar fields, `T24:00` refused) + `INSTANT_FORMS`.
- `lib/packs/listings/detectors.ts` — expiry and pre-order-date rules compare instants; `LST-DATE-INVALID` for an unreadable copy date or catalog `asOf`. Existing rule ids and plainLines byte-unchanged.
- `lib/packs/listings/adapters.ts` (amendment 2) — `guardRows`: non-object row / missing id (`FeedShapeError`, F7), reserved id (`ReservedIdError`, F1), repeated row id (`DuplicateFeedRowError`, F6), non-array `modifiers`/`hours` (F7); `variant_dict` projected to its declared key (F4).
- `lib/packs/listings/modifiers.ts` (amendment 2) — option and hours-window claim values carry declared keys only (F4).
- `lib/packs/listings/index.ts` — exports the new errors and predicates.
- `components/playground/verify-in-browser.ts` (amendment 2) — local `reservedIdProblem` deleted; imports the engine's. Messages unchanged.
- `lib/playground/csv-adapters.ts` (amendment 2) — local `idProblem` deleted; uses the engine's `reservedIdProblem`.
- `scripts-ts/generate-scenarios.mts` — `modifier-drift` and `spec-valid-lie` builders, templates, notes; `GENERATOR_VERSION` 1.0.0 → 1.1.0.
- `fixtures/scenarios/modifier-drift/**`, `fixtures/scenarios/spec-valid-lie/**` (new, generated).
- `fixtures/scenarios/{agent-86,sync-outage,platform-override,partner-onboarding,fee-precheck}/**` — regenerated; only the generator version stamp moved (TESTS § goldens).
- `fixtures/scenarios/README.md` — table says built / arrives S3 (no lane jargon); platform-shaped wording; ucp-response.json + ucp-truth-report.json in the folder contract; §20-563.3 pointer with as-of date.
- `fixtures/ucp-schemas/2026-08-25/PROVENANCE.json` — note explains `"simulated": false` (schema shas untouched; freeze tests green).
- `evals/packs/catalog-parse-attack.test.ts` — CP1(a) and F1/F4/F6/F7 regressions through `runCheck` and the real CLI.
- `evals/packs/listings-coverage-c6.test.ts` — the timestamp block; the re-applied mutation with restore sha.
- `evals/packs/honesty-c10.test.ts` — the three families, their planted reds and honest greens, the new-family scan over every scanned file, rendered pages and mockups, and the attribute probe.
- `evals/packs/scenarios.test.ts` — seven ids; per-id inputs/expected; S1_IDS removed; new ENGINE / EVENTS teeth; README tests; RED 4 / RED 5.
- `evals/packs/csv-adapters.test.ts` — the reserved-id message assertion follows the shared predicate's wording.
- `docs/returns/2026-10-31-s15-correctness.md` — this packet.

## TESTS

**Before → after:** baseline `cd0d347` 1821 passed + 8 skipped. Main's own merges added tests (main gate 1925 + 8 at `91b06ae`; `e589bf4`/`e151c5c` are docs-only). Final on this branch: **2096 passed + 8 skipped (137 files + 7 skipped)**. This lane's share: **+171**, every one accounted:

| File | Before → after | New tests |
| --- | --- | --- |
| catalog-parse-attack | 6 → 29 (+23) | CP1(a): engine, browser seam, runCheck, real CLI (4) · shared parse-layer/predicate fixture (4) · bundled clean (1). F1: control, ACP ×2, UCP ×2, catalog side, same predicate (7) · F6 ×3 · F4 ×1 · F7 ×3 |
| listings-coverage-c6 | 10 → 22 (+12) | parseInstant unit · expiry +100 ms · expiry +02:00 · expiry unreadable · zone-less · avail-date +100 ms · avail-date +02:00 · avail-date unreadable · catalog asOf unreadable · non-string · equal instants · bundled staleness pin |
| honesty-c10 | 168 → 275 (+104 lane, +3 main) | packSources row for instants.ts (1) · S1.5 block: lockstep 1 + 16 planted + 7 honest + Codex phrases 1 + review sentence 1 + sentence scope 1 + wrapped claim 1 + one row per scanned file (72) = 100 · rendered new-family scan 1 · attribute scan 1 · attribute bite 1. (The +3 are main's old-pattern rows for executive-brief, five-minute-walk and SECURITY.md.) |
| scenarios | 91 → 123 (+32) | the two new ids across every `it.each` (folder contract, ABSENT, ENGINE ×4, EVENTS ×2, BRIEF ×5 = 26 rows) · modifier-drift rules · spec-valid-lie conformance-vs-truth · ucp-truth-report byte lock · two EVENTS teeth · README no-jargon. (The README row test was rewritten in place.) |
| csv-adapters | 49 → 49 | one regex updated |

**Mutation proofs** (each recorded in its test header; every mutation restored from a saved copy and the sha re-checked):
- CP1(a): `assertUniqueVariationIds(sor);` commented out (run.ts c5f9f382ebe2ae19 → eb3a7bb701285e90) → 4 failed / 11; the real CLI exits 0 with a PASS report (Codex's PASS reproduced). Restored → c5f9f382ebe2ae19, 15/15.
- CP1(b): both comparisons back to `String(claim.value) >= asOf` (detectors.ts aaf19a2a925d5f09 → aace2f7e598a4cc9) → c6 10 failed / 12. Restored → aaf19a2a925d5f09, 22/22.
- F1 feed: reserved-id `throw` deleted → 5 failed / 29. F1 catalog: `assertNoReservedVariationIds(sor);` deleted → 1 failed. F4: each projection reverted alone (option object · hours · variant_dict) → 1 failed each. F6: duplicate `throw` deleted → 3 failed. F7: menu-field loop short-circuited → 3 failed. Restored → adapters 864c03a2c1799e32 · modifiers c0842c1396f989ff · run e9fabfbfddd71741, 29/29.
- C10, pilotDocs (acceptance-review item c): the review's sentence appended to docs/governance-model.md → 1 failed / 267 at 01:44 (ee8cf657f22ab766 → 7ca5719b41ee22f3). Re-run at 01:50 on the exec-layer rewrite (40e5a7dec9133864 → 5daee02dabed78e5) → 1 failed / 274. Restored, 275/275. The eight old patterns still accept that sentence; the new endorsement family catches it.
- C10 attribute probe: `alt="Trusted by DoorDash"` planted in built out/index.html (05d70866ce86938a → 3502792dce26421d) → the attribute test fails while both visible-text scans stay green. Restored, green.
- c6 re-apply, review item (c): `if (true || actual === expected) return [];` in the LST-MOD-PRICE-VALUE detector only (aaf19a2a925d5f09 → 9624c040e7aac195) → c6 3 failed / 19; c3 and scenarios green. Restored → aaf19a2a925d5f09 byte-exact. **This differs from the review's report** (c3 and scenarios red). The line `if (actual === expected) return [];` occurs five times in detectors.ts, and replacing all five turns c6 6, c3 7 and scenarios 28 red. A multi-site replacement is the likely cause; that is inference, not re-measured on the reviewer's tree.
- Scenarios RED 4: the two new folders moved away → 31 failed / 91 (the five old ids stay green); generator → 122/122. RED 5: `"amount": 800,` → 801 in spec-valid-lie/inputs/ucp-response.json (0b37ca4512ccf7d6 → 18f192da656bd15b) → FREEZE red; generator → 0b37ca4512ccf7d6, green.

**Goldens that changed, explained line by line:**
- Five Wave 1 scenario folders, 10 lines, all the generator version stamp: each `manifest.json` `"generator": "generate-scenarios.mts@1.0.0"` → `@1.1.0` (×5) · each listings `inputs/record.json` `generator.version` `"1.0.0"` → `"1.1.0"` (×4) · fee-precheck `inputs/statement.json` `meta.generator.version` (×1). No report, figure, brief or input datum moved. The PRNG streams are untouched because the new builders seed their own streams. The packet asked for "byte-identical apart from the spec string" and also for a version bump; these two cannot both hold, and the bump moves exactly these lines.
- No other golden changed in any commit. The bundled tally holds: FAIL · 16 findings · 11 errors · 5 warnings · 25 rows; `evals/packs/test-guide.test.ts` green.

## COMMANDS (final run, exit codes)

- `node scripts/build-offline.mjs` → 0 (run before every full vitest; the honesty-c10 rendered leg re-runs `npm run build` and fails on Google Fonts in this sandbox whenever out/ is older than lib/app/components — seen and cleared three times; environmental, not patched)
- `npx tsc --noEmit` → 0
- `npx eslint . --max-warnings=0` → 0
- `npx vitest run` → 0 · 2096 passed · 8 skipped (137 files + 7 skipped); re-run after the final comment-only run.ts edit → same
- `npx vitest run evals/packs/honesty-c10.test.ts` → 0 · 275 passed
- `node scripts-ts/generate-scenarios.mts` → 0 (writes 49 files; FREEZE byte-equal)
- `node scripts-ts/ucp-oracle-diff.mts` → 0 · **33/35 agree, 2 documented format-class divergences, 0 disagree** at the active pin `2026-04-08`, and the same 33/35 · 2 · 0 in a trial at `2026-08-25` (pin flipped and corpus regenerated, uncommitted, reverted). cargo and `ucp-schema` are installed on this seat; no network was used.
- Trial CP2 flip (uncommitted, reverted with `git checkout -- lib fixtures`): `generate-wedge-fixtures` · `generate-browser-fixtures` · `generate-ucp-conformance-corpus` · `generate-scenarios` · `generate-demo-transcript` → all 0. Full vitest → 1 · 21 failed (map in OPEN 1).

## DEVIATIONS

1. **Files outside the original allowed list**, all granted by amendment 2 (security F1/F4/F6/F7): `lib/packs/listings/adapters.ts`, `lib/packs/listings/modifiers.ts`, `components/playground/verify-in-browser.ts` and `lib/playground/csv-adapters.ts` (local copies deleted, shared predicate imported), and `evals/packs/csv-adapters.test.ts` (one regex follows the shared message).
2. **The duplicate-id predicate is shared by import, not moved.** The browser guard was inline in `components/playground/verify-in-browser.ts`, not a function under lib/playground. The engine path now refuses through `assertUniqueVariationIds`. The browser's engine call (`verifyAcpFeed` → `runListingsVerification`) therefore shares that predicate by import identity (test: it throws the same error class). The browser's earlier inline parse-layer check stays (components untouched), held to the same verdicts by a shared four-case fixture. Replacing that inline loop with a call is a roughly 10-line components edit: OPEN 3.
3. **CP3 is built on the active pin `2026-04-08`, because CP2 is blocked.** spec-valid-lie is checked for conformance against every vendored schema folder, so the exhibit already passes `2026-08-25`. The generator stamps the pin through `LISTINGS_SPEC_VERSION` and `ucp.version`, so the eventual flip re-stamps all seven folders in one regeneration.
4. **spec-valid-lie has a third expected file.** `expected/report.json` is the engine on `feed.json` + `record.json`, as for every listings scenario: the merged scenario CLI (`lib/cli/scenario.ts`, cli-experience) reads it that way and went red when it held the UCP truth leg. The UCP answer's own truth-leg report is committed as `expected/ucp-truth-report.json`, byte-locked by FREEZE and by its own ENGINE test.
5. **An 86'd add-on still served was NOT planted in modifier-drift.** The menu model expresses it (record `soldOut`, copy `availability`), but no detector compares modifier availability. Adding one means a new rule id, and this lane's contract allows only `LST-DATE-INVALID`. Planting a defect the engine cannot see would make a brief that overstates. OPEN 4.
6. **Order of checkpoints.** CP2 was attempted first (trial flip at 01:15, blast radius measured) and found blocked. CP3 then proceeded on the current pin, as advised, rather than stopping the lane.
7. **The `node_modules` symlink was absent** from this fresh worktree. I created it (`ln -s` to main's install) to match the contract's stated setup. It was never staged.
8. **Two extra honest sentences and one narrowing in C10.** The negation window went from 40 to 60 characters after one measured false positive: the committed mockup line "Not real DoorDash / Square / Uber&nbsp;Eats / Grubhub data, access, or business impact." Google and OpenAI joined the platform anchor (amendment 3). No existing pattern was edited, and no document needed rewording.

## OPEN

1. **CP2 (pin flip) and amendment item (1) (three plainLine fixes) need files outside this lane.** Both change the bundled drifted pair's serialized report. Its sha256, `expectedEngineReportHash`, is pinned in the crew's pre-registered cases (`evals/crew/cases/*.case.json` ×20 and `evals/crew/cases-live/*.case.json` ×20) and in the frozen live/consistency turns (`evals/crew/gold/**`). `run.ts:29-38` (S1-engine) records that the spec-string bump must come with the Intake/Reviewer labels rendered "requalification pending" (decision-log 2026-10-14). That is a crew change, and the lane contract § 5 forbids editing the `l1-*-lock` pins.
   - **CP2 trial on the merged tree**, all in-scope generators run: 21 failed.
     - **Out of scope:** `evals/crew/{crew-replay-floors (5), l1-consistency-lock (3), l1-live-composition-lock (1), l1-live-lock (1)}` (pre-registered hashes) · `evals/mcp/mcp-transcript-freeze` (1; golden `evals/mcp/gold/mcp-session.transcript.json`) · `evals/tools/registry-envelope-goldens` (3; `evals/tools/gold/{check_feed,check_conformance,run_demo}.golden.json`) · `evals/packs/demo-svg-freshness` (1; `docs/assets/demo.svg`, a doc).
     - **In scope, ready to edit in the same change:** `evals/packs/cli-c1` (3 hardcoded `2026-04-08`) · `report-view-c1` (1 hardcoded) · `ucp-conformance` (the "stays 2026-04-08" assertion) · `scenario-cli` (1).
     - **Stale-but-green, out of scope:** `lib/dashboard/evidence.ts:157-159` (hardcoded `ucpSpecVersion: "2026-04-08"` + PROVENANCE path) · `lib/packs/listings/ucp-corpus.ts:186` (`schemaSource` names the 2026-04-08 folder; it would mislabel `fixtures/ucp-conformance-ci/manifest.json`) · NOTICE / README / docs mentions.
   - **Every regenerated golden line in the trial is a version string:** `"version": "2026-04-08"` → `"2026-08-25"` (35, UCP envelopes) · report `specVersion` (9) · scenario manifest `engine` (6) · `ucp_version` (1) · `pinned` (1) · `supported_versions` entry (1) · conformance `specVersion` (1) · expected-demo.txt `Spec pin:` (1). Plus **one finding line**: the bundled UCP drifted report's `LST-SPECVER-MISMATCH` plainLine quotes the pin ("… but the verifier pins 2026-08-25 …"). That is attributable to the pin itself, not to CP1(b). CP1(b) changed no golden line. The bundled tally is unchanged.
   - **Plain-line trial:** the three rewordings move only `fixtures/synthetic-restaurant/expected-report.{acp,ucp}.json` (6 lines, regenerable) and `fixtures/landing/finding-browse.golden.json` (a human re-commit by its own lock's rule) inside scope. Outside scope they move `evals/delivery/gold/slack-feed-drifted.golden.json`, `evals/tools/gold/check_feed.golden.json` and the same 40 crew hashes (10 crew tests red). Reverted.
   - **Decision for the orchestrator:** widen this lane to `evals/crew/cases*/**` + `evals/crew/gold/**` + `evals/{tools,mcp,delivery}/gold/**` + `docs/assets/demo.svg` + `lib/dashboard/evidence.ts` + `lib/packs/listings/ucp-corpus.ts`, with the requalification-pending rendering in `lib/crew`. Or run both changes together as one step on main after S2-crew lands. Doing both in one regeneration avoids re-pinning the crew records twice (the delivery-manager's own reasoning, ledger row 48).
2. **Merge coordination.** S2-crew owns `evals/crew/**` and `lib/crew/**` tonight; OPEN 1 lands on its files. cli-experience's `lib/cli/scenario.ts` runs every listings scenario on feed + record, so it does not yet surface spec-valid-lie's UCP leg; a `--json` field for `ucp-truth-report.json` would show it.
3. **Browser parse-layer duplicate check** (components): replacing the inline loop at `verify-in-browser.ts` ~:457-469 with `findDuplicateVariationId` + `duplicateVariationIdMessage` is a 10-line edit beyond an import path. Its comment at ~:350-360 ("both sort correctly as text because the fractional part comes after every field") is Codex's 100 ms case, now moot in the engine; the comment is stale.
4. **Detector gap:** no rule compares a served modifier option's availability with the record's `soldOut`. An 86'd add-on still offered on the copy is silent. A new rule id (for example an `LST-MOD-AVAIL-STATE`) is needed before scenario 2 can tell that part of its story.
5. **C10 coverage limits, stated rather than claimed:** the families are phrase lists, not semantics. Scenario briefs and `fixtures/scenarios/README.md` sit outside `scannedFiles`; they are held by `scenarios.test.ts`'s own named-party and register probes, which do not include the saved-money family. A human claim-to-evidence review stays a named step (decision-log 2026-10-14).
6. **A rule list now out of date** (outside this lane's named tests): `evals/packs/acp-field-rules.test.ts` has an `emittable` list that claims to name "every rule the listings detectors + completeness sweep can emit". It omits `LST-DATE-INVALID`, and it already omitted the three `LST-MOD-*` ids. The test only checks that its cases cover the list, so it stays green while the claim is false.
7. **For the admitting mutation:** there is no comparison inside `instants.ts`, which only parses. The instant comparison is `copy < asOf` in `beforeAsOf` in `detectors.ts`. A flip meant to test the fix must target that line, or the re-apply mutates the wrong file and reports "doesn't bite".
8. **`variant_dict` projection keeps only `variation`.** Other variant attributes a copy sends are dropped from the evidence by design (F4 allow-list). If a later adapter needs size/colour keys, they must be declared there.

## NOT DONE

- **CP2:** `UCP_PINNED_VERSION` stays `"2026-04-08"`; `ucp-conformance.test.ts`'s pin assertion is unchanged. Blocked (OPEN 1), measured, not committed.
- **Amendment item (1):** the three plainLine register fixes in detectors.ts. Blocked by the same crew hashes (OPEN 1), reverted.
- **The 86'd-option plant in modifier-drift** (DEVIATIONS 5, OPEN 4).
- **Replacing the browser's inline parse-layer duplicate loop** (OPEN 3).
- Codex review: deferred by owner word (contract § 7).

## MODEL

Claude Opus 5.5 (`claude-opus-5-5`) — the Opus seat the ledger routes this lane to, so there is no build to compare against. The judgment calls are listed so the orchestrator can check them:
- CP2 and the plainLine fixes were measured in full and left uncommitted, rather than committed red or pushed into `evals/crew`.
- spec-valid-lie was reshaped to fit the merged scenario CLI instead of editing `lib/cli`.
- The 86'd plant was declined rather than letting a brief claim something no detector sees.
- The review's c6 mutation discrepancy is reported as measured, with the inference labelled.
