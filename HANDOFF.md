# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Git state refreshed 2026-06-04 by the retrospective build-process compliance audit ([docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md)) — the prior block still described T-002 as uncommitted on a feature branch after it had been merged.

- **Last session tool:** Claude Code (Opus 4.8) — build-process compliance audit. **T-002 was implemented by Cursor (Composer)** and is now merged.
- **Task ID:** **T-002 — Offline Evaluation and Regression Harness — merged to `main`** (`a95c0f1`; cleanup `dc7d131`).
- **What was done:** built offline eval harness per [docs/t002-slice-plan.md](docs/t002-slice-plan.md) — `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases: 5 T-001 regex parity + 1 structural + extras), `scripts/eval.py`, `tests/test_t002.py` (E1–E10). Baseline writes to **`eval/eval_baseline.v1.json`** (not `out/`). Flag rules: inclusion for positives; exact-empty for negatives/source/stub.
- **Validation:** `python3 -m unittest tests.test_t001 tests.test_t002 -v` → **35/35 OK** (T-001 23 + T-002 12); `python3 scripts/eval.py` → **MERCHANT 20/20 | GUARDRAIL 45/45 | PASS**.
- **Corpus note:** `GR-POS-009` (`pii_or_secret`) uses sentinel `__REGRESSION_PII_API_KEY_ASSIGNMENT__` in JSON; `scripts/eval.py` assembles the assignment-form scan text from fragments (no contiguous live-key literal in repo).
- **T-001 guardrail change:** `scripts/guardrail.py` hardened `pii_or_secret` with an assignment-form detector (the `api_key=` secret-assignment pattern). T-001 pipeline outputs/behavior unchanged; **`python3 -m unittest tests.test_t001 -v` still passes** (23/23).
- **Unchanged:** source CSV; `out/` T-001 artifacts; no integrations.
- **Git (re-derived 2026-06-04):** branch `main`; `HEAD = dc7d131` ("Clean up T-002 merge status"); the audit/decision/state-doc batch is currently uncommitted pending owner review — re-run `git status` before continuing. T-002 implementation committed at `a95c0f1` and fast-forwarded into `main`; branch `feature/t002-eval-harness` remains at `a95c0f1` (1 behind `main`, not deleted).
- **What not to do:** do not start Phase 3 / Gemini until the pre-Phase-3 gate is cleared; do not modify source CSV or `out/`.
- **Next step:** clear the remaining **pre-Phase-3 gate** items in [docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md) — enforce git-state re-derivation at task-close; resolve the `out/` log + enforcement-hooks follow-ups; confirm the baseline is the accepted pre-Gemini measuring stick. **Done 2026-06-04:** `docs/decision-log.md` rows for the `pii_or_secret` guardrail change + the `eval/` baseline artifact policy. Phase 3 = **FULL** workflow.
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
