# ActivationOps AI — Interview Walkthrough ("walk me through it")

> **Status: living draft — finalized at project completion.** Not-yet-built work is marked **[PLANNED]**. Companion to the plain-language [CASE-STUDY.md](CASE-STUDY.md). Use this when an interviewer says *"walk me through a project."* Each decision is laid out as **What · Why · Why not (the alternative) · On what basis · Validation · Tradeoff / at scale** so you can defend it.
>
> Honesty framing: simulation on dummy data; **Curbside Commons** is a fictional example marketplace; human-led, AI-assisted, professionally reviewed. Never claim real access, data, or impact.

---

## 60-second pitch

> "ActivationOps AI is a simulated merchant-onboarding *activation* engine — the workflow a marketplace uses to rescue merchants who stall during onboarding before going live. What I wanted to show isn't 'I called an LLM'; it's the *discipline around* the LLM: deterministic logic owns every risky decision, a human approves anything sensitive, the AI only drafts language and only behind guardrails, and I built an offline evaluation harness to *measure* quality before adding the model. It's fully offline on dummy data, test-covered, and every design decision was put through an independent cross-model adversarial review."

## Architecture at a glance

```
source data (frozen, hash-pinned)
   └─ normalize ─→ risk score (transparent formula) ─→ blocker diagnosis ─→ eligibility
                                                                                │
                                              review gate: High-risk OR ineligible → HUMAN QUEUE (held)
                                                                                │ else
                                              draft (stub today → bounded LLM [PLANNED]) ─→ guardrails
                                                                                │ pass
                                              simulated send (idempotent) ─→ append-only audit + provenance logs
```
Runtime today: **Python standard library only** — no network, no AI call, no external services. The AI step is [PLANNED] for Phase 3, behind the existing guardrails.

---

## Decision-by-decision deep dive

### 1. Risk scoring — a transparent formula, not a model
- **What:** `risk = 2·(days since signup) + 3·(days since last login) + 10·(steps remaining)`; plus human-readable reason codes.
- **Why:** explainability. Every score can be justified to a merchant or a manager line-by-line.
- **Why not ML:** with ~20 seed rows there's nothing to train; a trained model would be unexplainable *and* unjustified at this scale, and it would undercut the core story ("deterministic logic controls risk").
- **Basis:** the project's "deterministic before AI" rule; explainability-first.
- **Validation:** the score is recomputed and re-validated on every row; the pipeline refuses to emit a row whose score doesn't match the formula.
- **At scale:** the formula is a `risk.v1` versioned assumption; thresholds are documented, not asserted — a later trained model would have to *beat the transparent baseline behind the same guardrails* before replacing it.

### 2. Blocker diagnosis — a deterministic step map
- **What:** `steps_completed → (current_blocker, next_best_action)` via a fixed table.
- **Why / why not:** the onboarding funnel is a known, ordered sequence; a lookup is correct and testable. An LLM "guessing" the blocker would add nondeterminism to something that is actually deterministic.
- **Validation:** asserted per row against the data dictionary.

