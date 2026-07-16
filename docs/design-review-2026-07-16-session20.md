# Design review — session 20 opening sweep (2026-07-16)

**Trigger:** the owner's session-20 directive (decision-log 2026-07-16, three rows): reopen build with a
design-enhancement slice — landing first, then the comparison component (the "01 / THE FIRST CLAIM"
proof section, `EvidenceBench`), then the same review→enhance bar site-wide; intuitive + interactive
with current component patterns; executed locally by Fable (scoped override of the DesignSync route);
grounded in live research, not model memory; narrated to the owner simple-details → big-picture.

**Method:** rendered review against the dev server at 1440 (Playwright-as-library, the recorded
session-19 route), full-page captures of all 8 primary surfaces + component-state captures of the
bench (settled / mid-replay / re-settled), an interaction inventory per surface, and code reading of
`EvidenceBench.tsx` / `Reveal.tsx` / the relevant `globals.css` blocks. A quarantined live research
sweep (research-specialist, Law 11) on current comparison-UI / component-ecosystem / landing-bar
patterns was dispatched this session; its digest lands beside this record.

## Measured findings

### D-1 (defect, print path): `Reveal` blocks print blank under JS+motion
- `Reveal.tsx` SSR-renders settled and strips the `in` class on mount when motion is allowed;
  reveal happens on intersection (threshold 0.12). No-JS and reduced-motion are safe by design.
- `globals.css:1050-1059` rescues reduced-motion with `opacity: 1 !important` — **the `@media print`
  block contains no equivalent rescue**. Printing the landing (JS on, motion allowed) renders every
  not-yet-intersected `.ds-reveal`/`.ds-stagger` block at `opacity: 0` → blank chapters on paper.
- Evidence: the stitched full-page capture shows the entire landing below the hero as white space —
  the same mechanism a print pass hits. Same defect class as the session-19 /fees ribbon (visual
  inspection passed it; a measured pass caught it).
- Fix shape: print-media opacity/transform rescue mirroring the reduced-motion block + a red-green
  tooth (print-emulated assertion that every chapter's text is visible without scroll).

### D-2 (interactivity floor): most surfaces are read-only pages
Interaction inventory at 1440 (buttons / links / details / inputs / tabs):
landing 15/29/0/0/3 · fees 7/20/0/1/0 · report 3/20/0/0/0 · demo 1/20/0/0/0 ·
playground 3/21/1 input · eval 1/21/0/0/0 · metrics 1/23/0/0/0 · cost 1/21/0/0/0.
Outside the landing, /fees and /playground, every surface's only button is chrome (nav/motion).
The owner's "intuitive, interactive" bar has real headroom on the data surfaces.

### D-3 (the comparison component): sound skeleton, one-note interactivity
`EvidenceBench` observations from the settled/mid-replay captures + source:
1. **Opens complete** (owner-picked contract, kept) — the settled state reads as a finished
   examination: claim column, rule/arithmetic axis, record column, locked receipt. Good bones.
2. **One affordance only.** The single interaction is "Replay the check" (a 2.8s relight). The
   evidence itself is not explorable: no hover/focus provenance on the figures, no step-through of
   the six stages, no way to see any finding other than #11 despite the header advertising
   "16 findings · 11 error · 5 warn" and the footer "finding 11 of 16".
3. **The first-glance read requires study.** The two big figures ($2,150.00 vs 2150) only make
   sense via their small sub-labels (2150.00 USD / $21.50); the ×100 story lives in the center
   axis in small mono. The "aha" — same digits, wrong unit — is present but not staged for a
   stranger's first three seconds.
4. **Replay's drama is muted.** Mid-replay the surface dims only slightly; lit-vs-unlit contrast
   is low, so the re-examination reads as a subtle fade rather than a check being performed.
5. **Receipt duplicates the axis** (claim/record/rule/comparison rows restate the table above).
   Defensible as a "receipt" metaphor; worth revisiting once the component gains real exploration.

### D-4 hygiene note
The tally chips ("16 findings · 11 error · 5 warn") and "finding 11 of 16" imply navigable depth
that doesn't exist on this surface — either make them navigate (browse findings) or stop implying.

## Enhancement direction (to be finalized against the live research digest)
Order fixed by the owner: **landing → EvidenceBench → site-wide.** Candidate moves, all gated on
the research digest + owner walkthrough: staged first-glance hierarchy for the 100× catch; a
step-through affordance (inspect each of the six stages at the reader's pace, not only a timed
replay); finding browsing (the other 15 findings behind the tally); provenance-on-focus for every
figure; the same intuitive/interactive bar applied per data surface. Every adopted pattern needs a
cited, dated source (owner word: no memory/training knowledge) and must clear the standing
constraints: static export, zero external requests, desktop-only 1280/1440/1728, WCAG 2.2 AA,
reduced-motion + no-JS floors, honesty invariants byte-held.

## Process adoptions landing with this slice (decision-log 2026-07-16)
1. **Layout-sanity sweep → permanent e2e:** ribbon metrics + horizontal overflow per surface at the
   three desktop widths; D-1 adds a print-visibility assertion to the same family.
2. **Inline-gate-with-mitigations = recorded norm** on acceptance-gate seat death (raw + NO-WAIT +
   named overlap; independent Codex batch + independent scout as the compensators).

**Captures:** session scratchpad `captures/` (8 full-page + 3 bench states); promoted into
`docs/reviews/captures-2026-07-16-session20/` when the slice's Codex batch runs.
