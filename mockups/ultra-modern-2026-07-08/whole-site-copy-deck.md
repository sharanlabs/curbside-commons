# Whole-site copy deck — ultra-modern premium redesign (gallery-white)

Provenance: written 2026-07-08 by the delegated writing-specialist (opus). Scope = a
**content redesign** of every rendered surface of the Commerce Truth Audit / ActivationOps
site, to pair the owner's premium gallery-white layout redesign. Every load-bearing line
below is either (a) kept verbatim from the repo because it is an honesty claim, not copy to
"improve," or (b) a transform of existing copy into a sharper, more confident register with
the underlying claim unchanged. Nothing new is asserted about the product. Citations are
`file:line`, for reviewers — not for the page.

Skills applied: humanizer (AI-tell removal + voice injection; brand-voice path N/A — no
`marketing-context.md`) · content-production (per-surface structure). Register target:
ultra-modern product copy (Linear/Vercel/Apple-2026 spareness) over this repo's existing
honesty spine — plain line leads, technical line follows, no hype vocabulary, no emoji.

**Redesign rule I held throughout:** content = better structure, clarity, and confidence —
never a new or inflated claim. Numbers trace to a repo file. Simulated labels, "no LLM in the
verifier," "advisory judge does not change the send," "recorded fixture, not live," and the
non-affiliation lines are preserved exactly. `[VERIFY]` marks anything I could not tie to a
file I read this session.

---

## 0 — Honesty invariants (fixed; must survive verbatim)

These strings are machine-gated or claim-bearing. The redesign restyles the frame around
them; it does not touch the words.

**The SIMULATED banner — byte-verbatim (report + demo):**

> Synthetic test data — an invented restaurant, invented menu, invented prices. Not real DoorDash / Square / Uber Eats / Grubhub data, access, or business impact. The verification rules and the pinned data-format standard are real; the restaurant, its menu, and its records are invented.

*Source: `lib/packs/listings/demo/copy.ts:53–54` (`DEMO_SIMULATED_BANNER`, the single source) and `components/report/ReportView.tsx:113–118` (renders the same sentence; the JSX has a non-breaking space between "Uber" and "Eats").*

**Also preserved exactly (honesty claims, reused across surfaces):**
- `HONEST_DATA_LABEL` — `lib/product.ts:16–17`.
- `DEMO_SUBHEAD` / `DEMO_CLAIM` / `DEMO_ACTOR_LABEL` — `copy.ts:81–82 / 23–24 / 31`.
- Nav status badge: `Prototype · REPLAY · $0.00` — `components/Nav.tsx:44`.
- Report footer honesty paragraph — `ReportView.tsx:210–215`.
- Demo footer honesty paragraph — `DemoView.tsx:134–140`.
- Global footer non-affiliation paragraph — `app/layout.tsx:63–77`.
- Landing honesty block + mono strip — `app/page.tsx:502–524`.
- "Human-led, AI-assisted, professionally reviewed." — everywhere it currently appears.

**The only hard metric in the redesign:** the sample report is **FAIL · 16 findings · 11 error · 5 warn · 0 info** (counted from `fixtures/synthetic-restaurant/expected-report.acp.json`; `ok:false`). Every other number is data-bound at render (do not hardcode) or cited below.

---

## 1 — Global: wordmark, nav, status, footer

### Wordmark
**Commerce Truth Audit** — kept. *(`components/Nav.tsx:26`; `app/layout.tsx:27` metadata title.)*

Premium treatment: set the wordmark in the display sans, tracking tight, one weight up from the links. No tagline in the bar — the tagline belongs on the landing hero, not the chrome.

### Nav labels — keep the function names, tighten the set
The current labels are already function-clear; renaming them buys nothing and risks making navigation vaguer. Keep them. *(`components/Nav.tsx:6–14`.)*

`Console` · `Report` · `Demo` · `Eval / Quality` · `Metrics` · `Audit` · `Cost`

Microcopy for the active state (screen-reader + hover title), plain-paired:
- Console — "The activation queue, end to end."
- Report — "One serving copy, checked line by line."
- Demo — "A scripted walkthrough. Every verdict is computed, not narrated."
- Eval / Quality — "Every draft, scored before a human sees it."
- Metrics — "What the run routed and held (simulated)."
- Audit — "Every decision, recorded."
- Cost — "The spend ledger, and how the cap holds."

*Hover/title microcopy is proposed (not currently in the file); it introduces no capability the surfaces don't already have. Function labels themselves are verbatim from `Nav.tsx:6–14`.*

### Status badge — verbatim, do not restyle the words
**`Prototype · REPLAY · $0.00`** *(`components/Nav.tsx:44`.)* Premium treatment: pill, mono numerals, muted until hover. The three tokens are the honesty register; they stay.

### Global footer — verbatim
Keep the non-affiliation paragraph exactly. *(`app/layout.tsx:63–77`.)*

> Demo / portfolio prototype. REPLAY over fictional display names + synthetic activation state (the adapter ingests real public DataSF records; the demo shows invented ones) — not production logs, real sends, real marketplace access, or real-impact data. The "real Gemini" output shown is a recorded static fixture (reproduce it locally with your own key). Human-led, AI-assisted, professionally reviewed. Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats, Grubhub, DataSF, or any named business.

---

## 2 — Landing (`/`, `app/page.tsx`)

The landing tells the **activation** story: AI drafts merchant outreach, every claim is checked against that merchant's own record, and a person signs off. Keep the nine-beat arc; sharpen each beat's headline and lede. All claims below are the page's own. *(`app/page.tsx:97–528`.)*

