# ActivationOps AI — Agentic Architecture Blueprint

> **Status: PROPOSED — Codex review COMPLETED (status reconciled 2026-06-12).** The Codex 5.5/xhigh completeness review **ran 2026-06-09** (job `bm0i9bxpy` — NO-SHIP verdict, no P0; 10 findings; the honesty fixes were applied to this doc the same day — the `(Codex P1/P2)` annotations below mark them; deeper acceptance-criteria work was deferred to T-003 build time). Under the **ratified 2026-06-11 Definition of Done** this blueprint serves as the **architecture reference** with **L4 as the designed ceiling, never the completion bar**; the owner has not separately ratified it as *Accepted architecture* (and does not need to for T-003 → Phase 3 → Phase 7 to proceed). `RULES.md` is the constitution; if anything here conflicts with it, `RULES.md` wins.
>
> **What this supersedes (on approval):** the "target architecture" framing in `docs/visuals/architecture.mmd` and the phase framing in `docs/roadmap.md` (both predate V1/T-002 being built and are stale). It **extends, does not contradict,** `docs/decisions/ADR-001-initial-architecture.md` (staged, deterministic-first, controls-before-integration).
>
> **Honesty (RULES §4):** ActivationOps AI is a **simulation on dummy data**. No real DoorDash/marketplace access, no real merchants, no real sends; every metric is **simulated**. Diagrams and phases label **built vs. target**. Framing is **human-led, AI-assisted, professionally reviewed** — never "AI built this."

---

## 1. Purpose of this document

A single, source-grounded architecture for evolving ActivationOps AI from its proven **offline deterministic thin slice** into a **bounded, human-in-the-loop (HITL) agentic system** — built the way a professional enterprise AI team would: every design choice traceable to **multiple validated sources** and a reason, every autonomy increase **earned** by guardrails + evidence, nothing overclaimed.

This is the **text** blueprint. Its companion **visuals** live in `docs/visuals/` (built-vs-target, data flow + lineage, agent workflow, control points, eval harness, governance flow, sequence, threat model). The **roadmap** (`docs/roadmap.md`) sequences delivery.

---

## 2. System classification (what kind of AI system this is)

Choosing the right canon depends on naming the system honestly:

- **Domain:** operational workflow automation for merchant **onboarding/activation** (spot stalled merchants → diagnose blocker → recommend next action → route risky cases to a human → draft approved outreach → track outcomes).
- **Type:** a **human-in-the-loop, tool-using, bounded agentic workflow** — *not* an autonomous multi-agent swarm. Per Anthropic's distinction [S1], today it is a **workflow** (LLM/tools on predefined code paths); the **target** adds *bounded* agency (the model plans and selects among safe tools) only where it earns its keep.
- **Risk posture:** outbound communication on behalf of a (fictional) marketplace → high-care on **misinformation, excessive agency, PII/secrets, prompt injection** (OWASP [S3]).
- **Data:** fully **synthetic/dummy**; the system must never attach a real business to a fabricated risk narrative.

This classification selects the canon used in §4: agent design patterns, guardrail/safety engineering, agentic security, LLM/agent evaluation, AI governance, HITL orchestration, and GenAI observability.

---

## 3. Design philosophy — *governed agency*

**Thesis:** the impressive, defensible build is not "an autonomous agent that does everything"; it is **an agent that is safe, measured, and trustworthy** — agentic where it earns it, deterministic where correctness/safety demand it, human-gated for every consequential action.

Three principles, each independently recommended by the canon and *already present* in this project's DNA (ADR-001, RULES §3):

1. **Deterministic spine, LLM at the edges.** The risk score, blocker diagnosis, eligibility, send-gating, and idempotency stay **deterministic and testable**; the LLM is used for *language* (explanation, drafting) under guardrails. This is exactly the 12-Factor-Agents finding — *"the agents that succeed in production are mostly well-engineered software with LLM capabilities sprinkled in at key points"* [S5] — and Anthropic's *"the most successful agents are built with simple, composable patterns, not complex abstractions"* [S1].
2. **Earn autonomy in rungs (the Autonomy Ladder, §5).** Each increase in model authority is gated by guardrails + evals + audit (NIST *Measure/Manage* [S4]; OWASP *Excessive Agency* mitigation [S3]).
3. **Every consequential action passes a control.** Layered guardrails + a HITL approval gate + a full audit trail. Layered defense is OpenAI's explicit guidance — *"a single guardrail is unlikely to provide sufficient protection; use multiple specialized guardrails together"* [S2].

