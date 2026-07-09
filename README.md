# Curbside Commons

**An independent, deterministic verifier for agentic commerce: it checks what delivery platforms and AI-agent surfaces *say* about a merchant against the merchant's own system of record, and audits fee statements against codified law. The truth layer for agentic commerce.**

A **human-led, AI-assisted** prototype, built and reviewed under a dual-model engineering process with every claim below backed by a committed test or record in this repo.

> **Not affiliated with, endorsed by, or connected to** DoorDash, Uber Eats, Grubhub, Square, Toast, OpenAI, Stripe, Google, or any named business or protocol body. This is an independent, company-agnostic prototype. **Everything it runs on is a labeled synthetic corpus** — no real merchant relationship, account, data, or PII anywhere, and no real business-impact claims. All metrics are simulated or measured on synthetic fixtures, and every artifact says so on its face.

## The problem, in plain words

When you order food through an app, or tell an AI assistant to do it, the menu being acted on is **not the restaurant's actual menu**. It is a copy, passed along a chain: the merchant's till system → sync software → marketplaces → and now AI agents. Copies go stale: the price went up and the copy didn't, the wings sold out an hour ago, a fee got renamed on a payout statement.

A human shrugs at a stale menu. **An AI agent doesn't shrug — it places the order.** And every seat that could check the copies is conflicted: platforms won't audit each other, sync vendors would be grading their own homework, and it isn't the AI companies' job. The neutral-referee seat is structurally empty.

This project builds that referee, as an open prototype:

1. **Truth leg** — compare a serving copy (an ACP-style feed, or a UCP catalog response) line by line against the merchant's system of record. Deterministic. No LLM anywhere on this path.
2. **Conformance leg** — validate a UCP catalog response against the **78 pinned official UCP JSON Schemas** (spec `v2026-04-08`). A document can be perfectly spec-shaped and still false, which is the point:

> **The headline exhibit, machine-checked in CI:** `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` **passes** official-schema conformance and **fails** the truth leg on a price lie. Shape-valid is not true.

3. **Fee-audit leg** — audit a monthly delivery fee statement against the codified **NYC § 20-563.3** fee caps (17-rule table built from primary legal text, 11 statement-checkable rules implemented, 6 registered as not statement-checkable with written reasons). Deterministic, $0.
4. **Demo** — "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch." Scripted, deterministic, labeled *spec-faithful demonstration actor — simulated*; every verdict in the transcript is computed by the real verifier, never narrated.

## Quickstart

```bash
npm install
node bin/check.mjs demo                                          # the scripted walkthrough, $0, zero-config
node bin/check.mjs check <feed.json> --against <catalog.json>    # truth leg (exit 1 = drift found)
node bin/check.mjs check <doc.json> --conformance                # conformance leg (pinned UCP schemas)
node bin/check.mjs fees <statement.json>                         # NYC §20-563.3 fee audit
npm run verify                                                   # typecheck + lint + tests + build
```

Zero network and zero LLM calls on every CLI path — enforced structurally by an import-graph eval, not by promise. A desktop web console (`npm run dev`: `/report`, `/demo`) renders the same machine reports in two registers, plain words first.

## Honest status (measured, not asserted)

| Surface | Status |
| --- | --- |
| Test suite | `npm run verify` green: **947 passed + 6 skipped** (the skips are live-network harnesses, off by default; count re-measured live 2026-07-08) |
| Listings drift taxonomy (8 classes) | **8/8 injected and caught, measured** by the C6 coverage eval; never an "all edge cases" claim |
| Official-oracle agreement | ajv conformance vs the official `ucp-schema` validator (v1.3.0): **33/35 agree + 2 documented divergences** (the JSON Schema 2020-12 format-assertion fork), 0 disagreements |
| Fee-line taxonomy (6 classes) | 5/6 deterministic-checkable and caught; relabeling detection routes to the classifier lane below |
| LLM line-item classifier | Live-calibrated on a held-out split: **20/21 accuracy, beating the pinned deterministic baseline (19/21)** — and still **honestly DEFERRED**, because one per-class recall floor (0.75 vs a pre-registered ≥ 0.80) was missed. The floors were committed before the run and did not move after it. |
| Corpus | Seeded, deterministic, freeze-locked (regenerate ⇒ bytes must match); every fixture taxonomy-keyed; publishable under this repo's license |

