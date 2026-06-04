# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-002-PLAN — `docs/t002-slice-plan.md`
- **Task name:** Offline Evaluation and Regression Harness — slice plan (documentation only)
- **Current stage:** **`docs/t002-slice-plan.md` created** from the approved Cursor plan. **T-002 implementation not started** — no `eval/`, `scripts/eval.py`, or `tests/test_t002.py`.
- **Mode / risk:** lightweight · low · documentation only.
- **Owner:** Cursor (author); human owner decides on commit and on starting T-002 implementation.
- **Goal:** a repo-native build spec for Phase 2 (golden labels, regression corpus, metrics, E1–E10 tests, validation commands) aligned with [docs/roadmap.md](docs/roadmap.md) and [docs/decision-log.md](docs/decision-log.md).
- **Allowed scope (this task):** create `docs/t002-slice-plan.md`; update `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
- **Out of scope (do not touch):** `docs/decision-log.md` (no new decision unless scope changes); `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations (Supabase/n8n/Slack/Resend/Gemini), plugins, hooks.
- **Key output:** [docs/t002-slice-plan.md](docs/t002-slice-plan.md) — problem statement, file layout, golden schema, regression cases, metrics, E1–E10, validation commands, GO/NO-GO.
- **Acceptance criteria:** slice plan exists and matches ratified T-002 scope; no product/test/CSV/`out`/integration change; T-002 code not started.
- **Commit decision:** owner decides — uncommitted docs-only batch.

## Completed (historical)

- **Roadmap** — [docs/roadmap.md](docs/roadmap.md) committed at `df2b986`; Foundation + 7 phases; T-002 = Phase 2 next.
- **T-001** — offline thin slice implemented; **23/23** tests; closed with minor follow-ups. Run: `python3 scripts/run.py`; `python3 -m unittest tests.test_t001 -v`.

## Hygiene / decision follow-ups (non-blocking)

1. `out/` generated-log tracking policy (`audit_log.csv`, `model_runs.csv`).
2. Whether CSV-immutability / secrets-blocking hooks become a future approved task.

## Status / continuity

- **Git (re-derived):** `HEAD = df2b986 "Add ActivationOps AI roadmap"`; tree was clean before this task. **Uncommitted now:** `docs/t002-slice-plan.md` (new) + state-doc syncs (`CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`). No `decision-log` change; product code/tests/CSV/`out`/integrations unchanged.
- **Next safe step:** owner reviews slice plan → approves T-002 **implementation** as a separate task (golden JSON, regression JSON, `scripts/eval.py`, `tests/test_t002.py`). Do not implement T-002 before owner approval.
