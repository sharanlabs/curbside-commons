# Enterprise Delivery Playbook

Status: living standard (T-001.5). `RULES.md` is still the constitution; this playbook is the *how*. If they ever conflict, `RULES.md` wins.

How to read this: most of the document is the **Universal Professional Delivery Standard** (reusable on any project). Lines marked **→ ActivationOps AI:** are this project's specific interpretation. The product is **ActivationOps AI**; Claude Code and Codex are *development workflow tools*, never the runtime stack.

## Purpose

Turn rough, casual, exploratory, or incomplete requests into **professional, traceable execution**. The owner is allowed to be messy; the work is not. Output should feel **human-led, AI-assisted, professionally reviewed** — clear, practical, modern, and understandable to a layperson, deep enough for a technical reviewer, and never AI-churned.

**Input can be messy. Execution must be professional.**
- Claude Code translates the rough request into a professional workstream before acting.
- Codex verifies whether that workstream was actually followed.
- ChatGPT web may give stage-level executive review, scope calls, and tie-breaks.
- The human owner makes final product, architecture, tool, publishing, and scope decisions.
No assistant silently turns a suggestion into a decision.

## Universal Professional Delivery Standard

Every meaningful task must be traceable from rough idea to professional execution:

**use-case classification → source scan → framework/tool selection → alternatives → assumptions → implementation approach → validation evidence → failure handling → reuse potential → enterprise expansion path → handoff → human approval.**

Apply it *proportional to risk* (see Lightweight vs Full). The chain is the spine; the sections below are how each link is satisfied without bloat.

## ActivationOps AI Application

ActivationOps AI is currently an **offline, AI-assisted operational workflow-automation thin slice** for a DoorDash-style merchant-onboarding simulation on **dummy data**. T-001 normalizes 20 dummy merchants, scores risk deterministically, diagnoses blockers, queues high-risk merchants for human review, generates one stubbed guardrailed outreach draft, gates simulated sends behind approval, and writes audit logs — with tests T1–T18 + P2 coverage.

It **may** later become a human-in-the-loop *agentic* workflow automation system, but **V1 must not overclaim agentic behavior** — V1 is deterministic logic + a bounded, stubbed AI draft step. "Agentic" is a roadmap label only.

This playbook applies to this project as written, with the project-specific callouts below.

## Task Classification

Before acting on a meaningful task, state:
- **task type**, **stage**, **risk level**, **public-facing or internal**, **lightweight or full workflow**, **source requirement**, **validation requirement**, **documentation requirement**, **Codex review requirement**, **human approval requirement**.

Task types: use-case discovery · research · planning · architecture · data modeling · implementation · testing · debugging · AI workflow design · guardrails · security/privacy · reliability/idempotency · integrations · documentation · visual/demo · publishing · post-stage review.

## Lightweight versus Full Workflow

**Lightweight** (low-risk, deterministic, offline, docs): classify task → define the acceptance check → run relevant checks/tests → update task log → update handoff. That's it.

**Full** (high-risk): source-backed basis → alternatives considered → assumptions → risks/blind spots → validation evidence → Codex review → human approval → lessons documented.

**High-risk includes:** AI behavior · guardrails · security/privacy · integrations · live sends · data writes · architecture changes · tool selection · reliability guarantees · public-facing claims · publishing · pricing/free-tier/API-behavior claims.

When unsure which mode, use Full. Do not run Full on a 30-line deterministic change — that is the bloat this project already warned about.

**→ ActivationOps AI:** T-001 sub-tasks were lightweight; guardrails, the send-gate, and any future integration are full.

## Source-Backed Research Standard

Do not rely on memory for important claims. Use broad, diverse sources when the task needs it. Source quality tiers:
- **Tier 1** — official docs, standards bodies, framework/vendor owners.
- **Tier 2** — reputable engineering blogs from known companies.
- **Tier 3** — open-source repos with real usage, docs, issues, examples, adoption.
- **Tier 4** — practitioner writeups, forums, Reddit, YouTube, newsletters.
- **Tier 5** — generic blogs / SEO content.

