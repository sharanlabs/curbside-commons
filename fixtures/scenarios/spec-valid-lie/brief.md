# spec-valid-lie — a catalog answer that passes conformance and still states a wrong price

## The story

A synthetic merchant's catalog answer, written in the public UCP schema shape, is checked twice. Against the pinned UCP schemas it is well formed: conformance pass, 0 schema findings, and it passes every vendored schema version (2026-04-08, 2026-08-25). Against the merchant record it is wrong: 2 rows state a price the record does not have, and Truffle Fries (Small) is answered at $8.00 while the record says $6.00. A document can be valid and still untrue; the two checks answer different questions.

## What the reviewer will see

- Conformance pass: 0 findings against the pinned schemas, UCP version 2026-04-08.
- Truth verdict FAIL: 2 findings (2 errors, 0 warnings) over 24 answered rows.
- Rules that fire: LST-PRICE-VALUE ×2.
- The feed the answer was built from: 2 findings (LST-PRICE-VALUE ×2) on the same rows — one comparator, two surfaces.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

An Integrations manager would sign a proposal to correct the responder's prices before an agent relies on them. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report, the conformance verdict and the event evidence only.
