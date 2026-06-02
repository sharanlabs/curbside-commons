# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001 (offline thin slice — implementation). Status: **implemented; T1–T18 pass; pending Codex changed-files review + commit decision.**
- **What was done:** Built the offline pipeline (`scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`) + tests (`tests/test_t001.py`, T1–T18) + fixtures; generated `out/` (`merchants_v1.csv`, `review_queue.csv`, `model_runs.csv`, `audit_log.csv`). Stdlib only; no network, no AI call, no integrations. Source CSV read-only, hash-verified unchanged.
- **Result:** `python3 -m unittest tests.test_t001 -v` → **18/18 pass**. Canonical run: 20 merchants, 8 review queue (High), 12 simulated_sent, 8 High held (`pending_review`), 0 draft_rejected, 0 skipped. Send gate verified (T17): no High merchant sent without a synthetic approval.
- **Files changed:** Created `scripts/*` (5), `tests/*` (test + `__init__`), `tests/fixtures/*` (3); generated `out/*` (4). Updated `CURRENT_TASK.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Issues fixed during build (logic, not tests):** risk_level enum normalization (`Low Risk`→`Low`); two guardrail regex bugs caught by T18 (`%\b`; inflected-verb `\b`). See implementation journal.
- **Git status at handoff:** Repository initialized (commit `b57cf2c`). All slice code, tests, generated `out/`, and prior docs are **uncommitted** on disk; committing is the human owner's call (`RULES.md` §12). Not committed.
- **Doc-sync DONE (2026-06-02):** `docs/v1-data-dictionary.md` updated to match the code — status line, §1 row 11 + §3/§6 (risk_level `… Risk`→enum normalization), §9 two regex fixes (`%` not `%\b`; inflected verbs `guarantee[sd]?`). Doc regex now matches `scripts/guardrail.py` verbatim. No code/tests/CSV changed.
- **What not to do:** Do not modify the source CSV; no integrations / Gemini / real email; do not commit unless the owner says so.
- **Next step:** run `/codex:review --background` on the changed files (changed-files review template), address findings, then the owner decides on commit. Run the app with `python3 scripts/run.py`; tests with `python3 -m unittest tests.test_t001 -v`.
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
