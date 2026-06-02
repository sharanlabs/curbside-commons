# RULES.md — ActivationOps AI Operating Rules

These are the non-negotiable rules for everyone working on this project: Claude Code (account 1), Claude Code (account 2), Claude Code CLI, Codex, and the human owner.

They live in the repo on purpose (Rule 1). **If anything else — a chat prompt, a skill, a model's memory, a habit — conflicts with this file, this file wins.**

Last reviewed: 2026-06-01.

## 1. Source of truth and continuity

1. The repo is the source of truth — not chat history, not model memory, not a previous session's recollection.
2. Every agent (Claude account 1, Claude account 2, Claude CLI, Codex) continues from repo files, never from memory. On start: read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, then run `git status`, then summarize and wait for human approval.

## 2. Roles

3. Claude Code is the main planner and builder.
4. Codex is the adversarial reviewer, changed-files reviewer, rescue debugger, and pre-ship auditor.
5. The human owner makes the final call on product, scope, architecture, and publishing. Agents propose; the human disposes.

## 3. How we build

6. Build in flow state, but never allow silent architecture drift. Any change that alters scope or architecture stops for a `docs/decision-log.md` entry and human sign-off.
7. Start simple. Add complexity only when a concrete, named need justifies it.
8. No live Supabase, Slack, n8n, Resend, or Gemini integration until the offline thin slice is complete and reviewed.

Order of operations — each precedes the next:

9. Deterministic logic before AI calls.
10. Structured outputs before prose.
11. Decision before action.
12. Human approval before risky automation.
13. Evaluation before claims.
14. Logs before confidence.
15. Cost control before scale.

## 4. AI honesty and product integrity

16. Do not publish or commit AI-churned work. Generated text or code is a draft until a human reads and accepts it.
17. No AI-generated output is final until reviewed and accepted.
18. Never claim "no AI was used."
19. Never claim "AI built this."
20. Use the framing: **human-led, AI-assisted, professionally reviewed.**

Project integrity: this is a simulation on dummy data. Never claim real DoorDash access, real merchant data, or real business impact. Label all metrics "simulated."

## 5. Claude skills rule

Claude Code must use relevant skills from the configured skills folder when they apply. Before starting a task, identify:

- the task type;
- the relevant skill(s);
- why the skill applies;
- whether any skill conflicts with these rules.

If a skill conflicts with project rules, RULES.md wins. Do not use skills blindly — use only the smallest relevant set. Record skill usage in `docs/task-log.md`.

## 6. Source verification rule

Any claim about tool capabilities, plugin behavior, Gemini model status, API limits, pricing or free tiers, Slack, n8n, Resend, Supabase, Google Sheets, Claude Code, or Codex must be verified against current official documentation (or the installed tool itself) — or clearly marked **UNVERIFIED**.

- Do not rely on memory for platform behavior.
- Do not document a platform claim without a source basis.
- Cite the source (URL or local path) next to the claim where practical.

## 7. Visual documentation standard

Use visuals to explain the system, not to decorate it. Mermaid (`.mmd`) by default.

1. Every diagram explains a real workflow, decision, or architecture.
2. A diagram must be understandable in under a minute.
3. If implementation changes a workflow, update the diagram in the same task.
4. Visuals must not imply features that are not built yet.
5. Future-state diagrams must be clearly labeled roadmap / target.
6. The public README should eventually carry only product diagrams, not internal process diagrams.
7. Do not let the dual-model diagram overshadow the product.

See `docs/visuals/README.md`.

## 8. Public vs internal documentation

Dual-model engineering is an internal build method, not the product. Do not let the build process overshadow the product.

- **Public docs** focus on the product: the onboarding problem, the AI workflow, data model, risk scoring, blocker diagnosis, guardrails, human review, automation flow, outcome tracking, limitations, roadmap.
- **Internal docs** may cover the Claude + Codex workflow, Codex commands, review gates, rescue, handoff, skills usage, cross-account continuity.
- In public docs, Claude Code and Codex appear only under a short "Development Workflow" note — never as the product runtime stack.

| Layer | Components |
| --- | --- |
| Product runtime stack | CSV / Google Sheets, Python or Apps Script, Gemini, Supabase, n8n, Slack, Resend, dashboard / docs |
| Development workflow (internal) | Claude Code (planning + build), Codex (adversarial review, changed-file review, rescue, pre-ship), Git, Mermaid |

## 9. Definition of done

A task is done only when:

- code or documentation changed as expected;
- checks or tests were run where applicable;
- `docs/task-log.md` updated;
- `docs/implementation-journal.md` updated if the work was meaningful;
- `docs/decision-log.md` updated if scope or architecture changed;
- `HANDOFF.md` updated;
- Codex review completed, or intentionally deferred with a written reason;
- the human owner can understand the next step.

