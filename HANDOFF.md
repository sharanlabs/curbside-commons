# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001.6 — Source Intake & Applicability Review (CORRECTION pass). Status: **corrected with direct sources; nothing adopted; pending owner commit.**
- **What was done (this session = research/source-intake correction, full mode under the Startup Contract):** corrected `docs/research/source-intake-review.md` from summary-only to **direct inspection**. **Read 3 PDFs directly** (Dynamic Workflows, Obsidian, Codex Loop). **Web-inspected all 5 GitHub repos** (claudex MIT ~75★ teaching artifact; kepano/obsidian-skills MIT ~34k★ by Obsidian CEO; second-brain license-unspecified + risky installers; agentic-design-patterns-docs ~19★; n8n-powerhouse ~4★). **Live Tier 1 docs** (best-practices/features-overview/hooks/sub-agents, 2026-06-02) confirm the Architect principles + the enforcement-hooks recommendation (official example: a hook that blocks writes to a folder). Added explicit **source-status separation** + updated **Missing Addendum Checks**. **Nothing installed/cloned/adopted; no** code/tests/CSV/`out`/integration or governance edit.
- **Honest gaps (kept, not hidden):** `claude_architect_study_guide.pdf` (55 MB) **NOT loaded** — unsafe native load + `poppler` not installed (not installing per task); principles verified via official docs instead. Apps Script **not in the folder**. Changelog 404'd; Anthropic/OpenAI model docs not fetched (no model decision); **`GPT-5.5` UNVERIFIED**.
- **Highest-value finding (recommendation, not adopted, now strongly source-backed):** enforce CSV-immutability + no-secrets via a `PreToolUse`/`Stop` **hook** (official best-practices backs this), not prompt-only rules. Human-approval-gated → `decision-log` entry when approved.
- **Git state (re-derived 2026-06-02):** `HEAD = ec241e9 "Add universal source and pattern intake rule"` (playbook + intake rule + first review committed). **Uncommitted:** only this corrected review + state-doc updates. Product code/tests/CSV/`out` unchanged.
- **What not to do:** Do not start T-002; do not install/clone/adopt anything (incl. claudex/second-brain); do not modify CSV / code / tests / `out/` / integrations; do not commit unless the owner says so.
- **Next step:** owner reviews the corrected source-intake doc; commits it; decides on the enforcement-hooks recommendation; closes T-001's `docs/v1-slice-plan.md` sync; ratifies the T-002 ordering in `docs/decision-log.md`. Optional: architect-guide text export; model-freshness sweep at decision time. Tests: `python3 -m unittest tests.test_t001 -v`.
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
