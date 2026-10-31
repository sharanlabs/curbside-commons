# Return packet: W3-a checkpoint 1 — crew cases, scenario 5 ownership, MCP advertisement (Wave 3, lane 1), 2026-10-31

**Plain English:** every scenario folder now has a crew practice run that a replay test really plays, and a test reads the folders themselves so that claim cannot go stale. Scenario 5 now goes to the partner desk because the case states, from its brief, that the partner submitted the feed. MCP clients can now see and call the two crew tools. Three places where the packet and the code disagree are listed below with what was done about each.

## SLICE

W3-a CP1 — a folder-driven crew-case coverage test · root-cause cases for modifier-drift and spec-valid-lie · scenario 5 ownership = integrator (route → partner) · explain_drift and size_impact advertised on MCP tools/list with schemas on disk and the transcript golden re-recorded. Branch `wave3/w3a-crew-cases` from `e692e95`. Replay only: no live model ran, nothing was sent, no Codex call, no push, no deploy.

## DONE (per checkpoint, with the done-test exit codes)

| CP | Commit | What turned green | Done-test, observed |
| --- | --- | --- | --- |
| CP1 | `dbaf3d6` | `evals/crew/crew-case-coverage.test.ts` (new), committed RED | `npx vitest run evals/crew/crew-case-coverage.test.ts` → exit 1, 2 failed / 9 passed; the red names exactly `modifier-drift` and `spec-valid-lie` |
| CP2 | `833324f` | `s2-rc-modifier-drift`, `s2-rc-spec-valid-lie` + turns; case-list pins | coverage + crew-s2-replay + composition-lock-s2 + composition-lock-s3 → exit 0, 62 passed; crew-s2-replay lists both new cases (4 rows); `evals/crew` → exit 0, 299 passed (20 files); stamp `--check` → exit 0 (0 out of date); tsc 0; eslint `evals/crew` 0 |
| CP3 | `601ff67` | scenario 5 on the partner route | crew-route + crew-s2-replay + composition-lock-s2 + coverage + ledger-handoff → exit 0, 79 passed; `lib/crew/route.ts` and `evals/crew/crew-route.test.ts` unchanged (`git diff --quiet` → 0); `evals/crew` → exit 0, 299 passed; stamp `--check` → 0 |
| CP4 | `8efc3ce` (schema files) · `52a6a91` (advertisement) | both tools on tools/list, callable over the real stdio server, transcript re-recorded | part 1: `evals/tools evals/crew` → exit 0, 429 passed (28 files). part 2: `evals/mcp evals/tools` → exit 0, 221 passed (14 files); honesty-c10 → exit 0, 312 passed; tsc 0; eslint `.` 0 |
| CP5 | this packet | gates | see COMMANDS |

**CP1 detail.** The test reads every directory of `fixtures/scenarios/` holding a `manifest.json`, every `*.case.json` under `evals/crew/cases-s2/` and `cases-s3/`, and the `evals/crew/*.ts` sources. A directory counts as replayed when a source globs it as `readdirSync(DIR).filter((f) => f.endsWith(".case.json"))` with `DIR` declared as `join(<root>, "evals", "crew", "<dir>")` in the same file, and that source calls `runCase(` (a test file directly; a harness only when a `*.test.ts` imports it). Inverse: no case points outside `fixtures/scenarios/<existing id>/` or at a missing file. Mutations (header): M0 natural red 2 failed / 9 passed; M1 harness-s2 glob changed to `.case.jsonx` → 8 failed / 3 passed, restored; M2 stray case to `fixtures/scenarios/no-such-folder/` → 3 failed / 8 passed, deleted.