Use Tier 1 first for correctness; use lower tiers for practical examples, edge cases, and field signals. Every source-backed task states: sources **checked**, **used**, **rejected**; why the used sources were credible; why coverage is **sufficient**; remaining uncertainty.

**→ ActivationOps AI:** the Codex command surface was verified against the installed plugin (Tier 1, local), and vendor behaviors (Slack/Resend/Supabase/n8n/Gemini/Sheets) were cited to official docs in the initial review — generalize that, lightly.

### Open Source Discovery (named sources are candidates, not constraints)

Sources, frameworks, repos, tools, examples, communities, and patterns named anywhere in this repo (or in a task prompt) are **starting points / prior references — not boundaries.** For any meaningful task, do **not** limit research to previously named sources, uploaded documents, familiar repos, known frameworks, official docs alone, or prior examples. **Search broadly and task-specifically**, then choose what fits ActivationOps AI by source **quality, relevance, freshness, maturity, validation value, and risk**.

Search breadth (as the task warrants): official docs · standards bodies · vendor docs · mature open-source repos · GitHub issues / discussions / PRs / examples / changelogs · reputable company engineering blogs · product / UX / UI / design / portfolio references · LLMOps / MLOps / agent / eval / guardrail references · security / privacy / compliance references · automation/workflow examples (incl. n8n / Zapier / Pipedream / Slack / Resend / Supabase / Postgres / Gemini *when relevant*) · practitioner blogs & newsletters · Reddit & relevant subreddits · forums · YouTube videos/transcripts · Discord/community where accessible & appropriate · Stack Overflow / Q&A · recent changelogs / release notes / migration guides / issue threads.

**Use the source tiers (above) to judge quality, not to restrict discovery.** If a source list appears in a task prompt, treat it as a **seed list, not a complete list**, unless the owner explicitly says it is complete.

**"Maximum useful research" ≠ endless.** It means: search broadly enough to avoid blind spots; include current official sources where claims matter; include mature OSS / real-world examples where useful; check Reddit/forums/YouTube/community for **field signals** (pain points, failure modes, user language, adoption gotchas); compare against similar or better alternatives; verify community claims against stronger sources; then **stop when more research is unlikely to change the decision, and document remaining uncertainty.** Proportional to risk — a one-line scan for trivial edits; broad discovery for high-risk / AI / integration / security / public-facing / tool-selection work.

**Source-use distinction (how much weight each carries):**
- Official / current docs = **source of truth** for factual platform / API / model / tool / security / pricing / deprecation / legal / privacy / compatibility claims.
- Mature open-source repos = implementation & architecture evidence.
- Company engineering blogs = professional-practice evidence.
- GitHub issues / discussions = real-world failure / adoption signals.
- Reddit / forums / YouTube / community posts = **field signals, not proof by themselves** — not authoritative unless backed by official docs, source code, maintainers, or multiple independent credible signals.
- Generic / SEO blogs = low-confidence background only.

When sources disagree, **state the disagreement, weigh by credibility and recency, and do not overstate the conclusion.**

## Source Sufficiency Rule

Research must be enough, not endless. Before acting, state: what was checked, used, rejected; why it is enough now; what uncertainty remains; whether that uncertainty blocks action.
- If uncertainty does **not** block a low-risk task → document it and proceed.
- If uncertainty touches **security, architecture, public claims, integrations, AI behavior, or tool choice** → stop and ask the human owner.

## Source, Pattern, and Reference Intake

Applies to **every task**, not just research tasks. **Do not adopt anything by default** — no source, repo, template, workflow, tool, code/prompt/UI/design pattern, doc style, automation example, architecture, framework, or methodology — until it passes intake. Covers planning · code · data modeling · testing · AI prompts/agent patterns · guardrails · evals · security/privacy · n8n/Zapier/Pipedream · Slack/Resend/Supabase · Gemini/other models · Claude skills · Codex workflows · MCP · knowledge-management (e.g., Obsidian) · dashboards · UI/UX · visual design · README · portfolio case study · demo · docs · publishing.

