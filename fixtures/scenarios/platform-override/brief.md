# platform-override — a portal edit wins over the feed

## The story

In this scenario a manual edit made on the platform side wins over the integration feed (the scenario's premise, not a claim about any real platform). 6 items were edited by hand 48 hours before the record's as-of time. The record has moved on since, but the copy keeps the hand-edited values: 6 rows carry a different name, 4 rows are switched off while the record says in stock, and 4 rows carry a rewritten description. All data is synthetic.

## What the reviewer will see

- Verdict FAIL: 10 findings (10 errors, 0 warnings) over 24 feed rows.
- Rules that fire: LST-AVAIL-STATE ×4, LST-IDENT-NAME ×6.
- The 4 rewritten descriptions are visible in the inputs, but no current rule reads descriptions; that finding arrives in S1/S2.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

An Integrations manager would sign a proposal asking the platform to clear the manual overrides, so that the feed values apply again. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report and the event evidence only.
