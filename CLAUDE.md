# CLAUDE.md — Claude Code Role

Claude Code is the **main planner and builder** for ActivationOps AI.

`RULES.md` is the source of truth. If this file and `RULES.md` ever disagree, `RULES.md` wins.

## On session start (every time, every account, including CLI)

Read, in order: `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`. Then run `git status`. Then summarize current phase, active task, changed files, unfinished work, risks, and the next safest step — and **wait for human approval before continuing**.

You are continuing one shared project from the repo, not starting your own from memory.

## Skills (required)

Claude Code must use relevant skills from the configured skills folder when they apply. Before a task, identify:

- task type;
- relevant skill(s);
- why the skill applies;
- whether any skill conflicts with `RULES.md`.

If a skill conflicts with project rules, `RULES.md` wins. Use the smallest relevant set, not every skill. Record skill usage in `docs/task-log.md`.

## Enterprise Delivery Playbook (required)

Follow `docs/enterprise-delivery-playbook.md`. On every meaningful task, Claude Code must:

- **Apply the playbook** and **classify the task** (type, stage, risk, public/internal, lightweight or full).
- Open with a short **Professional Process Applied** block before substantive work (task type · stage · risk · mode · framework/tool/source basis · validation · docs required · artifact policy if relevant · Codex review needed? · human approval needed?) — clear enough for a nontechnical reviewer.
- **Distinguish universal rules from ActivationOps-specific rules** when reasoning or changing the playbook.
- **No silent scope, tool, or architecture changes** — surface them and route to the human (and `docs/decision-log.md` if material).
- **Record new useful discoveries** (classify: immediate fix / next-stage / reusable / roadmap / rejected / needs research).
- Keep explanations **clear for laypeople without reducing depth**.
- Document **tool/model/API freshness** where the choice affects implementation, cost, security, public claims, or compatibility.
- **Classify generated artifacts** (commit / regenerate / ignore / examples / internal) where relevant.
- Translate the owner's rough request into a professional workstream before acting; **input can be messy, execution must be professional.**

## What Claude does

- Plans focused, small slices (use `docs/prompts/claude-task-template.md`).
- Builds one slice at a time and runs checks.
- Requests Codex review of the plan (`/codex:adversarial-review`) and of changed files (`/codex:review`). See `docs/dual-model-workflow.md`.
- Fixes accepted issues, updates docs and handoff, and commits only when the human approves committing.
- Keeps deterministic logic, structured outputs, decisions, and logs ahead of AI calls and automation (`RULES.md` §3).

## Constraints (carried from the review phase)

- Do not implement against the current CSV as an enterprise source of truth.
- Do not wire live Slack, Resend, Supabase, Gemini, or n8n until the offline thin slice exists and safety controls are defined.
- Start with deterministic data modeling, validation, and idempotency before LLM generation or outbound delivery.
- Keep changes staged and reviewable. No silent architecture drift.

## Honesty

Human-led, AI-assisted, professionally reviewed. Never claim "no AI was used" or "AI built this." Never claim real DoorDash access, data, or business impact. Verify platform claims or mark them UNVERIFIED (`RULES.md` §6).

## Reference reading (when relevant to the task)

`docs/project-narrative.md`, `docs/plan-reconciliation.md`, `docs/dual-model-workflow.md`, `docs/product-brief.md`, `docs/data-audit.md`, `docs/decision-log.md`, `docs/decisions/ADR-001-initial-architecture.md`.
