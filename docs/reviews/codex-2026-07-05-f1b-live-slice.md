# Codex cross-model review — F1b LIVE-CLASSIFIER slice (2026-07-05)

**Scope:** the full uncommitted diff of the owner-armed session (18 files, ~2,150
insertions): the wired live Groq lane (`lib/agents/fee-classifier.ts`), the live
calibration harness + frozen run #2 snapshot + eval-lock, the offline DI/leak
tests, `multiClassFlipRate`, the C5 oracle measurement changes, and the
status/plan/doc updates. Seat: `codex-guarded`, read-only, `gpt-5.5` @ `xhigh`
(config default). Raw transcript: `codex-2026-07-05-f1b-live-slice-raw.md`.

**Seat events (raw, on the record):** two prior launch attempts died with the
task externally stopped — attempt 1: zero bytes of output; attempt 2 captured
exactly `Reading additional input from stdin...` (the Codex CLI blocked on the
background lane's never-closing stdin pipe and hung until reaped). Root-caused
and fixed by launching with stdin explicitly closed (`< /dev/null`); attempt 3
completed normally. No silent retry — each attempt is recorded here.

## Verdict: BLOCK (1 P1 + 2 P2 + 1 P3) → ALL FOUR RECONCILED primary-model-final

Codex explicitly CONFIRMED the load-bearing surfaces: **leak-freedom could not be
refuted** (toClassifierInput carries only the seven allowed fields; the prompt is
those + static rubric; the offline leak walk judged directionally sufficient);
**the DEFER verdict recomputed correct from the snapshot** (20/21; 5/6 floors;
enhanced recall 3/4 = 0.75; conjunctive ⇒ DEFER); **the run #1 incident account
could not be refuted** (write precedes the metrics print; probe-write +
freeze-before-assertions judged sound); **zero-network proofs verified by its own
import walk** (fees pack, CLI, bin/check.mjs — no banned imports; F1a goldens +
base audit byte-unchanged); **keeping the golden-baked FEES_CLASSIFICATION_LABEL
frozen judged acceptable** (the staleness problem was the surrounding comments,
not the golden label).

### P1 — "C5 documented as measured, but the workspace does not measure it" — ACCEPTED + FIXED red-green
True and a real reproducibility bug: `cargo install` puts `ucp-schema` in
`~/.cargo/bin`, which is not on the default PATH, so `npm run test:ucp-oracle`
in a fresh shell (exactly Codex's sandbox) skipped-as-success while the docs said
"measured". FIX: `scripts-ts/ucp-oracle-diff.mts` now resolves the binary from
PATH *or* `~/.cargo/bin` (`resolveUcpSchema()`). RED = Codex's own reproduction
(clean-PATH run → "UNMEASURED" skip, exit 0); GREEN = the same clean-PATH
environment now MEASURES: `33/35 agree, 2 documented format-class divergence(s),
0 disagree`, exit 0 (executed, this session).

### P2 — "Pre-registration cannot be independently proven from repo evidence" — ACCEPTED (precisified, not papered over)
Correct observation: pre-registration + results live in one uncommitted file.
Reconciliation = the dated provenance addendum in the status doc's RESULTS
section (the area above the marker untouched): the six floors have COMMITTED
pre-run provenance (`bda6314` + the ≥20/21 amendment at `550e3cb`, both
2026-07-04); the no-same-split-re-run rule has committed pre-run provenance (the
owner's arming directive in HANDOFF at `c73c100`); only rep-0-as-record and the
0/0-precision convention are working-tree-only — and both are provably
outcome-invariant on this run (all 63 reps unanimous ⇒ any prediction-of-record
convention yields identical numbers; no empty predicted class ⇒ the 0/0
convention never fired). Lesson routed to `~/claude-os/tasks/lessons.md`: commit
the pre-registration BEFORE arming a one-shot run.

### P2 — plan-f1b-classifier.md contradicts the wired/run state — ACCEPTED + FIXED
§1's "no code path calls a live model / wired === false" struck through with a
dated supersession; §2.1's lane row now reads "RAN 2026-07-05 — label DEFERS";
§3.2's ELSE branch carries the pre-run supersession note (one-shot; the held-out
split is exposed and not re-scorable; any retry = a new owner-gated arming).

### P3 — stale "not wired" comments — ACCEPTED + FIXED
`classifier.ts` (seam doc, earnsLabel doc, live-lane banner) and
`classified-audit.ts` (header + auditWithClassification doc) reworded to the
wired-but-DEFERRED reality. A repo-wide sweep for "not wired / unwired / not yet
run" found no further live sites outside legacy/ and the review records.

## Post-reconciliation state
`npm run verify` exit 0 — **737 passed + 6 skipped**; `test:legacy` 306 + 5;
`test:ucp-oracle` measures 33/35 + 2 documented divergences on a clean PATH.
Confirming Codex pass on the fixed diff: see the CONFIRMING PASS section below.

## CONFIRMING PASS (same day) — 3/4 DISCHARGED + 1 residual + 1 new P3 → both fixed → FINAL NARROW CONFIRM: SHIP

The confirming pass (raw: `codex-2026-07-05-f1b-live-confirm-raw.md`) independently:
**re-ran the oracle in its own clean-PATH sandbox** (measured `33/35 agree, 2
documented format-class divergence(s), 0 disagree`, exit 0 — the P1 discharge
proven in exactly the environment that exposed it); **verified the provenance
addendum's claims against git history itself** (`550e3cb` floor amendment,
`c73c100` no-rerun directive) and **recomputed the snapshot's unanimity**
(63/63 → rep-choice-invariance confirmed); confirmed the code-comment fixes and
runtime neutrality (F1a goldens byte-equal; 17-file import walk clean).

It caught what the first reconciliation missed: **(residual P2)** plan §1's
plain-register line still said "Right now, nothing has run for real." — FIXED
(honest run-happened-but-DEFERRED wording; grep 0 remaining); **(new P3)** the
`UCP_ORACLE_INSTALL=1` branch still called bare `cargo` — FIXED (same
PATH-or-`~/.cargo/bin` resolution). A FINAL NARROW CONFIRM verified both
discharged on the current tree: **VERDICT: SHIP.**

**Cross-model gate: DISCHARGED (SHIP).** Post-gate state: verify exit 0 =
737 passed + 6 skipped · test:legacy 306 + 5 · oracle measures on a clean PATH.
