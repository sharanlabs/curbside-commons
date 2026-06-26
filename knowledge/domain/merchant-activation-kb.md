# Merchant Onboarding & Activation — Domain Knowledge Base
### Local-commerce delivery marketplaces (DoorDash / Uber Eats / Grubhub-class, company-agnostic)

**As of: 2026-06-26** · Compiled read-only + quarantined (Law 11) via `research-specialist`.
Feeds: the Domain Critic agent (A3) + the domain-quality rubric (B1).
Supersedes + expands: `docs/research/merchant-activation-domain-2026-06-19.md`.

> **HONESTY BANNER — read first.** This is **researched, source-cited domain knowledge plus
> reasoned judgment — NOT a credentialed practitioner's or marketplace-insider's expertise.**
> The authors have **no real DoorDash / Uber Eats / Grubhub internal access, data, or business
> relationship.** Every load-bearing claim is tied to a public source in `SOURCE-REGISTRY.md`
> and labeled by confidence. Items that could not be live-verified are labeled UNVERIFIED or
> practitioner-candidate rather than asserted. Section 4 (honesty/risk frontier) is **not legal
> advice**; it summarizes public regulatory sources and reasons about them.

**Confidence labels used throughout:**
- `verified` — corroborated by ≥2 independent sources, or a primary official source.
- `practitioner-candidate` — single practitioner/vendor source or training-era knowledge; plausible, not cross-verified.
- `illustrative` — a specific statistic/threshold used to show DIRECTION; do NOT encode as a hard rubric value.
- `UNVERIFIED` — could not be confirmed this session; flagged for follow-up.

---

## 0. How to read this KB (the discrimination test)

The product's pinned core already maps `steps_completed → current_blocker_code` 1:1. A diagnosis
layer that re-derives "step N ⇒ blocker X" **adds nothing.** This KB earns its keep by encoding
the two things that 1:1 map cannot express:

1. **WHY** a merchant is stuck (same step → multiple root causes → different correct plays), and
2. **ENGAGEMENT STATE** (is this merchant engaged-but-blocked, or gone?).

A second discriminator the step number cannot express at all is **`blocker_source`**:
**merchant-side** (the merchant has unfinished work) vs **platform-side** (the marketplace is
blocking them — duplicate location, fraud hold, ineligibility). These get *opposite* plays.
A diagnosis or play that ignores `blocker_source` or engagement state is the failure this KB
exists to catch.

---

## 1. The onboarding blocker taxonomy

### 1.1 The canonical go-live skeleton (company-agnostic) — `verified`

Cross-verified across DoorDash, Uber Eats, and Grubhub: all three share the same ordered
skeleton. Names differ; the gates are the same.

| # | Step | What it is | DoorDash | Uber Eats | Grubhub |
|---|------|-----------|----------|-----------|---------|
| 1 | **Account + business/identity verification** | Legal entity, tax ID, owner identity | Account; Legal Business Name, EIN, Owner name + DOB | Signup form + business details; ID document + business license verified | Account creation |
| 2 | **Store configuration** | Address, hours, order-handling settings | Store settings (hours, address) | Operational details, delivery prefs | Restaurant info + hours |
| 3 | **Menu / catalog** | Items, modifiers, pricing | Add items (+ Menu Pull/ingestion + QA) | Upload menu/catalog | Menu built **by Grubhub menu team** (2–3 days) |
| 4 | **Photos** | Item/store imagery | Add photos (AI tools available) | Manual photo review (≤3 business days) | Photo setup |
| 5 | **Pricing / plan** | Commission tier selection | Basic / Plus / Premier | (plan/commission) | (plan/commission) |
| 6 | **Banking / payout verification** | Bank + KYC for payouts | Routing + account #; payouts Thursdays | Bank statement/card photo + ID; **no payments until verified** | **W-9** + bank + payment frequency |
| 7 | **Final review / test / activation** | Confirm + go live | Review menu → "Open My Store" | Activate in Uber Eats Manager | **Test order** → "Go live" |

*Sources: DoorDash Get-Started (official); Uber Eats Setup + Verification + Help (official);
Grubhub Self-Activate (official). See registry.*