**CP2 detail.** Both cases were written by a script that RAN `check_feed` on the folder's inputs and read its `events.jsonl`. The fields, tools and contracts match the S2 `s2-rc-*` cases. Each `expectedEngineReportHash` equals `sha256` of the folder's committed `expected/report.json`: modifier-drift `a7b940d7…f7f860`, spec-valid-lie `4b5375b1…be6bac`. In other words, each case replays the folder's own committed report. size_impact is the typed SKIPPED step, because neither folder has orders data. Recorded turns were appended to `cases-s2/recorded-turns.json` under the S2 provenance: authored for replay, no live model ran. The diff is append-only and no existing turn changed. A fabricated-reference mutation (expected ref `item-999-v1#modifier.item-999-m1-o3`) → 2 failed / 43 passed (composition-lock "refs ⊆ engine ids" and the matrix row "expected finding ref missing from recommendations"), restored → 45/45.

Ownership and trigger are the case author's, from evidence. The route is the table's answer, not chosen:

| Case | triggerKind | ownership | Evidence |
| --- | --- | --- | --- |
| s2-rc-modifier-drift | sweep (the brief names no complaint, onboarding, agent order or order-errors file) | merchant | events lines 2–3: `merchant price_edit` on `item-011-m1-o2` and `item-009-m1-o3` after the `integrator sync catalog` at 2026-07-02T00:00:00Z; brief: "the merchant reprices 2 add-on options in the record … The marketplace copy last synced before the change" and "A Merchant-Ops analyst would sign" |
| s2-rc-spec-valid-lie | agent-preflight (brief: "before an agent relies on them") | unknown | events lines 2–3: both lied rows (`item-010-v1`, `item-011-v1`) edited by actor `unknown`; explain_drift abstains (unknown) |

**CP3 detail.** The case type already requires `CrewCaseS2.route.ownership`, and `runS2Seats` reads it directly, so neither the orchestrator nor the type changed. The rule, before → after (verbatim, also in the commit): `ownership unknown → human-escalation; ownership integrator (evidence: the partner submitted the feed) → partner`. The evidence is brief.md: "A new integration partner sends its first feed for this synthetic merchant." I re-derived the expectations by running the case: route partner {partner-ticket, slack} (reason "Row 3: the trigger is a partner onboarding…"), terminal recommendation, class flag-violations, refs = the first two engine ids (`item-007-v1#availability`, `item-009-v1#availability`). The manifestDigest was re-stamped on the case and on its turns entry, because the `s2` block is in the manifest. The turn content (intake route, reviewer approve) is unchanged.

**CP4 detail.** The two schema files were written as `JSON.stringify(TOOLS.get(name).inputSchema, null, 2)` from the inline objects at `601ff67`. The registry now `loadSchema`s them, and the inline consts and `CENTS` are deleted. Same bytes, by canonical-JSON compare (`evals/mcp/canonical-json.mjs`) of the inline object before against the file-loaded object after:
- explain_drift: sha256 `02c3477ec27a5985e51e8e42a4a61062ec9c7013e42c6a347f0787a150697701` (1118 B), both sides;
- size_impact: sha256 `61cfd44b6af88895cf8e5b7aa02c11a50155df19a05e943bc30941bcacd8fae7` (2013 B), both sides.

Adding both names to `EXPECTED_TOOL_ORDER` extends the file-vs-advertised schema lock to them. A new describe in `mcp-conformance.test.ts` calls both tools over a REAL spawned stdio server through the `evals/mcp/harness.ts` client. For each, it requires the text to equal the direct `callTool` canonical, `isError: false`, and exit 0. Mutation: size_impact removed from `MCP_ADVERTISED_TOOLS` → 6 failed / 37 passed; restored → 43/43. Both tools qualify for the four annotation hints, which I checked rather than assumed: they compute from params only, explain_drift reads no file, and `lib/impact` imports no `node:fs`.

## Route before → after, every case

Measured by replaying the whole S2 set before CP2 (`replayS2()`, scratch TSV) and again after CP3. Diff: one existing row moved; two rows are new.