### 3. Guardrails — deterministic content checks on every draft
- **What:** rejects drafts containing forbidden revenue claims, unsupported metrics, false claims made on the platform's behalf, aggressive urgency, or anything resembling PII/a secret; plus a **structural** check that the draft's stated next-action matches the merchant's real state.
- **Why:** the outreach is the one place generated text reaches a (simulated) merchant; it's the highest-risk surface, so it gets hard, testable rules — independent of who wrote the draft.
- **Why not "trust the model":** a model's safety is unproven until tested; rules give a floor that holds regardless of the generator.
- **Basis:** guardrails-before-generation; "evaluation before claims."
- **Validation:** a regression corpus of planted-bad and known-good strings; the guardrail must flag every bad one and *not* over-flag realistic clean text.
- **Honest gap I name openly:** today the draft generator is a deterministic stub, so the guardrails pass "partly for free." Proving their real strength against *model-style* failure modes is exactly what the next phase hardens (see #6).

### 4. The human-in-the-loop send gate — the load-bearing safety control
- **What:** `send_eligible = contact_eligible AND (review not required OR approval = approved)`. High-risk and ineligible merchants are **held**, never auto-sent.
- **Why:** it proves human-review gating *in code* even without a live approval UI — the single most important safety property of the system.
- **Why not auto-send everything:** that's the failure mode the whole project exists to avoid (unsupervised outreach on at-risk accounts).
- **Validation:** invariant tests — a `simulated_sent` record can't exist without eligibility *and* an idempotency key; this was caught as a **NO-SHIP** at plan review the first time and fixed before any code shipped.

### 5. Idempotency — the same nudge can't go twice
- **What:** a deterministic `merchant:blocker:template:date` key; the send step loads prior keys and emits `skipped_duplicate` on a repeat.
- **Why:** duplicate outreach is a real, embarrassing failure mode; idempotency is the standard defense.
- **Validation:** re-running the pipeline sends nothing new (tested).

### 6. The evaluation harness — and the gap I caught
- **What:** golden (known-correct) labels for every merchant + a guardrail regression corpus + a recorded, version-pinned baseline; the runner self-validates its own aggregate counts so a non-canonical run can't silently pass.
- **The standout beat:** the headline baseline reads "20/20 merchants, 45/45 guardrail cases, PASS" — but I read the scoring code and found **all 14 scored fields are deterministic pipeline outputs; none score the *generated draft text*.** Since the AI phase only changes the draft generator, *a green baseline wouldn't measure the thing the AI changes.* I'm fixing that **before** adding the model: a generator-agnostic draft-quality contract + adversarial guardrail cases. **An eval can be green and still measure the wrong thing — coverage of the surface the next change touches is what matters, not the pass rate.**
- **Why this matters in an interview:** it shows I treat evals as something to *interrogate*, not a green check to trust.

### 7. Data strategy — hybrid "snapshot," not a live API
- **What:** an open-source dataset fetched **once**, de-identified (real names/contacts replaced with synthetic), frozen and hash-pinned, **plus** a synthetic layer that injects the edge cases (opted-out, suppressed, malformed email, a draft that *should* be rejected).
- **Why hybrid:** realism + quantity from the open data; precise edge coverage + quality from the synthetic layer.
- **Why not a live API:** (a) it can't produce the *business-state* edge cases I need (opt-out/suppression are CRM states, not public facts); (b) inputs that change every run would destroy the golden-label evaluation (which pins exact values + a source hash); (c) putting *real* business names into a fabricated "at-risk/being-nudged" story is dishonest for a public artifact. **The line: download-once-and-freeze is in; call-on-every-run is out.**
- **Basis:** this exact fork was put to an independent cross-model adversarial review (Codex, GPT-5.5, max reasoning), which reached the same no-ship-on-live-API verdict on the merits.
- **At scale:** a real deployment *would* ingest live data — but behind a snapshot/replay layer for reproducible evaluation, which is the same pattern.

### 8. Going company-agnostic
- **What:** the engine is "ActivationOps AI"; the example marketplace is the fictional "Curbside Commons"; real companies are named only as *comparisons*, never as identity or first-party message copy.
- **Why:** a public artifact branded as a real company implies affiliation and risks misrepresentation; agnostic framing also makes the transferable skill obvious.

### 9. The build process — dual-model, adversarial
- **What:** Claude Code plans and builds; **Codex** (independent model family, at its strongest setting) adversarially reviews plans and changed files; the owner approves. Every meaningful task is traceable from idea → sources → decision → validation → handoff.
- **Why it's worth mentioning:** cross-model review catches what a single model rationalizes away — the T-002 work passed through **8** review rounds with every finding resolved before commit; two findings became permanent regression tests.

### 10. A failure I keep (honesty signal)
- **What:** the "git state" line in the handoff docs went stale repeatedly — including at the very commit meant to fix it.
- **Why I keep it documented:** it's a real lesson — *a control that isn't enforced at the close-out gate drifts even when everyone knows the rule.* The fix isn't another rule, it's a mechanical check. Showing the failure (and the diagnosis) is more credible than a too-clean story.

---

## Hard questions an interviewer might ask

- **"Isn't this just a CRUD script with if-statements?"** The if-statements *are the point* — risk control belongs in deterministic, testable logic, not an LLM. The engineering depth is in the safety gate, idempotency, provenance, and an evaluation harness I interrogated rather than trusted.
- **"Why no real API / live data?"** Reproducible evaluation needs fixed inputs; live data breaks the golden-label baseline and raises honesty issues with real businesses. I use a frozen snapshot — the same pattern a real system would use for eval — and I can speak to how I'd wire live ingestion behind it.
- **"How do you know the AI output is any good?"** That's why the evaluation harness exists *before* the model — and why I'm extending it to score generated text and adversarial guardrail behavior before Phase 3. The model has to *beat a recorded baseline behind the guardrails*.
- **"What's simulated?"** The data and the sends; never claimed otherwise. The engineering is real and tested.
- **"What would break at scale?"** CSV → a database with migrations; the transparent formula → possibly a trained model *if it beats the baseline*; simulated send → a rate-limited, approval-gated real send; single-process → an orchestrated, monitored workflow. Each is a named [PLANNED] phase with an explicit trigger.

## What I'd do differently / next
- Land the evaluation-coverage fix and the de-brand + hybrid dataset **before** the model (in progress as T-003).
- Then a single, schema-constrained AI drafting step (Gemini) behind the guardrails, measured against the baseline, with an offline mock so tests stay offline. **[PLANNED]**

## Honest limitations (state them first, before you're asked)
Offline only; dummy data; the AI step isn't integrated yet; no persistence/delivery/orchestration yet; "outcome learning" is simulated. These are deliberate sequencing choices, each a named next phase — not gaps I missed.

---

*Maintained as the project progresses; each phase adds its decisions here in the same format.*