**Timeline reality (supersede of the prior digest's unverified "weeks" claim) — `verified`:**
Self-serve go-live is **days, not weeks.**
- DoorDash: ~40% of SMB restaurants onboard the **same day** they sign up; integration QA
  passes → activation within **1 business day**; tablet within **7 days** of confirmation.
- Uber Eats: "**a few days**"; store creation can be near-instant once logged in, but
  **payment processing is gated on ID + bank verification**.
- Grubhub: menu-team build **2–3 days**; cross-source comparison puts DoorDash/Grubhub at
  **~3–4 days**.
- **The long tail is the exception, not the rule:** POS-integrated paths (e.g., Grubhub via
  Toast: **1–2 weeks**), photo manual-review (**≤3 business days**), and payout/KYC holds.

### 1.2 Blocker cards — Group A: step-aligned (merchant-side; WHERE is known, layer adds WHY)

Each card: **Where · Failure modes (cited) · Matched play · Anti-pattern.**

**A1 — Business / identity verification** — `verified`
- **Where:** Step 1.
- **Failure modes:** legal name / EIN must match tax-authority (IRS) records or it stalls;
  missing/mismatched business license; owner identity (name, DOB) fails verification.
- **Matched play:** "Make sure the business name + EIN you entered match your IRS / tax records exactly."
- **Anti-pattern:** a generic "finish signing up" nudge — does not name the mismatch, so the merchant re-submits the same wrong data.

**A2 — Menu / catalog** — `verified`
- **Where:** Step 3.
- **Failure modes:** blank menu; failed ingestion / Menu Pull; **QA-blocked** (QA requires hours
  present + menu not empty — empty menu or missing hours fails QA); for POS-integrated stores the
  ordering partner controls item **visibility/availability**, and timed-pricing items may not surface.
- **Matched play:** menu-builder + auto-populate; surface the specific QA failure (empty/hours/ingestion).
- **Anti-pattern:** telling a POS-integrated merchant to "add items in the app" when their menu is controlled by the POS integration.

**A3 — Photos** — `verified`
- **Where:** Step 4.
- **Failure modes (Uber Eats, documented):** manual review up to **3 business days**; rejection
  reasons = wrong aspect ratio (must be 5:4 to 6:4, min 1200×800, JPG/PNG/GIF, ≤10MB), multiple
  items in one shot, text/logo overlays, blurry/poorly-lit, stock photos. (DoorDash has its own
  ~11 documented rejection reasons — `practitioner-candidate`, carried from prior digest.)
- **Matched play:** show the **specific** rejection reason + the spec + the in-app/AI photo tool;
  note Uber Eats offers one complimentary onboarding photo shoot.
- **Anti-pattern:** "upload better photos" with no spec and no reason code.

**A4 — Hours / availability** — `verified`
- **Where:** Step 2 (and a QA gate for Step 3).
- **Failure modes:** hours not populated → store hidden / QA fails; "tablet off ⇒ store hidden";
  address incomplete.
- **Matched play:** one-click "set your hours / confirm address" checklist.
- **Anti-pattern:** a sales/value nudge while the store is invisible for a fixable config reason.

**A5 — Banking / payout verification** — `verified` (mechanism `illustrative`)
- **Where:** Step 6.
- **Failure modes:** incomplete bank details; **KYC / identity verification holds**. Mechanism
  (via Stripe Connect, one common processor — `illustrative`, not universal): KYC varies by entity
  type/country/capability; collects company info + **beneficial owners**; **payouts disabled** if
  required info isn't verified before a threshold (commonly **$3,000 or $10,000**, industry-dependent);
  government-ID + selfie checks; deferred onboarding can let a seller start while funds are held.
- **Matched play:** "verify your bank / identity to get paid" — payout anxiety is a top stall;
  name exactly which document is missing.
- **Anti-pattern:** treating a KYC/beneficial-owner hold as "the merchant is lazy."

### 1.3 Blocker cards — Group B: cross-cutting (NOT identifiable from `steps_completed`)

**B1 — Low motivation / unclear value / ghosted** — `verified` (as a category)
- Not a step. "Signed up, never engaged" or post-launch silent churn. Maps to the lifecycle
  literature's "never found strong value" segment. **Play = re-prove value first** (Section 2–3).

**B2 — Pricing / commission confusion** — `verified`
- Commission-tier + processing-fee fear (effective take-rate anxiety); the "direct ordering keeps
  more of your money" counter-pitch is loud in vendor content (Owner.com). **Play = a "what
  you'll actually pay" calculator**, not a step nudge.

**B3 — Hardware / tablet / POS ("tablet hell")** — `verified`
- Device shipment (~7 days) then activation; POS-integration QA/sync (1–2 weeks for some paths).
  **Play = track device shipment + ops nudge**, not "finish setup."

**B4 — Store-info / profile quality + order-routing** — `verified`
- Incomplete profile; **order-routing failures** (Grubhub: orders routed to an unwatched tablet,
  or to a location that doesn't partner). **Play = profile/routing checklist + ops escalation.**

**B5 — Tax / compliance docs** — `verified`
- W-9 (Grubhub explicit), tax-info mismatch (CP2100/B-notice class issues — `practitioner-candidate`).
  **Play = "confirm your tax info."**

**B6 — Platform-side ineligibility (NOT the merchant's unfinished work)** — `verified` (codes `illustrative`)
- Duplicate location; virtual-brand / self-delivery detected; already-live-on-POS; fraud
  (`STORE_NOT_ACTIVE`); missing CRM record; non-compliant items (e.g., alcohol); missing hours.
  Surface as **exclusion details emailed + shown in the Developer Portal** for resolution.
- **Provenance flag:** these exclusion/status codes are from the **POS-integration (SSIO) path** —
  **instrumentation targets, modeled + labeled, NOT fields in the synthetic self-serve model.**
- **Play = OPS ESCALATION. NEVER a "finish your setup" nudge** (wrong + trust-eroding).

---

## 2. Reactivation tactics that work vs. fail

**The governing rule (`verified` — the project thesis, independently corroborated by the
lifecycle-marketing + CS-onboarding literature):** the #1 reason reactivation fails is **generic,
untargeted outreach not matched to WHY the merchant stalled.** "Generic retention emails feel like
spam; messages based on actual product usage feel helpful" (Customer.io / Hashmeta).

### 2.1 What good (matched) outreach looks like vs. the failing generic version

| If they stalled because… | WORKING play (matched) | FAILING play (generic) |
|---|---|---|
| Verification / tax mismatch (A1/B5) | "Match your business name + EIN to your IRS records" | "Complete your signup!" |
| Menu blank / QA-blocked (A2) | menu tool + the specific QA reason (empty / hours / ingestion) | "Add your menu" |
| Photo rejected (A3) | the exact rejection reason + spec + photo tool | "Improve your photos" |
| Hours/store-info (A4/B4) | one-click "set hours / confirm address" | a sales/value email |
| Banking / KYC hold (A5) | "Verify your bank/identity to get paid" + the missing doc | "You're almost there!" |
| Pricing/commission fear (B2) | a "what you'll actually pay" calculator | a discount blast |
| Hardware/POS (B3) | device-shipment tracking + ops nudge | "Finish setup" |
| **Ghosted / never found value (B1)** | **re-prove value first; a time-limited reason to return** | a step-completion nudge |
| **Platform-side ineligibility (B6)** | **ops escalation** | **ANY "finish your setup" nudge (never)** |

### 2.2 Principles from the activation / CS-onboarding literature (encode the principle, not the stat)

- **Reduce time-to-first-value (TTFV) / time to the "aha" moment** — the faster a merchant reaches
  the first real benefit (first order, first payout), the more likely they stay. *(Appcues,
  Chameleon, ProductLed — principle `verified` across sources; supporting numbers `illustrative`:
  e.g., "activate within 3 days → ~90% more likely to continue," "aha within 48h → 3.4× convert.")*
- **Defer non-critical steps; value before friction** — don't force every field/decision before
  the merchant sees value. *(SaaSFactor, DigitalApplied; "value before payment converts ~2.5×" is
  `illustrative`.)*
- **Friction compounds** — each required field/decision/external-dependency adds drop-off.
  *(Baymard friction formula, cited via DigitalApplied — `illustrative`; the Athenic "12→7 steps,
  8.2→1.6 days" case is an `illustrative` single case study.)*
- **CS-platform pattern to emulate** *(Gainsight / ChurnZero class — `practitioner-candidate`):*
  fire an **onboarding playbook on entry**, and a **risk playbook when a health signal drops** —
  i.e., trigger on signal, route to the matched play.

### 2.3 Reactivation segmentation by recency (lifecycle literature) — `verified` (principle)

- **Recently inactive** → gentle reminder, not aggressive incentive.
- **Long-dormant** → treat as a *new* customer experience: educate on what's changed, re-onboard.
- **Value-based:** high-value stalled accounts warrant concierge/VIP, non-discount value props.
- *(Supporting stat "22% of dormant users reactivated within 14 days from personalized win-back" —
  `illustrative`.)*

---

## 3. Engagement-state framing

The lifecycle literature gives the load-bearing distinction directly: **"highly active users who
suddenly left often churned because of a specific, solvable issue (pricing, missing feature, poor
timing), while dormant users typically never found strong value."** That maps 1:1 onto the
engagement states below.

| State | Signature | Disengagement reason | Correct play |
|---|---|---|---|
| **New** | just signed up, no action yet | hasn't started | default self-serve onboarding; time-bound nudge after ~24h of no action |
| **Actively-stuck** | recently active, low steps, account aging | a **specific solvable blocker** | **diagnose the blocker → deliver the matched fix** (highest-yield segment) |
| **Ghosted / dormant** | inactive + barely started | **never found value** | **re-prove value FIRST** (time-limited reason to return); NOT a step nudge |

**The no-new-fields discriminator (carried from prior digest, already implemented in
`lib/domain/diagnosis.ts:engagementState`) — `verified` as a design:**
`last_login_days_ago × steps_completed × days_since_signup` →
**actively-stuck** (recently active, low steps, aging = engaged-but-blocked) vs
**ghosted** (inactive + barely started = abandonment). Snapshot inference, not a measured event.

**How the disengagement reason changes the play (the rule a critic should enforce):**
- specific blocker (actively-stuck) → targeted fix;
- motivation/value (ghosted) → re-prove value, never a step nudge;
- **platform-side (`blocker_source`) → escalate, never nudge** (cuts across all states).

---

## 4. The honesty / risk frontier (over-promising in merchant outreach)

> **This section is NOT legal advice.** It summarizes public regulatory sources (as of 2026-06-26)
> and reasons about them. Confirm specifics with counsel before shipping outreach copy.

### 4.1 Two tiers — assert the principle, label the rest as directional

**BINDING PRINCIPLE (assert):**
- **FTC Act §5** — advertising claims, **express AND implied**, must be **truthful and
  substantiated before they are made.** This applies to **any advertiser, including an AI-driven
  merchant-outreach tool.** *(FTC business guidance — `verified`.)*
- **You own every statement your AI emits.** In *Moffatt v. Air Canada* the tribunal **rejected
  the "the chatbot is a separate entity" defense** — the company was responsible for what its bot
  told a customer. The durable principle: **a company is accountable for its AI's claims.**
  *(McCarthy / Pinsent Masons / CanLII — `verified` as to the holding.)*

**DIRECTIONAL / NON-BINDING SIGNALS (label as such — do not assert as settled law that binds this product):**
- **FTC Endorsement Guides (16 CFR Part 255)** — these are **guides, not regulations**; ignoring
  them can trigger a §5 unfair/deceptive investigation. Endorsements must be honest; **"results not
  typical" is an insufficient disclosure**; fake/undisclosed reviews are deceptive. *(eCFR + FTC — `verified`.)*
- **FTC "Operation AI Comply" (Sept 2024, ongoing)** — an **enforcement-priority signal**, not a
  new statute: a crackdown on **"AI washing"** and AI overpromises; "companies using AI in
  marketing must be able to **substantiate every claim, explicit and implicit**." Example: DoNotPay's
  "robot lawyer" claims (no testing, no attorneys). Continued under the new administration —
  treat as enduring. *(FTC press release + blog; Benesch Law — `verified` as direction.)*
- **FTC earnings-claims rulemaking (Jan 2025)** — **PROPOSED and MLM / business-opportunity-scoped**;
  **not final law and not delivery-marketplace-specific.** But the **underlying §5 principle it
  restates is established and broadly applicable:** earnings/income claims need **written
  substantiation**, must reflect what consumers are **likely (typical), not best-case**, and the
  basis must be retained. Treat earnings/revenue claims as the **highest-risk category for this
  product.** *(FTC NPRM + blog — rule `practitioner-candidate`/proposed; the §5 principle `verified`.)*

### 4.2 Safe vs. unsafe claims in merchant outreach (the encodable rubric table)

| Class | SAFE — factual / process / conditional | UNSAFE — unsubstantiated outcome / earnings / guarantee / fabricated urgency |
|---|---|---|
| Setup status | "Complete your menu to start receiving orders." | "Finish setup and watch the orders roll in." |
| Payout | "Verify your bank to receive payouts." | "Start earning thousands this week." |
| Photos | "Your photos were rejected for [reason]; here's the spec." | "Better photos guarantee more sales." |
| Timeline | "Stores that finish setup typically go live within a few days." (qualified, matches evidence) | "Our AI guarantees you're live in 5 minutes." (performance guarantee + AI overpromise) |
| Benefit | "Adding photos can help customers find your items." (soft, non-guaranteed) | "Restaurants like yours grow sales 30%." (specific performance claim, no substantiation/typicality) |
| Earnings | *(avoid earnings claims entirely unless substantiated + typical-results basis exists)* | "You'll earn $X,000/month." / "Most stores double their orders." |
| Urgency | "Your setup is incomplete." (true state) | "Activate now or lose your spot." (fabricated scarcity) |

**Rules for a critic to enforce:**
1. **Implied claims count.** A testimonial or "stores like yours" framing that *implies* a typical
   result is a performance/earnings claim and needs the same substantiation.
2. **Default to process/conditional framing.** Anything touching revenue/earnings/"grow" routes
   through human review + a substantiation file; never auto-generate it.
3. **No guarantees about an outcome the merchant or platform controls** (live-by-X, sales-uplift).
4. **No fabricated urgency/scarcity.**
5. **Churn risk, not just legal risk:** over-promising to a stalled merchant who then has a bad
   experience accelerates churn — the honest, matched message is also the higher-retention one.

---

## 5. 2026 competitive frontier + failure frontier (design against these)

**Incumbent auto-fill is now real (DoorDash AI suite, announced 2026-05-04 — `verified` from primary
source):** self-serve onboarding that **auto-populates photos/hours/menu from a merchant's web
presence ("launch >35% faster")**; **AI photo editing** (AI Retouch, AI Replate, Match the Style);
**AI-Powered Websites** ("hours to minutes," "~10% order conversion"); **AI-Powered Marketer**
(automated email + occasions-based campaigns); a Video Library.
**Implication:** incumbents attack the **step-aligned blockers (A2–A4) at the source.** The
defensible edge is **cross-blocker diagnosis + engagement-state routing + the platform-side (B6)
cases auto-fill cannot touch** — NOT competing on photo retouching.

**Adjacent proactive-assistant patterns to emulate** *(`practitioner-candidate`, training-era, not
re-verified this session):* Shopify Sidekick + Pulse (proactive background "what's happening / why /
next steps"); Amazon "Project Amelia" → Seller Assistant (proactive monitoring + permissioned actions).

**Failure frontier (design AGAINST) — `practitioner-candidate` (carried from prior digest):**
the "AI-SDR collapse" pattern — fully-autonomous generic outreach churns hard; the winning pattern
is **orchestrate AI + human + signal** (signal-driven, not blast; human-in-the-loop on claims).
This validates the project's human-gate + matched-play design. *(Specific churn percentages are
`illustrative`.)*

---

## 6. Detection signals + needs-instrumentation (carried forward — `verified` as a design)

- **Detectable now (existing fields):** actively-stuck vs ghosted (the §3 discriminator); coarse
  step bucket (= `current_blocker_code`; use it to pick the message, not to claim new insight).
- **Needs-instrumentation (named, not invented — reuse `docs/data-audit.md` field names):**
  `verification_status` / `business_info_match_flag`; `menu_status` + `menu_item_count`;
  `photo_rejection_reason`; `hours_populated_flag` / `address_complete_flag`;
  `bank_verification_status` / `fraud_hold_flag`; `plan_tier_selected`;
  `pos_integration_flag` / `device_status`; `exclusion_code`; and the **highest-value one:**
  **`blocker_source`** (merchant-side vs platform-side) — the nudge-vs-escalate discriminator.

---

## Confidence summary + open gaps

- **Strongest (`verified`):** the go-live skeleton across 3 marketplaces; the days-not-weeks
  timeline (supersede); the match-the-reason reactivation rule; the engagement-state split; the
  FTC §5 substantiation principle + Moffatt accountability principle.
- **Labeled `illustrative` (don't encode as thresholds):** all activation/reactivation percentages;
  Stripe $3k/$10k payout thresholds; SSIO exclusion codes.
- **Open gaps (honesty):**
  1. **First-person merchant operator voice (raw Reddit/X) is thin** — failure modes rest on
     official + vendor-practitioner tiers. Route deeper harvesting to `last30days` / `pulse`
     (recency engine; not runnable from this read-only agent).
  2. **High-signal VIDEO sources to transcribe (read-only — flagged, NOT synthesized):** DoorDash
     Merchant Onboarding series; the DoorDash Tablet how-to. Run `video-research` for hardware/go-live depth.
  3. **SSIO codes are POS-path-specific** — confirm which surface for plain self-serve before coding as universal.
  4. **Adjacent-assistant product claims (Shopify Pulse, Amazon Amelia)** not re-verified this session.
