# Pilot proposal — Menu Integrity Crew

**Type:** explanation · **Audience:** an executive sponsor and a procurement reader at a US delivery platform · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** plan §§ 1, 2, 3, 6, 7, 17 (`docs/plan-menu-integrity-crew-2026-10-09.md`) as amended by D-7(a) and the 2026-10-12 free-only gate (`docs/decision-log.md`). · **Corrected:** 2026-10-31, Wave 2 / exec-layer, from the Wave 1 acceptance review (`docs/reviews/wave1-acceptance-2026-10-31.md`, items 1–3, 8–10, 25): capability sentences now say what is BUILT and what ARRIVES.

## The answer first

**Proposal.** A six-week pilot of a human-gated workflow **designed to** catch, explain, size and route drift in a platform's copy of a merchant's menu, so that the drift is named in workflow before it **would likely become** a refund, an error-charge dispute, a cancelled agent order or a partner-quality enforcement. That effect is a **hypothesis**, not a measured result. Today the catching is BUILT (the engine names each drift with its receipts); the explaining, sizing and routing ARRIVE in a run with S2 (in progress; the sizing arithmetic itself merged on 2026-10-31). **Six weeks on the labeled scenario library** (replay by default; owner-armed live model turns on synthetic data only). Pre-registered workflow metrics on that library decide "expand" or "stop". The one pre-registered business number (menu-data-caused order-error adjustments per 1,000 orders) is **not measured inside this pilot**; it is the number a platform would measure with its own instruments if it later deployed the tool, outside this pilot. Nothing in the pilot changes a merchant record: it stops at *propose*.

*In plain words:* the platform's menu copy goes stale in small ways: a price, a missing option, an item that shows as available after it sold out. The platforms' public documentation describes these errors being reported, refunded and charged back after the order (plan § 3, read 2026-10-09); how often the customer is the first to notice is UNVERIFIED. This workflow is designed to find the drift first and attach the evidence, which is built today, then to say how big it is, say who should fix it and write it all down, which arrive in S2. A named person signs a proposal; nothing acts. The signing exists today as an offline simulator (`lib/approvals/`).

## What this proposal is not claiming

- **Everything on our side is synthetic.** The merchants, menus and orders in the scenario library are invented and labeled. **This project never holds, receives or renders real platform data** (D-7(a), 2026-10-12).
- **Platform-shaped inputs are "shaped like the public integration docs, not from the platform."** Platform names here are nominative references to public documentation. No logo is used. No affiliation, partnership, endorsement, access or real-world impact is claimed or implied.
- **No dollar figure below is a measurement.** The cost-benefit fill is an **ILLUSTRATIVE** set of assumptions, which a platform would replace with its own measured figures only in a later deployment, outside this pilot.
- **Demand is unvalidated.** Whether a platform would adopt this, build it, or buy it is untested; five validation conversations are planned before outreach (plan § 3, S5).
- This is a prototype run on demand, not an operated service. Human-led, AI-assisted, professionally reviewed (`RULES.md` §4).

## 1 · The use case

> *A US delivery platform's operations team needs to know, with evidence, when its copy of a merchant's menu has stopped telling the truth — and what to do about it — before a customer, an AI agent, or a regulator finds out first.* (plan § 17)

**Who uses it.** The pilot starts with two roles: a **Merchant-Ops / Menu-Quality analyst** (owns order-accuracy metrics for a region, signs proposals) and an **Integrations / Partnerships manager** (owns POS and middleware connections, receives the partner scorecard). An Agentic-Commerce PM or engineer (pre-flight check callable from an agent stack) and a Compliance / Legal analyst (fee pre-check, exportable ledger) are the next two personas.

## 2 · The pain, sourced and dated

All items below were read on **2026-10-09** and recorded in plan § 3, then re-read on **2026-10-31** by a freshness pass (`docs/research/freshness-2026-10-31.md`); its corrections are applied below. Sources are primary where it matters.

