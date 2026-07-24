# Curbside Commons

**An independent, deterministic verifier for agentic commerce: it checks what delivery platforms and AI-agent surfaces *say* about a merchant against the merchant's own system of record, and audits fee statements against codified law.**

A **human-led, AI-assisted** prototype, built and reviewed under a dual-model engineering process. The load-bearing claims in this file are backed by committed tests or records in this repo, each stated with its measure and date — declared claims, individually evidenced; this is not a blanket claim that every sentence of prose has machine coverage.

Built and directed by **Sharan Kumar** ([github.com/sharanlabs](https://github.com/sharanlabs)) — how the two-model process actually worked, in plain language: [docs/HOW-THIS-WAS-BUILT.md](docs/HOW-THIS-WAS-BUILT.md). Security posture: [SECURITY.md](SECURITY.md).

> **Not affiliated with, endorsed by, or connected to** DoorDash, Uber Eats, Grubhub, Square, Toast, OpenAI, Stripe, Google, or any named business or protocol body. This is an independent, company-agnostic prototype. **The truth-audit engine runs entirely on a labeled synthetic corpus** — no real merchant relationship, account, data, or PII anywhere, and no real business-impact claims. All metrics are simulated or measured on synthetic fixtures, and every artifact says so on its face. (The archived legacy module's data provenance is scoped separately — see [Lineage](#lineage).)

## Try it in 60 seconds

```bash
npm ci
node bin/check.mjs demo                                          # the scripted walkthrough, $0, zero-config
node bin/check.mjs check <feed.json> --against <catalog.json>    # truth leg (exit 1 = drift found)
node bin/check.mjs check <doc.json> --conformance                # conformance leg (pinned UCP schemas)
node bin/check.mjs fees <statement.json>                         # NYC §20-563.3 fee audit
npm run verify                                                   # typecheck + lint + tests + build
```

The demo plays one scripted scene: "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch." Every verdict in the transcript is computed by the real verifier, never narrated — labeled *spec-faithful demonstration actor — simulated* throughout.

<img src="docs/assets/demo.svg" alt="Captured terminal run of node bin/check.mjs demo: the agent trusts a spec-valid feed, the verifier flags the price drift with claim/rule receipts. Simulated data." width="100%">

*The image above is the demo's real captured output — rendered line-for-line by [`scripts-ts/render-demo-svg.mts`](scripts-ts/render-demo-svg.mts) from a live `node bin/check.mjs demo` run, never staged. Regenerate any time: `node scripts-ts/render-demo-svg.mts`.*

Zero network and zero LLM calls on every CLI path — enforced structurally by an import-graph eval, not by promise. A desktop site (`npm run dev`) tells the same story as one continuing case across four numbered chapters — `/report` (the listings audit), `/fees` (the NYC fee audit), `/playground` (the in-browser bench, the real engine running locally), `/proof` (the instrument's logbook: every evaluation, misses kept in) — with the reference layer at `/docs`.

## The evals harness is the product's character

These are the measurement rules the repo's labels live under — every labeled claim in the status table below earned its wording through them:

- **Pre-registered floors, in git, before any live run.** The LLM classifier's pass bars were committed before its exam; floors only ever tighten pre-run and never move after results. The first run (2026-07-05) scored 20/21 and missed one per-class recall floor — so its label honestly read **DEFERRED**, and that record stands unedited. Earning the label took a second owner-authorized exam on a **fresh pre-registered held-out split** (the first split was exposed and never re-scored): **21/21, every floor cleared (2026-07-09)**. The bar never moved in either run.
- **Eval-locks.** Every live run's raw results are frozen into the repo, and committed lock tests recompute the headline numbers from the per-item records forever — the grade cannot be quietly edited, and "just run it again" cannot replace what happened.
- **Anti-theater floors.** The fee classifier's label required **beating** a pinned deterministic keyword baseline on held-out gold (ties lose); the agent labels required clearing pre-registered per-member safety and class-match floors on an owner-armed live run. Each label names the exact bar it cleared — none is earned by adjective.
- **Scale, stated plainly.** These gold sets are deliberately small (n=21 statement lines, n=20 crew scenarios, n=35 conformance-corpus documents) — smoke-scale instruments a solo prototype can hold to a pre-registered standard, not statistical power over real-world distributions. What the discipline buys at this scale is integrity, not generality: bars fixed before the run, splits burned after one scoring pass, misses kept on the record. Every label's wording is scoped to its own n, and none claims field performance.
- **Structural $0 enforcement.** Import-graph evals prove the CLI, demo, delivery builders, and web views cannot reach an LLM or the network — not a promise, a failing test.
- **Frozen corpus and goldens.** Fixtures are seeded and freeze-locked (regenerate ⇒ bytes must match); reports byte-compare against goldens.

## The problem, in plain words

When you order food through an app, or tell an AI assistant to do it, the menu being acted on is **not the restaurant's actual menu**. It is a copy, passed along a chain: the merchant's till system → sync software → marketplaces → and now AI agents. Copies go stale: the price went up and the copy didn't, the wings sold out an hour ago, a fee got renamed on a payout statement.

A human shrugs at a stale menu. **An AI agent doesn't shrug — it places the order.** And every seat in that chain has a conflict of interest: platforms won't audit each other, sync vendors would be grading their own homework, and it isn't the AI companies' job. A credible referee has to sit outside all of those incentives — verifying claims against the merchant's own system of record rather than against another copy. That mechanism, applied with measurement rigor, is what this prototype demonstrates (others work on adjacent trust problems; the differentiation claimed here is the mechanism and the discipline, not exclusivity).

1. **Truth leg** — compare a published feed (an ACP-style feed, or a UCP catalog response) line by line against the merchant's system of record. Deterministic. No LLM anywhere on this path.
2. **Conformance leg** — validate a UCP catalog response against the **78 pinned official UCP JSON Schemas** (spec `v2026-04-08`). A document can be perfectly spec-shaped and still false, which is the point:

> **The headline exhibit, machine-checked in CI:** `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` **passes** official-schema conformance and **fails** the truth leg on a price lie. Shape-valid is not true. *(CI = the real thing, not a figure of speech: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm run verify` — which includes this differential — plus the legacy suite on every push and PR; first green run observed 2026-07-11 (run 29133350771), most recent observed green 2026-07-12 (run 29208347657 on `d6c7a4d`).)*

3. **Fee-audit leg** — audit a monthly delivery fee statement against the codified **NYC § 20-563.3** fee caps (17-rule table built from primary legal text, 11 statement-checkable rules implemented, 6 registered as not statement-checkable with written reasons). Deterministic, $0.
4. **Demo** — the scripted walkthrough above. Scripted, deterministic, labeled *spec-faithful demonstration actor — simulated*; every verdict computed by the real verifier.

## Honest status (measured, not asserted)

| Surface | Status |
| --- | --- |
| Test suite | `npm run verify` green: **1145 passed + 7 skipped** locally, **1144 + 8 in CI** (count re-measured live 2026-07-12 after the E2/E3/E4 lanes, their eval-locks, and the batch-D review fixes landed). The skips are live-network harnesses, off by default; the one-test difference is the embedding-hybrid check, which is cache-gated and therefore *skipped* in CI — the model cache is gitignored and inference never downloads, so a fresh runner honestly reports it as skipped rather than silently passing. |
| Listings drift taxonomy (8 classes) | **8/8 injected and caught, measured** by the C6 coverage eval; never an "all edge cases" claim |
| Official-oracle agreement | ajv conformance vs the official `ucp-schema` validator (v1.3.0): **33/35 agree + 2 documented divergences** (the JSON Schema 2020-12 format-assertion fork), 0 disagreements |
| Fee-line taxonomy (6 classes) | 5/6 deterministic-checkable and caught; relabeling detection routes to the classifier lane below |
| LLM line-item classifier | **Calibrated — earned 2026-07-09** on an owner-armed retry: a **fresh pre-registered held-out split** (the first split was exposed and never re-scored), floors identical to the first registration, **21/21 accuracy with every floor cleared**. The first run (2026-07-05) scored 20/21 and was **honestly DEFERRED** for missing one per-class recall floor (0.75 vs a pre-registered ≥ 0.80) — that record stands. The floors never moved in either run. |
| Agent extension | Two of the four crew roles (**Intake** and **Reviewer**) earned the label **"agent (live-run floors cleared)"** on an owner-armed live run (2026-07-07): 20/20 pre-registered held-out scenarios, 0 degraded, including planted in-document injection the live model visibly resisted. The other two roles are deterministic workflows by design and are labeled exactly that. Agents recommend; the engine decides; a human owns anything irreversible. |
| MCP tool surface | **Seven read-only tools over the same deterministic engine, exposed over stdio only** (never a network transport). An import-walk eval proves the server path is **$0 / no-transport** end to end; the conformance suite **byte-locks every tool's advertised description, input schema, behavior annotations, and output-envelope schema**; and a **real recorded client transcript is re-recorded through a freshly spawned server on every test run** and must reproduce the committed golden byte-for-byte. No LLM sits on any tool path (`evals/mcp/`). |
| Delivery | The system can **write** Slack/email payloads but the site, CLI, and tools structurally cannot send. Exactly **one** recorded delivery exists: a single owner-armed Slack send to the owner's own channel (2026-07-09), executed under eight written safety controls, with a redacted run record committed (`docs/reviews/`). |
| Reference-retrieval lane (E2) | **Floors NOT met — label deferred (2026-07-12), and the scoreboard is published.** An extractive, offline, $0 retrieval tool over the committed rule/schema/glossary corpus was scored once against pre-registered floors: retrieval hit-rate 19/24 (< the 0.85 floor), and the embedding hybrid failed to beat plain BM25 — so the **simpler lane shipped**, labeled *experimental, advisory only* in every payload (`docs/e2-rag-preregistration.md` RESULTS). |
| Signed-approvals simulator (E3) | The "human signs, then it runs" flow exists as a fully **offline simulator**: Ed25519-signed decisions verified through a frozen seven-check order (identity, role, tamper, replay, expiry, content binding), attacked by a committed threat-model suite, with an import-graph proof it **cannot send**. The live interactive lane remains a future owner decision. |
| Entity-resolution lane (E4) | **Floors NOT met — label deferred (2026-07-12).** Under a hard zero-false-merge floor on near-miss traps (**14/14 held**), the fuzzy ensemble **tied** normalized-exact matching (precision 18/18; recall 18/35 < the 0.80 floor) — so exact matching, always the protected default, is also the shipped default; the writeup says so (`docs/e4-entity-resolution-preregistration.md` RESULTS). Its one demonstrated added value: routing 9/10 genuinely-ambiguous pairs to a human instead of guessing. **A first scoring run was VOIDED** when cross-model review found its corpus carried 10 traps against our own registered ≥12 minimum — a fresh split was generated and re-scored rather than keeping the convenient number. |
| Corpus | Seeded, deterministic, freeze-locked (regenerate ⇒ bytes must match); every fixture taxonomy-keyed; publishable under this repo's license |

That sequence is the project's character: **the bar never moves after the run.** The first attempt's near-miss was reported as a near-miss and stayed a DEFER; earning the label took a second owner-authorized exam on brand-new questions under the same bars — not a re-grade of the old one.

## Where AI is used, and where it is not — the full inventory

- **Truth, conformance, and fee-audit verdicts:** deterministic code. No LLM on any verdict path, ever.
- **Advisory line-item classifier (calibrated):** the one LLM inside the fee-audit lane — flags fuzzy fee-relabeling *leads* that never gate a verdict, fed a leak-free input contract (no answer keys), measured against pre-registered floors (status above). Runs on the Groq free tier (an open-weight model); a self-hosted alternative (Ollama / llama.cpp with any open-weight model) works through the same seam.
- **Agent extension (recommend-only):** a four-role crew over the tool registry; the two model-directed roles cleared live-run floors (status above). The engine still decides; a human still approves.
- **MCP tool surface (deterministic):** the seven MCP tools expose the same deterministic engine over stdio — no LLM sits on any tool path, and an import-walk eval proves the server path is $0 and network-free (status above).
- **Legacy activation module (archived, replay-only):** the repo's first life used Gemini's free tier for bounded drafting; its public surfaces replay a **recorded** fixture — no live calls. A self-hosted open-weight model is the free alternative there too.

Every finding carries **receipts**: the claim, the reference row, the rule or spec-clause id, and a severity. An eval asserts no finding can exist without all four.

## Why now (as of 2026-07)

- Agentic ordering is live: major consumer AI assistants began placing real food orders through published commerce protocols in mid-2026, and marketplace ordering inside an assistant has been piloting since March 2026. (Named, dated citations live in `docs/research/` — genericized here by policy; the research digests carry the specifics.)
- The protocol layer is settling: ACP and UCP (spec `v2026-04-08`, the version pinned here) are both Apache-2.0 and moving fast; UCP's Food vertical schemas were still pending at the pinned tag.
- Fee enforcement is real: NYC's first restaurant-side fee-cap enforcement was an **$875,000+ settlement, including over $580,000 in restitution to 380+ restaurants** (announced 2026-04-08), and DCWP has an active rulemaking on recordkeeping for delivery-fee-cap compliance (hearing July 2026).

Dated source records for these claims live in `docs/research/` (source lockfile included).

## Limitations and non-goals

- **A prototype run on demand, not an operated service.** No uptime, hosting, or SLA ambitions; the enterprise path is documented, not built.
- The truth-audit corpus is **synthetic by design** (labeled on every surface); real-world entity matching is harder than the synthetic-controlled matching here, and reports label which mode was used.
- Fee verdicts that depend on the statutory "purchase price" base are marked **provisional** pending that open legal question; the marker is enforced by the type system, not a footnote.
- Operator demand is **not validated** (no first-person merchant research yet); this repo demonstrates capability, not market proof.
- The web console is desktop-only. The identity separation is **implemented in this repo** (the legacy activation surfaces live under `/legacy/**` with their own provenance; the canonical pages present the truth-audit engine) — but the **deployed site is several review-gated slices behind this repo** until the next owner-approved deploy, so the live URLs may still show the pre-split surfaces.
- Two enhancement lanes currently wear **"floors not met — experimental"** labels (reference retrieval E2, entity resolution E4): their pre-registered quality bars were missed on the one permitted scoring pass, the misses are published in full, and re-attempts require fresh registered splits. Deferred is a result here, not a failure mode to hide.

## The corpus

`fixtures/` is a publishable, self-contained test corpus: a synthetic restaurant system-of-record with faithful and deliberately-drifted serving copies, ground-truth manifests, golden reports, 35 UCP conformance CI documents, and simulated monthly fee statements with answer keys. See `fixtures/README.md` for the index, taxonomy keying, and regeneration commands.

## Lineage

This repo's first life was **ActivationOps AI**, a merchant-activation prototype (deterministic triage → bounded LLM drafting → claims-gatekeeper → human-in-the-loop gate). It is archived **runnable** under `legacy/activation/` (`npm run test:legacy`, 306 tests green) and its verification spine is what the truth-audit engine grew from. Its own README and honesty labels stand unchanged.

**Legacy data provenance (scoped honestly):** unlike the truth-audit engine's all-synthetic corpus, the legacy module demonstrates a real-data *adapter* over public-domain business records (DataSF) with a synthetic activation-state overlay — license-clean, no PII retained, and its public display uses fictional names only (synthetic states are never attached to real businesses on any public page).

**History disclosure:** current public surfaces were de-branded to a generic "delivery-marketplace" register (tracked inventory in `docs/reviews/`), but the **git history is intentionally preserved unrewritten** — earlier commits, names, and records remain visible by design, because the history *is* the provenance this project's claims rest on. Anything you find there is lineage, not a current claim.

## Development workflow (note)

Built human-led with AI assistance: Claude Code as planner/builder, OpenAI Codex as adversarial reviewer, with module-boundary review gates and an independent acceptance gate; records live in `docs/reviews/`. These are development tools — **none of them is the product runtime**. This repo never presents itself as AI-free, and never as AI-built without human direction and review.

## License

Apache-2.0 (see `LICENSE`). The vendored official UCP schemas under `fixtures/ucp-schemas/` keep their own upstream Apache-2.0 license and provenance record.
