# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Cursor (Composer)
- **Account / session:** Cursor IDE
- **Task ID:** **T-002-PLAN — `docs/t002-slice-plan.md` created (docs only).** Roadmap committed at `df2b986`. T-001 green (23/23). **T-002 implementation not started.**
- **What was done (this session, lightweight):** created [docs/t002-slice-plan.md](docs/t002-slice-plan.md) from the approved Cursor T-002 plan — golden label schema (`eval/golden_merchants.v1.json`), guardrail regression corpus (`eval/guardrail_regression.v1.json`), metrics baseline (`out/eval_baseline.v1.json`), tests E1–E10, validation commands, GO/NO-GO, file layout. Synced `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`. **No `decision-log` change; no `scripts/`/`tests/`/CSV/`out/`/`eval/`/integration change; no commit.**
- **Reflects reality:** T-001 built + green; [docs/roadmap.md](docs/roadmap.md) on `main`; T-002 ratified + scoped on paper only; fully offline.
- **T-002 (planned, not built):** Offline Evaluation and Regression Harness — golden labels + regression set + `scripts/eval.py` + baseline metrics; see slice plan.
- **Git state (re-derived):** `HEAD = df2b986 "Add ActivationOps AI roadmap"`; tree was clean before this task. **Uncommitted now:** `docs/t002-slice-plan.md` + four state-doc syncs. Product code/tests/CSV/`out`/integrations unchanged.
- **What not to do:** do not implement T-002 without owner approval; do not jump to Gemini; do not add integrations/plugins/hooks; do not modify source CSV; do not commit unless the owner says so.
- **Next step:** owner reviews `docs/t002-slice-plan.md` → approves T-002 implementation task → build on branch (e.g. `feature/t002-eval-harness`) per slice plan. Tests still green: `python3 -m unittest tests.test_t001 -v`.
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
