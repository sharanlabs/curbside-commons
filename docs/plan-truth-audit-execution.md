# Execution Plan — The Verifier Program (UC-2 truth-audit toolkit + UC-1 fee audit)

**Status: v1.0 — GO (owner ratified 2026-07-02, decision-log; NO-WAIT doctrine + real-first data doctrine + O4 declined recorded there). G8 runs inline immediately; build proceeds. Confidence: MEDIUM, conditional on G8's outcome.** → **G8 RAN INLINE 2026-07-02: PASS** (copy layer is in-protocol per the UCP catalog spec; independent seat unoccupied after teardown; buyer claim consciously declined) — `docs/reviews/gate-2026-07-02-g8-crux.md`. **Build is live; next slice = restructure (§6) + W1.**
**Register note (per `docs/documentation-standard.md`):** professional register leads; *plain-English lines are marked ▸*. New terms land in `docs/GLOSSARY.md`. Successor to `docs/plan-multi-agent-execution.md` (superseded for the active program; retained as the provenance spec of the verification spine).

---

## 0 · SCQA summary

- **Situation:** Agentic commerce is live (Square→ChatGPT/Claude ordering 2026-07-01; DD/UE/GH in Gemini since 2026-03) on two young open protocols — OpenAI/Stripe **ACP** and Google-led **UCP** (both Apache-2.0, both churning: 5 ACP releases in 8 months). Meanwhile NYC runs the first fee-cap enforcement era (HungryPanda $875K; DCWP recordkeeping rulemaking open NOW).
- **Complication:** Conformance tooling exists (official `ucp-schema`, community validators) — but **nothing checks what a feed/serving copy SAYS against the merchant's system-of-record**, and nothing audits fee statements against the codified caps. Spec-valid data can still lie; agents transact on it; merchants eat the errors.
- **Question:** Can one evidence-grade verifier prove both — listings truth (UC-2) and money truth (UC-1) — at showcase-grade, honestly, within prototype constraints?
- **Answer:** Build **one verifier core with two claim-domain packs**, led by a fast $0-LLM UC-2 wedge (drift engine + one-page evidence-cited report + published torture corpus + spec-faithful demo), with **UC-1 parallelized from week 1** as the AI-depth centerpiece (LLM line-item classification + calibrated judges vs codified rule tables).
- ▸ *Plain: platforms and AI agents show copies of a restaurant's menu and bills. Copies drift from the truth. We build the referee that catches the drift — first for menus AI agents order from, then for the fees on merchant statements — and we prove every catch with evidence.*

## 1 · Fixed goal, intent frame, constraints (owner-set; binding)

Demonstrate deep AI proficiency to the delivery-marketplace industry **by benefiting it** (platforms = indirect beneficiaries; company-agnostic; "marketplace integrity infrastructure"). Showcase-first, venture-ready — **"a showcase with venture optionality on two named, observable triggers"** (surface-side truth enforcement; UCP food-schema publication / FTC NPRM). Constraints (all standing): prototype-not-service (episodic runs, no 24/7 ops) · **desktop web only, no mobile** (owner 2026-07-02) · free/free-tier everything except Gemini ≤$5 hard cap · honesty rules (simulated labels; no real platform access/data/impact claims; demo agent = scripted-labeled or Gemini-driven, never Claude/Codex runtime) · legibility = hard artifact constraint (one-command validator · one-page report · demo needs no explanation) · two-register documentation, same-breath maintenance.

## 2 · What the council changed (RESHAPE-PROCEED, 2026-07-02 — adopted here)

The five-agent council + synthesis (`shared_reasoning.md`, 2026-07-02 evening) confirmed the direction but **reshaped the program**; the seven conditions below are folded into every section that follows:

