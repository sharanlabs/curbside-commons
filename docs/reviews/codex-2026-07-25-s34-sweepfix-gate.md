# Codex cross-model gate — the capability-sweep fix batch — 2026-07-25

**Seat:** `gpt-5.6-terra` @ `high` (deliberately not `xhigh` — the earlier xhigh run on this seat
blew the 10-minute wall clock and returned 0 bytes on stdout). Via `bin/codex-guarded`, read-only,
synchronous. **Scope:** 22,938 bytes — the full diff of the 5 sweep fixes plus the context a
reviewer cannot infer from a diff. Completed cleanly, 2,936 bytes of verdict.

## Verdict: 2 findings — 1 MEDIUM CONFIRMED (a real flaw in my reasoning), 1 LOW CONFIRMED

Both re-verified locally by execution before any code changed.

### MEDIUM — #3 did not make the mislabel unrepresentable. **CONFIRMED.**

My fix narrowed `buildEmailReportHtml` to refuse non-fee canonicals, and I wrote that this made the
mislabel "unrepresentable." **The gate checked the claim rather than the intent and found it false.**
I gated on `meta.tool` — which is CALLER-SUPPLIED and therefore forgeable. The canonical carries no
tool field at all; provenance lives on the `ToolResult` envelope the builder discards.

Reproduced exactly:

```
buildEmailReportHtml(<real check_feed canonical>, { tool: "audit_statement", … })
→ CONFIRMED — bypass renders: ["Simulated fee audit","No fee lines in this simulated statement"]
```

**The original defect remained reachable through a metadata mismatch.** The claim was stronger than
the code — the same failure shape as the injection-scan work earlier in this session: *a check that
trusts a label instead of the payload is a check you can walk around.*

**Fix:** the guard now reads the canonical's INTRINSIC SHAPE, which a caller cannot fake — a
fee-audit report carries `classification` + `assumedPurchasePriceBase` + `verdictTally`; a
feed/conformance report carries `matchingMode` and none of those. `meta.tool` is still checked, but
only as a cheap consistency assertion; the guarantee no longer rests on it. Both directions are
pinned (`#3b`): a feed payload laundered with a fee label is refused, and a fee payload with a feed
label is refused as a provenance contradiction.

The gate also correctly noted **no current caller was broken** — the only non-test HTML caller is the
Resend one-shot, which passes `audit_statement`.

### LOW — #5's source gate is unsound and the wrong instrument. **CONFIRMED.**

My copy-standard check scanned SOURCE with a comment-stripping regex. The gate showed it is unsound
in both directions: it falsely PASSES `const c = "/* (s) */"` (the stripper deletes quoted content),
it cannot see `"(" + "s)"` which renders the literal without containing it, and it would falsely FAIL
on an internal `throw new Error("no (s) copy")` that never reaches an inbox.

The deeper point is the right one: **a copy standard is a claim about OUTPUT, so the proof must read
output.** Rewritten to render every email surface (text / html / eml) at both plural arities, assert
on the rendered bodies and the committed goldens, and carry a positive control proving the assertion
is not vacuous.

## Requested risks — the gate's dispositions, all accepted

| Risk | Disposition |
| --- | --- |
| #2 — can any Slack test reach the network? | **No path found.** The gate EXECUTED the non-Slack-host case: exits `2` after local URL parsing, before report construction and before the sole `fetch`. "Not theoretical in the current code." |
| #4 — does the synthetic payload exercise the real truncation branch? | **Genuine, not degenerate.** 26 validated findings enter the builder; output carries the explicit "6 more" row and finding 19 but not finding 20. |
| #6 — is "comment, do not fix" defensible? | **Defensible.** For integer counts `>= 20` is exactly equivalent to `> 19`; the historical result is unaffected and the runner is env-skipped. No current defect; the forward-copy risk is real and now explicitly documented with the correct retry-runner reference. |
| #3 — is throwing the right direction? | Yes — "but only if tied to the registry result rather than forgeable metadata." Acted on above. |

## Harness note

The gate could not run focused Vitest: the read-only sandbox blocks Vitest's temporary SSR directory
creation. It compensated with direct executable checks, which is why its findings arrived with
executed proofs rather than assertions — the right adaptation, recorded because a future run will hit
the same wall.

## Disposition

Both findings fixed and pinned. Full verify **exit 0 — 1434 passed + 8 skipped**. The forged-metadata
bypass now throws where it previously rendered, verified by re-running the exact reproduction.

**Pattern worth carrying:** this is the third consecutive cross-model gate this session to return a
valid finding — on the original defect, on the fix, and now on the fix batch. Each time the finding
was about a claim being broader than the code that backed it.