Before adopting, evaluate (**proportional to risk** — one line for low-risk; full for high-risk):
1. problem it solves · 2. relevance to the task · 3. currency · 4. official / reputable / mature / experimental · 5. stronger or official confirming sources · 6. similar alternatives · 7. what to borrow · 8. what to reject · 9. what to adapt · 10. what to defer · 11. universal/reusable vs · 12. ActivationOps-specific · 13. risk / scope creep / bloat it could add · 14. validation that proves the adapted version works.

Classify each useful discovery: immediate fix · playbook improvement · future-stage input · reusable standard · roadmap reference · project-specific note · rejected/no action · needs more research. (Reuse the **source tiers** above and the **Reuse Classification** section — do not duplicate them.)

Preference order: official/current → mature open-source examples → reputable company engineering references → practitioner examples (field signals) → generic content (low-confidence background only).

**Approval gate:** do not install / clone / copy / adopt / build from any source until the intake decision is clear, **and** get human approval when the adoption affects scope, architecture, tools, data model, AI behavior, integrations, public claims, or publishing.

Claude applies this before using any external reference or pattern. Codex verifies it and flags **skipped intake on a meaningful task** as a process finding. Keep it short for trivial edits; use full intake for high-risk, AI, integration, architecture, security, public-facing, or tool-selection work.

## Framework, Principle, and Approach Selection Rationale

Don't just name a method. For each meaningful framework/principle/approach, record (proportional to risk): the problem it solves · the source/evidence for it · why it fits this task · alternatives considered · why alternatives were rejected/deferred · who/what kinds of teams use it (where evidence exists) · what is adopted as-is · what is adapted · what is intentionally not used · remaining assumptions · how success is validated · what is reusable. Applies to planning, architecture, data, code, AI workflow, security, reliability, design, docs, demo, publishing.

## Tool and Tech Stack Selection Rationale

Every major tool/technology gets a rationale: tool · purpose · why chosen · official docs checked · alternatives · why not the alternatives · cost/free-tier · security/privacy · integration risk · local/offline version · enterprise-scale version · validation method · replacement/upgrade trigger.

Applies to: Python · CSV/Google Sheets · Gemini · Supabase · n8n · Pipedream/Zapier (if considered) · Slack · Resend · Mermaid · dashboard/UI tools · testing tools · any future framework/library.

**No silent tool changes.** Any add/remove/replace/upgrade/downgrade must document: what changed · why · trigger · alternatives · migration impact · risks created · validation required · human approval.

## Model, API, and Tool Freshness Rule

Any model/API/platform/integration choice that affects implementation, cost, security, public claims, or future compatibility must include a freshness check: current supported version · official docs/changelog checked · deprecation/retirement risk · upgrade trigger · fallback · **date checked** · whether the uncertainty blocks action. Applies to Gemini, Supabase, n8n, Slack, Resend, Pipedream, Zapier, Claude Code, the Codex plugin, SDKs, APIs, and any future model/tool.

## Planning Discipline