| Case | Before (route · artifacts · terminal) | After | Changed |
| --- | --- | --- | --- |
| s2-im-agent-86-escalated | human-escalation · — · escalate-to-human | same | no |
| s2-im-agent-86-orders | merchant-ops · slack, email · recommendation | same | no |
| s2-im-fee-precheck | compliance · email, ledger · recommendation | same | no |
| s2-im-sync-outage-unowned | human-escalation · — · escalate-to-human | same | no |
| s2-rc-agent-86 | merchant-ops · slack, email · recommendation | same | no |
| s2-rc-modifier-drift | (did not exist) | merchant-ops · slack, email · recommendation | new (CP2) |
| s2-rc-partner-onboarding | human-escalation · — · escalate-to-human | **partner · partner-ticket, slack · recommendation** | **yes (CP3)** |
| s2-rc-platform-override | merchant-ops · slack, email · recommendation | same | no |
| s2-rc-spec-valid-lie | (did not exist) | human-escalation · — · escalate-to-human | new (CP2) |
| s2-rc-sync-outage | partner · partner-ticket, slack · recommendation | same | no |
| s2-rc-uncontracted-explain | human-escalation · — · escalate-to-human | same | no |
| s3-inj-injected-artifact | no S2 block, no route · escalate-to-human | same (committed trajectory reproduced byte for byte; composition-lock-s3 green) | no |
| A2 `evals/crew/cases/*` (20) and L-1 `cases-live/*` | no S2 block, no route | same (A2 full-record gold and legacy "no S2 key" test green) | no |

One-line diff of routes: `s2-rc-partner-onboarding human-escalation → partner`; every other existing route unchanged.

## Transcript diff explanation (`evals/mcp/gold/mcp-session.transcript.json`)

I re-recorded it with `node evals/mcp/record-transcript.mjs`, which is unchanged (exit 0). There are 11 steps before and 11 after, in two hunks:

1. **Step 0 `initialize.instructions` (one line, `@@ -14 +14 @@`).**
   - "these seven tools' decision paths" → "these tools' decision paths". The count would be false at nine; the new wording carries no count.
   - One sentence added for the two tools: "explain_drift is a deterministic baseline — an explanation, never a verdict; size_impact returns SIMULATED figures, never a saving claim."
   - protocolVersion, serverInfo and capabilities are identical.
2. **Step 1 `tools/list` (`@@ -457,0 +458,367 @@`).** Two entries are appended after `run_demo`, in registry order: `explain_drift` and `size_impact`. Each one:
   - inputSchema equals its committed file (canonicalized);
   - description equals the committed `TOOL_DESCRIPTIONS` entry (unchanged since S2);
   - annotations are the four byte-locked hints;
   - outputSchema is the same envelope schema as every other tool.

   The first seven entries are byte-identical.

Steps 2–10 (seven happy calls and two invalid calls) are byte-identical. Nothing else moved.

## CHANGED (`git diff e692e95..HEAD`, each file, one line)

- `evals/crew/crew-case-coverage.test.ts` (new): the folder-driven coverage test.
- `evals/crew/cases-s2/s2-rc-modifier-drift.case.json`, `s2-rc-spec-valid-lie.case.json` (new): the two root-cause cases.
- `evals/crew/cases-s2/recorded-turns.json`: two entries appended; partner-onboarding's `manifestDigest` re-stamped.
- `evals/crew/cases-s2/s2-rc-partner-onboarding.case.json`: ownership integrator, expectations re-derived, re-stamped.
- `evals/crew/crew-composition-lock-s2.test.ts`: `PINNED_S2_IDS` +2, root-cause count 5 → 7.
- `evals/crew/crew-s2-replay.test.ts`: `EXPECTED` +2 rows; partner-onboarding row → partner / recommendation (outside ALLOWED FILES, DEVIATION 1).
- `lib/tools/schemas/explain_drift.input.schema.json`, `size_impact.input.schema.json` (new).
- `lib/tools/registry.ts`: loadSchema swap for the two tools; inline consts removed; two comments.
- `lib/mcp/server.ts`: allowlist +2; count-free wording; one instructions sentence.
- `lib/mcp/descriptions.ts`: header counts; the false "NOT yet advertised" comment (DEVIATION 4).
- `evals/mcp/mcp-conformance.test.ts`: expected order +2; count-free titles; new real-server call describe.
- `evals/mcp/mcp-transcript-freeze.test.ts`: happy-call count derived from the transcript.
- `evals/mcp/gold/mcp-session.transcript.json`: re-recorded.
- `evals/tools/registry-s2-tools.test.ts`, `evals/tools/registry-path-hardening.test.ts`: placeholder pins flipped (DEVIATIONS 2, 3).
- `README.md`, `docs/GLOSSARY.md`, `docs/SHOWCASE.md`: MCP tool-count lines (below).
- `docs/returns/2026-10-31-w3a-crew-cases.md`: this packet.

