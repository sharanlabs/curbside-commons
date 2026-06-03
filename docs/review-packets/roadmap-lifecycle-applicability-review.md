# Roadmap Lifecycle Applicability Review

Date: 2026-06-02 · Author: Claude Code (review/planning only — no roadmap written, no code/tests/CSV/`out`/integration touched, nothing installed/adopted). Stage: post-T-001.7, pre-roadmap, pre-T-002. Mode: full-but-narrow.

> Purpose: decide **what roadmap / lifecycle / build-phase terminology should apply to ActivationOps AI** — by discovering broadly first, then classifying each candidate by fit, not by importing a framework because it sounds professional. Frameworks named in the prompt (NIST, DORA, SRE, SSDF, LLMOps, MLOps, agentic…) were treated as **candidates, not commands**.

---

## Post-Codex Revision Note (2026-06-02)

This packet was revised once after the Codex adversarial review (verdict: **needs-revision**, not reject). The source-openness and applicability direction below is sound; these changes were applied:

1. **Eval-first T-002 is now owner-ratified** — the owner approved reordering `plan-reconciliation.md` §6 so the offline evaluation/regression work precedes any live Gemini call. Recorded in `docs/decision-log.md` (2026-06-02). It is an accepted decision now, not a pending recommendation.
2. **T-002 is named "Offline Evaluation and Regression Harness"** (TEVV — Test, Evaluation, Verification & Validation — is kept only as an optional background reference term, never the phase title).
3. **No framework-mapping section in the roadmap by default** — `docs/roadmap.md` stays product-first and short. NIST / GenAI Profile / SSDF / DORA / SRE are internal reference terms only; at most a tiny artifact-tied terminology note, with no "aligned / compliant / enterprise-scale / production-grade" language.
4. **EDD source downgraded** — the Evaluation-Driven Development arXiv paper is a preprint / practice reference, not a standards-grade anchor. Eval-first rests on `RULES.md` §3 (evaluation before claims), the `v1-data-dictionary.md` §9 guardrail-by-construction caveat, the T-001.7 audit, the need for a baseline before Gemini, and regression-testing discipline.

The analysis sections below are point-in-time (pre-Codex); where they read "pending ratification," this note and the `docs/decision-log.md` entry supersede them.

---

## Executive Verdict

**Use industry terminology — but selectively, as honest *mapping*, not as the roadmap's skeleton.** ActivationOps AI has genuinely built the load-bearing parts of an activation workflow (stable identity, deterministic risk/blocker, a human-review **send gate**, structured guardrailed drafting, **provenance + audit logs**, **idempotency**, 23 tests). Several mature terms describe exactly that work and will make the roadmap clearer to a layperson *and* more credible to a technical reviewer: **vertical slice / thin slice, human-in-the-loop (HITL) approval gate, deterministic guardrails, provenance + audit trail, idempotency, evaluation harness / golden dataset / offline evals / regression testing,** and **evaluation-driven development (EDD)**.

The single strongest, multiply-corroborated finding: **an offline evaluation harness should be T-002, before any live Gemini call.** This is supported by the project's own `RULES.md` §3 ("evaluation before claims"), the honesty caveat in the data dictionary §9 (the guardrail currently passes *by construction*, so its robustness is unproven), the recognized industry practice of **evaluation-driven development** ("build your eval harness before you write a single prompt"), and the #1 AI-portfolio red flag ("improvement claimed without a baseline"). It is a small reorder of `plan-reconciliation.md` §6 (which lists live-Gemini before the larger eval set), now **owner-ratified** in `docs/decision-log.md` (2026-06-02). T-002 is the **Offline Evaluation and Regression Harness**.

Equally important is what to **avoid**: SRE / SLO / SLA / error-budget, DORA deploy-frequency/MTTR, "agentic/autonomous agents," and "production-grade / deployed to production / enterprise-scale." On a 20-row offline simulation these are performative — they describe production operations the project does not have, and "deployed to production with no proof" is the most commonly inflated portfolio claim. NIST AI RMF / SSDF / DORA stay **internal reference terms only — never phase names, and not a framework-mapping section carried into `docs/roadmap.md` by default.** The roadmap stays product-first and short.

**Recommendation: Codex adversarial review is complete** (verdict: needs-revision; findings applied in the revision note above), and **eval-first T-002 is owner-ratified.** After owner approval of this revised packet, `docs/roadmap.md` may be written — **product-first and short.** Commit after owner approval (owner decides commits).

---

## Professional Process Applied

