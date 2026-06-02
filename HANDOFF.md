# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** OS-CLEANUP (operating-system cleanup). Next executable task: T-001.
- **What was done:** Reconciled `AGENTS.md` with `RULES.md` (dropped "reviewer-first only"; now points to RULES.md). Made `README.md` product-focused (Claude Code / Codex moved to a short Development Workflow section and removed from the runtime stack; V1 framed as "AI-assisted workflow automation", "agentic" reserved for the roadmap). Added Secrets (§11), Commit-hygiene (§12), and Lightweight-vs-full (§13) rules to `RULES.md`. Corrected git status across docs, set the as-of date to June 1, 2026, and reframed the next task to T-001 planning + data dictionary.
- **Files changed:** see the OS-CLEANUP entry in `docs/task-log.md`. Updated: `AGENTS.md`, `README.md`, `RULES.md`, `CURRENT_TASK.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `docs/open-questions.md`, `docs/task-log.md`.
- **Checks run:** Verified Git is initialized (`git rev-parse` → true; commit `b57cf2c`). No code tests — there is no product code yet.
- **Git status at handoff:** Repository **initialized** (commit `b57cf2c "Initial reviewed planning state"`). The operating-system files from the prior session plus this cleanup are **uncommitted** on disk. Committing is the human owner's call (`RULES.md` §12).
- **Important context:** Planning is closed pending a human GO / NO-GO on `docs/plan-reconciliation.md`. Framing is human-led, AI-assisted, professionally reviewed. Dual-model engineering is internal only and must not overshadow the product.
- **What not to do:** Do not build product code, modify the source CSV, create Supabase / n8n / Slack / Resend / Gemini integrations, or call Gemini. Do not write another review/governance document. Do not start T-001 implementation — T-001 is planning + data dictionary only.
- **Next step:** Human decides GO / NO-GO. On GO, start T-001 (see `CURRENT_TASK.md`): write `docs/v1-data-dictionary.md` and the slice plan, run a Codex adversarial review, get human approval.
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
