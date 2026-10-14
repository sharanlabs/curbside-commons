# sync-outage — a whole category goes stale after a sync outage

## The story

A sync outage stops the marketplace copy from refreshing. 6 rows in the Appetizers category last synced 36 hours before the record's as-of time, and their expiry stamps have lapsed. Behind the outage the merchant changed 2 prices and sold out 2 rows in the record. The copy still shows the old prices and still offers the sold-out rows. All data is synthetic.

## What the reviewer will see

- Verdict FAIL: 10 findings (4 errors, 6 warnings) over 24 feed rows.
- Rules that fire: LST-AVAIL-STATE ×2, LST-PRICE-VALUE ×2, LST-STALE-EXPIRED ×6.
- Every row in Appetizers is stale, and no other category is flagged.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

A Merchant-Ops analyst would sign a proposal to force a re-sync of the category; an Integrations manager would sign the ticket to the sync vendor. Signatures are ledger records, never platform actions; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report and the event evidence only.
