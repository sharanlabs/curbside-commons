# Codex cross-model review — Track B2 (domain judge wired into the REPLAY ship-gate, tertiary advisory control)

**Date:** 2026-06-26 · **Reviewer:** Codex `gpt-5.5` @ `xhigh`, read-only, via `~/claude-os/bin/codex-guarded` (session `019f069f-…`, ~212.5k tokens, full run — NOT seat-limited this time) · **Target:** commit `6ea0549` (the 6 code/test files) · **Reconciliation:** primary-model-final (Opus 4.8).

This discharges the **OPEN dated obligation** from `gate-2026-06-26-b2-domain-shipgate.md` §2 (the prior B2 Codex run was seat-limited mid-review at ~8:31 PM after surfacing 1 finding, which was already fixed). The seat reset; this is the **COMPLETE** changed-files review + the §4.2 consequential-recommendation cross-check, over the same 6-file diff, with the 4 concrete targets.

## Verdict: **SHIP** (all 4 targets CONFIRMED; 3 findings — 1 P2 + 2 P3 — all accepted + fixed + re-verified green; 0 P0/P1)

## The 4 targets — Codex CONFIRM + primary-model concurrence

| # | Target | Codex | Evidence (Codex) | Primary-model-final |
| --- | --- | --- | --- | --- |
| 1 | **Advisory invariant** — can `domain_defective` reach `outreachStatus`/eligibility/`review_required`/the send? | **CONFIRM** — `domainJudge` is computed after `runCore()` and stored as a leaf field; `outreachStatus` is copied from `m.outreach_status`; summary/send state read `outreachStatus`/`merchant.review_required`, never `domainJudge`. **Protects a future LIVE judge too** if the swap only changes the `DomainJudgeResult` source and does not mutate `Merchant`. | `lib/replay/run.ts:155/168/181/193`; core send path `lib/core/pipeline.ts:94/259` | **CONCUR.** Matches my own pre-review read (the leaf-field structural argument, which I asked Codex to confirm extends past the mock to the live judge — it did). Red-green-locked at `replay.test.ts:79`. No path exists. |
| 2 | **Public-surface honesty** — does the ~75% mock flag rate read as real judge quality / "control-works" theater? | **CONFIRM**, with one copy caveat (Finding 1) — the panel framing is explicit: both draft + verdict are deterministic `$0` REPLAY stubs, the high flag rate is expected from a minimal stub nudge, live judge / real drafter are separate + key-gated. | `app/merchant/[id]/page.tsx:209/220/238` | **CONCUR** — and the Finding-1 fix further attributes eligibility to the *deterministic core* on the human-gate copy, strengthening this surface. |
| 3 | **Audit wording** for a `domain_defective` YET `simulated_sent` merchant | **CONFIRM** — the domain audit entry says "advisory" + "does not change the send or eligibility"; the separate final system entry records `SIMULATED_SENT`, so it never implies domain rejection/blocking. | `lib/replay/run.ts:123/129/140` | **CONCUR.** Now additionally locked by the Finding-2 test hardening (bans all send-gating verbs on flagged entries). |
| 4 | **§4.2 non-redundancy** — is `no_over_promise` (detection) correct + non-redundant with faithfulness? | **CONFIRM** against the REAL code — the real gatekeeper misses the implied-typicality sentence (its blockers are declared-claim mismatch, schema failure, explicit guardrail/leak/state patterns, not "stores like yours"); the faithfulness mock skips non-checkable generic hype; the domain mock catches `stores like yours` / `become … favorite` only in `no_over_promise`. | `lib/agents/gatekeeper.ts:52/76`, `lib/agents/semantic-judge.ts:177`, `lib/agents/domain-judge.ts:142/185`, `evals/replay.test.ts:118` | **CONCUR.** This is the discriminator I pre-registered (confirm the 3 demo assertions against the *real* gatekeeper + faithfulness code, not abstractly). Codex traced the real code and confirmed the seam. The "mirrors the already-reviewed faithfulness field" discharge was rejected up front; Codex evaluated the seam on its merits. **§4.2 owner decision stands, justified.** |

## Findings — primary-model-final disposition

