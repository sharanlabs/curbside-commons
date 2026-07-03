# Codex M1 batched review — the whole wedge module (W1 + W1-gate + W2 + W3)

**Gate:** the M1 module-boundary cross-model review (plan §5 gate policy S-4; the W1 acceptance-gate record `gate-2026-07-03-w1-wedge.md` made its SHIP **conditional on this review** — this is that named leg). **Seat:** smoke-tested `SEAT_OK`; run read-only via `~/claude-os/bin/codex-guarded` (config default `gpt-5.5` @ `xhigh`); ~2.77M seat tokens. **Scope:** commits `5a81440` (W1) · `08c9299` (W1-gate fixes) · `1d0697e` (W2) · `54124ff` (W3), i.e. `da1e2e7..HEAD` minus state docs. **Raw verdict:** `codex-2026-07-03-m1-wedge-batch-raw.md`. **Date:** 2026-07-03.

▸ *Plain: the independent reviewer from a different AI vendor read the whole verifier module end to end. It confirmed every core claim — and still found one serious command-line bug plus six smaller truth-and-testing gaps. We accepted all seven, fixed all seven the same session, and proved each fix with a failing-then-passing test.*

## Verdict + confirmations

**VERDICT: BLOCK — 1 P1 + 4 P2 + 2 P3.** Explicitly **CONFIRMED** in the same pass: all six W1 engineering claims (C1 exit contract · C2 guard `makeFinding`/`buildReport` · C3 one-comparator/two-adapters · C6 class-level 8/8 · C10 labeling · the conformance-vs-truth headline `conformant-but-false.json`). Codex noted it could not execute the full suite in its read-only sandbox; verification of the fixes below was executed on the Fable seat and is recorded in `m1-reconcile-evidence.log` + the RG runs cited per row.

## Reconciliation — primary-model-final (Fable seat). ALL SEVEN ACCEPTED + FIXED.

| # | Finding (Codex) | Empirical check | Fix (finding → fix mapping) | Proof |
| --- | --- | --- | --- | --- |
| P1 | `--conformance` wins over `--against`: mixed-mode silently skips the truth leg — poison, since the headline exhibit passes conformance while lying | Reproduced: mixed invocation exited **0** | `bin/check.mjs`: the two legs are mutually exclusive — mixed mode exits **2** loudly; regression uses `conformant-but-false.json` + `--against sor` | RED (exit 0 pre-fix) → GREEN; `cli-c1.test.ts` "MIXED MODE" (16/16) |
| P2-a | drift-013 labeled `acp-only` while its shared `availability` flip visibly drifts the UCP report (`LST-AVAIL-STATE @ item-004-v1`) — the C3 answer key lied | Reproduced: UCP golden carries the finding; manifest had no ucp-visible entry for it | ROOT fix: manifest entry split — `drift-013` (staleness, acp-only) + `drift-013b` (availability, both, `sameMutationAs`); fixtures regenerated (**only `drift-manifest.json` bytes changed**; feeds + golden reports byte-identical). NEW answer-key **completeness invariant**: every finding on each surface must be explained by a manifest entry labeled for that surface | Executed RED on the old generator failed on exactly the reported finding, BOTH surfaces → GREEN 21/21 (`listings-differential-c3.test.ts`) |
| P2-b | C6 "8/8 caught" is class-level only — a same-class false positive could mask a missed planted row | Confirmed by reading the eval | Per-ENTRY teeth added: every manifest entry must be caught by class AND row on ≥1 of its labeled surfaces (the class tally is now the compressed summary of this) | `listings-coverage-c6.test.ts` per-ENTRY test, green over all 16 effects |
| P2-c | Report view renders the claim without `claim.source` — weaker receipt when surfaces share field paths | Confirmed | `ReportView.tsx` claim receipt now shows the source; view transform locked (verbatim + non-empty) | Mutation RED (blank source → fail) → GREEN 9/9 (`report-view-c1.test.ts`) |
| P2-d | "exactly ONE named schema rule" corpus promise unenforced (`.toContain` passes on extra classes) | Verified the promise EMPIRICALLY TRUE for all 21 invalid fixtures first | Assertion strengthened: distinct observed ruleId set must EQUAL the declared class | `ucp-conformance.test.ts` strengthened test green ×21 |
| P3-a | Report copy's "no AI" phrasing near the forbidden claim class; C10 scan didn't cover the report files | Confirmed | Wording made precise ("no AI calls in this verifier runtime" / "No language model runs in this verifier"); `ReportView.tsx` + `app/report/page.tsx` added to the C10 grep-gate | `honesty-c10.test.ts` green incl. the new files |
| P3-b | Surplus positionals silently ignored | Reproduced | Exactly ONE input file enforced; surplus exits 2 | RED → GREEN with P1 (`cli-c1.test.ts`) |

**Post-reconciliation gate (live, Fable seat):** `npm run verify` **EXIT 0 — 514 passed + 5 skipped** (+8 over W3's 506); `npm run test:legacy` **306 + 5 unchanged**; frozen goldens and exit-code contract untouched.

## frontier-advisor consult (commitment boundary — the 2026-07-03 routing doctrine's advisor lane, first successful consult after 8 sessions of `advisor` unavailability)

Verdict **PROCEED** with two directives, both honored: (1) the confirming Codex pass runs against THIS finding→fix mapping, not a cold diff; (2) **known limit recorded:** the reworked anti-stacking guard counts distinct mutations via `sameMutationAs` — nothing machine-checks that a companion entry describes the *same physical patch* as its parent, so a future genuine second mutation mislabeled as a companion would pass the guard. Both current entries verified honest; this is a documented guard limit, not a defect. Also noted: the completeness invariant's spec-version-skew carve-out is backstopped by the byte-frozen UCP golden + the ucpVersionSkew freeze test (defense-in-depth holds); optional tightening logged as follow-up.

## Confirming pass

See the CONFIRMING PASS section appended below the reconciliation (same seat, mapped to the seven rows above).
