# Open-Source Validation Review

Review date: 2026-06-02

## Executive Assessment

ActivationOps AI is worth building as a staged dummy-data simulation, but it is not ready for Supabase, n8n, Slack, Resend, or Gemini implementation yet. Open-source and official-source validation supports the project's core principles: architecture before code, deterministic logic before AI, structured outputs before prose, human approval before external actions, and auditable state before workflow orchestration.

The current process is directionally professional, but it is incomplete. `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`, and `docs/audits/session-compliance-template.md` are missing even though the validation prompt requires them as mandatory context. That is a process blocker for multi-session reliability.

Updated readiness score: 4/10 overall. The idea and staged architecture are validated, but build readiness remains blocked by the dataset, missing governance files, and absent acceptance criteria.

## Sources Checked

Local evidence:

- `PROJECT_STATE.md`
- `AGENTS.md`
- `README.md`
- `docs/product-brief.md`
- `docs/task-log.md`
- `docs/open-questions.md`
- `docs/data-audit.md`
- `docs/reviews/codex-initial-review.md`
- `docs/decisions/ADR-001-initial-architecture.md`
- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`

Mandatory files missing:

- `ALWAYS_READ.md`
- `docs/audits/codex-compliance-audit.md`
- `docs/audits/session-compliance-template.md`

Open and official sources:

- Anthropic, [Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)
- OpenAI, [A Practical Guide to Building Agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- OpenAI, [Agents SDK](https://developers.openai.com/api/docs/guides/agents)
- OpenAI, [Guardrails - Agents SDK](https://openai.github.io/openai-agents-js/guides/guardrails/)
- OpenAI, [Tracing - Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
- OpenAI, [Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)
- Google AI for Developers, [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- n8n, [Error handling](https://docs.n8n.io/flow-logic/error-handling/)
- n8n, [Human-in-the-loop for AI tool calls](https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/)
- n8n, [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- Slack, [Verifying requests from Slack](https://docs.slack.dev/authentication/verifying-requests-from-slack/)
- Slack, [Handling user interaction](https://docs.slack.dev/interactivity/handling-user-interaction/)
- Slack, [chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/)
- Resend, [Send Email](https://resend.com/docs/api-reference/emails/send-email)
- Resend, [Managing Webhooks](https://resend.com/docs/webhooks/introduction)
- Resend, [Webhook event types](https://resend.com/docs/webhooks/event-types)
- Supabase, [Securing your data](https://supabase.com/docs/guides/database/secure-data)
- Supabase, [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Google, [Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits)
- OWASP, [Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- OWASP, [MCP Top 10](https://owasp.org/www-project-mcp-top-10/)
- OWASP, [MCP06 Intent Flow Subversion](https://owasp.org/www-project-mcp-top-10/2025/MCP06-2025%E2%80%93Intent-Flow-Subversion)
- arXiv, [Demystifying and Detecting Agentic Workflow Injection Vulnerabilities in GitHub Actions](https://arxiv.org/abs/2605.07135)
- arXiv, [Engineering Pitfalls in AI Coding Tools](https://arxiv.org/abs/2603.20847)

## Validation Verdict

The project direction is valid if staged as a workflow-first system with a bounded AI component. The current name, "Agentic AI Workflow Automation System," is acceptable as an aspirational roadmap label, but V1 should be described more precisely as "AI-assisted workflow automation with human approval."

The current CSV blocks implementation. The next executable step should be V1 dataset design, not integration work.

## What We Are Doing Right

- The project explicitly treats the data as dummy/simulated.
- The docs avoid claiming real DoorDash access or real business impact.
- The initial review correctly prioritizes stable IDs, timestamps, contact eligibility, approval state, idempotency, audit logs, and outcome tracking.
- The planned stack is coherent if Supabase/Postgres is the source of truth and Google Sheets remains an import/export/dashboard surface.
- The process separates reviewer and implementation roles.
- The rules correctly forbid live sends and production workflows before validation.

## What Needs Correction

- Create `ALWAYS_READ.md` before the next session and make it the canonical preflight file.
- Create a reusable `docs/audits/session-compliance-template.md`.
- Create a prior-session `docs/audits/codex-compliance-audit.md` or explicitly mark it as not available.
- Define V1 acceptance criteria before build work.
- Decide whether Supabase schema design is part of V1 or follows a richer CSV/Sheet prototype.
- Replace "agentic" language in V1 docs with workflow-first language unless the model controls multi-step tool use.
- Add an explicit stop condition: no integration implementation until dataset acceptance tests pass.

## Codex Review Quality Assessment

1. Codex stayed in reviewer-only mode: yes.
2. Codex avoided implementation: yes. It created docs only and did not create schemas, workflows, integration code, or production code.
3. Codex inspected the CSV correctly: yes. The row count, duplicate header, category inference, and risk formula fit were verified.
4. Codex identified key data defects: yes. The most material blockers were stable IDs, timestamps, contact eligibility, owner/reviewer state, event history, prompt/model metadata, send state, and outcome tracking.
5. Codex updated the requested docs: yes for the previous work order.
6. Codex created the compliance audit: no. This was not part of the previous required output list, but it is now a gap under the current validation prompt.
7. Codex cited sources where vendor-specific claims were made: mostly yes. The initial review included links to Supabase, n8n, Slack, Resend, Gemini, and Google Sheets docs.
8. Codex overstated anything: no material overstatement found. It correctly labeled the risk formula as inferred.
9. Codex missed any major blind spots: it did not create persistent compliance scaffolding and did not define V1 acceptance criteria. These are process gaps more than technical-audit gaps.
10. The 3/10 readiness score was fair for build readiness.

## Workflow vs Agent Naming Assessment

Anthropic distinguishes predictable workflows from more flexible agents and recommends the simplest solution that meets the task. OpenAI similarly frames agents as systems where the model reasons, uses tools, and acts within guardrails, while deterministic workflows may be enough when rules can handle the task.

ActivationOps AI V1 does not need an autonomous agent. It needs:

- Deterministic risk scoring.
- Deterministic blocker mapping.
- Structured draft generation.
- Human approval.
- Simulated sends and outcomes.
- Audit logging.

Use "agentic" only for roadmap phases where the model makes bounded tool-use decisions under policy controls.

## Architecture Validation

The planned architecture is justified if sequenced correctly:

- Supabase/Postgres is reasonable for durable CRM/workflow state.
- Google Sheets is reasonable for dummy data import/export and dashboard visibility.
- Gemini is reasonable for structured draft generation and explanation, not autonomous routing in V1.
- n8n is reasonable for orchestration after state, retries, idempotency, and failure paths are designed.
- Slack is reasonable for approval and escalation after review objects exist.
- Resend is reasonable for approved email delivery after contact eligibility and suppression state exist.

The architecture is overbuilt for the current CSV. It is not overbuilt for the roadmap if V1 remains narrow.

## Data Model Validation

The current data model blocks implementation.

Observed facts:

- 20 merchant rows.
- 9 CSV columns.
- Duplicate `Merchant Name` header.
- Second `Merchant Name` column is actually merchant category/type.
- No duplicate merchant names in this sample.
- No stable ID.
- No contact fields.
- No owner/reviewer fields.
- No absolute timestamps.
- No event history.
- No approval, send, delivery, prompt, model, outcome, or audit state.

The current data supports a toy demo, not a workflow system. V1 should not proceed until a dataset exists with stable identities, contact eligibility, owner/review state, blocker taxonomy, prompt/model metadata, idempotency, and outcome events.

## Governance and ALWAYS_READ Validation

`ALWAYS_READ.md` is missing. That is the highest-priority governance correction.

The existing `AGENTS.md`, `CODEX.md`, and `CLAUDE.md` are helpful, but they are not enough because the current validation prompt expects `ALWAYS_READ.md` to define non-negotiable session rules and compliance requirements.

Recommended `ALWAYS_READ.md` content:

- Project identity and dummy-data constraint.
- Mandatory session preflight file list.
- Review-only vs implementation mode definitions.
- Non-negotiable rules.
- Required audit checklist.
- Stop conditions.
- Required final handoff fields.

## Claude Code and Codex Handoff Validation

The handoff process is useful but incomplete.

Strong parts:

- `CODEX.md` defines Codex as reviewer/tester/hardening agent.
- `CLAUDE.md` defines Claude Code as future implementer after approval.
- `PROJECT_STATE.md` records current status and next step.
- `docs/task-log.md` captures prior work.

Gaps:

- No `ALWAYS_READ.md`.
- No session compliance template.
- No explicit acceptance criteria for a future implementation agent.
- No "do not proceed unless" checklist.
- No required terminal summary template outside the current prompt.

## AI Agent Design Validation

The planned AI role should be narrowed. Current source guidance supports simple workflows and measurable evaluation before agent autonomy.

V1 AI should produce structured draft support only:

- Risk explanation.
- Blocker summary.
- Next-best-action rationale.
- Email subject/body draft.
- Guardrail flags.

It should not decide to send email, bypass review, update source-of-truth state, or create new workflow branches.

## Structured Output and Schema Validation

Gemini structured outputs are appropriate because the official docs support JSON Schema-based responses and describe agentic workflows as a use case for structured outputs. The docs also state Gemini supports a subset of JSON Schema, so schemas must be tested against the chosen model.

V1 should require:

- JSON schema for all model outputs.
- Deterministic validation after model output.
- Enum-constrained blocker codes and next actions.
- Rejection when output references unsupported merchant facts.
- Stored prompt version, model version, schema version, and model run ID.

## Human-in-the-Loop Validation

Human approval is mandatory before external communication.

n8n's HITL docs explicitly support pausing before AI tool calls that perform irreversible actions or external communications. Slack docs require interaction payload parsing, fast acknowledgement, and request signature verification.

V1 should:

- Store a review object before Slack is introduced.
- Snapshot the exact draft being approved.
- Enforce approver authorization.
- Expire approvals after a defined window.
- Re-check merchant eligibility after approval and before send.

## Guardrail and Evaluation Validation

The guardrail plan is directionally correct but underspecified.

OpenAI guardrail and eval docs support:

- Input guardrails.
- Output guardrails.
- Tool guardrails.
- Tracing model/tool/guardrail/handoff events.
- Moving from traces to repeatable datasets and eval runs.

V1 should include:

- A small evaluation dataset.
- Golden expected blocker/action labels.
- Draft-quality rubric.
- Forbidden-claim checks.
- Duplicate-send tests.
- Human-review tests.
- Regression checklist for prompt/schema changes.

## n8n Automation Validation

n8n is suitable after the state model exists.

Official n8n docs support:

- Webhook-triggered workflows.
- Error workflows for failed executions.
- Human approval for AI tool calls.

Risks if introduced too early:

- Workflow nodes hide unresolved state problems.
- Retries can duplicate sends.
- Human approvals can stall without expiry.
- Error workflows can alert without resolving bad state.

Recommendation: defer n8n implementation until V1 state transitions and idempotency rules are documented.

## Supabase/Postgres Validation

Supabase/Postgres is justified for V1 state if it is introduced after the data model is approved.

Official Supabase docs support the security requirement:

- Data API tables need RLS and least-privilege grants.
- Service/secret keys bypass RLS and must stay backend-only.
- Views can bypass RLS by default unless configured or protected.

Recommendation: keep Supabase in the V1 architecture design, but do not create schemas until V1 dataset fields and acceptance tests are approved.

## Slack Integration Validation

Slack is suitable for human approval after review state exists.

Official Slack docs validate these requirements:

- Verify Slack requests with the signing secret and request timestamp.
- Use the raw request body for signature checks.
- Acknowledge interactive payloads with HTTP 200 within 3 seconds.
- Include accessibility-aware message text when using blocks.

Recommendation: Slack is not V1 step 1. It is V1 step 2 or 3 after review records and approval state exist.

## Resend Webhook Validation

Resend is suitable for approved email delivery after contact eligibility and outbox state exist.

Official Resend docs validate:

- Sending email returns an email ID.
- The send API supports an `Idempotency-Key` header.
- Webhooks are at-least-once delivery.
- Webhook order is not guaranteed.
- Duplicates should be handled with `svix-id`.
- Event types include sent, delivered, bounced, complained, failed, opened, suppressed, and delayed.

Recommendation: defer live Resend until the outbox, idempotency key, suppression state, and webhook event table exist.

## Google Sheets Role Validation

Google Sheets should remain dashboard/import/export/evaluation visibility, not source of truth.

Google's Sheets API docs include quota and payload guidance, including per-minute request quotas and recommended payload size. That does not make Sheets unusable, but it makes Sheets a poor durable orchestration state layer when retries, approvals, sends, and event history matter.

Recommendation: use Sheets for visibility and human-readable dummy data, but persist workflow state in Postgres once build begins.

## Security and Privacy Validation

The current dummy data has low privacy sensitivity, but the planned workflow touches sensitive surfaces:

- Merchant contact fields.
- Email content.
- Slack approval payloads.
- Webhook payloads.
- Model prompts and traces.
- API keys and signing secrets.

Security controls required before live integration:

- Least-privilege credentials.
- No service-role key in clients, Sheets, Slack payloads, or n8n logs.
- Signed webhook verification.
- Log redaction.
- Prompt/model trace sensitivity controls.
- Separate local/test/demo environments.
- Audit log for every external action.

## Agentic Workflow Security Risks

OWASP LLM and MCP sources validate the main risk pattern: untrusted text can become a hidden instruction channel, and tools with broad permissions can amplify model mistakes.

Specific risks for this project:

- CSV or Sheet text could influence generated outreach or tool actions.
- Slack comments or approval notes could be treated as instructions.
- Webhook payloads could be trusted without signature verification.
- Model output could trigger downstream workflow branches without deterministic validation.
- Multi-session coding agents could treat repo instructions or generated files as higher authority than user/system rules.

Mitigation:

- Treat external content as untrusted data.
- Use policy-as-code checks before tool calls.
- Use least-privilege tools.
- Keep human approval for external actions.
- Keep immutable audit logs.

## Overengineering Risk

High if the first build includes full Supabase, n8n, Slack, Resend, Gemini, webhooks, outcome learning, and multi-agent routing.

The right V1 is smaller:

- V1 dataset.
- Deterministic risk/blocker/action rules.
- Structured AI draft generation.
- Review queue.
- Simulated send/outcome/audit records.

## Underengineering Risk

Also high if the project skips boring state controls.

Do not underbuild:

- Stable IDs.
- Timestamps.
- Contact eligibility.
- Review state.
- Outbox state.
- Idempotency.
- Prompt/model versioning.
- Event logs.
- Acceptance tests.

These are not enterprise extras. They are the minimum required to prevent bad automation behavior.

## Missing Validation Before Build

- V1 dataset acceptance criteria.
- Minimum credible dataset size.
- Canonical onboarding step taxonomy.
- Blocker code taxonomy.
- Risk thresholds.
- Contact eligibility rules.
- Human approval rules.
- Duplicate-send policy.
- Prompt/schema eval dataset.
- Workflow dry-run payloads.
- Compliance audit template.

## Recommended Rule Changes

| Rule | Decision | Change |
| --- | --- | --- |
| Architecture before code | Keep as-is | Add "architecture must include state transitions and failure modes." |
| Rules before LLMs | Keep as-is | Add "rules must be executable as validation checks where possible." |
| Deterministic logic before AI calls | Keep as-is | Require deterministic blocker/risk baseline before Gemini. |
| AI only where judgment is needed | Keep as-is | Define permitted AI outputs for V1. |
| Structured JSON before prose | Keep as-is | Require schema version and validation failure handling. |
| Human approval before risky actions | Keep as-is | Define risky actions and approval expiry. |
| Every decision must be logged | Modify | ADRs for architecture, audit logs for workflow actions, task-log entries for session decisions. |
| Every prompt must be versioned | Keep as-is | Include prompt, model, schema, and eval version. |
| Every external action must be auditable | Keep as-is | Include actor, payload snapshot, idempotency key, and result. |
| No fake business impact | Keep as-is | Require "simulated" label on all metrics. |
| No real merchant data | Keep as-is | Add fake-domain/email rules for test contacts. |
| No secrets in code | Keep as-is | Add no secrets in docs, prompts, traces, Sheets, or n8n logs. |
| No duplicate sends | Keep as-is | Define database unique constraint and Resend idempotency strategy. |
| No auto-send for high-risk or critical-risk merchants | Keep as-is | Define high/critical thresholds and mandatory reviewer roles. |
| No unsupported revenue claims in outreach | Keep as-is | Add forbidden-claim validator. |
| No major architecture change without ADR | Keep as-is | Define what counts as major. |
| Every session must update `PROJECT_STATE.md` | Keep as-is | Add required state fields. |
| Every session must complete a compliance audit before stopping | Keep as-is | Create reusable template before next session. |

## Recommended Documentation Changes

Create before build:

- `ALWAYS_READ.md`
- `docs/audits/session-compliance-template.md`
- `docs/acceptance-criteria/v1-dataset.md`
- `docs/architecture/state-model.md`
- `docs/architecture/workflow-states.md`
- `docs/guardrails/outreach-policy.md`
- `docs/evals/v1-evaluation-plan.md`

Optional after V1 dataset approval:

- Supabase schema ADR.
- n8n workflow ADR.
- Slack approval runbook.
- Resend webhook runbook.

## Recommended V1 Scope After Research

V1 should include:

1. Corrected dummy dataset with stable IDs, timestamps, contacts, ownership, blocker fields, review state, outreach state, and outcome fields.
2. Deterministic risk score and blocker mapping with documented formula and thresholds.
3. Structured Gemini draft generation only after deterministic candidate selection.
4. Stored model run records with prompt, model, schema, inputs, outputs, validation result, and cost estimate.
5. Human review queue with approval/rejection state.
6. Simulated sends, delivery events, and outcomes.
7. Duplicate-send prevention and audit log.
8. No live email sends.

## Recommended Roadmap After Research

Roadmap after V1:

- Supabase schema and migrations.
- n8n dry-run workflow.
- Slack approval callback.
- Resend sandbox/test delivery.
- Resend webhook ingestion.
- Outcome-learning loop.
- Real dashboard in Sheets or app UI.
- Larger evaluation dataset.
- Multi-agent routing only if deterministic workflows fail.

## Readiness Score After Open-Source Validation

4/10.

The architecture and rules are validated, but the system is not build-ready. The score improves from 3/10 only because the documentation and architecture direction now have stronger source backing. The CSV/data model still blocks implementation.

## Final Recommendation

Proceed only to governance and V1 dataset design. Do not build integrations yet. The next session should create `ALWAYS_READ.md`, a compliance template, and V1 dataset acceptance criteria, then generate or transform the dummy dataset to meet those criteria. Only after that should Supabase schema design be considered.