1. **S-5 close-out first** — commit the suspended slice-2 diff with honest degraded labels; freeze the activation build as the spine's provenance exhibit. ▸ *Plain: finish the old chapter cleanly so the new one stands on proof, not abandonment.*
2. **UC-1 is the program's PRIMARY evidence + AI-depth track, from week 1** (rule-table + gold-set design start immediately; the AI-proficiency narrative lives here). **UC-2 is a bounded frontier demo** — bounded unless condition 8's gate confirms the live-copy drift seat. *(Codex amendments 3/11: sequencing optimizes for craft showcase + verified pain; venture/category timing influences launch, never build order.)*
3. **July-16 DCWP window = an owner call THIS WEEK** (see §9 Owner calls).
4. **Surface-agnostic truth engine** — the drift comparator verifies SOR vs static ACP feed **and** vs live UCP catalog-capability responses (live-read fixture ships in the wedge). Demo claim: *"any serving copy can drift from the system of record — whichever surface serves it."*
5. **Demo slice-C cut** — no fake-checkout build; the demo ends at agent-selects-the-drifted-item; scripted **spec-faithful** agent is the proof (labeled), Gemini is color.
6. **Category claim demoted** — identity = the mechanism (*"conformance checks the feed against the schema; we check it against reality"*); "truth layer for agentic commerce" = tagline only; venture language capped at the honest sentence above.
7. **Pre-registered tripwire reviews** with kill/reshape authority — split per Codex amendment 8: pre-build crux gate → 14-day build-slip gate → 30-day external-signal gate (§10).
8. **HARD PRE-BUILD CRUX GATE (Codex amendment 1 — blocks W1):** before any UC-2 implementation, resolve (a) the UCP/ACP serving architecture in marketplace contexts (does a copy layer persist behind live catalog reads?) and (b) incumbent verification depth (Feedonomics ACE / Deliverect — does anyone already check vs SOR?). **If direct-SOR/live-read dominates or the seat is occupied → the UC-2 demo is demoted and UC-1 becomes the undisputed lead.**

**The crux (reframed per Codex amendment 9 — TWO-PART):** (i) technical — does copy/SOR drift persist behind food's live-query shift? AND (ii) demand — who has the authority, pain, and budget to require independent truth evidence (enforcement creates the reason to run the tool)? Even a technically-persistent drift seat can be a no-buyer artifact; gate 8 resolves (i) by teardown and (ii) by naming the enforcing surface or declining the claim.

## 3 · Architecture (C4-context level) + verification-spine reuse

```
[Merchant SOR]──(truth)──▶┌────────────────────┐──▶ one-page evidence-cited report
 synthetic catalog │      │  VERIFIER CORE     │        (S-9: report IS a document)
 Square sandbox    │      │ claim → determinis-│──▶ machine output (JSON, CI-usable)
[Serving copies]──(claims)│ tic check vs swap- │
 ACP static feed   │      │ pable reference →  │   packs: listings/ (UC-2)
 UCP live catalog  │      │ evidence → verdict │          fees/     (UC-1)
 fee statements    │      └────────────────────┘   human gate on anything outbound
```
▸ *Plain: one engine compares what's claimed against what's true and attaches receipts; menus and fee statements are just two kinds of claims.*

**Reuse map (build-realist, file-verified — honest fraction ~30–40%; the 306-test headline does NOT carry):**
- **As-is:** `lib/agents/{budget,pricing}.ts` (cost ledger + $5 fail-closed), `lib/agents/{gemini,groq}.ts` + `lib/server/env-flags.ts` (provider gates), REPLAY seam ($0 public surface), eval-harness patterns (calibration-lock · differential-oracle · live-gating), Next.js/TS/Tailwind console shell + `npm run verify` toolchain.
- **Adapted:** `gatekeeper.ts` → the drift comparator around a **swappable reference interface** (JSON schema | POS catalog | fee-rule table) — where "one engine, two packs" is proven or dies; semantic/domain judges + calibration harness → **idle until UC-1**, where they re-earn their keep.
- **Dropped → `legacy/activation/`:** the activation domain (pipeline, diagnosis, drafting loop, SF dataset, domain gold sets) — archived runnable, per S-5.

