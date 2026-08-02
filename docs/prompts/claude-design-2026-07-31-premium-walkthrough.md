# Claude Design prompt — premium 2026 visual + walkthrough enhancement

**Route:** Claude Design (web), DesignSync project **"Curbside Commons Sample"**
(`8bed5e72-bb92-430a-b38c-82b5d212cf8d`). Fable/Opus authors the prompt; Claude Design does the
design. Standing owner directive, 2026-07-16.

**Why not `/design-sync`:** that skill converts a component library (built `dist/` or a Storybook)
so the design agent builds with the real compiled parts. This repo has neither — it is a Next.js
app, and the Claude Design project is a *brief workspace* (`brief/`, `samples/`, `screenshots/`),
which is how every prior design round here ran. The full conversion would cost hours and produce
nothing usable. Checked, not assumed: no `.storybook/`, no `*.stories.*`, no `dist/`.

---

## How this prompt is built — the part worth reusing

Four things make a design prompt produce an *enhancement* rather than a replacement. Each is a
section below.

1. **Give it the tokens, not adjectives.** "Premium" is unactionable; `#2438d6`, Onest 680,
   `--r-card 16px`, `clamp(72px, 10vh, 100px)` are actionable. A designer given real values
   extends a system. A designer given adjectives replaces one.
2. **Name what may NOT move, and why.** Without the why, a good designer overrides a constraint
   they think is arbitrary. "Blue is never a status lamp" is a rule; "blue means interactive here,
   so a blue status light collides with every control" is a rule they can apply to a case you
   never listed.
3. **Give it the failure, not the wish.** "Make it more premium" produces decoration. "The one
   action a first-time visitor can take produces feedback below the fold" produces design.
4. **Say how you'll judge it.** This project defends design decisions with regression tests. A
   designer who knows that writes moves that can be defended.

---

## THE PROMPT — paste into Claude Design

