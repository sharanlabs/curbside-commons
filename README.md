# ActivationOps AI

ActivationOps AI is a dummy-data merchant onboarding automation review project for a DoorDash-style merchant activation workflow. It is not connected to DoorDash systems and does not use real merchant data.

## Current Status

The project is in reviewer-only discovery mode. The current repository evidence consists of one merchant CSV file:

- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`

No production workflow, Supabase schema, n8n workflow, Slack integration, Resend integration, Gemini agent, or Apps Script refactor has been implemented yet.

## What The CSV Contains

The CSV contains 20 simulated merchant records with fields for merchant name, merchant category, onboarding age, completed steps, last login recency, risk score, risk level, generated nudge message, and simulated estimated time saved.

The CSV is useful for a prototype review, but it is not sufficient as an enterprise workflow source of truth. The data audit and initial review document the gaps.

## Key Review Documents

- `PROJECT_STATE.md`: current project status and next step.
- `docs/product-brief.md`: product summary and intended workflow.
- `docs/data-audit.md`: detailed CSV audit.
- `docs/reviews/codex-initial-review.md`: critical architecture and readiness review.
- `docs/open-questions.md`: unresolved decisions before implementation.
- `docs/decisions/ADR-001-initial-architecture.md`: initial architecture decision.

## Reviewer Constraint

This repo should not proceed to build work until the data model, workflow guardrails, approval model, and duplicate-send controls are clarified.