**Conformance strategy:** own TS/ajv validation at runtime (UCP mandates client-side schema composition; ACP feed = ~14 required fields + conditionals + cross-field invariants, primary-extracted); official `ucp-schema` (Rust, cargo-only) composed **in CI as a differential oracle** — never a runtime dependency (one-command constraint). nekuda = cited see-also.

## 4 · Success criteria + acceptance tests (declarative; each slice gates on its subset)

| # | Criterion | Acceptance test (machine-checkable unless marked) |
| --- | --- | --- |
| C1 | One-command validator | `npx <name> check feed.json --against catalog.json` exits non-zero on any drift/conformance finding; zero-config on the shipped fixtures; **zero LLM calls in the wedge path** (cost ledger asserts $0) |
| C2 | Evidence-cited findings | every finding carries claim · reference-row id · rule/spec-clause id · severity; an eval asserts NO finding without all four |
| C3 | Surface-agnostic | the same drift set is detected from (a) static ACP feed and (b) recorded live UCP catalog responses over the same SOR — one comparator, two adapters, differential test; **must include ≥1 ID-mismatch/entity-resolution class + ≥1 modifier/variant-ambiguity class; every report labels whether matching was synthetic-controlled (shared IDs) or real-world** (Codex amendment 5) |
| C4 | One-page report (S-9/S-10) | report renders ≤1 page (desktop web + printable); every finding has a plain-words line; passes the documentation-standard checklist (human-judged, gate 4) |
| C5 | Conformance correctness | agreement with `ucp-schema validate` on N≥30 CI fixtures (differential oracle, green); ACP checks red-green tested per extracted field rule |
| C6 | Taxonomy coverage measured | drift taxonomy v1 (§7) enumerated in code; eval reports % classes covered by fixtures + % caught; **never an "all edge cases" claim** (guardrail scan blocks the word "all") |
| C7 | Demo needs no explanation | demo claim verbatim (Codex amendment 6): **"a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch"** — never "the agent gets caught" as headline; scripted replay $0, deterministic, labeled "spec-faithful demonstration actor — simulated"; Gemini variant = non-load-bearing color, ≤$0.50, bounded retries, may fail visibly (honest) |
| C8 | UC-1 classification quality | LLM line-item classifier vs codified NYC rule table: held-out precision/recall published with CIs; calibrated judges (existing bar pattern R-DHON-3); no "calibrated" claim below the pre-registered floor |
| C9 | Corpus publishable | `fixtures/synthetic-restaurant/` self-contained, licensed, taxonomy-keyed; README meets the doc standard |
| C10 | Honesty surface | grep-gate: no real-platform-access claims; simulated labels on every synthetic artifact; spec-version pin printed in every report header |

## 5 · Slices + gates (S-4 model — proposed as standing policy, owner call)

**Gate policy (S-4):** per-slice = `npm run verify` green + red-green on load-bearing changes; **full ceremony (ONE batched Codex changed-files review + acceptance-gate) at module boundaries** M0/M1/M2 and before anything irreversible. Effort auto-routed; ship-gating reviews → xhigh.

