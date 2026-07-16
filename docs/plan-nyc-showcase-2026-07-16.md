# NYC fee-cap showcase — rework plan v1 (2026-07-16, session 17)

**Authorization:** the owner's 2026-07-16 words — "mention to include we can rework it as well to show reworld capabilities" (decision-log row). This plan defines the rework; **nothing builds until the owner approves it** and picks the open options below.

## The gap this closes

The NYC §20-563.3 fee-cap audit is fully built and gated at the engine level — `bin/check.mjs fees`, `runFeeCheck()` (`lib/packs/fees/`), four committed synthetic statement fixtures with an answer key, the primary-source rule table (17 codified rules; 11 statement-checkable, 6 requiring external evidence), freshness-verified 2026-07-15. But it has **no rendered surface**: the listings instrument got `/report`, `/demo`, and `/playground`; the fee instrument appears only as three prose mentions (landing coverage tab, honest-limits card, metrics count). "Real-world capability" is told, not shown — against the acceptance spec's own product-demonstration rule.

## DONE looks like (success criteria — declarative)

1. **A reader can watch a real audit.** A `/fees` surface renders the committed drifted statement's audit end-to-end: verdict head, per-finding receipts (rule id · the exact §20-563.3 clause · the arithmetic · the statement line), in the adopted storyboard design language. Server-rendered from the committed fixture + golden (the `/report` pattern); deterministic; $0; no AI in the runtime — stated on the surface.
2. **The boundary renders with the same care.** The 11-executable / 6-external-evidence split is shown, not footnoted; external-evidence rules appear as honestly-unresolved lanes (the E2/E4 defer language precedent). The as-of date (2026-07-15) and the primary source (certified LL79/2025) are on the surface.
3. **Real-world framing without overclaim.** The chapter says what this demonstrates (a codified, statute-cited rule pack over synthetic statements) and what it does not (no real platform statements were audited; findings are illustrative) — C10 BANNED_CLAIMS green throughout; no invented business claims (spec item 15).
4. **Existing contracts hold.** verify / e2e both modes / legacy / packs floors keep their counts or grow only by the new teeth; the listings surfaces byte-stable except deliberate integration edits.
5. **New teeth exist before ship.** e2e: the /fees surface renders the golden verdict + a named receipt + the boundary lanes; pack: rendered figures bind to the committed answer key (the dashboard-evidence source-binding pattern).

## Slices

- **N1 — the /fees report surface** (the core; everything above). Fixture: `fixtures/synthetic-restaurant/fees/statement.drifted.json` vs its golden/answer key.
- **N2 — OPTIONAL (owner pick): the fee playground leg** — paste a statement JSON, audited in-browser by the real engine (the proven listings-playground pattern: golden-equality byte-for-byte test, fail-closed import walk, honest sample/paste labels). Cost: roughly the playground slice again, scoped smaller.
- **N3 — landing integration** — the NYC coverage tab links into /fees; nav placement per design; the one-line hero mention stays.
- **Design** — routed through **Claude Design in web** per the standing 2026-07-16 directive: a fee-surface brief card (requirements + the working prompt, Fable-authored) pushed to the "Curbside Commons" project; the owner's forthcoming FINALIZED design sample governs — **N-slices build after the alignment slice** so the fee surface is born in the final design language, not restyled twice.
- **Gates** — red-green teeth first · covering sol batch · independent acceptance-gate vs `docs/redesign-acceptance-criteria-2026-07-15.md` (all 20 items apply to the new surface) · pre-gate/release-gate refresh · deploy stays the owner's word.

## Open owner picks (needed before build)

1. Approve this plan (or amend).
2. N2 fee playground: in or out.
3. Sequencing confirmed as: owner's finalized design sample → UI alignment slice → N1(+N2)+N3 in the final language. (Alternative: build /fees first in the current language and let the alignment restyle it — more total work; not recommended.)