## 10. Where things get recorded

- Small edits → `docs/task-log.md`.
- Meaningful work, failures, tradeoffs, corrections → `docs/implementation-journal.md`.
- Scope / architecture decisions → `docs/decision-log.md` (plus an ADR in `docs/decisions/` if major).
- Active task → `CURRENT_TASK.md`. Session hand-off → `HANDOFF.md`. Overall state → `PROJECT_STATE.md`.
- Before closing any task, run `docs/checklists/prevent-repeat-checklist.md`.

## 11. Secrets

No secrets anywhere in the repo or its outputs: no API keys, tokens, credentials, connection strings, personal data, or other secrets in code, CSVs, logs, screenshots, commit history, docs, or prompts.

- Use environment variables or a secret manager for any future credential — never a committed file.
- Keep contact data in the simulation fake (e.g., `@example.com`).
- If a secret is ever committed by accident, treat it as compromised: rotate it and scrub it — do not just delete the line.

## 12. Commit hygiene

- Check `git status` before starting and after finishing work.
- Commit after each clean slice — one whose checks/tests pass and whose state is coherent.
- Do not commit broken, half-finished, or unclear work.
- Commit messages explain the task outcome (what changed and why), not "wip".
- The human owner approves commits and pushes; do not commit or push unless asked.

## 13. Lightweight vs full workflow

Match the process weight to the risk.

- **Lightweight loop** — for deterministic, offline slices (data normalization, scoring, local logic): build, run checks, one Codex changed-files review, update `docs/task-log.md` and `HANDOFF.md`. Journal and decision-log only if something meaningful or architectural happened.
- **Full loop** — for integrations, live sends, auth/security, data writes, and publishing: plan adversarial review, build, changed-files review, rescue if needed, journal + decision-log, prevent-repeat checklist, and (for high-risk sessions only) the Codex review gate.

When unsure which applies, use the full loop. See `docs/dual-model-workflow.md`.

## 14. Enterprise Delivery Playbook (pointer)

`docs/enterprise-delivery-playbook.md` is the living "how" for professional execution. `RULES.md` stays the constitution; the playbook elaborates it. Key rules it carries:

- **Core traceability:** every meaningful task runs idea → use-case classification → source scan → framework/tool selection → alternatives → assumptions → approach → validation evidence → failure handling → reuse → expansion → handoff → human approval — *proportional to risk*.
- **Lightweight vs full** (per §13) governs how much of that chain applies.
- **Source-backed standard:** important claims use source tiers (Tier 1 official first) with a stated sufficiency/stop point; no memory for platform behavior (extends §6).
- **Source/pattern/reference intake:** evaluate before adopting *anything* external (source, repo, template, workflow, tool, code/prompt/UI/design pattern, architecture, framework, methodology) — no default adoption, no cargo-culting; classify borrow/reject/adapt/defer; approval gate when it affects scope, architecture, tools, data model, AI behavior, integrations, public claims, or publishing. Proportional to risk.
- **Model/API/tool freshness:** model/API/platform choices that affect implementation, cost, security, public claims, or compatibility carry a dated freshness check.
- **Artifact policy:** every generated artifact is classified (commit / regenerate / ignore / examples / internal).
- **Stage closure criteria:** a stage closes only on the playbook's checklist + human approval.
- **No new standing logs unless justified:** prefer updating existing docs.
- **Living standard:** change the playbook only on real evidence, and record what/why/trigger/universal-or-project-specific/burden.
- **Roles:** Claude applies the playbook · Codex verifies it was applied · ChatGPT web gives stage-level review · the human owner approves. No assistant turns a suggestion into a decision.
- **Git state is always re-derived** from `git status` + `git log --oneline -8`, never assumed.

## 15. Mandatory Startup Contract

Every Claude Code session must begin by:

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

The **Professional Process Applied** block must include: task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · source requirement · validation method · artifact policy (if relevant) · documentation required · Codex review needed or not · human approval needed or not.

**Stop condition:** if Claude cannot identify the task type, risk level, validation method, or whether lightweight/full mode applies, **stop and ask the human owner before acting.**

**Proportionality (anti-bloat):** keep this light for trivial edits. For small, low-risk changes the Professional Process Applied block can be a single line. Do not run full ceremony on a one-line doc fix.

**Codex enforcement:** every Codex review verifies whether this contract and the playbook were followed (`CODEX.md`). If Claude skipped the playbook/contract for a *meaningful* task, Codex flags it as a process finding.
