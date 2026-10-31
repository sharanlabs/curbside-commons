# Return packet — lane ci-hygiene (Wave 2, lane 6), 2026-10-31

## SLICE
`npm audit` JSON + CycloneDX SBOM as CI artifacts · `.env.example` re-headed and guarded · dependency prune assessed (recorded, not executed) · SECURITY.md Dependencies section.

## GIT
Branch `wave2/ci-hygiene` from `cd0d347`. WIP commits: CP1 ci.yml, CP2 env template + test, CP4 SECURITY.md + honesty-c10 list, then this packet (see `git log --oneline -6` in the worktree).

## CHANGED
- `.github/workflows/ci.yml` — after `npm ci`: non-blocking `npm audit --omit=dev --audit-level=high` (continue-on-error), `npm audit --omit=dev --json > audit.json || true`, `npm sbom --sbom-format cyclonedx --omit=dev > sbom.cdx.json`, then `actions/upload-artifact` (SHA-pinned) uploading both, 14-day retention, `if: !cancelled()`. `permissions: contents: read`, single job, concurrency untouched.
- `.env.example` — re-headed "Curbside Commons — Menu Integrity Crew"; HOW TO USE and verify lines kept; legacy drafter/judge wording and the "$5 cap" removed ("free tiers only (decision 2026-10-12); absent key = replay, $0"); every variable the code reads is listed with a blank value.
- `evals/packs/env-template.test.ts` — new, 4 tests.
- `SECURITY.md` — new "Dependencies" section (artifacts, where to read them, license table).
- `evals/packs/honesty-c10.test.ts` — one line: `SECURITY.md` added to `scannedFiles` (was absent).

## Pin
`actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2 (= tag v4)`. Resolved with `git ls-remote https://github.com/actions/upload-artifact 'refs/tags/v4' 'refs/tags/v4.*'` (no GitHub API): `refs/tags/v4` and `refs/tags/v4.6.2` both point at ea165f8d…; lightweight tags, so the SHA is the commit. Newer majors exist (v5 330a01c4…, v6 b7c566a7…, v7.0.2 cf430e03…); v4 was chosen because the packet said v4. A bump to v7 is a one-line follow-up.

## Variables listed (all read by code under lib/ app/ bin/ scripts-ts/)
ENABLE_LIVE_AI · GROQ_API_KEY · GEMINI_API_KEY · CREW_LIVE_MODEL · FEE_CLASSIFIER_MODEL · GROQ_DRAFT_MODEL · GEMINI_MODEL · JUDGE_MODEL · JUDGE_PROVIDER · DOMAIN_JUDGE_PROVIDER · SLACK_WEBHOOK_URL · RESEND_API_KEY · RESEND_TO · RESEND_FROM · NEXT_PUBLIC_BUILD_SHA · NEXT_PUBLIC_BUILD_TIME_UTC · L1_OUT_DIR · UCP_ORACLE_INSTALL · FETCHED_AT.
Dropped as unread: `DOMAIN_JUDGE_MODEL` (old template listed it; no `process.env` read exists). `OLLAMA_HOST`: no reference in code, not listed. SLACK/RESEND are still read (scripts-ts/l2-*-one-shot.mts), so kept. `ENABLE_LIVE_AI` is read via `envBool("ENABLE_LIVE_AI")` as well as directly; ENABLE_LIVE_AI and JUDGE_PROVIDER previously had values (`false`, `groq`); now blank (blank = same default).

## TESTS
Count before → after (full run): 1821 passed + 8 skipped (1829) → 1824 passed + 8 skipped + **2 failed** (1834). New: 4 (env-template) + 1 (honesty-c10 `it.each` row for SECURITY.md) = 5, all passing.
Mutations (recorded in the test header): deleting `UCP_ORACLE_INSTALL=` → "lists every variable the code reads" red naming it; `GROQ_API_KEY=x` → "holds no value" red naming it; both restored, 4/4 green.
**The 2 failures are environmental, not from this lane:** `evals/mcp/mcp-import-walk.test.ts` (2 tests) reads `<worktree>/node_modules/@modelcontextprotocol/sdk/...`; this worktree's `node_modules` is a real directory (only a vitest cache in it), not the symlink the contract describes, so the SDK path does not exist. Other tests pass because Node resolves imports up the tree to main's install. I did not repair the worktree. Expect those 2 to pass on main. Not re-run against baseline `cd0d347` here.

## COMMANDS
`node scripts/build-offline.mjs` 0 · `npx tsc --noEmit` 0 · `npx eslint . --max-warnings=0` 0 · `npx vitest run` exit non-zero (2 environmental failures above; 1824 pass) · `npx vitest run evals/packs/env-template.test.ts evals/packs/honesty-c10.test.ts` 0 (173 passed) · `git ls-remote` 0. `npm audit` / `npm sbom` NOT run (contract: registry/worktree rules).

## DEVIATIONS
None beyond the pin choice note. YAML was validated by reading back (indentation of the new steps matches the existing 6-space `- ` list; the multi-line `path: |` block is indented under `with:`), not by a parser.

## OPEN
1. **Do NOT run `npm uninstall @huggingface/transformers` yet. The premise "retired lane, no imports" is false.** Still importing it: `lib/rag/embed-transformers.ts` (line 17, in tsconfig scope, so `tsc` would fail) and `scripts-ts/rag-fetch-model.mts` (line 17); also loading that file: `scripts-ts/rag-score.mts`, `rag-offline-proof.mts`, `rag-scratch-probe.mts`. No test or app code imports it (`evals/rag/rag-lane-units.test.ts` deliberately dropped it). The prune needs the orchestrator to decide: delete those five files first (or archive them under `legacy/`), then on main run `npm uninstall @huggingface/transformers` (regenerates the lockfile), then `npm run verify`. `lib/rag/corpus-manifest.json` also mentions it (text only; check whether a hash test covers it). I did not edit package.json.
2. First CI run: read `audit-and-sbom` artifact (`supply-chain-audit-and-sbom`) for current advisories — I could not run `npm audit`. Then decide whether to make the audit step blocking.
3. Optional: add `audit.json` / `sbom.cdx.json` to `.gitignore` (outside this lane's allowed files); they exist only on the CI runner, so no harm today.
4. This worktree's `node_modules` is not a symlink (see TESTS); other lanes may see the same 2 MCP-walk failures.

## NOT DONE
Dependency prune (blocked by OPEN 1). `npm audit` / SBOM execution. No audit advisories recorded (not runnable here).

## MODEL
Claude Sonnet 5.5. Versus an Opus 5.5 build: I would expect the same output; the judgment calls were mostly to verify the retired-lane premise by grep (it was false) and to refuse the prune, to flag the two environmental failures rather than paper over them, and to make the env test require an active `NAME=` line (not a comment mention) and also scan for key-shaped strings. Hard stops honoured: no package.json/lockfile edit, no network call except git ls-remote, no state-doc edits.
