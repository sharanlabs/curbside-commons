# Open-Source Validation Compliance Audit

Audit date: 2026-06-02

## Session Summary

This session performed a validation-only review of ActivationOps AI. It read required local project files where present, recorded missing mandatory files, consulted official/open sources, audited the prior Codex review, created an open-source validation review, updated project state/task log/open questions, and avoided implementation.

## Mandatory Files Read

| File | Status | Notes |
| --- | --- | --- |
| `ALWAYS_READ.md` | Missing and not created | Missing before validation; should be created before next session. |
| `PROJECT_STATE.md` | Read | Updated during this session. |
| `AGENTS.md` | Read | Existing reviewer-first rules are directionally sound. |
| `README.md` | Read | Existing summary matches project state. |
| `docs/product-brief.md` | Read | Product framing is sound but V1 should use workflow-first language. |
| `docs/task-log.md` | Read | Updated during this session. |
| `docs/open-questions.md` | Read | Updated during this session. |
| `docs/data-audit.md` | Read | CSV audit is accurate and evidence-backed. |
| `docs/reviews/codex-initial-review.md` | Read | Prior review was fair and stayed reviewer-only. |
| `docs/audits/codex-compliance-audit.md` | Missing and not created | Missing prior-session artifact; this session does not retroactively create it. |
| `docs/audits/session-compliance-template.md` | Missing and not created | Missing governance template; should be created before next session. |
| `docs/decisions/ADR-001-initial-architecture.md` | Read | Architecture direction is source-backed if staged. |

## Sources Consulted

