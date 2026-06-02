# Agent Instructions

`RULES.md` is the source of truth for this project. If anything here conflicts with `RULES.md`, **`RULES.md` wins.** This file is a short entry point for any agent (Claude Code account 1/2, Claude CLI, Codex) or human working in the repo.

## Start here

1. Read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`.
2. Run `git status`.
3. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step — then wait for human approval before continuing.

## How the project runs

The project is **human-led and AI-assisted**. Work proceeds as small, reviewed slices in flow state — not as a one-time review pass. Claude Code plans and builds; Codex reviews adversarially, reviews changed files, rescues stalled work, and audits before shipping; the human owner makes the final calls. See `docs/dual-model-workflow.md`.

Match the workflow weight to the risk (`RULES.md` §13): a lightweight loop for deterministic/offline slices, the full Claude + Codex loop for integrations, live sends, auth/security, data writes, and publishing.

## Ground rules (summary — full set in `RULES.md`)

- Treat all merchant data as dummy/simulated. No real DoorDash access, data, or business impact.
- No secrets anywhere (`RULES.md` §11): no API keys, tokens, credentials, or personal data in code, CSVs, logs, screenshots, commits, docs, or prompts.
- No live Supabase, n8n, Slack, Resend, or Gemini integration until the offline thin slice is complete and reviewed.
- Prefer simple, auditable workflow design over broad automation.
- Deterministic logic before AI; structured outputs before prose; human approval before risky automation.
- Human-led, AI-assisted, professionally reviewed. Never claim "no AI was used" or "AI built this."
- Verify platform claims against current docs or the installed tool, or mark them UNVERIFIED (`RULES.md` §6).

## Where things get recorded

See `RULES.md` §10. In short: small edits → `docs/task-log.md`; meaningful work → `docs/implementation-journal.md`; scope/architecture → `docs/decision-log.md`; active task → `CURRENT_TASK.md`; handoff → `HANDOFF.md`; state → `PROJECT_STATE.md`. Run `docs/checklists/prevent-repeat-checklist.md` before closing a task that hit a problem.

## Validation before claiming done

Re-check the file tree, confirm the definition of done (`RULES.md` §9), and confirm no live integrations or secrets were introduced.
