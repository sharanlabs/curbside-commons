# Pivot Research — Real, High-Value, Structurally Underexplored Problems in the US Delivery-Marketplace Industry

**Date:** 2026-07-02 · **Method:** 2 parallel read-only research threads (research-specialist: industry gap map, ~55 sources checked / ~45 used; opportunity-finder: opportunity screen, ~45 checked / 28 used), Law-11 quarantined, Multi-Source Mandate (≥3 sources / ≥2 platform types on load-bearing claims, dated). Builds on `market-validation-2026-06-22.md` + `merchant-activation-domain-2026-06-19.md` (resumed, not redone). **This digest ranks candidates; it does NOT decide the pivot — that is the owner's call (+ Codex cross-check when a direction is proposed).**

## The fixed objective this serves (owner-settled 2026-07-02)

Find a real, high-value, **structurally** underexplored problem in the DoorDash / Uber Eats / Grubhub-class US delivery-marketplace industry (company-agnostic) and solve it with a best-in-class vertical AI solution at **adoption-grade prototype** standard ("could be adopted" = the quality bar, not a literal sales target). Showcase-first, venture-ready. Prefer reuse of the proven verification spine (claim extraction → deterministic check vs structured records → human gate → audit → calibrated judges → cost ledger); evidence can override. Structural = platform incentives/structure prevent them from solving it (cross-platform · counterparty-adverse · compliance cost-centers) — not merely "they haven't gotten to it yet."

## Occupied territory (never propose these — the platforms ship them)

- **DoorDash** (US share ~56–61%, sources vary): AI merchant suite 2026-05-04 (self-serve onboarding auto-population, AI photo edit, AI-Powered Marketer/Smart Campaigns, AI-Powered Websites) [about.doordash.com 2026-05-04 + TechCrunch — verified ≥2]; in-portal error-charge disputes (14-day window, decision "within hours") with a **ToS prohibition on third-party portal access and third-party dispute submission** [help.doordash.com, accessed 2026-07-02 — primary]; Preferred Integrations Program 2026-05-18 (integration quality standards incl. real-time availability + "simplified reconciliation") [about.doordash.com]; menu-pricing-consistency algorithm penalizing marked-up delivery menus.
- **Uber Eats:** AI merchant suite 2025-07-31 (review summarization, AI menu descriptions/photos, Live Order Chat explicitly to prevent order errors) [uber.com newsroom — primary]; 30-day dispute window, auto-flags high-missing-report couriers; consumer AI Cart Assistant 2026-02-11 [TechCrunch + CNBC — verified].
- **Grubhub (Wonder-owned since 2025-01):** weakest AI toolset; 30-day disputes; growth via surface multiplication (Amazon Alexa+, Eater, Beli, Bilt, 2026-06) [about.grubhub.com + PRNewswire — verified].
- **Agentic ordering is arriving from the platform side:** DoorDash/Uber/Grubhub testing true agentic ordering in Google Gemini since 2026-03 [Retail TouchPoints]; DoorDash photo/prompt AI ordering 2026-06-11 [CNBC]; **Square shipped ChatGPT + Claude ordering 2026-07-01** [Business Wire + VentureBeat + PYMNTS — verified ≥2]; OpenAI ACP product-feed spec live; Google+Square co-developing UCP for local food ordering; note OpenAI wound down in-chat Instant Checkout toward merchant-controlled checkout (spec churn is real) [The Drum + Checkout.com, 2026].

## Where merchant pain concentrates NOW (practitioner layer, 2025–2026)

1. **Error charges / chargebacks + refund abuse, with a dispute process operators can't afford to run** — "2.5–3% of operators' total revenue caught up in disputes… ~20% of delivery profits" (vendor-sourced: Voosh CEO via Restaurant Business — labeled); Freddy's recoups >$1M/yr once automated [Franchise Times 2024-05, snippet-level]; ~⅓ of refunds estimated fraudulent (practitioner-candidate).
2. **Effective take-rate & fee opacity** — headline 15–30% commissions become 30–40%+ effective after processing/marketing/promos/refunds [Independent Restaurant Coalition 2025]; Omaha operator paid $188K/yr across 5 restaurants and quit the apps [WOWT 2026-04-19 + Entrepreneur — verified ≥2]; historic fee-cap violations were found **by hand** (Harlem Shake, ~$13.9K over-cap) [classaction.org 2024].
3. **Reconciliation/payout discrepancies + menu-sync truth-drift** — 42% of restaurants report ≥1 order error/week from sync failures (practitioner-candidate, orderout.co citing Grubhub data); DoorDash's own integration-standards program (2026-05-18) is platform-side confirmation.

