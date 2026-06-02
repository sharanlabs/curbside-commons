# ADR-001: Initial Architecture Direction

Date: 2026-06-01

## Status

Accepted for review-phase planning.

## Context

ActivationOps AI is intended to simulate merchant onboarding operations with dummy data. The planned stack includes Google Sheets, Supabase Postgres, Gemini, n8n, Slack, Resend, Claude Code, and Codex.

The current project folder initially contained only one CSV file with 20 simulated merchant records. The CSV lacks stable IDs, contact eligibility, ownership, event history, approval state, outreach state, delivery state, outcome events, prompt versions, model run logs, and audit logs.

## Decision

Use a staged architecture and do not build the full automation stack first.

Recommended sequence:

1. Create a V1-ready dummy dataset.
2. Define canonical data model and state transitions.
3. Use deterministic rules for risk, blocker diagnosis, and next-best action.
4. Add AI only for structured draft generation and explanation.
5. Add human review and approval state.
6. Simulate send attempts and outcomes.
7. Add n8n, Slack, and Resend only after idempotency, approval, eligibility, and audit controls exist.

## Options Considered

### Option 1: Build full stack immediately

Rejected.

This would create n8n, Slack, Resend, Supabase, and Gemini workflow complexity before the source data can support identity, eligibility, approvals, duplicate-send prevention, or auditability.

### Option 2: Start with a data-model-first V1

Accepted.

This is the lowest-risk path because it forces stable IDs, timestamps, state transitions, guardrails, and testable workflow behavior before live integrations.

### Option 3: Keep everything in Google Sheets

Rejected as the long-term source of truth, but acceptable for short-lived dummy data design.

Sheets can help visibility and evaluation, but it should not become the durable workflow state layer once approvals, sends, delivery events, and audit logs are introduced.

## Consequences

Positive:

- Reduces duplicate-send and approval risks.
- Keeps the first build testable.
- Makes AI behavior auditable.
- Preserves a clear path to Supabase and n8n later.
- Avoids pretending the current CSV supports enterprise workflow automation.

Trade-offs:

- Slower path to a flashy demo.
- Requires schema and data cleanup before integrations.
- Pushes live email delivery and Slack automation to a later stage.

## Validation Needed

Before moving beyond this ADR:

- Approve a V1 dummy data schema.
- Generate or transform the CSV into that schema.
- Define risk thresholds and blocker taxonomy.
- Define review/approval states.
- Define idempotency and cooldown rules.
- Define simulated outcome events.

