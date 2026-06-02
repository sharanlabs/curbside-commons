# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001.5 — Enterprise Delivery Playbook. Status: **playbook created (reduced single-doc form); pending owner review + commit.**
- **What was done (this session = standards/process):** created `docs/enterprise-delivery-playbook.md` (Universal Professional Delivery Standard + ActivationOps AI Application + Living Standard rule, ~30 sections, one file); added pointer/obligation edits to `RULES.md` (§14), `CLAUDE.md`, `CODEX.md`, and `docs/checklists/prevent-repeat-checklist.md` (process checks incl. **git-state re-derivation** — closes the audit's recurring finding). **No** product code, tests, CSV, `out/`, or integration edits.
- **Scope discipline:** built only the reduced form approved by the blindspot review. **Did not** create separate source-scan / evidence-matrix / framework-matrix / assumptions files (deferred). Net new standing files: **+1** (the playbook).
- **Git state (re-derived 2026-06-02):** `HEAD = 2ccafce`. **Uncommitted** (owner has not committed since): the T-001 ground-rules audit, the T-001.5 blindspot review, **the playbook + its pointer edits**, the state-doc updates, and `out/audit_log.csv`/`out/model_runs.csv` (from the audit's `run.py`). Product code/tests/CSV/`out` snapshots unchanged.
- **What not to do:** Do not start T-002; do not modify CSV / code / tests / `out/` / integrations; do not commit unless the owner says so; do not spawn new standing logs (playbook § No New Standing Logs).
- **Next step:** owner reviews `docs/enterprise-delivery-playbook.md` + the `RULES`/`CLAUDE`/`CODEX`/checklist edits, approves, and commits the pending audit + review + playbook together. Then close T-001's open follow-ups (`out/` log policy, `v1-slice-plan` doc-sync), then ratify the T-002 ordering (offline eval harness vs. Gemini) in `docs/decision-log.md`. Tests: `python3 -m unittest tests.test_t001 -v`.
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