- **AI agents now order against the platform's copy.** An agentic ordering beta with Google's Gemini was announced 2026-02-25 and went live around 2026-03-11 (the 2026-03-03 date first recorded is UNVERIFIED); the same platform's grocery app has been inside ChatGPT since 2025-12-17; other platforms joined the same Gemini program (trade press, Tier 2, several sources; freshness pass row 6a–6b). The same platform has since announced ordering agents of its own (freshness pass row 6c).
- **One platform's own published integration criteria** list "real-time menu syncing — menu updates, pricing, and modifiers", real-time item unavailability, and "detailed order error reporting". Its merchant learning center says complex modifiers and inaccurate descriptions drive accuracy errors and that clear menus cut them by 20 to 50 percent (merchants.doordash.com, read 2026-10-09 and re-read 2026-10-31; the earlier citation to help.doordash.com was wrong).
- **A second platform's integration quality program** sets a 99.9 percent injection-success baseline, and below 99 percent a partner "can be subject to" API revocation; API-integrated merchants cannot edit menus in its menu tool, and a manual edit is overwritten by the next API upload (corrected 2026-10-31: the 2026-10-09 record had this direction reversed); merchants can download an Order Errors CSV with issue type, item in error, refund, merchant charge and platform-absorbed amount (developer.uber.com and merchants.ubereats.com, read 2026-10-09, re-read 2026-10-31).
- **The standards body has published no food schema yet.** UCP's current release is `v2026-08-25`; its Food Technical Council was seated 2026-07-16 and menu catalog with a modifier tree is Phase 2 (ucp.dev announcements; github.com/Universal-Commerce-Protocol/ucp release and discussion #593).
- **US regulators are looking at fees, not yet at menus.** The FTC's food-delivery-fee rulemaking is at the advance-notice stage (2026-04-16; comments closed 2026-05-18, 438 comments; no proposed rule as of 2026-10-09; federalregister.gov and ftc.gov). NYC enforced its fee caps by hand in April 2026: a settlement above $875,000 including over $580,000 restitution to 380+ restaurants, announced 2026-04-08 (`docs/research/source-lockfile.md` row L13; nyc.gov).
- **Monitoring tools exist.** Merchant-side menu monitors and sync-vendor monitors are on the market (plan § 16). The pitch is not that the problem is unwatched. What this workflow adds is an **independent, evidence-grade, agent-aware, platform-side** verifier with a human-gated crew. Whether a platform would buy this or build it is the open question above.

## 3 · What the platform sees: before and after

| | Before (per the platforms' own docs, read 2026-10-09, re-read 2026-10-31) | After (hypothesis: what the workflow is designed to do) |
| --- | --- | --- |
| Discovery | Order errors are reported, refunded and charged back after the order | **BUILT:** a run, started by hand, names each wrong price, missing option, phantom or unavailable item, with receipts. Starting a run from an order-error row ARRIVES S3 |
| Why | Argued case by case | **ARRIVES S2 (in progress):** a deterministic timestamp-and-actor explanation; an LLM root-cause seat would render DEFER until it passes an exam |
| Size | Known after refunds are issued | **Arithmetic MERGED on `main` 2026-10-31 as a library (`lib/impact`); shown in a run when S2 lands (in progress):** orders at risk, refund dollars, error-charge and agent-cancel exposure, with the arithmetic shown |
| Routing | By hand | **ARRIVES S2 (in progress):** a readable rule table would send it to merchant-ops, integrations or compliance |
| Action | Advice to merchants; integration thresholds (one platform publishes a 99.9 percent injection-success baseline, below which a partner "can be subject to" API revocation, developer.uber.com, re-read 2026-10-31; whether it is enforced by sampling is UNVERIFIED) | A proposal with receipts; a named person signs a proposal; nothing acts. The signing exists as an offline simulator (BUILT); the run-ledger library MERGED on `main` 2026-10-31 (`lib/ledger`); a crew run that writes to it ARRIVES S2 (in progress). Nothing is changed by the tool. |
| For an AI agent | It reads whatever the copy says | **PROPOSED, not built:** a pre-flight check an agent stack would call before ordering an item, answering "safe to order" or "hold" with receipts. No such tool exists today; the `agent-86` scenario (BUILT) holds the engine report such a check would read |

## 4 · Scope

**In scope.** Eight scenarios (below), the artifacts the workflow builds (Slack digest, merchant email, partner ticket, exportable ledger; all **built, not sent**), and the signed-proposal flow.

**Out of scope, by decision.** Live sends · any Tier-2 or Tier-3 action (see `docs/governance-model.md`) · fuzzy id matching as a default · a phone tier · a hosted service · any non-US market.

**BUILT** below means the folder under `fixtures/scenarios/` holds the synthetic inputs and the engine's own report, held by `evals/packs/scenarios.test.ts`. For every scenario, the crew's explanation, impact and routing ARRIVE S2 (in progress); the on-site picker ARRIVES S4.

| # | Scenario | State |
| --- | --- | --- |
| 1 | An agent order cancelled on an unavailable item the copy still showed | BUILT (`agent-86`) |
| 2 | A modifier price differs between the record and the copy across many orders | ARRIVES S1.5 (in progress) |
| 3 | A whole category stale after a sync-vendor outage | BUILT (`sync-outage`) |
| 4 | A platform-side manual edit overwrote the API menu | BUILT (`platform-override`) |
| 5 | A new integration partner's feed scored against published quality criteria | BUILT (`partner-onboarding`); the scorecard against the published criteria ARRIVES S3 |
| 6 | A UCP response that passes conformance and still misquotes a price | ARRIVES S1.5 (in progress) as a scenario (the exhibit exists today in the CLI walkthrough) |
| 7 | A fee statement pre-checked against NYC §20-563.3 for a legal team | BUILT (`fee-precheck`) |
| 8 | A prompt-injected artifact tries to steer the crew | ARRIVES S3 as a scenario (the injection case exists today in the crew evals) |

## 5 · The six weeks

| Weeks | Phase | Who runs it | What data |
| --- | --- | --- | --- |
| 1–4 | **Phase 1 — scenario library** | The platform's reviewers, on the site or the CLI, with our walkthrough | Synthetic only, ours |
| 5–6 | **Review and readout on the scenario library:** pre-registered workflow metrics scored, governance walk-through with the platform's risk team, decision on a separate deployment assessment | The platform's reviewers and risk team, with our walkthrough | Synthetic only, ours |

**What comes back to us, if anything,** is the platform's choice: aggregate numbers the platform decides to share, never rows. The success metrics (`success-metrics.md`) are written so the platform can compute them itself with its own instruments.

**Weekly readout (one page).** Scenarios run · findings by class · proposals signed, withdrawn, expired · time to acknowledge · incidents and near-misses · what changed in the register (`docs/model-risk-register.md`) · open questions.

## 6 · Cost and benefit

**The model** (plan § 7, exactly):

> Benefit per month ≈ orders × error rate × menu-data share × average refund × measured catch rate + dispute minutes avoided × loaded hourly cost + agent cancellations avoided × their cost.

**ILLUSTRATIVE fill.** These are synthetic assumptions, which a platform would replace with its own measured figures only in a later deployment, outside this pilot. None is a measurement. The same arithmetic is computed in code by `lib/landing/pilot-figures.ts`, rendered on `/pilot`, and `evals/packs/pilot-figures.test.ts` fails if this table and that module disagree.

| Input | Assumed value | Basis |
| --- | --- | --- |
| Stores | 1,000 | ASSUMPTION |
| Orders per store per day | 30 | ASSUMPTION |
| Days | 30 | ASSUMPTION |
| **Orders per month** | **900,000** | 1,000 × 30 × 30 (arithmetic) |
| Order-error rate | 1.5 percent | ASSUMPTION |
| Menu-data share of those errors | 40 percent | ASSUMPTION |
| **Drift-caused errors per month** | **about 5,400** | 900,000 × 1.5 % × 40 % (arithmetic) |
| Average refund | $20 | ASSUMPTION |
| **Refund flow exposed to this class, before any catch rate** | **about $108,000 per month** | 5,400 × $20 (arithmetic on the ASSUMPTIONS above; ILLUSTRATIVE, not a measurement) |

**Measured catch rate: none yet.** The formula multiplies the exposed flow by a catch rate. The pilot measures it. This document does not assume a number.

**Anchors, with their limits.**
- A platform's own help center puts the effect of clear menus on accuracy errors at 20 to 50 percent (read 2026-10-09; the platform's statement about its own program, not about this tool).
- A vendor-sourced claim that disputes absorb 2.5 to 3 percent of operator revenue appears in `docs/research/pivot-research-2026-07.md`. It is **vendor-sourced** and is **not used as an anchor**.
- For the fee side, NYC's restitution above $580,000 across 380+ restaurants is roughly $1,500 per restaurant (arithmetic on "over" and "+" figures, so approximate; `docs/research/source-lockfile.md` L13).

