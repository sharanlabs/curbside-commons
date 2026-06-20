# ActivationOps AI

A **human-led, AI-assisted** prototype for activating **stalled / pre-live, long-tail merchants** on a local-commerce **delivery marketplace** (DoorDash / Uber Eats / Grubhub-style). It spots which signed-up merchants are stuck getting set up, diagnoses **why**, drafts a next message whose **every claim is checked against the merchant's own data** (and forbidden-claim patterns), holds it for human approval, scores it for quality, and logs every step — built to be **measured, audited, and adopted**.

> **Not** an official system of any marketplace. It runs on **hybrid demo data** — real public-domain business names (DataSF) + a **synthetic** activation overlay — with **no real merchant relationship, account, or PII**, and makes **no real business-impact claims**. All metrics are simulated. Company-agnostic; real companies appear only as comparisons. Working platform name: **"Curbside Commons"** (pending an owner trademark check).

## The problem

A delivery marketplace's signed-up-but-never-live merchants are real lost GMV, and the long tail is too large to work by hand. Merchants stall partway through onboarding (verify business → menu → photos → hours → banking → final check) and the people who unstick them work in a spreadsheet with no easy way to see who's at risk, **why**, what to do next, or who was already contacted. The #1 reason reactivation outreach fails is being **generic instead of matched to the actual blocker**.

## What it does

Deterministic risk + blocker **triage** → a domain **diagnosis** (engagement state + root-cause hypothesis + a reactivation play that varies by *why* they're stuck, not just which step) → **bounded, schema-constrained LLM drafting** → a **claims-gatekeeper** that ties every *declared* claim to the merchant's own data (+ forbidden-claim guardrails) → an **eval harness** that scores the draft → a **human-in-the-loop gate** (hold / reject / send) with a full **audit trail** and a **cost ledger**. The design is a direct antidote to the AI-outreach failure frontier (false claims, churn, *Moffatt v. Air Canada*, FTC Operation AI Comply).

## Today vs target (honest status)

**Built today — green (`npm run typecheck && npm run lint && npm run test && npm run build`; 94 tests + 3 Playwright e2e):**
- Single-stack **Next.js + TypeScript + Tailwind + React** app; a desktop **console**: Overview/queue · Merchant Detail (full why-chain) · Eval/Quality · Metrics/Impact · Audit · Cost.
- The **deterministic core ported to TS** and pinned **byte-for-byte to the Python v1 oracle** by a differential test.
- **Hybrid dataset** (real SF entities, PII-scrubbed + license-clean; deterministic synthetic overlay) via a **source-swappable adapter** + trust-boundary sanitizer.
- **Bounded Gemini drafting**, with the **claims-gatekeeper**, a **draft-quality eval** (corrupted-record teeth), a **$5 fail-closed budget** (per-call + cumulative), model preflight, and a **prompt-injection cut** (untrusted name never reaches the model).
- A **recorded real Gemini run** (one merchant per blocker, $0.0036) that the eval scored — the live path is proven end-to-end (and surfaced + fixed a real guardrail-precision issue). The public **demo stays REPLAY-only** (no live calls, zero spend).

**Designed but gated / target:**
- **Vercel deploy** (REPLAY-only public demo, key gated off) — owner-gated.
- **Deeper blocker root-causes** — need instrumentation signals (named in `lib/domain/diagnosis.ts`, not faked).
- A **calibrated LLM-judge** for semantic unsupported-claim detection (the deterministic graders + the claims-gatekeeper are forward-only today — an honest, documented boundary).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  (REPLAY demo, no live AI, no spend)
npm run verify     # typecheck + lint + test + build
```

Live AI stays off unless you set `GEMINI_API_KEY` + `ENABLE_LIVE_AI=true` in a (gitignored) `.env` — see `.env.example`.

## Stack

Single stack: **Next.js (App Router) · TypeScript · Tailwind v4 · React 19**, deploy target **Vercel (free tier)**, tests **Vitest** (+ Playwright e2e, target). **Free-first**; the only paid runtime is the **Gemini API**, hard-capped at **$5 total** and ledgered. Gemini key is **server-side only**.

## Key documents

- **`docs/WHY.md`** — the decision rationale (every load-bearing "why", each naming the rejected alternative + its cost).
- **`docs/ENTERPRISE-READINESS.md`** — controls inventory · demo boundaries · honest production gaps · the adapter-based **adoption contract** + expansion path.
- `~/.claude/plans/gentle-forging-starlight.md` — the canonical goal, DoD, phases, and binding blindspots.
- `docs/research/merchant-activation-domain-2026-06-19.md` — the cited domain research behind the diagnosis layer.
- `lib/data/PROVENANCE.md` — the hybrid-data source/license/PII label.
- `docs/decision-log.md` · `PROJECT_STATE.md` · `HANDOFF.md` — decisions, status, next step.

## Development workflow (internal — not the product)

Built under human direction with **Claude Code** (planning + implementation) and **Codex** (adversarial + changed-file review), Git, and a cross-model ship gate. This is how it's built and reviewed; it is not the product runtime. See `docs/dual-model-workflow.md`.

## Adoption boundary

Adoption-**grade** means the architecture, controls, evals, the real-data adapter, and a documented adoption path are credible enough for a marketplace to inherit — **not** "production-ready." Honest gaps: auth/multi-tenancy, real integrations (Slack/email/CRM), persistence/observability at scale, a calibrated LLM-judge for semantic claims (the live-LLM eval + caught-failure are done — recorded), and deeper blocker instrumentation. A marketplace adopts it by swapping the hybrid dataset's real layer for its own export against the adapter's documented contract.

Human-led, AI-assisted, professionally reviewed.