| Source | Used to validate |
| --- | --- |
| [Anthropic - Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents) | Workflow vs agent distinction, prompt chaining, routing, evaluator-optimizer, and simplicity-first guidance. |
| [OpenAI - A Practical Guide to Building Agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) | Agent definition, deterministic-vs-agent fit, guardrails, human intervention, and staged deployment. |
| [OpenAI - Agents SDK](https://developers.openai.com/api/docs/guides/agents) | Agent SDK framing and agentic application concepts. |
| [OpenAI - Guardrails](https://openai.github.io/openai-agents-js/guides/guardrails/) | Input/output/tool guardrails and tripwire behavior. |
| [OpenAI - Tracing](https://openai.github.io/openai-agents-python/tracing/) | Observability, traces, spans, tool calls, handoffs, and sensitive-data trace settings. |
| [OpenAI - Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) | Trace grading, datasets, eval runs, and repeatable evaluation. |
| [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) | JSON Schema structured output support and schema limitations. |
| [n8n error handling](https://docs.n8n.io/flow-logic/error-handling/) | Error workflows and failed-execution handling. |
| [n8n HITL tools](https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/) | Human approval before irreversible/external AI tool calls. |
| [n8n Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) | Webhook-triggered workflow behavior. |
| [Slack request verification](https://docs.slack.dev/authentication/verifying-requests-from-slack/) | Signing secret, timestamp, HMAC verification, replay protection. |
| [Slack interactivity](https://docs.slack.dev/interactivity/handling-user-interaction/) | Interaction payload shape and 3-second acknowledgement. |
| [Slack chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/) | Message accessibility and posting constraints. |
| [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email) | Send requirements, returned email ID, and idempotency header. |
| [Resend Managing Webhooks](https://resend.com/docs/webhooks/introduction) | At-least-once delivery, duplicate handling, retry behavior, `svix-id`. |
| [Resend Event Types](https://resend.com/docs/webhooks/event-types) | Delivery, bounce, complaint, failure, opened, suppressed, and sent events. |
| [Supabase Securing your data](https://supabase.com/docs/guides/database/secure-data) | RLS, least privilege, backend-only secrets, service role risk. |
| [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Exposed schema RLS, service-key bypass, view behavior, policy performance. |
| [Google Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits) | Quotas, payload guidance, timeout behavior, and backoff. |
| [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) | Prompt injection, insecure output handling, excessive agency, and LLM application risk. |
| [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/) | Token exposure, scope creep, tool poisoning, command injection, audit/telemetry gaps. |
| [OWASP MCP06 Intent Flow Subversion](https://owasp.org/www-project-mcp-top-10/2025/MCP06-2025%E2%80%93Intent-Flow-Subversion) | Treating tool outputs/resources as untrusted, policy checks, HITL, and intent drift detection. |
| [arXiv AWI paper](https://arxiv.org/abs/2605.07135) | Recent research on untrusted event context reaching agent prompts and downstream scripts. |
| [arXiv AI coding tools pitfalls](https://arxiv.org/abs/2603.20847) | Recent research on coding-agent tool invocation, command execution, API/configuration failure modes. |

## Scope Compliance

- Did this session stay in validation-only mode? Yes.
- Did this session avoid implementation? Yes.
- Did this session avoid creating production workflows? Yes.
- Did this session avoid creating schemas or integration code? Yes.
- Did this session avoid modifying the CSV? Yes.

## Evidence Quality Assessment

- Were official docs preferred? Yes. Official docs were used for vendor/tool behavior.
- Were claims cited? Yes. Vendor-specific and AI-agent/security claims are tied to source links in the validation review.
- Were uncertain claims marked as uncertain? Yes. Missing files, current readiness, and staged recommendations are labeled as findings or recommendations.
- Were any claims based only on memory? No material claims were based only on memory. Local repo evidence and current web sources were used.

## Codex Compliance Review

- Did Codex follow its original instructions? Mostly yes.
- Did Codex create the requested files? Yes for the prior work order.
- Did Codex avoid implementation? Yes.
- Did Codex identify material blockers? Yes.
- Did Codex leave gaps? Yes. It did not create a compliance audit/template and did not define V1 acceptance criteria. The compliance audit gap was not explicitly required in the prior work order but is now required by the current process.

## Rule Compliance Checklist

`ALWAYS_READ.md` is missing, so this checklist uses the non-negotiable rules from the current validation prompt as the active rule source.

| Rule | Status | Evidence |
| --- | --- | --- |
| Architecture before code | Followed | This session produced review/audit docs only. |
| Rules before LLMs | Followed | Rule gaps are documented before any AI workflow design. |
| Deterministic logic before AI calls | Followed | Review recommends deterministic risk/blocker logic before Gemini. |
| AI only where judgment is needed | Followed | Review narrows AI to structured draft/explanation support. |
| Structured JSON before prose | Followed | Review recommends JSON schema and validation. |
| Human approval before risky actions | Followed | Review requires HITL before external communication. |
| Every decision must be logged | Followed | ADR and task log were read; this session updates task log and state. |
| Every prompt must be versioned | Not applicable | No production prompts were created. |
| Every external action must be auditable | Followed | No external workflow action was taken; auditability is required before build. |
| No fake business impact | Followed | Review labels project as dummy/simulated and avoids impact claims. |
| No real merchant data | Followed | No real data was introduced. |
| No secrets in code | Followed | No secrets were created or used. |
| No duplicate sends | Not applicable | No sends or send workflow were created. |
| No auto-send for high-risk or critical-risk merchants | Not applicable | No send workflow was created. |
| No unsupported revenue claims in outreach | Not applicable | No outreach was generated. |
| No major architecture change without ADR | Followed | No architecture change was made; recommendations only. |
| Every session must update `PROJECT_STATE.md` | Followed | `PROJECT_STATE.md` updated. |
| Every session must complete a compliance audit before stopping | Followed | This file is the session compliance audit. |

## Gaps or Violations

- `ALWAYS_READ.md` is missing.
- `docs/audits/session-compliance-template.md` is missing.
- `docs/audits/codex-compliance-audit.md` is missing.
- V1 acceptance criteria are missing.
- Minimum credible dataset size is undecided.
- The project name includes "agentic" while V1 should be workflow-first.

## Corrections Made

- Created `docs/reviews/open-source-validation-review.md`.
- Created `docs/audits/open-source-validation-compliance-audit.md`.
- Updated `PROJECT_STATE.md`.
- Updated `docs/task-log.md`.
- Updated `docs/open-questions.md`.
- Preserved validation-only scope.

## Remaining Open Questions

- Should `ALWAYS_READ.md` be created as the next task before dataset work?
- Should Supabase schema design remain in V1 or follow a corrected CSV/Sheet prototype?
- What is the minimum credible dataset size for a demo?
- Which fields are mandatory for V1 dataset acceptance?
- What exact risk thresholds trigger human review?
- What acceptance tests must pass before any integration build starts?

## Handoff Notes

Next session should not build integrations. It should create governance and acceptance criteria first:

1. Create `ALWAYS_READ.md`.
2. Create `docs/audits/session-compliance-template.md`.
3. Create `docs/acceptance-criteria/v1-dataset.md`.
4. Define the V1 dataset schema and minimum row count.
5. Only then generate or transform dummy data.

If implementation is later approved, start with data normalization and validation tests, not n8n, Slack, Resend, or Gemini.

## Final Compliance Result

Passed with warnings.

The session stayed validation-only, used official/open sources, created the required validation outputs, updated project state/log/questions, and did not modify the CSV or implement production artifacts. Warnings remain because mandatory governance files are missing and V1 acceptance criteria are not yet defined.
