# Grill record — the real-product-voice honesty mechanism (session 30, 2026-07-20)

**Method:** self-directed hardening pass (grill-me's question bar: material · grounded ·
answerable), applied by Fable against the actual code rather than as an interactive
owner interview — the underlying decision (remove prototype/sample-data language from
primary chrome, carry honesty via C10 + the /docs page, RULES.md §4 amended to match)
was already made explicitly by the owner via structured ask this session; grilling it
again as a live interview would re-litigate a settled call. What follows is the
adversarial interrogation the acceptance-gate asked for, answered against evidence.

## Q1 — Does a reader who never visits /docs have any way to learn the data is synthetic?

**No, not from primary chrome alone** — and that is the deliberate design under the
amended rule, not an oversight: RULES.md §4 no longer requires a literal word on every
surface, only (a) that no surface ever asserts something false, and (b) that one
accurate, findable page exists. A reader who never clicks anything learns nothing
either way; a reader who clicks the footer (present on every page) reaches /docs in
one click. **Residual risk, accepted:** a reader who acts on the site's claims (e.g.
treats a finding as evidence for a real dispute) without ever clicking footer or
`/docs` has no in-path warning. This is the owner's explicit, twice-confirmed choice —
recorded, not hidden.

## Q2 — Does BANNED_CLAIMS actually cover every surface?

**No — found and fixed.** Two coverage classes exist: a fixed source-file allowlist
(`scannedFiles` in `evals/packs/honesty-c10.test.ts`) and a dynamic site-wide scan over
every built `out/**/*.html`'s **visible text**. The site-wide scan strips all tags —
including `<meta>` — so `<meta name="description">` / OG description text is NEVER
covered by it; only the source-file allowlist catches metadata claims, by reading the
raw `.tsx` source. Checked the allowlist against every page built tonight:
**`app/proof/page.tsx`, `app/docs/page.tsx`, `components/proof/CalibrationPlate.tsx`,
`components/proof/CountFig.tsx`, `components/playground/TryLiveBench.tsx`, and
`app/legacy/page.tsx` were ALL missing** — six new viewer-facing surfaces shipped
tonight with no honesty-gate coverage at the source level. Fixed in this pass (all six
added to `siteShell`); `honesty-c10.test.ts` 136→148 tests, full pass green.

## Q3 — Any remaining path where a real-sounding claim could slip through?

Checked and closed as of this pass:
- Metadata/OG description text on every route → now covered (Q2 fix).
- Mockup HTML files → covered by a separate `describe("mockup claim scan"...)` block
  (recursive over every committed `mockups/*.html`) — unaffected by this session.
- The `/docs` "what is real" page's own presence + content → now bound by a dedicated
  red-green tooth (`RULES.md §4(b)` describe block, added this pass) rather than manual
  inspection — proven red-then-green (initial `ReferenceError` on a scoping bug, fixed,
  re-ran green).
- Footer→/docs link → same tooth, same proof.

**Not covered by any automated gate (accepted, low-severity):** dynamically-rendered
client strings assembled at runtime from data that isn't in JSX literal text (e.g. a
`TryLiveBench` finding line interpolated from `f.plainLine` at runtime) — the source
scan catches literal text, not values threaded through from fixtures/goldens at
runtime. Those values are independently covered by the goldens' own honesty and by
the site-wide HTML scan (which DOES see rendered body text, just not `<meta>`).

## Verdict

One real, material gap found and closed (six new surfaces missing from the honesty
scan's source allowlist) — not a rubber-stamp pass. The residual "reader never visits
/docs" risk is the owner's explicit, recorded choice, not an unexamined one.
