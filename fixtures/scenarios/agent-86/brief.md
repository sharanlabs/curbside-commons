# agent-86 — an agent order lands on an item the kitchen has 86'd

## The story

On this synthetic menu the kitchen marks 3 items sold out in the merchant record. The marketplace copy never hears about it and keeps offering them. An agent order arrives for Margherita Pizza (Small) at $19.00, placed against the copy, and the kitchen cannot make it. The record is right and the copy is stale. The audit shows exactly which rows still say "in stock", with the record's own row as the receipt.

## What the reviewer will see

- Verdict FAIL: 6 findings (6 errors, 0 warnings) over 24 feed rows.
- Rules that fire: LST-AVAIL-STATE ×6 — the record says sold out, the copy says in stock.
- The agent order's row is item-005-v1; its receipt quotes both sides.
- No other row is flagged.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

A Merchant-Ops analyst would sign a proposal to hold the affected rows on the agent surface or to ask for a re-sync. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report and the event evidence only.