**Known gap in this evidence (honest):** direct Reddit/X first-person threads were unreachable in both threads (search backend + fetch blocked) — operator voice above is press-mediated/review-corpus. A `last30days` pass on r/restaurantowners etc. remains a standing to-do before any build commitment.

---

## RANKED CANDIDATES

### #1 — Fee-statement integrity & fee-cap compliance audit for merchants (H3, extended) — **LEAD-POTENTIAL**

- **Problem / who has it:** Restaurants on DoorDash/UE/GH/regional apps cannot tell whether fees deducted from payouts are (a) what their contract says and (b) legal under city fee-cap regimes. Platforms bundle, relabel, and misclassify fees on statements; SMB/immigrant-owned merchants eat it silently.
- **Evidence it's real NOW:** NYC DCWP's **first-ever restaurant-side fee-cap enforcement** — HungryPanda settlement, **$875K ($580K+ restitution to 380+ restaurants), announced 2026-04-08**; documented tactics = fee **bundling into single line items, frequent relabeling, mischaracterizing overcharges as "promotion deductions"** [nyc.gov press release + Corbett Restaurant Group Apr 2026 — verified ≥2]. NYC's post-settlement structure (effective 2025-05-31, Local Law 79/2025 + Admin Code §20-563.3) is a **tiered scheme** (15% delivery / 5% basic marketplace / optional 20% enhanced / 3% processing; mandatory ≤23% basic-plan alternative) — per-line-item **classification** is now the compliance question [CNBC 2025-06-04 + Bloomberg + Crain's — verified]. SF keeps a permanent 15% core cap. Federal tailwind: **FTC ANPRM "Unfair or Deceptive Fees in Online Food Delivery Services," Federal Register 2026-04-16, docket FTC-2026-0463** (comments closed 2026-05-18), following Grubhub $25M (FTC+IL AG, 2024-12) and Instacart $60M (2025-12); state AGs urged the FTC to regulate delivery pricing (2026-06, Duane Morris alert) [federalregister.gov + ftc.gov — verified ≥2].
- **Current solutions + the gap:** Loop/Voosh/PAR/Checkmate do error-charge **dispute recovery workflow**; accountants (Aprio/CBIZ) do manual cost-recovery; DeliverGuard is a tiny free reconciliation utility. **Searched-and-empty for any fee-classification / fee-cap compliance-audit product** (both threads, as of 2026-07-02). Violations have historically been caught by hand.
- **Why structurally underexplored (durable):** purely **counterparty-adverse** — no platform will ever ship a tool auditing its own fee-cap compliance — and **cross-platform** by nature. Funded dispute vendors chase the bigger error-charge pool and need platform goodwill (and DoorDash's ToS already prohibits third-party dispute submission), leaving the adversarial-compliance seat empty.
- **Fit with our spine: HIGH — it IS the spine.** LLM parses hostile, relabeled statement line items → each classification **deterministically verified against a structured rule table** (caps by category × jurisdiction × date × opt-in status) + the merchant's payout ledger → evidence-cited findings (matched_row_id / policy_version pattern) → restitution demand or DCWP complaint **drafted but human-gated** → audit trail. Calibrated-judge precision/recall is load-bearing (a false overcharge accusation is costly).
- **Viability killers (named):** (1) jurisdiction-limited TAM (NYC, SF + patchwork) — mitigable: the same engine audits **contractual** fee integrity everywhere (cap-law is the wedge, statement-truth is the product); FTC rulemaking could nationalize disclosure duties. (2) Small per-merchant recovery (HungryPanda avg ≈ $1.5K) — mitigable via 24-month lookbacks, multi-platform coverage, association/law-firm channels. (3) Caps loosened (not tightened) in the NYC settlement — but the tiering *increased* the audit surface.
- **Adoption-grade prototype shape (sketch, not a plan):** ingest synthetic/dummy platform statements + a synthetic POS/payout ledger + the REAL codified NYC/SF fee-rule tables (public law) → per-line-item classification + deterministic cap check → evidence-cited overcharge report + human-gated draft complaint. Honest labels: simulated data, real rules.

### #2 — Cross-surface menu/price/availability truth verification, including AI-agent surfaces (H4 × H5) — **LEAD-POTENTIAL (early)**

- **Problem / who has it:** Every ordering surface (DoorDash/UE/GH listings, and now Gemini/ChatGPT/Claude agent surfaces) shows a **copy** of the merchant's menu, not POS truth. A human shrugs at drift; an autonomous agent **transacts on it** — wrong-price orders, unavailable-item cancellations, refunds and error charges that land on the merchant.
- **Evidence it's real NOW:** Square's ChatGPT/Claude ordering launch **2026-07-01** makes live-catalog truth its headline safety claim — which solves truth **only inside Square's walled garden** [Business Wire + VentureBeat + PYMNTS — verified ≥2]; DoorDash/Uber/Grubhub agentic ordering tests in Gemini since 2026-03 [Retail TouchPoints]; OpenAI ACP feed spec (refresh ≤ every 15 min) is the agent-visible catalog contract [developers.openai.com/commerce]; McKinsey: agentic tools "struggle with fragmented commercial data… conflicting SKU files, inconsistent pricing history" — merchants must prioritize "clean product feeds, unified inventory, agent-facing content" [McKinsey, Merchants Unleashed]; 42%-weekly-order-error stat says drift persists despite the sync stack (practitioner-candidate); a Chowly menu-wipe complaint (single practitioner review — labeled).
- **Current solutions + the gap:** Otter/Checkmate/Chowly/Deliverect **sync**; Checkmate monitors discrepancies *inside its own pipes*; Toast ships a menu-audit tool *within its own integration*. **The syncer is the maker, not the judge** — no independent, cross-surface, evidence-grade verifier of agent-visible/listed data vs POS ground truth exists as a product (both threads, searched-and-empty, 2026-07-02).
- **Why structurally underexplored (durable):** **cross-platform + cross-agent-surface** — no platform verifies competitors' copies; Google/OpenAI won't audit merchant truth; sync vendors won't audit themselves. The independent-verifier seat (maker≠judge, at industry scale) is structurally empty.
- **Fit with our spine: HIGH — direct reuse.** Each agent-visible/listed menu datum is a *claim*; verify deterministically against the POS/catalog system-of-record (merchant-permissioned APIs); score drift; evidence-cite every mismatch; human-gate corrective pushes; eval-gated with measured judge precision/recall.
- **Viability killers (named):** (1) timing — agent order volume still small mid-2026; leading-edge pain (also the opportunity: the ACP/UCP conformance/verification seat is open NOW and unowned). (2) Surface access — reading marketplace surfaces may hit ToS walls (the unofficial DoorDash MCP servers on GitHub scrape internal APIs and say so); mitigable for merchant-owned surfaces + ACP/UCP feeds, with the marketplace surfaces flagged as the hard 20%. (3) Spec churn (OpenAI's Instant-Checkout wind-down proves it). Model-improvement risk is **neutralized** — stale feeds are a data-integrity problem, not a model-capability problem.
- **Adoption-grade prototype shape (sketch):** a merchant-permissioned "truth audit" — POS/catalog snapshot vs ACP-format feed vs simulated surface copies → per-item drift claims, deterministic verification, evidence-cited drift report + human-gated corrections. Standards-aligned (ACP/UCP) so it reads as conformance tooling.

### ★ The composite both threads independently converged on — "the marketplace truth-audit layer"

One deterministic verifier of **what the platforms say vs what your system-of-record says** — money lines (#1) as the monetizable wedge, listing/agent-surface truth (#2) as the growth surface. Same spine, two claim domains. This is the recommended framing IF the owner wants one direction rather than one candidate: it avoids every occupied square, is counterparty-adverse + cross-platform (durable), and reuses the built asset at HIGH fit. (Thread A's explicit recommendation; Thread B ranked its two halves #1 and #2.)

### #3 — Cross-platform error-charge & dispute automation (H1) — **CONTESTED — do not enter head-on**

Real and large pain, but a **funded vendor category**, not white space: Loop AI **$14M Series A Feb 2026** ($20M total; 300+ brands incl. McDonald's, Whataburger) [Restaurant Technology News 2026-02 + Crunchbase — verified]; Voosh (YC, 500+ brands, 60–70% win-rate claims); Checkmate success-fee "revenue integrity"; PAR OPS Recovery; Linked Eats = Olo's strategic partner. **Plus the ToS time-bomb:** DoorDash's terms prohibit third-party portal access/dispute submission (primary-verified) — the whole category is structurally revocable by the counterparty. Residual gap (none advertise deterministic evidence-grade verification) is real but a funded incumbent could add it next quarter. **Verdict: enter only as the verification engine inside #1/#2, never as a me-too.**

### #4 — Agent-order authenticity / AI-fraud defense (H5 fraud sub-angle) — **CONTESTED / EARLY**

Payment networks (Visa/Mastercard agent tokens), PSPs (Stripe shared payment tokens in ACP), and security incumbents (Palo Alto Unit 42, Pindrop) are building the horizontal layer; a solo vertical wedge gets squeezed. Our defensible slice is the **data-truth** side (#2), not identity/fraud. Re-entry trigger: first restaurant-specific agent-fraud incident. (Fraud stats here are vendor/secondary-chain — labeled candidate; the "Air Canada Jan-2026 agent rebooking" anecdote is single-vendor-blog — **do not cite**.)

### #5 — Refund/chargeback-abuse evidence assembly (H2) — **AVOID standalone**

Platform incentives are **aligned** with merchants here (fraud costs platforms too) and they're fixing it themselves (DoorDash photo-evidence requirements + repeat-refunder flags; Uber refund-abuse history tracking) — the structural test fails. Hard cap: the platform controls how much evidence its dispute UI even accepts. Its evidence-assembly logic survives as a **feature** of #1.

### #6 — Driver deactivation due-process evidence (new find) — **AVOID (for us)**

Genuinely underexplored and counterparty-adverse (Seattle Deactivation Rights Ordinance class action vs DoorDash; Prop-22 deactivation suits [classaction.org + CalMatters 2026-04]) — but the payer is weak (individual drivers), the natural buyer is plaintiff firms (legal-tech shape, not our asset's shape), and high-stakes adjudication triggers the model-bias killer. Logged as a lead for someone else's pipeline. (Adjacent horizon: **merchant** deactivation without recourse — wrongful-deactivation attorneys now advertise for merchants — same shape, same caution.)

---

## Regulatory timeline (compliance demand 2026–2027, mostly feeding #1)

FTC ANPRM on delivery fees (2026-04-16, docket FTC-2026-0463; comments closed 2026-05-18) · state AGs urging FTC action (2026-06) · FTC+IL AG v. Grubhub $25M (2024-12; junk fees, driver-pay deception, up to 325K restaurants listed without consent) · NYC tiered fee caps effective 2025-05-31 + open DCWP fee-cap docket + delivery-worker minimum pay $22.13/hr from 2026-04-01 · Seattle App-Based Worker Minimum Payment + Deactivation Rights Ordinance (eff. 2025-01-01) · CA Prop 22 upheld (2024-07) · CA AB 578 (signed 2025-10: cash refunds, not app credits — single-source, UNVERIFIED against bill text). Pattern: the fee-cap era is becoming a **fee-transparency/tier-disclosure era** — the compliance surface is growing even where caps loosened.

## Horizon (off-radar, tracked, not screened)

- **FTC docket FTC-2026-0463 progression** — an NPRM nationalizes #1's TAM overnight. Re-check trigger.
- **UCP spec publication** (Google+Square, local food ordering) — whoever writes the conformance/verification tooling owns the #2 seat. Watch AAIF Agentic Commerce WG + W3C.
- **Fideres antitrust angle** on DoorDash's pricing-consistency algorithm — channel-pricing audit tooling would ride any litigation wave.
- **DoorDash moat-erosion thesis** (Citrini note, candidate): commission-free agent ordering (Square 2.9% vs 15–30%) shifts merchant spend from dispute-recovery toward agent-surface integrity — strengthens #2 over #3 over time.
- Ghost-kitchen/virtual-brand integrity: checked and **dropped** (platforms self-policed; structural test fails).

## Explicit UNVERIFIED / candidate labels

"2.5–3% of revenue in disputes" (vendor CEO via trade press) · Chowly menu-wipe (single review) · Pindrop/WEF fraud stats (vendor chain) · "60% of refunds are fraud" (podcast title) · AB 578 details (bill text unchecked) · FTC labor-practices track (headline-level) · DoorDash share (56–61%, sources vary) · Loop win-rate/verification-depth internals (marketing claims — a teardown would settle #3's residual gap) · Air Canada Jan-2026 agent incident (do not cite).

## Standing research to-dos (before any build commitment on a chosen candidate)

1. `last30days`/Reddit first-person pass (r/restaurantowners, r/smallbusiness, r/KitchenConfidential) — operator voice is press-mediated in this digest (both threads blocked from Reddit).
2. Video layer (`video-research`): Loop/Voosh founder demos + FODC 2025-2026 delivery-chargeback panels — settles how deep incumbent "dispute AI" really is.
3. For #1: verify AB 578 bill text; pull NYC Local Law 79 + Admin Code §20-563.3 primary text into a codified rule table; per-merchant economics validation (user-pain-validator or council).
4. For #2: ACP/UCP spec primary reads; surface-access legality check (what can be read merchant-permissioned vs ToS-walled).
5. Council deep-validation ("agents gather") on the owner's chosen candidate; Codex cross-check before the pivot is treated as decided (consequential).

## Verdict of this research pass (not a decision)

The owner's bar — high-value, not run-of-the-mill, structurally unexplored, adoption-grade-feasible, spine-reusing — is met by **#1 (fee-statement/fee-cap audit)** now-monetizable-but-narrow, and **#2 (cross-surface truth verification)** wide-but-early; both threads independently recommend the **composite truth-audit layer** with #1 as the wedge. #3 is occupied by funded vendors, #4 by security incumbents, #5 fails the structural test, #6 mismatches the asset. **Next gate: the owner picks a candidate (or the composite, or rejects all) → then plan/roadmap.**

---

# ADDENDUM — UC-2 PRIMARY READS (2026-07-02, plan stage; inline main-session research after the 4 subagent threads died on the shared seat limit — raw error: "You've hit your session limit · resets 9pm (America/New_York)")

**Method note:** executed inline by the main session (WebSearch/WebFetch, quarantined-as-data), same citation discipline. Plain English: we read the actual rulebooks (the OpenAI and Google commerce specs, the NYC fee law, the California refund law) instead of trusting summaries.

## A. ACP (Agentic Commerce Protocol) — primary read

- **Governance/license:** maintained by **OpenAI + Stripe as Founding Maintainers**, "clear path toward broader community governance"; **Apache 2.0**; status **beta**; date-based versioning, releases 2025-09-29 → **2026-04-17 (latest stable; adds Cart, Feed, Orders, Authentication, MCP)** [github.com/agentic-commerce-protocol/agentic-commerce-protocol README, accessed 2026-07-02 — verified vs developers.openai.com/commerce].
- **Product feed spec** [developers.openai.com/commerce/specs/file-upload/products, accessed 2026-07-02]: requirement style = **Required / Optional / "Required if"** (NOT RFC-2119). Concrete conformance surface extracted: ~14 required fields (item_id stable ≤100 chars; title ≤150; description ≤5000 plain-text; url must resolve HTTP 200; brand ≤70; image_url JPEG/PNG; **price + ISO-4217 currency**; **availability enum** in_stock|out_of_stock|pre_order|backorder|unknown; seller_name/seller_url; is_eligible_search/is_eligible_checkout; target_countries/store_country ISO-3166) + conditionals (**availability_date required iff pre_order**; **seller_privacy_policy+seller_tos required iff checkout-eligible**; unit fields iff dimensions/weight) + **cross-field invariants** (sale_price ≤ price; is_eligible_checkout ⇒ is_eligible_search) + variant grouping (group_id/variant_dict). **Stable vs Draft published in parallel** ("Use Stable for supported file upload integrations").
- **Shape gap (load-bearing, honest):** the feed spec is **retail-shaped — no menu/modifier/allergen/hours model** as of 2026-07-02. Restaurant menus ride the generic item model; our synthetic menu→ACP-feed mapping is itself a contribution and must be labeled as our interpretation, not spec text.
- **Freshness cadence:** the digest's "refresh ≤ every 15 min" claim was **NOT found** in the feed spec or feeds-API pages (only `updated_at`, `expiration_date`, `availability_date`) → **DOWNGRADED to UNVERIFIED**; re-check under guides before citing.
- **Conformance tooling: ABSENT** — no validator/test-suite/linter in the official repo or docs (checked 2026-07-02; repo carries OpenAPI specs + JSON Schemas + examples + RFC/SEP process only). Feeds API returns only a generic `400 Bad Request` on invalid payloads. **The conformance seat is empty (ACP), primary-confirmed.**

## B. UCP (Universal Commerce Protocol) — status correction + primary read

- **CORRECTION to this digest's timeline:** UCP was **unveiled 2026-01-11 at NRF** (not "announced 2026-07-01" — that was the Square/local-food angle reaching our sources): open-source spec **live** at ucp.dev + **github.com/Universal-Commerce-Protocol/ucp**, **Apache 2.0** ("Copyright 2026 UCP Authors"), spec version **2026-04-08** published [ucp.dev + developers.googleblog.com + InfoQ 2026-01 — verified ≥2, accessed 2026-07-02].
- **Normative style: RFC-2119/8174 MUST/SHOULD** — a real conformance target. Capabilities: `dev.ucp.shopping.{checkout,cart,catalog,order}` + `dev.ucp.common.identity_linking`; extensions declare `requires`; **JSON Schemas per capability** (e.g. `/2026-04-08/schemas/shopping/catalog.json`); "Platforms MUST resolve schemas client-side by fetching and composing base schemas with active extension schemas". Transports: REST + JSON-RPC/**MCP** + A2A + Embedded. Versioning YYYY-MM-DD + `supported_versions` profile mapping.
- **FOOD VERTICAL EXISTS — co-developed by DoorDash, Square, Toast, Uber Eats** (ucp.dev lists them as the Food group; "conversational food ordering… nuanced meal customization, real-time availability"), but the 2026-04-08 overview defines **no food-specific schemas yet** — an "emerging vertical". [ucp.dev, accessed 2026-07-02]
- **Conformance tooling: no formal suite** — Playground + reference implementations + code samples only. **The conformance seat is empty (UCP), primary-confirmed.**

## C. Surface-access legality (plan-grade map; build-stage verification named)

- **GREEN (confirmed):** both spec corpora **Apache 2.0** → third-party conformance tooling explicitly permitted. **Square Catalog API `ITEMS_READ` OAuth scope** = the designed merchant-permissioned third-party read path (seller reviews + approves scopes) [developer.squareup.com OAuth permissions reference, accessed 2026-07-02]. Own synthetic sandboxes: green by construction.
- **GREEN (by design, verify at build):** merchant-permissioned reads via other POS (Toast partner-gated, Clover, Lightspeed) — access models UNVERIFIED here.
- **RED (unchanged from the main digest):** scraping DD/UE/GH consumer surfaces; DoorDash ToS third-party-portal prohibition (primary-verified earlier). **YELLOW/to-verify:** DD/UE official menu-API read-back scope for merchant-authorized providers.
- **The clean core stands:** specs + synthetic feeds + own-sandbox + merchant-permissioned POS reads suffice for the full toolkit + demo — the S-1 reframe's ToS-killer deletion is confirmed against primary access models.

## D. Module-two regulatory texts (lighter prep)

- **NYC: § 20-563.3 "Fee caps" CONFIRMED as the operative section** (amlegal codelibrary index). **LL 2025/79 effective 2025-06-30** [intro.nyc/local-laws/2025-79] — the digest's "effective 2025-05-31" needs primary re-confirmation (**flagged**; enactment vs effectiveness may explain the gap). Operative language captured (indexed snippet, to re-verify verbatim at codification): *no fee other than a basic service fee, delivery fee, or transaction fee; enhanced service fees chargeable alongside a basic service fee, totaling ≤20% of the purchase price per order, or monthly-average ≤20% alternative.* **Full section text = named module-two build to-do** — amlegal returns HTTP 403 to our fetcher (browser access or NYC.gov PDF needed); LL79 PDF fetched but unparseable in-session (no poppler installed).
- **CA AB 578 — UNVERIFIED label RESOLVED (primary-located):** "Food delivery platforms: customer service" (Bauer-Kahan), **signed 2025-10-06** [leginfo.legislature.ca.gov bill_id=202520260AB578]: **full refund** for undelivered/wrong orders (fraud/customer-fault exceptions), gratuity refunded to customer **without deducting from the driver**, partial-order proration of charges/taxes/fees/gratuity, and **human customer-service access** when a chatbot fails. **Assessment: consumer-protection scope — adjacent to module two (statement/fee truth), not core fee-cap material.** The prior "cash refunds not app credits" one-liner was directionally right but incomplete.
- **FTC docket FTC-2026-0463:** no post-comment-close movement checked this pass (to-do at module-two build; not load-bearing for the UC-2-first plan).

## E. Operator-voice pass — honestly still blocked

Reddit remains **unreachable from this environment** (subagent threads seat-limited; inline WebSearch returned no usable results; `site:` operator unsupported). **Third blocked attempt across sessions.** The operator-voice gap stays OPEN and press-mediated evidence stands as-is. Named to-do: an owner-assisted or browser-based pass (r/restaurantowners, r/KitchenConfidential) before build commitment — the council's user-pain-validator must treat operator voice as **press-mediated only**.

## Validator implications (what Phase 4 designs against)

1. **The seat is empty on BOTH protocols, primary-confirmed 2026-07-02** — no official or third-party conformance tooling found in either official repo/docs.
2. Both Apache-2.0 → an open validator is legally clean and ecosystem-cooperative (intent-frame fit).
3. **ACP validation = deterministic field/constraint/cross-field checks** (typed limits, enums, conditionals, invariants) — exactly our spine's deterministic-check shape; plus Stable-vs-Draft and date-version awareness.
4. **UCP validation = RFC-2119 + JSON-Schema composition conformance** (base + extensions + `requires` + version mapping) — machine-checkable MUST/SHOULD surface.
5. **Truth-audit (drift) sits ABOVE spec conformance:** a feed can be 100% spec-valid and still lie vs the POS system-of-record — conformance (module 0) and truth (module 1) are distinct, separable checks; UC-1 (module 2) reuses the same claim-verify engine on money lines.
6. The menu-domain gap (ACP retail-shaped; UCP food emerging) means our restaurant mapping is an honest interpretation layer — label it; watch UCP food-schema publication as a **re-check trigger** (whoever aligns with it first owns the seat).
7. Spec churn is real (5 ACP releases in 8 months) → version-pinned rule tables + a freshness check in the validator itself (our RULES §6 discipline productized).

### ⚠ CORRECTION (2026-07-02, same day — council pass, live-verified): "seat empty" was OVERSTATED

The council's idea-sharpener live-verified and **falsified** implication #1 above: the official UCP org DOES ship a validator — **`ucp-schema` (Rust CLI, v1.4.0 released 2026-06-26, github.com/Universal-Commerce-Protocol/ucp-schema)** — my repo check missed org-level sibling repos. Also live: a third-party **ACP *checkout* validator** (nekuda-ai/acp-validator-cli, 151 tests) and **ucptools.dev** ($9/mo monitoring); an ACP *feed* validator is referenced at agenticcommerce.pro (single-source, 403 on verify — UNVERIFIED). **What remains empty (re-verified through the correction): the truth/drift-vs-POS-system-of-record layer, evidence-grade audit reporting, UCP FOOD schemas (pending publication), and UC-1's money-lines domain.** Consequence for the plan: "first ACP/UCP validator" is DEAD as an identity; the artifact composes/wraps existing validators (Apache-2.0) and lives ABOVE conformance — "spec-valid feeds can still lie." Implications #2–#7 stand; #1 is superseded by this block.