**Finding 1 — P2 — `app/merchant/[id]/page.tsx` (Human-in-the-loop gate copy).** For a `domain_defective && simulated_sent` merchant, "Eligible **and clean** → simulated send recorded" reads as "all controls clean," contradicting the domain flag shown just above (§5).
- **Disposition: ACCEPTED + FIXED.** This is the legitimate, *advisory-consistent* form of the detect-then-send-anyway tension (surface the flag honestly to the human — NOT make the judge gate the send, which would violate AM-4). The copy now reads **"Eligible by the deterministic core → simulated send recorded,"** and when the draft is `domain_defective` an amber line is appended: *"The domain quality check above flagged this draft — advisory only; it does not change eligibility or the send."* Honest (eligibility is deterministic-core-decided, not "clean across all controls"), and it reinforces AM-4 on the public surface.

**Finding 2 — P3 — `evals/replay.test.ts:100` (audit-wording test).** The test banned only "reject" + required "advisory"; it would miss "advisory but blocked/gated/held."
- **Disposition: ACCEPTED + FIXED.** For a FLAGGED domain entry the test now also bans `reject|block|gate|hold|prevent`. Scoped to flagged entries deliberately — the SKIPPED-branch detail legitimately says "the gatekeeper blocked the draft" (a different, honest case; that entry is never `domain_defective`). Tightens the honest-advisory-wording invariant lock.

**Finding 3 — P3 — `evals/replay.test.ts:135` (§4.2 demo test).** The test called `mockDomainJudge()` directly while REPLAY wires `mockDomainJudgeResult()`.
- **Disposition: ACCEPTED + FIXED.** Now `mockDomainJudgeResult(hype, m).verdict` — exercises the exact function REPLAY wires. Behavior-preserving (verified: `domain-judge.ts:201` defines `mockDomainJudgeResult.verdict = mockDomainJudge(...)`), but guards against future drift between the two paths.

**Codex also independently checked + cleared (not findings):**
- `AuditEntrySchema` (`lib/agents/tools/schemas.ts`) is **ENFORCED, not cosmetic** — `appendAudit` parses input + output through it (`lib/agents/tools/audit.ts:19/34`). (This was my own open probe; resolved.)
- Section renumbering (5→8) on the detail page is **correct**; e2e covers the new "Domain quality check" section (`evals/e2e/console.spec.ts:35`).

**Codex did NOT issue the trap finding.** It did not push to make `domain_defective` gate the send (which would break the binding advisory invariant AM-4). All three findings are advisory-consistent. No design/forward note arguing against the advisory design was raised.

## Verification after the fixes (raw)

- **`npm run verify`** → `Test Files 22 passed | 4 skipped (26)`; `Tests 255 passed | 4 skipped (259)` (count unchanged — assertions hardened + one call swapped, no tests added/removed); typecheck clean; lint clean; `next build` prerenders **28 pages** (incl. all 20 merchant pages = render-smoke for the page.tsx change). exit 0.
- **`npm run test:e2e`** → **4 passed.** (Honest note: the FIRST e2e run had one flake — the "why-chain end to end" test failed at its `/console`→`/merchant` *navigation* step, `12 × unexpected value "…/console"`, a first-navigation hydration race; my edits touch neither `/console` nor routing, and the merchant pages prerender fine. Re-run was clean 4/4 in 13.6s. Diagnosed as a flake, not a regression.)
- **Codex sandbox note:** Codex (read-only) attempted `npm run test` itself but the read-only sandbox blocked Vitest's temp-dir creation (`EPERM`) — expected; its conclusions are from static repo evidence + the recorded green gate evidence. The green run above is the maker-side execution.

## Net

**B2 gate-2 (Codex cross-model) = CLEARED.** With the prior dated obligation discharged, the acceptance-gate's sole open gate (`gate-2026-06-26-b2-domain-shipgate.md` §1, "codex cross-model — not run for B2") is now closed → the B2 ship-gate is **fully discharged** (grill PASS · Codex SHIP · verify green + red-green · enterprise+taste PASS · anti-slop PASS). `lib/core` + oracle + gold + frozen calibration snapshot remain UNTOUCHED (differential 20/20). The reconciliation fixes are committed on top of `6ea0549`; **push stays owner-gated.**

