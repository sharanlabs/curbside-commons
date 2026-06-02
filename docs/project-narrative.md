# ActivationOps AI — Project Narrative

A human-led, AI-assisted, professionally reviewed workflow automation project for a DoorDash-style merchant onboarding simulation, built on dummy data.

This is not an official DoorDash system. It uses no real merchant data and makes no real business-impact claims. Every metric in it is simulated.

## The problem

When a marketplace signs up a new merchant, the sale is not the finish line — going live is. A restaurant or store has to finish a sequence of onboarding steps (verify the business, upload a menu, add photos, set hours, verify banking, pass a final check) before it can take a single order. Many never finish. They stall halfway, lose momentum, and quietly churn before they ever earn anything.

The people responsible for getting them unstuck — onboarding specialists and account managers — are working blind in a spreadsheet. They cannot easily see who has stalled, why, what to do next, or who they already contacted. The high-judgment work (deciding what a specific merchant needs) is buried under low-judgment work (scanning rows, drafting near-identical messages, remembering follow-ups).

## Who it is for

The operator persona is an **onboarding/account manager** carrying a book of new merchants. Their day looks like:

- scrolling a merchant list trying to spot who is at risk;
- guessing the blocker from a "steps completed" count;
- hand-writing encouragement messages, one merchant at a time;
- losing track of who was contacted, when, and whether it worked;
- having no reliable signal for which accounts genuinely need a human and which just need a nudge.

The pain is not a lack of effort. It is a lack of structure, memory, and triage.

## The solution hypothesis

A workflow that does the repeatable parts reliably and routes the rest to a human:

1. **Identify** stalled merchants from clear, deterministic signals.
2. **Diagnose** the specific activation blocker.
3. **Recommend** the next-best action.
4. **Route** high-risk or uncertain cases to human review.
5. **Draft** outreach for a human to approve — never send unattended.
6. **Track** delivery and outcomes.
7. **Learn** from what actually moved merchants forward.

The bet is that most of this is deterministic (scoring, blocker mapping, triage, idempotency) and only a thin layer needs a language model (explaining a situation, drafting a message). Keeping AI in that thin layer is what makes the system trustworthy.

## Why this is an AI automation project

Because the valuable part is judgment at scale, not text generation. The interesting engineering is the operating envelope around the model: deterministic decisions first, structured outputs, human approval before anything leaves the building, idempotency so no merchant is double-contacted, audit logs so every action is explainable, and evaluation before any claim of effectiveness. The model is a component inside a governed workflow — not the workflow.

## Why it starts with an offline thin slice

It would be easy — and wrong — to start by wiring up Supabase, n8n, Slack, Resend, and Gemini. That hides the hard parts (identity, eligibility, approval state, duplicate-send prevention, auditability) behind integration plumbing before any of them are proven.

So V1 is a single, fully offline slice that runs on the dummy data with no external services and no credentials: ingest and normalize the data, score risk deterministically, diagnose the blocker, build a review queue, generate one structured draft behind guardrails, simulate the send, and log everything. Its acceptance criteria are expressed as tests. If the slice cannot prove who should be contacted, why, with what approved message, and under what cooldown — no integration will fix that.

## Why complexity is added only after proof

Every external system is added only when the offline slice has earned it, and only with a reason recorded in the decision log. Supabase comes in when durable state is needed; n8n when there is a real multi-step flow to orchestrate; Slack when a review object exists to approve; Resend when contact eligibility and suppression are modeled; live Gemini when the stubbed generator and its guardrails are validated. Start simple; add complexity only when a concrete need justifies it.

## V1 versus roadmap

- **V1 (now):** the offline thin slice above — deterministic logic, one stubbed structured draft, simulated send, audit log, tests. One entity file plus append-only event logs. No live integrations.
- **Roadmap (later, each justified):** Supabase Postgres for state, n8n orchestration, Slack approval, Resend delivery + webhooks, live Gemini, a Google Sheets dashboard, outcome-learning, and a larger evaluation set.

The detailed scope decision lives in `docs/plan-reconciliation.md`.

## Methodology

The project moves through clear phases:

1. **Discovery** — understand the onboarding problem and the operator.
2. **Validation** — confirm the data and the problem are real before designing.
3. **Design** — define the data model, decisions, and guardrails.
4. **Thin Slice** — build the smallest end-to-end offline workflow, with tests.
5. **Review** — adversarial and changed-file review before anything is trusted.
6. **Expand** — add one external system at a time, each justified.
7. **Publish** — share the product story, with honest limitations.

## Principles

- Rules before LLMs.
- Deterministic logic before AI calls.
- Structured outputs before prose.
- Decision before action.
- Human approval before risky automation.
- Evaluation before claims.
- Logs before confidence.
- Cost control before scale.

## Why it is human-led, not autonomous

The system never sends, approves, or changes the source of truth on its own. A person approves outreach, high-risk accounts are routed to review, and the model's output is treated as a draft until a human accepts it. This is a deliberate design stance: in an operations workflow that contacts real businesses, the cost of a confident mistake is higher than the cost of a human checkpoint.

## How it is built (Development Workflow)

> Internal build method. Not part of the product runtime.

The build uses two AI tools under human direction: **Claude Code** for planning and implementation support, and **Codex** for adversarial plan review, changed-file review, rescue debugging, and pre-ship audits. Git provides version control; Mermaid keeps the diagrams maintainable. This dual-model loop is how the work gets reviewed before it is trusted — it is the method, not the product. Details: `docs/dual-model-workflow.md`.

## Limitations (stated plainly)

- The data is simulated; there is no real DoorDash access, no real merchants, and no real business impact.
- "Learning from outcomes" is simulated until real outcome events exist.
- The risk score is a transparent synthetic formula, not a trained model.
- V1 sends nothing — it simulates sends.

## On honesty

This project is built with AI assistance and is openly documented as such: **human-led, AI-assisted, professionally reviewed.** It does not claim that no AI was used, and it does not claim that "AI built it." A human owns the decisions, the scope, and what gets published.
