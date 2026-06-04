# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Cursor (Composer)
- **Task ID:** **T-002 implemented** on `feature/t002-eval-harness` (not committed).
- **What was done:** built offline eval harness per [docs/t002-slice-plan.md](docs/t002-slice-plan.md) — `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases: 5 T-001 regex parity + 1 structural + extras), `scripts/eval.py`, `tests/test_t002.py` (E1–E10). Baseline writes to **`eval/eval_baseline.v1.json`** (not `out/`). Flag rules: inclusion for positives; exact-empty for negatives/source/stub.
- **Validation:** `python3 -m unittest tests.test_t001 tests.test_t002 -v` → **35/35 OK** (T-001 23 + T-002 12); `python3 scripts/eval.py` → **MERCHANT 20/20 | GUARDRAIL 45/45 | PASS**.
- **Corpus note:** `GR-POS-009` (`pii_or_secret`) uses sentinel `__REGRESSION_PII_API_KEY_ASSIGNMENT__` in JSON; `scripts/eval.py` assembles the assignment-form scan text from fragments (no contiguous live-key literal in repo).
- **T-001 guardrail change:** `scripts/guardrail.py` hardened `pii_or_secret` with an assignment-form detector (`api_key=sk_live_…` pattern). T-001 pipeline outputs/behavior unchanged; **`python3 -m unittest tests.test_t001 -v` still passes** (23/23).
- **Unchanged:** source CSV; `out/` T-001 artifacts; no integrations.
- **Git (re-derived):** branch `feature/t002-eval-harness`; `HEAD = 1a0dbd0`; uncommitted — `eval/`, `scripts/eval.py`, `tests/test_t002.py`, doc/state updates.
- **What not to do:** do not commit unless owner says so; do not start Gemini; do not modify source CSV or `out/`.
- **Next step:** owner review → Codex changed-files review → commit/merge T-002 branch.
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
