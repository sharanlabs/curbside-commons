# Design direction — end-to-end redesign, 2026-07-31

**License:** owner — *"redesign the layout, navigation, whole new experience from end to end"* +
*"premium, modern, futuristic 2026 in all aspects"*. **Fixed by owner word:** Nunito + JetBrains
Mono, the original palette and gradients ("dont change the color go with original"), the honesty
copy invariants, the engine and everything under `lib/` and `evals/`, desktop-only.
**Fixed by untouchable e2e contract** (`evals/e2e/canonical.spec.ts`): the five landing H2s render
**in exact order** ("Audit a feed." → "A claim is checked…" → "The check runs in the open." →
"Two kinds of claim." → "The same input, the same receipt, every time."); the nav labels
(Example report · Fee rules · How it works · Proof); both drop zones wholly above a 900px fold at
1280 and the Run control within 200px of the zones; exactly one footer with its three links.

**Research base** (fetched, not recalled): Evil Martians' 100-devtool-landing-page study (2025) +
2026 trend confirmations. Load-bearing: centred heroes dominate working devtool sites; for a
narrow-scope utility the winning hero visual is a **live product embed**, and the 2026 headline
pattern is hero + embed reading as **one object**; trust for individual-focused tools = quantified
metrics, not logos; specific verbs on CTAs; oversized type carrying the value prop; fewer nav
links + one unmistakable action. Rejected for register (evidence tool, zero-network): AI
personalization, hidden/radial nav, kinetic lettering, scroll theatrics.

## The spine

One axis per zone, page-wide:

1. **Hero zone = one centred object** (H1 → lede → instrument). The research reverses the audit's
   left-align lean (R-1/D-1): the defect was three alignment systems in one viewport, not
   centredness — and for a product that IS a live embed, the centred hero-embed is the winning
   composition. The earlier left-spine commit remains as substrate (the lead lives on `.ds-wrap`,
   the centred *wrapper* stays retired); the axis flips to centre at the section level.
2. **Content sections keep the existing left grammar** (eyebrow + rule + H2), consistent among
   themselves. Centred hero zone over left content sections is the standard resolution on the
   winning pages; the one-axis rule applies within a viewport, not across the whole scroll.
3. **The scene band stays a centred figure** — owner-fixed v9 substrate, symmetric artwork.

## The moves

- **S1 · Hero zone.** H1 rises to the site's own `p2-h1` display scale, clamp(36px, 3.8vw, 54px)
  (oversized-type pattern, using an *existing* scale — no new vocabulary). "Audit a feed." is
  demoted from competing display H2 to the **instrument's nameplate** in the existing mono label
  register (uppercase via CSS — `textContent` unchanged, so the H2-order pin holds). The 78ch
  tool-foot wall (D-6) reduces to its two load-bearing ideas, keeping the promise sentence
  verbatim: *"Nothing you load leaves this page."* The run row becomes a centred column with the
  note ABOVE the button (R-5/D-4): instruction before control, state explained before it is met.
- **S2 · Scene band (R-4/D-3).** Status line + pause control move onto the content rail via
  `max(56px, …)` — they can only move inward, so the clipped label cannot recur at any width; the
  landing band's min-height drops 340→300 (hero-scale rhythm it no longer needs). The section
  eyebrow "HOW THE CHECK WORKS" renames to "WHAT HAPPENS TO A CLAIM" — it collided word-for-word
  with the nav's "How it works", which points at /playground (N-2's information-scent inversion;
  the nav label itself is e2e-pinned, so the landing side yields).
- **S3 · Close (research: final CTA).** Trust must stay last (H2 pin), so it becomes the closing
  beat: after the three engine-derived facts, one CTA row in the existing button vocabulary —
  primary `Audit a feed` → `#audit`, quiet `What is real, what is invented` → `/docs`.
  Specific verbs, no new copy claims, no new H2.
- **S4 · Nav (N-1..N-3).** N-1 accepted: "Audit" becomes the bar's one emphasized action — a
  compact filled pill in the existing accent (brand use of a fixed color); the other four stay
  quiet links; aria-current still distinguishable. N-2 accepted in the available lever (eyebrow
  rename + action emphasis; label rename blocked by pin). N-3 accepted: the route readout — the
  nav's genuinely live instrument — gets the existing hairline-capsule treatment (cs-pause /
  cs-zones vocabulary), no glow, no theatrics. No links added; /docs and /legacy stay
  footer-only (progressive disclosure, kept).
- **S5 · Interaction hygiene.** I-1: `.fd-cta` gains a pointer hover cue (underline weight —
  typographic, zero color change); I-2: the byte-identical duplicate `@keyframes stamp-neq` is
  folded; I-3: the section rule's `width` transition is removed in favour of the `scaleX`
  animation that already exists for the same element (the sheet's only layout-property
  transition).

## Dies / deferred / refused

- **Dead:** the centred `.cs-copy` hero wrapper (already retired), the tool-foot wall, the
  `width`-transition motion path.
- **Deferred:** R-3 dead-CSS removal (34% of selectors) — wants the session-30 reachability
  proof, not a grep; R-7 color inventory — owner fixed the palette.
- **Refused by owner:** R-6 gradient-text change ("go with original") — the H1 gradient stays.

Already landed as substrate: R-1 (one-spine groundwork, 37323e7) and R-2 (one rhythm logic,
clamp-based section padding, 1934f1f).