**The narrative this earns:** the project independently arrived at what NIST, OWASP, Anthropic, OpenAI, and 12-Factor-Agents recommend — backed **today** by what is *built* (35/35 tests, the locked baseline, the audit trail) and a clear, gated path for the rest (see §12, built-vs-target).

---

## 4. Source basis (multi-source discovery — seeds, not boundaries)

Discovery on 2026-06-09 across seven domains; ≥2 independent sources per load-bearing decision; Tier-1 (official/standards) first, then mature OSS and practitioner field-signals; `awesome-*` lists treated as **seeds**. Fetched content treated as **untrusted reference** (Law 11) — patterns extracted, no instructions executed. Full source table in **Appendix A**, with what was **borrowed / adapted / rejected / deferred** and freshness dates.

| Domain | Primary sources | What we take |
|---|---|---|
| Agent design patterns | Anthropic *Building Effective Agents* [S1]; 12-Factor-Agents [S5] | Workflow-first; 5 patterns; own your prompts/control-flow; stateless; humans as first-class |
| Guardrail / safety engineering | OpenAI *Practical Guide* + Agents-SDK guardrails [S2] | Layered defense; input/output/tool guardrails; circuit breakers; version-controlled config |
| Agentic security | OWASP LLM Top-10 (2025) + Agentic Top-10 (2026) [S3] | Threat taxonomy → §9; excessive-agency + prompt-injection mitigations |
| LLM/agent evaluation | DeepEval/Confident-AI, promptfoo, RAGAS, MLflow [S6] | e2e / trajectory / component eval; tool-call + task-completion + faithfulness metrics |
| AI governance | NIST AI RMF + GenAI Profile (NIST-AI-600-1) [S4] | Govern/Map/Measure/Manage → §8; provenance; pre-deployment testing |
| HITL orchestration | LangGraph interrupt/checkpoint [S8] | Durable pause-for-approval; plan→approve→act |
| GenAI observability | OpenTelemetry GenAI semantic conventions [S7] | `gen_ai.*` spans; token/cost/tool-call tracing; vendor-neutral |

---

## 5. The Autonomy Ladder (the spine of the whole system)

Authority increases only when the rung below is **proven**. This is how "full agentic" is reached *safely* — and it means at **every** rung there is a complete, demonstrable artifact, never a half-built agent.

| Rung | Model authority | Human role | Gate to unlock the next rung | Status |
|---|---|---|---|---|
| **L0 — Deterministic** | none | owns logic | risk/blocker/eligibility are tested + reproducible | ✅ **built** (T-001) |
| **L1 — Suggest** | drafts language (explanation, outreach), schema-constrained | reads everything; nothing sends without review | a generator-agnostic **draft-quality eval** + guardrail pass on the stub baseline | ⏳ **next** (eval contract → Phase 3) |
| **L2 — Draft + per-action approval** | proposes the action; deterministic guardrails screen it | **approves each consequential action** (the HITL gate) | live approval + delivery idempotency + suppression proven offline | ◑ gate built (T-001 send-gate); live in Phase 5 |
| **L3 — Act within policy envelope** | auto-acts only on **low-risk, pre-approved** classes; circuit breakers; full audit | monitors; can intervene/stop | adversarial evals + incident runbook + observability in place | ○ target |
| **L4 — Bounded multi-step planning** | plans + selects among **safe, documented tools** (orchestrator-worker [S1]); per-tool guardrails | sets policy; reviews trajectories | trajectory evals green + threat-model controls verified | ○ ceiling (target) |

Mapping to the canon: rungs operationalize OWASP's *Excessive Agency* mitigation (minimize permissions, require approval for high-impact actions) [S3], Anthropic's "add agency only when simpler approaches demonstrably underperform" [S1], and NIST *Manage* (trade-offs on residual risk) [S4].

