# Agent Instructions

`RULES.md` is the source of truth for this project. If anything here conflicts with `RULES.md`, **`RULES.md` wins.** This file is a short entry point for any agent (Claude Code account 1/2, Claude CLI, Codex) or human working in the repo.

## Start here

1. Read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`. Read them in full — they are **held under 250 KB by a test** (`evals/packs/startup-contract-budget.test.ts`), down from ~1.31 MB before 2026-07-31.
2. Run `git status`.
3. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step — then wait for human approval before continuing.

**Cost note — the archive is not part of step 1.** Closed-session history lives in `docs/archive/2026-07-31-state-docs/` (1.19 MB, byte-exact). It is provenance, not state: the default is that you do not need it, and opening it is a deliberate choice for a specific question you cannot answer from the five docs above. This is a default, not a restriction — `RULES.md` §15 governs the contract and nothing here narrows it.

Why the default is worth honoring: this read list stood at ~1.31 MB until 2026-07-31 and **three cross-model review runs died on it** (sessions 34, 36, 38), the last burning 20+ minutes at `xhigh` and returning only the echoed prompt. The instruction was never wrong; the volume was. If you are reviewing a scoped change, the five docs plus the files in your diff are normally the whole brief.

**If the budget test fails, archive — do not raise the limit.** Move closed sessions into `docs/archive/` the way the 2026-07-31 pass did. Raising the number is the decision that produced 1.31 MB in the first place.

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
