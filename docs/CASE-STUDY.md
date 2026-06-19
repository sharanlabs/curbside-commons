# ActivationOps AI — Case Study (general read-through)

> **Status: living draft — finalized at project completion.** Sections for not-yet-built phases are marked **[PLANNED]**. This document is written for *anyone* — including non-technical readers. Its companion, [INTERVIEW-WALKTHROUGH.md](INTERVIEW-WALKTHROUGH.md), is the technical "walk me through it" version.
>
> **Everything here is a simulation on dummy data.** It does not use any real company's systems, real merchants, or real outreach. Every metric is simulated. The example marketplace, **"Curbside Commons,"** is fictional. ActivationOps AI is **human-led, AI-assisted, and professionally reviewed** — it was built by a person directing AI tools, and reviewed by a second AI model and the owner; no claim is made that "AI built it."

---

## In one paragraph

**ActivationOps AI** is a behind-the-scenes "engine" for the moment a new merchant signs up to a delivery/commerce marketplace and then *stalls* before going live. It looks at each merchant's onboarding progress, works out how at-risk of dropping off they are and *why*, decides the single next step that would unstick them, holds the risky cases for a human to approve, writes a safe, on-brand nudge message, and records every action — all on **made-up data, fully offline**. It is built the careful way on purpose: plain rules do the risky thinking, AI only helps *draft* language (and only later), a human approves anything sensitive, and every claim is backed by a test.

## The problem it models

New merchants have to finish a sequence of steps before they can take a single order — verify the business, upload a menu, add photos, set hours, verify banking, pass a final check. **Many stall partway and churn before going live.** The people responsible for unsticking them often work from a spreadsheet with no easy way to see *who* is at risk, *why*, *what to do next*, or *who was already contacted*. ActivationOps AI models the engine that would answer those four questions and act on them safely.

## What it does today (built and tested)

On a batch of dummy merchants, the offline engine:

