# Gate record — Track B1 OFFLINE MACHINERY (domain-quality "Effective"-axis judge)

**Date:** 2026-06-26 · **Scope:** B1 offline machinery (commits `db72461` B1a · `4096ebe` B1b · `f71c5c9` B1c · `2fc1f08` B1d · `e201eee` honesty-refinements) · **Artifact framing:** offline calibration machinery + method + a PRE-REGISTERED bar — **NOT** a proven calibrated judge (no live run yet; owner-gated).

## 1. `acceptance-gate` (independent, read-only) → **SHIP**

Ran the five-gate panel on the offline machinery (framed correctly: judge honesty + construction rigor + pre-registration, NOT "is the judge calibrated").

| Gate | Verdict | Note |
| --- | --- | --- |
| grill | PASS | self-critical caveats section pre-empts the obvious attacks (synthetic-only, §4.2 partial-marginal, small-N, realism gap) |
| codex cross-model | **deferred to B1d, NOT waived** | per the project's own design — status-doc decision rule + spec R-DHON-3 bind the Codex gate to the *calibrated claim* (post-live-run); mirrors the shipped P2→P3 precedent. The offline machinery asserts no capability, so nothing for family-bias to over-reward. |
| verify-correctness | PASS | R-DCAL-1 enforced LIVE (`domainTerritoryViolations()`); situation-in confirmed (`domainSituation` omits `diagnose().play`/`.root_cause_hypothesis`); gate-passing+faithful by construction; per-dimension reporting; aggregate recomputed from per-dimension passes; **`lib/data/domain-calibration.snapshot.json` does NOT exist → no fabricated metrics** |
| enterprise+taste | PASS | provider-agnostic boundary mirrors `semantic-judge.ts`; fail-closed budget ledger threaded even on the free Groq path; DI for tests; load-bearing comments; no dead scaffolding |
| anti-slop | PASS | 2 advisory nits only: pervasive em-dashes (consistent house style, internal docs); "3 calibrated dimensions" wording (fixed → "dimensions under calibration") |

**Verdict: SHIP (the offline machinery).** Non-blocking follow-ups: (1) state-doc sync (was "NEXT = B1" — UNDER-claimed, no honesty breach; synced this commit); (2) the wording nit (fixed). `npm run verify` green = 236 + 4 skipped (the +4 includes the live calibration test auto-skipping offline — correct; no live judge ran, no numbers exist).

## 2. Codex cross-model changed-files review → **SEAT-BLOCKED (dated obligation)**

Attempted `~/claude-os/bin/codex-guarded review --base 07e9a55` (the whole B1 diff) at ~16:05 UTC. Raw error, surfaced verbatim (owner doctrine: no retry/downgrade/switch — the seat is an owner action):

```
ERROR: You've hit your usage limit. Upgrade to Pro … or try again at 3:27 PM.
codex
Review was interrupted. Please re-run /review and wait for it to complete.
```

**Disposition:** Codex-down ≠ gate-waived. B1's offline machinery proceeds **test-verified** (236+4 green; R-DCAL-1 enforced live; acceptance-gate SHIP). The Codex changed-files review is a **DATED OBLIGATION** — and it **converges with the B1d-scheduled Codex cross-model gate** (the formal gate on the calibration honesty, due before any "calibrated" claim ships per R-DHON-3). Re-run at B1d on a fresh seat, reviewing the full B1 diff + the calibration snapshot honesty.

## 3. Advisor (stronger reviewer, full-transcript)

Reviewed the whole B1 build at the "complete" checkpoint → sound; do not redesign. Five honesty/framing refinements, all applied before the gates (commit `e201eee`): realism/difficulty-gap caveat; §4.2 B2 ordering decision (carried explicitly); platform-name note (pre-empts a Codex nit); frame the acceptance-gate as offline-machinery-not-calibrated-judge; verify no state-doc implies "calibrated."

## Net

**B1 OFFLINE MACHINERY = SHIP + test-verified.** Owner-gated next: the live Groq calibration run (fresh daily window, $0) → held-out + per-dimension vs the pre-registered bar (`docs/domain-calibration-status.md`) → IF cleared: eval-lock + the (now dated-obligation) Codex cross-model gate + flip docs to "built + calibrated, metrics=X". No "calibrated" claim ships before then.
