# Acceptance gate — M1: the complete listings-truth wedge module

**Gate:** the M1 module-boundary acceptance gate (plan §5: "M1 Codex batch + acceptance-gate (wedge module done)"). **Judge:** independent fresh-context acceptance-gate subagent (read-only; same model family as the maker — family bias mitigated by the verified cross-model gate-2 record, stated in its provenance line). **Artifact:** the wedge module at commits `5a81440 · 08c9299 · 1d0697e · 54124ff · 7962810 · 0eda64c` (HEAD verified by the judge via .git). **Date:** 2026-07-03. **Seat event, on record:** the first gate launch died on the subagent seat limit (raw verbatim: "You've hit your session limit · resets 8:10pm (America/New_York)"); the owner-confirmed retry ran to completion.

▸ *Plain: an independent judge re-checked the whole first module — the code, the tests, the review paperwork, and whether the paperwork matches reality — and accepted it.*

## VERDICT: SHIP — all five ordered gates PASS

1. **Grill — PASS.** Four independent grilling joints, each of which drew real blood that was closed red-green (W1 gate overclaim · W3 unparsed `--json` · builder escalations E-1..E-6 · the M1 Codex batch). The judge's own probes found every weak joint either closed or already recorded as a known limit.
2. **Codex cross-model — PASS (record verified against code, not re-run).** All 8 findings (7 batch + 1 confirming-pass residual) map to real fixes located at file:line; the raw verdict is consistent with the curated record; the review was genuinely adversarial (BLOCKed twice). **W1's conditional SHIP condition is MET — the W1 gate record's conditional stamp is SUPERSEDED by this record.**
3. **Verify-correctness — PASS** (evidence review, labeled as such): the full test-count chain 411 → 478 → 506 → 514 → 515 reconciled with NO gaps against the suites on disk, per-file; every M1 fix has an executed RED with suite-consistent counts; the headline (`conformant-but-false.json` conformance-clean AND truth-dirty) is machine-checked; C2 = single guarded constructor (`makeFinding`) + report-level revalidation; the C5 bound judged HONESTLY LABELED at all three layers.
4. **Enterprise + elegance — PASS.** Clean boundaries (core/pack/CLI/view); every ambiguous CLI input fails loudly; determinism engineered. **Two NON-BLOCKING advisories → folded into the next slice (D1) work list:** (i) dead third clause in `listings-differential-c3.test.ts` `covers()` (strictly implied by the clause above it); (ii) `cli-c1`'s import-walk resolver doesn't resolve `@/` aliases — currently safe (verified zero such imports on the walked paths; ban patterns fire on raw specifiers), adopt `report-view-c1`'s resolver to close the future hole.
5. **Anti-slop — PASS** with the carried advisory: em-dash density in user-facing copy = a named owner note at the Pub slice (nothing is public yet; Pub is owner-gated).

## Open items carried (owner-escalated, verified honestly labeled, NOT gate failures)
C5 cargo-oracle agreement UNMEASURED locally (OWNER CALL — decide before/at D1) · corpus license pending (O6; machine-guarded against silent addition) · ACP price wire format UNVERIFIED-in-repo · `sameMutationAs` guard limit (recorded) · deploy/design deferred · em-dash style at Pub.

**Route-back: none. The listings-truth wedge module is ACCEPTED at `0eda64c`. M1 is DISCHARGED (both legs: cross-model + acceptance-gate).**
