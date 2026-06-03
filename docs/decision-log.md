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
| 2026-06-01 | V1 recomputes + validates `risk_score`, but **carries the source `risk_level`**; thresholds are a documented assumption (`thresholds.v1`) | Accepted | 20 rows over-determine the formula but under-constrain the level boundaries (both Medium rows = 69; gaps 48→69, 69→89) — honest not to assert thresholds | `docs/v1-data-dictionary.md` §6 |
| 2026-06-01 | V1 store = one entity CSV + **two** append-only logs (`audit_log`, `model_runs`); a send is an audit event | Accepted | Smaller than three logs; consistent with "one entity table + append-only events" | `docs/v1-data-dictionary.md` §2, §10 |
| 2026-06-01 | Synthetic ineligibility lives in **test fixtures**, not in `merchants_v1.csv` | Accepted | Keep the product output an honest normalization of the 20 real rows; don't invent opted-out merchants to populate the queue | `docs/v1-data-dictionary.md` §3 |
| 2026-06-01 | Guardrail also tested over the 20 real source nudges (over-flagging check); idempotency `cooldown_window` = as-of date (discrete bucket) | Accepted | Use real-ish text, not only planted strings; a duration can't dedup a key | `docs/v1-slice-plan.md` T11, `docs/v1-data-dictionary.md` §10 |
| 2026-06-01 | **Contact eligibility and send eligibility are separate**; `send_eligible = contact_eligible AND (review_required=false OR approval_state=approved)` | Accepted | Review-required/High merchants must not reach simulated send without explicit approval — proves human-review gating in V1 even without live Slack or a UI (closes Codex round-1 [high]) | `docs/v1-data-dictionary.md` §7.1, `docs/v1-slice-plan.md` T17 |
| 2026-06-02 | Adopt the **Source/Pattern/Reference Intake** rule (universal): evaluate before adopting anything external; no default adoption; approval gate for high-impact | Accepted | Owner-directed standard to prevent cargo-culting; **integrated into the existing playbook** (cross-referencing the source tiers + reuse classification) rather than a new file, to avoid duplication/bloat → reduces process burden vs. a standalone doc | `docs/enterprise-delivery-playbook.md` (Source, Pattern, and Reference Intake); `RULES.md` §14 |
| 2026-06-02 | **Ratify eval-first sequencing — T-002 = Offline Evaluation and Regression Harness, before any live Gemini / model integration** (reorders `plan-reconciliation.md` §6, which listed live Gemini ahead of the larger eval / golden-label / regression suite) | Accepted | Evaluation-before-claims (`RULES.md` §3); the guardrail passes *by construction* until an eval set exists (`v1-data-dictionary.md` §9); the T-001.7 audit recommended eval-first; a baseline must exist before Gemini to avoid baseline-less claims and to reduce live-API / secrets / cost / non-determinism risk; regression-testing discipline | `docs/review-packets/roadmap-lifecycle-applicability-review.md`; `docs/audits/post-playbook-alignment-audit.md`; `docs/plan-reconciliation.md` §6 |

## How to add a decision

1. Append a row above with the date, the decision, status (Proposed / Accepted / Superseded), a one-line rationale, and a reference.
2. If it changes architecture materially, write or update an ADR in `docs/decisions/` and link it.
3. If it changes the active task, update `CURRENT_TASK.md`.
