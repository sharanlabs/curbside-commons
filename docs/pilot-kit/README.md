# Pilot kit — the documents a platform team is handed

**Type:** how-to + index · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** `docs/plan-menu-integrity-crew-2026-10-09.md` §§ 6, 7, 17 as amended by `docs/plan-wave2-gap-sheet-2026-10-12.md` and decision D-7(a). `RULES.md` wins. · **Corrected:** 2026-10-31, Wave 2 / exec-layer (status rows refreshed after Wave 1 merged; the executive brief, the five-minute walk and `/pilot` added).

## The answer first

This kit describes a **six-week pilot on the labeled scenario library** (replay by default; owner-armed live model turns use synthetic data only). This project never holds, receives or renders real platform data. Everything on our side is synthetic. **Running the tool on a platform's own data would be a separate future decision**, with its own data boundary and security assessment, and is not part of this pilot.

*In plain words:* we bring invented merchants and invented menu drift so a team can watch the whole workflow work for six weeks. Whether the tool ever runs on real platform data is decided later, outside this pilot.

## What this kit is not claiming

- **Synthetic, always, on our side.** The merchants, menus, orders and fee statements are invented and labeled.
- **"Shaped like the public integration docs, not from the platform."** Platform names are nominative references to public documentation; no logo is used.
- **No affiliation, partnership, endorsement, access or real-world impact is claimed or implied.** No number in this kit is a measurement of any platform.
- **Prototype, run on demand.** It is not a hosted service and has no uptime promise.
- **Not built yet:** items marked **ARRIVES S\<n\>** are plan items, not capabilities. Each document says which is which.
- Human-led, AI-assisted, professionally reviewed (`RULES.md` §4). Contact data in the project is fake by rule.

## Who reads what

| Reader | Start with | Then |
| --- | --- | --- |
| **Executive sponsor** | [`executive-brief.md`](executive-brief.md) and the site's `/pilot` page | [`five-minute-walk.md`](five-minute-walk.md) · [`pilot-proposal.md`](pilot-proposal.md) |
| **Procurement** | [`pilot-proposal.md`](pilot-proposal.md) | [`success-metrics.md`](success-metrics.md) |
| **Risk, security, privacy** | [`security-one-pager.md`](security-one-pager.md) | [`../governance-model.md`](../governance-model.md) · [`../model-risk-register.md`](../model-risk-register.md) · [`data-request-spec.md`](data-request-spec.md) |
| **Operations (merchant-ops, integrations)** | [`demo-script-10min.md`](demo-script-10min.md) | [`data-request-spec.md`](data-request-spec.md) · [`pilot-proposal.md`](pilot-proposal.md) |
| **Compliance / legal** | [`../governance-model.md`](../governance-model.md) | [`security-one-pager.md`](security-one-pager.md) |

## The documents

| File | What it is | Type |
| --- | --- | --- |
| [`executive-brief.md`](executive-brief.md) | One page for an executive sponsor: what breaks today, what the crew is designed to do, cost, governance, the one number measured later | explanation |
| [`five-minute-walk.md`](five-minute-walk.md) | A five-minute walk of the live site for an executive, with the honest line for each beat | how-to |
| `/pilot` (a page on the site, outside the navigation) | The delivery point, the cost model with every figure derived in `lib/landing/pilot-figures.ts`, governance tiers, the scenario library's state | reference |
| [`pilot-proposal.md`](pilot-proposal.md) | Use case, pain with dated sources, scope, phases, cost-benefit model (illustrative), exit criteria | explanation |
| [`data-request-spec.md`](data-request-spec.md) | What a platform's operator prepares for its own run: fields, classification, what is never needed, retention | reference |
| [`security-one-pager.md`](security-one-pager.md) | The three-mode data path, sub-processors, controls and the evidence for each, known gaps | reference |
| [`success-metrics.md`](success-metrics.md) | Pre-registered metrics; every floor reads "TBD at pilot start — set before the first run" | reference |
| [`demo-script-10min.md`](demo-script-10min.md) | A ten-minute walkthrough that uses only paths that exist today | how-to |
| [`../governance-model.md`](../governance-model.md) | Decision rights, crew roster, action tiers 0–3, control register, RACI, NIST crosswalk | explanation + reference |
| [`../model-risk-register.md`](../model-risk-register.md) | Which seat has sat its exam on which model | reference |

## What exists today, and what does not

| Item | Today |
| --- | --- |
| Live site: the six-station walkthrough, the bundled pair, the spreadsheet template, `/docs#test-it` | **Exists** (production serves slice S3, verified 2026-10-09) |
| Engine, receipts, Slack and email builders (built, not sent), fee audit, intake and reviewer seats, signed-approval simulator | **Exists** |
| Scenario library: five folders (synthetic inputs and the engine's report) | **Exists** (Wave 1); scenarios 2 and 6 ARRIVE S1.5 (in progress); scenario 8 ARRIVES S3 |
| Modifier checks in the listings engine (option price, missing option, hours window) | **Exists** (S1) |
| `/pilot` page | In the build from Wave 2; reaches the live site at the next deploy (deferred by owner word, 2026-10-31) |
| Scenario picker on the site | ARRIVES S4 |
| Impact arithmetic (`lib/impact`), run-ledger library (`lib/ledger`) | **MERGED on `main` 2026-10-31**; not yet wired into a crew run |
| Explain-drift, route table, and a crew run that sizes, routes and records | ARRIVES S2 (in progress) |
| Platform-shaped adapters, id-mapping sheet, ingest allow-list | ARRIVES S3 |
| Partner-ticket builder | ARRIVES S4 |
| Root-cause LLM exam, provider canary, local-model smoke run | ARRIVES S5 |

## Rules for editing this kit

- **No typed figure that the repo derives.** The bundled tally lives in `lib/landing/test-guide.ts` and is held equal to an engine run by `evals/packs/test-guide.test.ts`; documents here point to those, they do not retype them.
- **Every figure is either cited with a date or labeled an assumption.** The cost-benefit fill is labeled ILLUSTRATIVE.
- **Every file is named in the C10 honesty scan** (`evals/packs/honesty-c10.test.ts`, the explicit `pilotDocs` list). A new kit document must be added to that list by hand; the scan never uses a directory glob.
- **Free-only.** Only free tiers and free local models are named (decision 2026-10-12).
- **United States only.** No non-US legal frame appears in any document.