That DEFER is the project's character: **the bar never moves after the run.** A near-miss is reported as a near-miss.

## Where AI is used, and where it is not

The comparators, conformance checks, fee rules, evidence model, and report generation are **deterministic code**. An LLM appears in exactly one place: an **advisory** line-item classifier for genuinely fuzzy relabeling cases, which never gates a verdict, is fed a leak-free input contract (no answer keys), and is measured against pre-registered floors before its label counts. It runs on the Groq free tier (an open-weight model); a self-hosted alternative (Ollama / llama.cpp with any open-weight model) works through the same seam. The legacy module used Gemini's free tier; a self-hosted open-weight model is the free alternative there too.

Every finding carries **receipts**: the claim, the reference row, the rule or spec-clause id, and a severity. An eval asserts no finding can exist without all four.

## Why now (as of 2026-07)

- Agentic ordering is live: ChatGPT and Claude can order food via Square (launched 2026-07-01), and DoorDash ordering inside Google's Gemini assistant began piloting in March 2026.
- The protocol layer is settling: ACP (OpenAI + Stripe) and UCP (spec `v2026-04-08`, the version pinned here) are both Apache-2.0 and moving fast; UCP's Food vertical schemas were still pending at the pinned tag.
- Fee enforcement is real: NYC's first restaurant-side fee-cap enforcement was an **$875,000+ settlement, including over $580,000 in restitution to 380+ restaurants** (announced 2026-04-08), and DCWP has an active rulemaking on recordkeeping for delivery-fee-cap compliance (hearing July 2026).

Dated source records for these claims live in `docs/research/` (source lockfile included).

## Limitations and non-goals

- **A prototype run on demand, not an operated service.** No uptime, hosting, or SLA ambitions; the enterprise path is documented, not built.
- The corpus is **synthetic by design** (labeled on every surface); real-world entity matching is harder than the synthetic-controlled matching here, and reports label which mode was used.
- Fee verdicts that depend on the statutory "purchase price" base are marked **provisional** pending that open legal question; the marker is enforced by the type system, not a footnote.
- Operator demand is **not validated** (no first-person merchant research yet); this repo demonstrates capability, not market proof.
- The web console is desktop-only.

## The corpus

`fixtures/` is a publishable, self-contained test corpus: a synthetic restaurant system-of-record with faithful and deliberately-drifted serving copies, ground-truth manifests, golden reports, 35 UCP conformance CI documents, and simulated monthly fee statements with answer keys. See `fixtures/README.md` for the index, taxonomy keying, and regeneration commands.

## Lineage

This repo's first life was **ActivationOps AI**, a merchant-activation prototype (deterministic triage → bounded LLM drafting → claims-gatekeeper → human-in-the-loop gate). It is archived **runnable** under `legacy/activation/` (`npm run test:legacy`, 306 tests green) and its verification spine is what the truth-audit engine grew from. Its own README and honesty labels stand unchanged.

## Development workflow (note)

Built human-led with AI assistance: Claude Code as planner/builder, OpenAI Codex as adversarial reviewer, with module-boundary review gates and an independent acceptance gate; records live in `docs/reviews/`. These are development tools — **none of them is the product runtime**. This repo never presents itself as AI-free, and never as AI-built without human direction and review.

## License

Apache-2.0 (see `LICENSE`). The vendored official UCP schemas under `fixtures/ucp-schemas/` keep their own upstream Apache-2.0 license and provenance record.