---

## 6. Target architecture — layers

A layered architecture; the deterministic core and the control/eval/audit layers are the agent's **tools and safety rails**, not afterthoughts.

### 6.1 Data & lineage layer
- **Add-alongside v1/v2** (decision-log 2026-06-09; Codex-confirmed). **v1** = the original 20-row CSV + `golden_merchants.v1.json` + `test_t001`/`test_t002`, **frozen** as the regression proof asset (hash-pinned; untouched). **v2** = a de-identified, **"Curbside Commons"** hybrid demo/eval lane: a permissively-licensed open business dataset (fetched **once**, normalized, **de-identified**, frozen + **hash-pinned**) + a **synthetic edge-case overlay** (opted-out, suppression, malformed email, a guardrail-rejected draft). New artifacts: `DEMO_CSV`, `golden_merchants.v2.json`, `eval_baseline.v2.json`, `tests/test_t003.py`.
- **Demo schema / overlay:** the v2 lane needs explicit `email_opt_in_status`, `suppression_reason`, and contact fields the current `normalize_row()` **hardcodes** (`pipeline.py:268`) — a CSV rename alone cannot exercise the safety paths (Codex P1).
- **Provenance & lineage:** every generated artifact carries `prompt_version`, `model_version`, `schema_version`; append-only `model_runs.csv` (generation provenance) + `audit_log.csv` (event trail). Source hash pinned in each golden. (NIST *Content Provenance* [S4].)
- **Data classification:** all data **synthetic/dummy**; contacts `@example.com`; **de-identification mapping** retained internally; no real business identity ever enters a risk narrative.

### 6.2 Deterministic core (the trusted tools)
- Risk score (transparent formula, versioned), reason codes, blocker diagnosis (`STEP_MAP`), contact-eligibility, review routing, send-gating, idempotency key. **Pure, tested, reproducible** (no wall-clock, no network, no randomness). These become the **typed tools** the agent may call — 12-Factor "tools are just JSON and code" [S5].

### 6.3 Agent / LLM layer
- **Today (L1):** one **schema-constrained drafting step** replacing the stub `make_draft()` — bounded output (explanation, blocker summary, subject, body), no free-form tool use. Patterns: **prompt chaining** (diagnose → draft) and **evaluator-optimizer** (draft → guardrail/eval → revise) [S1].
- **Target (L4):** a **single bounded agent** using **orchestrator-worker** [S1] over the deterministic tools; **own the prompts and control flow**, **stateless** turns, **explicit context-window management**, **JSON extraction** as the interface [S5]. Multi-agent frameworks are **deferred** (Anthropic: prefer the simplest pattern that works [S1]).
- **Model policy (doctrine):** Gemini at the **current latest** model, **freshness-checked at use**, spend **<$5**; an **offline mock** keeps tests deterministic; **free/OSS alternative** named (local Llama/Mistral via Ollama) so the design isn't vendor-locked.