Task type: roadmap/lifecycle/build-phase **terminology applicability review** · Stage: post-T-001.7, pre-roadmap, pre-T-002 · Risk: medium (weak terminology makes a roadmap look fake/overbuilt/disconnected) · Mode: full-but-narrow · Basis: repo evidence + broad external source discovery, weighted by the project source tiers + open-source-discovery rule (`RULES.md` §14) · Validation: applicability classification (use-now / later / reference / reject / needs-research) + Codex review before any roadmap is written · Artifact policy: one review packet (commit after review) + state-doc updates; **no** `roadmap.md`, **no** `decision-log` entry (no decision made) · Human approval: required before writing the roadmap or starting T-002.

---

## Sources Searched

Searched 2026-06-02 (US web). Breadth spanned official standards, vendor/eng references, AI-ops, software-delivery practice, and community field-signals — per the open-source-discovery rule (named frameworks = seeds, not boundaries).

**Official / standards (Tier 1):**
- NIST AI Risk Management Framework — Core functions Govern/Map/Measure/Manage — [airc.nist.gov AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/), [nist.gov AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
- NIST AI 600-1, Generative AI Profile (12 GenAI risks mapped to the 4 functions) — [airc.nist.gov GenAI Profile (PDF)](https://airc.nist.gov/docs/NIST.AI.600-1.GenAI-Profile.ipd.pdf), [nvlpubs NIST.AI.600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- NIST SP 800-218 SSDF (Prepare/Protect/Produce/Respond) + 800-218A GenAI profile — [csrc.nist.gov SSDF](https://csrc.nist.gov/projects/ssdf), [csrc.nist.gov SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)
- Google SRE — SLI/SLO/error budget — [sre.google SLO](https://sre.google/sre-book/service-level-objectives/), [sre.google error-budget policy](https://sre.google/workbook/error-budget-policy/)
- DORA four keys — [cloud.google.com DORA](https://cloud.google.com/blog/products/devops-sre/another-way-to-gauge-your-devops-performance-according-to-dora)

**AI-ops / evaluation (Tier 1–3, mixed):**
- LLMOps vs MLOps lifecycle stages — [zenml.io](https://www.zenml.io/blog/mlops-vs-llmops), [lakefs.io LLMOps](https://lakefs.io/blog/llmops/)
- LLM evaluation / golden datasets / regression testing — [braintrust.dev eval guide](https://www.braintrust.dev/articles/llm-evaluation-guide), [langchain.com LLM evals](https://www.langchain.com/articles/llm-evals), [getmaxim.ai golden dataset](https://www.getmaxim.ai/articles/building-a-golden-dataset-for-ai-evaluation-a-step-by-step-guide/)
- Evaluation-Driven Development (EDD) — [arxiv 2411.13768 (EDD process model & reference architecture, **preprint**)](https://arxiv.org/html/2411.13768v2), [Pragmatic Engineer — evals guide](https://newsletter.pragmaticengineer.com/p/evals), [Fireworks — eval-driven dev with Claude Code](https://fireworks.ai/blog/eval-driven-development-with-claude-code)
- Data provenance / model lineage / audit trail — [Snowflake lineage vs provenance](https://www.snowflake.com/en/fundamentals/data-lineage/lineage-vs-provenance/), [mlops-coding-course lineage](https://mlops-coding-course.fmind.dev/7.%20Observability/7.3.%20Lineage.html)

**Software-delivery practice (Tier 2–3):**
- Walking skeleton (Cockburn) / tracer bullet (Thomas) / vertical slice / thin slice — [defmyfunc walking skeleton](https://www.defmyfunc.com/2019_10_18_walking_skeleton/), [barbarianmeetscoding tracer bullets](https://www.barbarianmeetscoding.com/notes/books/pragmatic-programmer/tracer-bullets/), [github spec-kit-tracer](https://github.com/haveard/spec-kit-tracer)

**Human-in-the-loop (Tier 2–4):**
- HITL workflow gate / control gate / approval gate / CI-CD `require_review` analogy — [IBM HITL](https://www.ibm.com/think/topics/human-in-the-loop), [JumpCloud HITL gate](https://jumpcloud.com/it-index/what-is-a-human-in-the-loop-hitl-workflow-gate), [zapier HITL patterns](https://zapier.com/blog/human-in-the-loop/), [n8n HITL automation](https://blog.n8n.io/human-in-the-loop-automation/)

**Community field-signals (Tier 4 — used only as signals, not proof):**
- AI portfolio / case-study red flags (what reads as fake/overbuilt to reviewers) — [learnist AI case-study red flags](https://www.learnist.org/ai-case-study-red-flags-portfolio-2026/), [learnist AI-project CV mistakes](https://www.learnist.org/ai-projects-cv-mistakes-2026/)

## Source Quality Notes

- **Strong anchors (factual claims rest here):** NIST (RMF, GenAI Profile, SSDF), Google SRE, and DORA are Tier-1 (standards-body / framework-owner) and are the basis for any definitional claim about a framework's stages.
- **EDD source = preprint / practice reference, not a standards-grade anchor.** The Evaluation-Driven Development arXiv paper (2411.13768) is an **arXiv preprint** — no formal publication venue or DOI verified — corroborated by practitioner sources (Pragmatic Engineer, Fireworks). Treat it as a practice reference, not a definitional authority. The eval-first recommendation does **not** rest on it; it rests on `RULES.md` §3 (evaluation before claims), the `v1-data-dictionary.md` §9 guardrail-by-construction caveat, the T-001.7 audit, the need for a baseline before Gemini, and regression-testing discipline.
- **AI-ops blogs (LLMOps/eval vendors)** are Tier-2/3 — reputable for *practice and vocabulary* (golden dataset, regression testing, evaluation harness), corroborated across ≥3 independent sources, but vendor-adjacent; used for terminology, not as standards.
- **Portfolio red-flag articles are Tier-4 SEO/field-signal** — they are *not* authoritative. They corroborate, but do **not** establish, the honesty argument. The honesty discipline rests on `RULES.md` §4/§6 (no fake impact, "simulated" labels, UNVERIFIED marking) and the EDD "baseline before claims" point; the blogs are convergent field signal that real reviewers penalize the same things the project already forbids.
- **Where sources disagree:** "walking skeleton" implies an end-to-end path that is *built, deployed, and tested* across integration boundaries; ActivationOps's slice is deliberately offline with **no** integration boundaries wired. So the precise term is **vertical slice / thin slice**, not "walking skeleton" (noted in the matrix to avoid overclaiming an end-to-end deploy that does not exist).

## Project Evidence Checked

- `RULES.md` — esp. §3 order-of-operations (deterministic → structured → decision → human-approval → **evaluation before claims** → logs → cost control) and §4/§6 (honesty, "simulated", UNVERIFIED).
- `docs/plan-reconciliation.md` — §1–9: V1 = one offline slice; "agentic" dropped (§2, §3 agreement #7); §6 deferred-roadmap bucket (live Gemini listed before the larger eval set); §9 Tasks 1–4 (all absorbed by T-001).
- `docs/decision-log.md` — staged architecture, offline V1, reject 14-table schema, drop "agentic," HITL non-negotiable.
- `docs/v1-slice-plan.md` + `docs/v1-data-dictionary.md` — what was actually built: identity, normalization, deterministic risk (validated formula) + blocker, review queue, **send-gating** (`send_eligible = contact_eligible AND (review_required=false OR approved)`), stubbed structured draft, 6-category guardrail, `model_runs` (provenance) + `audit_log` (events incl. simulated send) + idempotency key, 23 tests. **Honesty caveat (§9):** the guardrail passes *by construction* — real robustness is unproven without an eval set.
- `docs/audits/post-playbook-alignment-audit.md` — T-001 closed with minor follow-ups; **recommended next stage = offline eval harness, not Gemini** (a §6 reorder needing ratification).
- `docs/research/source-intake-review.md` — claudex/dynamic-workflows/Obsidian classified (deferred/reject); hooks recommendation; model-freshness gaps documented.

Git (re-derived 2026-06-02): `HEAD = cb80286 "Clarify source openness and sync project state"`; **working tree clean** — the prior governance batch is committed.

---

## Candidate Frameworks and Terms Found

Grouped by where they came from. Each is classified in the matrix below.

1. **Software-delivery slicing:** walking skeleton, tracer bullet, vertical slice, thin slice.
2. **Human-in-the-loop:** HITL, workflow gate, control gate, approval gate, `require_review`.
3. **Evaluation:** evaluation harness, golden dataset / gold set, offline evals, regression testing, "deterministic gate before production," **evaluation-driven development (EDD)**, test-driven development (TDD).
4. **AI-ops lifecycle:** MLOps, LLMOps (development → deployment → monitoring → maintenance), drift/observability/feedback loops.
5. **Provenance:** data provenance, model lineage, audit trail (DAG/OpenLineage as tooling).
6. **Guardrails:** deterministic guardrails, forbidden-claims validation, structured-output validation.
7. **Idempotency:** idempotency key / no-duplicate-send.
8. **Official governance/risk:** NIST AI RMF (Govern/Map/Measure/Manage), NIST GenAI Profile (12 risks), NIST SSDF (Prepare/Protect/Produce/Respond).
9. **Reliability/DevOps:** Google SRE (SLI/SLO/SLA, error budget), DORA four keys.
10. **Agent framing:** agentic / autonomous agents / agentic workflows.
11. **Maturity/release:** alpha/beta/GA, milestones, semver (general practice).

## Applicability Matrix

| Term or framework | Source type | Applicability | How to adapt | Phase | Risk if misused |
|---|---|---|---|---|---|
| Vertical slice / thin slice | Practice (Cockburn/Thomas lineage) | **Use now** | Already the project's word; keep "vertical/thin slice," not "walking skeleton" (no deploy) | Phase 0 (done) | Calling it "walking skeleton" implies wired integrations that don't exist |
| Human-in-the-loop (HITL) / approval gate / control gate | Vendor+practice (IBM/Zapier/n8n) | **Use now** | Describe the send-gate as a HITL approval gate; use the CI-CD `require_review` analogy for laypeople | Phase 0 (done), all later | Implying a live human UI exists in V1 (it's a synthetic approval fixture) |
| Deterministic guardrails / forbidden-claims validation | Practice + project | **Use now** | Keep "deterministic guardrail"; state honestly it passes *by construction* until evals exist | Phase 0 → strengthened in Phase 1 | Claiming guardrail "proven robust" before an eval set |
| Provenance + audit trail | Tier1–3 (Snowflake/MLOps) | **Use now** | `model_runs` = generation provenance; `audit_log` = audit trail. Use both words plainly | Phase 0 (done) | Saying "lineage"/"OpenLineage/DAG" — overbuilt for two CSVs |
| Idempotency / no-duplicate-send | Practice + project | **Use now** | Keep; it's literally implemented and tested (P2-1/T13) | Phase 0 (done) | None material; it's accurate |
| Evaluation harness / golden dataset / offline evals / regression testing | Tier1–3 (arxiv/braintrust/langchain) | **Use now (names the next phase)** | T-002 = "Offline Evaluation and Regression Harness": golden blocker/risk labels + guardrail regression set + metrics | Phase 1 (next) | Calling 20 hand-labeled rows a "benchmark"; overstating coverage |
| Evaluation-Driven Development (EDD) / evaluation-first | Preprint (arxiv) + Tier2 practice | **Use now (as framing)** | Frame the eval-before-Gemini approach as EDD; it extends the TDD the project already does | Phase 1 → spine | Using "EDD" as a buzzword without the actual eval set behind it |
| Test-Driven Development (TDD) | Practice | **Use now** | Already true (23 tests as acceptance criteria); say so plainly | Phase 0 (done) | None |
| LLMOps lifecycle (deploy → monitor → maintain) | Tier2–3 | **Use later** | Applies only once a live model is integrated (Phase 2+): monitoring, drift, feedback | Phase 2+ | Adopting "LLMOps/monitoring/drift" now — there is no live model to operate |
| NIST AI RMF (Govern/Map/Measure/Manage) | Tier1 (NIST) | **Reference only (mapping)** | An internal reference mapping (not a roadmap section): Govern≈RULES/playbook, Map≈data-audit, Measure≈tests/eval, Manage≈guardrails/gating | Cross-cutting (mapping) | Renaming roadmap phases Govern/Map/Measure/Manage = governance theater at 20 rows |
| NIST GenAI Profile (12 risks) | Tier1 (NIST) | **Reference now → use later (light)** | Map guardrail categories to GenAI risks (hallucination, data leakage, false impact) when Gemini lands | Phase 2 (light) | Claiming "NIST-aligned" on an offline stub with no live GenAI |
| NIST SSDF (Prepare/Protect/Produce/Respond) | Tier1 (NIST) | **Reference now → use later** | Relevant when secrets/integrations/supply-chain appear (ties to the CSV/secrets hooks idea) | Phase 2+ | "SSDF-compliant" claim with no integrations/secrets yet |
| Model lineage / OpenLineage / DAG | Tier2–3 | **Reference only** | Vocabulary to *grow into* if model versions multiply; not V1 | Phase 3+ | Tooling overkill for two append-only CSVs |
| MLOps (training/retraining) | Tier2 | **Reject (now)** | No model is trained; "MLOps" misdescribes the work | n/a | Implies model training that never happens |
| Google SRE (SLI/SLO/SLA, error budget) | Tier1 (Google) | **Reject (now), reference later** | Needs a running production service with users/uptime — none exists | Far future (if ever hosted) | "SLO/error budget" on an offline sim = pure performance |
| DORA four keys (deploy freq, lead time, CFR, MTTR) | Tier1 (Google/DORA) | **Reject (now), reference later** | Measures deployment throughput; nothing is deployed | Far future | "Elite DORA performer" with zero deployments |
| Agentic / autonomous agents / agentic workflows | Practice/community | **Reject (now), reference far-future** | Project explicitly dropped "agentic" for V1 (decision-log; reconciliation §3) | Far future (only if true) | #1 overreach; contradicts a recorded decision; reads as hype |
| "Production-grade / deployed to production / enterprise-scale" | Field signal (Tier4) | **Avoid** | It's a *simulation on dummy data*; never claim production | n/a | The most commonly inflated portfolio claim; instant credibility loss |
| alpha / beta / GA, milestones, semver | Practice | **Reference (optional)** | Could version the roadmap mildly (e.g., "V1 slice → V2 eval → V3 model"); don't imply public release | Labeling only | "GA/1.0" implies shipped software with users |

---

## Selected terms — full analysis (use-now / use-later only)

Proportional: the 12-field deep-dive is applied only to the terms actually selected. Reject/reference-only terms are covered by the matrix above.

**1. Vertical slice / thin slice**
- Source checked: defmyfunc (walking skeleton); barbarianmeetscoding (tracer bullets) · Type: practitioner/practice (Cockburn, Thomas lineage) · Date: 2026-06-02 · Means: the thinnest end-to-end slice of real functionality, grown while always kept working. · Applicability: high — T-001 is exactly a thin vertical slice of an activation workflow. · Stage: Phase 0 (done). · Borrow: "vertical/thin slice" as the name for T-001. · Reject: "walking skeleton" (it implies built/deployed/tested across integration boundaries; the slice is offline with none wired). · Adapt: say "offline vertical slice." · Validation: matches `v1-slice-plan.md`. · Risk if misused: overclaiming an end-to-end deployed path.

**2. Human-in-the-loop (HITL) / approval gate / control gate**
- Source: IBM, Zapier, JumpCloud, n8n · Type: vendor + practice · Date: 2026-06-02 · Means: human oversight at predefined high-risk points; a "workflow/control gate" pauses automation until a human approves (the CI-CD `require_review` pattern — "a human reviews the diff and clicks approve" before anything hits production). · Applicability: high — this is precisely the V1 send-gate (`approval_state`, High/ineligible held, never auto-sent). HITL is "most valuable… sending customer communications" — the project's exact domain. · Stage: Phase 0 (done); every later phase. · Borrow: "HITL approval gate"; the CI-CD analogy for laypeople. · Reject: implying a live approval UI (V1 uses a synthetic approval fixture). · Adapt: "human-review gate, proven in V1 without a live UI." · Validation: tests T8/T15/T17. · Risk: overstating the human tooling that exists.

**3. Evaluation harness / golden dataset / offline evals / regression testing**
- Source: arxiv 2411.13768 (preprint), braintrust, langchain, getmaxim · Type: arXiv preprint + Tier2/3 practice · Date: 2026-06-02 · Means: a "golden dataset/gold set" = curated input→expected-output ground truth; "offline evals" run before production against it; "regression testing" detects degradation; an "evaluation harness" runs the benchmark — a *deterministic gate before production*. · Applicability: high — names T-002 exactly (golden blocker/risk labels for the 20 rows + a guardrail regression set + a metrics summary). · Stage: Phase 1 (next). · Borrow: "offline evaluation harness," "golden labels," "regression set." · Reject: "benchmark"/"SOTA" framing (20 hand-labeled rows is a gate, not a benchmark). · Adapt: call it a *small, honest* gate; state coverage limits. · Validation: would extend the existing 23-test discipline. · Risk: overstating coverage or calling it a benchmark.

**4. Evaluation-Driven Development (EDD) / evaluation-first**
- Source: arxiv 2411.13768 (preprint); Pragmatic Engineer; Fireworks · Type: arXiv preprint + Tier2 practice · Date: 2026-06-02 · Means: invert the workflow — define eval metrics + ground truth *before* prompt engineering; "build your evaluation harness before you write a single prompt"; an adaptation of TDD for LLMs. · Applicability: high — this is the rationale for eval-before-Gemini, and the project already practices TDD (23 tests). · Stage: Phase 1 and as the lifecycle spine. · Borrow: "evaluation-driven" / "evaluation-first" as the framing word. · Reject: using "EDD" as a label without the actual eval set behind it. · Adapt: present as "the TDD we already do, extended to the model step." · Validation: RULES §3 "evaluation before claims." · Risk: buzzword-without-substance (the exact portfolio red flag).

**5. Deterministic guardrails / forbidden-claims validation**
- Source: project + LLM-eval blogs · Type: project + Tier2/3 · Date: 2026-06-02 · Means: deterministic checks that reject unsafe model output (here: 6 categories — revenue/metric/impact/PII/urgency/state-mismatch). · Applicability: high — already built and tested (T10/T11/T18/P2-4/P2-5). · Stage: Phase 0 (done), strengthened Phase 1. · Borrow: "deterministic guardrail." · Reject: claiming proven robustness (it passes *by construction* — data dictionary §9). · Adapt: "deterministic guardrail, to be hardened by the eval harness before any live model." · Validation: existing tests + future eval set. · Risk: overstating robustness pre-eval.

**6. Provenance + audit trail**
- Source: Snowflake, MLOps-coding-course · Type: Tier2/3 · Date: 2026-06-02 · Means: provenance = where output came from + its history; audit trail = recorded sequence of events. · Applicability: high — `model_runs.csv` is generation provenance; `audit_log.csv` is the audit trail (a send is an audit event). · Stage: Phase 0 (done). · Borrow: "provenance," "audit trail/log." · Reject: "lineage/OpenLineage/DAG" (overbuilt for two CSVs). · Adapt: "lightweight provenance + append-only audit log." · Validation: data dictionary §10. · Risk: implying enterprise lineage tooling.

**7. Idempotency / no-duplicate-send**
- Source: project + general practice · Type: project · Date: 2026-06-02 · Means: an operation applied repeatedly yields one effect; a duplicate-suppression key. · Applicability: high — implemented (`idempotency_key`) and tested (P2-1/T13). · Stage: Phase 0 (done). · Borrow: keep as-is. · Reject: nothing. · Adapt: none. · Validation: re-run dedup test. · Risk: none material.

**8. LLMOps lifecycle (deploy → monitor → maintain)**
- Source: zenml, lakefs · Type: Tier2/3 · Date: 2026-06-02 · Means: operating live LLMs — deployment, monitoring, drift, feedback loops, prompts/embeddings as first-class. · Applicability: **future** — only once Gemini is live (Phase 2+). · Stage: Phase 2+. · Borrow: "monitoring," "feedback loop" *later*. · Reject: adopting LLMOps/"drift/observability" now (no live model to operate). · Adapt: introduce at model integration. · Validation: n/a until Phase 2. · Risk: operating-a-model vocabulary with no model in operation.

**9–11. NIST AI RMF / GenAI Profile / SSDF (mapping)**
- Source: NIST (airc, csrc, nvlpubs) · Type: Tier1 · Date: 2026-06-02 · Means: RMF = Govern/Map/Measure/Manage (iterative, Govern cross-cutting); GenAI Profile = 12 GenAI risks mapped to those functions; SSDF = Prepare/Protect/Produce/Respond secure-SDLC practices. · Applicability: **reference/mapping now; light use later.** The project already *does* RMF-shaped things (Govern≈RULES/playbook; Map≈data-audit; Measure≈tests/eval; Manage≈guardrails/gating); GenAI-Profile risks (hallucination, data leakage, false impact) map to the guardrail categories when Gemini lands; SSDF applies when secrets/integrations appear (ties to the CSV/secrets hooks idea). · Stage: cross-cutting mapping; GenAI Profile light at Phase 2; SSDF at Phase 2+. · Borrow: keep the NIST mapping as an **internal reference only** — do **not** add a framework-mapping section to `docs/roadmap.md` by default (it reads as enterprise theater at 20 rows). · Reject: NIST functions as **phase names**; "NIST-compliant/aligned" claims (a sim cannot certify). · Adapt: "informed by," not "compliant with." · Validation: cite the specific subcategory only where the project truly does it. · Risk: governance theater; compliance overclaim.

---

## Recommended Roadmap Language

### Terms To Use Now
vertical slice / thin slice · human-in-the-loop (HITL) approval gate / send-gate · deterministic guardrails / forbidden-claims validation · provenance + audit trail · idempotency / no-duplicate-send · offline evaluation harness · golden labels / golden dataset · regression testing · evaluation-driven (evaluation-first) · test-driven (already true) · offline-first / "deterministic before AI" (the project's own framing). **Rule: prefer the plainest term a layperson still understands; pair each with one concrete artifact from the repo.**

### Terms To Use Later
monitoring / observability / drift / feedback loop (Phase 2+, once a live model exists) · LLMOps (Phase 2+) · NIST GenAI-Profile risk mapping (Phase 2, light) · NIST SSDF practices (Phase 2+, when secrets/integrations land) · model versioning/lineage (Phase 3+, if model variants multiply) · webhook idempotency / suppression sync (Phase 4, Resend).

### Terms To Keep as Reference Only (map, don't adopt)
NIST AI RMF Govern/Map/Measure/Manage (governance-mapping sidebar) · NIST GenAI Profile · NIST SSDF · DORA four keys · OpenLineage/DAG · alpha/beta/GA & semver (optional mild versioning).

### Terms To Avoid
SRE / SLO / SLA / error budget (no production service) · DORA deploy-frequency/MTTR as a *current* claim (nothing deployed) · MLOps "training/retraining" (no training) · **agentic / autonomous agents** (explicitly dropped; contradicts a recorded decision) · **"production-grade / deployed to production / enterprise-scale / real impact"** (it's a simulation — the #1 inflated-portfolio claim) · "NIST-compliant," "SOC2/SLA-backed," "benchmark/SOTA" (uncertifiable / overstated at this scale).

## Recommended Build Phases

Anchored to what exists and to `RULES.md` §3 ordering — small, honest, product-named, each gated by human approval + evals + logs. (Phase names are product-first; framework terms are internal reference only, not roadmap sections.)

- **Phase 0 — Offline vertical slice (DONE, T-001).** Deterministic identity, risk, blocker, review queue, HITL send-gate, guardrailed stub draft, provenance + audit logs, idempotency, 23 tests. Offline, dummy data.
- **Phase 1 — Offline Evaluation and Regression Harness (T-002, owner-ratified 2026-06-02).** Golden blocker/risk labels for the 20 rows + a guardrail regression set (planted + real-nudge + per-category) + a metrics summary. Evaluation-first; still offline/deterministic/zero-cost. *De-risks the model swap by giving it a baseline to beat.*
- **Phase 2 — Bounded LLM drafting (Gemini) behind the harness.** Replace the stub with a live model *measured against the Phase-1 baseline*; env-var secrets; an **offline mock** so tests stay offline; GenAI-Profile risk mapping; guardrails hardened with real adversarial cases.
- **Phase 3 — Persistence + provenance at scale (Supabase/Postgres).** Only when one entity CSV + two logs is genuinely outgrown; migrations; the deferred normalized schema as needed.
- **Phase 4 — Human-in-the-loop delivery integrations (Slack approval, Resend send).** Real approval callbacks + real (still rate-limited/test-keyed) send with webhook idempotency + suppression. Full-loop risk.
- **Phase 5 — Orchestration + monitoring (n8n) + outcome learning.** Workflow orchestration, error workflows, monitoring/observability, outcome-learning loop.

Each phase: human-approval gate, evals before claims, logs before confidence, cost control before scale (RULES §3). **The roadmap itself stays product-first and short — do not add a framework-mapping section (NIST / GenAI Profile / SSDF / DORA) by default; on a 20-row offline simulation it reads as enterprise theater and overshadows the product phases. If a reader needs context, add at most a tiny "Terminology note" tying each plain term to a built artifact — with no "aligned / compliant / enterprise-scale / production-grade" language.**

## Recommended Lifecycle

**The project's own `RULES.md` §3 order-of-operations *is* the lifecycle — keep it as the spine and map it to industry terms for credibility:**

deterministic logic → structured outputs → decision → **human approval (HITL)** → **evaluation (EDD/offline evals) before claims** → logs/provenance before confidence → cost control before scale.

This maps cleanly onto **evaluation-driven development** (eval before the model step) and onto NIST RMF **Measure → Manage** (measure with the eval harness, manage with guardrails + the send-gate), without importing a heavyweight MLOps/SRE lifecycle the project cannot yet populate.

## Why This Roadmap Structure Fits ActivationOps AI

- **It describes what exists, not what sounds impressive.** Every Phase-0 term maps to a tested artifact; every later term is gated behind a real trigger. This directly answers the portfolio red flags (baseline-less claims, production-without-proof, buzzwords) with the project's existing honesty discipline (RULES §4/§6).
- **It is legible to two audiences.** A layperson reads "human approval gate, check the draft before it sends, keep a log"; a technical reviewer reads HITL gate, evaluation harness, provenance, idempotency — same artifacts, two registers.
- **It respects recorded decisions.** "Agentic" stays dropped; offline-first holds; integrations stay deferred; the 14-table schema stays a roadmap item — all consistent with the decision log and reconciliation.

## Why Not Gemini First

Cross-validated from four independent directions (two in-repo, two external):
1. **`RULES.md` §3:** "evaluation before claims" and "deterministic logic before AI calls" — Gemini-first inverts the project's own constitution.
2. **Data dictionary §9 (honesty caveat):** the guardrail currently passes *by construction* (stub generator). Its real robustness is **unproven** without an eval set — so a live model would be swapped in with no way to tell if it regressed safety.
3. **Evaluation-Driven Development (industry):** "build your evaluation harness before you write a single prompt"; "you cannot perceive precision/recall by eyeballing one response." A baseline must exist first.
4. **Portfolio credibility (field signal):** "improvement claimed without a baseline" is a top inflated-claim red flag. The eval harness *creates* the baseline that makes any later "the model helps" claim defensible.

`plan-reconciliation.md` §6 lists live-Gemini before the larger eval set, so eval-first is a **reorder of the two**, not a new scope. The owner has **ratified** this reorder in `docs/decision-log.md` (2026-06-02), so the roadmap may encode **T-002 = Offline Evaluation and Regression Harness** as an accepted sequence.

## Risks of Over-Formalizing

- **Governance theater:** renaming phases Govern/Map/Measure/Manage, or stamping "NIST-aligned / SSDF-compliant / SOC2," on a 20-row offline sim **lowers** credibility — reviewers read it as cargo-cult.
- **Operating-a-system vocabulary with no system in operation:** SRE/SLO/error-budget, DORA, LLMOps monitoring/drift all presuppose a deployed service with users; using them now is performative.
- **Buzzword-without-substance:** "agentic," "EDD," "production-grade" used as labels rather than backed by artifacts are the exact red flags reviewers filter on.
- **Process outgrowing product (the project's standing risk):** the packet itself must stay proportional — concise where possible, deep only where it changes a decision. The roadmap should be short and product-named — no framework-mapping section by default (at most a tiny artifact-tied terminology note), not a framework cathedral.

## What Codex Should Challenge

1. Is "vertical slice" honestly *not* "walking skeleton" — am I under- or over-claiming the end-to-end-ness of T-001?
2. Is the eval-first reorder genuinely justified, or am I rationalizing a deviation from `plan-reconciliation.md` §6? Is "T-002 = Offline Evaluation Harness" the right scope/name, or is it scope creep dressed as discipline?
3. Are any "use-now" terms actually overbuilt for 20 offline rows (e.g., is "regression testing" too strong for a 20-row gate)?
4. Is the NIST RMF/SSDF "mapping sidebar" still governance theater even as a sidebar — should it be cut entirely rather than mapped?
5. Did I wrongly reject anything useful (DORA/SRE/agentic) that a fair reviewer would want at least referenced?
6. Is the honesty argument leaning too hard on Tier-4 portfolio blogs rather than RULES §4/§6 + EDD?
7. Does the phase order silently contradict any recorded decision or the reconciliation?
8. Is this packet itself an instance of the over-formalization it warns against?

## Final Recommendation

1. **Should we use official/industry terminology in the roadmap?** **Yes — selectively, as honest mapping,** with the plainest term a layperson understands, each tied to a real artifact. Not as the roadmap's skeleton.
2. **Which terms should become phase names?** Product-first names: *Offline vertical slice → Offline evaluation harness → Bounded LLM drafting → Persistence & provenance → HITL delivery integrations → Orchestration & monitoring.* The load-bearing vocabulary inside them: HITL approval gate, deterministic guardrails, provenance/audit trail, idempotency, evaluation harness, evaluation-driven.
3. **Which terms should stay mapping/reference only?** NIST AI RMF (Govern/Map/Measure/Manage), NIST GenAI Profile, NIST SSDF, DORA, OpenLineage/DAG — as **internal reference only, kept out of `docs/roadmap.md` by default** (at most a tiny artifact-tied terminology note), never as phase names or compliance claims.
4. **What should T-002 be called?** **"T-002 — Offline Evaluation and Regression Harness"** (framed evaluation-driven / evaluation-first): golden labels + guardrail regression set + metrics, fully offline. (TEVV — Test, Evaluation, Verification & Validation — is kept only as an optional background reference term, never the phase title.)
5. **Is offline evaluation before Gemini justified?** **Yes — strongly,** on four independent grounds (RULES §3; the by-construction guardrail caveat; EDD practice as a field signal; the baseline-credibility red flag). It is a §6 reorder, now **owner-ratified** in `docs/decision-log.md` (2026-06-02).
6. **Should the roadmap be created now, after Codex review, or not yet?** **Not yet.** Codex adversarial review of this packet first (focus: over-formalization + term-fit + the eval-first reorder), then revise once, then owner approval, **then** write `docs/roadmap.md`.
7. **Is commit recommended?** **Yes — after owner approval of this revised packet** (review packet + state-doc updates + the new `docs/decision-log.md` eval-first entry; still no `roadmap.md`). The owner approves the commit.

---

### Final output summary

1. **Applicable now:** vertical/thin slice; HITL approval gate; deterministic guardrails; provenance + audit trail; idempotency; offline evaluation harness / golden labels / regression testing; evaluation-driven (evaluation-first); test-driven; offline-first.
2. **Future-only:** LLMOps monitoring/drift/feedback; NIST GenAI-Profile risk mapping (Phase 2); NIST SSDF practices (Phase 2+); model lineage; webhook idempotency/suppression.
3. **Should not be used:** SRE/SLO/SLA/error-budget; DORA as a current claim; MLOps training/retraining; agentic/autonomous agents; "production-grade / deployed to production / enterprise-scale / real impact"; "NIST-compliant / SOTA."
4. **T-002 name:** **Offline Evaluation and Regression Harness** (evaluation-first; TEVV kept only as a background reference term, not the title).
5. **Offline eval before Gemini:** **Justified** (four independent grounds); a §6 reorder, now **ratified** in `docs/decision-log.md` (2026-06-02).
6. **Codex review before roadmap:** **Recommended** (adversarial; over-formalization + term-fit + eval-first reorder).
7. **Commit:** **Recommended after Codex review**, owner-approved; packet + state docs only.

**Stop after this review. No roadmap written. T-002 not started.**