Every meaningful planning task explains: the problem · work type · stage · sources/references/examples checked · framework/method/principle and why · alternatives · assumptions · risks/blind spots · implementation sequence · out-of-scope · validation before implementation · what Codex should challenge · what human approval is needed. Planning must not be vague — but must not become a broad open-ended loop (this project's documented anti-pattern).

## Implementation Discipline

Every meaningful implementation task explains: what was implemented · why this way · step sequence · method/principle used · source/official docs if applicable · edge cases · what failed/changed · why · how diagnosed · how fixed · how verified · tests/checks proving it · what to reuse · what not to repeat · what is deferred. No silent improvisation; fix logic, not tests.

## Reproducibility Standard

Every runnable stage documents: required runtime · commands to run · expected outputs · test command · known generated files · reset/reproduce instructions · what to commit · what to ignore · how a new reviewer verifies the result. Do not call a stage reproducible unless another person can run the documented commands and understand the expected output.

**→ ActivationOps AI:** runtime = Python 3 stdlib only; `python3 scripts/run.py [--fresh]`; tests `python3 -m unittest tests.test_t001 -v` (23/23); generated files in `out/`; source CSV is read-only and hash-checked.

## Artifact Policy

Classify every generated artifact: source artifact · generated demo artifact · temporary build artifact · public portfolio artifact · internal-only artifact · ignored artifact. For each, state whether to commit · regenerate · ignore · move to examples · keep internal. Applies to `out/`, screenshots, exported dashboards, generated logs, demo files, diagrams, future public artifacts.

**→ ActivationOps AI:** `out/merchants_v1.csv` and `out/review_queue.csv` are **deterministic snapshots** (commit-stable demo artifacts). `out/audit_log.csv` and `out/model_runs.csv` are **append-only logs that change on every run** — open policy decision: either commit only a single `--fresh` run and treat re-runs as throwaway, or gitignore the two logs while keeping the snapshots. `__pycache__`/`*.pyc` are ignored.

## Data and Privacy Classification

Classify every dataset: real · synthetic · dummy · anonymized · generated fixture · public sample · internal-only. Never include real merchant data, personal data, credentials, tokens, or private company data.

**→ ActivationOps AI:** all merchant data is **dummy/synthetic** and does not represent any DoorDash internal system. Contact emails are synthetic `@example.com`.

## Validation and Acceptance Evidence

Every stage ends with evidence: tests passed · command output · source hash unchanged · generated output inspected · Codex review result · human approval · files changed · risks closed · open issues · next stage. Work is not "done" because an assistant says so — it is done when the evidence shows it.

## Stage Closure Criteria

A stage closes only when: scope complete or intentionally deferred · tests/checks pass · docs match implementation · artifact policy is clear · handoff is accurate · open issues are classified · next stage is named but not started · human owner approves closure. If not all true, classify the stage as **open**, **ready with minor follow-ups**, **blocked**, or **closed**.

## Failure Taxonomy and Rectification

Classify each failure: data defect · logic bug · test gap · documentation drift · scope drift · tool limitation · source uncertainty · security/privacy risk · model-output risk · integration risk · human-process failure · handoff failure · public-claim risk.

For each meaningful failure document: what failed · type · why · how diagnosed · options considered · fix chosen · why this fix · source/principle/prior-decision supporting it · validation evidence · prevention added · whether the lesson is reusable. **Do not hide failed attempts. Do not rewrite history to look smoother.**

## Decision Reversal Rule

When reversing a prior decision, document: original decision · why it changed · new evidence · impact on existing work · migration/cleanup required · validation after reversal · human approval. Applies to tool/model choices, architecture, data model, workflow logic, public claims, and stage direction.

## New Information and Blindspot Capture

When research/coding/testing/debugging/review surfaces something new, don't ignore it. Classify it: immediate fix · next-stage improvement · reusable standard · roadmap idea · rejected/no action · needs more research. For each useful discovery record: what was found · source · why it matters · whether it improves this project · whether it is reusable elsewhere · whether it exposes a blind spot · action taken/deferred · validation needed. If it changes scope, architecture, tool choice, data model, security, public claims, or AI behavior → record in `docs/decision-log.md` and ask for human approval.

## Reuse Classification

Classify useful things created/discovered: reusable prompt · reusable checklist · reusable regex/guardrail · reusable architecture pattern · reusable test pattern · reusable documentation pattern · reusable workflow template · project-specific only · rejected/no reuse. Reference genuinely reusable items in this playbook or the task log — **do not turn every small lesson into a new permanent file.**

## Enterprise Expansion Path

Every V1 decision says how it could evolve: current V1 choice · why enough now · what breaks at enterprise scale · future enterprise version · upgrade trigger · risks before upgrade · validation needed before upgrade. Do not build enterprise complexity before the simpler layer proves value.

**→ ActivationOps AI:** CSV logs now → Supabase/Postgres later · stubbed AI now → Gemini structured output later · simulated send now → Resend later · no approval UI now → Slack approval later · local tests now → CI/evaluation harness later.

## Public Claim Control

For README, portfolio, LinkedIn, demos, screenshots, public artifacts — no claim is allowed unless it is **proven by tests, shown in demo output, documented as simulated, supported by a source, or clearly labeled roadmap.** Public docs focus on ActivationOps AI, not the build tools; Claude Code/Codex appear only as a short "Development Workflow" note, never as runtime stack. Never claim "no AI was used" or "AI built this." Framing: **human-led, AI-assisted, professionally reviewed.**

## Public Demo Walkthrough Standard

Every public demo explains: the problem the viewer sees · the input used · what the system does · where AI helps · where deterministic logic controls risk · where human review is required · what output proves the workflow · what is simulated · what is roadmap. Guide a layperson without reducing technical depth.

## Professional Experience Quality

Applies to docs, visuals, UI, README, dashboards, demos, walkthroughs, code comments, public presentation. The work should feel clear, modern, minimal, elegant, intuitive, professional, human-reviewed — easy for a layperson, deep enough for a technical reviewer. Modern patterns (cards, glassmorphism, gradients, micro-interactions, animation, diagrams, polished layouts) are **allowed when they improve clarity, navigation, storytelling, or understanding**. Avoid generic AI wording, fake polish, random decoration, confusing navigation, unsupported claims, overdesigned visuals, unreviewed AI output. **Make complex work understandable without making it shallow.**

## Accessibility and Usability Baseline

Public docs, demos, dashboards, diagrams, and UI are reviewed for: clear hierarchy · readable language · clear labels · contrast · navigation clarity · layperson understanding · mobile/responsive awareness where relevant · visual restraint · no decorative complexity that hides meaning.

## Handoff-Proof Standard

A handoff is valid only if another Claude account, Codex session, ChatGPT review, or human can answer: what stage are we in? · what was last completed? · what is committed? · what is uncommitted? · what files changed? · what tests prove the current state? · what risks remain? · what is out of scope? · what is the next safe step? · what should not be repeated? Do not rely on chat memory — the repo must be enough.

**Every handoff/state update must re-derive git state from `git status` and `git log --oneline -8`. Never infer git state from memory.** (This rule exists because the handoff git-line went stale three times in T-001.)

## Stage-Gate Checklist

Before moving stages, verify: problem clear? · scope controlled? · task classified? · sources checked where needed? · framework/method/tool chosen intentionally? · alternatives considered? · assumptions logged? · risks/blind spots identified? · tests/checks run? · Codex reviewed where required? · docs updated? · human owner approved? · reusable lessons/standards captured? · public claims supported? · artifact policy clear? · handoff accurate? · next stage clear?

## Review Responsibility Split

Claude Code **applies** the playbook. Codex **verifies** Claude applied it correctly. ChatGPT web may give **stage-level executive review**, scope decisions, and tie-breaks. The human owner makes **final** decisions. No assistant silently converts a suggestion into a decision.

## No New Standing Logs Unless Justified

Do not create a new permanent tracking file unless it solves a repeated problem, replaces scattered process, or is required for a high-risk stage. Prefer updating the playbook, task log, decision log, implementation journal, handoff, and project state. Add a new standing file only if it clearly reduces confusion or improves quality.

## Playbook Use During Future Tasks

Every future meaningful Claude task opens with a short **Professional Process Applied** block before acting:
- task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · sources needed or not · validation method · documentation required · artifact policy (if relevant) · Codex review needed or not · human approval needed or not.

Keep it clear enough that a nontechnical reviewer understands *why* the task is handled this way. Future Codex reviews check whether Claude included and followed it.

## Living Standard and Change Rule

This playbook can improve as the project evolves — but **do not change it casually.** Update it only when new information exposes a real blind spot, a reusable pattern, a repeated failure, a better source-backed method, or an important project-specific improvement.

Every playbook change must explain: **what changed · why · what triggered it · whether it is universal or project-specific · what source/evidence/failure/review supports it · what it replaces or improves · whether it increases or reduces process burden.** Mark a change **universal** if reusable across projects, **project-specific** if only useful for ActivationOps AI. Record material changes in `docs/decision-log.md`.
