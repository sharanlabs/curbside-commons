# Batch E — Codex changed-files review + reconciliation (2026-07-13)

**Reviewer:** ONE `gpt-5.6-sol@high` run via `~/claude-os/bin/codex-guarded`
(probe-first: SEAT_OK, 12,647-token probe; session `019f5b83`). **Scope:**
`d936998..a81edd2` — all of slice group E's authored work (S7 S-11 sync + demo
record · S3b CI claim flip · HEADER POLICY · the design-iterate decision-log row ·
design variations ×3). Raw transcript: `codex-2026-07-13-batchE-raw.log`
(~9,460 lines, ~309k tokens). Two seat/CLI events on record, both raw in the log:
the first launch stopped at the repo's own startup approval gate ("Please approve
continuation.") and was resumed via `exec resume`; the first resume died on
`error: unexpected argument '-s' found` (the `exec resume` subcommand takes
different options than `exec` — same class as the batch-B/D arg retries) and was
relaunched clean once.

**VERDICT: REVISE — 1 P1 · 3 P2 · 0 P3. Reconciliation (primary-model-final):
ALL 4 ACCEPTED-FIXED, 0 refuted.** Every finding was verified against the files
before fixing; none was disprovable. The reviewer also explicitly confirmed:
S-11/S3b wording · protected paths · hard stops · decision sequencing (the
pre-gate HOLD ruling internally consistent) · no batch-D residuals left open ·
header values · mockup banner/golden-data/keyboard/no-JS integrity · variation B's
evidence figures (21/21, 20/20, floors-not-met) · inventory + C10 static
re-derivation · runtime probes of the four CLI exits (old command 2 · corrected 1 ·
fees 1 · demo 0). Its read-only sandbox denied vitest (`EPERM`, expected); counts
below were re-run locally by the primary model.

▸ *Plain: the second AI model checked everything this batch changed and found four
real problems — the "everything verbatim" demo record had quietly paraphrased two
of its transcripts, a security-header test could be fooled by a duplicate line, and
two of the three design samples broke their own written accessibility and styling
rules. We confirmed all four against the files and fixed them.*

## P1 (confirmed → fixed)

1. **The S7 demo record violated its own complete/verbatim evidence contract.**
   Five defects, each confirmed: (a) the failed command's usage output was replaced
   with "(usage text follows)" while the policy said verbatim; (b) SHOWCASE §1's
   standalone `npx vitest run evals/rag` command was absent from the table (the
   note admitted only indirect coverage); (c) the §0c demo was *summarized*, not
   transcribed; (d) the table cells were called "verbatim summary blocks" but were
   condensed extractions; (e) the demo↔SVG "byte-identical" claim was stronger than
   the generator proves (`render-demo-svg.mts` normalizes CRLF and trims trailing
   newlines). **Fix:** the record now carries a dated amendment note naming all
   five defects; the full 42-line usage output and the full 65-line demo transcript
   are embedded verbatim (spliced programmatically from the original capture files,
   not retyped); a verbatim appendix carries every vitest summary block; the table
   is relabeled "condensed extractions"; the standalone `evals/rag` run was
   executed (47/47, exit 0, 2026-07-13 at `a81edd2`) and added with its own
   provenance note — `git diff d936998..a81edd2 -- evals/rag lib/rag` is EMPTY, so
   the suite and code under test are byte-identical to the named SHA; the SVG claim
   is now "line-for-line after the generator's recorded normalization." *A record
   whose subject is capture honesty must hold itself to its own standard — this is
   the demo-record analogue of batch D's E4 exam finding.*

## P2s (all confirmed → fixed)

2. **The header-policy binding accepted a smuggled duplicate header.**
   `Object.fromEntries` collapses duplicate names, so a fifth line duplicating a
   header name (which Cloudflare would comma-join live) passed the object-equality
   assertion. **Fix:** the test now asserts the raw pair list first — exactly 4
   pairs, all names unique — before the value equality. Red-green proven: a
   smuggled `X-Frame-Options: SAMEORIGIN` line placed before the canonical one
   fails the suite; restore green (4/4).

3. **Variations B and C violated their own stated reduced-motion contract.**
   Unconditional hover/active `transition`s (border-color/transform) sat outside
   any gate in B; C additionally had ungated skip-link/index/hold-cue transitions
   and a transition *added inside* its reduce block. **Fix:** both files now carry
   a global `*, *::before, *::after { transition: none !important; animation:
   none !important; }` kill inside `prefers-reduced-motion: reduce`, and B's
   contract comment was reworded to describe the actual mechanism. (Variation A was
   reviewed and passed as-built — its kill-under-reduce pattern with an
   opacity-only fallback had complete selector coverage.)

4. **The batch's "radii ≤6px" acceptance claim was false for variation C.**
   8/10/12px radii on the banner, verdict card, finding cards, and footer.
   **Fix:** all five rectangular-surface radii normalized to 6px. The `999px` pill
   controls stay under the recorded pill-radius precedent (the 2026-07-08 S4
   `.site-status` exception, re-cited here). Note: the owner's same-session word
   **"No Split layout."** rejected variation C as a direction — the file remains a
   committed design-process record, so its contract violations were fixed anyway
   (no committed artifact may contradict its own stated rules).

## Post-fix gates (re-run live 2026-07-13, this reconciliation)

`npm run verify` exit 0 = **1152 passed + 7 skipped** (floor 1145+7 held) ·
`test:legacy` 306+5 · e2e **12/12 dev + 12/12 artifact** · evals/packs green incl.
the hardened header-policy suite (red-green re-proven) and the C10 mockup scan at
106 entries · protected paths: `legacy/` + `fixtures/` EMPTY, `evals/` diff ==
exactly `evals/packs/header-policy.test.ts` (recorded allowlist). PUSH proceeds per
plan §Gates (batch E reconciled). **PRE-GATE remains HELD** per the 2026-07-12
decision-log ruling — the owner's design pick is the gating event.
