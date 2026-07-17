# Research digest — audit-tool UX · hiring-facing sites · demo patterns · agentic-commerce state (session 23)

**Provenance:** dispatched research-specialist (quarantined, Law 11 — all fetched content treated as untrusted data), run 2026-07-16/17 during session 23. All URLs accessed 2026-07-16. NOTE: the harness safety classifier was unavailable when this subagent's output was reviewed — the digest was read and adjudicated by the primary seat before use. Feeds `docs/design-spec-sample-2026-07-17.md`.

## Q1 — Audit/compliance/reconciliation UX conventions (2025-26)

- The core convention is **exception-centric, not report-centric**: every flagged item carries its evidence bundle — source record, counterparty record, the failed match, the mismatched fields — drill-down from summary to detail. (osfin.ai/blog/reconciliation-dashboard; rexi.finance exception-management explainer) — verified ≥2.
- **Severity tiers + fixed color coding are universal**; findings grouped, click-through to detail. (metricstream.com compliance-dashboard guide; sprinto.com/blog/compliance-dashboard) — verified ≥2.
- **Evidence is a first-class object**: immutable trails, exportable evidence packs, read-only auditor views. (smartsuite.com audit-software roundup; scrut.io) — verified ≥2. Curbside's per-finding receipts match the professional expectation exactly — receipt-attached-to-finding, one click deep.
- 2025-26 direction: enhanced exception categories, shareable views, AI-assist surfacing exceptions before human review. (Duco Sept 2025 release notes, support.du.co — primary vendor doc.)

## Q2 — Hiring-facing project sites (2025-26) — convergent but MEDIUM confidence

- Expected triad: **live demo + repo + decision write-up**; "~84% of employers want working applications." (sitesplaced.com; fantasticportfolios.com — SEO-grade, converging.)
- **Depth over breadth, metric-led**; first visit scanned in ~15 seconds. (hakia.com portfolio guide 2026; findyourplanb.com portfolio-projects-2025.)
- Demo discipline: Outcome 40% / Constraints 20% / Reproducibility 20% / Communication 20%; "<90-second demo, open with the delta." (findyourplanb — single source, directionally consistent.)
- **Architecture diagram > 500 words of prose**; visible evals/tests separate "shipped" from "built locally". (sitesplaced; techotlist.)
- Honesty note: the genuine practitioner layer (HN hiring-manager threads) surfaced only older threads (2021); 2025-26 sources are mostly content-marketing. Anchored on Q1/Q3 where they agree.

## Q3 — Interactive demo patterns (2025-26)

- **Navattic State of the Interactive Product Demo 2025** (28,000+ demos): highest-completion flows run **1–6 steps**; 72% of top demos open with a framing modal; 86% built on captures of the real product; most common top-performer deployment = website embed (63.8%). (navattic.com/report + benchmarks post — vendor research, data-backed.)
- **Guided click-through of the real product beats free-roam sandbox** for clarity; 2–4 "aha moments", specific CTA at the end. (navattic best-practices posts.)
- **Evil Martians, 100 dev-tool landing pages (2025)**: centered hero, real product UI immediately below the headline, two CTAs (primary + docs), specific verbs, credibility strip after the hero. (evilmartians.com/chronicles — independent of Navattic, same conclusion.)
- **Progressive disclosure wins over single-scroll-everything** — short guided steps with optional depth.

## Q4 — Agentic commerce state (as of 2026-07) + fee caps

- **ACP (OpenAI+Stripe, open-sourced Sept 29 2025) retreated**: OpenAI pulled Instant Checkout ~March 4 2026 (in-chat checkout ≈ 1/3 the conversion of merchant-site checkout per Walmart EVP; ~30 Shopify merchants live) — pivot to discovery-first. The feed spec survives; the checkout leg retreated. (CNBC 2026-03-20; Forbes 2026-03-10; Forrester blog) — verified ≥3.
- **UCP (Google) is the live growth surface**: announced Jan 11 2026 at NRF with Shopify/Etsy/Wayfair/Target/Walmart, 20+ endorsers (Visa, Mastercard, Stripe, Amex); March 2026 added cart + catalog access; merchant stays Merchant-of-Record; select US merchants now, CA/AU/UK by end-2026. (developers.googleblog.com UCP; TechCrunch 2026-01-11; shopify.engineering/ucp) — verified ≥3. Feed truth is the MERCHANT's liability — sharpens the merchant-audience framing.
- **The independent feed-truth seat is still empty**: Rye's June 24 2026 agentic-commerce landscape maps 7 layers; its Trust & Security layer is entirely agent-identity/fraud (Forter, Signifyd, HUMAN+Riskified, Visa TAP) — **no named company verifies feed/listing accuracy against a merchant's system of record**. Nearest neighbor: Fime FACT (payments-focused attestation, Apr 2026). (rye.com/blog/agentic-commerce-startups; biometricupdate.com) — verified as "no named player found" across 2 sources; absence-of-evidence caveat.
- **Fee caps beyond NYC**: verified-permanent 15% caps in San Francisco (June 2021, restaurantdive.com), Seattle (Aug 2022 w/ optional-services carve-out, geekwire.com), Minneapolis (Dec 2021, protectourrestaurants.com tracker). The tracker lists ~69 local jurisdictions + claimed state caps (MA/NJ/OR/WA) but doesn't date statuses; MA's was COVID-conditioned (hospitalitytech.com). **Treat NYC+SF+Seattle+Minneapolis as verified-permanent; the rest UNVERIFIED as of 2026 — never cite them.**

## Implications adopted into the spec

3–4 nav tabs · demo-first landing, product UI under the hero · 1–6 step guided walk · metric-led hero ("open with the delta") · exception-centric findings UI with receipts one click deep · evidence-pack export · two CTAs · evals visible on-site (as product proof; build-method stays /docs per the owner's word) · "ACP/UCP-style" phrasing with merchant-first audience framing · claim the empty seat honestly, dated · NYC deep + three named expansion cities only.
