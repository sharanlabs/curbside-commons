# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** **`docs/roadmap.md` created → Codex-reviewed (needs-attention) → corrected (this session)**. The applicability review + its Codex revision (incl. the eval-first `decision-log` ratification) are **committed at `78dc694`**.
- **What was done (this session, lightweight):** wrote `docs/roadmap.md`, ran a read-only Codex review of it (verdict **needs-attention**), and applied both findings — recast **Project Operating Model and Governance** from a numbered phase to a completed **Foundation**, renumbering the product phases to **1–7** (1 Offline Vertical Slice **done**, 2 **Offline Evaluation and Regression Harness = T-002, next**, 3 Bounded LLM Drafting, 4 Persistence & Provenance, 5 HITL Delivery, 6 Orchestration & Monitoring, 7 Public Demo & Portfolio); and cleared the stale eval-first-T-002 ratification follow-ups in `CURRENT_TASK.md` + `PROJECT_STATE.md`. The roadmap keeps the plain Product Lifecycle loop, "Why T-002 Comes Before Gemini," per-phase details, a tiny Terminology note (**no** framework-mapping section), and a "What Not To Do Yet" list. **No `decision-log` change; no product code/tests/CSV/`out`/integration touched; nothing installed; no commit.**
- **Reflects reality:** T-001 built + green (23/23); original CSV protected; fully offline (no Gemini/API/live sends); Obsidian vault separate / not runtime; T-002 ratified + next but **not started**.
- **T-002 (ratified, not started):** **"Offline Evaluation and Regression Harness"** — golden labels + guardrail regression set + baseline, fully offline; comes **before** any live Gemini (build the measuring stick first).
- **Git state (re-derived 2026-06-02):** `HEAD = 78dc694 "Revise roadmap applicability review after Codex"` (applicability review + revision committed; tree was clean before this task). **Uncommitted now:** `docs/roadmap.md` (new) + four state-doc syncs (`CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`). No `out/` logs dirty; product code/tests/CSV/`out`/integrations unchanged.
- **What not to do:** do not start T-002 (the roadmap names it; it does not start it); do not jump to Gemini before the T-002 eval baseline + secrets + offline mock; do not add integrations/plugins/hooks; do not link the vault globally; do not commit unless the owner says so.
- **Next step:** owner reviews + approves `docs/roadmap.md` (and commits this batch); then **scope T-002 — Offline Evaluation and Regression Harness** as a separate task. Tests still green: `python3 -m unittest tests.test_t001 -v`.
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
