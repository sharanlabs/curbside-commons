# modifier-drift — an add-on is repriced in the record, not on the copy

## The story

On this synthetic menu the merchant reprices 2 add-on options in the record to +$1.50. The marketplace copy last synced before the change, so it still charges +$2.00 for them, on every size of the 2 items that carry them. An order with one of those add-ons is charged more than the merchant asked. The record is right and the copy is stale. The audit names each row and option, with the record's own option price as the receipt.

## What the reviewer will see

- Verdict FAIL: 5 findings (5 errors, 0 warnings) over 24 feed rows.
- Rules that fire: LST-MOD-PRICE-VALUE ×5 — the copy's add-on price is not the record's.
- Options affected: Almond (Milk), Avocado (Add-ons); rows affected: 5.
- No base price, availability or name is flagged.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

A Merchant-Ops analyst would sign a proposal to re-sync the modifier lists of the affected items. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact (the orders those add-ons touched) and routing arrive in S2; this folder holds the engine report and the event evidence only.
