# Executive brief — Menu Integrity Crew

**Type:** explanation · **Audience:** a US delivery platform's executive sponsor · **Written:** 2026-10-14, Wave 2 / exec-layer; corrected 2026-10-31 against the Wave 1 acceptance review and the 2026-10-31 freshness pass · **Contract:** plan §§ 3, 6, 7, 17 (`docs/plan-menu-integrity-crew-2026-10-09.md`); `RULES.md` §4. The same content, with every figure derived in code, is the site's `/pilot` page.

## The answer first

**Proposal.** A six-week pilot on a **labeled, synthetic scenario library** (replay by default; owner-armed live model turns on synthetic data only). The workflow is **designed to** name drift in a platform's copy of a merchant's menu, with evidence, before it would likely become a refund, a dispute or a cancelled agent order. That effect is a **hypothesis**: nothing here has been measured on any platform, and a human signs a proposal; nothing acts.

*In plain words:* we bring invented menus that have gone wrong in known ways, the tool shows what is wrong and why, and a person decides what to propose. Whether it ever runs on your own data is a separate decision, after this pilot.

## What this brief is not claiming

- **Synthetic throughout.** The merchants, menus, orders and fee statements are invented and labeled. This project never holds, receives or renders real platform data.
- **"Shaped like the public integration docs, not from the platform."** Platform names are nominative references to public documentation. No logo is used. No affiliation, partnership, endorsement, access or business impact is claimed or implied.
- **No dollar figure is a measurement.** The cost model is illustrative, with every input labeled an assumption.
- **Demand is unvalidated.** Whether a platform would adopt, build or buy this is untested (plan § 3).
- Human-led, AI-assisted, professionally reviewed. A prototype run on demand, not an operated service.

## What breaks today

A platform's **menu copy** (what shoppers and AI agents read) can drift from the merchant's **system of record**: a wrong price, a missing option, an item still shown after it sold out. As recorded in plan § 3 (read 2026-10-09, re-read 2026-10-31 in `docs/research/freshness-2026-10-31.md`):

- **Agents now order against the copy.** An agentic ordering program with Google's Gemini went live in 2026, with several delivery platforms supported; one platform's grocery app has been inside ChatGPT since 2025-12-17, and the same platform has announced ordering agents of its own (trade press; freshness rows 6a–6c).
- **The platforms name the pain themselves.** One platform's published integration criteria call for real-time menu syncing of prices and modifiers, real-time unavailability and order-error reporting; its merchant learning center ties clear menus to 20 to 50 percent fewer accuracy errors (merchants.doordash.com). Another platform's quality program sets a 99.9 percent injection-success baseline, overwrites a manual menu edit with the next API upload, and gives merchants an Order Errors export with refunds and merchant charges (developer.uber.com; merchants.ubereats.com).
- **Errors are found after the order.** The public documentation describes errors being reported, refunded and charged back after the order. How often the customer is the first to notice is UNVERIFIED.
- **No food standard yet.** UCP's latest release is `v2026-08-25`; its Food Technical Council was seated 2026-07-16 and has published no food schema (ucp.dev; github.com/Universal-Commerce-Protocol/ucp).
- **Monitoring exists.** Merchant-side menu monitors are on the market, and one platform is reported to run its own menu-error model (single source). The open seat is an independent, evidence-grade, agent-aware verifier, not an empty market.

## What the crew is designed to do

| Step | State |
| --- | --- |
| A **deterministic engine** names each drift with its receipt (the claim, the reference row, the rule id, the severity); modifier checks included | **BUILT** |
| A **deterministic explanation** of why (who changed what, when) and a **route table** that names the team | ARRIVES S2 (in progress) |
| **Impact arithmetic**: orders touched, refunds observed, exposure ahead, each figure derived | MERGED 2026-10-31 as a library (`lib/impact`); shown in a run when S2 lands |
| **Model seats** (intake, reviewer) recommend only; each shows **DEFER** on any model that has not passed its exam. A root-cause model seat ARRIVES S2 and shows DEFER | Intake and reviewer BUILT, examined on one model |
| **Slack and email** payloads are built, never sent; a partner ticket ARRIVES S4 | BUILT (Slack, email) |
| A **named person signs a proposal; nothing acts.** The signature is a ledger record | Signing BUILT as an offline simulator; the ledger library MERGED 2026-10-31, its run wiring ARRIVES S2 |

Replay makes no model call and no network request on the crew path; an import-graph test holds that (`evals/crew/crew-import-walk.test.ts`).

## Cost

Replay costs nothing to run. Live runs use **free tiers only** (owner decision 2026-10-12; each free tier's terms are re-verified at use). The **ILLUSTRATIVE** benefit model (plan § 7, not a measurement):

> Benefit per month ≈ orders × error rate × menu-data share × average refund × measured catch rate + dispute minutes avoided × loaded hourly cost + agent cancellations avoided × their cost.

The illustrative fill and its arithmetic are on `/pilot` and in `pilot-proposal.md` § 6, computed by `lib/landing/pilot-figures.ts`; no figure is retyped here. **No catch rate is assumed**: it is measured, or the benefit stays unknown. A platform would replace every input with its own measured figures only after a **separate deployment decision**, outside this pilot.

## Governance

**Tier 0 — notify:** artifacts built, not sent. **Tier 1 — propose:** hold an item, force a re-sync, open a partner ticket; requires a signed human decision, and "executed" means a ledger record. **Tier 2 — act:** out of scope for this pilot. **Tier 3 — never:** amend a merchant record, issue a credit, or file on anyone's behalf. The full model is `../governance-model.md`; which model seat has sat which exam is `../model-risk-register.md`.

## The number you would measure later

**M1 — menu-data-caused order-error adjustments per 1,000 orders** on a cohort versus its baseline, measured with **your** order-error instruments **after** a separate deployment decision. It is **not scored inside this pilot**; its floor is written before any first run (`success-metrics.md`).

## Sources

Plan §§ 3, 6, 7, 16, 17 (2026-10-09; § 3 corrected 2026-10-31) · `docs/research/freshness-2026-10-31.md` · `docs/decision-log.md` 2026-10-12 (free-only, D-7(a)) and 2026-10-14 (synthetic throughout) · `docs/reviews/wave1-acceptance-2026-10-31.md`. This lane did not itself re-read any platform page.
