# The scenario library

**Plain-English:** each folder here is one small, labeled story about a menu going
wrong — a short brief a reviewer reads, the data behind it, and what the existing
checker says about it. Everything is **synthetic**: the merchant, the menu, the
statements and the events are invented, and nothing here claims access to, data
from, or an effect on any real platform or business.

**Professional register:** a freeze-locked, seeded scenario corpus
(plan of record: `docs/plan-menu-integrity-crew-2026-10-09.md` §9). Every input is
a deterministic transformation of the bundled `fixtures/synthetic-restaurant/`
corpus (read-only) and reuses the existing `AcpFeed` / `SyntheticCatalog` /
fee-statement shapes exactly (`modifier-drift` adds the menu model's `modifiers`
field; `spec-valid-lie` adds a UCP catalog answer built in the public UCP schema
shape). One input is platform-shaped: `injected-artifact` carries the same menu
twice, in the engine's feed form and shaped like a delivery platform's public
partner documentation (read 2026-10-31) — not from the platform, never called,
not affiliated — and its manifest names that shape in `"shapedLike"`. Every other
manifest says `"shapedLike": null`.

## The eight ids

The ids are spelled exactly as below, in the plan's order.

| # | id | Status | Pack | Story |
| --- | --- | --- | --- | --- |
| 1 | `agent-86` | built | listings | an agent order lands on an item the record has 86'd and the copy still shows |
| 2 | `modifier-drift` | built | listings | an add-on option repriced in the record is still served at its old price on the copy |
| 3 | `sync-outage` | built | listings | a whole category's rows go stale after a sync outage |
| 4 | `platform-override` | built | listings | a manual platform-side edit wins over the feed |
| 5 | `partner-onboarding` | built | listings | a new partner's feed with a chosen clean/drifted mix, scored by the verdict and by a partner scorecard |
| 6 | `spec-valid-lie` | built | listings | a UCP catalog answer that passes conformance and still states a wrong price |
| 7 | `fee-precheck` | built | fees | a draft fee statement pre-checked against NYC §20-563.3 for a platform's legal team |
| 8 | `injected-artifact` | built | listings | a planted instruction in a partner's menu tries to steer the crew; the tripwire hands it to a person |

Root-cause, impact, route and recorded turns arrive in S2 for every built id.

## The folder contract (every id)

```
fixtures/scenarios/<id>/
  brief.md          # Title · The story · What the reviewer will see · Which seats act · What a human signs · Not yet
  manifest.json     # simulated · shapedLike · seed · generator · engine (spec version, read from code) · figures
  inputs/
    feed.json       # the marketplace copy (AcpFeed)          — listings scenarios
    record.json     # the merchant record (SyntheticCatalog)  — listings scenarios
    ucp-response.json  # the UCP catalog answer (search_response shape) — spec-valid-lie
    platform-shaped.json  # the same menu, shaped like a public partner documentation — injected-artifact
    partner-ops.json   # a synthetic partner-operations record   — partner-onboarding
    statement.json  # the draft fee statement                 — fee-precheck
    events.jsonl    # {at, actor, action, target} evidence of what happened, in time order
  expected/
    report.json     # the existing engine's report on inputs/ — nothing else
    ucp-truth-report.json  # spec-valid-lie only: the same engine's truth leg on the UCP answer
    scorecard.json  # partner-onboarding only: the partner scorecard (each criterion cited)
    platform-report.json  # injected-artifact only: the engine on the platform-shaped menu
    README.md       # why nothing else is here
```

`turns/` (recorded model turns per seat) is part of the plan's contract and is
**absent** for now, like the rest of the S2 material.

## What is deliberately absent — root-cause, impact, route and turns arrive in S2

`expected/` holds the engine report only. The root-cause explanation, the impact
arithmetic, the routing decision and the recorded model turns **arrive in S2**;
they are left out rather than stubbed, so nothing here pretends to a result that
does not exist yet.

## How the figures in a brief are made

A brief's figures are `{{placeholders}}` in the generator
(`scripts-ts/generate-scenarios.mts`). The generator runs the **existing**
engine — the listings pack for scenarios 1 to 6 and 8 (for `spec-valid-lie`, its
truth leg on the UCP answer, plus the conformance check on the same document; for
`partner-onboarding`, also the partner scorecard over its report; for
`injected-artifact`, also the platform-shaped adapter on the same menu);
the existing fee audit for scenario 7 — and fills each placeholder from that run. No digit is typed in a
brief. `evals/packs/scenarios.test.ts` re-runs the engine on the committed inputs
by separate code, and fails if any figure, any brief, or any byte of any file
differs.

Where a story needs a finding the current rules cannot produce, the brief says
so and marks it "arrives in S1/S2": in `platform-override`, rewritten descriptions
are visible in the inputs but no current rule reads descriptions.

## `events.jsonl` is evidence, not a label

Each line is `{at, actor, action, target}` with `actor` in
`merchant · integrator · platform · unknown` and `action` in
`price_edit · 86 · un86 · sync · override`. It records **what happened and when**,
and never why: no event names the scenario or a cause, and the test fails if any
key or value equals the scenario id or contains the words "cause" or "root". It is
the input a later, deterministic explanation seat will read; the class of each
scenario stays the hidden label.

## Regenerate

```
node scripts-ts/generate-scenarios.mts     # rewrites the eight folders from their seeds (Node ≥ 24)
```

The test regenerates in memory and byte-compares every file; the committed file
set must equal the generated file set. The crew case that replays
`injected-artifact` lives in `evals/crew/cases-s3/`; after a regeneration that moves
its artifact, its digest is re-stamped there.

## Honesty box

- All data is synthetic; the merchant, items, prices, orders and events are invented.
- Statements are simulated; the cap table they are audited against is real, codified
  law (NYC Administrative Code §20-563.3, as amended by Local Law 79 of 2025; sources
  and read dates in `docs/research/ll79-source-memo.md`, as of 2026-07-03) — a
  pre-check, not legal advice.
- No claim of real platform access, real drift rates, or real business impact.
- A platform-shaped input mirrors field names from public partner documentation only
  (read 2026-10-31); its values are invented, and nothing was obtained from, sent to,
  or checked with any platform.
- Human-led, AI-assisted, professionally reviewed.
