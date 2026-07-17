# Design spec — content reorientation + sample (session 23, CLOSED 2026-07-17)

**Status:** owner-approved spec, closed at the session-23 wrap ("ok wrap up. lets go for the build" = GO for the SAMPLE). This document is the binding build artifact for session 24; the conversation is disposable, this file is not.
**Scope of the GO:** the two-page SAMPLE only (Home + Listings audit mockup in `mockups/`). Build pieces 1–3 (live site) fire only after the owner's adopt word on the sample.
**Provenance:** owner directives session 23 (decision-log rows 2026-07-17); measured page evidence (every route rendered + word-counted this session); two live research sweeps (`docs/research/research-ux-audience-2026-07-17.md`, `docs/research/research-motion-components-2026-07-17.md`); the committed cross-industry digest (`docs/research/design-crossindustry-2026-07-16.md`); sol copy session `019f703d` (gpt-5.6-sol@high via codex-guarded).

## 0 · The reframe (owner, verbatim anchors)

- "it is content gap" — the problem is CONTENT (clarity, crowding, navigation, narrative), not styling.
- "overall this shouldn't be website but agentic product it should be felt" — the site is the product operating, not a brochure about it.
- "retain all the language substance … the language delivery, tone, nuances should be more human simple naturally writing."
- "how i built need not have to come to main in our product, that is background … professional documentation."
- "you dont want hint or mention anywhere in it is a prototype, or simulated it is understood … you dont have to be too obvious."
- "The taste, language tone, flow take the how sol writes, content you take it. Overall storytelling arc is what most important."
- "it should be bright design." (upholds the standing 2026-07-08 no-dark-background preference)
- "highest pixel quality upto 4K … most modern, ultra-premium, decorative, stylish … refer to framers [not just Vercel]."
- "you can mention it for new york location alone." (fee law scoped NYC-only)
- "local build, we can export to claude design for review."

## 1 · Navigation (8 tabs → 4 numbered chapters)

