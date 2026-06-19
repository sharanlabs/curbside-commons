# ActivationOps AI

ActivationOps AI is a **human-led, AI-assisted workflow automation** project for a DoorDash-style merchant onboarding simulation. It helps onboarding and account managers spot stalled merchants, diagnose what is blocking activation, recommend the next best action, route risky cases to a human, draft approved outreach, and track outcomes.

This is **not** an official DoorDash system. It runs on dummy data, uses no real merchant data, and makes no real business-impact claims. All metrics are simulated.

## The problem

New merchants must finish a sequence of onboarding steps before they can take a single order — verify the business, upload a menu, add photos, set hours, verify banking, pass a final check. Many stall partway and churn before going live. The people responsible for unsticking them work in a spreadsheet with no easy way to see who is at risk, why, what to do next, or who was already contacted.

## The solution (V1)

V1 is a single, fully offline slice on the dummy data — no external services, no credentials:

- normalize the merchant data into a clean schema;
- score activation risk with a transparent, deterministic formula;
- diagnose the current blocker and the next best action;
- build a human review queue for high-risk or ineligible merchants;
- generate one structured outreach draft behind guardrails;
- simulate the send and log every action.

V1 is **AI-assisted workflow automation**, not an autonomous agent. The model drafts and explains; humans decide and approve.

## Product runtime stack

CSV / Google Sheets · Python or Apps Script · Gemini (structured drafts) · Supabase Postgres (state) · n8n (orchestration) · Slack (human approval) · Resend (approved email + webhooks) · dashboard / docs.

Most of this is roadmap. Built today: the offline deterministic pipeline (`scripts/`), its tests (`tests/`, 35/35), and the offline evaluation harness (`scripts/eval.py` + `eval/`) — no external services, no credentials. See `docs/visuals/architecture.mmd` for what is built versus target.

## Roadmap / target architecture

The target is an auditable, human-in-the-loop **agentic workflow**: bounded model tool-use under policy controls, durable state, orchestrated multi-step flows, live approval and delivery, and outcome learning. Each external system is added only when the offline slice has earned it. "Agentic" describes this target — not V1.

## Development Workflow

> Internal build method, not part of the product runtime.

Built under human direction with **Claude Code** (planning and implementation support) and **Codex** (adversarial plan review, changed-file review, rescue debugging, pre-ship audits), using Git for version control and Mermaid for diagrams. This is how the work is built and reviewed; it is not the product. Details: `docs/dual-model-workflow.md`.

## Key documents

- `docs/project-narrative.md` — the full product story and methodology.
- `docs/product-brief.md` — product summary and intended workflow.
- `docs/plan-reconciliation.md` — the pre-build decision and V1 scope.
- `docs/data-audit.md` — the dummy-data audit.
- `PROJECT_STATE.md` — current status and next step.
- `docs/visuals/` — architecture and flow diagrams.

## Status and limitations

The V1 offline slice (T-001) and the offline evaluation/regression harness (T-002) are built and green: `python3 scripts/run.py` runs the pipeline, `python3 -m unittest tests.test_t001 tests.test_t002` passes 35/35, and `python3 scripts/eval.py` reports MERCHANT 20/20 | GUARDRAIL 45/45 | PASS. The next step is T-003 (pre-Phase-3 hardening: company-agnostic de-brand, generated-draft evaluation coverage, a v2 demo/eval dataset, and enforcement hooks), then bounded LLM drafting (Phase 3). The data is simulated; "learning from outcomes" is simulated until real outcome events exist; the risk score is a transparent synthetic formula, not a trained model; and V1 sends nothing — it simulates sends.

Human-led, AI-assisted, professionally reviewed.
