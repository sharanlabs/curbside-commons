# ActivationOps AI Roadmap

> ActivationOps AI is a **simulation on dummy merchant data** — a **human-led, AI-assisted, professionally reviewed** build. It models a DoorDash-style merchant-onboarding "nudge" workflow. It does **not** use real DoorDash systems, real merchants, or real outreach, and every metric is simulated. This roadmap describes what is built today and the order of what comes next.

Last updated: 2026-06-02

## Current Status

- **The Offline Vertical Slice (Phase 1) is built and green.** The offline pipeline turns the 20-row dummy CSV into a normalized merchant table, scores onboarding risk with a transparent formula, diagnoses each merchant's blocker, queues high-risk merchants for human review, writes one guardrailed outreach draft per merchant, and records a *simulated* send that cannot duplicate — all with an audit trail.
- **Tests: 23/23 pass.** Run the tests with `python3 -m unittest tests.test_t001 -v`; run the pipeline with `python3 scripts/run.py`.
- **The original CSV is protected** — opened read-only and byte-identical before and after every run.
- **Fully offline.** No Gemini, no API calls, no live email, no Slack / Resend / Supabase / n8n. The draft generator is a deterministic stub.
- **Next up: Phase 2 — T-002, the Offline Evaluation and Regression Harness**, ratified in `docs/decision-log.md` (2026-06-02). **Not started yet.**
- The personal Obsidian knowledge vault is **separate** from this project and is not part of how it runs.

## Product Lifecycle

Every stage of this project moves through the same simple loop:

**Discover → Source Intake → Plan → Build → Validate → Review → Document → Handoff → Decide Next Stage**

- **Discover** — name the problem and the smallest useful next step.
- **Source Intake** — check any outside idea, tool, or pattern before using it; nothing is adopted by default.
- **Plan** — write a short, testable plan.
- **Build** — build one small slice.
- **Validate** — prove it with tests and real output, not assertions.
- **Review** — a second model (Codex) challenges the work; the human owner decides.
- **Document** — update the project's records so anyone can continue.
- **Handoff** — leave the repo clear enough for the next session to pick up.
- **Decide Next Stage** — the human owner approves what happens next.

## Build Phases

The build sequence below is product-first. The project's operating model and governance is the **Foundation** it rests on — already done, and context rather than a product phase.

| Stage | Item | Status |
|---|---|---|
| Foundation | Project Operating Model and Governance | Done |
| Phase 1 | Offline Vertical Slice | Done |
| Phase 2 | Offline Evaluation and Regression Harness (T-002) | Next — ratified, not started |
| Phase 3 | Bounded LLM Drafting | Planned |
| Phase 4 | Persistence and Provenance Upgrade | Planned |
| Phase 5 | Human-in-the-Loop Delivery Workflow | Planned |
| Phase 6 | Orchestration and Monitoring | Planned |
| Phase 7 | Public Demo and Portfolio Narrative | Planned |

## Why T-002 Comes Before Gemini

The next phase is an evaluation harness, not a live AI model — on purpose:

- **Today's safety checks pass partly "for free."** The draft generator is a stub, so the guardrails are only tested against the cases we feed them; their real strength is unproven.
- **Before adding Gemini, the project needs a baseline.** That means golden labels (the known-correct risk and blocker answer for each merchant), a set of guardrail regression cases, and a measured starting point.
- **This prevents claims without evidence.** With a baseline, the project can actually show whether a live model helps or hurts — instead of guessing.
- **It lowers risk.** Bringing in a live model first would add API secrets, cost, non-deterministic output, and model-version churn *before* there is any way to measure whether the output is good.

In short: build the measuring stick before swapping in the thing that needs measuring.

## Phase Details

### Foundation — Project Operating Model and Governance — Done
- **Goal:** make the repo the single source of truth so any session or tool can continue safely. This is the **foundation** the product phases rest on — context and protection for execution, not a product phase itself.
- **What was built:** the rules file, the enterprise delivery playbook, the mandatory startup contract, the source-intake rule, the decision / journal / task logs, and the two-model (build + review) workflow.
- **Validation evidence:** every later task opens from these files and is reviewed against them.
- **Out of scope:** product features — this layer is process, not product.
- **Trigger that was met:** the operating model was needed before writing any product code.

