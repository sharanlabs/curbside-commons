# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001.6 — Source Intake & Applicability Review (addendum). Status: **review created; nothing adopted; pending owner commit.**
- **What was done (this session = research/source-intake, full mode under the Startup Contract):** created `docs/research/source-intake-review.md`. Evaluated the **pasted summaries** of the uploaded docs (the files themselves were **not** in the session — stated honestly). **Live Tier 1 check** of official Claude Code docs (`code.claude.com/docs`, 2026-06-02) **confirmed** the Architect principles: hooks = deterministic enforcement (`PreToolUse` deny / `exit 2`); CLAUDE.md = guidance ("a request, not a guarantee"); skills = on-demand (keep CLAUDE.md < 200 lines); subagents = isolated review with restrictable tools; layered scoping + path-specific `.claude/rules/`. Classified every idea borrow/reject/adapt/defer; included the required **Missing Addendum Checks** self-audit. **No** code/tests/CSV/`out`/integration edits; **nothing installed/cloned/adopted**; **no** playbook/RULES/CLAUDE/CODEX edit (intake rule already integrated).
- **Highest-value finding (recommendation, not adopted):** the project's hardest invariants (CSV-immutability, no-secrets) are prompt-only "requests"; official docs say make must-hold rules **hooks** → consider a `PreToolUse` hook (human-approval-gated). Honest gaps: uploaded originals not provided; changelog + Anthropic/OpenAI model docs not fetched (no model decision made).
- **Git state (re-derived 2026-06-02):** `HEAD = f28ae90`. **Uncommitted (owner hasn't committed since):** last turn's intake-rule edits (playbook + `RULES`/`CLAUDE`/`CODEX`/checklist/decision-log) **and** this turn's `docs/research/source-intake-review.md` + state-doc updates. Product code/tests/CSV/`out` unchanged.
- **What not to do:** Do not start T-002; do not install/clone/adopt anything; do not modify CSV / code / tests / `out/` / integrations; do not commit unless the owner says so.
- **Next step:** owner reviews the source-intake doc; commits the pending intake rule + this review; closes T-001's `docs/v1-slice-plan.md` sync; decides on the hooks recommendation; ratifies the T-002 ordering in `docs/decision-log.md`. Tests: `python3 -m unittest tests.test_t001 -v`.
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