**NEXT = A3** (split into the 4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter within the code-enforced $5 cap + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 decision). The §4.2 forward question (should a calibrated `domain_defective` eventually inform the hold, past the ~100 floor?) remains recorded, not buried.

---

## Appendix — Codex verdict, verbatim

```
VERDICT: SHIP

TARGETS:

1. CONFIRM. `domainJudge` is computed after `runCore()` and stored as a leaf field; `outreachStatus` is copied from `m.outreach_status`, and summary/send state read `outreachStatus` / `merchant.review_required`, not `domainJudge`. This protects a future live judge too if the future swap only changes the `DomainJudgeResult` source and does not mutate `Merchant`. Evidence: `lib/replay/run.ts:155`, `lib/replay/run.ts:168`, `lib/replay/run.ts:181`, `lib/replay/run.ts:193`; core send path: `lib/core/pipeline.ts:94`, `lib/core/pipeline.ts:259`.

2. CONFIRM, with one copy caveat in Findings. The Domain panel’s framing is explicit enough: it says both draft and verdict are deterministic `$0` REPLAY stubs, the high flag rate is expected from a minimal stub nudge, and live judge / real drafter are separate. Evidence: `app/merchant/[id]/page.tsx:209`, `app/merchant/[id]/page.tsx:220`, `app/merchant/[id]/page.tsx:238`.

3. CONFIRM. The domain audit entry says “advisory” and “does not change the send or eligibility”; the final system audit entry separately records `SIMULATED_SENT`, so it does not imply domain rejection/blocking. Evidence: `lib/replay/run.ts:123`, `lib/replay/run.ts:129`, `lib/replay/run.ts:140`.

4. CONFIRM. The real gatekeeper misses the implied-typicality sentence because its blockers are declared-claim mismatch, schema failure, explicit guardrail/leak/state patterns; the faithfulness mock skips non-checkable generic hype; the domain mock catches `stores like yours` / `become ... favorite` only in `no_over_promise`. Evidence: `lib/agents/gatekeeper.ts:52`, `lib/agents/gatekeeper.ts:76`, `lib/agents/semantic-judge.ts:177`, `lib/agents/domain-judge.ts:142`, `lib/agents/domain-judge.ts:185`, `evals/replay.test.ts:118`.

FINDINGS:

1. P2 `app/merchant/[id]/page.tsx:298` — For `domain_defective && simulated_sent` merchants, “Eligible and clean → simulated send recorded” can read as “all controls clean,” contradicting the immediately preceding domain flag. Minimal fix: change to “Eligible by deterministic core → simulated send recorded” or “Deterministically eligible → simulated send recorded; domain flag remains advisory.”

2. P3 `evals/replay.test.ts:100` — The audit wording test only bans “reject” and requires “advisory”; it would miss bad wording like “advisory but blocked/gated/held.” Minimal fix: assert the exact current phrase or ban `reject|block|gate|hold|prevent` for flagged domain entries.

3. P3 `evals/replay.test.ts:135` — The §4.2 test calls `mockDomainJudge()` directly, while REPLAY wires `mockDomainJudgeResult()`. Behavior is equivalent today (`lib/agents/domain-judge.ts:199`), but the test would be tighter if it used `mockDomainJudgeResult(hype, m).verdict`.

Checked: `AuditEntrySchema` is enforced, not cosmetic; `appendAudit` parses input and output through it (`lib/agents/tools/audit.ts:19`, `lib/agents/tools/audit.ts:34`). Section numbering is correct on the detail page and e2e coverage includes the new “Domain quality check” section (`app/merchant/[id]/page.tsx:209`, `app/merchant/[id]/page.tsx:253`, `app/merchant/[id]/page.tsx:279`, `app/merchant/[id]/page.tsx:310`, `evals/e2e/console.spec.ts:35`).

Validation note: I attempted `npm run test -- evals/replay.test.ts`, but the read-only sandbox blocked Vitest temp directory creation with `EPERM`. Review conclusion is from static repo evidence plus the recorded green gate evidence in `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`.
```
