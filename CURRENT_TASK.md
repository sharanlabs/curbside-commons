# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001
- **Task name:** Offline thin slice — implementation
- **Current stage:** **Implemented (committed at HEAD `653245b`); Codex P2 fixes + verb-first follow-up applied; 23/23 tests pass.** The uncommitted work is only the P2-fix/hygiene follow-up; pending decision is whether to commit *that*.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal (met):** offline pipeline that normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs — with tests T1–T18. No integrations, no AI call, source CSV untouched.
- **Allowed files (this task):** `scripts/`, `tests/`, `tests/fixtures/`, `out/`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only); Supabase/n8n/Slack/Resend/Gemini/Apps Script (none exist; do not create). `docs/v1-data-dictionary.md` and other docs were out of allowed scope this task (see doc-sync note below).
- **Acceptance criteria:** **met** — `python3 -m unittest tests.test_t001 -v` → 23/23 (T1–T18 + P2-1..P2-5); `python3 scripts/run.py` produces `out/`; source CSV byte-identical before/after; app re-run dedups (12 send → 12 skipped_duplicate).
- **How to run:** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Current status / git:** the T-001 implementation **is committed** at `HEAD = 653245b "Implement T-001 offline thin slice"`. The Codex P2 fixes, the verb-first follow-up, the `.gitignore` hygiene, and the doc updates are **uncommitted** on top. So the next decision is whether to commit the **P2-fix/hygiene** changes — not a first implementation commit.
- **Last known progress:** 12 simulated_sent (Low/Medium), 8 High held (`pending_review`), 0 draft_rejected; send gate (T17) + app-path idempotency (P2-1) + verb-first state_mismatch (P2-5) verified.
- **Unfinished work:** owner P2-fix/hygiene commit decision; data-dictionary doc-sync done; `docs/v1-slice-plan.md` still to enumerate the P2 tests + `--fresh` note (docs-allowed task).
- **Known risks:** thresholds remain a documented assumption (T5 consistency-only); the stub guardrail is only as strong as its fixtures (T10/T18 + prose & verb-first state-mismatch now covered; real adversarial cases still come with live Gemini).
- **Next safe step:** owner decides on the **P2-fix/hygiene commit** (optionally see the source-of-truth note above). Then a small docs task to sync the slice plan, then scope T-002.
