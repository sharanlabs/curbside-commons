# fee-precheck — a draft fee statement, checked before it is issued

## The story

A platform's legal team runs a compliance pre-check on a draft monthly fee statement for a synthetic merchant, before the statement is issued. The draft covers 7 orders and 22 fee lines. The codified fee caps in NYC §20-563.3 are the rulebook, so a line can be corrected while it is still a draft. The statement and the merchant are simulated, the law is real, and this is not legal advice.

## What the reviewer will see

- Verdict FAIL: 3 findings over 22 fee lines on 7 orders.
- 2 violations, 1 asserted pass-through (unverified, not counted as a violation), 0 conditional, 0 cured.
- Rules that fire: NYC-563.3-c-1 ×1, NYC-563.3-c-2 ×1, NYC-563.3-d-1 ×1.
- 2 findings depend on the still-open purchase-price base (U1) and are marked provisional; none is stated as final.

## Which seats act

- Audit (deterministic) runs the fee audit on the draft statement.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

A Compliance or Legal analyst would sign off on the corrected draft, or escalate it. The pre-check computes no penalties and files nothing; a signature is a ledger record, never an action on anyone's behalf.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report and the event evidence only.
