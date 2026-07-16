# Redesign acceptance criteria — owner spec, 2026-07-15

**Status:** BINDING for the redesign lane's phase F (QA gate). Source: the owner's 2026-07-15 message ("Design intelligence and final acceptance criteria" spec, pasted with the design-reference word — decision-log 2026-07-15). This file records the spec as the checkable bar; the covering sol batch + acceptance-gate review against it.

## The final acceptance checklist (verbatim intent, itemized)

Before declaring completion, confirm the redesign:

1. Clearly communicates what the product does.
2. Makes the primary action immediately understandable.
3. Feels specific to the product and audience.
4. Has a coherent visual concept.
5. Uses strong, credible copy.
6. Maintains one clear focal point at a time (calmness budget).
7. Feels premium without depending on excessive effects.
8. Remains usable with animation disabled.
9. Supports keyboard navigation.
10. Includes visible focus states.
11. Works across intended viewport sizes.
12. Handles realistic content lengths (long/short headings, multi-line labels, missing optional content, large/small values, dense information, narrow screens).
13. Covers important loading, empty, error, and success states.
14. Preserves existing working functionality.
15. Does not contain invented business claims.
16. Does not introduce avoidable performance problems.
17. Builds successfully.
18. Contains no known critical runtime errors.
19. Has been reviewed against the original specification.
20. Before/after captures at desktop and mobile sizes accompany the wrap.

## Standing sections of the spec that bind HOW phase F judges

- **Baseline-first:** the redesign must solve identified problems, not just restyle (the phase-A/E audits are the recorded baseline).
- **Guiding principles:** derived for THIS product (see below), used as decision filters.
- **Real content:** judged with actual repo content; no lorem, no artificially uniform cards.
- **Research without imitation:** principles extracted, no composition/brand copied.
- **Asset strategy:** every asset has a role; no stock/generic filler.
- **Product demonstration:** the product shown, not described (the Evidence Bench + hero read).
- **Rhythm variation:** no repeated eyebrow/H2/three-cards template per section.
- **Interaction continuity:** transitions preserve sense of place; none delay task completion.
- **Edge-case completeness:** first-time/returning/empty/partial/loading/slow/error/disabled/long-content/destructive/success/recovery.
- **Browser/device resilience:** claim only what was tested; name the environments actually exercised.
- **Production authenticity:** no fake controls, no hardcoded success theater, no misleading data; unimplementable parts represented honestly and documented.
- **Decision discipline:** radius/spacing/type/motion/focus/eleva­tion/color/width decisions applied consistently; exceptions need a product or narrative purpose.
- **Stop conditions:** stop when the criteria are met — further change is subjective variation.

## Guiding principles derived for Curbside Commons (the internal decision filters)

1. **Proof over polish** — every visual flourish must carry evidentiary meaning (the beat strip IS the ×100; the bracket IS the finding). Decoration that asserts nothing is cut.
2. **One lit correspondence at a time** — the calmness budget expressed for this product: a single active claim↔record relationship holds focus; everything else recedes to graphite.
3. **The instrument is honest about its edges** — limits render in the interface with the same care as capabilities; unresolved stays visibly unresolved.
4. **Stillness is the resting state** — motion runs only to show a reading; it settles, and settled states are complete and useful (nothing opens empty).
5. **Inspectable to the last digit** — any number a reader can see, they can trace (source-bound figures; receipts before conclusions).
