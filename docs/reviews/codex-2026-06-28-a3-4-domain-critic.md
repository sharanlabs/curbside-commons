# Codex changed-files review — A3-4 (Domain Critic as the 2nd VERIFY-phase critic, advisory)

> **✅ DISCHARGED 2026-06-28 (batched on the reset seat) — the round-3 re-confirm returned SHIP (no new findings). Canonical record: [codex-2026-06-28-a3-batch-confirm.md](codex-2026-06-28-a3-batch-confirm.md). The SEAT-BLOCKED / dated-obligation status below is now historical.**

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the uncommitted A3-4 diff (4 modified + 1 new eval) · **Reconciliation:** primary-model-final (Opus 4.8).

## Verdict: BLOCK (round 1) → reconciled → round-2 confirming found 1 RESIDUAL P1 → patched + test-locked → round-3 re-confirm SEAT-BLOCKED (dated obligation ~7:25 PM); proceeding TEST-VERIFIED

`npm run verify` green on the maker side after the fixes: exit 0, **285 passed | 5 skipped**. Differential lane (`lib/core`, the `out/` oracle, `evals/gold/`, the frozen `*.snapshot.json`) **UNTOUCHED**. The BLOCK challenged none of A3-4's direction; the P1 was the A3-3 cross-family bug class recurring on a forced-`live:true` path — the gate earning its keep again.

## Findings (3: 1 P1 · 2 P2) + 3 P3 nits — all ACCEPTED + fixed

| # | Sev | Finding | Resolution |
|---|-----|---------|------------|
| 1 | **P1** | `opts.live === true` **bypassed** the cross-family default gate — a caller with `DOMAIN_JUDGE_PROVIDER=gemini` + a Gemini key + `live:true` would run **Gemini drafter + Gemini domain critic (same-family)** while the code claims cross-family. | **Accepted.** Extracted a `crossFamilyReady` predicate; a **forced `live:true` that is not cross-family-ready (and not a DI path) now THROWS** a specific `R-A3-2` error before any provider call (`orchestrator.ts`). Regression added (`DOMAIN_JUDGE_PROVIDER=gemini` + `live:true` → `.rejects.toThrow(/R-A3-2.../)`). |
| 2 | **P2** | `lastDomain` could go **stale**: an approved iteration records a domain verdict, then a gatekeeper-blocked final iteration leaves the prior verdict in `finalVerify.domain` + the audit — contradicting the "null when blocked" contract. | **Accepted.** `lastDomain = null` reset **per iteration** before the gatekeeper-approved domain block (`orchestrator.ts`). Regression: iter-0 approved (domain runs) → iter-1 register-leak draft gate-BLOCKED → `finalVerify.domain` null + no `domain` audit entry + the trajectory still shows iter-0's domain step (proving a reset, not "never ran"). |
| 3 | **P2** | The §11 plan marked A3-4 **"✅ DONE"** while the same line said Codex + acceptance-gate were in progress — dishonest under this repo's definition of done. | **Accepted.** Reworded to **"⏳ BUILT + Codex-reconciled (acceptance-gate pending)"**; flips to ✅ only after the acceptance-gate SHIP. (Same honesty-defect class the acceptance-gate caught on A3-3.) |
| P3a | nit | `live` option doc comment omitted `resolvedDomainJudgeProvider`. | Updated to the full `crossFamilyReady` predicate + the fail-closed note. |
| P3b | nit | The independence comment overclaimed ("can only co-occur if independent"). | Reworded: structural independence is from `judgeDomain`'s signature (no faithfulness input) + `domainSituation` withholding `diagnose().play`; the test exercises co-occurrence via DI. |
| P3c | nit | Stale 7-step phase-sequence comment after adding the 2nd verify step. | Updated to the 9-step sequence. |

## Confirmed by Codex (round 1, independent)

- **Advisory invariant holds:** `verifyPassed` is finalized before the domain critic runs; route/send uses `if (verifyPassed)`; the advisory test would fail if `domain_defective` gated the send.
- The default live gate **and** the A3-7 harness include `resolvedDomainJudgeProvider()==="groq"` and assert `finalVerify.domain?.provider === "groq"`.
- **Anti-theater framing honest:** the mock is non-vacuous, ties the live judge's F1, and the `domain_critic` label correctly **defers**.

## Confirming re-pass (round 2) — found 1 RESIDUAL P1, patched + test-locked

Round 2 confirmed F2/F3 + the 3 P3 nits resolved and the earlier-confirmed items hold, **but found a residual on F1**: the forced-`live:true` DI exemption used `||` (ANY injected generate), so **partial DI** — e.g. `live:true` + `draftGenerate` only + `DOMAIN_JUDGE_PROVIDER=gemini` — skipped the throw and could still run a **real Gemini Domain Critic** under the cross-family banner. **Accepted + fixed:** the exemption now requires **fully-injected DI** (`fullyInjectedDI = Boolean(draftGenerate && judgeGenerate && domainGenerate)`); any partial DI with a non-Groq critic config throws. The regression was extended to three cases — (a) no DI → throws, (b) **partial DI (draftGenerate only) → STILL throws**, (c) fully-injected DI → does not throw — so Codex's exact round-2 finding is encoded as a committed test. Re-verified green (285 + 5 skipped).

## Confirming re-pass (round 3) — SEAT-BLOCKED (raw error surfaced, no retry)

The round-3 re-confirm on the patched P1 hit the Codex **usage limit** mid-review — raw error surfaced verbatim: *"You've hit your usage limit … try again at 7:25 PM."* Per owner doctrine (surface raw · no retry/downgrade/switch — the seat is an owner action · **Codex-down ≠ gate-waived**), the round-3 re-confirm is a **dated obligation (~7:25 PM ET)**, not a hard blocker.

**Proceeding TEST-VERIFIED on the P1 round-2 fix** (the 2026-06-20 / alignfix precedent): the change is a narrow, well-understood `||`→`&&` correction, and a **committed regression encodes Codex's exact partial-DI case** (it FAILS if the exemption is reverted to `||`). The recommended round-3 Codex re-confirm before any irreversible step (push / the A3-7 live run) is recorded here.

