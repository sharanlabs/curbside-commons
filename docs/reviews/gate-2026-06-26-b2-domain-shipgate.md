# Gate record — Track B2 (wire the domain-quality judge into the REPLAY ship-gate, tertiary advisory control)

**Date:** 2026-06-26 · **Scope:** B2 — wire the already-calibrated domain judge into the REPLAY ship-gate as the **tertiary, ADVISORY** control (order R-DARCH-4: gatekeeper → faithfulness → domain), `$0` deterministic mock in REPLAY, surfaced + audited like the faithfulness `judge` field. **COMMITTED as `6ea0549`** (owner GO 2026-06-26, on the test-verified basis below; push owner-gated). **`lib/core` + the differential oracle + the gold set + the frozen calibration snapshot UNTOUCHED.**

> **UPDATE 2026-06-26 — B2 COMMITTED `6ea0549`.** The owner approved the commit on the test-verified basis (gate-3 cleared + red-green; acceptance-gate non-blocking items addressed). The **Codex changed-files review + §4.2 cross-check (gate 2 below) remain the OPEN dated obligation** — to run on a fresh seat (~8:31 PM) before push, with the 4 targets in §2.
>
> **UPDATE 2026-06-26 (later) — GATE 2 (Codex) CLEARED; B2 SHIP-GATE FULLY DISCHARGED.** The dated obligation is discharged: the COMPLETE read-only Codex changed-files review + the §4.2 cross-check RAN on the reset seat (`gpt-5.5` @ `xhigh`, full run ~212.5k tokens, NOT seat-limited) → **VERDICT: SHIP**, all **4 targets CONFIRMED**, **3 findings (1 P2 + 2 P3)** all accepted + fixed + re-verified (`npm run verify` 255 + 4 green; e2e 4/4 — one first-navigation flake, clean on re-run). Codex also independently confirmed `AuditEntrySchema` is enforced (not cosmetic) and the section renumbering is correct, and did NOT push to break the advisory invariant. Full record + primary-model-final reconciliation: **`docs/reviews/codex-2026-06-26-b2-domain-shipgate.md`**. With gate 2 closed, the acceptance-gate's sole blocking gate (§1, "codex cross-model — not run for B2") is resolved → **the B2 ship-gate is fully discharged** (grill PASS · Codex SHIP · verify green + red-green · enterprise+taste · anti-slop). Fixes committed on top of `6ea0549`; push owner-gated. **NEXT = A3.**

Files: `lib/replay/run.ts` · `lib/agents/tools/schemas.ts` · `lib/agents/domain-judge.ts` (comment-only consistency fix) · `app/merchant/[id]/page.tsx` · `evals/replay.test.ts` · `evals/e2e/console.spec.ts`.

## 1. `acceptance-gate` (independent, read-only) → **BLOCK (procedural), reconciled**

Verdict: **BLOCK**, routed to execution — explicitly **NOT** because of a code defect. The gate found **no hard P0/P1**, judged the code to honor all five binding invariants on its read, and the advisor's independent adversarial pass agreed. It blocked solely on two *mandatory process gates* it could not see as cleared:

| Gate | Verdict (as returned) | Reconciliation (this session) |
| --- | --- | --- |
| grill | PASS (judge-probed) | advisory joints carried into the Codex targets |
| codex cross-model | **FAIL — not run for B2** ← driver | **PARTIAL → DATED OBLIGATION.** The gate had no visibility into the Codex run (launched after it). Codex *was* run (below): engaged substantively, surfaced **1 real finding (fixed)**, then hit the seat usage limit mid-review. The COMPLETE review + the §4.2 cross-check = a dated obligation. |
| verify | PENDING-HANDOFF (no `Bash`, evidence was described) | **CLEARED** — raw evidence + red-green pasted below (§3). |
| enterprise+taste | PASS | advisory invariant is STRUCTURALLY enforced (`run.ts` sets `outreachStatus` from `runCore` output, before/independent of any judge; the summary never reads `domainJudge`) |
| anti-slop | PASS | no new AI tells; comments load-bearing; em-dashes = established house style |

