# The writeup — a truth layer for agentic commerce

*Publication draft (Pub slice, plan §5). Written 2026-07-06; all dates and claims are as-of that day and source-backed in `docs/research/` (source lockfile included). This document is the postable narrative; the repo README is the technical front door. Human-led, AI-assisted, professionally reviewed.*

---

## The one-sentence pitch

AI agents started ordering food this year; nobody independent checks whether the data they act on is true. So we built the empty seat: an open, deterministic verifier that compares what platforms and agent surfaces *say* about a merchant with the merchant's own records, and audits fee statements against codified law.

## Why this, why now

Three dated facts frame the moment (each source-backed in the repo's research digests):

1. **Agentic ordering is live.** Since 2026-07-01 you can order food through ChatGPT and Claude via Square; DoorDash ordering inside Google's Gemini assistant began piloting in March 2026. An agent doesn't eyeball a menu and shrug at a stale price — it acts on it.
2. **The protocol layer standardizes *shape*, not *truth*.** ACP (OpenAI + Stripe) and UCP (with its Food vertical) are settling fast as the rails of agentic commerce — and a document can satisfy either spec perfectly while being false about the merchant it describes.
3. **Fee enforcement got real.** New York City's first restaurant-side fee-cap enforcement was an $875,000+ settlement, including over $580,000 in restitution to 380+ restaurants (announced 2026-04-08); the violations were found by hand, and DCWP now has an active rulemaking on recordkeeping for fee-cap compliance (hearing July 2026). The law is asking for exactly the kind of audit this repo automates on synthetic statements.

Every seat that could verify the copies is conflicted: platforms won't audit each other, sync vendors would grade their own homework, agent vendors say not-our-job. The independent-verifier seat is structurally empty. This prototype demonstrates what sits in it.

## What the verifier shows

**The headline, machine-checked in CI:** a catalog response can pass the official UCP schema validation and still lie about the price. The exhibit file (`fixtures/ucp-conformance-ci/valid/conformant-but-false.json`) passes conformance and fails the truth leg in the same test run. Spec-valid is not true — which is precisely why a conformance checker alone can't hold the referee seat.

**The demo, in one line (verbatim, single-sourced in code):** "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch." Run `node bin/check.mjs demo` — deterministic, $0, zero-config; every verdict in the transcript is computed by the real verifier.

**The fee-audit leg:** NYC § 20-563.3's caps, codified from primary legal text into a 17-rule table (11 statement-checkable rules implemented; 6 honestly registered as not checkable from a statement, with written reasons), applied to simulated monthly statements with receipts on every finding: claim, reference row, rule id, severity. An eval asserts no finding exists without all four.

## The part we're proudest of: a measurement that says no

The one place an LLM appears is an advisory line-item classifier for fuzzy fee-relabeling cases. Before its label could count, it had to clear pre-registered floors on a held-out split; the floors were committed to git *before* the run, with a no-rerun rule (the split is exposed once scored).

It scored **20/21 accuracy, strictly beating the pinned deterministic baseline (19/21)**, with macro precision 0.971 and zero flip-rate across repetitions. And its label still reads **DEFERRED**, because one per-class recall came in 0.75 against a pre-registered ≥ 0.80 floor.

We published the miss. The bar did not move. In a field where "our AI is calibrated" is usually an adjective, this repo treats it as a conjunctive, pre-registered, machine-checked claim, and reports the near-miss as a near-miss. The measurement discipline is the product as much as the verifier is.

## What's real and what isn't (the honesty box)

- **Synthetic corpus, labeled on every surface.** No real merchant data, accounts, or platform access anywhere; no real business-impact claims. The generators are seeded and the committed fixtures are freeze-locked (regenerate ⇒ bytes must match).
- **A prototype run on demand, not an operated service.** The enterprise expansion path is documented, not built.
- **Real law, real schemas.** The NYC rule table is codified from primary text; the 78 UCP JSON Schemas are pinned verbatim from the official spec repo (Apache-2.0, sha256-locked provenance) at `v2026-04-08`, still the current release as of 2026-07-06.
- **Open questions stay open.** Fee verdicts depending on the statutory "purchase price" base are type-enforced provisional; operator demand is unvalidated; real-world entity matching is harder than the synthetic-controlled matching demonstrated.

## Numbers at a glance

743 tests passing (+6 skipped live harnesses) · 8/8 listings drift classes injected and caught (measured) · 33/35 agreement with the official Rust validator with the 2 divergences documented to their root cause (the JSON Schema 2020-12 format-assertion fork) · 17 fee rules codified, 11 implemented + 6 registered non-checkable · classifier 20/21 vs 19/21 baseline, label honestly deferred · $0 of LLM spend on every CLI path, enforced by an import-graph eval.

## Where to look first

1. `node bin/check.mjs demo` — the walkthrough.
2. `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` — the thesis as a file.
3. `docs/fee-classifier-calibration-status.md` — the pre-registration, the run, and the DEFER, unedited.
4. `docs/reviews/` — the dual-model review record (adversarial cross-model review at every module boundary, plus an independent acceptance gate).

## Licensing and lineage

Apache-2.0 (code and synthetic corpus alike; the vendored official UCP schemas keep their upstream Apache-2.0 and provenance record). The repo's first life — ActivationOps AI, a merchant-activation prototype — is archived runnable under `legacy/activation/` with its own labels intact; its verification spine is what this engine grew from.

*Built human-led with AI assistance (Claude Code as planner/builder, OpenAI Codex as adversarial reviewer — development tools, never the product runtime). This work never presents itself as AI-free, and never as AI-built without human direction and review.*
