# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001
- **Task name:** Offline thin slice — implementation
- **Current stage:** **Implemented; T1–T18 pass.** Pending Codex changed-files review and the owner's commit decision.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal (met):** offline pipeline that normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs — with tests T1–T18. No integrations, no AI call, source CSV untouched.
- **Allowed files (this task):** `scripts/`, `tests/`, `tests/fixtures/`, `out/`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only); Supabase/n8n/Slack/Resend/Gemini/Apps Script (none exist; do not create). `docs/v1-data-dictionary.md` and other docs were out of allowed scope this task (see doc-sync note below).
- **Acceptance criteria:** **met** — `python3 -m unittest tests.test_t001 -v` → 18/18; canonical `python3 scripts/run.py` produces `out/`; source CSV byte-identical before/after.
- **How to run:** app `python3 scripts/run.py`; tests `python3 -m unittest tests.test_t001 -v`.
- **Current status:** Implementation complete and green; nothing committed (owner's call, `RULES.md` §12).
- **Last known progress:** 12 simulated_sent (Low/Medium), 8 High held (`pending_review`), 0 draft_rejected; send gate verified by T17.
- **Unfinished work:** Codex changed-files review; owner commit decision; doc-sync of `docs/v1-data-dictionary.md` (§1/§3 risk_level normalization, §9 two regex fixes) in a docs-allowed task.
- **Known risks:** thresholds remain a documented assumption (T5 consistency-only); the stub guardrail is only as strong as its fixtures (T18 covers all 6 categories now); data-dictionary lags code on two minor regex typos (flagged).
- **Next safe step:** run `/codex:review --background` (changed-files), address findings, then owner decides on commit. After that, a follow-up docs task to sync the data dictionary, then scope T-002.