```
CURBSIDE COMMONS — VISUAL + EXPERIENCE ENHANCEMENT, 2026 PREMIUM TECH REGISTER

You are enhancing a shipped product, not designing one. Everything below marked
FIXED is an owner decision made this month, several of them twice. Extend the
system; do not replace it. If a move you want requires breaking a FIXED item,
propose it separately with your reasoning — do not just do it.

═══ WHAT THIS IS ═══

A browser-side audit instrument. It checks a delivery-marketplace feed against a
merchant's own records, applies New York City fee-cap law (Admin Code §20-563.3),
and returns a verdict with the arithmetic attached. Everything computes in the
tab — nothing the reader loads leaves the page.

The engine and the law are REAL. The merchant and the data are INVENTED. That
distinction is enforced by an automated scan and it constrains copy everywhere:
never imply real platform access, a real merchant relationship, or business impact.

The register is an evidence instrument, not a SaaS landing page. Think oscilloscope,
audit report, laboratory notebook — precision as the aesthetic. Not dashboard, not
marketing site.

═══ FIXED — the design system that ships ═══

TYPE. Onest for display and body. JetBrains Mono for DATA ONLY — ledger numerals,
field keys, verdict labels, rule IDs, uppercase eyebrows. Never mono on a heading;
a mono nameplate shipped briefly and was reverted by owner word.

  Weight ladder, calibrated to Onest specifically:
    H1 / display    680      H2              660
    H3 / titles     700      Lead paragraph  660
    Body            460      Nav             560
    Chrome labels   590

  These numbers do not travel to another typeface. The site briefly ran Nunito with
  every display weight +60 and body +40, because Nunito reads optically lighter at
  the same numeric value. Do not carry weights across a face.

  Scale is fluid via clamp(). Display clamp(33px, 5.4vw, 56px), stepping through
  clamp(34px, 4.4vw, 52px) and clamp(28px, 4vw, 42px). Section H2
  clamp(25px, 2.5vw, 35px). Body 17px / 1.7. Chrome labels 10.5–11.5px.
  Display tracking is per-surface and deliberate: landing and /proof -0.028em,
  /report -0.03em.

COLOR. Ultramarine #2438d6 on white. ONE accent. Color is rare and load-bearing.

  Ink ramp, every step contrast-verified on white:
    --ink       #12141c  18.38:1   headings, hard marks
    --ink-2     #22252f  15.29:1   strong text
    --body      #3b3f4b  10.51:1   body text
    --graphite  #4a4e5a   8.31:1   labels, values, icon strokes
    --muted     #585d69   6.59:1   secondary, 13px nav
    --faint     #6a6e7a   5.09:1   tertiary

  Grounds: --bg #ffffff · --bg-2 #fbfbfc (panels) · --bg-3 #f3f4f8 (faint cool well).
  Hairlines are alpha on the ink hue: 9% / 15% / 24%.
  Accent hover --accent-hi #25329a (darker, so white text still passes).

  THE LAMP SYSTEM. Status is carried by a small set of hues — ember #b42318 (the
  FAIL verdict), gold #ffb020 (held), azure #1f8fff (fill/mark only), graphite
  (neutral chrome). BLUE IS NEVER A LAMP: blue means interactive here, so a blue
  status light would collide with every control on the page. Bright fills are
  unusable as text and the tokens say so — gold is 1.83:1, azure 3.27:1; each has a
  separate darker -text token. Never set type in a fill hue.

  LIGHT ONLY. No dark mode. color-scheme: light is declared in CSS and in the
  viewport export.

SPACE + SHAPE. 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 88 · 120.
  Section rhythm clamp(72px, 10vh, 100px). Radii are hierarchical, not uniform:
  card 16px · control 12px · chip 9px · pill 999px (buttons, nav pills, status chips).
  Grid-disciplined centred column, --maxw 1180px, gutter 32px.

  Text measure is capped in ch and it is load-bearing: headings ~20ch, ledes 62–64ch,
  58 max-width caps in ch overall. 1ch is the advance of "0" in the RENDERED FACE at
  the RENDERED WEIGHT, so a type change silently re-measures the entire site.

MOTION. Intentional, never decorative. 118 transition declarations animate ZERO
layout properties — transform and opacity only. Never width/height/top/left/margin/
padding. 24 prefers-reduced-motion blocks resolve animated surfaces to their settled
state; anything you add needs one.
  --ease cubic-bezier(0.16, 1, 0.3, 1) · --ease-arrival cubic-bezier(0, 0, 0.2, 1)
  --dur-1 150ms · --dur-2 240ms · --dur-3 350ms · --dur-reveal 460ms · --dur-hero 620ms

ALSO FIXED. Desktop only. Workbench-first landing (the tool opens the page — this
was demanded twice in the owner's own words and confirmed again on 2026-07-31).
Production register — no "sample" or "example" captioning the site as a demo, though
words stating what the data IS read "bundled" and are TRUE and must stay.
De-numbered sitewide: no chapter numerals anywhere, because numerals told visitors
this was a document to be read in order.

REJECTED FOR THIS PRODUCT, already litigated: gradient text beyond the single
existing H1 phrase · gradient buttons · glassmorphism as a default surface · uniform
border-radius · three-column icon-card feature rows · decorative stats · any copy
implying real platform data.

═══ THE FAILURE TO DESIGN AGAINST ═══

This is the actual brief. Everything above is context; this is the work.

A visitor arrives with no files. They can reach a real verdict in very few
steps — only the feed is required, and the record side defaults to a bundled
catalog. But:

  · The zone's loudest control is "Choose a file" (15px, weight 560, accent,
    underlined). The one they can actually use, "Use the bundled feed", is
    11.5px mono uppercase in grey. The hierarchy is inverted against the only
    door a first-time visitor can open.
  · The Run button is DISABLED at first paint AND below the fold at 1280×900,
    together with the sentence explaining why it is waiting.
  · So the single action available to a new visitor produces feedback they
    cannot see. Two independent audits reached this hours apart.

And the navigation is a menu of five peers — Audit · Report · Fee rules ·
How it works · Proof — when it is actually a sequence. Nothing signals that
Report is the OUTPUT of Audit, Fee rules is the LAW it applies, Proof is the
evidence the engine is scored against.

Design to this spine. Every surface belongs to exactly one beat:

  1 SHOW ME   "What is this?"          — one control, on screen, with a visible
                                          consequence; it demonstrates on the
                                          bundled pair before demanding anything
  2 READ IT   "What did it find?"      — the verdict is the destination, with
                                          provenance INSIDE it, not a route away
  3 TRUST IT  "Why believe it?"        — the rule a finding cites, and the engine's
                                          scoring, reached FROM that finding
  4 DO IT     "With my data?"          — upload is the SECOND offer, after the
                                          instrument has earned the commitment

Principle: DEMONSTRATE BEFORE YOU DEMAND.

═══ WHAT I WANT FROM YOU ═══

The 2026 premium tech register, applied to a system that is already good — depth
and precision, not decoration. Where I expect it to show:

  · FIRST SCREEN. The instrument should read as an instrument at first paint —
    considered, dense with intent, obviously alive. It currently reads as two
    empty dashed boxes.
  · STATE AS THE MATERIAL. This product's premium quality is that it SHOWS ITS
    WORK. Design the states: empty, armed, running, verdict, failed. The running
    moment especially — the audit computes locally, and that instant is the
    product proving its central claim.
  · THE VERDICT. FAIL with 16 findings and the arithmetic attached should be the
    most designed object on the site. It is what the visitor came for.
  · THE NAVIGATION AS A SEQUENCE. Separate the verb from the reference shelf.
    Show position and order without numerals (they were removed by owner word —
    reintroducing them reintroduces exactly the read that decision removed).
  · SURFACE DEPTH within the fixed palette. One accent and a six-step ink ramp is
    a constraint, not a limitation. Hairline hierarchy, ground steps, considered
    elevation, optical alignment, the quality that reads as expensive when there
    is no color to spend.

═══ HOW I WILL JUDGE IT ═══

This project defends design decisions with regression tests — for example, the
drop zones are pinned to sit entirely above a 900px fold at 1280px width, by CI.

So for each move, tell me:
  (a) which of the four beats it serves
  (b) what it costs the visitor in actions
  (c) how it could be VERIFIED — ideally as a browser assertion

A move that cannot be stated as a check is a move I cannot defend later.

═══ DELIVER ═══

Screens at 1280×900 (desktop only — do not spend effort on mobile):
  1. The landing first screen, empty state — what a new visitor sees
  2. The same screen, armed — the bundled pair loaded, the control live
  3. The verdict — FAIL, findings with receipts, provenance visible
  4. The navigation, showing the sequence and current position
  5. Optional: the running/computing moment, if you can make it earn its place

Use the real type, the real palette, the real spacing. Real copy where it exists —
the H1 is "Dinner can be ordered while you sleep. / What the agent read needs
proof." Mark any copy you invent as DRAFT.

Show me at least two directions for the first screen: one conservative extension
of what ships, one that pushes the premium register as far as the fixed system
allows. I want to see the boundary.

DO NOT: change the typeface, add a second accent, introduce dark mode, add
gradient buttons or glassmorphism, use mono for headings, add numerals to
navigation, redesign the engine's output format, or add any copy implying this
touches a real platform or a real merchant.
```

---

## After Claude Design returns

1. **Nothing lands without owner word.** Design output is a proposal; `RULES.md` §4 and the
   FIXED table above bind it. Check returns against both before implementing.
2. **Two known traps for whoever implements it.** Weight numbers are calibrated to Onest and do
   not survive a face change. `ch` measure caps re-measure the whole site silently when type
   changes — 58 of them.
3. **The site cannot currently be rendered from the working seat for comparison.** Chromium
   launches under `--single-process` (found 2026-07-31), but ports refuse to bind (`EPERM`), and
   `out/` is a stale pre-Onest build. A rendered before/after needs the owner's shell.
