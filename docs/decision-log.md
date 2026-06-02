# Decision Log

Running log of scope and architecture decisions. One line per decision; link to the ADR or doc that holds the detail. Major architecture decisions also get an ADR in `docs/decisions/`.

Format: `[date] | decision | status | rationale (short) | reference`

| Date | Decision | Status | Rationale | Reference |
| --- | --- | --- | --- | --- |
| 2026-06-01 | Staged architecture; do not build the full stack first | Accepted | Source data cannot yet support identity, eligibility, approvals, idempotency, or audit | `docs/decisions/ADR-001-initial-architecture.md` |
| 2026-06-01 | V1 = single offline runnable slice; integrations deferred | Accepted | Prove who/why/what-message/under-what-cooldown before any external system | `docs/plan-reconciliation.md` §5 |
| 2026-06-01 | V1 storage = one entity CSV + append-only event logs (reject 14-table schema) | Accepted | 14 tables over-models 20 rows; normalization is a roadmap item | `docs/plan-reconciliation.md` §4–5 |
| 2026-06-01 | Reject the docs-first prerequisite gate; acceptance criteria as tests | Accepted | Documentation had begun to substitute for building | `docs/plan-reconciliation.md` §4 |
| 2026-06-01 | Drop "agentic" framing for V1 (workflow-first) | Accepted | V1 is a deterministic workflow with bounded LLM drafting, not an autonomous agent | `docs/plan-reconciliation.md` §3 |
| 2026-06-01 | Retire the single blended readiness score | Accepted | It rose without build progress; track shippable vs planning separately | `PROJECT_STATE.md` |
| 2026-06-01 | Adopt repo-as-source-of-truth operating system (this file set) | Accepted | Enable safe continuity across accounts/tools without repeated instructions | `RULES.md` |
| 2026-06-01 | Planning exit = human GO / NO-GO on the reconciliation | Accepted | Give the planning phase a single, checkable end | `docs/plan-reconciliation.md` §8 |

## How to add a decision

1. Append a row above with the date, the decision, status (Proposed / Accepted / Superseded), a one-line rationale, and a reference.
2. If it changes architecture materially, write or update an ADR in `docs/decisions/` and link it.
3. If it changes the active task, update `CURRENT_TASK.md`.
