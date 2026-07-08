# Codex changed-files review — design-implementation slice (Ledger + gallery white)

- **Date:** 2026-07-08 (eighteenth session)
- **Scope:** the uncommitted working-tree diff of the design-implementation slice — `app/globals.css` (+381/−175), `components/report/ReportView.tsx` (+61/−34), `components/demo/DemoView.tsx` (+1/−1), `evals/packs/report-view-c1.test.ts` (+31/−0). `docs/decision-log.md` rows declared out of scope (orchestrator's).
- **Seat/route:** `codex-guarded` (SEAT_OK smoke test first), read-only sandbox, config default `gpt-5.5` @ `xhigh`. Effort routed xhigh: ship-gating-adjacent (this surface is what deploys).
- **Maker=judge briefing:** disclosed in the prompt — Opus builder; Fable inline equivalence review (builder's safety classifier down); the mid-review `git restore` incident + byte-exact snapshot recovery; both live verify re-runs (947+6 exit 0).
- **Raw:** `docs/reviews/codex-2026-07-08-design-slice-raw.md` (the captured tail; the harness capture was `tail -120` — the verdict + all six constraint checks are complete within it, stated honestly).

## Verdict returned: BLOCK — 1 P2, no P1s

**P2 — negative `letter-spacing` in the new Ledger section** (`app/globals.css:1189, 1283, 1371, 1382, 1647`), citing "the active frontend rule 'Letter spacing must be 0, not negative'"; constraint check (3) REFUTED solely on this; checks (1) content freeze, (2) print-assertion teeth, (4) print block byte-identical to HEAD, (5) no out-of-scope touches, (6) accessibility/desktop scope — **all CONFIRM**.

## Reconciliation (primary-model-final, Fable seat): P2 REFUTED — no change

1. **The cited rule is not a repo constraint.** No binding source in RULES.md, the playbook, or docs mandates zero letter-spacing; repo-wide grep finds the phrase only inside an old review transcript. The rule is a generic design-skill heuristic targeting body-text readability — informative input, not a project invariant.
2. **The tracking is the owner-approved spec, not drift.** The committed, owner-picked sample (`mockups/design-samples-2026-07-08/sample-1-ledger.html`, lines 99/140/232/241) uses exactly these values; the dispatch packet carried "tight tracking" verbatim from the sample's token plan. Four of five cited sites are 18–52px weight-800 display type (standard Swiss/grotesk practice); the fifth (`.rpt-plain` 16px/600 at −0.012em) matches the sample byte-for-byte. Zeroing them would deviate from the design the owner picked — spec-adherence wins.
3. Cross-model doctrine honored: the finding was engaged on evidence, not rubber-stamped or blind-obeyed; the refutation is falsifiable (the sample file + the absence of any binding rule).

**Validation note carried honestly:** Codex could not execute the test suite in its read-only sandbox (`EPERM` on Vitest temp dir); its review was diff-level. Execution coverage comes from this session's two independent live runs: `npm run verify` = 947 passed + 6 skipped, exit 0 (pre- and post-recovery), `test:legacy` 306+5 (builder run), plus the reviewer-executed red-green on the new print assertion (RED 1 failed/11 passed with the property stripped → GREEN 12/12 restored).

## Incident on record (this slice's honesty note)

During the reviewer-executed red-green, the orchestrator's restore step (`git checkout -- app/globals.css`) reverted the UNCOMMITTED builder work to HEAD — a reviewer error, not a builder or test failure; the GREEN had passed against the OLD file (which also carries the print properties), masking the wipe. Recovery: the builder agent, resumed from its transcript, restored the file **byte-exact from its own post-splice snapshot** (37,136 bytes; same +381/−175 stat), and all spot-checks (token block, banner rule, print-block position, marker counts) matched the pre-incident review outputs; full verify re-run independently green. Lesson routed to `~/claude-os/tasks/lessons.md`: back up a file carrying uncommitted work before any destructive red demonstration; a green run proves nothing if the old version also passes.

## Disposition

Slice ACCEPTED at the per-slice gate (Codex findings reconciled primary-model-final; equivalence review PASS; gates green). Deploy remains a SEPARATE owner act (design-first ruling 2026-07-03).
