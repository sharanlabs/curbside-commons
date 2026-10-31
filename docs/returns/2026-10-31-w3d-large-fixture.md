# Return packet — W3-d large synthetic restaurant and alert-volume figures (2026-10-31)

## SLICE
W3-d: `fixtures/synthetic-restaurant-large/` (300 items, modifier groups, seven-day drift series), its own generator and seed, derived alert-volume figures held by a FREEZE + derivation test. Branch `wave3/w3d-large-fixture` from `e692e95`.

## GIT
Commits (after `e692e95`): `ce9ad90` CP1 · `59f29ac` CP2 · `aa2e160` CP2 tsc fix · `c46b183` CP3 (empty commit, see below) · `c3877ad` CP4 · return packet commit (head). `git ls-files node_modules` prints nothing (0 lines).

## CHANGED
- `scripts-ts/generate-large-fixture.mts` (new) — generator; seed 20261101; own PRNG instances (record stream + one stream per day); declared rates are exported constants.
- `fixtures/synthetic-restaurant-large/` (new): `record.json`, `feeds/day-01..07.json`, `manifest.json`, `README.md`.
- `evals/packs/large-fixture.test.ts` (new) — 26 tests.
- `fixtures/README.md` — one row.
- `docs/returns/2026-10-31-w3d-large-fixture.md` — this file.
- `lib/**` unchanged (diff vs `e692e95` = 0 lines).

## DONE per CP (exit codes)
- CP1: generator written; second run byte-identical (sha256 list equal). eslint 0, tsc 0. Committed `ce9ad90`.
- CP2: `npx vitest run evals/packs/large-fixture.test.ts` 26 passed, exit 0. Planted mutation and restore below. Committed `59f29ac`; tsc was 2 at that commit (a `delete` on a readonly property in the generator), fixed in `aa2e160` with the fixture bytes unchanged: tsc 0.
- CP3: no source change was needed. `hoursWindowDetector(graceMinutes = HOURS_WINDOW_GRACE_MINUTES)` already exists in `lib/packs/listings/detectors.ts` and is exported from the barrel; `HOURS_WINDOW_GRACE_MINUTES` stays exported and 15. `lib/` diff = 0 lines, so no golden can move and the default path is unchanged by construction. The grace tests live in `large-fixture.test.ts` (GRACE block): bare detector = explicit constant = the engine list's own count per day (equal to the manifest tally); grace 5 finds more than default, grace 30 fewer, grace 0 at least as many as 5, grace 600 none. See DEVIATIONS.
- CP4: one row added to `fixtures/README.md`.
- CP5: `node scripts/build-offline.mjs` 0 · `npx tsc --noEmit` 0 · `npx eslint . --max-warnings=0` 0 · `npx vitest run` 0 with **2439 passed + 8 skipped** (2447) in 152 passed + 7 skipped files (159). Baseline 2413 + 8, so +26 = exactly the new file's 26 tests. `npx vitest run evals/packs/honesty-c10.test.ts` 312 passed, exit 0. `git ls-files node_modules` empty.

## TESTS (26 new, all in evals/packs/large-fixture.test.ts)
FREEZE 3 (file set, bytes, determinism) · SCALE 5 (band from generator constants, manifest counts from record.json, groups and hours present, id charset, simulated labels) · DERIVED 11 (7 per-day engine re-derivations from the COMMITTED files, non-empty and non-shrinking, rule coverage, drift applied equals consecutive-feed diffs, declared rates equal generator constants) · README 4 (template filled with figures derived in the test, no typed digit, probes bite in isolation, register and honesty) · GRACE 3.

