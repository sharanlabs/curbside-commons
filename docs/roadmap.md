# ActivationOps AI Roadmap

> ActivationOps AI is a **simulation on dummy merchant data** — a **human-led, AI-assisted, professionally reviewed** build. It models a merchant-onboarding "nudge" workflow for a **fictional** marketplace (**"Curbside Commons"**); real marketplaces (DoorDash/Uber Eats/Instacart) are referenced only as **comparisons**, never as the project's identity. No real systems, merchants, or outreach; every metric is **simulated**.
>
> **North-star (set 2026-06-09):** a **bounded, human-in-the-loop *agentic* system** — agentic where it earns it, deterministic where safety/correctness demand it, human-gated for every consequential action. Architecture detail: [`docs/architecture/agentic-architecture-blueprint.md`](architecture/agentic-architecture-blueprint.md). The ladder below is how authority would be earned **safely**, one rung at a time — and it is the **designed ceiling, not the completion bar**.
>
> **⚠️ SUPERSEDED 2026-06-19 (owner full-liberty GO; plan approved):** the canonical goal/DoD/phases now live in **`~/.claude/plans/gentle-forging-starlight.md`** (+ decision-log 2026-06-19 row) — a rebuild to a real, industry-adoptable, **deployed Next.js/TS desktop AI product** with real bounded Gemini + the eval harness as spine + hybrid data, equal-weight Strategy/Ops/BA & deep applied-AI, a full why-chain, universally legible, desktop-only. The **use case (merchant activation), deterministic-first→bounded-LLM, eval-first, free-first, prototype-not-service, and honesty all carry forward**; the *delivery shape* changed (Python-CLI+docs → deployed product). The block below is **historical**.
>
> **Definition of Done (ratified 2026-06-11, owner GO):** the project is **complete** when a company-agnostic public repo holds an **on-demand prototype** (a prototype solving a use case — no 24/7 operation, hosting, or ops) for **merchant onboarding & activation on a local-commerce delivery marketplace**: deterministic triage · bounded Gemini drafting (best current model, **<$5 total**; everything else free/free-tier) measured against the **v2 baseline** · human approval gate · idempotent simulated sends · a walkthrough showing the **hold / reject / send** paths (the **reject** path, until Phase 3's live model, is demonstrated via an **S4 eval-corpus replay** of a planted bad draft the guardrail catches — labeled as an injected case, since the deterministic stub can't produce a live rejection; see T-003·S3) · public docs honestly separating built from designed. **Done = T-003 → Phase 3 → Phase 7 (pulled forward).** Phases 4–6 are **optional roadmap**, re-decided by the owner only after Phase 3 evidence. Effort: **auto-adjusted by task** (ship-gating/high-risk → max; supersedes the earlier "max every stage" — `docs/decision-log.md` 2026-06-12).

Last updated: 2026-06-11 (Definition of Done ratified; Phases 4–6 → optional; Phase 7 pulled forward to directly after Phase 3).

## Current Status

- **Phases 1–2 are built and green.** The offline pipeline normalizes the dummy CSV, scores risk deterministically, diagnoses blockers, queues high-risk merchants for human review, writes one guardrailed draft per merchant, and records a *simulated*, non-duplicating send with a full audit trail (Phase 1 / T-001). The **offline evaluation + regression harness** with golden labels and a locked baseline is built (Phase 2 / T-002).
- **Tests: 35/35 pass** (`python3 -m unittest tests.test_t001 tests.test_t002`); eval `python3 scripts/eval.py` → `MERCHANT 20/20 | GUARDRAIL 45/45 | PASS`.
- **The original CSV is protected** — read-only, byte-identical before/after every run; hash-pinned in the golden file.
- **Fully offline.** No live model, API, email, Slack/Resend/Supabase/n8n. The draft generator is a deterministic stub.
- **Next: T-003 — pre-agentic hardening** (de-brand to Curbside Commons; the add-alongside v1/v2 data split; a generator-agnostic draft-quality contract; adversarial guardrail probes; blocking secrets + git-state hooks). Then Phase 3 (bounded LLM drafting).

## The Autonomy Ladder (how "agentic" is earned)

Authority increases only when the rung below is **proven** by guardrails + evals + audit. At every rung there is a complete, demonstrable artifact — never a half-built agent.