**Non-blocking items it raised — all addressed this session:**
- (a) **75% `domain_defective` rate on the public surface** ("does it read as the product condemning its own output?") → added an honest framing to the Merchant-Detail panel: *both* the draft and the verdict are deterministic `$0` stubs in REPLAY, so a minimal stub nudge often trips the engagement-fit check — the tertiary control working, not the product grading its real output down; the live judge and the real drafter are separate + key-gated.
- (b) **Audit wording** for a `simulated_sent` merchant (was "flagged for human review … does not block the send") → reworded to "domain quality flagged (advisory — surfaced for review; does not change the send or eligibility)." (Same as the Codex finding below.)
- (c) **"SECONDARY control" (`domain-judge.ts:2`) vs "tertiary" (`run.ts`/page)** → reconciled `domain-judge.ts` header to "TERTIARY control … (order R-DARCH-4)".

## 2. Codex cross-model changed-files review → **PARTIAL (1 finding fixed) → DATED OBLIGATION**

Seat smoke-tested ALIVE (`gpt-5.5 @ xhigh`, returned `SEAT_OK`). Ran a read-only adversarial changed-files review of the full diff + the §4.2 cross-check question (namespaced output, contamination-safe). Codex engaged substantively (~168k tokens; ran greps, read the parallel faithfulness test) and **surfaced one real finding** before the seat hit its usage limit:

> "The domain panel says a weak draft is **'never auto-sent,'** but the B2 test intentionally proves some domain-defective drafts remain `simulated_sent`."

**Primary-model-final disposition: ACCEPTED + FIXED.** The finding is correct — an *advisory* judge does NOT prevent the send; the 3 `domain_defective`-yet-`simulated_sent` merchants are the proof. "never auto-sent" wrongly implied the domain judge gates the send, contradicting the binding advisory invariant. Fixed: the panel now reads "the verdict is surfaced for the reviewer and recorded … but it never changes the send — eligibility and the human approval gate stay deterministic (a low-risk draft can still be simulated-sent even when flagged)."

Raw seat-limit error, surfaced verbatim (owner doctrine — no retry/downgrade/switch; the seat is an owner action):

```
ERROR: You've hit your usage limit. … try again at 8:31 PM.
```

**Disposition: Codex-down ≠ gate-waived.** The COMPLETE Codex changed-files review + the §4.2 consequential-recommendation cross-check are a **DATED OBLIGATION** (seat resets ~8:31 PM 2026-06-26), matching the project's established seat-blocked precedent (B1-offline, A1, A2). On re-run, give Codex these concrete targets (from the acceptance-gate's CODEX HANDOFF):
1. Does anything let `domain_defective` reach `outreachStatus`/eligibility/the send? (invariant 1 — now **red-green locked**, §3)
2. Is the 75% `domain_defective` demo rate honest/credible on the public REPLAY surface? (invariant 5 — framing added)
3. Is the audit wording misleading for a `simulated_sent` merchant? (reworded)
4. The §4.2 cross-check: is "keep `no_over_promise` as a gating dimension (detection) while the judge never gates the send" implemented correctly + non-redundant with faithfulness? **Now anchored by a demonstration** (§3, last bullet) — Codex should confirm/refute that proof rather than reason from scratch.
   Reject upfront the argument that mirroring the already-reviewed faithfulness field discharges this gate — it is per-slice and §4.2 is a fresh owner decision (2026-06-26).

## 3. Verify evidence (gate 3 — CLEARED, raw)

