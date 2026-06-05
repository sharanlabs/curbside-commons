# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-002 — Offline Evaluation and Regression Harness
- **Task name:** Implement T-002 eval harness (golden labels, regression corpus, eval runner, E1–E10)
- **Current stage:** **Merged to `main`** (`a95c0f1`; cleanup `dc7d131`) — **35/35 tests pass** (T-001 23 + T-002 12); `python3 scripts/eval.py` → MERCHANT 20/20 | GUARDRAIL 45/45 | PASS; baseline at `eval/eval_baseline.v1.json`. **Closed with minor follow-ups** (see the pre-Phase-3 gate below).
- **Mode / risk:** lightweight · low-medium · offline deterministic extension.
- **Implementer:** Cursor (Composer). 8 Codex review rounds ran before the commit; merge committed by the owner.
- **Goal:** measuring stick before Gemini — golden merchants, guardrail regression, baseline JSON.
- **Key outputs:** `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases), `scripts/eval.py`, `tests/test_t002.py`, `eval/eval_baseline.v1.json`.
- **Out of scope (unchanged):** source CSV, `out/` T-001 artifacts, live integrations, Gemini.
- **Commit status:** committed at `a95c0f1` and merged to `main` (`dc7d131`).

## Completed (historical)

- **T-002 plan** — [docs/t002-slice-plan.md](docs/t002-slice-plan.md) (now marked implemented).
- **T-001** — 23/23; [docs/v1-slice-plan.md](docs/v1-slice-plan.md).
- **Roadmap** — [docs/roadmap.md](docs/roadmap.md) on `main` at `df2b986`.

## Hygiene / decision follow-ups

*"Non-blocking" applied to **closing T-002** — it did not require these. Items 1–2 are **pre-Phase-3 blockers**: resolve them before any Gemini/Phase-3 work (see the pre-Phase-3 gate in [docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md)).*

1. `out/` generated-log tracking policy. — **pre-Phase-3 blocker.**
2. Enforcement hooks (CSV/secrets) — future approved task. — **pre-Phase-3 blocker.**
3. ~~Commit vs gitignore policy for `eval/eval_baseline.v1.json`~~ — decided 2026-06-04 (committed under `eval/`; see `docs/decision-log.md`).

## Status / continuity

- **Git (re-derived 2026-06-04):** branch `main`; `HEAD = dc7d131` ("Clean up T-002 merge status"); the audit/decision/state-doc batch is currently uncommitted pending owner review — re-run `git status` before continuing. This batch is docs-only (no code, tests, source CSV, `out/`, or `eval/` changes). T-002 committed at `a95c0f1`, fast-forwarded into `main`; `feature/t002-eval-harness` at `a95c0f1` (1 behind). *(Corrected by the build-process compliance audit — the prior line first read `feature/t002-eval-harness` / `HEAD = 1a0dbd0` / uncommitted after the merge, then wrongly read "tree clean" while this audit batch was still pending.)*
- **Validation (re-run 2026-06-04):** `python3 -m unittest tests.test_t001 tests.test_t002` → `Ran 35 … OK`; `python3 scripts/eval.py` → `MERCHANT 20/20 | GUARDRAIL 45/45 | PASS` (exit 0).
- **Next safe step:** clear the remaining **pre-Phase-3 gate** items ([docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md)) before any Phase-3 code — enforce git-state re-derivation at task-close; resolve the `out/` log + enforcement-hooks follow-ups; confirm baseline acceptance. *(Done 2026-06-04: `docs/decision-log.md` rows for the `pii_or_secret` guardrail change + the `eval/` baseline artifact policy.)* Phase 3 (Gemini) = **FULL** workflow, still blocked until the baseline is accepted.