| Slice | Content | Est. (realistic) | Gate |
| --- | --- | --- | --- |
| **S0** | S-5 close-out (Codex amendment 2: **freeze/archive only after an explicit owner acceptance record + final `npm run verify` + a written provenance caveat**; capability claim capped at what the degraded labels support — never "capability proof" beyond them) + `legacy/activation/` freeze + repo restructure execution (after owner GO) | 2–4 d | verify + **M0 Codex batch** (includes the held slice-2 review flag) |
| **G8** | **PRE-BUILD CRUX GATE (blocks W1; condition 8):** UCP/ACP marketplace serving-architecture teardown + Feedonomics/Deliverect verification-depth teardown + name the enforcing surface (crux part ii) → outcome recorded: UC-2 proceeds as planned / demoted to UC-1-lead | 0.5–1 d | written gate record; owner sees the outcome |
| **W1** | Wedge: synthetic restaurant SOR + ACP feed generator + drift injector (taxonomy v1) + deterministic comparator + evidence model + CLI | 8–12 d | verify + red-green |
| **W2** | UCP: ajv over published schemas + live-catalog response fixtures (surface-agnostic C3) + `ucp-schema` CI oracle | 4–6 d | verify + red-green |
| **W3** | One-page report (web + machine JSON) + corpus packaging (C4/C9) | 3–5 d | verify; **M1 Codex batch + acceptance-gate** (wedge module done) |
| **P1** ∥ | UC-1 parallel track from week 1: §20-563.3 rule-table codification (owner-assisted primary text) + statement schema + gold-set design | continuous | design-reviewed at M1 |
| **D1** | Demo: scripted spec-faithful agent on the drifted corpus (+ Gemini color, ≤$0.50) + conformance-foil beat ("passes `ucp-schema validate`; still lies") | 6–8 d | verify + **owner GO on any live Gemini spend** |
| **F1** | UC-1 build: parser + LLM classifier + judge recalibration + evidence-cited fee report | 15–25 d | verify; **M2 Codex batch + acceptance-gate** |
| **Pub** | Writeup + demo recording + corpus publication, timed to an ecosystem news moment | 2–4 d | **owner-gated (public posting)** |

Total wedge-to-M1 ≈ 4–6 weeks episodic; F1 roughly doubles the program. The $5 cap binds nowhere before F1 (wedge is $0-LLM; demo ≤$0.50; UC-1 judges ride Groq free tier with existing pacing).

## 6 · Repo restructure (proposal — execute only after owner GO, in S0)

