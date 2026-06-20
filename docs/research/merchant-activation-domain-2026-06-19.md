# Research digest — stalled / pre-live merchant onboarding on delivery marketplaces

**As of 2026-06-19** · depth: deep · read-only, quarantined (Law 11) · via `research-specialist`. This is the cited basis for the `lib/domain` diagnosis layer and feeds the Phase-D why-chain docs. Sources are official-first + practitioner, cross-verified where load-bearing; practitioner-candidate and unverified items are labeled.

## The discrimination test (what makes the domain layer non-trivial)

The pinned core maps `steps_completed → current_blocker_code` 1:1. A diagnosis layer that re-derives "step N ⇒ blocker X" **adds nothing**. It earns its keep only by explaining **WHY** (same step → multiple root causes → different plays) and **engagement state**. Two cause types:

- **Step-aligned** (verification, menu, photos, hours, bank): `steps_completed` says WHERE; the WHY usually needs a **new sub-signal** (needs-instrumentation).
- **Cross-cutting** (motivation/ghosted, pricing confusion, POS/hardware, store-info, tax, platform-side exclusion): `steps_completed` doesn't even identify them.

**The one discriminator computable with NO new fields:** `last_login_days_ago × steps_completed × days_since_signup` → **actively-stuck** (recently active, low steps, aging = engaged-but-blocked) vs **ghosted** (inactive + barely started = abandonment). Snapshot inference, not a measured event; maps to the existing `risk_reason_codes` primitives. → implemented in `lib/domain/diagnosis.ts:engagementState`.

## 1. Blocker taxonomy

**Group A — step-aligned (merchant-side; WHERE known, layer adds WHY):** A1 business/identity verification (legal name/EIN must match IRS or it stalls); A2 menu friction (blank / failed ingestion / QA-blocked); A3 photo rejection (11 documented reasons — resolution, framing, lighting, overlays, people, mismatch…); A4 hours/availability not populated ("tablet off ⇒ store hidden"); A5 banking/payout incomplete (or Stripe fraud flag). — all verified (DoorDash SSIO developer docs + Merchant Help Center).

**Group B — cross-cutting (NOT identifiable from `steps_completed`):** B1 low motivation / unclear value / ghosted ("post-launch silent churn"); B2 pricing/commission confusion (DoorDash 15/25/30% tiers + ~2.5–3% processing → effective take-rate fear); B3 hardware/tablet/POS ("tablet hell"; device ~7 days then ~1 business day to activate); B4 store-info/profile quality gaps; B5 tax/compliance docs (W-9 / CP2100); **B6 platform-side ineligibility** (duplicate location, virtual-brand/self-delivery detected, already-live-on-POS, fraud `STORE_NOT_ACTIVE`, missing CRM record) — **NOT the merchant's unfinished work**. — verified (SSIO codes + CS-onboarding + commission sources).

> Provenance flag: SSIO status/exclusion codes are from DoorDash's **POS-integration path** — instrumentation targets, **not** fields in the synthetic self-serve model. Modeled + labeled, never fabricated.

## 2. Reactivation plays (long-tail economics: default self-serve, reserve high-touch)

Trigger on "signup complete + no action after 24h"; time-bound nudge; multi-touch 5–7 days apart; 30-day reminder vs 90-day incentive. **#1 reason reactivation fails = generic outreach not matched to the specific blocker** (independently validates this project's thesis). Per category: verification/tax → "match your IRS info" fix; menu → menu tool + auto-populate; photos → spec + the in-app photo tool + the rejection reason; hours/store-info → one-click checklist; banking → "verify your bank to get paid" (payout anxiety is a top stall); motivation/ghosted → **re-engage first** (value-prove + time-limited reason), not a step nudge; pricing → a "what you'll actually pay" calculator; hardware → track device shipment, ops nudge; **B6 platform-side → ops escalation, NEVER a "finish your setup" nudge** (wrong + erodes trust). CS-platform pattern to emulate (Gainsight/ChurnZero): onboarding playbook on entry + risk playbook when health drops. → implemented as `play(blocker, engagement)` routing.

## 3. Detection signals

- **Detectable now (existing fields):** actively-stuck vs ghosted (the discriminator); coarse step bucket (= `current_blocker_code`, pick the message only).
- **Needs-instrumentation (named, not invented):** `verification_status`/`business_info_match_flag`, `menu_status`+`menu_item_count`, `photo_rejection_reason`, `hours_populated_flag`/`address_complete_flag`, `bank_verification_status`/`fraud_hold_flag`, `plan_tier_selected`, `pos_integration_flag`/`device_status`, `exclusion_code`, and the highest-value one: **`blocker_source` (merchant-side vs platform-side)** — the nudge-vs-escalate discriminator. Reuse `docs/data-audit.md` field names for drop-in spec value.

## 4. 2026 context + failure frontier (net-new, cited)

- **DoorDash AI merchant suite (May 4 2026):** self-serve onboarding auto-populates photos/hours/menu from a merchant's web presence ("launch 35% faster"); AI photo editing; AI-Powered Marketer (auto email outreach). ⇒ incumbents attack A2–A4 **at the source**; our edge is **cross-blocker diagnosis + routing + the platform-side cases auto-fill can't touch**, not photo retouching. (about.doordash; TechCrunch 2026-05-04; QSR; PYMNTS.)
- **Shopify Sidekick + Pulse (Winter '26):** Pulse = proactive background layer surfacing "what's happening, why, next steps" unprompted — the pattern to emulate.
- **Amazon Project Amelia → "Seller Assistant":** proactive monitoring + permissioned autonomous actions.
- **Failure frontier (design AGAINST):** *Moffatt v. Air Canada* (Feb 2024 — company liable for its chatbot's false claim; "separate entity" defense rejected) ⇒ we own every generated claim. *FTC Operation AI Comply* (Sept 2024, ongoing — "no AI exemption"; substantiate every claim) ⇒ our guardrails are on-point. *AI-SDR collapse* (75–90% 3-month churn; 40–60% pilots paused in 90 days; "fully-autonomous SDR is dead — winners orchestrate AI + human + signal") ⇒ validates the human-in-the-loop gate + signal-driven (not blast) design.

## Gaps / open (honesty)

- **First-person practitioner voice is thin** — reddit/X operator threads weren't reachable; blocker categories rest on official docs + a marketplace-onboarding teardown + integration-vendor "what-to-expect" docs (not verified-practitioner). Treat operator-sentiment specifics as practitioner-candidate. Next: `last30days`/`pulse` for Reddit/X.
- **"Verification takes weeks"** is a Shopify-community analog, **not** DoorDash evidence (DoorDash/Stripe say "a few days").
- **SSIO codes** are POS-path-specific — confirm which surface for plain self-serve before coding as universal.
- **High-signal VIDEO sources to transcribe** (not synthesized — read-only): DoorDash Merchant Onboarding series; the DoorDash Tablet how-to guide. Run `video-research` if deeper hardware/go-live detail is wanted.
