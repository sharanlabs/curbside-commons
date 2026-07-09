# Whole-site redesign — build spec ("Gallery" system)

Owner goal (2026-07-08): ultramodern-premium, **gallery-white** redesign of the ENTIRE site
(landing + Console · Report · Demo · Eval · Metrics · Audit · Cost · Merchant), layout + content,
delivered **mockup-first** (non-destructive; verify baseline untouched). Directives below are
grounded in the LIVE 2026 research sweep (dated/cited in `whole-site-copy-deck.md` sibling +
the research digest), **not** model memory — per the owner's "without training knowledge" word.

## Non-negotiable corrections the research forced (anti-slop)
- **No blue→purple/indigo accent, no gradient-clip headlines, no glow/orbs** — the loudest 2026 tell. (Corrects the Aurora/Cockpit/Facet samples' indigo/blue/violet.)
- **No numbered `01/02/03` section markers** — flagged tell (and the repo's own prior "dated-list to avoid"). Sequence via hairline flow + labels, not big numerals.
- No `rounded-2xl shadow-lg` on everything; no glassmorphism; no nested "cardocalypse"; no colored left-border callout strips; no icon-in-rounded-square tiles; no worn Lucide (Sparkles/Zap/ArrowRight); no emoji bullets; no cream/beige palette; not Inter-as-the-whole-system.

## Tokens — three-tier, gallery-white primitive (semantic layer is what components use)
```
/* PRIMITIVES */
--paper:#FFFFFF;         /* gallery-white ground — the single primitive that defines the look */
--panel:#FAFAFA;         /* half-step surface */
--panel-2:#F4F4F5;       /* deeper half-step */
--ink:#161616;           /* near-black text */
--ink-2:#3C3C3C;         /* secondary text */
--muted:#6E6E70;         /* tertiary / metadata */
--hairline:rgba(0,0,0,.09);      /* default border — works on paper AND panel */
--hairline-2:rgba(0,0,0,.14);    /* stronger divider */
--grid:rgba(0,0,0,.028);         /* subliminal 24px blueprint substrate */
--accent:#0A6349;        /* ONE accent — deep viridian (verification/"true"); repo-established */
--accent-soft:rgba(10,99,73,.08);
--error:#B4122F;         /* severity error — always paired with shape + word */
--warn:#8A5A00;          /* severity warn */
--radius:7px;            /* everyday; 12px for hero/modal — ONE family per view */
--shadow-1:0 1px 2px rgba(0,0,0,.04);           /* micro, only when elevation is real */
--shadow-2:0 2px 6px rgba(0,0,0,.05),0 1px 2px rgba(0,0,0,.04);
--sans:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif;
--mono:"SFMono-Regular",ui-monospace,"JetBrains Mono",Menlo,monospace;
```
Contrast floor WCAG AA 4.5:1 on --paper: ink 16.9:1 ✓, ink-2 10.5:1 ✓, muted 4.9:1 ✓, accent 6.6:1 ✓, error 6.4:1 ✓, warn 5.0:1 ✓ (recompute on final).

## Type — mono is the credibility register
- Sans for UI + prose; **mono (tabular) for every eyebrow / ID / timestamp / receipt / number** — this reads as engineering honesty, apt for a truth-audit and the AI-engineer audience.
- "Fewer sizes, more contrast": big editorial hero (clamp ~40–72px) + small body (~15–16px), few middle steps.
- Tight tracking on large headings (−.02 to −.03em); labels = uppercase mono +.08–.14em; sentence-case body.
- Offline/CSP: system fonts only (no CDN). Escape "generic Inter" via SCALE + mono pairing, not a web font.

## Spacing / grid / motion
- 4px base; rhythm 8 (in-group) / 16 (between) / 32–48 (sections); centered ~1120px column.
- **Two densities from one scale:** landing = generous story-mode; data surfaces = compact (comfortable/dense).
- Subliminal 24px blueprint substrate via `--grid` (sensed, not seen).
- Motion: transform+opacity only, 150–260ms, standard ease, no bounce; honor `prefers-reduced-motion`.

## Shell (shared across all surfaces) — single self-contained navigable file
- **Hash router**: `#/`(landing) `#/console` `#/report` `#/demo` `#/eval` `#/metrics` `#/audit` `#/cost` `#/merchant`.
- **Top nav** (gallery-white, hairline-bottom): brand "Commerce Truth Audit" + links (Console/Report/Demo/Eval/Metrics/Audit/Cost) + honesty pill "Prototype · REPLAY · $0.00". Active = ink fill.
- **Persistent honesty**: SIMULATED banner (BYTE-VERBATIM from ReportView) on product surfaces; footer honesty paragraph verbatim sitewide.
- Zero external requests (CSP-clean). `<title>` present. Reduced-motion + 44px hit targets + focus-visible rings.

## Per-surface archetypes (content from `whole-site-copy-deck.md`; numbers only from repo/fixtures)
- **Landing** — editorial scroll-story: oversized hero (thesis), the 4-step pipeline as a **hairline-connected flow with the gate step emphasized** (NOT numbered cards), the "caught" moment (CatchPanel), honest CTA to Report/Demo. One accent moment only.
- **Console** — operator surface: compact run controls + surface toggle (ACP/UCP) + status, hairline-framed.
- **Report** — a **DOCUMENT**: Verdict / Meta / Findings as typographic rails; 16 findings, plain-line-first + 4 receipts (mono), severity by shape+word; tally 11 error / 5 warn / 0 info (from fixture). Printable.
- **Demo** — the replay flow / before→after of a caught claim.
- **Eval / Quality** — golden-task pass view; ONLY repo-grounded counts (writer marks any [VERIFY]); hairline table + mono.
- **Metrics** — deterministic run metrics; mono/tabular; no fabricated series.
- **Audit** — append-only log view: hairline table, mono timestamps/IDs.
- **Cost** — the "$0.00 / deterministic / no LLM in this runtime" story, mono tabular.
- **Merchant** — merchant-detail: record vs served-copy, the SOR that claims are checked against.

## Honesty invariants (hold in every surface)
SIMULATED banner byte-verbatim · footer honesty paragraph verbatim · no fabricated metrics (numbers trace to repo/fixture) · never claim real DoorDash/Square/Uber Eats/Grubhub data/access/impact · "Simulated prototype, run on demand — not a live service" · dual-audience (plain paired with technical).

## Verify (before SHIP)
Banner+footer verbatim (grep -F) · fixture tally 11/5/0 + 16 findings · zero external URLs/CDN/@import · JS `node --check` clean · `<title>` present · all 9 routes reachable · reduced-motion honored · contrast recomputed ≥4.5:1 · verify baseline (product code) untouched. Then `acceptance-gate`.