| Rung | Model authority | Human role | Status |
|---|---|---|---|
| **L0 — Deterministic** | none | owns logic | ✅ built (Phase 1) |
| **L1 — Suggest** | drafts language under guardrails | reads all; nothing auto-sends | ⏳ next (T-003 → Phase 3) |
| **L2 — Draft + per-action approval** | proposes the action | approves each consequential action | ◑ gate built (offline); live form optional (Phase 4) |
| **L3 — Act within policy** | auto-acts on low-risk pre-approved classes; circuit breakers | monitors; can stop | ○ optional (post-Phase-3 owner decision) |
| **L4 — Bounded multi-step planning** | plans + uses safe documented tools (orchestrator-worker) | sets policy; reviews trajectories | ○ designed ceiling — never the completion bar |

## Product Lifecycle

Every stage moves through the same loop:

**Discover → Source Intake → Plan → Build → Validate → Review → Document → Handoff → Decide Next Stage**

- **Discover** — name the problem and the smallest useful next step.
- **Source Intake** — evaluate any outside idea/tool/pattern before using it; nothing adopted by default; **multiple validated sources**, not one.
- **Plan** — write a short, testable plan. **Build** — one small slice. **Validate** — prove it with tests + real output.
- **Review** — Codex (5.5/xhigh) challenges the work; the human owner decides. **Document → Handoff → Decide** — repo stays the source of truth.

## Build Phases

Product-first, mapped to the autonomy ladder. Governance, evaluation, guardrails, HITL, security, observability, and cost are **cross-cutting** — applied every phase, not a phase of their own.

| Stage | Item | Rung | Status |
|---|---|---|---|
| Foundation | Operating model + governance (RULES, playbook, dual-model review) | — | Done |
| Phase 1 | Offline Vertical Slice (T-001) | L0 | **Done** |
| Phase 2 | Offline Evaluation & Regression Harness (T-002) | L0 | **Done** |
| Phase 2.5 | **T-003 — Pre-agentic hardening** (de-brand · v1/v2 split · generator-agnostic draft contract · adversarial probes · blocking hooks) | L0→L1 | **Next** |
| Phase 3 | Bounded LLM Drafting (Gemini behind guardrails, eval-gated) | L1 | Planned — **in the DoD** |
| Phase 7 | Public Demo & Portfolio Narrative | — | **Pulled forward — directly after Phase 3; completes the DoD** |
| Phase 4 | Human-in-the-Loop Delivery Workflow (live approval + send, idempotent) | L2 | **Optional** — owner re-decision after Phase 3; if built, a transient demo, never standing infra |
| Phase 5 | Persistence, Provenance & Observability (datastore + OTel GenAI tracing) | L2 | **Optional** — same gate |
| Phase 6 | Bounded Agentic Orchestration (orchestrator-worker over safe tools; trajectory evals) | L3→L4 | **Optional** — same gate; L4 = designed ceiling |

## Why hardening + evaluation come before the model (and before agency)

- **Today's safety checks pass partly "for free."** The draft generator is a stub, so guardrails are only tested on the cases we feed them; the T-002 baseline scores **deterministic fields**, not the generated text Phase 3 changes.
- **Before adding a model — and long before adding agency — there must be a measuring stick.** T-003 adds a **generator-agnostic draft contract** (runs unchanged on the stub now and Gemini later) and **adversarial probes** (measured catch-rate, not assumed). This is "evaluation before claims" (RULES §3) and the way to make Phase 3's "meets/beats baseline" trigger real.
- **It lowers risk.** A live model first would add secrets, cost, non-determinism, and version churn before anything can measure whether the output is good — and agency on top of an unmeasured model is exactly OWASP's *Excessive Agency* failure.

## Phase Details

### Foundation — Operating model & governance — Done
- Repo-as-source-of-truth, RULES, Enterprise Delivery Playbook, mandatory startup contract, source-intake rule, decision/journal/task logs, dual-model (build + review) workflow, operating doctrine (model/cost/honesty). Maps to NIST **Govern**.

### Phase 1 — Offline Vertical Slice (T-001, L0) — Done
- Stable IDs + clean schema; transparent risk score; deterministic blocker diagnosis; human-review queue; **HITL approval gate** (high-risk/ineligible held, never auto-sent); one structured guardrailed draft; *simulated* idempotent send; append-only provenance + audit logs. 23/23 tests; source CSV unchanged.

### Phase 2 — Offline Evaluation & Regression Harness (T-002, L0) — Done
- Golden labels for the 20 merchants; guardrail regression corpus; a locked, versioned baseline; the eval CLI. 35/35 tests; `scripts/eval.py` PASS. Maps to NIST **Measure**.

