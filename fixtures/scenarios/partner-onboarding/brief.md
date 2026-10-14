# partner-onboarding — a new integration partner's feed, scored

## The story

A new integration partner sends its first feed for this synthetic merchant. The reviewer wants one honest number before the partner goes live: how much of the feed matches the merchant's record. Of 24 rows, 18 match exactly and 6 drift, some on price, some on availability, some on name. The existing verdict scores it, and the reviewer sets the pass line.

## What the reviewer will see

- Verdict FAIL: 6 findings (6 errors, 0 warnings) over 24 feed rows.
- Clean rows: 18 of 24 (75.0%); drifted rows: 6.
- Rules that fire: LST-AVAIL-STATE ×2, LST-IDENT-NAME ×2, LST-PRICE-VALUE ×2.
- The verdict is the engine's own: PASS only with zero findings. Any pass line is the reviewer's to set.

## Which seats act

- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

An Integrations or Partnerships manager would sign the go-live or hold decision for the partner. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; scoring against published partner criteria arrives in S3.
