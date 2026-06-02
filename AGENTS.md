# Agent Instructions

This project is in reviewer-first mode until the user explicitly approves implementation.

## Ground Rules

- Treat all merchant data as dummy/simulated.
- Do not assume access to real DoorDash systems, merchants, metrics, or business impact.
- Do not create or use real API keys, tokens, secrets, production configs, or live credentials.
- Do not implement Supabase schemas, n8n workflows, Slack integrations, Resend integrations, Gemini agents, or Apps Script refactors until explicitly requested.
- Prefer simple, auditable workflow design over broad agentic automation.
- Preserve existing files and avoid unrelated refactors or formatting churn.

## Review Priorities

- Verify claims against local files first.
- Inspect CSV headers, row counts, values, and data quality before architecture recommendations.
- Separate observed facts, inferred patterns, assumptions, and unverified risks.
- Call out duplicate-send risks, approval gaps, prompt/versioning gaps, privacy risks, cost-control gaps, and missing data model pieces.

## Expected Documentation

Maintain:

- `PROJECT_STATE.md`
- `docs/task-log.md`
- `docs/open-questions.md`
- `docs/data-audit.md`
- `docs/reviews/codex-initial-review.md`
- `docs/decisions/ADR-001-initial-architecture.md`

## Validation

Before claiming completion for review work, re-check the file tree, inspect changed docs for required sections, and confirm no production workflows or live integrations were created.

