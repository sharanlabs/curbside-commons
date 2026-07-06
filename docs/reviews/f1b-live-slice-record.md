# F1b LIVE slice record — the owner-armed classifier run + C5 measurement (2026-07-05)

**Owner arming:** 2026-07-05, "all four" (decision-log last row) — ① live
classifier run ARMED · ② Gemini demo color DECLINED (call closed) · ③ cargo/Rust
INSTALL ordered (C5 measurement) · ④ corpus license DEFERRED to the Pub gate.

**Route (doctrine 2026-07-03):** Fable seat = orchestrator/final judge; built
inline on the Fable seat (single coherent lane + harness; maker≠judge restored by
the cross-model gate + independent acceptance-gate below). frontier-advisor
consulted pre-approach (PROCEED-WITH-CONSTRAINTS, all 5 adopted — decision-rule
tightening as dated amendment, rep-0 pinned, wired-with-code-landing, 0/0
convention pre-noted, typed flip-rate variant). Harness `advisor()` down — 12th
consecutive session, surfaced.

## What shipped

1. **The live Groq lane** — `lib/agents/fee-classifier.ts`: leak-free
   `ClassifierInput`-only prompt + static §20-563.3(d) rubric; zod-enum 5-label
   schema-checked output; FAILED_TO_FALLBACK to the deterministic baseline;
   env-gated (`groqLiveEnabled`); Groq-only, $0 by construction (no paid branch).
   `LIVE_CLASSIFIER_DESIGN.wired` → `true` (dated); `LiveClassifierNotWiredError`
   removed (zero callers). The fees pack's zero-network import proofs still pass
   (the pack never imports the lane).
2. **The calibration run** — pre-registered floors (committed pre-run:
   `bda6314` + the ≥20/21 amendment `550e3cb`; no-rerun rule `c73c100`).
   **Run #1 incident (honest record):** all 84 calls completed, then the results
   were LOST to a `writeFileSync` ENOENT (`lib/data/` moved at W0) before any
   metric printed — outcome-blind; harness fixed (probe-write before spend;
   freeze before assertions) and **run #2 (authoritative, degraded=false, zero
   fallbacks)** executed: **held-out 20/21** (strictly beats the pinned 19/21
   baseline) · macro precision 0.971 · macro κ 0.944 · flip-rate 0.000 · but
   `enhanced_service_fee` recall **3/4 = 0.75 < the ≥0.80 floor** → **the label
   DEFERS** (conjunctive rule; no re-run, no floor change; the split is exposed
   and not re-scorable). Frozen: `lib/data/fee-classifier-calibration.snapshot.json`;
   eval-locked: `evals/gold/fee-classifier-calibration.lock.test.ts`; full
   narrative: `docs/fee-classifier-calibration-status.md`.
3. **C5 MEASURED** (owner decision ③): cargo 1.96.1 + `ucp-schema` 1.3.0 (latest
   crates.io release) installed; `npm run test:ucp-oracle` = **33/35 agree + 2
   documented LST-CONF-FORMAT divergences + 0 disagreements, exit 0** — the two
   divergences root-caused to the JSON Schema 2020-12 format-assertion fork (we
   assert via ajv-formats; the official tool treats `format` as annotation-only;
   no assertion flag exists — `validate --help` checked) and encoded as ONE
   documented divergence class, one direction, anything else fails. Reproducible
   on a clean PATH (the Codex P1 fix: `resolveUcpSchema()` checks `~/.cargo/bin`).
4. **Metrics extension** — `multiClassFlipRate` (typed multi-class analogue of
   the ported boolean `flipRate`), unit-tested.
5. **Docs** — status doc (pre-registration + incident + results + provenance
   addendum), plan header + §1/§2.1/§3.2 supersessions, PLAIN-ENGLISH row,
   GLOSSARY (+2: Eval-lock, Pre-registration), decision-log row, `.env.example`.

## Gates

- **Verify:** exit 0 — **737 passed + 6 skipped** (720+5 → +12 offline, +1
  skipped live harness, +5 lock); `test:legacy` 306+5 unchanged; F1a goldens
  byte-unchanged; raw tails in `f1b-live-wiring-verify-evidence.log`.
- **Red-green (executed):** RG-1 prompt-leak teeth · RG-2 fallback honesty ·
  RG-3 wired drift-lock · RG-4 snapshot verdict-tamper (durable re-execution in
  the evidence log) · the C5 clean-PATH red-green.
- **Codex cross-model gate — DISCHARGED (SHIP):** batch BLOCK (1P1+2P2+1P3) →
  all reconciled red-green → confirming pass (3/4 + 1 residual + 1 new P3;
  independently re-ran the oracle + verified provenance vs git history) → both
  fixed → final narrow confirm **SHIP** (re-run with its raw on the record after
  the acceptance-gate refused the unrecorded first pass). Records:
  `codex-2026-07-05-f1b-live-slice.md` + 3 raws. Seat events verbatim in the
  record (two background launches externally stopped; root cause = the CLI
  blocking on a never-closing background stdin; fixed with `< /dev/null`).
- **Acceptance-gate — BLOCK (narrow, evidence-completeness) → both flip
  conditions DISCHARGED → SHIP:** `gate-2026-07-05-f1b-live-slice.md`.

## Cost + seat events

Live spend: **$0** (Groq free tier; ~100K tokens of the ~200K TPD window across
both runs; Gemini untouched, ≤$5 cap intact). Seat events (all raw, on record):
two Codex background launches externally stopped (stdin root cause) · the first
acceptance-gate launch died mid-run on the subagent seat limit ("You've hit your
session limit · resets 8:30pm (America/New_York)") — owner-confirmed retry
completed · one transient harness classifier-unavailable error on the first gate
launch attempt, retried clean.

## Lessons routed to ~/claude-os/tasks/lessons.md

1. Probe the output path before spending unrecoverable work; freeze results
   before assertions (run #1).
2. Commit the pre-registration BEFORE arming a one-shot run — a committed
   boundary is proof, an uncommitted file is an assertion (Codex P2).
