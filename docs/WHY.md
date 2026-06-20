# Why — the decision rationale (the why-chain)

This product is built to **answer every load-bearing "why" to first principles**, and the test for each is concrete: **name the alternative it rejected and the cost of that choice.** A confident rationale that doesn't name what it gave up is just rationalization. Plain-English first, the technical reason alongside.

> Status note: this describes the prototype as built. Where a capability is designed-but-gated (live Gemini, deploy), it says so. Honesty is itself a why (last section).

---

## The problem & the solution

**Why this problem — stalled / pre-live, long-tail merchant activation.** A delivery marketplace's signed-up-but-never-live merchants are real lost GMV, and the long tail is too large to work by hand. *Rejected:* generic "AI for merchants" / churn-prevention for *live* merchants. *Cost of that choice:* it's commodity (Gainsight, ChurnZero, DoorDash's own AI Marketer all do outreach) and doesn't fit the pre-live cohort, where the job is *diagnosis*, not retention.

**Why this solution — diagnose *why* a merchant is stuck, then draft the right next outreach, safely.** The defensible value is the *combination* applied to this vertical, with auditability. *Rejected:* a pure outreach-drafting tool. *Cost:* the research's #1 reactivation-failure cause is **generic outreach not matched to the actual blocker** — a drafter without diagnosis ships the exact failure mode. So the diagnosis layer, not the generator, is where the value concentrates.

**Why not just use the incumbents.** DoorDash's May-2026 AI suite auto-fills menu/photos/hours at the source. *Rejected:* competing on photo-fixing. *Cost:* that's being commoditized away. Our edge is **cross-blocker diagnosis + routing + the platform-side cases auto-fill can't touch** — and being safe enough to adopt.

---

## Architecture & AI

**Why deterministic-first, LLM-second.** The risky, audited decisions (risk score, blocker, eligibility, send/hold) are pure deterministic code; the LLM only drafts prose. *Rejected:* LLM-scores-and-decides. *Cost:* a model deciding who to contact and whether to send is non-reproducible and unauditable — you can't defend or regression-test it. Deterministic-first makes every decision replayable and gated.

**Why a bounded LLM, not an autonomous agent.** The model gets schema-constrained, single-shot drafting behind guardrails. *Rejected:* an agentic loop with tools/autonomy. *Cost:* autonomy multiplies the failure surface (runaway loops, tool abuse, unbounded spend) for little value here, and the AI-SDR market shows fully-autonomous outbound collapsing (75–90% 3-month churn). Bounded + evaluated is better value-per-risk; the "no autonomous agent" stance is deliberate maturity.

**Why the claims-gatekeeper.** Every *declared claim* in a draft must trace to the merchant's structured data, or it's blocked before a human sees it. *Rejected:* trust the model + a human skim. *Cost:* *Moffatt v. Air Canada* — a company is liable for its bot's false claim; a skim misses a plausible-sounding fabrication. Tying claims to data is the structural antidote. (Boundary: this is forward claim→data checking + forbidden-pattern detection; full prose→claim coverage is a documented Phase-B hardening, not yet claimed.)

**Why these guardrails (no revenue/impact/urgency claims).** Deterministic pattern checks reject the exact claim classes regulators target. *Rejected:* tone/quality guidance in the prompt only. *Cost:* prompt guidance is probabilistic; FTC Operation AI Comply requires *substantiated* claims, so the control must be a hard gate, not a suggestion.

**Why this eval design.** Deterministic graders (structure · state-consistency · policy) score every draft, each paired with a corrupted record it must catch. *Rejected:* an LLM-judge as the primary gate, or eyeballing quality. *Cost:* an uncalibrated judge is a rubber stamp, and "looks good" doesn't regression-test. A grader that can't fail is theater — the corrupted-record tests prove the teeth. (An LLM-judge for *semantic* unsupported claims is a calibrated, key-gated secondary, added with live AI.)

**Why the injection cut (placeholder substitution).** The untrusted business name is never sent to the model; it addresses a `{{MERCHANT}}` placeholder, and the real name is substituted only after generation. *Rejected:* sanitize the name and pass it in. *Cost:* sanitizing strips control chars but not instruction-like wording ("…IGNORE ALL PREVIOUS…"), so passing it in keeps the injection surface open. Not crossing untrusted text into the prompt closes it by construction.

**Why per-call AND cumulative budget control.** A fail-closed guard blocks any call that would breach $5, and a batch threads cumulative spend. *Rejected:* a per-call check only, or trusting a low price. *Cost:* a per-call-only guard lets a batch each pass while the total blows the cap; a runaway loop or mispriced model bills silently. Cost is computed from real reported tokens × a pinned table, and an unknown model fails loud (never $0).

**Why this model (Gemini 2.5-flash class, re-verified at use-time).** Best quality-per-cost for bounded drafting, within the <$5 cap. *Rejected:* pinning a model/price from memory. *Cost:* prices and model availability move under the cutoff; a stale pin 404s or mis-bills. A startup preflight (live ListModels) + a use-time pricing re-check make a retirement a one-line config bump, not a silent failure.

---

## Data, surface, and demo

**Why hybrid data (real entities + synthetic activation).** Real SF businesses (DataSF, public domain) make it recognizable; synthetic onboarding state exists because no public dataset does. *Rejected:* fully synthetic, or scraping a real dataset. *Cost:* fully-synthetic invites "you designed the inputs"; scraping risks ToS/PII/redistribution. A public-domain real layer + a labeled synthetic overlay is realistic, license-clean, and honest. (NAICS is sector-level, so the real layer is Restaurant/Retail only — Grocery/Convenience are left to synthetic, not fabricated.)

**Why human-in-the-loop (hold / reject / send).** High-risk drafts are held for a person; only clean, low-risk ones simulate-send. *Rejected:* auto-send everything the gatekeeper passes. *Cost:* the AI-outreach wave's damage (deliverability, trust, liability) comes from autonomous sending; a human gate is the practitioner-validated control and a deliverability defense.

**Why these metrics (activation funnel · blocker mix · hold/send rates).** They answer "what would this move" for an ops team, co-equal with the AI view. *Rejected:* AI-quality metrics only. *Cost:* a tool that shows model scores but not business impact reads as an engineering demo, not an adoptable product. (Labeled simulated — no real-impact claim.)

**Why desktop-only.** A deliberate, stated scope cut for an internal ops console. *Rejected:* responsive/mobile. *Cost:* time spent on breakpoints that an ops reviewer doesn't need, at the expense of depth. Stated, not hidden.

**Why REPLAY (a recorded/deterministic demo).** The public demo renders recorded results, never a live call. *Rejected:* live AI in the public demo. *Cost:* a public live endpoint can be abused to burn the budget and leak a key. REPLAY = zero spend, reproducible, safe to deploy. (When live Gemini runs, the recording is frozen from a real run — a live call isn't recomputable.)

---

## Honesty & limitations (itself a why)

**Why we label everything "simulated / synthetic" and never claim real impact.** Credibility with a real evaluator depends on it; one overclaim discredits the whole artifact. *Rejected:* presenting the demo as a live product. *Cost:* it would be false and self-defeating. Human-led, AI-assisted, professionally reviewed.

**Honest production gaps (the adoption boundary).** Adoption-*grade* means the architecture, controls, evals, the real-data adapter, and a documented adoption path are credible enough to inherit — **not** "production-ready." Known gaps: auth/multi-tenancy, real integrations (Slack/email/CRM), persistence/observability at scale, the live-LLM eval + an authentic caught-failure (key-gated), and the deeper blocker root-causes that need instrumentation (named in `lib/domain/diagnosis.ts`, not faked). A marketplace inherits it by swapping the real layer of the hybrid dataset for its own export against the adapter's documented contract.

---

## Why this generalizes (the pattern, beyond delivery merchants)

The shape — **deterministic triage + a typed diagnosis layer → bounded, schema-constrained LLM drafting → a claims-gatekeeper that ties every claim to source data → an eval harness → a human-approval gate → audit + cost ledger** — is the reusable answer to *any* "use AI to act on people/accounts at scale, safely" problem where a wrong or fabricated claim is costly. Swap the entity and the blocker taxonomy and the same skeleton serves: SaaS trial-to-paid activation (blocker = setup step not done), patient/member onboarding, lender/KYC document chase, B2B renewal/churn outreach, support-ticket deflection. What stays constant is the *governance spine*: the risky decision is deterministic and replayable, the LLM is bounded and evaluated, every claim traces to data, and a human owns the irreversible action. That spine — not the merchant specifics — is the transferable asset, and it's exactly what the documented AI-outreach failure frontier (false claims, churn, regulatory liability) demands.