- **`npm run verify`** → `Test Files 22 passed | 4 skipped (26)`; `Tests 255 passed | 4 skipped (259)` (was 250); typecheck clean; lint clean; build 28 pages prerender (incl. all 20 merchant pages = render-smoke for the new panel). **exit 0.**
- **§4.2 non-redundancy DEMONSTRATED (not just retained)** — advisor caught that `no_over_promise` fires 0/20 in REPLAY, so the §4.2 headline was *asserted* (dimension present), not *exercised*. Added `evals/replay.test.ts` "§4.2 non-redundancy …": a grounded draft + appended implied-typicality prose ("stores like yours quickly become neighborhood favorites") where the **deterministic gatekeeper APPROVES** (typicality dodges the forbidden-claim guardrail) **AND the faithfulness judge PASSES** (the hype is not a checkable per-merchant fact — `isAssertion()` skips it, nothing to entail) **AND only `no_over_promise` FAILS** (`{matched:true, engagement:true, no_over_promise:false}`). That is the defense-in-depth seam §4.2 exists to close, proven across all three controls.
- **`npm run test:e2e`** → 4 passed (incl. the merchant why-chain test, which now also asserts the "Domain quality check" section).
- **Differential (invariant 4)** → `evals/core-differential.test.ts` + `evals/draft-oracle.test.ts` + `evals/tools-differential.test.ts` = **20/20 passed** → `lib/core` + the Python oracle parity UNCHANGED. `git diff --name-only` confirms no file under `lib/core/`, no `*.snapshot.json`, no `evals/gold/` changed.
- **Red-green proof for the advisory test** (the binding invariant AM-4 / R-LOOP-1b): mutated `run.ts` so `outreachStatus = domainJudge?.verdict.domain_defective ? "drafted" : m.outreach_status` → the "is ADVISORY" test went **RED** (`AssertionError: expected 0 to be greater than 0` at `evals/replay.test.ts:79`); restored → **GREEN** (8/8). A test that fails when (and only when) the invariant is violated.
- **Distribution probe:** 15/20 merchants are mock-`domain_defective` (driven by `engagement_appropriate` on ghosted/dormant merchants); **3 are `domain_defective` yet `simulated_sent`** (M003/M005/M017) — the non-vacuous advisory proof the test asserts.

## 4. Advisor (stronger reviewer, full-transcript)

Called before writing (orientation done). Sharpened the plan: (1) the binding invariant is *advisory — wiring must not change `outreachStatus`/eligibility*; build the snapshot and assert the **non-vacuous** "defective-yet-sent" form (done); (2) don't over-invest in the benign skip-to-null branch; (3) the ordering/renumber + the `approvedForHumanReview` gating are both correct as written. All folded in.

## Net

**B2 = test-verified + acceptance-gate-reconciled.** Gate 3 (verify) is fully cleared with raw + red-green evidence; the §4.2 non-redundancy is demonstrated; the acceptance-gate's non-blocking items are addressed; the one Codex finding is fixed primary-model-final. **The single open item is the COMPLETE Codex changed-files review + the §4.2 cross-check — a DATED OBLIGATION (seat ~8:31 PM); until it completes, the acceptance-gate verdict remains BLOCK by its own design, and a commit is the owner choosing to proceed test-verified with that gate named-open (NOT "gates passed").** Owner-gated next: commit-GO (RULES §12) on this test-verified basis (per the A1/A2 precedent), then the Codex re-run on a fresh seat before push. Then **A3** (the 4 bounded agents + Gemini Flash drafter ≤ $5 + cross-family judge; feed KB §4.2 into the Drafter per the §4.2 decision).

**Forward decision noted (the detect-then-send-anyway behavior).** B2 is the first slice where the advisory pattern is visible + common: 15/20 flagged `domain_defective`, 3 flagged-yet-`simulated_sent`. This is consistent with the existing design (the deterministic gatekeeper is the firewall; the LLM judges are advisory-into-the-human-gate) — not a B2 bug — but a viewer of the verification-rigor demo will see a control flag a draft and the system send it anyway. Open question, tied to the §4.2 forward-decision: *should a calibrated `domain_defective` eventually inform the hold (past the ~100 floor, R-DHON-1)?* Recorded, not buried; re-decide when the live domain judge is past directional.