Mutations (README, from the file header intent; commands run in this lane):
1. README: day-01 findings cell typed over its placeholder (`21` to `99`); README sha256/16 `cb92289ba5e242ae` to `1a998e15d618807b`. Red: 3 failed / 23 passed (bytes equal regenerated; README equals template filled with live figures; no typed digit). Restored by running the generator; sha256/16 back to `cb92289ba5e242ae`.
2. Feed byte edit on `feeds/day-03.json` (a price digit on line 5; the edit also broke the JSON, so it is a coarse tooth): 8 failed / 18 passed (bytes, id charset, simulated label, day-3 derivation, drift diffs, README figures, typed digit, default-grace agreement). sha256/16 `f1716eb83effb7f5` to `69f3b639621af66e`; restored by the generator to `f1716eb83effb7f5`.

## COMMANDS
See CP5 above; every figure there was read from tool output.

## sha256 list (generator run twice, identical; final state)
```
cb92289ba5e242ae5367f89105d3ec447b2281dd160abced8fcc1b2394013751  ./README.md
b8d289d86aadb193ba0874669fea50e8682914b36f54563802fede04b94757cc  ./feeds/day-01.json
f95752bdee7d6657fccbf9ba6d3ed93b453a7d96353bad168c88d50131319bee  ./feeds/day-02.json
f1716eb83effb7f540652fb2af8dbfa09982d446a25c3b5252e5ba9b8024bc4b  ./feeds/day-03.json
1a770c85c064f9dea5a087f2f3a42a50de77ee90b8791c45a81e1552c41afeca  ./feeds/day-04.json
89a9317d88c0217f33385de351d4bba9da286e79efae21899eff2654c115f38b  ./feeds/day-05.json
386482514d54a3e89b92d0dea000114f6c92acd6e840a56e364d06db1c2fadd3  ./feeds/day-06.json
42ce7daa3c061da124744a542e91d5ee512474b5795e18f143b2fd8702c447fc  ./feeds/day-07.json
272b163126efcaff740a97a401b42d6687dede7dceb3167a824b7f2b734ea97d  ./manifest.json
e68e8b17068fc517ee8767d0566f6108fcdc5495b3082304b578d6695bc4f349  ./record.json
```
The CP1-time list differed only in README.md (`77d58bbe...`, before two wording fixes: "any menu drifts", "Per hundred items"); all other nine hashes are unchanged from CP1. Before-regeneration equals after-regeneration at every point checked (CP1 second run; final two runs).

## Folder size
4571012 bytes (sum of file contents; `du -sk` 4484 KB) — under 5 MB. First draft was 5.07 MB; fixed by stating hours once per item (first served row) and a shorter description; see DEVIATIONS.

## Per-day figures (generated from manifest.json by code, not retyped)
Counts: categories 10 · items 300 · variations 478 · feed rows 463 · modifier groups 139 · modifier options 458.