**Cost.**
- **Build to a showable state:** three to four weeks on the existing engine (plan § 7). The build cost is ours.
- **Run cost:** $0 in replay. Live runs use free tiers only (owner decision 2026-10-12; each free tier's terms are re-verified at use, `RULES.md` §6); there is no paid tier in the plan.
- **Platform-side cost in this pilot:** reviewer minutes on the scenario library. A later deployment on the platform's own data, if ever agreed, would add exports and mapping work on the platform's side, outside this pilot.

**Intangible.** Merchant trust and retention · a recordkeeping trail of the kind the NYC fee-cap docket and the FTC inquiry point toward (a direction, not a compliance claim) · credibility on agent surfaces · position when the UCP food schema lands. None is quantified here.

## 7 · The one pre-registered number, and exit criteria

**The business number (post-pilot, not scored here):** menu-data-caused order-error adjustments per 1,000 orders on a cohort versus baseline — the number a platform would measure with its own instruments after a separate deployment decision. Its floor is **TBD at pilot start — set before the first run** for documentation only (`success-metrics.md`).

| Decision | Condition (floors are set before the first run) |
| --- | --- |
| **Expand** | Pre-registered workflow and adoption metrics on the scenario library clear their floors, **and** no safety stop condition fired |
| **Stop** | Those workflow or adoption floors miss at the end of week 6, **or** any safety stop condition fires at any time |
| **Safety stop conditions** | An action executed without a signed approval · real platform data ingested into a run this project controls · a prompt-injection that changed a verdict · a seat shown with a label it has not earned |

## 8 · How the workflow is governed

Decision rights, the crew roster, action tiers 0–3, the control register, a RACI and a NIST crosswalk are in [`../governance-model.md`](../governance-model.md). Which model seat has sat which exam is in [`../model-risk-register.md`](../model-risk-register.md). The data path and its sub-processors are in [`security-one-pager.md`](security-one-pager.md). What a platform prepares for its own run is in [`data-request-spec.md`](data-request-spec.md).

## Sources and dates

Plan §§ 3, 7, 16, 17 (2026-10-09). `docs/decision-log.md` 2026-10-12 (D-7(a), free-only, United States only). `docs/research/source-lockfile.md` L13. External sources are cited inline with the date the plan recorded them and the 2026-10-31 re-read (`docs/research/freshness-2026-10-31.md`); **this lane did not itself re-read any platform page.**
