# Changed-files review — session-19 /fees receipt-ribbon design fix (2026-07-16)

**Trigger:** the owner's session-19 word "resume fix the design issues as well." A fresh-eyes design
QA sweep of the release candidate `43efc55` (rendered from the immutable clean-room artifact, hash
`dfcf79c5…41c0c`) measured a real defect the session-18 capture inspection missed.

**The defect (measured, not asserted):** `/fees` findings' evidence receipts share the 4-track
`.rpt-receipts` grid (`2.1fr/1fr/1.35fr/0.9fr`); the 4th cell "the arithmetic" carries
sentence-length evidence but got the smallest track — **48px wide, wrapping 13–17 one-syllable
lines**, and clause cells at 57px, at ALL desktop widths (1280/1440/1728). 9 affected cells; the
"THE ARITHMETIC" label itself clipped. A full-site sweep (landing, /report, /demo, /playground,
/eval, /metrics, /cost, 404) measured **zero** ribbon cells anywhere else — /report and /demo hold
short ids, so the shared default stays correct for them. Print (Letter, the ≤900px fold) read
perfectly; its only nits were page-break orphans (the BASIS rail label stranded at a page foot).
Before/after: `captures-2026-07-16-designfix/`.

**The fix (40 insertions, 2 files):**
1. `app/globals.css` — `:where(.fee-wrap) .rpt-receipts` scoped override → the 2×2 pairing
   (statement+clause / rule+arithmetic) that the narrow breakpoint and print already use, plus the
   matching odd-cell border reset. `:where()` keeps specificity at the base level so the
   narrow-viewport folds keep winning (review finding #1).
2. `app/globals.css` `@media print` — `.rpt-rail { break-after: avoid }` +
   `.rpt-sec { break-inside: avoid }` (oversize sections still fragment naturally per css-break-3).
3. `evals/e2e/fees.spec.ts` — regression tooth: at 1280 every `#fee-report .rpt-rc dd` bounding box
   ≥150px. **RED proven** against the old artifact (fails at width 48); **GREEN** on the fixed tree.

**Reviewer:** ONE Codex run via `~/claude-os/bin/codex-guarded` (probe SEAT_OK 12,107 tok; review
124,666 tok). Raw: `codex-2026-07-16-designfix-raw.log`.

## VERDICT: REVISE (2 P2) → reconciled primary-model-final: 2 ACCEPTED-FIXED · 0 refuted

| # | Sev | Finding | Adjudication |
|---|-----|---------|--------------|
| 1 | P2 | The scoped rule's specificity (0-2-0) defeats the later ≤900/≤560 breakpoint folds — /fees would stay 2-col below 560px | **ACCEPTED-FIXED** — both new rules wrapped in `:where(.fee-wrap)`; proven on the rebuilt artifact: receipt grid = 1 track @500px, 2 tracks @1280. |
| 2 | P2 | Artifact-mode execution of the new tooth not evidenced (dev-only green supplied; the reviewer's own runtime attempt was sandbox-blocked, not an app failure) | **ACCEPTED-FIXED** — the new candidate's clean-room RELEASE GATE runs the full artifact-mode e2e (27/27 expected); recorded in the session-19 gate table below/state docs. |

Reviewer also verified (stated in the raw): /report and /demo are not selected by `.fee-wrap`; DOM
order statement→clause→rule→arithmetic makes the odd-cell reset correct; no other `.fee-wrap` grid
affected; the dt shares the widened track; the print rules are coherent.

**Gates on the fixed tree (this session, live):** verify exit 0 = tsc/lint/build 58-58 · vitest
1240+7 · dev e2e **27/27** (26 + the new tooth; includes axe zero A/AA ×6 surfaces incl. /fees) ·
ribbon sweep on the rebuilt artifact: **0 ribbons at 1280/1440/1728**, no horizontal overflow ·
print PDF re-rendered: BASIS travels whole with its rows, findings unbroken.

**Answers one open owner pick:** the `/fees` print check — print works and reads well (2-col
receipts, whole findings, no orphaned rail labels after this fix).
