# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001.6 — Source Intake & Applicability Review (standards)
- **Task name:** Source-intake addendum review (+ prior intake rule); T-001 itself is built + audited (closeable)
- **Current stage:** **Source-intake review created** (`docs/research/source-intake-review.md`) — evaluated the pasted document summaries (uploaded files not in session), verified Architect principles against **live official Claude Code docs** (2026-06-02), ran the model-freshness check (no model change), and the Missing Addendum self-audit. Nothing installed/adopted; no governance edit required. **High-value recommendation (not adopted):** `PreToolUse` hooks to enforce CSV-immutability/no-secrets (official docs back this) — human-approval-gated. Ran under the Mandatory Startup Contract.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal (met):** offline pipeline that normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs — with tests T1–T18. No integrations, no AI call, source CSV untouched.
- **Allowed files (this task):** `scripts/`, `tests/`, `tests/fixtures/`, `out/`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only); Supabase/n8n/Slack/Resend/Gemini/Apps Script (none exist; do not create). `docs/v1-data-dictionary.md` and other docs were out of allowed scope this task (see doc-sync note below).
- **Acceptance criteria:** **met** — `python3 -m unittest tests.test_t001 -v` → 23/23 (T1–T18 + P2-1..P2-5); `python3 scripts/run.py` produces `out/`; source CSV byte-identical before/after; app re-run dedups (12 send → 12 skipped_duplicate).
- **How to run:** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Current status / git (re-derived 2026-06-02):** `HEAD = f28ae90 "Enforce enterprise playbook startup contract"`. **Uncommitted (owner has not committed since):** last turn's Source/Pattern/Reference Intake-rule edits (playbook + `RULES`/`CLAUDE`/`CODEX`/checklist/decision-log) **and** this turn's `docs/research/source-intake-review.md` + state-doc updates. Product code/tests/CSV/`out` unchanged.
- **Last known progress:** T-001 green (23/23) and audited. Governance carries the playbook + Mandatory Startup Contract + Intake rule (all integrated). T-001.6 source-intake review done: nothing adopted; Architect principles verified against live official docs; honest gaps flagged.
- **Unfinished work:** (a) owner commits the intake rule + this review; (b) close T-001's `docs/v1-slice-plan.md` test-list sync; (c) decide on the `PreToolUse` hooks recommendation; (d) ratify T-002 ordering in `docs/decision-log.md`.
- **Known risks:** hardest invariants (CSV-immutability, no-secrets) are prompt-only "requests" — official docs say make must-hold rules hooks; consider enforcing deterministically. Governance surface large — keep new standards integrated + proportional.
- **Next safe step:** owner commits the pending standards + review. Then the `v1-slice-plan` doc-sync, the hooks decision, and the T-002 ordering ratification in `docs/decision-log.md`. Do not start T-002.
