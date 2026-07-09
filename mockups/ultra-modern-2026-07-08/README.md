# Ultra-modern UI samples — 2026-07-08

Three fresh **ultra-modern** redesign samples for the `/report` verifier surface, on the
owner's word ("just redesign Ultra modern UI give samples"). A different genre pass from
the six already on record (Ledger · Console · Broadsheet · Control Room · Dossier · Instrument):
these lean **contemporary product/interface** rather than document/editorial-terminal.

All three render the SAME real committed golden fixture
(`fixtures/synthetic-restaurant/expected-report.acp.json` — **FAIL · 16 findings · 11 error / 5 warn / 0 info**),
with the SIMULATED banner sentence and the footer honesty paragraph **byte-verbatim** from
`components/report/ReportView.tsx`. No fabricated metrics, no external requests (CSP-clean),
system fonts only. Each is a **complete standalone HTML file** — open directly in a browser.

**Ground:** all three stay on a light / premium-white ground, honoring the owner's recorded
**standing light-ground preference** ("no dark background"; "gallery white or apple 2026
premium white"). Divergence comes from *structure and interaction*, not from flipping to dark.

| # | File | Direction | One line |
|---|------|-----------|----------|
| A | `sample-a-aurora.html` | **Aurora** | Editorial-premium, single column — oversized display type, whitespace-forward, hairline rhythm, ONE electric-indigo accent (`#3538CD`). Apple-2026 register. Static + printable. |
| B | `sample-b-cockpit.html` | **Cockpit** | Product-app dashboard — sticky command bar + surface segmented control + verdict KPI tiles + severity distribution bar; findings as an elegant data grid, each row's four receipts in an expand/collapse drawer (all open by default). Cool-blue accent (`#2563EB`). Linear/Vercel register. |
| C | `sample-c-facet.html` | **Facet** | The divergent take — live **severity + class filtering** (chips built from the real data, no invented categories), findings as a responsive modular card grid, animated verdict meter, kinetic staggered entrance. Violet accent (`#6D28D9`). |

Each finding shows the plain-words line first, then the four receipts
(claim `source · field = value` / reference row / rule-spec-clause / class) + severity —
the same evidence contract as the shipped Ledger surface.

## Verification (run inline 2026-07-08)

- **Banner + footer:** byte-verbatim match vs `components/report/ReportView.tsx` (all 3, `grep -F`).
- **Data:** JSON parses; exactly 16 findings each; tally recomputed 11 error / 5 warn / 0 info; zero missing fields.
- **CSP:** zero external URLs / CDN / `@import` / remote `src` (all 3).
- **JS:** render scripts pass `node --check` (syntax valid, all 3).
- `<title>` present on all 3.
- Not machine-verified here: pixel rendering / interaction in a live browser (no dev server for `file://` statics — open locally to exercise the toggles/filters).

## Status

**Samples for owner selection — not a decision, no product code touched.** The implemented
`/report` + `/demo` surfaces remain the owner-picked **Ledger** (gallery-white). These files are
internal mockups like the siblings in `mockups/`. On an owner word ("go with Aurora/Cockpit/Facet",
hybrids allowed), the implementation slice would restyle the real surfaces under the full per-slice
gate — which then feeds the standing design→deploy owner item.

---

## WHOLE-SITE redesign — `whole-site-gallery.html` (2026-07-08, owner-directed)

On the owner's `/claude-os` directive ("using all frontend skills, subagents, without training
knowledge/memory — ultramodern Premium UI, gallery white, redesign whole website all layout +
content"), a **single navigable mockup of the ENTIRE site** — all 9 surfaces + landing + shared
system — delivered **mockup-first** (owner-approved via AskUserQuestion; zero product code touched).

**Pipeline (subagents + skills):** `research-specialist` LIVE 2026 design sweep (dated/cited,
digest in this dir) ‖ `writing-specialist` repo-grounded copy deck (`whole-site-copy-deck.md`,
every line file:line-cited, honesty self-audited) → main-thread build to the **"Gallery" system**
(`whole-site-build-spec.md`) after both writer failures were completed inline (documented fallback).

**The "Gallery" system** (research-corrected — the earlier A/B/C samples' indigo/blue/violet + `01/02/03`
markers were the 2026 slop tells; fixed here): monochrome-on-white, ONE **deep-viridian** accent
`#0A6349`, **mono = credibility register**, hairlines over shadows, two densities (generous landing ↔
compact data), subliminal 24px blueprint grid, Report as a *document* not a card grid.

**Covers (hash-router, one file):** `#/` Landing (9-beat activation story + CatchPanel) · `#/console`
· `#/report` (all 16 real fixture findings, 11/5/0) · `#/demo` · `#/eval` · `#/metrics` · `#/audit` ·
`#/cost` · `#/merchant` (8-section why-chain). Nav + global footer shared.

**Honesty:** SIMULATED banner + report/demo/global footers **byte-verbatim** (grep -F ✓); dashboard
figures are an **illustrative sample set** (labeled `DESIGN MOCKUP · illustrative sample data`; matches
the surfaces' own "simulated/illustrative" framing) — no fabricated *real* outcomes; the only hard metric
is the fixture tally 16·11/5/0.

**Verified:** 9/9 views render headless (no throw); banner+3 footers verbatim; JS `node --check` clean;
zero external requests; no emoji / shadow-lg / rounded-2xl / glassmorphism / blue-purple accent / numbered
markers; `<title>` present. **Not run:** live-browser pixel/layout pass (open the file to exercise).

**Open owner decision (writer-flagged, not silently resolved):** the site shows **three names** — wordmark
"Commerce Truth Audit", page-title "ActivationOps", console platform "Curbside Commons". The mockup keeps
all three; unify-or-keep is an owner call (`RULES.md` §2). Also `[VERIFY]`: `TOTAL_STEPS=5`; proposed
empty/404/hover microcopy (copy for states that don't yet render). **Next act:** owner review → gated
product-code implementation (rewrite `globals.css` + pages/components + content under the full per-slice gate).

---

## WHOLE-SITE v2 — `whole-site-gallery-v2.html` (Oxblood system, owner-directed 2026-07-08)

Owner revision of the whole-site mockup: "remove the grid · keep gallery white · ultramodern **dark
red / maroon / burgundy** shades · UI + MOTION + ICONS + FONTS · content samples of the overall
STORY-ARC NARRATIVE · language simple in depth & breadth, domain-expert quality · no training
knowledge/memory · fullest capabilities." Mockup-first (zero product code touched).

**Pipeline (subagents, live, not memory):** `research-specialist` LIVE 2026 sweep #2 —
burgundy-on-white + icons + fonts + motion (dated/cited; validated the direction, gave exact tokens) ‖
`writing-specialist` — the **story-arc narrative** (`whole-site-story-arc.md`: one 7-movement spine +
arc-anchored per-surface samples, honesty self-audited) → main-thread build (frontend design skills
applied inline).

**The "Oxblood" system (research-tuned):**
- **Ground:** gallery-white as **#FBFBFD** (premium off-white — pure #FFF+#000 is an AI-median tell) on a
  **warm near-black ink #1A1712**. **Grid removed.**
- **Accent:** ONE burgundy — **#8A2233** (~7:1 on paper), wine hover #6E1423.
- **Severity kept perceptually far from brand:** error **#D92D20** (hotter/oranger), warn amber **#B54708**,
  pass **#067647** (deep green) — so burgundy reads *brand*, never *alarm*; every state = icon-shape + word + color.
- **Fonts:** serif-display (`ui-serif`/New York/Georgia) + system-sans + mono register — no CDN, offline-safe.
- **Icons:** 16 **custom monoline** inline SVGs (Lucide-geometry: round caps/joins), one accent — no library, no emoji, no worn Sparkles/Zap.
- **Motion:** scroll-reveal (IntersectionObserver), hover lifts, ≤500ms ease-out `cubic-bezier(.16,1,.3,1)`, animated bars — all `prefers-reduced-motion`-gated.

**Content:** the story-arc spine (`whole-site-story-arc.md`) applied — sharpened eyebrows, plain-line-leads-
technical-line-follows, simple-but-deep (concrete nouns: record/field/go-live date, not "insights/growth").

**Verified (headless):** 9/9 views render; SIMULATED banner + report/global footers **byte-verbatim**; all
16 real findings (11/5/0); JS `node --check` clean; **grid removed (0 gradients)**; zero external requests;
no emoji / shadow-lg / rounded-2xl / glass / numbered markers; serif + burgundy + severity-triad confirmed;
`<title>` present. **Not run:** live-browser pixel pass — open the file to see motion/icons/type.

**Open owner items (unchanged, not silently resolved):** three-name identity (Commerce Truth Audit /
ActivationOps / Curbside Commons); ground choice #FBFBFD (this v2, research pick) vs the committed
`--paper #FFFFFF` premium-white (decision-log 2026-07-08) — flag for reconciliation before implementation;
`[VERIFY]` TOTAL_STEPS=5. **Next act:** owner review → gated product-code implementation.

## Value complex-claim note

For the two object-valued claims (`invariants`, `variant_dict`), the receipt `value` is shown in a
compact readable form (e.g. `price 27.50 · sale 28.50`); the authoritative raw shape is the fixture JSON.