| Day | Findings | Errors | Warnings | Per 100 items | Warn share | Drift applied (price/avail/title/modprice/moddrop/hours) | By rule |
|---|---|---|---|---|---|---|---|
| 1 | 21 | 19 | 2 | 7 | 0.0952 | 2/4/2/7/5/1 | LST-AVAIL-STATE 4, LST-ENC-TRUNC 1, LST-HOURS-WINDOW 1, LST-IDENT-NAME 1, LST-MOD-MISSING 5, LST-MOD-PRICE-VALUE 7, LST-PRICE-VALUE 2 |
| 2 | 48 | 45 | 3 | 16 | 0.0625 | 2/9/2/8/6/0 | LST-AVAIL-STATE 13, LST-ENC-TRUNC 2, LST-HOURS-WINDOW 1, LST-IDENT-NAME 2, LST-MOD-MISSING 11, LST-MOD-PRICE-VALUE 15, LST-PRICE-VALUE 4 |
| 3 | 61 | 53 | 8 | 20.33 | 0.1311 | 1/3/2/3/1/3 | LST-AVAIL-STATE 16, LST-ENC-TRUNC 4, LST-HOURS-WINDOW 4, LST-IDENT-NAME 2, LST-MOD-MISSING 12, LST-MOD-PRICE-VALUE 18, LST-PRICE-VALUE 5 |
| 4 | 85 | 72 | 13 | 28.33 | 0.1529 | 6/2/4/6/4/2 | LST-AVAIL-STATE 18, LST-ENC-TRUNC 7, LST-HOURS-WINDOW 6, LST-IDENT-NAME 3, LST-MOD-MISSING 16, LST-MOD-PRICE-VALUE 24, LST-PRICE-VALUE 11 |
| 5 | 93 | 79 | 14 | 31 | 0.1505 | 1/2/1/2/3/0 | LST-AVAIL-STATE 20, LST-ENC-TRUNC 8, LST-HOURS-WINDOW 6, LST-IDENT-NAME 3, LST-MOD-MISSING 19, LST-MOD-PRICE-VALUE 25, LST-PRICE-VALUE 12 |
| 6 | 113 | 95 | 18 | 37.67 | 0.1593 | 2/3/3/3/7/4 | LST-AVAIL-STATE 23, LST-ENC-TRUNC 9, LST-HOURS-WINDOW 9, LST-IDENT-NAME 5, LST-MOD-MISSING 26, LST-MOD-PRICE-VALUE 27, LST-PRICE-VALUE 14 |
| 7 | 127 | 105 | 22 | 42.33 | 0.1732 | 2/3/0/3/2/6 | LST-AVAIL-STATE 26, LST-ENC-TRUNC 9, LST-HOURS-WINDOW 13, LST-IDENT-NAME 5, LST-MOD-MISSING 28, LST-MOD-PRICE-VALUE 30, LST-PRICE-VALUE 16 |

Reading it: at the declared assumption rates, errors dominate (warn share 6% to 17%) and the count grows because nothing is corrected between days. These are measurements of the instrument at assumed rates, not of any market. LST-ENC-UTF8 did not fire in this seed (no accented-name row drew a garble).

## Engine wall time per day (informational, from the final two generator runs; not written to any file)
Run A: 7.4, 7.3, 7.4, 7.7, 5.5, 6.2, 6.1 ms. Run B: 7.1, 9.5, 6.5, 9.5, 22.0, 7.3, 10.9 ms (days 1 to 7). Single-digit milliseconds on 463 rows.

## CP6 (orchestrator addition) — both alert-volume readings, derived
DONE. Generator adds per day `newFindings` (findings whose key, claim id as the engine reports it plus rule id, was not reported the day before; day 1 = every finding), `newFindingsPer100Items` (same denominator) and `resolvedFindings` (keys present yesterday, absent today), plus `assumptions.readings` (cumulative = nothing repaired; new-per-day = the alert-fatigue reading; no repair model). README table gains two placeholder columns and a two-readings paragraph. Tests: 26 to 36 (+10: 7 per-day re-derivations from consecutive engine runs, day-one new = findings, findings(day) = findings(day-1) - resolved + new, manifest states both readings).
- Unchanged: `record.json` and `feeds/day-01..07.json` sha256 identical before and after CP6 (compared with `diff` on the two lists, no difference). First 16 hex: e68e8b17068fc517 record.json
b8d289d86aadb193 feeds/day-01.json
f95752bdee7d6657 feeds/day-02.json
f1716eb83effb7f5 feeds/day-03.json
1a770c85c064f9de feeds/day-04.json
89a9317d88c0217f feeds/day-05.json
386482514d54a3e8 feeds/day-06.json
42ce7daa3c061da1 feeds/day-07.json
- Gates: README placeholder typed over (day-03 new count set to 77) turned 2 red, restored by the generator. build-offline 0 · tsc 0 · eslint 0 · full vitest 0 with 2449 passed + 8 skipped (2413 + 36 exactly; 152 passed + 7 skipped files) · `git ls-files node_modules` empty. README and manifest.json bytes changed by design; their hashes now differ from the list above.
- **Resolved is NOT zero**: day 5 has 1 and day 6 has 1 (total 2). Cause, read from the engine: a modifier option's `LST-MOD-PRICE-VALUE` finding is replaced when the same option later drops off the copy (it then reports `LST-MOD-MISSING` on the same claim id), so the price key disappears and a missing key appears. Day 5: `item-296-v1#modifier.item-296-m1-o2`; day 6: `item-217-v1#modifier.item-217-m2-o3`. Nothing was fixed; the README says so in plain words ("a finding leaves the list only when a later drift on the same option replaces it").

