# Claude Code Role

Claude Code is intended as a future implementation/refactor agent after the review phase is complete and the user approves build work.

## Before Implementation

Claude Code should read:

- `PROJECT_STATE.md`
- `AGENTS.md`
- `CODEX.md`
- `docs/product-brief.md`
- `docs/data-audit.md`
- `docs/reviews/codex-initial-review.md`
- `docs/open-questions.md`
- `docs/decisions/ADR-001-initial-architecture.md`

## Implementation Constraints

- Do not implement against the current CSV as an enterprise source of truth.
- Do not wire live Slack, Resend, Supabase, Gemini, or n8n credentials until dummy workflow state and safety controls are defined.
- Start with deterministic data modeling, validation, and idempotency before adding LLM generation or outbound delivery.
- Keep implementation changes staged and reviewable.

## Expected First Build Stage

The first build stage should create or transform a V1-ready dummy dataset and schema design, not a full automation stack.