1. **Normalizes** messy input into one clean record per merchant.
2. **Scores onboarding risk** with a transparent formula (no black box) — you can read exactly why a score is what it is.
3. **Diagnoses the current blocker** and the **single next best action** for each merchant.
4. **Builds a human review queue** — high-risk or contact-ineligible merchants are *held for a person*, never auto-contacted.
5. **Writes one structured nudge draft** per merchant, **behind guardrails** that block unsafe content (false revenue promises, made-up statistics, claims made on the platform's behalf, pushy urgency, anything resembling a secret).
6. **Simulates the send** — with an **idempotency key** so the same nudge can never be sent twice — and **logs every action** to an audit trail and a generation-provenance log.

It runs with a single command and is covered by an automated test suite plus an offline evaluation that re-checks quality against known-correct answers. *(Current canonical run on the legacy 20-row sample: 20 merchants → 8 held for review, 12 simulated sends, 0 rejected. These numbers will change once the new hybrid dataset deliberately includes ineligible/suppressed merchants and a draft that gets rejected — so the safety machinery is actually visible in the demo.)*

## How it works, step by step (plain version)

```
Dummy data → Normalize → Score risk → Diagnose blocker → Eligible to contact?
                                                              │
                                   High-risk / ineligible ────┘──→ Human review queue (held)
                                   OK to proceed ─────────────────→ Draft nudge → Guardrails
                                                                                      │
                                                                    fails ────────────┘──→ Rejected (logged)
                                                                    passes ───────────────→ Simulated send (once only) → Audit log
```

## Why it's built this way (the principles)

These are the rules the whole project follows, in plain terms:

- **Boring, reliable logic does the risky thinking.** Scoring, eligibility, and the send-decision are plain deterministic rules you can read and test — *not* the AI. AI is used only to help draft language, and only later, always behind the guardrails.
- **A human approves anything sensitive.** High-risk and ineligible merchants are held for a person. The system proposes; a human disposes.
- **Measure before you claim.** Before any real AI model is added, the project built a *measuring stick* (an evaluation harness) so it can prove whether the AI actually helps — instead of guessing.
- **Honesty over polish.** All data is simulated and labeled as such. The project never claims real access, real merchants, or real business impact.
- **Start simple; add complexity only when a real need justifies it.** No databases, no live email, no external services until the simple version has earned them.
- **The work is reviewed.** A second AI model (acting as an adversarial reviewer) and the owner challenge the work before anything is accepted.

## The journey, start to end

| Stage | What happened | Status |
|---|---|---|
| **Foundation** | Wrote the operating rules, the delivery playbook, and a two-model build-and-review process so the project is safe to continue across sessions. | Done |
| **Phase 1 — Offline slice** | Built the end-to-end engine on dummy data (normalize → score → diagnose → review queue → guarded draft → simulated send → audit log). 23 automated tests. | Done |
| **Phase 2 — Evaluation harness** | Built an offline "measuring stick": known-correct answers for every merchant + a library of guardrail test cases + a recorded baseline. 35 tests total; evaluation passes. | Done |
| **Public pivot (this stretch)** | Decided to make it a public portfolio piece: all real-company branding will be removed in favor of a clearly-fictional platform name (working label **"Curbside Commons"** — final pick + trademark check happen at build); chose a **hybrid data** approach (a cleaned, frozen copy of a real-shaped public dataset + hand-made edge cases); and discovered the evaluation didn't yet measure the part the AI will change — so that's being fixed first (T-003, plan revised + under review). | Decided — build pending |
| **Phase 3 — AI drafting** | Replace the placeholder draft writer with a real, bounded AI model (e.g. Gemini), kept behind the same guardrails and measured against the baseline. | **[PLANNED]** |
| **Persistence, delivery, orchestration** | Move from files to a database; turn the simulated send into a real (approval-gated, test-keyed) send; connect the steps into a monitored workflow. | **[PLANNED]** |
| **Public demo + narrative** | A clear walkthrough and demo for a general and a technical audience. | **[PLANNED]** |

## Adapt this to your use case · enterprise & department scale

> **[Living draft — NOT yet research-verified.]** The industry / function / use-case examples below are currently **illustrative reasoning, not researched claims.** Before any public post they get **replaced with thoroughly-researched, source-cited coverage** — real industries, functions/departments, and use cases, from broad source discovery (official + analyst/industry + practitioner), with sufficiency stated — to a well-covered-guideline standard (RULES §6). Treat the list below as a placeholder.

ActivationOps AI is deliberately **domain-agnostic** — an *activation engine* pattern, not a delivery-specific tool. To take it and make it yours:

- **The reusable pattern.** Any setting where people move through a *multi-step funnel and stall*: normalize records → score risk transparently → diagnose the blocker → pick the next best action → hold risky cases for a human → draft guarded outreach → simulate/send with an audit trail. *(Illustrative candidate domains, pending research: SaaS trial/onboarding activation, sales-lead activation, student course-completion, patient care-plan adherence, employee/partner/vendor onboarding.)*
- **What an adopter reconfigures (built for this):** the funnel/step-map (steps, blockers, next actions) · the risk formula + thresholds (versioned, swappable) · the guardrail categories (your forbidden claims/tone) · the eligibility + approval rules · the platform name/branding (`PLATFORM_NAME`).
- **Department scale:** one team points it at their funnel + data; runs offline/locally, fully auditable, no vendor lock-in.
- **Enterprise scale [PLANNED — see roadmap]:** the same guarantees on a real datastore (Postgres/Supabase) with migrations; bounded LLM drafting behind the guardrails; human approval (e.g. Slack) + rate-limited real delivery (e.g. Resend); orchestration + monitoring (e.g. n8n); multi-team/role separation. Each external system is added only once the simpler layer earns it — so an adopter stops at the scale they need.
- **Taking it:** structured to be cloned and reconfigured — swap funnel/data/branding, keep the safety architecture. *(License + a short "make it yours" guide ship with the public release.)*

## What's real vs. simulated (the honest part)

- **Real:** the engineering — the rules, the tests, the evaluation, the guardrails, the human-review gate, the audit trail. These genuinely run and are genuinely tested.
- **Simulated:** the *data* (made-up merchants), the *sends* (nothing is actually emailed), and any "outcome learning" (there are no real outcomes yet). The marketplace "Curbside Commons" is fictional.
- **Not yet built:** the live AI model, a real database, real delivery, and the public demo. Marked **[PLANNED]** above.

## How it was built (development workflow note)

Built under human direction using **Claude Code** (planning and implementation support) and **Codex** (an independent adversarial reviewer at its strongest setting), with Git for version control. This is the *build method*, not the product. The product is the engine described above.

---

*This case study is maintained as the project progresses; each phase updates the table above and the relevant sections. Before any public posting it gets a public-claims review and a pre-ship adversarial review.*
