# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001.5 — Enterprise Delivery Playbook (+ Mandatory Startup Contract enforcement)
- **Task name:** Enterprise Delivery Playbook + startup-contract enforcement; T-001 itself is built + audited (closeable)
- **Current stage:** **Mandatory Startup Contract added** (`RULES.md` §15; `CLAUDE.md` startup section; `CODEX.md` enforcement + process-finding rule; Professional Process Applied block in the task template; process/playbook checks in both Codex review templates; checklist item). The playbook (committed at `cd4c188`) is now enforced at session start. **No** product code/tests/CSV/`out`/integration changes. Pending owner commit of this enforcement update.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal (met):** offline pipeline that normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs — with tests T1–T18. No integrations, no AI call, source CSV untouched.
- **Allowed files (this task):** `scripts/`, `tests/`, `tests/fixtures/`, `out/`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only); Supabase/n8n/Slack/Resend/Gemini/Apps Script (none exist; do not create). `docs/v1-data-dictionary.md` and other docs were out of allowed scope this task (see doc-sync note below).
- **Acceptance criteria:** **met** — `python3 -m unittest tests.test_t001 -v` → 23/23 (T1–T18 + P2-1..P2-5); `python3 scripts/run.py` produces `out/`; source CSV byte-identical before/after; app re-run dedups (12 send → 12 skipped_duplicate).
- **How to run:** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Current status / git (re-derived 2026-06-02):** `HEAD = cd4c188 "Add enterprise delivery playbook and T-001 audit"` — the playbook, T-001 audit, and blindspot review are committed; the `out/` delta is resolved (tree was clean before this update). **Uncommitted:** only this enforcement update (the Mandatory Startup Contract edits + state-doc updates). Product code/tests/CSV/`out` unchanged.
- **Last known progress:** T-001 green (23/23) and audited (no blockers). T-001.5 playbook committed. Mandatory Startup Contract now enforces session start + the Professional Process Applied block, with the anti-bloat one-line allowance for trivial edits and Codex process-finding enforcement.
- **Unfinished work:** (a) owner commits this enforcement update; (b) close T-001's remaining doc follow-up (`docs/v1-slice-plan.md` test-list sync); (c) ratify the T-002 ordering in `docs/decision-log.md`.
- **Known risks:** process-bloat recurrence — the contract is proportional by design (one-line block for trivial edits); Codex must not over-flag low-risk work.
- **Next safe step:** owner commits this enforcement update. Then the `v1-slice-plan` doc-sync, then ratify the next-stage ordering (offline eval harness vs. Gemini) in `docs/decision-log.md`. Do not start T-002.
