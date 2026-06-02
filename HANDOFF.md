# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001 (offline thin slice — implementation + 2 Codex review rounds + hygiene). Status: **implemented (committed `653245b`); all P2 findings (4 + 2) fixed; 23/23 tests pass; `.gitignore` added; pending owner P2-fix/hygiene commit decision.**
- **What was done:** Built the offline pipeline (`scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`) + tests + fixtures; generated `out/`. Then applied the Codex P2 fix pass (see below). Stdlib only; no network, no AI call, no integrations. Source CSV read-only, hash-verified unchanged.
- **Result:** `python3 -m unittest tests.test_t001 -v` → **23/23 pass** (T1–T18 + P2-1..P2-5). Documented path verified: `scripts/run.py --fresh` → 12 simulated_send; `scripts/run.py` again → 0 new sends + 12 `skipped_duplicate`; `model_runs.csv` 40 rows / 40 unique IDs.
- **Files changed:** Created `scripts/*` (5), `tests/*` (test + `__init__`), `tests/fixtures/*` (3); generated `out/*` (4). Updated `CURRENT_TASK.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Issues fixed during build (logic, not tests):** risk_level enum normalization (`Low Risk`→`Low`); two guardrail regex bugs caught by T18 (`%\b`; inflected-verb `\b`). See implementation journal.
- **Git status at handoff (corrected per Codex final review):** the **T-001 implementation IS committed** — `HEAD = 653245b "Implement T-001 offline thin slice"`. **Uncommitted on top:** the Codex P2 fixes, the `.gitignore` hygiene, and the doc updates. So the pending commit is the *P2-fix/hygiene* commit, **not** the first implementation commit. (The earlier "nothing committed" wording in `CURRENT_TASK.md` and `PROJECT_STATE.md` has now been corrected too.)
- **Doc-sync DONE (2026-06-02):** `docs/v1-data-dictionary.md` updated to match the code — status line, §1 row 11 + §3/§6 (risk_level `… Risk`→enum normalization), §9 two regex fixes (`%` not `%\b`; inflected verbs `guarantee[sd]?`). Doc regex now matches `scripts/guardrail.py` verbatim. No code/tests/CSV changed.
- **Codex changed-files review (job `bbvaa9pmp`) — all 4 × P2 RESOLVED (2026-06-02):** (1) `run.py` now preserves audit history by default (`--fresh` to reset) → app re-runs dedup; (2) `parse_int` rejects fractional values; (3) `model_run_id` offset by existing row count → unique across appends; (4) `state_mismatch` now flags prose claiming a not-yet-completed step is done. Each covered by a P2 test. See implementation journal.
- **Doc-sync flagged (docs-allowed task):** `docs/v1-slice-plan.md` should enumerate the 4 P2 tests and note `run.py --fresh` vs preserve-history. Code matches the data-dictionary intent (the §10 idempotency guarantee now also holds via the app path).
- **Hygiene (2026-06-02):** added `.gitignore` (`__pycache__/`, `*.pyc`, `.pytest_cache/`, `.DS_Store`). `out/` left **tracked** (portfolio demo artifact; reasoning in `.gitignore`). Two follow-ups for the owner (not done — git-index/commit actions): (a) `git rm -r --cached scripts/__pycache__ tests/__pycache__` to untrack already-committed bytecode; (b) regenerate `out/` with `python3 scripts/run.py --fresh` before committing so the append-only logs show one clean run (they currently hold the 2-run idempotency demo).
- **What not to do:** Do not modify the source CSV; no integrations / Gemini / real email; do not commit unless the owner says so.
- **Final Codex review (job `bmyf43y0x`) — both P2 RESOLVED (2026-06-02):** (A) guardrail now flags verb-first completion claims ("We've added your photos") via past-tense patterns ("set" gated by a completion auxiliary), covered by `test_p2_5` + a clean-draft negative control; (B) git commit-state wording corrected in `CURRENT_TASK.md`/`PROJECT_STATE.md`/this file. **No Codex findings remain.**
- **Next step:** owner decides on the **P2-fix/hygiene commit** (implementation already at `653245b`). Before committing `out/`, optionally `python3 scripts/run.py --fresh`; consider `git rm -r --cached scripts/__pycache__ tests/__pycache__`. Tests: `python3 -m unittest tests.test_t001 -v`.
- **If unsure, stop and ask.**

## Standing continuity procedures

### If Claude Code account 1 hits usage mid-task

1. Stop.
2. Update `CURRENT_TASK.md`.
3. Update this `HANDOFF.md`.
4. Update `PROJECT_STATE.md`.
5. Update `docs/task-log.md`.
6. List uncommitted changes (`git status`).
7. Do not start a new task.

### When Claude Code account 2 (or the CLI) starts

1. Read `RULES.md`.
2. Read `PROJECT_STATE.md`.
3. Read `CURRENT_TASK.md`.
4. Read `HANDOFF.md`.
5. Read `docs/task-log.md`.
6. Run `git status`.
7. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step.
8. Wait for human approval before continuing.

### Background Codex jobs

When a Codex job runs in the background, record its purpose and whether its result was checked here or in `docs/task-log.md`. Poll with `/codex:status`; fetch with `/codex:result`; cancel with `/codex:cancel`.
