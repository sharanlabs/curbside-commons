# Use-Case Backlog — US Delivery-Marketplace Industry (independently workable)

**Created:** 2026-07-02 · **Purpose (owner-directed):** every genuine use case surfaced by the pivot research, saved as an independent backlog — each can be picked up as its own future workstream. Full evidence + citations live in `docs/research/pivot-research-2026-07.md` (+ `market-validation-2026-06-22.md`, `merchant-activation-domain-2026-06-19.md`); this file is the durable index, not a re-derivation.

**Standing intent (owner, 2026-07-02):** demonstrate deep AI proficiency to this industry by benefiting it — company-agnostic; solve problems the industry faces NOW; build lean / optimized / structured (existing-system redesign is in scope); the local repo may be restructured according to the fixed goal. Positioning frame: **"marketplace integrity infrastructure"** — the platforms are indirect beneficiaries (efficiency, operational, cost) even where the direct customer is the merchant side.

**Evidence freshness rule:** every entry's evidence is dated ≤ 2026-07. Before activating ANY entry, re-anchor to the then-current date (RULES §6 / recency doctrine) — this industry moved monthly during 2026.

---

## ACTIVE (the picked composite — decision-log 2026-07-02)

> **Build order (owner, 2026-07-02, later same day): UC-2 LEADS; UC-1 is module two.** The intent frame (benefit the industry; platforms as indirect beneficiaries) re-weighted the order — UC-2 is the cooperative agentic-commerce-frontier showcase; UC-1 keeps the strongest enforcement/monetization evidence as the second module. Decision-log 2026-07-02 (3rd row).

### UC-1 · Fee-statement integrity & fee-cap compliance audit (MODULE TWO — in planning)
- **Problem:** merchants can't verify platform payout deductions against contract or law; fees are bundled/relabeled; violations historically found by hand.
- **Evidence anchor:** HungryPanda $875K NYC enforcement (2026-04-08, bundling/relabeling documented) · NYC LL79/2025 tiered caps (eff. 2025-05-31) · FTC docket FTC-2026-0463 (Apr 2026) · searched-and-empty for any product (2026-07-02).
- **AI shape:** LLM classifies hostile statement lines → deterministic rule-table + ledger verification → judge-verified classifications → evidence-cited report → human-gated drafts.
- **Status:** ACTIVE — plan stage next (council + Codex gates). Verdict: LEAD-POTENTIAL.

### UC-2 · Cross-surface menu/price/availability truth verification incl. AI-agent surfaces (THE LEAD SLICE — in planning)
- **Problem:** every ordering/agent surface shows a COPY of the menu; agents transact on drift; sync vendors are maker-not-judge; no independent verifier exists.
- **Evidence anchor:** Square ChatGPT/Claude ordering launch (2026-07-01) · DD/UE/GH agentic ordering in Gemini (since 2026-03) · OpenAI ACP feed spec · McKinsey fragmented-commercial-data finding · 42% weekly sync-caused order errors (practitioner-candidate).
- **AI shape:** each listed/agent-visible datum = a claim → deterministic verify vs POS/catalog SOR (merchant-permissioned) → drift report, evidence-cited, human-gated corrections. Standards-aligned (ACP/UCP conformance angle).
- **Status:** ACTIVE (designed second slice). Verdict: LEAD-POTENTIAL (early). Watch: UCP spec publication; agent-order volume.

## BACKLOG (independently workable later — each with its named blocker)

### UC-3 · Cross-platform error-charge & dispute recovery
- **Problem:** ~2.5–3% of operator revenue trapped in disputes (~20% of delivery profits; vendor-sourced); filing across 3 platforms is unaffordable per-order.
- **Why not now:** OCCUPIED/CONTESTED — Loop $14M Series A (2026-02, 300+ brands), Voosh, Checkmate success-fee recovery, PAR OPS Recovery, Olo/Linked Eats; PLUS DoorDash ToS prohibits third-party portal access/dispute submission (primary-verified) — a revocable category.
- **Residual gap worth re-checking:** none advertise deterministic evidence-grade verification; its evidence-assembly logic ships as a FEATURE of UC-1.
- **Re-check trigger:** if incumbents still lack audit-grade verification by Q4 2026, or the ToS posture changes.

