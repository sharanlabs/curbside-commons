# W2 slice record — UCP conformance leg + `ucp-schema` CI oracle + P3 fold-ins

**Slice:** W2 (plan `docs/plan-truth-audit-execution.md` §5 row W2 + §4 C3/C5). **Mode:** SPEC-ADHERENCE (delegated builder, Opus @ xhigh; Fable orchestrates/judges). **Date:** 2026-07-03. **Status:** built + self-verified; **NOT committed** (awaits Fable equivalence review of the diff, then M1 Codex batch).

Professional register leads; *plain-English lines are marked ▸*.

▸ *Plain: W1 checked whether a menu copy tells the TRUTH (vs the merchant's till). W2 adds the second, separate question: is a UCP menu answer correctly SHAPED per the official rulebook (CONFORMANCE)? The whole point is that these are different — a perfectly-shaped answer can still lie. We built the shape-checker against the real published UCP schemas, proved the two questions stay cleanly apart, and built the exhibit that shows a spec-valid answer still getting caught lying.*

## 1 · What was built (grouped)

**Pinned reference (untrusted-fetched DATA, Law 11 — quarantined, never executed):**
- `fixtures/ucp-schemas/2026-04-08/schemas/**` — 78 official UCP JSON Schemas, verbatim.
- `fixtures/ucp-schemas/2026-04-08/PROVENANCE.json` — per-file git-blob-sha + sha256 + `$id`, source URLs, access date, license.
- `fixtures/ucp-schemas/2026-04-08/{LICENSE,README.md}` — Apache-2.0 text + two-register provenance/composition note.

**Conformance engine (own TS/ajv validation, plan §3):**
- `lib/packs/listings/conformance.ts` — Ajv2020 + ajv-formats over the pinned schema graph → `LST-CONF-*` findings through the SAME C2 guard (`makeFinding`). Distinct rule family + `conformance` category.
- `lib/packs/listings/ucp-wire.ts` — real-UCP `search_response` builder from the SOR + `ucpSearchResponseToClaims` (the THIRD truth adapter → C3), powering the conformance-vs-truth headline.
- `lib/packs/listings/ucp-corpus.ts` — the pure, deterministic corpus recipe (shared by generator + freeze eval).
- `bin/check.mjs` + `lib/packs/listings/cli.ts` — `check <doc> --conformance [--op search|lookup|get_product]` leg; exit 0/1/2 unchanged; `npm run check:conformance`.
- `lib/packs/listings/index.ts` — barrel exports the pure `ucp-wire` surface (conformance/corpus stay out — they read `node:fs`, like `cli.ts`).

**Corpus + oracle (C5):**
- `scripts-ts/generate-ucp-conformance-corpus.mts` + `fixtures/ucp-conformance-ci/**` — N=35 seeded fixtures (14 valid + 21 invalid) + `manifest.json`.
- `scripts-ts/ucp-oracle-diff.mts` + `npm run test:ucp-oracle` — cargo-gated differential oracle; **skips loud, exit 0** when cargo absent.

**Evals (red-green surfaces):**
- `evals/packs/ucp-conformance.test.ts` — corpus verdicts vs manifest, corpus + pinned-schema freeze-integrity, C2 completeness, spec-pin, the headline.
- `evals/packs/acp-field-rules.test.ts` — ACP per-field-rule red-green audit (§4).
- `evals/packs/honesty-c10.test.ts` — C10 platform-claims grep-gate (P3-6).
- Edits: `cli-c1.test.ts` (conformance real-process + P3-5 fetch scan), `verifier-engine.test.ts` (P3-3), `listings-coverage-c6.test.ts` (P3-1), `listings-wedge.test.ts` (P3-2), `packs-load.test.ts` (P3-7).

**Config:** `package.json` — `ajv`/`ajv-formats` deps, `engines.node ">=24"` (P3-4), 4 new scripts; `lib/verifier-core/guard.ts` (P3-3).

## 2 · ajv source-intake note

| Field | Value |
| --- | --- |
| Problem it solves | Validate UCP catalog-response documents against the published UCP JSON Schemas (draft 2020-12, cross-referenced) — our own runtime conformance check, no network. |
| Why ajv | Mature, de-facto JSON-Schema validator for JS; **named in plan §3** ("own TS/ajv validation"); draft-2020-12 support (`ajv/dist/2020`); local + $0 + no network. |
| Versions installed | `ajv@8.20.0`, `ajv-formats@3.0.1` — **exact-pinned** (`--save-exact`). Latest on 2026-07-03 (freshness-checked, RULES §6). |
| License (verified from installed package) | ajv = **MIT**; ajv-formats = **MIT**. |
| ajv-formats justification | The pinned schemas use `format: uri` (×19) and `date-time` (×6); without ajv-formats those formats are unchecked. Installed → format violations are caught (proven: `format-*` corpus fixtures). |
| Alternatives | None needed (plan-named). ajv is the standard; no comparative shopping required. |
| Risk | Dev+runtime dep of the **validator path only**; local, $0, no network. `npm audit` reports 7 pre-existing vulns (Next/eslint chain) — **none introduced by ajv/ajv-formats** (checked). |
| $0-LLM check | Import-graph eval unchanged + green: `ajv`/`ajv-formats` are bare specifiers (not traversed), don't match the ban list, and pull nothing banned. Ban list **not weakened**. P3-5 bare-`fetch(` source scan added. |

## 3 · UCP schema provenance + lockfile relock

- **Live-verified 2026-07-03:** `Universal-Commerce-Protocol/ucp-schema` = the cargo/Rust **validator tool**, latest release **v1.4.0** (published 2026-06-26), Apache-2.0. The canonical JSON **Schemas** live in the **sibling spec repo** `Universal-Commerce-Protocol/ucp`, latest release tag **`v2026-04-08`** (== the code's `UCP_PINNED_VERSION`), Apache-2.0.
- **Pinned:** 78 schema files at `fixtures/ucp-schemas/2026-04-08/`, each sha256-recorded in `PROVENANCE.json` and hash-locked by the freeze eval (tamper-evident, no network). LICENSE (Apache-2.0, "Copyright 2026 UCP Authors") pinned + sha-recorded; no NOTICE file exists upstream.
- **Lockfile:** `docs/research/source-lockfile.md` **L6 RELOCKED `PENDING-RELOCK` → `LOCKED` (2026-07-03)** with URLs, quotes (`"tag_name":"v1.4.0"`, `"v2026-04-08"`), and the divergence note.
- **Composition followed (not invented):** relative `$ref` resolved against each file's absolute `$id`; validate against `catalog_search.json#/$defs/search_response` (etc.). `strict:false` — the schemas carry vendor vocabulary (`name` capability id, `ucp_request`/`ucp_response`/`ucp_shared_request`); these are treated as non-constraining annotations while all standard keywords are enforced. Cited in `conformance.ts` + the pinned README.

## 4 · C5 status (conformance correctness)

- **Corpus:** N=35 (≥30) ✓ — 14 valid + 21 invalid; **8 violation classes** (`LST-CONF-{REQUIRED-MISSING, TYPE, PATTERN, NUMBER-RANGE, ARRAY-BOUNDS, FORMAT, OBJECT-SHAPE, ENUM}`), each invalid violating exactly one, enumerated in `manifest.json`. Seeded, deterministic, byte-frozen (every file). Our ajv verdicts asserted per-fixture (each invalid caught with the RIGHT class; each valid clean) = the red-green-per-rule surface for the UCP side.
- **Official differential oracle: `ucp-schema validate` is cargo-only Rust; cargo/rustc NOT installed on this machine (verified 2026-07-03).** Per the plan reading, built as an OPTIONAL CI lane (`scripts-ts/ucp-oracle-diff.mts`, `npm run test:ucp-oracle`): when cargo is present it runs the official validator over all 35 fixtures and asserts verdict agreement; when absent it **SKIPS LOUDLY** ("ucp-schema differential oracle SKIPPED: cargo not installed — C5 agreement UNMEASURED on this machine") and exits 0. **C5 agreement is UNMEASURED locally — verbatim, no faking.** Rust NOT installed (per constraint). The cargo-present branch is transcribed from the pinned tool's v1.4.0 CLI docs and is marked as un-executed on this machine (must be re-verified when cargo is first available). *(Escalation E-3.)*
- **Headline (conformance-vs-truth):** `valid/conformant-but-false.json` — a real-UCP doc that PASSES ajv conformance yet the truth leg (via `ucpSearchResponseToClaims`) catches its price lie. Both machine-checked in the eval. This is the program's core distinction, surfaced prominently.

## 5 · ACP per-field-rule coverage table (C5 second half)

Audit of the existing ACP detectors + completeness sweep (`detectors.ts` + `run.ts`). Every rule now has an ISOLATED red-green case in `evals/packs/acp-field-rules.test.ts` (violate exactly that rule → caught; faithful feed → clean). **18/18 rules covered.** No coverage gap found in the rule set; the gap was isolated red-green cases (now filled).

| Rule id | §7 class | Isolated violation (RED) | Faithful (GREEN) |
| --- | --- | --- | --- |
| LST-PRICE-VALUE | price | price → `999.99` | clean |
| LST-PRICE-CENTS-AS-DECIMAL | price | price → raw cents string | clean |
| LST-PRICE-CURRENCY | price | currency → `EUR` | clean |
| LST-PRICE-CURRENCY-FORM | price | currency → `usd` | clean |
| LST-PRICE-SALE-GT | price | sale_price > price | clean |
| LST-AVAIL-STATE | availability | 86'd row served in_stock | clean |
| LST-AVAIL-HIDDEN-SHOWN | availability | hidden variation served | clean |
| LST-ENC-UTF8 | encoding | title → mojibake | clean |
| LST-ENC-TRUNC | encoding | title → truncated + `…` | clean |
| LST-IDENT-NAME | identity | title → unrelated name | clean |
| LST-IDENT-MODIFIER-AMBIG | identity | variant_dict → sibling's label | clean |
| LST-IDENT-ID-MISMATCH | identity | item_id → legacy id (entity resolution) | clean |
| LST-EXIST-GHOST | existence | feed row with no SOR counterpart | clean |
| LST-EXIST-MISSING | existence | non-hidden SOR variation dropped | clean |
| LST-STALE-EXPIRED | staleness | expiration_date in the past | clean |
| LST-STALE-AVAILDATE | staleness | pre_order + past availability_date | clean |
| LST-XF-PREORDER-DATE-MISSING | cross-field | pre_order + null availability_date | clean |
| LST-XF-CHECKOUT-SEARCH | cross-field | checkout-eligible, search-ineligible | clean |

(A guardrail test enumerates the emittable rule set so a NEW pack rule without an audit case fails.)

## 6 · P3 fold-ins (all 7, from `gate-2026-07-03-w1-wedge.md`)

| # | Done |
| --- | --- |
| P3-1 | C6 `spec-version-skew` derived from `drift-manifest.json` `ucpVersionSkew.class`, not hand-added (`listings-coverage-c6.test.ts`). |
| P3-2 | Direct injector invariant test: manifest `targetFeedItemId` all-distinct + no injection targets the re-keyed live id (`listings-wedge.test.ts`). |
| P3-3 | `guard.ts` tightened — `makeFinding` now requires `claim.source` + `claim.field` presence (red-green: two new throw cases). |
| P3-4 | `package.json` → `"engines": { "node": ">=24" }`. |
| P3-5 | Bare `fetch(` source-text scan added to the $0-LLM proof (`cli-c1.test.ts`). |
| P3-6 | C10 platform-claims grep-gate implemented (`honesty-c10.test.ts`) — affirmative-overclaim patterns over pack sources + READMEs + CLI + simulated-label presence + spec-pin; the gate is self-tested to bite. |
| P3-7 | Stale W0 comment fixed (`packs-load.test.ts`). |

## 7 · Gates

- `npm run verify` → **exit 0** — Test Files 37 passed | 4 skipped (41); **Tests 478 passed | 5 skipped** (W1 baseline 411; +67); `next build` ✓.
- `npm run test:legacy` → **exit 0** — 306 passed | 5 skipped (unchanged, hard constraint).
- One-command demos: `check:fixtures` → 1, `check:fixtures:clean` → 0, `check:conformance` → 0; `test:ucp-oracle` → skip-loud, 0.
- **RED-GREEN ×7 executed** (mutate → RED → revert → GREEN), raw in `docs/reviews/w2-verify-evidence.log`.
- `git status`: only intended W2 files changed; no residue.

## 8 · Deviations / escalations (judgment calls for the orchestrator to overrule)

- **E-1 — schemas live in the `ucp` repo, not `ucp-schema` (task-stated expectation differs).** The task said "the `ucp-schema` repo … JSON Schemas." Live-verified: `ucp-schema` is the Rust validator tool; the JSON Schemas live in the sibling **spec** repo `ucp` (`source/schemas/`, served at ucp.dev). **My reading:** this is a "repo structure differs from expectations" case, but the schemas ARE published and authoritative and reachable — so I proceeded from the authoritative source and RECORDED the divergence (rather than STOP, which is for *unreachable*/*can't-find* cases). Pinned at spec tag `v2026-04-08` == `UCP_PINNED_VERSION`. **Overrule path:** if you want a hard STOP-and-report instead of proceed-and-record, say so.
- **E-2 — the existing W1 UCP fixtures are NOT the conformance corpus (spec item 3 literal reading).** Item 3 said "validate BOTH committed UCP fixtures (`ucp-catalog-response.faithful/drifted.json`) — faithful expect conformant." Those W1 fixtures are the truth-leg **normalized/simplified** shape (built when UCP food schemas were pending), NOT the real UCP wire shape (`{ucp, products}`), so they do **not** conform to the real `search_response` schema. **Ran them through conformance (item-3 literal check, verbatim in the evidence log):** `faithful` → `ok=false, 2 findings, [LST-CONF-REQUIRED-MISSING]`; `drifted` → `ok=false, 2 findings, [LST-CONF-REQUIRED-MISSING]` (both miss required `ucp`+`products`; nothing planted). I did **not** retrofit them (that would ripple through W1's frozen goldens/freeze-locks/C3 — large blast radius) and did **not** plant violations. Instead the conformance leg operates on a **new real-UCP corpus**, and the conformance-vs-truth headline is demonstrated on a **new real-UCP exhibit** (`conformant-but-false.json`). ▸ *Plain: W1's UCP fixture was our own simplified shape from before the real rulebook existed; checking it against the real rulebook is a category error, so I built proper real-shaped test docs and showed the headline on one of those.* **Overrule path:** if you want the two legacy fixtures literally run through conformance and their (failing) output recorded as-is, I can add that — it just documents a shape mismatch, not a useful finding.
- **E-3 — C5 differential-oracle agreement UNMEASURED locally (cargo absent).** Handled as an optional skip-loud CI lane per the plan; the cargo-present branch is written to the v1.4.0 CLI docs but has NOT executed here. Escalation handled upstream.
- **E-4 — scope addition: real-UCP → claims adapter (`ucpSearchResponseToClaims`) + the truth-leg headline.** Beyond a literal "validate the fixtures" reading, but required to make the conformance-vs-truth headline **evidence-grade** (machine-checked truth-FALSE, not narrated) and it strengthens C3 (a third real-shaped adapter into the one comparator). Justified by the plan thesis; flagged for visibility.
- **E-5 — `strict:false` + vendor annotations = STRUCTURAL conformance only.** Our ajv does not apply the UCP `resolve` step (per-operation field visibility); that is the official Rust tool's job (the differential oracle). Documented in `conformance.ts` + the pinned README. Not a defect — a labeled boundary.
- **E-6 — corpus docs carry `simulated:true` inside each file** (the open UCP response schema permits the extra field; conformance unaffected) PLUS manifest/README labels — satisfying the hard "every synthetic artifact carries simulated:true" constraint without breaking conformance. The pinned SCHEMAS are labeled `simulated:false` (they are real, pinned, untrusted-fetched).
- **advisor unavailable (8th consecutive session).** maker=judge mitigated by the RED-GREEN ×7 + the M1 Codex cross-model batch (standing obligation) + this record; family bias remains for M1.
