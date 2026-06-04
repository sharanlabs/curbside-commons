# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-002 — Offline Evaluation and Regression Harness
- **Task name:** Implement T-002 eval harness (golden labels, regression corpus, eval runner, E1–E10)
- **Current stage:** **Implemented on branch `feature/t002-eval-harness`** — **35/35 tests pass** (T-001 23 + T-002 12); `python3 scripts/eval.py` → MERCHANT 20/20 | GUARDRAIL 45/45 | PASS; baseline at `eval/eval_baseline.v1.json`. **Not committed** (owner decides).
- **Mode / risk:** lightweight · low-medium · offline deterministic extension.
- **Owner:** Cursor (implementer); human owner decides on commit and Codex review.
- **Goal:** measuring stick before Gemini — golden merchants, guardrail regression, baseline JSON.
- **Key outputs:** `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases), `scripts/eval.py`, `tests/test_t002.py`, `eval/eval_baseline.v1.json`.
- **Out of scope (unchanged):** source CSV, `out/` T-001 artifacts, live integrations, Gemini.
- **Commit decision:** owner decides — uncommitted T-002 batch on `feature/t002-eval-harness`.

## Completed (historical)

- **T-002 plan** — [docs/t002-slice-plan.md](docs/t002-slice-plan.md) (now marked implemented).
- **T-001** — 23/23; [docs/v1-slice-plan.md](docs/v1-slice-plan.md).
- **Roadmap** — [docs/roadmap.md](docs/roadmap.md) on `main` at `df2b986`.

## Hygiene / decision follow-ups (non-blocking)

1. `out/` generated-log tracking policy.
2. Enforcement hooks (CSV/secrets) — future approved task.
3. Commit vs gitignore policy for `eval/eval_baseline.v1.json`.

## Status / continuity

- **Git (re-derived):** branch `feature/t002-eval-harness`; `HEAD = 1a0dbd0` ("Add T-002 evaluation harness plan"). **Uncommitted:** `eval/`, `scripts/eval.py`, `tests/test_t002.py`, `docs/t002-slice-plan.md`, state-doc syncs. Parent on `main` includes `df2b986` (roadmap).
- **Validation:** `python3 -m unittest tests.test_t001 tests.test_t002 -v` → OK; `python3 scripts/eval.py` → exit 0.
- **Next safe step:** owner review → Codex `/codex:review` → commit/merge when approved. Phase 3 (Gemini) still blocked until baseline is accepted.