`lib/verifier-core/` (claim schema · swappable reference interface · evidence types · report model) · `lib/packs/listings/` · `lib/packs/fees/` · `legacy/activation/` (archive-don't-delete, tests runnable via separate script) · `fixtures/synthetic-restaurant/` (the publishable corpus) · `bin/` thin CLI · `evals/{core,packs}/`. Console stays Next.js (desktop-only per the 2026-07-02 constraint). **No repo/product rename until S-11's live checks** (name candidate "Assay"; trademark/domain/npm/GitHub checks = owner-gated adoption).

## 7 · Edge-case taxonomy v1 (enumerated — coverage measured, never "all")

**Listings drift classes:** price (value · currency-form · cents-vs-decimal · sale_price>price) · availability (86'd vs out_of_stock vs hidden vs hours-window) · existence (ghost item · missing item) · identity (ID-mismatch/entity-matching · variant/modifier mismatch) · staleness (expired `expiration_date` · stale `availability_date`) · encoding (UTF-8 · length-limit truncation) · spec-version skew (Stable-vs-Draft field drift · UCP `supported_versions` mismatch) · cross-field invariant breaks (checkout-eligible w/o search-eligible; missing conditional fields).
**Fee-line classes (UC-1, from documented enforcement tactics):** bundling into single line items · relabeling across months · misclassification (marketing-as-delivery etc.) · over-cap after correct classification · promotion-deduction mischaracterization · processing-fee base inflation.
Each class: ≥1 corpus fixture + a comparator/classifier test; the coverage eval (C6) reports the measured fraction.

## 8 · Data plan

Synthetic-primary (internally-consistent restaurant SOR + feeds + statements; generator seeded/deterministic) · REAL codified public rules (NYC §20-563.3, SF cap) · live ToS-clean reads only (public specs; own Square **sandbox** via `ITEMS_READ`; recorded UCP catalog fixtures) · zero real merchant data; everything labeled simulated. Operator-voice gap stays open (Reddit blocked ×3) — **owner-assisted pass remains a standing to-do; the plan does not claim operator-demand validation.**

## 9 · Owner calls surfaced with this plan (decide at GO; none assumed)

| # | Call | Recommendation |
| --- | --- | --- |
| O1 | Ratify the reshaped direction (council RESHAPE-PROCEED + Codex reconciliation) | Proceed as reshaped |
| O2 | S-4 module-boundary ceremony as standing policy | Adopt |
| O3 | S-5: commit suspended slice-2 diff as-is (honest labels), drop the clean-K re-run, freeze lineage | Adopt (S0) |
| O4 | **July-16 DCWP comment window** — submit a substantive public comment on machine-auditable recordkeeping? **Public posting + external action = owner-gated**; needs research-not-tool, ~1–2 days, this week. **Gated by a ONE-PAGE SOURCE MEMO first (Codex amendment 4):** exact rule text, exact deadline, exact effective dates (the 2025-05-31 vs 2025-06-30 LL79 conflict resolved on primary text), verified-vs-unverified ledger — no public claim before the memo | Decide explicitly after the memo; if declined, log as consciously declined |
| O5 | S-9: the drift/fee report as a documentation-standard artifact | Adopt (already designed into C2/C4) |
| O6 | S-11: name adoption ("Assay") after live trademark/domain/npm/GitHub checks | Defer until Pub slice; checks first |
| O7 | Repo restructure execution (§6) | Approve with S0 |
| O8 | 30-day review date + kill authority (council condition 7) | Set at GO |

## 10 · Risks, tripwires, and the next test

**Top risks (council-priced):** quiet fizzle ~45–55% (mitigation: news-moment launch, corpus-before-schemas citation race, S0 provenance floor) · wrong-architecture embarrassment ~25–35% (mitigation: condition-4 surface-agnosticism + the crux teardown below) · staleness-as-negative-exhibit (mitigation: version-pinned rule tables + spec-watch productized; prototype-grade maintenance bounded) · UC-1 slip re-opening the thin-AI hole (mitigation: parallelization + M1 design review of the P1 track).
**Tripwires — SPLIT per Codex amendment 8 (all pre-registered, kill/reshape authority live at each):**
1. **Pre-build crux gate (G8, blocks W1):** the two-part crux (§2 condition 8) resolved BEFORE wedge implementation — (a) UCP transport/binding: who serves the catalog capability in marketplace (non-POS) contexts; is a copy layer in-protocol? (b) Feedonomics ACE + Deliverect verification depth (does anyone already check vs SOR?) (c) crux part ii: name the enforcing surface/buyer or decline the claim. Favorable → build as planned; unfavorable → UC-2 demoted to bounded demo or dropped, UC-1 undisputed lead.
2. **14-day build-slip gate:** wedge tracking >2× the realistic estimate, or the UC-1 rule-table/gold-set track unstarted → review fires.
3. **30-day external-signal gate:** zero external engagement in month 1 · corpus uncited at the food-schema moment → review fires with kill/reshape authority (O8).

**Overall confidence (Codex amendment 10): MEDIUM, conditional on G8** — not medium-high; the residual-seat trajectory (shrinking under every adversarial pass) and the unresolved two-part crux cap it.

## 11 · Verification of this plan itself

Council: DONE (RESHAPE-PROCEED, `shared_reasoning.md` + synthesis). Codex cross-check: DONE — **CONFIRM-WITH-AMENDMENTS, all 12 findings accepted + folded in** (`docs/reviews/codex-2026-07-02-pivot-crosscheck.md`; raw verdict alongside). Docs-coherence gate (amendment 7): suggestions-ledger + backlog corrections appended 2026-07-02. **Primary-source lockfile (amendment 12):** before ANY public claim, `docs/research/source-lockfile.md` is created with URL · access date · quote · status for every load-bearing live fact (July-16 DCWP deadline · UCP catalog live-query wording · `ucp-schema` version · ucptools depth/pricing · UCP Food council participants · OpenAI feed-vs-website rejection · Gemini free-tier figures · LL79 effective date). Owner GO: the final gate — **no build (including S0's commit) starts before it.** Same-breath docs at GO: PLAIN-ENGLISH.md § update, GLOSSARY additions (ACP, UCP, SOR, drift, conformance-vs-truth), decision-log ratification row.