`◆ Curbside Commons — 01 Listings audit · 02 Fee audit · 03 Try it live · 04 Proof` + header case-status readout (the instrument's voice, e.g. `CASE 001 · CLAIM HELD · 16 FINDINGS`).
Footer: Documentation (/docs) · Legacy activation · GitHub + ONE quiet honesty line (see §5). "PROOF LAYER" chip REMOVED. Every page ends with a continue-chain door to the next chapter. Merges: /eval + /metrics + /cost → /proof (redirect stubs, noindex meta-refresh pattern); /demo → landing scene + /report opener (stub); /legacy index dead-end → one-paragraph archive landing.

## 2 · The storytelling arc (7 beats, one continuing case)

1 HOOK — "The feed says $2,150. The pizza is $21.50." · 2 STAKES — the agent about to order, live scene · 3 TURN — the claim held; the six-step receipt assembles (the site's ONE theatrical beat) · 4 WORLD — 16 findings + the fee-law file (two cards) · 5 READER ENTERS — try it: edit a price, get caught, keep the receipt · 6 WHY IT MATTERS — merchants/platforms/agent operators + the empty-seat line (as-of mid-2026) · 7 TRUST — deterministic verdicts, 1,200+ tests, failures reported not hidden → /proof.
Numbers are plot points. Chrome speaks as the instrument, present tense: `EXAMINING · CLAIM 11 OF 16 · HELD`.

## 3 · Language (sol's voice on Fable's facts)

Division locked: Fable owns content (facts, beats, numbers, rule ids — verified per section); sol owns surface (taste, tone, flow, word choice) via codex-guarded @high, Fable adjudicates primary-model-final. Register: modern, simple, elegant; short sentences; calm present tense; both technical and non-technical professionals read once and understand. ALL professional terms kept (ACP/UCP, system of record, receipt, rule, §20-563.3, deterministic, pre-registered). Retired as explanatory vocabulary: "the commons" (except the name), "serving copy", "the kitchen", "held in the commons" — plain nouns replace them (the feed, the published menu, the merchant's records); inner H1s included (/report → "What the feed claims vs. what the records say"; /playground → "Verify a feed in your browser"). Banned: hype vocabulary, em-dash chains, rule-of-three padding, real company names, any affirmative claim of real platform access/data/operated service.

**Adjudicated sol hero (adopt verbatim):** H1 "The feed says $2,150. The pizza is $21.50." Sub: "Curbside Commons independently checks delivery-marketplace feeds and monthly fee statements against the records and rules that govern them. It is built for merchants, platforms, and agent operators, with marketplace feed checks anywhere in the US. It is a working prototype run entirely on simulated data." *(sub's last sentence is superseded by §5 quiet honesty — sol re-drafts the close of the sub at build; the two accuracy fixes stand: arithmetic mirrors the real receipt [2150.00 × 100 = 215,000¢ ≠ 2,150¢], rule named once as LST-PRICE-CENTS-AS-DECIMAL.)* CTAs: "Watch the check" · "Try it on a feed". Full sol section drafts: raw in scratchpad sol-copy-out.txt this session; re-run per-section at build.

## 4 · Jurisdiction + audience framing

Listings truth: anywhere in the US, industry-wide, company-agnostic. Fee audit: NEW YORK CITY ALONE, stated plainly wherever it appears (one line in the landing fee card; depth on /fees). SF/Seattle/Minneapolis: ONE forward line on /fees only, clearly marked next-not-built. NEVER imply the fee law covers the US. Empty-seat positioning (dated as-of mid-2026, per the Rye landscape): trust products verify the agent; no named product independently verifies the feed against the merchant's records.

## 5 · Quiet honesty (recorded freeze-reversal — owner-worded session 23)

The pervasive SIMULATED banner/labels and the frozen footer paragraph are RETIRED via a recorded freeze-reversal row + red-green rewrites of their binding tests (S2-precedent procedure). Replacements: natural "sample feed / example months" language; ONE quiet footer line; a plain statement on /docs. Bright line UNCHANGED: no affirmative false claims ever; C10 BANNED_CLAIMS stays green; the README is brought to the same quiet-honest voice in the build so site and repo agree.

## 6 · Visual register (bright, ultra-premium, 4K)

- BRIGHT ground everywhere (standing owner preference). Two-material system: paper (evidence) vs a cool engineered bright surface (machine world) — separated by temperature/texture/type, never darkness.
- Ultra-premium decorative = FINISH, not addition: machined receipt rules, accession-card hairlines, chapter seals, lamp chrome, macro-whitespace; few elements, high tolerance.
- The receipt is the brand object: one geometry everywhere (landing, drawer, export); museum accession-card provenance labels; unit-true monospace columns (mono face candidate Geist Mono OFL — vet + self-host at build).
- Instrument lamps, fixed meanings: ember=violation · gold=held · graphite=pass. The ×100 delta staged macro-detail ("the jewel") on bright ground. Per-chapter accent temperature inside one system.
- 4K: zero raster assets (type/SVG/DPR-aware canvas only; existing full-DPR/16MP canvas contracts); QA adds 2560 + 3840 viewport checks to the standard 1280/1440/1728.
- References: current Framer showcase/award tier + mid-2026 Awwwards register, pulled LIVE at build (no memory); Vercel guidelines used ONLY for interaction/a11y discipline. v8 remains the substrate (tokens, scene, contrast math) — "v8 matured", the owner judges drift at the sample.

## 7 · Motion & interaction (verified current, native-first)

Title-card type arrivals (WAAPI stagger; instant under reduced-motion) · the hold beat (ONE theatrical moment) · scroll-as-examination on Home (IO + WAAPI first; CSS scroll-timeline enhancement-only — Firefox still flags it; GSAP only if the sample proves need → full intake vet + owner sign-off) · same-document View Transitions (Baseline) for receipt drawer/state changes — React <ViewTransition> REJECTED (experimental) · CSS linear() spring easing on controls/counters · NumberFlow on verdict figures · Vercel microstate discipline wholesale (six states, focus-visible, hover/focus contrast increases, cancelable, no autoplay) · chrome recedes while reading; glass = header only (restrained-glass boundary) · watchmaker tempo, no bounce. REJECTED: magnetic cursors, heavy glass, decorative 3D hero, bento-as-identity.

## 8 · "Agentic product you operate" (the felt layer)

Everything felt is one of exactly two things: the REAL engine executing in-browser, or a REPLAY of a real recorded run (quietly labeled). Never fake liveness. Felt mechanics: the check runs as you watch (scene + receipt assembly); the status rail narrates; the visitor breaks the feed on purpose in /playground and keeps their own receipt (export = later build piece); the recorded crew session and MCP session replay as live consoles on /proof and /docs; the Slack message assembles then visibly declines to send. The terminal demo legs (SHOWCASE.md) are the second act where everything runs live.

## 9 · Invisible design systems (build them as systems, not styles)

Token tiers (v8 substrate) · tokenized motion scale (named durations/easings incl. linear() springs + stagger interval) · spacing/rhythm modular scale · six-microstate state model · semantic lamp roles (a color never means two things) · recomputed-WCAG-ratio contrast math (ST-1 precedent) · print layer (everything prints as paper — permanent print e2e) · reduced-motion variants at token level.

## 10 · Floors (verify, never improvise)

Print = paper always · no-JS/reduced-motion = complete settled story, nothing waits for scroll (opens-complete) · desktop 1280/1440/1728 (+2560/3840 pixel-QA) · axe zero A/AA · WCAG 2.2 pause · zero external requests · static export · C10 green · engine/goldens untouched (landing drift-lock golden regen = sanctioned, through the real generator, recorded).

## 11 · Capability placement map (the MCP/RAG/Slack "invisible layer")

/proof (evidence it ran): classifier 21/21 · crew live-run record + labels · RAG floors-missed story · entity-resolution tie · signed approvals + exploit sealed · engine measurables · $0 enforcement + the one recorded spend · one-pass rule. /docs (how it works, footer-linked, NOT main nav): architecture diagram (feeds+statements → verifier core + rule packs → receipts → site/CLI/MCP/n8n) · crew (iron rule: agents recommend, engine decides, human approves) · MCP server · n8n lane · delivery builders that cannot send · CLI runbook · short build-method note (RULES §8). Landing gets ONE pointer sentence in the honest close linking /docs (recommended default; owner may veto at sample review).

## 12 · Sample scope (hard) + what follows

SAMPLE = Home + Listings audit as one standalone mockup in `mockups/`, wired to real fixture data (16 findings, real receipt), fully interactive, bright register, side-by-side comparable with today's site; exported to Claude Design for review after local build. TWO PAGES ONLY — everything else parks. After the adopt word: piece 1 nav+landing → piece 2 merges (/proof, stubs, /legacy fix) → piece 3 /fees reframe + /docs + footer + freeze-reversal + README voice pass; each piece: sol pass → Fable fact-check → build → red-green rewrites of bound tests (~93 e2e copy assertions incl. canonical.spec.ts ~30, fees.spec.ts, playground.spec.ts + landing golden + C10) → full gates (verify · e2e both modes · axe · layout/print · Codex batch · acceptance-gate · judged de-slop) → clean-room PRE-GATE/RELEASE GATE → owner walkthrough guide → owner deploy word (LAST).

## 13 · Open picks + watch items (owner)

Landing /docs pointer sentence (default yes) · live-Slack-send as standard demo leg (needs named channel + secret, owner-armed) · domain decision at deploy · retire/redirect the stale Cloudflare deploy (curbside-commons.pages.dev serves an OLD version) at Vercel deploy · DCWP recordkeeping hearing (2026-07-16) outcome check before /fees copy lands · stranger test after build · standing picks: OG card (will close with the new hero) · robots posture · statute-status line · nav-labels (superseded by the new nav) · d-4 watch item.
