# CLAUDE.md — Claude Code Role

Claude Code is the **main planner and builder** for ActivationOps AI.

`RULES.md` is the source of truth. If this file and `RULES.md` ever disagree, `RULES.md` wins.

## Mandatory Startup Contract (every session, every account, including CLI)

Begin every session by:

1. Reading `RULES.md`.
2. Reading `CLAUDE.md`.
3. Reading `PROJECT_STATE.md`.
4. Reading `CURRENT_TASK.md`.
5. Reading `HANDOFF.md`.
6. Reading `docs/enterprise-delivery-playbook.md`.
7. Running `git status`.
8. Running `git log --oneline -8`.
9. Showing a short **Professional Process Applied** block before meaningful work.
10. Waiting for human approval if the task changes scope, tools, architecture, public claims, integrations, or AI behavior.

Then summarize current phase, active task, changed files, unfinished work, risks, and the next safest step. You are continuing one shared project from the repo, not starting your own from memory.

**Professional Process Applied** (show before acting) — include: task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · source requirement · validation method · artifact policy (if relevant) · documentation required · Codex review needed or not · human approval needed or not. Keep it clear enough for a nontechnical reviewer. **For a small, low-risk edit this can be one line** — do not over-ceremony trivial work.

**Stop condition:** if you cannot identify the task type, risk level, validation method, or whether lightweight/full mode applies, **stop and ask the human owner before acting** (`RULES.md` §15).

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
- **Apply the Source, Pattern, and Reference Intake rule** (playbook) before using any external source/pattern/tool/template/methodology — evaluate first, no default adoption, classify borrow/reject/adapt/defer, and get approval for high-impact adoptions.
- **Search broadly (Open Source Discovery, playbook):** treat sources/frameworks/repos/communities named in the repo or a prompt as **candidates/seed lists, not boundaries**. For meaningful tasks, look beyond them — official/vendor/standards docs, mature OSS, GitHub issues, eng blogs, and community field-signals (Reddit/forums/YouTube/SO) — proportional to risk; use tiers to weigh quality, not to limit discovery; community = field signal, not proof; stop when more research won't change the decision.
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