### Phase 2.5 — T-003 pre-agentic hardening (L0→L1) — Next
- **Goal:** make the baseline measure what the model will change, de-brand for public posting, and add the controls agency depends on — all offline.
- **Build:** de-brand (`PLATFORM_NAME = "Curbside Commons"`; keep v1 frozen); **add-alongside v1/v2** data lane (new `DEMO_CSV` + `golden.v2` + `baseline.v2` + `test_t003`, de-identified, hash-pinned, with a synthetic edge overlay + coverage matrix); a **generator-agnostic draft contract** (state-consistency / structure / policy, on independent fixtures); **adversarial guardrail probes** (measured catch-rate, split from blocking regression); **blocking** secrets + git-state close-out hooks; `false_impact_claim` matching both `PLATFORM_NAME` and real marketplace names.
- **Validation:** `test_t001`+`test_t002` stay green (v1 frozen); new `test_t003` green; v2 baseline recorded; source CSV **content** hash-unchanged (the OQ-1 *filename* rename is content-preserving); `out/` **regenerated once under the commit-fresh policy** (2026-06-12), not untouched; v2 outputs isolated from the v1 `out/` snapshots.
- **Out of scope:** any live model/secret/network/send.

### Phase 3 — Bounded LLM Drafting (L1) — Planned
- Schema-constrained drafting step (Gemini — current latest, freshness-checked, **<$5**) behind the existing guardrails; env-var secrets; offline mock for tests; guardrails hardened with the adversarial probes. **Trigger:** model meets/beats the v2 baseline behind guardrails.

### Phase 4 — Human-in-the-Loop Delivery (L2) — Optional (post-Phase-3 owner decision)
- Real approval callbacks (Slack; OSS alt: Mattermost/email) + real sending (Resend; OSS alt: SMTP) with delivery idempotency + suppression. **No send without explicit human approval; no duplicates.**

### Phase 5 — Persistence, Provenance & Observability (L2) — Optional (post-Phase-3 owner decision)
- Datastore (Supabase/Postgres; OSS alt: self-hosted Postgres) with migrations + the same provenance/audit guarantees; **OpenTelemetry GenAI** tracing (OSS backends: Langfuse/Phoenix). **Trigger:** one-file+logs outgrown.

### Phase 6 — Bounded Agentic Orchestration (L3→L4) — Optional (post-Phase-3 owner decision)
- A **single bounded agent** using orchestrator-worker over the deterministic tools, per-tool guardrails, circuit breakers, and **trajectory/component evals**; policy-envelope auto-act only for low-risk pre-approved classes. **Trigger:** adversarial evals green + threat-model controls verified + observability in place.

### Phase 7 — Public Demo & Portfolio Narrative — Pulled forward (directly after Phase 3; completes the DoD)
- A focused walkthrough: the problem, the workflow, where AI helps, where deterministic logic controls risk, where humans approve, what is simulated. Every public claim backed by a test, demo output, or a "simulated" label.
- **Specific expansion & adoption path (owner standing constraint, 2026-06-12 — part of "done," not boilerplate "future work"):** the final docs must name (a) **future expansion** — the concrete features/scale work needed past the shipped wedge, in order, each tied to its trigger (the existing Enterprise Expansion Path entries, made task-convertible); and (b) **adoption** — the explicit adopter class (here: merchant-onboarding/activation ops teams at local-commerce delivery marketplaces), what that adopter would require before using it (named compliance frameworks where applicable, the actual systems it must integrate with, security/support expectations, rollout path: one team → process-owner sign-off → org rollout). Every item names the thing, why, and roughly what it takes — if it can't become a task, it's not specific enough. The **product's target market is an intake question for the owner** (never defaulted to US; see `docs/open-questions.md`).

## Terminology Note

Descriptive terms, each tied to something built or planned: **vertical slice** (smallest end-to-end piece), **HITL approval gate** (held for a person before any send), **deterministic guardrails** (fixed rules rejecting unsafe text), **provenance/audit trail**, **idempotency** (a send can't repeat), **golden labels / regression** (known-correct answers catching drops), **autonomy ladder** (earned increases in model authority), **trajectory eval** (judging the path/tool-use, not just the answer). These are descriptive, not compliance claims.

## What Not To Do Yet

- No live Gemini before the T-003 draft contract + v2 baseline exist.
- No Slack/Resend/n8n/Supabase before the offline HITL workflow + safety controls are proven.
- **No autonomy above L2 before its adversarial evals + threat-model controls + observability exist** (OWASP *Excessive Agency*).
- No public claim unbacked by a test, demo output, or "simulated" label; no public post before the de-brand + a trademark/web check on "Curbside Commons".
- No multi-agent framework — a single bounded agent is the simplest pattern that works (Anthropic).
- No new governance/process unless a real, named blocker appears.
