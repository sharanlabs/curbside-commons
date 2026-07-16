# Cross-model review — full-site redesign (gpt-5.6-sol@xhigh, 2026-07-14)

Mandatory cross-model adversarial gate for the redesign (Opus built the code; gpt-5.6-sol is the different-family judge). Raw log: `scratchpad/sol-review.log` (13,292 lines). Also on record: an independent `acceptance-gate` (Opus, same-family — advisory, flagged the JS-bundle jargon + required this cross-model + raw verify) and an anti-AI-slop authenticity review (Opus — PASS, "reads as something a senior team shipped").

## Verdict: BLOCK → reconciled (Claude primary-model-final). All 15 findings ACCEPTED; fixes dispatched.

**sol confirmed clear:** no built page contains a current `BANNED_CLAIMS` match; the regex array was not weakened; removed tests enforced retired disclaimers (not affirmative-false-claim rejection); the 100× arithmetic, 16/11/5 tally, 78 schemas, 17-rule split are numerically correct; roving tab behavior, canvas teardown, reduced motion, and the copy aperture hold; the hero metaphor is product-specific, not generic SaaS.

### P1 (honesty / correctness) — all accepted
1. **ReportView** — "system-of-record" + "being served to customers / vs the real… / still served" implies a live operational feed. → non-operational example language.
2. **lib/product.ts + legacy/console** — copy says merchant names come from a public directory; provenance says they are INVENTED (endpoint not used). → "personas are invented; a separate tested adapter can ingest public directory fields."
3. **eval/page.tsx + evidence.ts:325** — "sent to a human / routed to human" asserts an unimplemented handoff (matcher only returns ABSTAIN). → "returned ABSTAIN — human review required."
4. **metrics/page.tsx** — "each number is recomputed / computed at build time" false for the pinned 78-schema figure. → "computed from imports, or pinned and checked against source."
5. **app/page.tsx:100-102** — "the catalog entry passes its structure check" not grounded in the ACP specimen (the conformance foil is a different UCP doc). → soften to the general thesis / ground it.
6. **specimen.ts:101** — "finding 01 of 16" but the price finding is #11 in the report. → derive `findings.indexOf(price)+1`.
7. **honesty-c10.test.ts (CRITICAL)** — C10's fixed `scannedFiles` allowlist EXCLUDES the new landing components, `lib/landing/specimen.ts`, `/cost`, `/eval`, `/metrics`, `/legacy/**` → a planted "connected to DoorDash" in a new component leaves C10 green. → add a normalized visible-text `BANNED_CLAIMS` scan of every built `out/**/*.html` (retain source scans for non-web artifacts), red-green.

### P2 — all accepted
8. C10 raw-source match misses JSX/line-split claims; mutation probes combine violations under `some()` → normalize rendered text + one isolated planted case per pattern.
9. canonical.spec Coverage tabs tested only by click → assert Arrow/Home/End, roving focus, aria-selected/controls, panel visibility.
10. **specimen.ts:39-43 (integrity)** — the "merchant record" is reconstructed from the claim (`recordCents = raw`), not read independently from `sor.catalog.json` → resolve `referenceRowId` against the SOR and compute from BOTH sources.
11. CorrespondenceHero — "18-second complete loop" is really ~126s desktop / 90s tablet → correct the spec/comment or drive passages from `clock % LOOP`.
12. CorrespondenceHero — paused state announces "Play motion, pressed" (aria-pressed contradiction) → consistent playback semantics.
13. EvidenceBench — pre-analysis rule/arithmetic hidden only by opacity → screen readers get the answer early → stage-bound `aria-hidden`/`hidden`.
14. CoverageTabs / MethodRelation — no-JS leaves panels/details behind inert controls → static `<noscript>` or expose-until-hydration.
15. legacy/merchant + console — built output leaks `deterministic-judge` / "deep-AI showcase" + "AI-outreach wave" buzzwords on all 20 merchant pages → map IDs to "rules-based preview" + concrete-behavior copy.

**Also folded into the fix pass (from the other reviews):** anti-slop — restore the plainer approved hero lede (the built page drifted denser than `docs/redesign-copy-2026-07-14.md`); acceptance-gate — strip dev-jargon ("synthetic corpus"/"simulated") from the CLIENT-bundled catalog so it's not in the shipped JS (the canonical test fixture stays intact; confirmed it never RENDERS, but it should not ship in the bundle).