**MCP tool-count lines changed.** The packet's grep (`grep -rn "seven tools\|six engine tools\|7 tools" README.md docs/ lib/ app/`) plus the README lines the grep misses:

| File:line | Before | After |
| --- | --- | --- |
| `lib/mcp/server.ts:3` | "six engine tools + the E2 lookup_reference lane" | "the engine tools, the E2 lookup_reference lane and, since W3-a CP4 (2026-10-31), the two S2 crew tools explain_drift and size_impact" |
| `lib/mcp/server.ts` plain line | "press the same seven clearly-labeled buttons" | "press the same clearly-labeled buttons" |
| `lib/mcp/server.ts` SERVER_INSTRUCTIONS | "these seven tools' decision paths" | "these tools' decision paths" (+ the two-tool sentence above) |
| `lib/mcp/server.ts` annotations note | "All seven tools genuinely qualify … into the deterministic engine" | "Every advertised tool genuinely qualifies … into deterministic code (explain_drift and size_impact compute from their params alone and read no file at all)" |
| `lib/mcp/descriptions.ts:3` | "six engine tools + the E2 advisory retrieval tool `lookup_reference`" | "the engine tools, the E2 advisory retrieval tool `lookup_reference` and the two S2 crew tools `explain_drift` and `size_impact`" |
| `lib/mcp/descriptions.ts` plain line | "each of the seven buttons" | "each of the buttons" |
| `README.md:61` | "**seven-tool MCP surface**" | "**deterministic MCP tool surface**" |
| `README.md:92` | "**Seven read-only tools over the same deterministic engine, exposed over stdio only**" | "**Read-only tools over the same deterministic engine, exposed over stdio only**" |
| `README.md:106` | "the seven MCP tools expose" | "the MCP tools expose" |
| `docs/GLOSSARY.md:52` | "(six engine tools + the E2 advisory `lookup_reference`, added 2026-07-12)" | "(six engine tools, the E2 advisory `lookup_reference` added 2026-07-12, and the crew's deterministic `explain_drift` and `size_impact`, advertised 2026-10-31)" |
| `docs/GLOSSARY.md:53` | "initialize → tools/list → one call per tool → invalid calls" | "initialize → tools/list → one call per tool, except the two crew tools advertised 2026-10-31, which the conformance suite calls over a real spawned server → invalid calls" |
| `docs/SHOWCASE.md:31` | "initialize → tools/list → every tool → invalid calls with typed errors." | "initialize → tools/list → every tool except the two crew tools advertised 2026-10-31 (the conformance suite calls those over a real spawned server) → invalid calls with typed errors." |

Hits left as they are:
- `docs/decision-log.md:65`, `docs/reviews/*`, `docs/returns/2026-10-31-s2-crew.md`: historical records; the contract bars editing decision-log.
- `docs/SHOWCASE.md:14,19` and `docs/GLOSSARY.md:74`: these give the REGISTRY count ("seven tools"), stale since S2-crew made it nine, and are not MCP counts (OPEN 5).

Counts were made count-free rather than retyped as "nine", because a typed figure is what went stale.

## TESTS

Contract baseline at `e692e95`: 2413 passed + 8 skipped. **Final: 2438 passed + 8 skipped (2446); Test Files 152 passed + 7 skipped (159).** Delta +25, accounted per file with the JSON reporter:

| File | Before → after | Why |
| --- | --- | --- |
| `evals/crew/crew-case-coverage.test.ts` | new, 11 | 1 discovery + 1 directories-globbed + 8 scenario folders (read from disk) + 1 inverse |
| `evals/crew/crew-s2-replay.test.ts` | 33 → 37 (+4) | 2 matrix rows (data-driven, one per new case) + 2 `EXPECTED` rows |
| `evals/mcp/mcp-conformance.test.ts` | 33 → 43 (+10) | 4 per-tool locks × 2 new tools + 2 real-server call tests |
| `evals/crew/crew-composition-lock-s2.test.ts` | 8 → 8 | pins edited, no new test |
| `evals/mcp/mcp-transcript-freeze.test.ts` | 4 → 4 | assertion replaced |
| `evals/tools/registry-s2-tools.test.ts` | 29 → 29 | pin flipped |
| `evals/tools/registry-path-hardening.test.ts` | 11 → 11 | pin flipped |

The before-counts of the two grown files were measured by running their `e692e95` versions (temporary copies, deleted): crew-s2-replay 35 collected on today's data (33 + the 2 data-driven matrix rows), mcp-conformance 33. Proving mutations are recorded above and in each file header. `git diff --stat e692e95..HEAD -- evals/crew/cases evals/crew/cases-s3 evals/crew/cases-live evals/crew/gold fixtures` prints nothing (exit 0). No golden besides the MCP transcript moved: the A2 full-record gold, the replay-floors matrix, both render goldens, the S3 trajectory and every fixture are byte-identical.

## COMMANDS (final run, after the last source edit)

- `node scripts/build-offline.mjs`: exit 0, run immediately before the full suite
- `npx vitest run` (JSON reporter, then the default reporter): exit 0, 2438 passed + 8 skipped, 159 files (152 + 7 skipped)
- `npx tsc --noEmit`: exit 0
- `npx eslint . --max-warnings=0`: exit 0
- `npx vitest run evals/packs/honesty-c10.test.ts`: exit 0, 312 passed
- `npx vitest run evals/mcp evals/tools`: exit 0, 221 passed (14 files)
- `npx vitest run evals/crew`: exit 0, 299 passed (20 files)
- `node --experimental-strip-types scripts-ts/stamp-case-digests.mts --check`: exit 0, 0 files out of date
- `node evals/mcp/record-transcript.mjs`: exit 0
- `git ls-files node_modules`: prints nothing

## DEVIATIONS (each with reason)

