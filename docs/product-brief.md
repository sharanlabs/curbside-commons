# Product Brief

## Product

ActivationOps AI is a dummy-data merchant onboarding automation system for a delivery-marketplace-style activation workflow.

## Intended Jobs

- Identify stalled merchants.
- Diagnose onboarding blockers.
- Score activation risk.
- Recommend next-best actions.
- Generate personalized outreach drafts.
- Route high-risk or uncertain cases to human review.
- Track approvals, sends, delivery events, and outcomes.
- Maintain audit logs, prompt versions, guardrails, and cost tracking.

## Planned Stack

- Google Sheets for dummy data import/export, dashboarding, and evaluation visibility.
- Supabase Postgres for CRM/state storage and workflow source of truth.
- Gemini for structured AI reasoning and outreach draft generation.
- n8n self-hosted for orchestration.
- Slack for human approval and escalation.
- Resend for approved email delivery and webhook tracking.
- Claude Code for future implementation/refactor work.
- Codex for review, testing, hardening, and architecture critique.

## Current Constraint

The current CSV is a prototype artifact, not a workflow-ready data source. It lacks stable IDs, contact eligibility, owner assignment, event history, approval state, outreach state, outcome data, prompt versioning, and audit fields.

## Recommended V1

V1 should prove a narrow deterministic workflow:

1. Normalize dummy merchant data into a reliable schema.
2. Compute or store transparent risk and blocker fields.
3. Create a review queue for high-risk merchants.
4. Generate outreach drafts without sending live email.
5. Record approval decisions and simulated outcomes.
6. Validate duplicate-send prevention and audit logs.

Full learning loops, live outbound delivery, and broad agentic automation should wait until the data model and safety controls are validated.

