# Motion/interaction currency sweep — 2026-07-20 (session 30)

Owner directive (2026-07-20, session 29, verbatim in the decision log): the build's
motion/interaction layer must be current-best-practice as of TODAY, grounded live —
no model memory. This is the re-run of the sweep whose first dispatch seat-died in
session 29. Scope: the primitives the pieces-1–3 surfaces actually use.

## Verdicts (dated 2026-07-20)

1. **Same-document View Transitions — ADOPT.** Baseline Newly Available since
   October 2025 (Chrome/Edge 111+, Safari 18+, Firefox 144+). The adopted 02/03
   mockups' `document.startViewTransition` flips (month-tab swaps, bench verdict
   changes) are now safe as a motion-gated enhancement: feature-detect +
   reduced-motion-gate, instant swap as the base path.
   Sources: [web.dev Baseline note](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available) ·
   [caniuse view-transitions](https://caniuse.com/view-transitions) ·
   [MDN ViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition).
   (Cross-document `@view-transition` is still Chromium-only — NOT used.)

2. **CSS scroll-driven animations — ENHANCEMENT-ONLY (unchanged).** ~82.6% global;
   Chrome 115+/Safari 26+ stable, but Firefox 152 stable still flags it (Interop
   2026 priority, Nightly-on). Not Baseline → the IntersectionObserver reveal
   system (Reveal/.ds-reveal, the settled-SSR contract) stays the base; no
   scroll-timeline dependency lands.
   Sources: [caniuse animation-timeline: scroll()](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) ·
   [web-features explorer](https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/) ·
   [MDN guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations).

## Applied in this session's motion-polish pass

- FeesView month tabs + TryLiveBench scenario swaps get `startViewTransition`
  wrapping (feature-detected, reduced-motion-gated; instant swap otherwise).
- Everything else already conforms: IO one-shot reveals with settled SSR, WAAPI-free
  rAF count-ups ending on the exact server string, stamp/tick choreography
  motion-gated, `[hidden]` rescue + interactive-only controls rendered only under
  JS+motion.

Quarantine note: live fetches read as data; no fetched instruction was executed.