1. **`evals/crew/crew-s2-replay.test.ts` edited (outside ALLOWED FILES).** Its `EXPECTED` map pins the case ids ("covers exactly the pinned S2 set") and each case's explain, route and terminal. The CP2 done-test ("green with the two new cases listed") and the CP3 done-test ("scenario 5 on the partner route") are impossible without +2 rows and the partner-onboarding row moving. The edit was kept to those three rows. The gap is in the packet, not in this lane's scope: the packet licensed the case-list pin in `crew-composition-lock-s2` but did not foresee the same kind of pin in `crew-s2-replay`.
2. **`evals/tools/registry-s2-tools.test.ts` ~L95 edited (outside).** S2 wrote "the MCP surface still advertises exactly the original seven (S2 advertisement is an OPEN merge item)" as a placeholder, and advertising turns it red by design. It is now `TOOL_ORDER === [...TOOLS.keys()]` plus contains-both.
3. **`evals/tools/registry-path-hardening.test.ts` ~L159 edited (outside).** "A registered-but-unadvertised tool (explain_drift) is refused over MCP" has no subject once explain_drift is advertised. It now holds the same refusal on a name that is not registered (`not_a_registered_tool`), asserting the exact fixed text `unknown tool "not_a_registered_tool"`.
4. **`lib/mcp/descriptions.ts` comments edited (outside, unless counted as "doc lines that state the MCP tool count").** The header counts, plus the S2 comment "registered but NOT yet advertised on tools/list", which became false. No description string changed.
5. **spec-valid-lie runs `check_feed` on `inputs/feed.json`, surface `acp`, not `inputs/ucp-response.json`, surface `ucp` as the packet said.** `runCheck` refuses the UCP wire document by design (the shape guard of 2026-07-26). Exact refusal text, with the absolute worktree path shown as `<repo>`: "`<repo>/fixtures/scenarios/spec-valid-lie/inputs/ucp-response.json is a UCP WIRE document (has "products", no "items"), which the truth leg cannot compare against a system-of-record catalog. The truth and conformance legs answer different questions: run `check <repo>/fixtures/scenarios/spec-valid-lie/inputs/ucp-response.json --conformance` to validate it against the pinned UCP schemas. The truth leg takes a catalog-response FIXTURE (with "items") or an ACP feed via --surface acp.`" No registry tool exposes the generator's UCP truth leg (`ucpSearchResponseToClaims`). `feed.json` against `record.json` is what the folder's `expected/README.md` says `report.json` is ("run the way every listings scenario is run"), and the case's report hash equals that file's sha256. The brief states that the feed leg fires LST-PRICE-VALUE ×2 on the same rows as the UCP leg ("one comparator, two surfaces"). That is the brief's figure; this lane confirmed it independently by matching the report hash. See OWNER 1.
6. **The transcript recorder is unchanged, so the frozen session does not call the two new tools.** `evals/mcp/record-transcript.mjs` is outside ALLOWED FILES. An `explain_drift` happy call would also need its required ISO `asOf` in the transcript, which the freeze test's no-timestamp scan (`/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/`, whole file) refuses. Changing that scan would loosen a determinism guard. Instead:
   - the done-test "tools/call succeeds for both names through the real stdio server" is met in `mcp-conformance.test.ts` through `evals/mcp/harness.ts`;
   - the freeze test pins the uncalled remainder to exactly `["explain_drift", "size_impact"]`, so the gap is loud and goes red when the recorder catches up (OPEN 1).
7. **One sentence added to `SERVER_INSTRUCTIONS`** for the two tools ("explain_drift is a deterministic baseline — an explanation, never a verdict; size_impact returns SIMULATED figures, never a saving claim."). The instructions give every other non-verdict tool's status, and without this a client reading only the instructions could take a cause class for a finding. It is part of hunk 1 of the transcript diff.

## OPEN (exact file map of what is left)

