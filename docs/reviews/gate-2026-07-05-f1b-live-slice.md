# Acceptance-gate record — F1b LIVE slice (2026-07-05)

**Judge:** independent acceptance-gate subagent (fable override; fresh context,
no authorship). First launch died mid-run on the subagent seat limit (raw:
"You've hit your session limit · resets 8:30pm (America/New_York)");
owner-confirmed retry completed. One earlier launch attempt failed on a transient
harness error ("claude-opus-4-8[1m] is temporarily unavailable"), retried clean.
The gate's own advisor() call was unavailable (13th consecutive thread) — noted
in its verdict; single-judge.

## Verdict as returned: **BLOCK — narrow, evidence-completeness; "the substance is sound"**

Per-gate: grill PASS · codex FAIL(PENDING-HANDOFF) · verify PENDING-HANDOFF ·
enterprise+taste PASS (4 non-blocking advisories) · anti-slop PASS. The gate
independently recomputed from the frozen snapshot: 20/21 accuracy, per-class
matrices, macro precision 0.9714, macro κ to 12 decimals, flip 0, BOTH
provenance-invariance claims (63/63 unanimous; predicted counts 4/3/4/3/7 — the
0/0 convention never fired), the mechanical conjunctive DEFER, the eval-lock's
structural teeth, and the run-#1 outcome-blind account. It found the DEFER
honest on every surface ("no surface spins 20/21 into an earned label").

**Its two flip conditions (verbatim substance):**
1. The final narrow Codex confirm's SHIP had NO raw transcript on the record —
   the last EVIDENCED cross-model verdict was BLOCK. (Correct: the first narrow
   confirm ran without tee. A narrated SHIP over an evidenced BLOCK is refused.)
2. The raw `npm run verify` / `test:legacy` outputs + deslop advisory were not
   on the durable record; RG-4's red lived only in the session transcript.

## Flip-condition discharge (same session, before commit)

1. **DISCHARGED** — the narrow confirm RE-RAN with its raw saved:
   `codex-2026-07-05-f1b-live-final-confirm-raw.md` → both residuals
   DISCHARGED at exact lines → **"VERDICT: SHIP"** (on the record verbatim).
2. **DISCHARGED** — `f1b-live-wiring-verify-evidence.log` GATE-FLIP DISCHARGE
   APPENDIX: raw VERIFY_EXIT=0 · test stage 737 passed + 6 skipped (raw tail,
   timestamps) · test:legacy 306+5 LEGACY_EXIT=0 · RG-4 durable red-green
   re-executed with captured output (RED 1 failed | 4 passed → GREEN 5 passed) ·
   deslop advisory 1/100 clean (one low nit, recorded, left post-confirm).

**Advisories folded same-session:** (a) index.ts stale "next slice" header
reworded; (b) the ucp-oracle comment made TRUE (the measured 33/35 split now
lives in the slice record + PROJECT_STATE); (c) state docs synced in the same
commit; (d) `f1b-live-slice-record.md` written.

## Final disposition: **SHIP** (the gate's own pre-committed flip conditions met — W1 precedent)

Both named flip conditions were discharged with raw evidence on the record; the
gate's substantive verdict ("everything I could recompute myself held … what
blocks is the record, not the work") stands. Final call made on the Fable seat
(primary-model-final, owner ruling 2026-07-03).
