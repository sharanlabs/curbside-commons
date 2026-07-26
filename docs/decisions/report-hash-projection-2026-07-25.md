# Lane (b) — should the crew hash a NORMALIZED PROJECTION of the fee report?

**Decided 2026-07-25** · analysis + recommendation · owner call recorded at the end.

## The question, and where it came from

Session 33 tried to add a numeric pass-rate to the fee email, which required a
`reviewedLineCount` field on `FeeAuditReport`. It hit the L-1 floor gate: the new field
changes the engine report hash, and the pre-registered, owner-armed held-out L-1 cases
**pin** that hash in `expectedEngineReportHash`. Landing it would have meant rewriting
pinned values inside a frozen exam. The feature was reverted per the pre-committed stop
condition.

So: should the crew hash a *normalized projection* of the report — a stable subset — so the
report can be enriched without re-arming the exam?

## What the mechanism actually is

```
lib/crew/orchestrator.ts:57   reportHash = sha256(canonical)        // the WHOLE serialization
evals/crew/harness.ts:85      record.engineReportHash !== crewCase.expectedEngineReportHash → fail
```

The hash covers every byte of the canonical. Any additive field — even one no crew
expectation reads — invalidates every pinned case.

## The tradeoff, stated honestly

**For a projection:** the report becomes extensible. Today an additive, display-only field
is blocked by an exam that does not examine it, which is a real coupling defect: the
tamper-lock is enforcing more than it means to.

**Against:** a normalized hash covers less, so more can change undetected. This lock exists
because the crew is the surface where a *model* touches engine output; its job is to prove
the deterministic report the human sees is byte-for-byte the one the engine produced. Every
field dropped from the projection is a field a future bug — or a tampered artifact — could
alter with the lock still green.

## Recommendation: **NO — do not narrow the hash. Fix the coupling elsewhere.**

Three reasons, in order of weight.

**1. The projection solves the wrong problem.** The pain was "I could not add a display
field without re-arming an exam." But the exam pins the hash *because* the hash is total.
Narrowing it to make enrichment convenient trades a security property for an ergonomics
one — and the security property is this project's entire claim. Note what the project
already did when it faced this exact choice: on 2026-07-24 it **reverted a whole feature
rather than re-pin the hashes**, on the grounds that doing so would retroactively move a
bar that never moves after the run. Narrowing the hash is the same move wearing better
clothes: it does not re-pin the bar, it makes the bar smaller.

**2. "Normalized projection" has no stable definition here, which is the tell.** To build
one you must enumerate the fields the lock should cover. Every such list is a judgment made
*today* about what a future attacker or bug will target — and it will be wrong in the
direction of convenience, because the list gets edited whenever it blocks something.
`verdictTally` is load-bearing. `classification` is load-bearing. Is
`assumedPurchasePriceBase`? It changes the arithmetic's meaning, so yes. Is
`reviewedLineCount`? Today it is display-only; the moment a UI derives a pass-rate from it,
it is load-bearing and outside the lock. **A lock whose scope is a maintained list decays;
a lock over the whole artifact cannot.**

**3. The blocked case was not actually worth it.** The feature was a numeric pass-rate in an
email. The count-free PASS wording ships and is honest. The coupling cost a nice-to-have,
which is the system working — a pre-registration that never blocks anything is not a
pre-registration.

## What to do instead — the actual fix for the coupling

The real defect is that **an exam of crew behavior is coupled to the full serialization of
an engine artifact.** Two clean options, both preserving total hashing:

- **(i) Version the report shape.** An enrichment bumps `specVersion`; L-1 cases pin
  `(specVersion, hash)`. A shape change then becomes an explicit, visible re-arming event
  with its own record — which is what it *is* — rather than a silent hash edit. This is the
  recommended path: it makes the cost honest instead of removing it.
- **(ii) Separate the display layer from the engine artifact.** A pass-rate is a *view*
  concern. Derive it in the delivery builder from `findings` + the statement, and the engine
  report never changes. This would have unblocked the original feature entirely, at zero
  cost to the lock.

**Option (ii) is the one that should have been taken in session 33**, and it remains
available. It is recorded here so the next attempt reaches for it first.

## Status

**No code change.** The coupling is real but the proposed remedy is worse than the disease;
the two better remedies are written down. Re-open only if a genuinely load-bearing field —
not a display convenience — is blocked by the same wall.
