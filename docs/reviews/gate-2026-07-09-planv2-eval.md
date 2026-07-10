# Gate record — plan-v2 evaluation (fresh-context frontier acceptance-gate), 2026-07-09

**Artifact judged:** the de-brand/design/armoury plan v2 (repo copy: `docs/plan-debrand-design-armoury-2026-07-09.md`; original: `~/.claude/plans/1-let-it-be-floofy-naur.md`). **Judge:** independent read-only acceptance-gate subagent on the frontier seat (Fable, explicit override), fresh context, did not author the plan. Same-family caveat noted by the judge itself — which is why the Codex cross-model pass (run in parallel, REVISE — see `codex-2026-07-09-planv2-eval-raw.md`) stays the binding gate-2 leg. Harness advisor() unavailable in the judge's session (surfaced, precedent).

## Verdict

**SHIP (conditional)** — sound to execute as written, conditional on Slice 0 (the Codex plan loop) running first and finding 1 resolved in that loop before Slice B touches `README.md:59`, `docs/WHY.md:11/:15`, or `docs/PUBLICATION.md:15`.

*(Status note at wrap: the Codex seat returned VERDICT: REVISE with 5 P1s the same day, so plan v2 does NOT proceed as-is — reconciliation to v3 is the recorded next step. This SHIP-conditional stands as one seat's input to that reconciliation, not as an execution license.)*

## Findings

1. **P2 — internal contradiction: fork 2 vs the Slice-B edit set on dated factual market claims.** Fork 2 rules "keep factual attribution" but the edit set lists dated, source-backed market facts (`README.md:59`, `docs/WHY.md:11,:15`, `docs/PUBLICATION.md:15`). A spec-adherence executor cannot satisfy both; genericizing a dated fact degrades RULES §6 falsifiability. Fix: a third class — dated market facts: genericize the prose, retain the named citation in the research digests and link it.
2. **P3 — Slice B route tag under-spec.** Public honesty-critical wording should route `@xhigh` (ship-grade-writing row + public stakes modifier + Fable band rendering), with the ⎈ prompt noted; no anti-slop pass is named for the rewritten public prose in B or the C1 copy deck.
3. **P3 — banner-identity invariant unstated.** `lib/packs/listings/demo/copy.ts:48-52` documents DEMO_SIMULATED_BANNER as verbatim-reused from the report page; `components/report/ReportView.tsx:113-118` hard-codes the same sentence (differs only by an `&nbsp;`); no test enforces equality. The plan edits both but never says "keep byte-identical."
4. **P3 — Slice D's cross-model leg vague.** Vendoring third-party skill content with a known Law-11 payload is security-touching → the Codex pass is mandatory there as a dedicated review of the vendored content (or an explicit recorded waiver).
5. **P3 — Slice E deliverable under-specified.** "A short watchable record" has no artifact name/format/location; the verify clause checks the runs, not the record.
6. **P3 — honesty note, acceptable as planned.** Genericized disclaimers are slightly weaker in specificity than named ones; the plan records this as revertible. All machine gates survive the de-brand (BANNED_CLAIMS match only affirmative overclaims; DEMO_CLAIM brand-free + byte-frozen; the e2e literal "Not affiliated with" preserved; SIMULATED labels untouched).

## What the judge verified (evidence pass)

- All 10 of the plan's file:line claims TRUE (page.tsx:355 · layout.tsx:65 · ReportView.tsx:115 · copy.ts:23/:53 · README.md:7/:59 · PLAIN-ENGLISH.md:17/:68 · WHY.md:11/:15 · PUBLICATION.md:15 · product-brief.md:5 · console.spec.ts:17); REFERENCE_PLATFORM_NAME in `legacy/` + the keep-factual comment at `lib/product.ts:5` both covered by the plan's frozen/keep classes; the three parent mockups exist; `mockups/swiss-story-premium.html` free; `docs/SHOWCASE.md` exists.
- Site edit set proven complete for `app/` + `components/` (repo-wide brand grep: exactly the three listed brand lines reach a viewer).
- "No golden regen needed" proven: zero brand names in `fixtures/synthetic-restaurant/`; the banner is imported at render time, never baked into byte-locked transcripts.
- e2e genuinely outside `npm run verify` (package.json:18-19); `console.spec.ts` is the only e2e spec.
- Slice E commands all real; Slice D estate targets real (`~/claude-os/knowledge/source-registry/design.md` + `_schema.md`; `library/_external-skills/` created by the plan).
- Doctrine claims backed by `~/claude-os/docs/MODEL-ROUTING.md` (dated 2026-07-09): route tags mandatory, Codex ship-gate at `max` on `gpt-5.6-terra` (probed), `gpt-5.5@xhigh` fallback, ship-grade writing = FRONTIER (the copy-deck Opus→Fable move is doctrine-correct), coherent build = Opus@xhigh (C2 builder correct), dual-flagship advisory/non-gating.
- Risk/reversibility: redeploy + pushes gated on the delegation word recorded verbatim FIRST + full gate battery + smoke; Pages redeploys rollback-able; vendoring SHA-pinned/VET'd/removable. Nothing irreversible under-gated.