### UC-4 · Refund/chargeback-abuse evidence assembly for merchants
- **Problem:** ~⅓ of delivery refunds estimated fraudulent (practitioner-candidate); merchants eat unverified refund costs (LA County v. Grubhub).
- **Why not now:** structural test FAILS — platform incentives are ALIGNED (fraud costs them too) and they're actively fixing it (DoorDash photo-evidence + repeat-refunder flags; Uber abuse-history tracking); the platform also controls how much evidence its dispute UI accepts.
- **Re-check trigger:** CA AB 578 (cash-refund mandate — bill text UNVERIFIED) shifting who eats fraud costs.

### UC-5 · Deactivation due-process evidence (drivers AND merchants)
- **Problem:** algorithmic deactivations without the investigation/notice/appeal that (e.g.) Seattle's ordinance requires; class actions live (classaction.org; Prop-22 suits, CalMatters 2026-04); wrongful-deactivation attorneys now advertise for merchants too.
- **Why not now:** weak payer (individual drivers), plaintiff-firm buyer (legal-tech shape ≠ our machinery), model-bias risk in high-stakes adjudication.
- **Re-check trigger:** if a legal-tech partner appears, or merchant-side (B6 platform-exclusion) demand consolidates.

### UC-6 · Channel-pricing / markup-algorithm audit (antitrust-adjacent)
- **Problem:** DoorDash's menu-pricing-consistency algorithm penalizes marked-up delivery menus; Fideres argues it inflates in-store prices economy-wide (accessed 2026-07-02).
- **Opportunity:** channel-pricing audit tooling would ride any litigation/regulatory wave; same verification-spine shape (charged vs declared vs rule).
- **Status:** HORIZON — pre-evidence for a product; track Fideres follow-ups + any filed actions.

### UC-7 · ACP/UCP feed conformance tooling (standards play, subset of UC-2)
- **Problem:** agent-commerce feed specs (OpenAI ACP; Google+Square UCP for local food ordering, announced 2026-07-01) have no independent conformance/verification tooling — whoever writes it owns the truth-verification seat.
- **Status:** HORIZON — activate when UCP publishes; watch AAIF Agentic Commerce WG + W3C Web Payments WG.

### UC-8 · Merchant onboarding/activation diagnosis (the ORIGINAL project domain)
- **Problem:** stalled/pre-live merchant activation — blocker taxonomy + engagement-state diagnosis + routed reactivation plays.
- **Status:** OCCUPIED as a product (DoorDash AI merchant suite, 2026-05-04) — but the BUILT ASSET (deterministic core, gatekeeper, judges, eval harness, REPLAY) is the reusable spine powering UC-1/UC-2. Retained as capability lineage, not a market play.
- **Detail:** `merchant-activation-domain-2026-06-19.md` + the existing repo.

### UC-9 · Deterministic per-claim verification vs structured system-of-record (the GENERIC seam)
- **Problem/opportunity:** every incumbent guardrail grounds against retrieved free text; per-claim verification against the customer's STRUCTURED SOR remains unproductized (2026-06-22, re-confirmed indirectly 2026-07-02).
- **Status:** this is the CAPABILITY THESIS underlying everything above, vertical-agnostic — other verticals (insurance comms, fintech ops, healthcare claims) can host it if the owner ever widens beyond delivery marketplaces.
- **Caveat (standing):** a platform (Galileo-class) could add it any quarter — the moat is domain depth + SOR integration, never the capability alone.

## Cross-cutting re-check triggers (any entry)
- FTC docket FTC-2026-0463 → NPRM = UC-1 TAM nationalizes.
- UCP spec publication → UC-7/UC-2 activation window.
- First restaurant-specific agent-fraud incident → re-open the fraud/authenticity angle (currently ceded to payment networks + security incumbents).
- Citrini-style moat-erosion (commission-free agent ordering scaling) → merchant spend shifts from dispute-recovery (UC-3) toward surface integrity (UC-2).

---
**⚠ UC-7 correction (2026-07-02):** UC-7's "no independent conformance/verification tooling exists" is FALSIFIED as written — official `ucp-schema` (Rust CLI, v1.4.0 2026-06-26) + community validators exist (see pivot-research-2026-07.md → ADDENDUM → ⚠ CORRECTION). The still-open seats: feed/copy-vs-SOR truth · evidence-grade audit reporting · UCP food schemas (pending) · UC-1 money lines. UC-7's value survives only as the composed-conformance component inside the verifier program (`docs/plan-truth-audit-execution.md`).