Per-day table copied from manifest.json by code:

| Day | Findings | Per 100 items | New that day | New per 100 items | Resolved |
|---|---|---|---|---|---|
| 1 | 21 | 7 | 21 | 7 | 0 |
| 2 | 48 | 16 | 27 | 9 | 0 |
| 3 | 61 | 20.33 | 13 | 4.33 | 0 |
| 4 | 85 | 28.33 | 24 | 8 | 0 |
| 5 | 93 | 31 | 9 | 3 | 1 |
| 6 | 113 | 37.67 | 21 | 7 | 1 |
| 7 | 127 | 42.33 | 14 | 4.67 | 0 |

## DEVIATIONS
1. CP3 changed nothing in `detectors.ts`: the optional grace parameter already exists (`hoursWindowDetector(graceMinutes = HOURS_WINDOW_GRACE_MINUTES)`). The packet's "diff is only option plumbing" holds vacuously (zero lines). `runListingsVerification` and `listingsDetectors` still use the default; a caller wanting a different grace composes `verifyClaims(claims, sorReference(record), [hoursWindowDetector(n)])`, which is what the test does. Not plumbed through `run.ts`/`index.ts` (not required).
2. The grace tests were written in CP2's file, so CP2 and CP3 turned green together; CP3's commit is empty by design.
3. Hours are stated once per item (on its first served row), not on every row, to keep the folder under 5 MB (first draft 5.07 MB). So an hours drift unit is "an item's first served row" and the README says so. The faithful baseline (day 0, not written) is `buildFaithfulMenuFeed` with the repeated hours removed.
4. Drift accumulates with no correction between days (stated in README and manifest). The packet says "applies seeded drift to the previous day"; I took that literally. Findings per 100 items therefore rises through the week; it is a cumulative stock, not a daily new-alert rate. A "new findings per day" figure is derivable but was not added (not in the packet).
5. "Items" in findings-per-100 means catalog items (300), not served rows (463).
6. The new README is not in honesty-c10's fixed scanned-file list (that test file is outside this lane); the lane's own test applies the register, named-party and banned-claim probes to it. `honesty-c10` itself ran green.
7. Manifest adds a `driftApplied` block per day (events applied), re-derived in the test from consecutive-feed diffs.

## OPEN (decisions recorded, orchestrator review at 793a490)
- OPEN 1 resolved by CP6: both readings are carried (cumulative and new-per-day); no repair model.
- OPEN 2 accepted: hours once per item is the unit (existing corpus feeds carry hours on zero rows); the 5 MB cap stays.
- OPEN 3 accepted: the declared rates stand as labelled assumptions; they go on the owner card.

Original text of OPEN 1. Alert-rate semantics for /pilot: cumulative with no repair (this fixture) versus a daily new-alert rate or a repair model. Which the later /pilot lane should surface is an owner/orchestrator call; the manifest can support either with a small generator addition.
2. Whether item-level-only hours on the feed is acceptable, or the folder budget should rise so every row carries hours.
3. The declared rates (0.4% to 1.0% per day) are my placeholders for "ordinary drift"; they are assumptions with no source. The owner may want different values before any figure is shown on the site.

## NOT DONE
Nothing from the packet. Not touched: any existing generator or golden, lib/**, the site. No push, no Codex.

## OWNER
Decide OPEN 1 to 3 before the /pilot lane reads `manifest.json`. Codex review of this lane is deferred (run contract).

## MODEL
Sonnet 5.5. A different builder might have written every row with hours and blown the 5 MB cap; I measured size first and made the item-level-hours choice explicit. Stops honoured: none triggered; one judgment call (the existing grace parameter) settled from the files.
