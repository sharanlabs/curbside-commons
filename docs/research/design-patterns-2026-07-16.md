# Live research digest — comparison/evidence UI + 2026 component ecosystem (2026-07-16)

**Provenance:** quarantined research-specialist sweep (Law 11 — findings are leads to verify, never
auto-applied), dispatched session 20 under the owner's "don't use memory and training knowledge"
word. Every claim below carries a live source + date; UNVERIFIED items are labeled. Companion:
`docs/design-review-2026-07-16-session20.md` (the measured review this digest informs).

## Q1 — Interactive comparison/evidence components
- **State the difference; never make the user compute it.** NN/g explicit-differences
  (nngroup.com/articles/explicit-differences, pub. 2024-08-23, fetched 2026-07-16) — the most
  load-bearing finding: the "2150 vs 21.50 = ×100" delta must be a rendered first-class element.
- **Comparison canon:** consistent attribute alignment beats decoration; users scan row-by-row
  ("lawn-mower") — nngroup.com/articles/comparison-tables (2024-02-09) + /lawn-mower-pattern.
  Put the verdict/delta at the scan terminus.
- **Diff-view genre is the mature form for value-vs-value proof:** split view for same-position
  comparison, unified for narrative; current best practice = a user toggle. Reference:
  GitHub "Files changed" rework — github.blog/changelog 2025-06-26 / 2025-07-31 / 2025-09-25.
- **Fintech reconciliation convergence:** finding → evidence → provenance one click apart; audit
  trail visible by default, immutable — osfin.ai, Formance, Oracle OFS docs (2026, ≥3 vendors).
- **Step-through storytelling:** The Pudding sticky-stage pattern (pinned evidence panel, narrative
  advances it) — pudding.cool/process/how-to-make-dope-shit-part-3 + scrollytell.ing analyses.
- **Provenance-on-demand is a codified pattern ("Citations"):** hover/click a claim marker → popover
  with the exact source excerpt — shapeof.ai/patterns/citations (current 2026-07-16); littlefoot.js
  lineage (MIT).

## Q2 — Component ecosystem (as of mid-2026)
- **shadcn/ui defaults to Base UI for new projects (July 2026); Radix still fully supported** —
  ui.shadcn.com/docs/changelog/2026-07-base-ui-default (official, fetched 2026-07-16). Registry:
  CLI v4 + compose/validate (2026); any GitHub repo as a registry (June 2026).
- **Base UI 1.0** shipped 2025-12-11 (MUI-backed, ~35 unstyled components; ~1.6.0, 6M+ weekly
  downloads by July 2026) — InfoQ 2026-02, base-ui.com, HN thread (positive a11y sentiment).
- **Motion v12** (ex-framer-motion, independent, React-19 compatible) — motion.dev; spot-check
  motiondivision/motion releases before pinning (flagged, not fully date-confirmed).
- **Next.js 16.x current** (React 19.2: View Transitions, React Compiler 1.0); `output:"export"`
  still supported — nextjs.org/blog/next-16 + upgrade guide.
- **Platform primitives (bear on our zero-external constraint):**
  same-document View Transitions = Baseline since Oct 2025 (MDN/caniuse) · CSS scroll-driven
  animations = NOT Baseline (Firefox flag-gated as of June 2026; enhancement-only, author the
  finished state as default — web-features explorer, MDN, Comeau) · Popover API = Baseline since
  2025-01-27 (web.dev) · Invoker Commands (`command`/`commandfor`) = Baseline Jan 2026 (InfoQ).
- **NumberFlow** (MIT, dependency-free animated numbers, Intl.NumberFormat + WAAPI, built-in
  reduced-motion + ARIA; v0.5.9 Apr 2025; used by X and Dub) — number-flow.barvian.me, 6.3k stars.

## Q3 — Landing quality bar 2026
- Award tier = cinematic chaptered storytelling with a persistent interactive object (Awwwards SOTY
  2025: Lando Norris/OFF+BRAND, Messenger/abeto — awwwards.com, fetched 2026-07-16).
- Dev-tool/fintech tier: interactive proof moment above the fold (Vercel live globe; Linear
  in-browser demo; Stripe scroll-reactive brand) — line25 2026 + DEV practitioner writeups
  (practitioner-candidate: consistent across ≥2 sources, engagement unverified).
- **2026 AI-slop tells (avoid on the proof component especially):** Inter-by-default, purple-blue
  gradients, glassmorphism, uniform rounded cards, unmodified shadcn defaults, hero+3-cards —
  Developers Digest 16-patterns (2026), 925studios (2026), impeccable.style/slop, HN threads
  (June 2026, Jan 2026). "Slop converts 91% worse" (Sailop) = UNVERIFIED single-source; do not cite.

## Q4 — Intuitiveness / a11y heuristics (live-sourced)
- Progressive disclosure + accordions for dense evidence; primary finding always visible — NN/g
  (progressive-disclosure, accordions-on-desktop; live 2026-07-16).
- **WCAG 2.2 criteria that bite here:** 2.4.11 Focus Not Obscured (sticky stages) · 2.5.7 Dragging
  Movements (prefer discrete steps over scrubbing) · 2.5.8 Target Size ≥24px · 3.2.6 Consistent
  Help — w3.org/WAI/standards-guidelines/wcag/new-in-22 (fetched 2026-07-16).
- Reduced motion: replace movement with fades/instant state swaps — web.dev/articles/
  prefers-reduced-motion, MDN (current 2026-07-16).

## Top adoptable candidates (ranked; BORROW/ADAPT/REJECT per the review doc)
1. Explicit rendered ×100 delta at the scan terminus (NN/g) — zero risk.
2. Discrete step-through replay, sticky-stage (Pudding + WCAG 2.5.7) — test 2.4.11.
3. "Finding / full worksheet" split-unified toggle (GitHub diff genre) — no-JS default = split.
4. Provenance popover per value (Shape of AI Citations + native Popover API) — must open on
   click/focus, not hover-only.
5. NumberFlow for the mismatch counter — **dependency; needs the vetting gate + owner sign-off**.
6. Same-document View Transitions for state changes — enhancement-only, degrades to instant swap.
7. Reconciliation exception framing (finding = exception, receipts = audit trail) — copy/IA borrow.
8. `<details>`-first receipt disclosure (native, satisfies the no-JS mandate) — NN/g + MDN.
9. Scroll-driven CSS chapter transitions — enhancement-only (NOT Baseline).
10. Anti-slop differentiation pass on EvidenceBench itself — cheapest credibility win.

**Researcher's synthesis:** build EvidenceBench as a *diff-genre* component, not table-genre; skip
the cinematic/WebGL award tier (constraint + honesty mismatch) and compete on the "real, replayable
proof moment" axis — the thing 2026 slop pages cannot fake.

**Gaps/UNVERIFIED:** SAP Fiori comparison pattern (403-walled) · the 91% stat · Motion v12 date ·
no X/Reddit layer this run (HN carried community signal) · 2 flagged videos untranscribed.
**Horizon:** ProvenanceWidgets (CHI 2026) · Invoker Commands for a JS-optional stepper · shadcn
repo-as-registry for publishing the bench later · source-registry lacks a comparison-UI cluster.