1. **Recorder happy calls for the two S2 tools.**
   - Files: `evals/mcp/record-transcript.mjs` (`HAPPY_CALLS` +2) · `evals/mcp/mcp-transcript-freeze.test.ts` (the no-timestamp scan must exclude `steps[].request.arguments`, or explain_drift's `asOf` trips it; then flip the remainder pin to `[]`) · `evals/mcp/gold/mcp-session.transcript.json` (re-record) · `docs/GLOSSARY.md:53` and `docs/SHOWCASE.md:31` (drop the exception clause).
   - The orchestrator decides whether that guard may be scoped this way.
   - size_impact accepts `{findings: [], orders: [], windowDays: 7, errorChargeShare: 0.5}` with no timestamp (measured: zero figures, label simulated).
   - The recorder's own header, `evals/mcp/record-transcript.mjs:7` ("one happy call per the six tools"), is already stale at seven and should be made count-free in the same change.
2. **The `/docs` MCP table lists 7 of the 9 advertised tools.** Files: `app/docs/page.tsx` L299–349 (two rows: explain_drift "deterministic baseline — an explanation, never a verdict"; size_impact "simulated figures") · `evals/e2e/canonical.spec.ts` L472–485 (`toHaveCount(7)` and the name list). `app/**` is OUT for this lane; it belongs with the W3-a CP2 / W3-b port. Neither the site build nor the jsdom tests read `TOOL_ORDER`, so nothing here is red; the Playwright pin stays at 7 and CI adjudicates.
3. **The scenario fixtures still say S2 has not arrived.** Every scenario brief and `expected/README.md` says root-cause, impact, route and turns "arrive in S2; none acts on this folder yet", and `manifest.json` carries `"absentUntilS2": ["root-cause","impact","route","turns"]`. Now that every folder has a replaying crew case, this is stale. File: `scripts-ts/generate-scenarios.mts` (brief and manifest templates), then regenerate `fixtures/scenarios/**` and re-run `node --experimental-strip-types scripts-ts/stamp-case-digests.mts`. Those bytes are not read by any stamped case (only `inputs/*` are), but `evals/packs/scenarios.test.ts` FREEZE pins them. This needs a generator-owning lane; no fixture byte moved here.
4. **The S3 lock replays only `cases[0]`.** `evals/crew/crew-composition-lock-s3.test.ts` globs `cases-s3/` but replays the first case only; it is safe today because it also pins exactly one id. The coverage test checks the glob and `runCase(`, not that every globbed case is run. A second S3 case would need the S3 lock to loop.
5. **Registry count wording, stale since S2-crew, not MCP counts:** `docs/SHOWCASE.md:14,19` ("one validated seam, seven tools" / "Seven JSON-schema-validated tools (…)"), `docs/GLOSSARY.md:74` ("seven typed JSON-in/JSON-out tools"), `lib/tools/registry.ts:5` ("Seven typed JSON-in/JSON-out tools"; this lane's registry scope was the schema swap only). Also `README.md:60` and `README.md:105` ("a **four-role crew**"): the roster has six seats since S2.
6. **No registered tool sits off tools/list now**, so the allowlist's refusal of a registered-but-unadvertised name has no live divergence to test. The refusal path is held on an unregistered name (DEVIATION 3).

## OWNER (only the owner can decide)

1. **Scenario 6's crew case does not exercise the UCP answer itself.** The truth leg on a UCP wire document is unreachable through `check_feed` by design (DEVIATION 5), so the case replays the ACP feed the answer was built from. If the owner wants the crew to audit the UCP answer itself, that needs a new registry tool over the UCP truth leg (`lib/tools/**`, `lib/packs/listings/**`, a new schema, MCP advertisement) — scope this lane cannot take.
2. **Scenario 6's ownership is "unknown"**, because both lied rows were edited by actor `unknown`, so the run goes to a person. The brief also says "An Integrations manager would sign", which some readers might take as integrator ownership. That would route to partner. The case follows the event log and the Codex rule "unresolved responsibility goes to a person". Please confirm or flip it (one field in `evals/crew/cases-s2/s2-rc-spec-valid-lie.case.json`, then re-derive and re-stamp).

## NOT DONE

- Recorder happy calls for the two tools (OPEN 1).
- The `/docs` table rows (OPEN 2, out of scope).
- The fixture wording refresh (OPEN 3, generator-owned).
- No Codex gate: deferred by the owner this run.
- The packet's literal UCP-surface instruction for spec-valid-lie (DEVIATION 5, OWNER 1).

## GIT

At the packet commit: `git status --short` was clean; `git log --oneline -6` is in the final message to the orchestrator. Lane commits, oldest first: `dbaf3d6` CP1 · `833324f` CP2 · `601ff67` CP3 · `8efc3ce` CP4 part 1 · `52a6a91` CP4 part 2 · packet.

## MODEL

Claude Opus 5.5 (`claude-opus-5-5`); this is an Opus build.

Edge cases checked:
- each new case's report hash against the folder's committed `report.json` bytes;
- the serializer mode of each turns and case file (ascii for partner-onboarding and the turns file, plain for the new cases) round-trips under the stamp script;
- a fabricated reference bites;
- an unadvertised tool bites;
- a dropped happy call bites;
- `lib/impact` reads no file, checked before the read-only hint was claimed.

Stops honoured: `lib/crew/route.ts` untouched, no fixture byte, no existing recorded turn's content, no l1 lock, no A2 composition lock, no npm, no push.
