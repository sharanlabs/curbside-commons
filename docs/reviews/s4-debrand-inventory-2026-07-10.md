# S4 de-brand inventory — 2026-07-10 (plan v3.3 §S4 · AP-08 · Gate-P3-5 · F-13 · NEW-12)

**Committed FIRST, before any sweep edit** (plan v3.3 S4: "inventory committed FIRST"). Companion: `mockups/README.md` (root inventory over all 54 mockup artifacts, same commit).

**Method (CORRECTED at batch-B reconciliation, 2026-07-10 — finding #1, accepted):** the original scan used `\bSquare\b`-style word boundaries in `git grep -E`, and **`\b` silently matches nothing in this git-grep build** (proven live: `git grep -c -E '\bSquare\b' -- README.md` returns no match though the word is present). The corrected scan is the unboundaried pattern `DoorDash | Door Dash | Uber Eats | Uber&nbsp;Eats | UberEats | Grubhub | GrubHub | OpenAI | DataSF | Instacart` **plus `git grep -lw` (word-mode) for `Square`, `Stripe`, `Google`, `Toast`** — the five-name set plus every F-16 expansion, the `&nbsp;` encoding, spelling variants, and two adjacent brands. Unicode-NBSP variant (`Uber Eats`): **zero hits** repo-wide. **Corrected total: 178 files** carry ≥1 hit (the defective scan saw 163; the 16 omitted files are classified in §3b — all keep-class, zero new edit sites, so the 6-edit sweep stands). `ActivationOps` self-name hits are **out of S4 scope by directive** (the de-brand order targets external marketplace/company brands; the repo's own former name is the S5 identity lane — see §7).

**The Gate-P2 rule, verbatim (binding on every edit below):** *dated public-market prose is genericized; its named, dated citation is preserved and linked in the research digest.*

## Classes

| Class | Meaning | Edit? |
|---|---|---|
| **EDIT** | Current, living public surface using a brand as identity/register framing | YES — genericize to the "delivery marketplace" register |
| **FACTUAL-ATTRIBUTION-KEEP** | Nominative/factual use: non-affiliation disclaimers, protocol authorship (ACP=OpenAI/Stripe, UCP=Google-led), data provenance (DataSF), governance rules that name a brand to PROHIBIT claims about it, live URLs/citations | NO — removing the name would weaken the disclaimer, falsify the attribution, or break the citation |
| **FROZEN-ARCHIVE** | Byte-frozen artifacts: `legacy/**`, root `eval/*.json`, `tests/fixtures/`, v1 python (`scripts/*.py`), the SIMULATED banner sites, S2-locked footer, eval predicates in `evals/` | NO — freeze edits require a recorded reversal row; none is sanctioned in S4 (S4b's golden migration has its own allowlist) |
| **HISTORICAL** | Dated records: review records/raws, decision/task logs, journal, dated plans/specs/audits/research digests, state docs, superseded mockups | NO — history is preserved intentionally (E1b ships the public history disclosure) |

## 1. EDIT class — the complete sweep (6 files, line-level; per the frontier-advisor constraint, each line is asserted to carry **no named, dated citation** — nothing to preserve-and-link)

| # | File:line | Current | Edit | Citation check |
|---|---|---|---|---|
| E-1 | `docs/PLAIN-ENGLISH.md:19` | chain prose "till → sync software → DoorDash / Uber Eats / Grubhub → and now → AI assistants like ChatGPT, Claude, and Gemini" | "…till → sync software → the delivery marketplaces → and now → AI assistants like ChatGPT, Claude, and Gemini" (AI-assistant examples are factual subject-matter naming, not marketplace de-brand scope) | undated narrative prose; no citation attached |
| E-2 | `docs/product-brief.md:5` | "a DoorDash-style activation workflow" | "a delivery-marketplace-style activation workflow" | undated framing; no citation |
| E-3 | `docs/project-narrative.md:3` | "a DoorDash-style merchant onboarding simulation" | "a delivery-marketplace-style merchant onboarding simulation" | undated framing; no citation |
| E-4 | `docs/roadmap.md:3` | "real marketplaces (DoorDash/Uber Eats/Instacart) are referenced only as comparisons" | "real marketplaces are referenced only as comparisons" (parenthetical dropped) | undated meta-line; no citation |
| E-5 | `docs/enterprise-delivery-playbook.md:28` | "a DoorDash-style merchant-onboarding simulation" | "a delivery-marketplace-style merchant-onboarding simulation" (register fix only; no rule change) | undated framing; no citation |
| E-6 | `vitest.config.ts:37` | comment quoting the local working-folder name ("AI DoorDash …") | reword to "the project's absolute path contains spaces" without quoting the brand fragment | code comment; no citation |

Everything else that greps is a KEEP, accounted below. **Post-sweep gate:** re-run the full grep; every remaining hit must map to a row/class in this document — that mapping IS the "zero-brand grep vs inventory" check.

## 2. FACTUAL-ATTRIBUTION-KEEP (current surfaces; names stay)

- **Sanctioned non-affiliation disclaimers** (nominative fair use under the predicate "not affiliated with, endorsed by, or connected to" or equivalent; the S2 footer is e2e-locked verbatim): `README.md:7` · `app/layout.tsx:71` (S2 contract) · `app/page.tsx:355` · `docs/PLAIN-ENGLISH.md:70` · `docs/project-narrative.md:5,95` · `docs/enterprise-delivery-playbook.md:163` · `AGENTS.md:19` · mockup disclaimer blocks (see `mockups/README.md`).
- **Governance/honesty rules naming brands to PROHIBIT claims:** `RULES.md:44`, `CLAUDE.md:72` ("Never claim real DoorDash access…"). Protective naming; constitution edits are out of S4 scope (owner-gated) — surfaced at wrap.
- **Protocol authorship (genericizing would be FALSE):** `docs/GLOSSARY.md:11` (ACP = OpenAI's published spec) · `docs/GLOSSARY.md:75` (UCP = Google-led; food vertical co-developed by DoorDash, Square, Toast, Uber Eats) · `components/report/ReportView.tsx:28` ("OpenAI/Stripe product-feed shape" plain label) · `components/report/ReportView.tsx:33` ("Google-led live-catalog shape" UCP plain label) · `docs/PLAIN-ENGLISH.md:92` (OpenAI-style feed / Google-UCP answer).
- **Data provenance (license/honesty-bearing):** DataSF attributions in `app/console/page.tsx:105`, `lib/product.ts:17` (HONEST_DATA_LABEL), `docs/WHY.md:43`, `docs/ENTERPRISE-READINESS.md:18`, `scripts-ts/build-hybrid-snapshot.mjs` (the fetch tool itself), `README.md:96`.
- **Dev-tool attribution:** "OpenAI Codex" as adversarial reviewer in `README.md:100`, `docs/PUBLICATION.md:61` (factual; RULES §8 development-workflow note).
- **Lineage facts:** `README.md:94`, `docs/PUBLICATION.md:59`, `package.json:6` ("the ActivationOps AI activation module is archived…" — the repo's first life; S5 renames the package itself).
- **Research/knowledge records with named, dated, live-verified citations (Gate-P2 preserved class):** `knowledge/domain/merchant-activation-kb.md`, `knowledge/domain/SOURCE-REGISTRY.md` (incl. the literal `UberEats-Onboarding` vendor URL), `docs/research/**` (7 files).
- **Comment/config notes that factually explain a freeze:** `.vercelignore:7`, `lib/product.ts:5` (documents the legacy oracle's REFERENCE_PLATFORM_NAME contract).

## 3. FROZEN-ARCHIVE (byte-frozen; a change here outside a recorded reversal row fails the slice)

- `legacy/**` (13 files with hits — incl. the differential oracle whose REFERENCE_PLATFORM_NAME is load-bearing) — protected pathspec.
- Root v1 fixtures: `eval/draft-oracle.v1.json`, `eval/guardrail_regression.v1.json`, `tests/fixtures/guardrail_cases.json`, `scripts/pipeline.py` — PLAN.md OQ-1 (owner-overridden ruling) explicitly keeps residual brand strings **byte-identical + honestly labeled**; the v1 `false_impact_claim` guardrail is literally anchored on the brand string (functional test data — see `docs/phase3-prep-slice-plan.md:39`).
- **SIMULATED banner sites (byte-frozen, S2 parity-locked):** `lib/packs/listings/demo/copy.ts:54` (single source) · `components/report/ReportView.tsx:115` (incl. the `Uber&nbsp;Eats` JSX encoding — the only NBSP site in product code) · mockup banner mirrors (12 files, listed in `mockups/README.md`).
- **Eval predicates/assertions that need the names to do their job** (`evals/` protected pathspec): `evals/packs/honesty-c10.test.ts`, `evals/packs/fees-honesty-c10.test.ts` (banned-claim predicates), `evals/e2e/console.spec.ts` (asserts the S2 footer sentence verbatim).

## 3b. The 16 files the defective scan omitted (batch-B finding #1; classified 2026-07-10 — ALL keep-class)

- **FACTUAL-ATTRIBUTION-KEEP (current code/docs):** `lib/packs/listings/types.ts` (the SOR schema is "≈ Square CatalogItem subset" by design — the file's own header states "not Square data, not a Square client, claims no Square affiliation (C10)") · `lib/packs/listings/index.ts:4` (same Square-Catalog-shaped attribution) · `fixtures/synthetic-restaurant/README.md:15` (same, frozen fixture doc) · `lib/agents/gemini.ts` (Google as the Gemini API vendor — billing/retirement/docs facts, freshness-cited).
- **HISTORICAL:** `docs/decisions/ADR-001-initial-architecture.md` · `docs/open-questions.md` (Google-Sheets tool questions, planning era) · `docs/plan-reconciliation.md` · `docs/review-packets/roadmap-lifecycle-applicability-review.md` (additional word-mode hits) · `docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md` · `docs/reviews/slice1-drafter-reliability-verify-evidence.log` · `docs/reviews/w3-verify-evidence.log` · this inventory itself (quotes the names it classifies).
- **FROZEN-ARCHIVE:** `legacy/activation/evals/agent-loop.test.ts` · `legacy/activation/evals/draft.test.ts` · `legacy/activation/evals/gold/semantic-judge-gold.ts` · `legacy/activation/lib/agents/loop/orchestrator.ts` · `legacy/activation/lib/data/judge-calibration.snapshot.json`.

## 4. HISTORICAL (dated records; preserved intentionally)

- `docs/reviews/**` (58 files with hits incl. raw logs + the L-2 send record `l2-slack-one-shot-2026-07-09T15-06-01-054Z.md` — **immutable**) · `docs/audits/**` (4) · `docs/review-packets/**` (2) · `docs/decision-log.md` · `docs/task-log.md` · `docs/implementation-journal.md` · `shared_reasoning.md` · state docs (`PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `RESUME_PROMPT.txt`) · `PLAN.md`, `PLAN-REVIEW-LOG.md`.
- Dated plans/specs/status docs: `docs/plan-*.md` (5 incl. this workstream's own plan), `docs/phase3-prep-slice-plan.md`, `docs/spec-semantic-judge.md`, `docs/story-arc-content-spec.md` (**reclassified at batch-B reconciliation, finding #2:** its header claimed "LOCKED … drives the product surfaces," which was stale — the 2026-07-08 Oxblood whole-site specs govern the current site — and its cited incumbent digest was never committed to the repo, so the original Gate-P2 justification was wrongly grounded; the file now carries an explicit SUPERSEDED marker naming its replacement, and its brand-register prose is kept as dated historical content under that marker), `docs/architecture/agentic-architecture-blueprint.md`, `docs/t002-slice-plan.md`, `docs/v1-slice-plan.md`, `docs/v1-data-dictionary.md` + `docs/data-audit.md` (both record the original CSV filename as a dated audit fact; the CSV itself was renamed long ago per OQ-1), `docs/strategist-confirmatory-status.md`, `docs/a3-7-live-run-status.md`, `docs/tooling-and-skills-usage.md`.
- Superseded/historical mockups (all 54 artifacts classified in `mockups/README.md`; brand hits there are disclaimer blocks + frozen-banner mirrors + one identity-register line in the superseded `story-flow.html:878` — archived, not served, C10-scanned green).

## 5. GitHub surface checks (frontier-advisor constraint: slug checked, not just About)

- **About description** (live `gh repo view`, 2026-07-10): Curbside Commons wording, truth-audit description — **zero brand terms**. CLEAN, no action.
- **Repo slug:** `sharanlabs/curbside-commons` — **clean** (the brand-bearing name exists only in the LOCAL working-folder path "AI DoorDash Merchant Engine", which is not tracked, not published, and not part of any artifact; the one tracked reference to it is E-6, edited).
- Topics: none set. Homepage: empty. No action.

## 6. `out/` scan allowlist (fresh `npm run build`, then grep `out/` for the pattern set)

Expected (sanctioned) hits in the built site — anything outside this list fails the gate:
1. The S2 footer non-affiliation sentence (every page; `app/layout.tsx:71`).
2. The SIMULATED banner text incl. `Uber&nbsp;Eats` (report/demo surfaces; `copy.ts:54`/`ReportView.tsx:115`).
3. The protocol-attribution plain labels (report surfaces): "OpenAI/Stripe product-feed shape" (`ReportView.tsx:28`) and "Google-led live-catalog shape" (`ReportView.tsx:33`). (A third "Google" hit in `out/` is Next.js's own vendored bot-detection regex in the framework bundle — not repo content.)
4. The landing non-affiliation sentence (`app/page.tsx:355`).
5. DataSF provenance lines (console surface; `app/console/page.tsx:105` + HONEST_DATA_LABEL from `lib/product.ts:17`).
6. **[Added by the live scan itself, 2026-07-10 — the gate caught a rendered-content path no source grep of `app/` flags]** Legacy diagnosis copy rendered onto the merchant data surfaces: "IRS/Stripe mismatch vs not-yet-submitted" and "escalate to ops if it's a Stripe fraud hold" from `legacy/activation/lib/domain/diagnosis.ts:77,104` (frozen-archive class — `legacy/` is a protected path; the strings are factual domain examples in the frozen v1 diagnosis rules). These surfaces move under `/legacy/**` at S5 with their own provenance layout; content stays frozen.

## 7. Out-of-scope-by-directive (recorded so the accounting is total)

- `ActivationOps` self-name hits (~40 files incl. `docs/CASE-STUDY.md`, `docs/INTERVIEW-WALKTHROUGH.md`, `docs/visuals/*.mmd`, `.env.example:2`, `scripts/run.py|config.py|__init__.py` headers): the repo's own former name — factual lineage until **S5 (identity resolution)** handles current-surface retitling per the ratified /legacy/ disposition. Not external de-brand.
- AI-assistant product names (ChatGPT, Claude, Gemini) as subject-matter examples: the product's domain is agentic commerce; these are factual actors, not marketplace brands. Kept.
- `Toast`: appears only inside keep-class lines (README:7 disclaimer, GLOSSARY:75 attribution). No edit sites.

## S4b forward allowlist (the freeze-boundary migration this inventory sanctions; ALL SEVEN paths, per the frontier-advisor count)

Template sources (versioned change, "Commerce Truth Audit" → "Curbside Commons"): `lib/packs/listings/demo/render-text.ts:47` · `lib/delivery/slack.ts:49,132` · `lib/delivery/email.ts:129,143`. Regenerated through the REAL builders + assertion update — the explicit per-file frozen-allowlist:
1. `evals/delivery/gold/slack-feed-drifted.golden.json`
2. `evals/delivery/gold/slack-fees-clean.golden.json`
3. `evals/delivery/gold/slack-fees-drifted.golden.json`
4. `evals/delivery/gold/email-fees-drifted.golden.eml`
5. `fixtures/synthetic-restaurant/expected-demo.txt`
6. `fixtures/synthetic-restaurant/expected-demo.json` (regenerated by the same `npm run fixtures:demo`; expected byte-identical — listed so the regen surface is total; if it changes, the diff must be shown and justified)
7. `evals/delivery/delivery.test.ts` (the one banner assertion, line 110)

The historical L-2 send record `docs/reviews/l2-slack-one-shot-2026-07-09T15-06-01-054Z.md` carries the OLD payload name — **immutable, untouched** (it records what was actually sent). Inside the regenerated goldens, everything except the sanctioned name string must remain byte-identical (checked in S4b's gate).
