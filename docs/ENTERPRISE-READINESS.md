# Enterprise readiness & adoption path

ActivationOps AI is built **adoption-grade**, not production-ready: the architecture, controls, evals, the real-data adapter, and the path below are credible enough for a marketplace to **review, adapt, and revalidate as a reference prototype** (not drop in and run as-is) — while the demo stays honestly bounded. The *rationale* for each control is in [`docs/WHY.md`](WHY.md); this doc is the structured inventory + the inheritance contract. Mirrors the resilix `enterprise_readiness` standard (controls · boundaries · gaps · story), adapted to what is actually built.

## Implemented controls

- **Deterministic-first decisions** — risk score, blocker diagnosis, contact/send eligibility, and hold/send are pure deterministic code, pinned **byte-for-byte to the Python v1 oracle** by a differential test (`evals/core-differential.test.ts`). The risky, audited decisions are replayable and regression-locked.
- **Domain diagnosis layer** (`lib/domain/diagnosis.ts`) — engagement state + root-cause hypothesis + an engagement-routed reactivation play. The `blocker_source` axis (merchant-side nudge vs platform-side ops-escalation) is modeled and the routing is ready, but the **current synthetic data emits merchant-side only** — platform-side is a documented target needing instrumentation, never fabricated. Add-alongside; never mutates the core.
- **Schema-constrained drafting** — the LLM authors against a Zod contract (`GeneratedDraftSchema`); model output is non-authoritative for the gated decisions.
- **Claims-gatekeeper** (`lib/agents/gatekeeper.ts`) — every *declared* claim must trace to merchant data; forbidden revenue/impact/urgency/PII patterns + state-consistency are hard blocks; `PASS / WARN / BLOCKED`; only a clean draft is `approvedForHumanReview`.
- **Bounded LLM with honest fallback** — live Gemini is **off by default** (`lib/server/env-flags.ts`); the deterministic stub is the test path and the live-failure fallback (`FAILED_TO_FALLBACK`), so a failure degrades visibly, never silently.
- **Prompt-injection cut** — the untrusted `merchant_name` never reaches the model (a `{{MERCHANT}}` placeholder; the real name is substituted only after gatekeeping). Trust-boundary sanitizer on all real-data fields.
- **Cost control** — a **$5 fail-closed** budget guard per call **and** a cumulative ledger across a batch (`lib/agents/{budget,live-batch}.ts`); cost is computed from real reported tokens × a pinned, versioned price table; an unknown model fails loud (never $0); a startup model preflight turns a retirement into a one-line config bump.
- **Eval harness** (`lib/evals/draft-quality.ts`) — deterministic graders (structure · state-consistency · policy), each paired with a corrupted record it must catch (teeth, not theater).
- **Human-in-the-loop gate** — hold / reject / send (simulated), with a per-merchant **audit trail**, a **cost ledger**, and an honest **mode taxonomy** (REPLAY / LIVE_AI / DETERMINISTIC_RULES / FAILED_TO_FALLBACK).
- **Secrets** — the Gemini key is server-side only and never client-exposed; `.env` is gitignored; no secret is committed (RULES §11).
- **Quality gate** — `npm run verify` (typecheck · lint · test · build); 153 tests + 3 Playwright e2e including the differential + the guardrail-corpus + draft-text differentials; `next build` prerenders every route (also the console render-smoke).
- **Data hygiene** — the public demo DISPLAYS fictional names (no real businesses); the real-data adapter is license-clean (DataSF, PDDL 1.0 public domain) and PII-scrubbed to name + category; activation state is synthetic and labeled (`lib/data/PROVENANCE.md`).

## Demo boundaries

- Activation state is **synthetic** and disclosed; the public demo **displays fictional names** (the adapter's real layer is public-domain names + category only).
- **No** real merchant relationship, account, or PII; **no** real marketplace access or business-impact claim. Metrics are simulated.
- The public demo is **REPLAY-only** — no live AI, no spend.
- Model output is non-authoritative for the gated decisions (deterministic code owns them).
- Company-agnostic; real companies appear only as comparisons. "Curbside Commons" is the working demo name (no obvious trademark collision found; formal clearance only before commercial use).

## Production gaps (honest)

- **Auth / identity:** SSO, RBAC, user identity, and tenant boundaries (none today — single-user prototype).
- **Real integrations:** Slack / email / CRM via explicit adapters with permission, data-classification, and redaction controls (sends are simulated today).
- **Persistence & observability at scale:** REPLAY is computed in-memory; a real deployment needs durable state + audit + metrics (latency, model-failure/fallback rate, gatekeeper-block rate, approval latency).
- **Live-LLM assurance:** the eval over the *real* model output + an authentic caught-failure are **done** — a recorded live run (`lib/data/live-samples.snapshot.json`, $0.0036). A **calibrated LLM-judge** for *semantic* unsupported-claim detection remains not-yet-built (the deterministic graders + claims-gatekeeper are forward-only — a documented boundary).
- **Diagnosis depth:** the deeper blocker root-causes need the instrumentation signals named in `lib/domain/diagnosis.ts` (`blocker_source`, `verification_status`, `menu_status`, …) — built to consume, not yet populated.
- **Any live endpoint:** add rate limiting + the budget hard-stop + a managed secret store; run a security-specialist pass on the deployed app before enabling live AI.
- **CI / e2e:** full Playwright e2e + a11y audit on settled DOM + a CI quality gate (typecheck/lint/test/build/secret-scan) — local `verify` exists; CI is a gap.

## How a marketplace inherits it (the adoption contract)

1. **Swap the real data layer.** The hybrid dataset's real layer is produced by a **source-swappable adapter** targeting a neutral `RealEntity` contract (`merchant_name` + crosswalked `merchant_category`). The SF adapter (`lib/ingest/sf-adapter.ts`) is the reference; a marketplace points a new adapter at its own merchant export against the same contract — nothing downstream changes (core, gatekeeper, eval, HITL all stay).
2. **Populate the activation signals.** Replace the synthetic overlay with the marketplace's real onboarding fields, and populate the named instrumentation signals to unlock the deeper diagnosis (the layer already routes on them).
3. **Deploy safely.** REPLAY-only public surface; live AI behind the server-side key + the budget cap + rate limiting; sends behind the human gate + a real integration adapter.

## Expansion path (free build → enterprise)

- **Build/showcase stack (today):** Next.js + Vercel free tier + Gemini ≤ $5.
- **Enterprise expansion (triggered by adoption):** managed Postgres for durable state + append-only audit · SSO/RBAC/multi-tenancy · real integration adapters · observability + alerting · managed secret store · CI gates · HA/compliance. Same architecture, scaled — not a rewrite.

## The story to tell

The claim is not that the AI is magic. It is **operational discipline**: deterministic code makes the risky decision · a bounded LLM drafts and explains · the gatekeeper checks every declared claim against data (+ forbidden-claim patterns) · a human approves the irreversible action · the audit trail records it · cost is hard-capped. That governance spine — transferable across verticals (see WHY.md) — is what a marketplace, a business analyst, and an engineering lead can review, adapt, and revalidate as a credible reference.