### Phase 1 — Offline Vertical Slice (T-001) — Done
- **Goal:** prove the boring, load-bearing parts of the workflow on dummy data before any outside system.
- **What was built:** stable IDs and a clean schema; a transparent risk score; deterministic blocker diagnosis; a human-review queue; a **human-in-the-loop approval gate** (high-risk and ineligible merchants are held, never auto-sent); one structured, guardrailed draft per merchant; a *simulated* send with an **idempotency** key so it cannot repeat; and two append-only logs — one for generation **provenance**, one for the **audit trail**.
- **Validation evidence:** 23/23 tests pass; canonical run = 20 merchants → 8 held for review, 12 simulated sends, 0 rejected; re-running sends nothing new; the source CSV is unchanged.
- **Out of scope:** any live model, real email, or external service.
- **Trigger that was met:** all tests green and the slice runs end-to-end offline.

### Phase 2 — Offline Evaluation and Regression Harness (T-002) — Next
- **Goal:** create an honest, fully offline way to measure quality *before* any live model.
- **What gets built:** golden labels for the 20 merchants (the known-correct risk and blocker), a guardrail **regression testing** set (planted bad drafts, the real sample messages, and one case per guardrail category), and a small metrics summary that becomes the baseline.
- **Validation evidence:** the evaluation runs offline and deterministically, extends the existing 23-test discipline, and records the baseline numbers.
- **Out of scope:** Gemini or any live model; secrets; cost; new integrations.
- **Trigger to move forward:** a recorded baseline exists, so a later model change can be measured against it.

### Phase 3 — Bounded LLM Drafting — Planned
- **Goal:** replace the stubbed draft generator with a real, bounded model (e.g. Gemini), measured against the Phase-2 baseline.
- **What gets built:** a single, schema-constrained drafting step that sits behind the existing guardrails; environment-variable secrets; an offline mock so tests stay offline; guardrails hardened with real adversarial cases.
- **Validation evidence:** the model output is measured against the baseline and must not regress safety or state-consistency.
- **Out of scope:** multi-step tool use that runs without human approval; any live send.
- **Trigger to move forward:** the model meets or beats the baseline behind the guardrails.

### Phase 4 — Persistence and Provenance Upgrade — Planned
- **Goal:** move from CSV files to a real datastore only when the simple store is genuinely outgrown.
- **What gets built:** a database (e.g. Postgres / Supabase) with migrations, the deferred normalized schema as needed, and the same provenance and audit guarantees.
- **Validation evidence:** parity tests against the current outputs.
- **Out of scope:** any change not required by real data growth.
- **Trigger to move forward:** one entity file plus two logs is no longer enough.

### Phase 5 — Human-in-the-Loop Delivery Workflow — Planned
- **Goal:** turn the simulated send into a real (still rate-limited, test-keyed) approval-and-send flow.
- **What gets built:** real approval callbacks (e.g. Slack) and real sending (e.g. Resend) with delivery idempotency and suppression handling.
- **Validation evidence:** no message sends without explicit human approval; no duplicate sends.
- **Out of scope:** unattended, automatic sending.
- **Trigger to move forward:** the offline workflow and its safety controls are proven.

### Phase 6 — Orchestration and Monitoring — Planned
- **Goal:** connect the steps into a reliable workflow with visibility.
- **What gets built:** workflow orchestration (e.g. n8n) with error handling, plus monitoring and an outcome-feedback loop.
- **Validation evidence:** failures are caught and retried safely; runs are observable.
- **Out of scope:** anything not yet proven in an earlier phase.
- **Trigger to move forward:** the delivery workflow is stable and worth automating.

### Phase 7 — Public Demo and Portfolio Narrative — Planned
- **Goal:** explain the work clearly to both a general and a technical audience.
- **What gets built:** a focused walkthrough and demo that shows the problem, the workflow, where AI helps, where deterministic logic controls risk, where humans approve, and what is simulated.
- **Validation evidence:** every public claim is backed by a test, demo output, or a clear "simulated" label.
- **Out of scope:** any claim not supported by evidence.
- **Trigger to move forward:** there is a real capability worth showing.

## Terminology Note

A few plain terms, each tied to something actually built:

- **vertical slice / thin slice** — the smallest end-to-end piece of the workflow (Phase 1).
- **human-in-the-loop approval gate** — high-risk merchants are held for a person to approve before any send.
- **deterministic guardrails** — fixed rules that reject unsafe draft text.
- **provenance / audit trail** — records of what was generated and what happened.
- **idempotency** — the same send cannot happen twice.
- **regression testing / golden labels** — known-correct answers used to catch quality drops (Phase 2).

These terms are descriptive, not compliance claims; there is no framework-mapping section by design.

## What Not To Do Yet

These are explicitly **not** the next step:

- a live Gemini integration before T-002 (the evaluation baseline) exists;
- Slack, Resend, n8n, or Supabase integration before the evaluation baseline exists;
- any public claim that isn't backed by a test, demo output, or a "simulated" label;
- linking the personal Obsidian vault into the project as if it were authoritative;
- adding more governance or process unless a real, named blocker appears.