### 6.4 Guardrail & control layer (layered defense [S2])
- **Rules layer:** the existing regex guardrails — `forbidden_revenue_claim`, `unsupported_metric`, `false_impact_claim`, `pii_or_secret`, `aggressive_urgency` — plus **`false_impact_claim` parameterized to match BOTH `PLATFORM_NAME` and real marketplace names** (DoorDash/Uber Eats/Instacart) defensively, with comparative negatives ("like DoorDash") that must not over-flag (Codex P1).
- **State-consistency:** structural + prose checks that the draft can't claim a not-yet-completed step or contradict the merchant's facts.
- **Model/semantic layer (target):** an LLM-judge / moderation pass for what regex can't catch [S2].
- **Tool guardrails + circuit breakers (target):** per-tool validation; max-iteration/no-progress → **escalate to a human** [S2]; least-privilege tool scopes.
- **Sequence:** generate → **schema-validate** → **guardrail** → (fail ⇒ reject + log + route to review) → eligible for the approval gate. Improper-output handling is closed *before* anything leaves the system (OWASP #5 [S3]).

### 6.5 Human-in-the-loop approval layer
- The **approval gate** is the project's load-bearing safety control: **High-risk or ineligible** merchants are **held** — none reaches a (simulated) send without explicit approval; low/medium contact-eligible merchants simulate-send under deterministic policy. Sends are **idempotent**. *(Accurate scope: the gate governs review-required rows, not every row — today 12 of 20 simulate-send without approval, 8 are held.)*
- **Target pattern:** durable **interrupt/checkpoint** — the run pauses, surfaces the structured plan/draft for approval, and resumes from the checkpoint on decision, without losing context [S8]. "AI handles the tedious 80%; a human makes the final call" [S8].

### 6.6 Evaluation & quality layer (extends T-002)
- **Generator-agnostic draft contract** (the real pre-Gemini baseline): scores the four generated fields on **state-consistency, structure, policy** — runs **unchanged** on the stub now and Gemini later. Uses **independent paraphrased fixtures not produced by `make_draft()`** so it can't encode stub phrasing (Codex P1).
- **Two scoring tracks (Codex P1):** **blocking regression** (must stay 100% — the regression armor) vs **adversarial probes** (measured catch-rate; a miss is a **recorded finding requiring triage**, never a silent pass).
- **Eval levels (agent target) [S6]:** **end-to-end** (task success), **trajectory** (was the path/tool-use sound), **component** (which tool/step failed) — with tool-call accuracy + task-completion + faithfulness metrics.
- **Baseline discipline (RULES §3 "evaluation before claims"):** versioned `eval_baseline.*.json`; Phase-3 model must **meet or beat** the recorded baseline behind the guardrails.

### 6.7 Observability & audit layer
- **Today:** append-only `audit_log.csv` + `model_runs.csv` + `cost_estimate_usd`.
- **Target:** emit **OpenTelemetry GenAI spans** (`gen_ai.request.model`, `gen_ai.usage.*_tokens`, tool-call + cost attributes) [S7] so every agent step is traceable; **OSS** backends (Langfuse / Arize Phoenix) named over paid (Datadog) per the cost doctrine. NB: OTel GenAI semconv is **experimental as of 2026-03** — freshness-check at adoption (RULES §6).

### 6.8 Security & secrets layer
- **Secrets:** env-vars / secret manager only; **blocking commit-time secrets hook** (path/staged-file-aware; allows the repo's own sentinel at `eval.py:46`, blocks real credentials) (Codex P2).
- **Prompt-injection defense (OWASP #1 [S3]):** treat all external/model-adjacent text as untrusted; the model never triggers a tool/send directly — deterministic gates + HITL stand between model output and any action.
- **Least privilege / identity (target):** scoped, per-tool credentials; no shared agent identity (OWASP agentic: *delegated identity abuse* [S3]).

### 6.9 Integration layer (roadmap — gated; free/OSS alternative named per the doctrine)

| Capability | Paid/default (roadmap) | Free / OSS alternative | Gate to add |
|---|---|---|---|
| Bounded drafting | Gemini | local Llama/Mistral via Ollama | eval baseline exists (L1) |
| State store | Supabase Postgres | self-hosted Postgres / SQLite | one-file+logs outgrown |
| Approval UI | Slack | Mattermost / email reply | offline HITL proven |
| Delivery | Resend | SMTP / self-hosted | approval + idempotency proven |
| Orchestration | n8n (already OSS) | Temporal / plain code | delivery stable |
| Tracing | Datadog | Langfuse / Arize Phoenix (OSS) | agent layer exists |

---

## 7. (moved) — see §8 Governance and §9 Threat model

## 8. Governance mapping — NIST AI RMF + GenAI Profile [S4]

| NIST function | How ActivationOps AI satisfies it |
|---|---|
| **Govern** | `RULES.md` (constitution), Enterprise Delivery Playbook, `decision-log.md`, dual-model review, owner approval gate; operating doctrine (model/cost/honesty) |
| **Map** | `data-audit.md`, this blueprint's classification (§2), the threat model (§9) — context, who's affected, where risk arises |
| **Measure** | the eval harness (T-002 + the draft contract + adversarial probes), versioned baselines, "evaluation before claims" (RULES §3) |
| **Manage** | layered guardrails, the HITL approval gate, circuit breakers, audit trail, the autonomy ladder's earned-promotion gates; honesty/UNVERIFIED for incident/claim disclosure |

GenAI-Profile risks explicitly handled: **confabulation** (state-consistency guardrail + draft contract), **data privacy/PII** (`pii_or_secret` + secrets hook + `@example.com`), **harmful/again-claim** (`false_impact_claim`), **information integrity** (no real business in a fabricated narrative).

## 9. Threat model — OWASP LLM Top-10 (2025) + Agentic Top-10 (2026) [S3]

| Threat | Mitigation in this architecture |
|---|---|
| Prompt Injection (#1) | model output never triggers actions directly; deterministic gate + HITL between model and any send; external text untrusted |
| Sensitive Info Disclosure (#2) | `pii_or_secret` guardrail; blocking secrets hook; synthetic contacts only |
| Improper Output Handling (#5) | schema-validate + guardrail before anything leaves; reject+log on fail |
| **Excessive Agency (#6)** | the **Autonomy Ladder**; bounded tools; least privilege; HITL approval; circuit breakers |
| Misinformation (#9) | state-consistency + `false_impact_claim`; draft contract; "simulated" labels |
| Unbounded Consumption (#10) | cost cap (Gemini <$5), max-iteration/circuit breaker, offline-by-default |
| Agentic: uncontrolled autonomy | promotion gates; nothing above L2 without earned evidence |
| Agentic: delegated identity abuse | scoped per-tool credentials; no shared identity (target) |
| Agentic: cross-agent prompt injection | single bounded agent for now; sanitized inter-step state |

## 10. Cost model (doctrine)
- Deterministic core + offline eval = **$0** (stdlib, no network).
- Bounded drafting: **Gemini <$5**, freshness-checked at use; offline mock for tests.
- Observability/state/delivery: **OSS-first** options keep the floor near $0; paid services are roadmap + gated.

## 11. Enterprise-scale path (current → enterprise, per component)
CSV files → Postgres/Supabase with migrations · stub/single drafting → bounded orchestrator-worker agent · simulated send → rate-limited Resend with delivery idempotency · no UI → Slack approval callbacks · local unittest → **eval-gated CI** · file audit → OTel + queryable store · single workspace → multi-tenant with per-tenant policy. Each upgrade has a **named trigger** (don't build enterprise complexity before the simpler layer proves value — ADR-001).

## 12. Built vs. target (honesty snapshot)
- **Built today:** L0 deterministic core; the approval **gate**; stub drafting; offline guardrails; T-002 eval harness + baseline; audit/provenance logs; 35/35 tests + eval PASS.
- **Target (not built):** bounded Gemini drafting (L1) · live HITL delivery (L2) · policy-envelope auto-act (L3) · bounded planning/tool-use (L4) · OTel tracing · datastore · Slack/Resend/n8n. All **gated**, sequenced in `docs/roadmap.md`.

## 13. Open questions / decisions for the owner
1. **Ambition confirm:** L4 (bounded multi-step planning) as the stated ceiling — yes, or stop at L2/L3?
2. **Open dataset choice** for the v2 lane — a **Source-Intake** decision at build time (license · PII · quality · freshness), Codex-reviewed (Codex process finding).
3. **Platform name** "Curbside Commons" — 2-minute trademark/web non-collision check **before any public post** (owner; RULES §6).
4. **Repo-public scrub:** the original DoorDash CSV stays as the frozen v1 fixture — decide whether a public release relocates/annotates it (pre-post step, not a build blocker).

---

## 14. Reliability, Operations & Production-Readiness

Cross-checked against production-readiness checklists [S9, S10]; grounded in [S1, S2, S5]. Most of this is **target** (the live phases); it is specified now so the autonomy ladder doesn't outrun its operational controls.

- **14.1 Reliability & failure handling.** Error taxonomy → response: **(a) transient** (network, rate-limit, 5xx) → bounded exponential-backoff retry; **(b) structural** (malformed JSON / schema-invalid) → **one** bounded "repair" re-prompt, else reject; **(c) semantic** (guardrail / state failure) → **no retry**, route to human/review. **Graceful degradation:** the deterministic **stub drafter is always available offline** — on any model/provider failure the pipeline falls back to it and still produces a safe, guardrailed output rather than collapsing [S2, S5, S10].
- **14.2 Prompt strategy & lifecycle.** Versioned prompt templates (`prompt_version` is already in the schema); **instruction vs merchant-data separation** (merchant text is untrusted *data*, never instructions); prompt changes are reviewed like code — version-controlled, eval-gated, and **rollback-able** [S2, S5, S10].
- **14.3 Agent memory & state.** L0–L2 are **stateless per merchant** (12-Factor "stateless agent" [S5]); durable state lives in the deterministic store (`merchants`, `audit_log`, `model_runs`), **not** in model memory. L4 planning uses **bounded, explicit context**; durable checkpointing (LangGraph/Temporal-style [S8]) only if long-running flows demand it.
- **14.4 Identity & access (agents as non-human identities).** A future agent is a **first-class non-human identity** with its own **scoped, least-privilege** credentials per tool — never running under a human's shared credentials (the key agentic access-control decision) [S3, S9].
- **14.5 Sandboxed & gated execution.** Tools run **sandboxed** [S1]; the model **never** triggers a side-effecting action (send/write) directly — deterministic gates + the HITL approval stand between model output and effect. **Prompt injection is treated as unsolved** → durable controls are privilege-containment + provenance + HITL, *not* filtering alone [S3, S9].
- **14.6 Operational controls.** For the live phases: **feature flags + staged rollout + a kill switch** (disable the model/feature by flag) + an explicit **budget cap** (Gemini <$5; halt on runaway). Structured per-call telemetry: feature · step · model · `prompt_version` · tokens · latency · retry count · error class · fallback class · guardrail flags · post-output human action [S7, S9, S10].
- **14.7 Incident response & ownership.** A pre-written **runbook** (provider outage · cost runaway · prompt rollback · model rollback · feature-flag kill · pause criteria · honest disclosure). A named **owner per area**: prompts · model config · eval data · cost budget · incident response · feedback triage (the human owner today; explicit as the team grows) [S4, S9, S10].
- **14.8 CI quality gate.** Eval-gated CI: tests + `scripts/eval.py` + the draft contract + guardrail probes pass before merge; **blocking pre-commit hooks** for secrets + git-state (T-003c); staged rollout + a scheduled post-launch review [S9, S10].
- **14.9 Eval under non-determinism.** LLM output is non-deterministic → CI uses an **offline mock** for determinism; live model output is judged with **multiple samples + tolerance bands** and an **LLM-as-judge with its own reliability checks**; a probe miss is a recorded finding, never a silent pass [S6, S10].

## 15. Explicit non-goals / deliberately deferred (named, not forgotten)

A professional architecture states what it is **not** doing, with the trigger that would revisit it:

- **RAG / external knowledge retrieval** — deferred; drafting needs structured *merchant facts*, not document retrieval. **Trigger:** drafts must cite policy/playbook knowledge.
- **Multi-agent orchestration** — deferred; a **single bounded agent** is the simplest pattern that works [S1]. **Trigger:** a task genuinely needs specialized parallel sub-agents.
- **Fine-tuning / custom models** — deferred; prompting + guardrails + eval suffice. **Trigger:** bounded prompting can't hit the quality bar.
- **Multi-tenancy / low-latency real-time** — deferred to the enterprise-scale path; the simulation is single-workspace, batch.
- **Live runtime data APIs** — **no-shipped** (prior Codex review): non-deterministic, breaks the golden eval, and is a public-honesty risk.

---

## Appendix A — Sources (checked · used · rejected/deferred; freshness 2026-06-09)

| # | Source | Tier | Used for | Borrow / Adapt / Reject |
|---|---|---|---|---|
| S1 | Anthropic — *Building Effective AI Agents* | 1 | workflows-vs-agents; 5 patterns; "simplest that works"; sandbox+guardrails | **Borrow** patterns; **adapt** to single bounded agent |
| S2 | OpenAI — *Practical Guide to Building Agents* + Agents-SDK Guardrails | 1 | layered defense; input/output/tool guardrails; circuit breakers; HITL approval; version-controlled config | **Borrow** guardrail model + circuit breakers |
| S3 | OWASP GenAI — LLM Top-10 (2025) + Agentic Top-10 (2026) | 1 | threat taxonomy → §9; excessive-agency mitigations | **Borrow** as the threat-model backbone |
| S4 | NIST — AI RMF + GenAI Profile (NIST-AI-600-1) | 1 | Govern/Map/Measure/Manage; provenance; pre-deployment testing → §8 | **Adapt** to our scale (lightweight mapping, not certification) |
| S5 | 12-Factor Agents (Horthy / HumanLayer) | 3 (mature OSS, widely cited) | own prompts/control-flow; stateless; JSON; humans first-class | **Borrow** principles; **reject** nothing material |
| S6 | DeepEval / promptfoo / RAGAS / MLflow agent eval (2026) | 2–3 | e2e/trajectory/component eval; tool-call + task-completion metrics | **Adapt** levels to our offline harness; **defer** tool adoption (build vs buy at L4) |
| S7 | OpenTelemetry — GenAI Semantic Conventions | 1 (standards) | `gen_ai.*` spans; token/cost/tool tracing | **Adopt** as the observability schema; **note** experimental status (freshness) |
| S8 | LangGraph — HITL interrupt/checkpoint | 3 | durable pause-for-approval pattern | **Borrow** the pattern; **defer** framework adoption (plain code may suffice) |
| S9 | AI-agent production-readiness & security checklists (Maxim AI, iternal, Cloud9, Agentex) | 4 (field-signal, corroborated) | reliability, fallback paths, agent-as-NHI, sandboxing, ops controls → §14 | **Borrow** the checklist; corroborated vs S1/S2/S4 |
| S10 | LLMOps production checklists (Maxim, Moments Log, Portkey, MLflow LLMOps, ZenML) | 3–4 | retries-by-type, fallbacks, circuit breakers, prompt mgmt, incident runbook, cost → §14 | **Borrow** patterns; **adapt** to offline-first |

**Rejected / deferred:** live *runtime* public-data APIs (prior Codex no-ship — non-deterministic, breaks golden eval); multi-agent frameworks (CrewAI/AutoGen — unnecessary complexity now, Anthropic [S1]); heavy paid tracing (Datadog) in favor of OSS. Community/practitioner posts used as **field signals only**, corroborated against Tier-1 where load-bearing.

## Appendix B — All-aspects completeness checklist

**Legend:** ✅ = *addressed in this blueprint* (either **built** or **specified-as-target**) — it does **not** mean "built." See §12 for the built-vs-target split.

Data model ✅ · data lineage/provenance ✅ · deterministic core ✅ · agent/LLM layer ✅ · prompt strategy ✅ · guardrails (rules+semantic+tool) ✅ · HITL approval ✅ · evaluation (regression + adversarial + trajectory) ✅ · observability/tracing ✅ · audit trail ✅ · secrets/security ✅ · prompt-injection defense ✅ · identity/permissions ✅ · cost ✅ · governance mapping ✅ · threat model ✅ · integrations (gated, OSS alt) ✅ · autonomy ladder ✅ · enterprise-scale path ✅ · honesty/built-vs-target ✅ · sources/freshness ✅ · open decisions ✅ · reliability/error-handling ✅ · retries+fallbacks+circuit-breakers ✅ · graceful-degradation-to-stub ✅ · prompt lifecycle/versioning ✅ · agent memory/state ✅ · agent identity (NHI) ✅ · sandboxed execution ✅ · operational controls (feature-flag/kill-switch/budget-cap) ✅ · incident runbook + ownership ✅ · CI quality gate ✅ · eval-under-non-determinism ✅ · explicit non-goals ✅.
*(If the owner or Codex names an aspect not above, add it — this list is meant to be falsified, not trusted.)*
