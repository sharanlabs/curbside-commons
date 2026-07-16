# Covering batch — the v8 design adoption + NYC fee-cap showcase (2026-07-16, session 18)

**Scope:** the entire uncommitted slice group — A1 tokens/nav/brand · A2 CommonsScene · A3 landing (sol narrative arc) · N1 /fees · N2 fee paste leg · N3 integration · contract rewrites · blindspot fixes.
**Reviewer:** ONE gpt-5.6-sol@high via codex-guarded (probe SEAT_OK 12,112 tok; one `Not inside a trusted directory` arg error raw → `--skip-git-repo-check` retry, batch-F precedent). Raw: `codex-2026-07-16-batchV8-raw.md`.
**Also on record:** sol narrative draft raw (`sol-narrative-2026-07-16-raw.md`, owner-routed, Fable-adjudicated) · blindspot-scout report (independent, quarantined) · **acceptance-gate seat DEATH raw verbatim: "You've hit your session limit · resets 1pm (America/New_York)" → NO-WAIT: the five gates run INLINE by the primary seat below (maker≠judge overlap RECORDED; mitigations = this independent sol batch + the independent blindspot-scout).**

## VERDICT: BLOCK (4 P1 · 8 P2 · 2 P3) → reconciled primary-model-final: 10 ACCEPTED-FIXED · 2 ACCEPTED-PARTIAL · 1 REFUTED-WITH-HARDENING · 1 DEFERRED (rule-table lane)

| # | Sev | Finding | Adjudication |
|---|-----|---------|--------------|
| 1 | P1 | Hero status lines "THE AGENT PLACES THE ORDER / ORDER PLACED" claim order placement | **REFUTED as a false-claim P1** — the lines narrate the LABELED illustrative scene (the lede says "In this illustrative order…"); they are the owner's chosen sample's narration and the reviewer's own accepted draft (§7 kept them verbatim). The product asserts no placement capability anywhere. **HARDENED anyway:** an sr-only "Illustrative order scene" description added to the band (not role="img" — that would strip the pause control from the a11y tree). |
| 2 | P1 | d-4 infers "no basic plan offered" from one month's statement | **DEFERRED to the rule-table lane** — the d-4 predicate + its golden text are the COMMITTED, drift-locked F1a codification (its own reviews); this slice renders the golden faithfully. The statement-conservative reading vs the statute's "offers" condition is recorded as a rule-table watch item for the owner's next freshness pass. No surface change. |
| 3 | P1 | Hand-typed prose figures ("Sixteen findings", "Six", "four example months", 17) | **ACCEPTED-PARTIAL (as P2)** — the figures are real and test-matched, not invented (the fabrication bar); the genuine risk is silent drift. **FIXED with a prose-figure drift-lock** (`fees-surface.test.ts`): every headline word now fails loudly if the engine value moves. |
| 4 | P1 | Clean result rendered as "lawful" despite unresolved external duties | **ACCEPTED-FIXED** — clean states now read "within its cap as declared" + "a clean month is a clean statement, not a lawfulness certificate" (FeesView + playground). |
| 5 | P2 | 11/6 presented as the complete statutory boundary (i/j/k exist) | **ACCEPTED-FIXED** — intro reworded to "rules codified from the fee-cap core"; the boundary section now names the out-of-scope duties (advertising consent, marketing inserts, menu-price parity) as out of scope by design (verified vs the LL79 memo). |
| 6 | P2 | Three external-evidence summaries misstate the law | **ACCEPTED-FIXED** (verified against `docs/research/ll79-source-memo.md` primary quotes): a-3 + exigent-circumstances exception; g-1-iv "written" dropped (notice-based, 30-day effective floor); g-3 reworded (presentation duty; the category lock catches only unlawful labels, "enforces" removed). |
| 7 | P2 | Cured verdict omits the refund that proves the cure | **ACCEPTED-FIXED** — `refundEvidenceFor()` appends the refund amount+date (from the statement's own refund lines) to cured receipts, and the open-window note to conditional ones; pack + e2e teeth added; aggregate wording → "charge lines (n)". |
| 8 | P2 | One-shot CTA motion unpausable | **ACCEPTED-FIXED** — `playing` now reflects ALL motion; the pause control stops a one-shot mid-run; one-shot completion returns the control to "Play motion"; e2e covers the paused→CTA→pause path. |
| 9 | P2 | aria-pressed + changing label contradiction on the pause control | **ACCEPTED-FIXED** — aria-pressed removed (label-swapping action button); e2e updated. |
| 10 | P2 | IO pause fires on isIntersecting, not the recorded 12% | **ACCEPTED-FIXED** — `intersectionRatio >= 0.12` with thresholds [0, 0.12]. |
| 11 | P2 | Import walk misses non-literal dynamic specifiers | **ACCEPTED-FIXED** — call-site vs full-literal counting added, fail-closed; the new bite test then caught MY first fix's own hole (quoted-prefix concatenation counted as literal) — fixed again with full-literal-call regexes. Two real defects, both now bitten. |
| 12 | P2 | Chapter order untested (any permutation passed) | **ACCEPTED-FIXED** — exact h2-sequence assertion added. |
| 13 | P3 | Brand lockup wraps under the 8-link nav | **ACCEPTED-FIXED** — nowrap on the lockup + tighter link pills ≤1320px. |
| 14 | P3 | Stale/incorrect CSS evidence comments (iris header line; --gold "2.40:1") | **ACCEPTED-FIXED** — header comment updated; the 2.40 was an UNCOMPUTED claim (real value 1.83:1, sol's 1.83 confirmed by script) — exactly the fabricated-evidence class this project exists to refuse; corrected. |

## Blindspot-scout findings applied (independent, quarantined; leads verified before action)
- **Footer/404 forgot /fees** (+ the interactive surfaces) → fixed; **footer-completeness e2e tooth** added so the chrome can never drop a canonical surface again.
- **No favicon/metadataBase/OG** → `app/icon.svg` (the v8 mark) + `metadataBase` + text-only OG added. **OWNER PICKS left open:** the OG card image/line · indexing posture (robots/sitemap) · a statute-status line (conflicts with the recorded TRACK-ONLY watch-item word, so surfaced, not applied) · nav-label stranger test · /fees print check.
- Mobile axe: out of scope by the owner's desktop-only word (recorded, not skipped silently).

## Acceptance-gate (INLINE, primary seat — seat-death fallback, overlap recorded)
1. **Grill vs the 20-item spec + the plan's 5 DONE criteria:** all MET on evidence — the audit renders end-to-end with receipts; the boundary renders honestly-unresolved; framing carries no overclaim (C10 green, jargon teeth); listings surfaces byte-stable except deliberate integration edits; new teeth exist and bite. Desktop-binding viewports verified (axe zero A/AA ×6 surfaces incl. /fees).
2. **Cross-model devil's advocate:** the sol batch above (BLOCK → all findings dispositioned).
3. **Verify-correctness:** post-fix battery — verify exit 0 (tsc/lint/build **58/58**/vitest **1240+7**) · e2e **26/26 dev + 26/26 artifact** · legacy 306+5 · packs green within vitest · C10 site-wide green.
4. **Enterprise + elegance:** v8 language consistent across shell + surfaces; captures inspected visually (`captures-2026-07-16-v8/`).
5. **Anti-slop:** figures engine-derived or drift-locked; the proof bar re-grounded in the real specimen; no invented values anywhere.

**GATE VERDICT: SHIP** (with the maker≠judge overlap + the open owner picks recorded above). Deploy remains the owner's explicit word.
