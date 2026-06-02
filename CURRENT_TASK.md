# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001.5 — Enterprise Delivery Playbook
- **Task name:** Enterprise Delivery Playbook (created); T-001 itself is built + audited (closeable)
- **Current stage:** **Playbook created** (`docs/enterprise-delivery-playbook.md`) in the approved reduced single-doc form + pointer edits to `RULES.md`/`CLAUDE.md`/`CODEX.md`/prevent-repeat-checklist. **No** product code/tests/CSV/`out`/integration changes. Pending owner review + commit.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal (met):** offline pipeline that normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs — with tests T1–T18. No integrations, no AI call, source CSV untouched.
- **Allowed files (this task):** `scripts/`, `tests/`, `tests/fixtures/`, `out/`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only); Supabase/n8n/Slack/Resend/Gemini/Apps Script (none exist; do not create). `docs/v1-data-dictionary.md` and other docs were out of allowed scope this task (see doc-sync note below).
- **Acceptance criteria:** **met** — `python3 -m unittest tests.test_t001 -v` → 23/23 (T1–T18 + P2-1..P2-5); `python3 scripts/run.py` produces `out/`; source CSV byte-identical before/after; app re-run dedups (12 send → 12 skipped_duplicate).
- **How to run:** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Current status / git (re-derived 2026-06-02):** `HEAD = 2ccafce "Fix T-001 guardrail and idempotency follow-ups"`. **Uncommitted (owner has not committed since):** the T-001 ground-rules audit, the T-001.5 blindspot review, **this T-001.5 playbook + its pointer edits**, the state-doc updates, and `out/audit_log.csv`/`out/model_runs.csv` (from the audit's `run.py`). Product code/tests/CSV/`out` snapshots unchanged.
- **Last known progress:** T-001 green (23/23) and audited (no blockers). T-001.5 playbook built in the approved reduced form: one `docs/enterprise-delivery-playbook.md` + pointer additions to `RULES.md §14` / `CLAUDE.md` / `CODEX.md` / prevent-repeat-checklist. The git-state re-derivation rule is now a checklist item (closes the audit's recurring finding). No separate source-scan/evidence/matrix files created.
- **Unfinished work:** (a) owner reviews + approves the playbook; (b) commit the pending audit + review + playbook; (c) close T-001's 3 follow-ups (`out/` log policy, `v1-slice-plan` doc-sync — both noted in the playbook's Artifact Policy / Enterprise Expansion).
- **Known risks:** process-bloat recurrence — the playbook is one doc by design; future tasks must keep it lightweight-by-default and not spawn standing logs (§ No New Standing Logs).
- **Next safe step:** owner reviews `docs/enterprise-delivery-playbook.md` + the pointer edits, approves, and commits. Then close T-001 follow-ups, then **ratify the next-stage ordering** (offline eval harness vs. roadmap Gemini) in `docs/decision-log.md` before T-002. Do not start T-002.
