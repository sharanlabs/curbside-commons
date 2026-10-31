# Executive brief — Menu Integrity Crew

**Type:** explanation · **Audience:** a US delivery platform executive sponsor · **Written:** 2026-10-14, Wave 2 / exec-layer · **Contract:** plan §§ 3, 6, 7, 17; `RULES.md` §4.

## The answer first

**Proposal.** A six-week pilot on a **labeled synthetic scenario library** (replay by default; owner-armed live model turns on synthetic data only). This project never holds, receives, or renders real platform data. Platform names are nominative references to public documentation only.

## What breaks today

A platform’s **menu copy** (what shoppers and AI agents read) can drift from the merchant’s **system of record** — wrong prices, missing modifiers, items shown available after they are 86’d. As read **2026-10-09** (plan § 3): agentic ordering is live on major surfaces (DoorDash × Gemini beta **2026-03-03**; DoorDash in ChatGPT since **2025-12**; Uber in the same Gemini program, trade press **2026-02-26** / **2026-03-03**). DoorDash’s published integration criteria and help center call out real-time menu sync, modifiers, 86’ing, and order-error reporting, with menu clarity tied to accuracy errors (**merchants.doordash.com**; **help.doordash.com**, read **2026-10-09**). Uber Eats’ quality program sets a **99%** injection-success floor, documents Menu Maker overwriting API menus, and offers an Order Errors export (**developer.uber.com**; **merchants.ubereats.com**, read **2026-10-09**). UCP’s Food Technical Council was seated **2026-07-16**; release **v2026-08-25** has **no food schema published** yet (**ucp.dev**; GitHub discussion #593). Discovery still often starts with the customer complaint — not a claim this tool has run in production.

## What the crew does

The **deterministic engine** decides verdicts with receipts on every finding; **three bounded LLM seats** (intake, root-cause, reviewer) recommend only and show **DEFER** until a model passes its exam; a **human signs a proposal; nothing acts**; runs **replay by default**; **zero egress** on the crew path is proven by import-graph tests. Outbound Slack, email, and partner-ticket payloads are **built, not sent**.

## Cost (free tiers only)

Run cost in replay is **$0**; live runs use **free tiers only** (decision **2026-10-12**). **ILLUSTRATIVE** benefit model (plan § 7 — not a measurement):

> Benefit per month ≈ orders × error rate × menu-data share × average refund × measured catch rate + dispute minutes avoided × loaded hourly cost + agent cancellations avoided × their cost.

A platform would replace every input with its own measured figures only after a **separate deployment decision**, outside this pilot.

## Governance

**Tier 0 — notify:** artifacts built, not sent. **Tier 1 — propose:** hold, re-sync, or ticket — requires a signed human decision; “executed” = a ledger record. **Tier 2 — act:** out of scope for this pilot. **Tier 3 — never:** amend a merchant record, issue a credit, or file on anyone’s behalf. [`model-risk-register.md`](../model-risk-register.md) records which seat has sat which exam on which model.

## The number you would measure later

**Menu-data-caused order-error adjustments per 1,000 orders** on a cohort versus baseline — measured with **your** order-error instruments **after** a separate deployment decision; **not scored inside this pilot** (`success-metrics.md`, metric **M1**).

## What is synthetic

Everything on our side: merchants, menus, orders, fee statements, and scenario events. Bundled walkthrough figures are **derived** in `lib/landing/test-guide.ts` and held equal to an engine run by `evals/packs/test-guide.test.ts`. Human-led, AI-assisted, professionally reviewed.
