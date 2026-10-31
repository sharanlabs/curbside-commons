# Return packet — cli-experience (Wave 2, lane 7) — 2026-10-31

**Plain English:** the command line has two new verbs. `scenario <id>` re-runs a labeled scenario folder through the checker and says whether the answer still matches the one committed with it, printing the brief's figures. `ledger verify|checkpoint|diff` checks and compares the run ledger. Nothing sends, nothing calls a model, nothing writes a ledger.

## SLICE
cli-experience — `node bin/check.mjs scenario <id> [--json] | --list` and `node bin/check.mjs ledger verify|checkpoint|diff` (plan § 11 "New:" line).

## GIT
Branch wave2/cli-experience, fast-forwarded to main e42aad1 first. Final `git status --short` and `git log --oneline -6`: see the branch (packet commit is the tip).

## CHANGED
- lib/cli/scenario.ts (new): listScenarios, runScenario (same public engine entry points the generator uses; same serializers; byte-compare to expected/report.json; figures from manifest), renderers, ScenarioError.
- lib/cli/ledger.ts (new): ledgerVerify, ledgerCheckpoint, ledgerDiff, parseCheckpointArg; reads only via lib/ledger/fs.ts.
- bin/check.mjs: `scenario` and `ledger` subcommands (strict flags, exit 0/1/2), usage text, `--root <dir>` for tests.
- README.md: the two lines in the "From the repo" block.
- evals/packs/scenario-cli.test.ts, evals/packs/ledger-cli.test.ts (new).

## TESTS
Baseline after ff (first run, before edits): 1912 passed + 8 skipped, 142 files (135 passed + 7 skipped files). After: 1923 passed + 8 skipped, 144 files. Delta +11 = 6 in scenario-cli (list, every scenario + figures, one-byte golden change, exit 2 cases, usage, egress walk = 6 incl. the walk) + 5 in ledger-cli. Nothing else moved. (The packet's CP "S1 lane adds two more scenarios" is handled: enumeration is read from disk, never hard-coded; five folders are present now.)
Mutations, each red then restored:
- goldenMatch forced true -> one-byte-change test RED.
- figures `{}` -> figures-equal test RED.
- directory filter pinned to one id -> --list and every-scenario tests RED.
- `import "node:https"` in lib/cli/scenario.ts -> egress-tooth test RED.
- ledgerVerify failure exit 1 -> 0 -> tamper and checkpoint tests RED.
- diff `changed` section dropped -> diff test RED.
- checkpoint prints hash without seq -> checkpoint test RED.

## COMMANDS
build-offline 0 · tsc --noEmit 0 · eslint . --max-warnings=0 0 · full vitest 1923 passed + 8 skipped · honesty-c10 169 passed · `git ls-files node_modules` printed nothing.

## DEVIATIONS
- The scenario run uses report.specVersion for `enginePin` (identical to LISTINGS_SPEC_VERSION / FEES_SPEC_VERSION by construction) instead of importing the constants.
- `ledger verify` / `checkpoint` / `diff` treat a missing or empty ledger file as exit 2 (unreadable input), since an empty chain would verify vacuously. `checkpoint` refuses (exit 1) on a ledger that does not verify.
- Ledger seq is zero-based (first line = seq 0); tests are written to that.

## OPEN
- A scenario whose verdict is FAIL (all five today are, by design) still exits 0 when it matches its golden; exit 1 means golden mismatch only, per the packet. The verdict is on the verdict line and in --json.
- `scenario --list --json` returns an array of {id, number, pack, title}; not in the packet, harmless.

## NOT DONE
Nothing from CP1-CP5 is outstanding. lib/packs/listings/cli.ts untouched; no state docs edited; no Codex; no live model.

## MODEL
Sonnet 5.5 (not Opus 5.5). Differences if any: I proved every mutation by actually running it (an early attempt with BSD sed silently no-op'd and I redid it in Python rather than trusting the green), and I kept `--root` and path-traversal-safe id validation (`^[a-z0-9-]+$` plus membership in the folder list). Judgment calls are listed under DEVIATIONS; no stops were triggered.
