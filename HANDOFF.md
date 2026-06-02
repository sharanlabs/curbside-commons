# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001.5 enforcement — Mandatory Startup Contract. Status: **enforcement added; pending owner commit.**
- **What was done (this session = enforcement docs):** added the **Mandatory Startup Contract** — `RULES.md` §15 (10-step session start + Professional Process Applied block + stop condition + anti-bloat allowance + Codex enforcement); `CLAUDE.md` startup section upgraded to the contract; `CODEX.md` startup-contract verification + **process-finding** rule; the Professional Process Applied block in `docs/prompts/claude-task-template.md`; process/playbook compliance checks in both Codex review templates; a startup-contract item in `prevent-repeat-checklist.md`. **No** product code, tests, CSV, `out/`, or integration edits.
- **Git state (re-derived 2026-06-02):** `HEAD = cd4c188 "Add enterprise delivery playbook and T-001 audit"` — playbook + T-001 audit + blindspot review are committed; the earlier `out/` delta is resolved (tree was clean before this update). **Uncommitted:** only this enforcement update (the contract edits + state-doc updates). Product code/tests/CSV/`out` unchanged.
- **What not to do:** Do not start T-002; do not modify CSV / code / tests / `out/` / integrations; do not commit unless the owner says so; do not spawn new standing logs; do not over-ceremony trivial edits (one-line Professional Process Applied block is allowed).
- **Next step:** owner commits this enforcement update. Then close T-001's remaining doc follow-up (`docs/v1-slice-plan.md` test-list sync), then ratify the T-002 ordering (offline eval harness vs. Gemini) in `docs/decision-log.md`. Tests: `python3 -m unittest tests.test_t001 -v`.
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