> Reader-test note (surfaced, not fixed here): a first-time visitor meets three names on `/` — "Commerce Truth Audit" (wordmark), "ActivationOps" (page title), "Curbside Commons" (the console's demo platform). Which is the product? This is an existing repo tension, not mine to rebrand (`RULES.md` §2). Flagged for the owner in §12. `[VERIFY]` whether the redesign should unify the naming or keep all three.

**Page title (browser/meta):** kept — "ActivationOps — Merchant Activation review, with the facts checked." *(`app/page.tsx:6`.)*

### Beat 1 — Hero
- **Eyebrow:** `A · MERCHANT ACTIVATION — REVIEW & APPROVAL` *(from `page.tsx:104–106`.)*
- **Headline (kept; it is the fixed honest headline):** "AI writes your merchant outreach — and nothing reaches a merchant until every claim is checked against their own data." *(`page.tsx:107–110`.)*
- **Sub (tightened):** "Each message is checked against that merchant's own record before it can send. A confident-sounding claim the data can't back is held for a person — never sent on its own." *(transform of `page.tsx:111–115`; claim unchanged.)*
- **Primary CTA:** "See it run on the console" → `/console` *(`page.tsx:117–119`.)*
- **Secondary link:** "How the checking works" → `#how` *(`page.tsx:121–132`.)*
- **Aside label (a11y):** "A recorded outreach draft, checked and held for approval." *(`page.tsx:137`.)*

### Beat 2 — Trust anchor
- **Eyebrow:** `B · HOW A MESSAGE EARNS THE RIGHT TO SEND` *(`page.tsx:146–148`.)*
- **Headline (kept):** "Three checks stand between the AI and a merchant." *(`page.tsx:149–151`.)*
- Step one — **An exact, automatic check.** "Every fact the message states is matched, exactly, against the merchant's record. No match, no pass." *(`page.tsx:161–165`.)*
- Step two — **An independent second reviewer.** "A separate AI reviewer re-reads the message for anything the record can't back. It doesn't grade its own work." *(`page.tsx:172–176`.)*
- Step three — **A person signs off.** "Anything in question is held for your team. Approve, edit, or hold. Nothing sends itself." *(`page.tsx:183–187`.)*
- **Foot (kept):** "And we don't ask you to take it on faith: we measure how often the AI reviewer agrees with human reviewers, and tune it to err toward holding rather than letting something slip through." *(`page.tsx:193–197`.)*

### Beat 3 — The gap
- **Eyebrow:** `C · WHY AN ORDINARY SAFETY CHECK ISN'T ENOUGH` *(`page.tsx:204–206`.)*
- **Headline (kept):** "An AI hallucination sounds just as confident as the truth." *(`page.tsx:207–209`.)*
- **Lede (tightened, claim intact):** "When AI states something that isn't true for a merchant, the industry calls it a hallucination — a fabrication that reads exactly as confident as a fact. Most AI safety checks read the tone of a message: is it rude, off-policy, leaking personal data? They don't check whether what it said is true for this merchant. So 'you'll be live by Friday,' written for an account with no go-live date, sails straight through." *(`page.tsx:210–217`.)*
- **`<details>` opt-in (kept):** "Why a tone/safety filter structurally can't catch this." Body: faithfulness is a relation between text and a record, not a property of the text; only reconciling each asserted fact against the structured source of truth catches it. *(`page.tsx:218–234`.)*

### Beat 4 — The shown catch (centerpiece)
- **Eyebrow:** `D · CAUGHT AND HELD` *(`page.tsx:241–243`.)*
- **Headline (kept):** "One made-up claim, held — checked against the merchant's own record." *(`page.tsx:244–246`.)*
- **Lede (tightened):** "A recorded draft, line by line. Two claims match the merchant's data and pass on their own; the one the record can't back — a go-live date that simply isn't there — is caught and held for a person. The reviewer's buttons are shown disabled because this is a recorded walkthrough." *(`page.tsx:247–252`.)*

**CatchPanel microcopy (kept verbatim — these are the shown verdicts):** *(`components/landing/CatchPanel.tsx:21–37, 95–158`.)*
- Panel cap: "outreach draft · checked against the record" / "held for review".
- Record label: "this merchant's record · the only thing the message is checked against."
- Record fields: `category: Restaurant` · `setup: 2 of 5 steps` · `blocker: photos needed` · `go-live date: none on file`.
- Claim 1 — "You've completed 2 of 5 setup steps." → **matches the data** · `→ setup: 2 of 5 steps`.
- Claim 2 — "Add photos to finish your listing." → **matches the data** · `→ blocker: photos needed`.
- Claim 3 — "You'll be live by Friday." → **not in the data** · `no go-live date on this record`.
- Held banner: "Held for a person to approve." / "1 claim the data doesn't back · not sent, not rejected — it's your call."
- Decide note: "what you do next · recorded to the audit trail." Buttons (disabled): `Keep held` · `Edit the claim` · `Approve & send`.

### Beat 5 — How it works
- **Eyebrow:** `E · HOW IT WORKS` *(`page.tsx:305–307`.)*
- **Headline (kept):** "The AI is checked, not trusted." *(`page.tsx:308–310`.)*
- **Lede (kept):** "Five stages. Cheap, exact checks run before the slower ones; an independent reviewer runs near the end; a person always has the last word." *(`page.tsx:311–314`.)*

Five-stage rail (kept; `gate` marks the two checks). *(`page.tsx:40–72`.)*
1. **Your data** — "The merchant's own record is the only thing a message is allowed to be true against."
2. **AI drafts from it** — "The AI writes the outreach from that record — not the open web, and not the merchant's own typed-in text."
3. **An exact automatic check** `check` — "Every fact the message states has to match a field in the record, exactly. Anything that doesn't is flagged."
4. **An independent second reviewer** `check` — "A separate AI reviewer re-reads the message and flags anything the data can't back — including facts slipped in casually."
5. **A person approves** — "Your reviewer approves, edits, or holds. Nothing sends itself, and every decision lands on the audit trail."

### Beat 6 — Differentiation
- **Eyebrow:** `F · WHAT MAKES IT DIFFERENT` *(`page.tsx:360–362`.)*
- **Headline (kept):** "A safety filter checks the message. We check the facts." *(`page.tsx:363–365`.)*
- Them — "an ordinary AI safety filter (a 'guardrail')": "Is this message appropriate?" Reads the message on its own. *(`page.tsx:369–383`.)*
- Ours — "ActivationOps": "Is this message true for this merchant?" Every claim checked against the data row; an exact check, then an independent reviewer; evidence on every line, held for a person. Reads the message against the record. *(`page.tsx:385–402`.)*

### Beat 7 — The obvious question
- **Eyebrow:** `G · THE OBVIOUS QUESTION` *(`page.tsx:410–412`.)*
- **Headline (kept):** "'How do you know the AI reviewer is right?'" *(`page.tsx:413–415`.)*
- **Lede (kept):** "Fair question — so we don't ask you to assume it. We check the reviewer against people." *(`page.tsx:416–419`.)*
- Q/A rows (kept): measured against human judgment (**figures pending**: "calibration run in progress · figures published when it clears the bar"); tuned to hold, not over-block ("A false hold costs a glance; a shipped falsehood costs trust."); the exact check underneath is locked. *(`page.tsx:422–449`.)*

> Honesty guard for this beat: the landing carries **no accuracy numbers** — they are pending calibration. The redesign keeps it that way. Do not add a precision/recall figure anywhere on the landing.

### Beat 8 — Close
- **Eyebrow:** `H · SEE IT RUN` *(`page.tsx:480–482`.)*
- **Headline (kept):** "Watch one draft get checked, line by line." *(`page.tsx:483–485`.)*
- **CTA:** "See it run on the console" → `/console`; note: "a recorded, replayable run — not a sign-up." *(`page.tsx:491–495`.)*

### Beat 9 — Honesty (kept verbatim)
Keep the disclosure paragraph and the mono strip exactly. *(`app/page.tsx:502–524`.)*

> A simulated prototype on de-identified, public open data. Merchant and reviewer names are fictional. Not affiliated with DoorDash, Uber Eats, Grubhub, or any marketplace. The walkthrough is a recorded, replayable run — labeled, not live — and accuracy figures are pending until the calibration run completes. Human-led, AI-assisted, professionally reviewed.

Mono strip: `SIMULATED · FICTIONAL NAMES · NO REAL MERCHANT DATA · NOT AFFILIATED WITH ANY MARKETPLACE · REPLAY / RECORDED · FIGURES PENDING CALIBRATION · HUMAN-LED, AI-ASSISTED, PROFESSIONALLY REVIEWED`

---

## 3 — Console (`/console`, `app/console/page.tsx`)

The working surface: the whole activation pipeline over the demo set, on one page. *(`app/console/page.tsx:40–168`.)*

- **Eyebrow:** `CURBSIDE COMMONS · STALLED-MERCHANT ACTIVATION` *(`PLATFORM_NAME`, `console/page.tsx:46–48`.)*
- **Headline (tightened):** "Activate stalled, long-tail merchants — responsibly." *(kept from `console/page.tsx:50–52`; it is already the right headline.)*
- **Plain (tightened, claim intact):** "In plain terms: it finds which delivery-marketplace merchants are stuck getting set up and why, drafts the next message with every claim checked against the merchant's own data, and keeps a person in charge — built to be measured, audited, and adopted." *(transform of `console/page.tsx:53–58`.)*
- **Technical (kept):** "Deterministic risk + blocker triage → bounded, schema-constrained LLM drafting → a claims-gatekeeper that ties every declared claim to the merchant's own data → an eval harness over the output → a human approval gate with an audit trail. Avoids the false-claim/churn failure the AI-outreach wave is hitting." *(`console/page.tsx:59–64`.)*
- **Honest-data callout (kept verbatim):** `HONEST_DATA_LABEL` — "The merchant names shown are FICTIONAL (no real businesses …) … No real merchant relationship or account." *(`lib/product.ts:16–17`, rendered `console/page.tsx:66–68`.)*

### Stat rail (labels kept; values are data-bound — do not hardcode)
*(`console/page.tsx:70–77`.)*
`Merchants` (hybrid set) · `Simulated sent` (eligible + clean) · `Held for review` (human gate) · `Eval passing` (quality dims) · `Gemini spend` **$0.00** (≤ $5 cap · N live calls) · `Mode` **REPLAY** (demo makes no live calls).

> The only fixed numerals here are `$0.00`, the `$5` cap, and `REPLAY`. Merchant/sent/held counts render from `getReplaySnapshot` — never write a specific count into copy.

### Pipeline — "How it works & why it's safe" (step names kept; plain + tech tightened)
*(`console/page.tsx:31–38, 79–95`.)*
1. **Triage** — "Find who's stuck, and how badly." · Deterministic risk score + level (auditable formula).
2. **Diagnose** — "Pin the exact blocker." · Onboarding-step → blocker / next-action map.
3. **Draft** — "Write the right next message." · Bounded, schema-constrained LLM (REPLAY here; a real Gemini run is recorded — see Eval).
4. **Gate** — "Check each declared claim against the data." · Claims-gatekeeper: every declared claim traces to merchant data + forbidden-claim guardrails (undeclared prose isn't fully semantically verified — a documented boundary).
5. **Score** — "Measure draft quality." · Eval graders: structure · state-consistency · policy · no-leakage.
6. **Approve** — "A person decides: hold / reject / send." · Human-in-the-loop gate; simulated send; full audit trail.

### Activation queue
- **Heading:** "Activation queue."
- **Plain (kept):** "Fictional businesses with synthetic activation state — the adapter ingests real DataSF public records (fictional display, real-data capability). Open one to see the full why-chain end to end." *(`console/page.tsx:98–103`.)*
- **Columns:** Merchant · Category · Risk · Blocker · Quality · Status. *(`console/page.tsx:107–113`.)*
- **Status chips (kept):** `Simulated sent` · `Rejected` · `Held for review` · `Drafted`. *(`console/page.tsx:11–19`.)*
- **Empty state (proposed; no new capability):** "No merchants in this run's queue. The replay snapshot returned an empty set." `[VERIFY]` — the console currently always renders the seeded snapshot; an empty state is defensive copy only.
- **Provenance footer (kept):** "Data provenance: DataSF (dataset id), license. Real layer = business name + category only; activation state synthetic. Human-led, AI-assisted, professionally reviewed — never a claim of real marketplace access or business impact." *(`console/page.tsx:158–164`; source/license/dataset render from the snapshot.)*

---

## 4 — Report (`/report`, `components/report/ReportView.tsx`)

The one-page verifier report: a serving copy of a menu, checked line by line against the restaurant's own records. Deterministic, zero LLM, $0. *(`ReportView.tsx:103–219`.)*

- **Meta title (kept):** "Verifier report — listings truth check (simulated)." *(`app/report/page.tsx:15`.)*
- **Eyebrow:** `VERIFIER REPORT · LISTINGS TRUTH CHECK` *(`ReportView.tsx:122`.)*
- **Headline (kept):** "What the copy says vs. what the restaurant's records say." *(`ReportView.tsx:123`.)*
- **Intro (tightened, claim intact):** "A serving copy of a menu — the version an AI shopping assistant would read — checked line by line against the restaurant's own system-of-record. Below is every difference the checker caught: each in plain words first, then the exact receipts. Deterministic and $0, no AI calls on this path — the same input always gives this same report." *(transform of `ReportView.tsx:124–129`.)*

### SIMULATED banner — verbatim (top of page, unmissable)
Keep exactly. See §0. *(`ReportView.tsx:111–118`.)*

> Synthetic test data — an invented restaurant, invented menu, invented prices. Not real DoorDash / Square / Uber Eats / Grubhub data, access, or business impact. The verification rules and the pinned data-format standard are real; the restaurant, its menu, and its records are invented.

### Surface toggle (data labels — kept)
*(`ReportView.tsx:25–36, 133–146`.)*
- `ACP static feed` — plain: "OpenAI/Stripe product-feed shape."
- `UCP catalog response` — plain: "constructed simulation of the Google-led live-catalog shape (normalized, not wire format)."

### Rails (layout armature — kept as-is)
`Verdict` · `Meta` · `Findings`. These are structural labels, not report copy, and were escalated + accepted as armature. Keep them. *(`ReportView.tsx:150–205`.)*

### Verdict block (data-bound; both states are in the code)
- FAIL state (the ACP fixture): **FAIL** · "16 findings" · "11 error · 5 warn · 0 info." *(computed in `ReportView.tsx:84–100`; tally counted from `expected-report.acp.json`.)*
- PASS state (real code branch): **PASS** · "no drift detected" — no tally row. *(`ReportView.tsx:90–98`. This is the honest empty/clean state; use it verbatim, do not invent a "0 findings" number where the code prints a phrase.)*

### Meta strip (labels kept; values from the fixture)
- surface — `ACP static feed (OpenAI/Stripe product-feed shape)`
- spec version — `taxonomy-v1+acp-extract-2026-07-02+ucp-pin-2026-04-08`
- matching mode — `synthetic-controlled`
- data — `simulated: true`

*(`ReportView.tsx:166–189`; `expected-report.acp.json:2–4`.)*

### Findings — evidence contract (kept)
Every finding leads with the plain line, then four receipts always visible: **claim** (`source · field = value`) · **reference row** · **rule / spec-clause** · **class**, plus a severity badge. *(`ReportView.tsx:44–81`.)*

Redesign microcopy for the receipts header row (premium, mono): `claim` · `reference row` · `rule / spec-clause` · `class` — kept exactly; they are the audit vocabulary.

**Real sample findings (verbatim plain lines + real receipts; show a spread, note the total):** *(all from `expected-report.acp.json`.)*
1. "The served price 12.00 does not match the catalog price 10.00." — claim `acp-feed · price.amount = 12.00` · row `item-006-v1` · rule `LST-PRICE-VALUE` · class price · **error**. *(`:189–201`.)*
2. "The price is serialized in cents (2150) where dollars are expected (21.50) — a 100× overstatement." — claim `acp-feed · price.amount = 2150` · row `item-001-v1` · rule `LST-PRICE-CENTS-AS-DECIMAL` · class price · **error**. *(`:145–157`.)*
3. "The copy says \"in_stock\" but the catalog state is 86'd/sold out (expected \"out_of_stock\")." — claim `acp-feed · availability = in_stock` · row `item-008-v1` · rule `LST-AVAIL-STATE` · class availability · **error**. *(`:32–44`.)*
4. "The copy serves \"Phantom Platter (simulated ghost item)\" but no such item exists in the merchant's catalog." — claim `acp-feed · existence = true` · row `catalog-meta` · rule `LST-EXIST-GHOST` · class existence · **error**. *(`:88–100`.)*
5. "The variant label says \"Small\" but this row is the \"Medium\" variation — variants of this item can no longer be told apart." — claim `acp-feed · variant_dict` · row `item-004-v2` · rule `LST-IDENT-MODIFIER-AMBIG` · class identity · **error**. *(`:128–144`.)*
6. "The name is garbled by a text-encoding error: served \"JalapeÃ±o Poppers (Large)\" vs the real \"Jalapeño Poppers (Large)\"." — claim `acp-feed · title` · row `item-004-v3` · rule `LST-ENC-UTF8` · class encoding · **warn**. *(`:75–87`.)*
7. "This row expired 2026-01-01T00:00:00Z but is still served (catalog as-of 2026-07-03T00:00:00Z)." — claim `acp-feed · expiration_date` · row `item-003-v3` · rule `LST-STALE-EXPIRED` · class staleness · **warn**. *(`:215–227`.)*

**Findings closing line (proposed):** "Seven of sixteen shown. The other nine carry the same four receipts. The catches span seven classes: price, availability, existence, identity, encoding, staleness, and cross-field invariants." *(class list verified across `expected-report.acp.json`.)*

### Report footer — verbatim
Keep exactly. *(`ReportView.tsx:210–215`.)*

> Every row above carries its four receipts — the claim, the catalog row it was checked against, the rule it broke, and how severe it is. No language model runs in this verifier — the comparison is exact, deterministic logic. Simulated prototype, run on demand — not a live service. Human-led, AI-assisted, professionally reviewed.

### States
- **Loading:** none — the report is a static server render of a committed fixture. No spinner copy needed; if a print/loading skeleton is ever added, label it "rendering committed fixture" `[VERIFY]`.
- **Print:** the page is printable (the SIMULATED banner survives print by design). Keep the banner and footer on the printed sheet. *(`ReportView.tsx:110` note; print block in `globals.css`.)*
- **Empty/clean:** the PASS branch above ("no drift detected") is the honest empty state.

---

## 5 — Demo (`/demo`, `components/demo/DemoView.tsx`)

A scripted, deterministic walkthrough. A spec-faithful simulated agent trusts a spec-valid but false serving copy; the verifier catches the surface/SOR mismatch. Every verdict in the transcript is computed by the real verifier, not narrated. *(`DemoView.tsx:97–144`.)*

- **Meta title (kept):** "Verifier demo — spec-faithful agent vs a false surface (simulated)." *(`app/demo/page.tsx:15`.)*
- **Eyebrow:** `VERIFIER DEMO · LISTINGS TRUTH CHECK` *(`DemoView.tsx:107`.)*
- **Headline (kept verbatim — the C7 sanctioned claim, `DEMO_CLAIM`):** "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch." *(`copy.ts:23–24`; rendered `DemoView.tsx:109`.)*
- **Subhead (kept verbatim — `DEMO_SUBHEAD`):** "The comparison is exact, deterministic logic — no language model runs in this demo, and no live platform is touched." *(`copy.ts:81–82`; `DemoView.tsx:110`.)*

### SIMULATED banner — verbatim
Same sentence as the report. See §0. *(`DemoView.tsx:101–104`.)*

### Meta strip (labels kept)
- actor — `spec-faithful demonstration actor — simulated` (`DEMO_ACTOR_LABEL`, `copy.ts:31`).
- spec version — from the transcript.
- data — `simulated: true`.

*(`DemoView.tsx:111–124`.)*

### Beats (four; plain line leads each — kept from the single-sourced copy)
*(`copy.ts:57–78`; rendered `DemoView.tsx:63–95`.)*
1. **The agent reads the published serving copy** — "A shopping agent reads the published menu feed — the same data any AI assistant would consume — and never sees the restaurant's own records."
2. **The agent selects an item, trusting the surface** — "Trusting the feed at face value, the agent picks its target item and is ready to order it at the price the surface shows." (Intent item: `Smoked Brisket Plate`, `copy.ts:39`.)
3. **The verifier checks that same copy against the records** — "The verifier checks the exact same feed against the restaurant's system-of-record and flags what the agent had no way to see."
4. **Conformance-foil: spec-valid is not the same as true** — "The same document passes the official schema check — it is correctly shaped — and still misstates the price versus the records." (Foil line: `passes the official schema check; still lies`, `copy.ts:45`.)

Each beat's findings render with the same four-receipt contract as the report. *(`DemoView.tsx:26–61`.)*

### Verdict chips (data-bound)
`ok` verdicts and `flag` verdicts render from the transcript. Labels are the transcript's own; do not invent verdict text. *(`DemoView.tsx:77–85`.)*

### Demo footer — verbatim
Keep exactly. *(`DemoView.tsx:134–140`.)*

> The agent read only the published feed and never saw the restaurant's records; the verifier checked that same feed against those records and cited every catch with its four receipts. No language model runs in this demo — the comparison is exact, deterministic logic. Simulated prototype, run on demand — not a live service, no real platform access. Human-led, AI-assisted, professionally reviewed.

> Honesty guard: the demo headline and subhead are machine-gated (one grep-gate over the demo surface). Frame every beat as the verifier catching the mismatch — never the agent "getting caught." *(`copy.ts:16–24`.)*

---

## 6 — Eval / Quality (`/eval`, `app/eval/page.tsx`)

Every drafted message is scored before a person sees it. Four deterministic graders, and an honest look at a recorded real-Gemini run. *(`app/eval/page.tsx:8–151`.)*

- **Headline (kept):** "Eval / Quality." *(`eval/page.tsx:18`.)*
- **Plain (tightened, claim intact):** "In plain terms: every drafted message is scored before a human sees it — is it well-formed, do its declared claims all check out against this merchant's data, and does it avoid forbidden promises?" *(`eval/page.tsx:19–23`.)*
- **Technical (kept):** "Deterministic graders over the draft contract (structure · state-consistency · policy · no-leakage). They share the gate's rule definitions; their teeth are proven by paired corrupted-record tests (a grader that can't fail is theater) — including on the recorded real-Gemini drafts, where no-leakage catches a raw enum / risk-level leak the other dimensions missed." *(`eval/page.tsx:24–30`.)*
- **Honesty callout (kept):** "These corpus scores grade the deterministic stub output. The same graders also scored a recorded real Gemini run — shown below (key-gated, $0.0042 spent) — so this stays honest about real output. The public demo itself makes no live calls." *(`eval/page.tsx:31–36`; `$0.0042` is a literal in source.)*

### Score rail (labels kept; values data-bound)
`drafts pass all dimensions` (evalPassed/evalTotal) · `structure` · `state-consistency` · `policy` · `no-leakage`. Values render from the snapshot — do not hardcode. *(`eval/page.tsx:6, 38–53`.)*

### Grader matrix
Columns: Merchant · structure · state-consistency · policy · no-leakage · Overall. Cell copy: `PASS` / `FAIL` (kept). *(`eval/page.tsx:55–94`.)*

### Recorded Gemini run — static fixture
- **Heading (kept):** "Recorded Gemini run — static fixture (model, recorded_at)." *(`eval/page.tsx:97–102`; model/date from `liveSamples.provenance` — do not hardcode.)*
- **Plain (kept):** "A frozen recording of a local Gemini API run (one merchant per blocker). The public demo does not re-run or independently verify it (REPLAY-only, zero spend) — reproduce it yourself with your own key … Total cost: $0.0042 (cap $5)." *(`eval/page.tsx:103–111`.)*
- **"What the live run showed (honest)"** — list renders from `liveSamples.provenance.honest_findings`; keep the heading, do not invent findings. *(`eval/page.tsx:113–122`.)*
- **Table columns (kept):** Blocker · Mode · Gate · Eval · Cost. *(`eval/page.tsx:124–147`.)*

### States
- **Empty (proposed):** "No recorded samples in this fixture." `[VERIFY]` — the page currently always renders `liveSamples.rows`.

---

## 7 — Metrics (`/metrics`, `app/metrics/page.tsx`)

What the run routed and held, over the demo set. Illustrative of the workflow — never an outcome claim. *(`app/metrics/page.tsx:21–85`.)*

- **Headline (kept, and the "(simulated)" stays):** "Workflow metrics (simulated)." *(`metrics/page.tsx:28`.)*
- **Plain (tightened, claim intact):** "In plain terms: what the demo routes and tracks for an activation team — how many stalled merchants get a claim-checked nudge, how many are held for a human, and what's blocking them." *(`metrics/page.tsx:29–33`.)*
- **Simulated callout (kept):** "Figures are simulated over the hybrid demo set (fictional names, synthetic activation state) — illustrative of the workflow, not activation, revenue, or reactivation outcomes." *(`metrics/page.tsx:34–38`.)*

### Stat rail (labels kept; values data-bound)
`Stalled merchants` · `Simulated sent` · `Held for review` · `Auto-rejected`. *(`metrics/page.tsx:41–52`.)*

### Charts
- **Blocker mix** — "Where merchants are stuck (the work to do)." Bars render per blocker with count + %. *(`metrics/page.tsx:55–63`.)*
- **Risk distribution** — "High-risk merchants are held for human approval; lower-risk eligible ones can simulate-send." High / Medium / Low bars; plus "Simulated send rate (of total)" and "Held-for-review rate" as computed percentages. *(`metrics/page.tsx:65–81`.)*

> Every percentage here is computed at render from the snapshot. Do not write a specific rate into copy. The word "simulated" stays in the H1 and the callout.

### States
- **Empty (proposed):** "Nothing routed in this run." `[VERIFY]` — defensive only.

---

## 8 — Audit (`/audit`, `app/audit/page.tsx`)

Every merchant's decision, recorded — what was found, what the gatekeeper said, how the draft scored, and what happened. *(`app/audit/page.tsx:12–72`.)*

- **Headline (kept):** "Audit Trail." *(`audit/page.tsx:17`.)*
- **Plain (tightened, claim intact):** "In plain terms: every merchant's decision is recorded — what was found, what the gatekeeper said, how the draft scored, and what happened. No black boxes." *(transform of `audit/page.tsx:18–22`; claim unchanged.)*
- **Run line (kept):** "Run executed deterministically at [generatedAt] (mode [servedMode]). Open a merchant for its full step-by-step trail." *(`audit/page.tsx:23–27`; timestamp/mode render from the snapshot.)*
- **Columns (kept):** Merchant · Triage · Gatekeeper · Eval · Outcome · Trail. *(`audit/page.tsx:32–39`.)*
- **Trail link microcopy (kept):** "view (N steps)." *(`audit/page.tsx:57–64`.)*

### States
- **Empty (proposed):** "No decisions recorded for this run." `[VERIFY]` — defensive only.

---

## 9 — Cost (`/cost`, `app/cost/page.tsx`)

The spend ledger, and how the cap physically holds. *(`app/cost/page.tsx:6–80`.)*

- **Headline (kept):** "Cost ledger." *(`cost/page.tsx:12`.)*
- **Plain (tightened, claim intact):** "In plain terms: the live-drafting path is budget-guarded, so a run can't quietly exceed the cap. Spend is computed from real reported tokens against a pinned price list, and a fail-closed hard stop blocks any call that would cross it." *(`cost/page.tsx:13–17`.)*

### Stat rail (labels kept; values from constants/snapshot)
`spent this run` (`$0.00` in REPLAY) · `hard cap (fail-closed)` (`$5.00`, `DEFAULT_BUDGET_CAP_USD`) · `live calls` (data-bound) · `serve mode` (`REPLAY`). *(`cost/page.tsx:19–36`; the `$5.00` renders `DEFAULT_BUDGET_CAP_USD.toFixed(2)`.)*

### "How the cap holds" (kept — these are the guarantees, not marketing)
*(`cost/page.tsx:42–51`.)*
- Cost = real API-reported tokens × a pinned, versioned price table (not an estimate).
- Before every live call, a fail-closed guard blocks it if spent + next-estimate would exceed the cap.
- A batch threads cumulative spend, so the cap holds across the whole run — not just per call.
- An unknown model id fails loud (never silently prices at $0); a billed-then-failed call still records its cost.
- The price table was pinned + verified against official Gemini pricing for the recorded run; it must be re-checked before any future live run (never trusted from memory).

### Pinned price table
- **Heading (kept):** "Pinned price table (PRICING_VERSION)." Columns: Model · Input $/1M · Output $/1M — values render from `GEMINI_PRICING`; do not hardcode. *(`cost/page.tsx:53–77`.)*

---

## 10 — Merchant detail (`/merchant/[id]`, `app/merchant/[id]/page.tsx`)

The full why-chain for one merchant, in eight numbered sections. This is the surface that proves the system isn't a black box. Section titles are kept (they are the pipeline's spine); plain lines tightened. *(`app/merchant/[id]/page.tsx:34–334`.)*

- **Back link:** "← Activation queue." *(`merchant/page.tsx:45–47`.)*
- **Header:** merchant name · "[category] · [id] · onboarding [steps_completed]/[TOTAL_STEPS]" · risk chip "[level] risk · [score]." *(`merchant/page.tsx:49–61`; `TOTAL_STEPS` is a constant — `5` per the CatchPanel record `2 of 5 steps`, `[VERIFY]` the constant equals 5.)*

### Section titles (kept) + tightened plain lines
1. **Triage & diagnosis** — "How stuck this merchant is, and exactly what's blocking them — by an auditable rule, not a model guess." Shows the risk formula inline: `risk = 2×days_since_signup + 3×last_login_days_ago + 10×(TOTAL_STEPS − steps_completed) = [score]`. *(`merchant/page.tsx:64–82`.)*
2. **Drafted outreach** — "A bounded, schema-constrained draft. Here it's the deterministic stub (REPLAY); a recorded real-Gemini run is on the Eval page — the safety machinery around it is identical either way." Claims list: each declared claim shown against `merchant.[field]`. *(`merchant/page.tsx:111–138`.)*
3. **Claims-gatekeeper** — "A deterministic firewall: the draft can't reach a human unless every declared claim checks out against the merchant's data and no forbidden-claim pattern is present." Status chip `PASS` / `WARN` / `BLOCKED`; flag lists. *(`merchant/page.tsx:140–157`.)*
4. **Faithfulness check (semantic judge)** — "A second, independent check: an LLM from a different model family reads the finished message and verifies each factual sentence against the merchant's data row — catching an invented number, capability, or timeline the deterministic gatekeeper structurally can't see. Here it's the deterministic stub verdict (REPLAY, $0); the live cross-family judge (Groq gpt-oss-120b) is key-gated." Chip: `ALL SUPPORTED` / `UNSUPPORTED CLAIM`. *(kept verbatim — this is a claim about behavior; `merchant/page.tsx:159–206`.)*
5. **Domain quality check (domain judge)** — "A third, independent check, on a different question than faithfulness: not 'is every fact true?' but 'is this a good activation message?' — scored against a cited rubric. It's advisory and recall-favoring: surfaced for the reviewer and recorded in the audit trail, but it never changes the send. Eligibility and the human gate stay deterministic (a low-risk draft can still be simulated-sent even when flagged)." Chip: `GOOD PRACTICE` / `FLAGGED FOR REVIEW`. *(kept — the "advisory, does not change the send" clause is load-bearing honesty; `merchant/page.tsx:208–250`.)*
6. **Eval / quality** — "An independent measurement of draft quality across four dimensions — the deep-AI showcase, in human terms." Per-grader PASS/FAIL cards + "N/M dimensions passing." *(`merchant/page.tsx:252–276`.)*
7. **Human-in-the-loop gate** — "A person decides — hold, reject, or send. Low-risk, clean drafts are eligible to send (simulated); high-risk ones are held for approval." Buttons disabled: `Approve & send` · `Reject` · `Hold`. Note (kept): "Display of the gate state. Interactive approval (writing the decision back) lands in Phase C." *(`merchant/page.tsx:278–314`.)*
8. **Audit trail** — "Every step of the decision, recorded." actor · action · detail rows. *(`merchant/page.tsx:316–326`.)*

### Callouts
- **Held-for-review (kept):** "Held for human approval ([review_reason]). No message is sent until a human approves." *(`merchant/page.tsx:283–285`.)*
- **Eligible (kept):** "Eligible by the deterministic core → simulated send recorded." Plus, when the domain judge flagged: "The domain quality check above flagged this draft — advisory only; it does not change eligibility or the send." *(`merchant/page.tsx:297–306`.)*
- **Skipped-judge states (kept):** "Skipped — the gatekeeper blocked this draft, so it never reaches the semantic judge." (and the domain-judge equivalent). *(`merchant/page.tsx:201–205, 245–249`.)*
- **Honest-data footer (kept verbatim):** `HONEST_DATA_LABEL`. *(`merchant/page.tsx:329–331`.)*

### States
- **Not found (kept behavior; proposed copy):** the route calls `notFound()` for an unknown id. Proposed 404 copy: "No merchant with that id in this run. Back to the activation queue." `[VERIFY]` — a custom `not-found.tsx` may not exist; this is copy for one if added, no new capability implied. *(`merchant/page.tsx:37`.)*
- **Loading:** static server render (`generateStaticParams`) — no client loading state. *(`merchant/page.tsx:9–11`.)*

---

## 11 — Reader-test (predicted questions / misreads, and the fix)

1. **"Is this a real product I can buy?"** — The badge (`Prototype · REPLAY · $0.00`), the SIMULATED banner, and the footer all say no. Keep all three above the fold on every surface; don't let the premium layout push them below the first screen.
2. **"Which name is the product?"** — Wordmark "Commerce Truth Audit," landing title "ActivationOps," console platform "Curbside Commons." Real repo tension. Surfaced for the owner in §12; not resolved here (rebranding is a scope decision, `RULES.md` §2).
3. **"Where are the accuracy numbers?"** — Deliberately absent on the landing ("figures pending calibration"). A reader expecting a precision/recall stat should read the pending line as the answer. Do not add a number to fill the gap.
4. **"Does an AI decide whether my message sends?"** — No. The gate is deterministic; the semantic + domain judges are checks; a person approves. The domain judge is explicitly advisory and never changes the send. Keep that clause verbatim on the merchant page.
5. **"Is the 'real Gemini' run happening live?"** — No. It's a recorded static fixture, $0.0042, reproducible with your own key. The REPLAY badge + the eval callout carry this; keep both.
6. **"16 findings — is that a benchmark score?"** — No. It's the count in one committed fixture (11 error / 5 warn / 0 info). Frame it as "this sample report," never as a product-wide metric.

---

## 12 — Final honesty self-audit (writer, verified against sources this session)

- **SIMULATED banner byte-verbatim** ✓ — reproduced exactly from `copy.ts:53–54` / `ReportView.tsx:113–118`; unchanged on report and demo. (`Uber Eats` renders with a non-breaking space in the ReportView JSX; the canonical single-sourced string is plain "Uber Eats.")
- **Zero fabricated metrics** ✓ — the only hardcoded numerals in the deck are: the fixture tally **16 · 11/5/0** (counted from `expected-report.acp.json`, `ok:false`); `$0.00` and `$5`/`$5.00` cap (`Nav.tsx:44`, `console/page.tsx:75`, `cost/page.tsx`/`DEFAULT_BUDGET_CAP_USD`); `$0.0042` recorded-run cost (literal, `eval/page.tsx:34`); "2 of 5 steps" (`CatchPanel.tsx`); the five-stage / three-check / four-dimension / six-step / eight-section structural counts (each counted in its source file). All merchant/sent/held/percent values are marked data-bound — do not hardcode.
- **No real-marketplace claims** ✓ — no assertion of real DoorDash / Square / Uber Eats / Grubhub / DataSF data, access, or business impact anywhere. Non-affiliation footer kept verbatim; DataSF is described only as name+category public-record ingestion per `HONEST_DATA_LABEL`.
- **Prototype-not-service** ✓ — "Simulated prototype, run on demand — not a live service" preserved (report + demo footers); REPLAY badge kept; no uptime/hosting/SLA copy introduced.
- **No "no AI" / "AI built this"** ✓ — only "Human-led, AI-assisted, professionally reviewed" (`RULES.md` §4). The verifier's "no LLM on this path" claim is about the *verifier runtime*, not the build process, and is preserved as written.
- **Advisory-judge honesty** ✓ — the merchant page's "advisory — does not change the send decision" clause kept verbatim; not softened into a stronger claim.
- **Figures-pending honesty** ✓ — the landing carries no accuracy numbers; "figures pending calibration" preserved.
- **Anti-slop pass** ✓ — no "Insights/Growth/Scale/Optimize" filler, no invented testimonials or stats, no emoji, no rule-of-three padding; em-dashes used purposefully, not compulsively; sentence rhythm varied.
- **Open items for the owner** — the three-name product identity (§11.2) and the `[VERIFY]` markers (TOTAL_STEPS = 5; the proposed empty/404 states; hover microcopy) are surfaced, not silently resolved.

---

## By the numbers (all repo-grounded)

- Sample report: **16 findings — 11 error, 5 warn, 0 info** (`expected-report.acp.json`).
- Landing pipeline: **5 stages**, 2 of them checks (`page.tsx:40–72`).
- Trust anchor: **3 checks** between the AI and a merchant (`page.tsx:149`).
- Eval graders: **4 dimensions** — structure · state-consistency · policy · no-leakage (`eval/page.tsx:6`).
- Console pipeline: **6 steps** — Triage · Diagnose · Draft · Gate · Score · Approve (`console/page.tsx:31–38`).
- Merchant why-chain: **8 sections** (`merchant/[id]/page.tsx`).
- Recorded Gemini run: **$0.0042** spent, cap **$5** (`eval/page.tsx:34`, `cost/page.tsx`).
- Every CLI/verifier path: **$0**, zero LLM — deterministic (`ReportView.tsx:210–215`, `DemoView.tsx:134–140`).
