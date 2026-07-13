# Demo record — 2026-07 (S7, plan v3.3)

> **Amended 2026-07-13 (batch-E P1, accepted-fixed):** the first cut of this record paraphrased two transcripts it claimed were verbatim (the failed command's usage output; the demo walkthrough), condensed the vitest summaries into table cells while calling them verbatim, omitted SHOWCASE §1's standalone `evals/rag` command, and overstated the demo↔SVG relationship as "byte-identical" where the generator normalizes line endings and trims trailing newlines. All five defects are fixed below; nothing else changed. The original capture files are unchanged — this amendment corrects the *presentation* to match them.

**What this is:** the committed record of one complete run of every `docs/SHOWCASE.md` command, executed **verbatim as published**, with captured transcripts and exit codes. It exists so a reviewer can see what the showcase actually does without running it — and so the showcase's own commands are periodically proven runnable.

**Source under test (named, per plan §S7):** commit **`d9369985b744228f85dc435fab5f1159cbb82ac4`** (`d936998`, main, pushed, CI green — run 29208347657 observed on its parent chain). *Committing this record necessarily advances HEAD past that SHA; this record names what it tested — it does NOT claim to be "the release SHA."*

**Environment:** macOS (darwin 25.1.0) · Node `v24.15.0` · npm `11.12.1` · run 2026-07-12, repo root, offline ($0 — no LLM, no network; the suites' own network-denial gates enforce this). Data: SIMULATED fixtures throughout.

**Capture policy (stated, not implied):** every engine-command transcript is reproduced **verbatim and complete** (§defect, §0a, §0c); each vitest run's summary block is reproduced **verbatim in the appendix**, with the §1–§7 table carrying condensed extractions of those blocks (labeled as such). Exactly **one elision**: the corrected §0b command's 230-line machine-JSON report body (head + parsed counts shown; elision stated in place). Nothing else is trimmed.

---

## The defect this record caught (and its fix)

Running §0's menu-truth command **exactly as SHOWCASE.md published it** failed:

```
$ node bin/check.mjs --feed fixtures/synthetic-restaurant/acp-feed.drifted.json --against fixtures/synthetic-restaurant/sor.catalog.json --surface acp
Unknown command: --feed

verifier — deterministic serving-copy checker (simulated corpus)

Usage:
  check <feed.json> --against <catalog.json> [--surface acp|ucp] [--json]
      TRUTH leg: verify a serving copy against the SOR catalog (does it LIE?).
      Exit 0 = clean, 1 = drift found.
  check <doc.json> --conformance [--op search|lookup|get_product] [--json]
      CONFORMANCE leg: validate a UCP catalog-response document against the pinned
      published UCP schemas (is it correctly SHAPED?). No --against needed — the
      reference is the schema. Exit 0 = conformant, 1 = schema violation(s).
  fees <statement.json> [--json]
      FEE-AUDIT leg (F1a, UC-1): audit a monthly delivery fee statement against
      the codified NYC §20-563.3 caps (deterministic, $0, no LLM). Classification
      is AS-DECLARED by the platform — this CLI path is the deterministic
      baseline and never invokes the separately-evaluated live LLM classifier
      lane (calibrated 2026-07-09 on a pre-registered held-out split; advisory,
      key-gated, reachable only through the tool-registry surface, never here).
      Prints a two-register text report, or the machine report with --json.
      Exit 0 = no violations, 1 = at least one violation, 2 = usage / bad input.
  demo [--json]
      DEMO leg (D1): play the scripted walkthrough on the shipped corpus — a
      spec-faithful simulated agent follows a spec-valid but false surface; the
      verifier catches the surface/SOR mismatch. Deterministic, $0, zero-config.
      Prints plain text, or the machine transcript with --json. Always exit 0.
  help
      Show this message.

Notes:
  - No LLM / network calls on either path (C1: $0-LLM; conformance reads pinned
    schemas from disk via ajv).
  - Output is the machine-readable report (JSON) on stdout — CI-usable, always
    carrying the C10 header surface (specVersion · matchingMode · simulated).
    --json is the explicit, trailing alias for that default serialization.
  - Unknown flags, surplus positionals, and mixed modes exit 2 (loud) — a typo
    never silently falls back to a default, and --conformance never silently
    swallows a truth-leg request (the legs are separate commands by design).
  - conformance vs truth: a spec-VALID document can still be FALSE. The two legs
    answer different questions and use distinct rule families (LST-* vs LST-CONF-*).
  - --surface defaults to acp; --op defaults to search.
  - Zero-config demos: npm run check:fixtures  |  npm run check:conformance
```
**Exit code: 2** (the CLI's loud-usage exit — by design, a typo never silently runs a default). Output above is the complete captured stderr, verbatim.

The published command omitted the `check` subcommand and used a `--feed` flag that has never existed in this CLI (the feed is a positional; canonical form in `package.json` `check:fixtures`). **Fix, same slice:** SHOWCASE.md §0 corrected to `node bin/check.mjs check <feed> --against <catalog> --surface acp`, with a dated correction note. The corrected command's run is §0b below. *This is the point of generating the record against verbatim commands: documentation that claims to be runnable gets run.*

---

## §0a — fee audit (drifted statement)

```
$ node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json
```
**Exit code: 1** (violations found — the documented CI-usable signal).

```
UC-1 FEE AUDIT — deterministic spine (SIMULATED statement vs REAL codified NYC §20-563.3)
spec: uc1-rule-table-draft/2026-07-03+NYC§20-563.3+LL79-2025+base-U1-unresolved
classification: as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)
assumed purchase-price base (U1 unresolved): order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)
verdict: FAIL (violations present)
findings: 5 — violation 5, conditional 0, cured 0, asserted-passthrough 0

• [VIOLATION] NYC-563.3-d-1 (§ 20-563.3(d) (category lock)) — bundling
    Line "Combined service + delivery bundle" is charged under the non-permitted category "service_and_delivery" ($1.50 on order ORD-3) — §20-563.3(d) permits only the four categories; any other fee is unlawful.
    ▸ The bill charges $1.50 as "service_and_delivery" — that isn't one of the four fee types the law allows, so it's not permitted no matter what it's called.
• [VIOLATION] NYC-563.3-d-4 (§ 20-563.3(d) (gating clause)) — misclassification
    An enhanced service fee is charged but the statement carries no basic service fee — §20-563.3(d) permits the enhanced tier only for a platform that also offers (and charges a basic service fee for) the basic service.
    ▸ They billed an 'extras' fee without ever offering the plain basic plan — the law only allows the extras fee if the basic plan exists too.
• [VIOLATION] NYC-563.3-a-2 (§ 20-563.3(a) (averaging clause)) — over-cap [provisional: U1-base]
    Delivery fees total $14.40 on $90.00 of monthly purchases = 16.0% vs the 15% cap (NYC-563.3-a-2); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1); violation (the 30-day refund window has closed with no covering refund).
    ▸ Across the month, delivery fees came to 16.0% of order value — over the 15% limit even on the monthly average. The 30-day window to refund the overcharge has closed with no refund, so this is a violation. (Depends on the still-open definition of "purchase price", U1.)
• [VIOLATION] NYC-563.3-c-1 (§ 20-563.3(c)) — processing-fee-base-inflation [provisional: U1-base]
    Transaction fee $1.60 on order ORD-1 is 8.0% of the purchase price — over the hard 3% cap, not documented as a pass-through (§20-563.3(c)); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1). No refund safe harbor applies to the transaction fee.
    ▸ The card-processing fee here is 8.0% — over the flat 3% limit, with no proof it's just passing through the real card cost. (This depends on what "purchase price" includes — still an open question, U1.)
• [VIOLATION] NYC-563.3-d-1 (§ 20-563.3(d) (category lock)) — promotion-deduction-mischaracterization
    Line "Promo recovery charge" is charged under the non-permitted category "promotion_deduction" ($1.20 on order ORD-4) — §20-563.3(d) permits only the four categories; any other fee is unlawful.
    ▸ The bill charges $1.20 as "promotion_deduction" — that isn't one of the four fee types the law allows, so it's not permitted no matter what it's called.

Note: SIMULATED statements audited against REAL codified law. No real-platform access or data.
```

## §0b — menu truth (drifted feed vs SOR catalog)

Published (broken) form: **exit 2** — transcript above. Corrected form:

```
$ node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.drifted.json --against fixtures/synthetic-restaurant/sor.catalog.json --surface acp
```
**Exit code: 1** (drift found — as documented).

Output is the machine-readable report JSON (230 lines). Head, verbatim:

```
{
  "specVersion": "taxonomy-v1+acp-extract-2026-07-02+ucp-pin-2026-04-08",
  "matchingMode": "synthetic-controlled",
```
**Counts (parsed from the full captured output):** `findings: 16` — severity `error: 11 · warn: 5` · `simulated: true` · `ok: false`. This is byte-consistent with the committed golden (`expected-report.acp.json`: 16 findings, 11/5/0). *Elision note: the remaining ~215 JSON lines (the finding objects themselves) are omitted here; re-run the command at the named SHA to reproduce them exactly — the goldens pin them.*

## §0c — the scripted walkthrough

```
$ node bin/check.mjs demo
```
**Exit code: 0** (a walkthrough, not a gate — as documented). The complete 65-line transcript, verbatim:

```
============================================================================
Curbside Commons — verifier demo (SIMULATED)
============================================================================

Demo claim: a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch
Actor:      spec-faithful demonstration actor — simulated
Spec pin:   taxonomy-v1+acp-extract-2026-07-02+ucp-pin-2026-04-08
Simulated:  true

----------------------------------------------------------------------------
BEAT 1 · The agent reads the published serving copy — spec-faithful demonstration actor — simulated

  ▸ A shopping agent reads the published menu feed — the same data any AI assistant would consume — and never sees the restaurant's own records.

  intent: Order the "Smoked Brisket Plate" if the published feed lists it as available.
  source read: the published ACP serving copy only (no system-of-record access)

----------------------------------------------------------------------------
BEAT 2 · The agent selects an item, trusting the surface

  ▸ Trusting the feed at face value, the agent picks its target item and is ready to order it at the price the surface shows.

  selected item: "Smoked Brisket Plate" (row id item-006-v1)
  read off the surface: price 12.00 USD · availability in_stock
  the agent is now ready to order at that price — the demo stops here (no checkout).

  verdict: [OK] SELECTED (from the surface)

----------------------------------------------------------------------------
BEAT 3 · The verifier checks that same copy against the records

  ▸ The verifier checks the exact same feed against the restaurant's system-of-record and flags what the agent had no way to see.

  1 finding for the selected item ("Smoked Brisket Plate"); full report: 16 findings across the whole copy.

  verdict: [FLAG] DRIFT ON THE SELECTED ITEM — the agent could not have seen it

  evidence (each catch carries its four receipts):
    01. [ERROR] The served price 12.00 does not match the catalog price 10.00.
        claim:      item-006-v1#price.amount  (acp-feed · price.amount = 12.00)
        reference:  item-006-v1
        rule:       LST-PRICE-VALUE
        class:      price

----------------------------------------------------------------------------
BEAT 4 · Conformance-foil: spec-valid is not the same as true

  ▸ The same document passes the official schema check — it is correctly shaped — and still misstates the price versus the records.

  passes the official schema check; still lies — conformance: PASS (spec-shape); truth: 1 finding(s) vs the system-of-record.

  verdict: [OK] CONFORMANT (spec-valid)
  verdict: [FLAG] FALSE vs SOR (still lies)

  evidence (each catch carries its four receipts):
    01. [ERROR] The served price 23.50 does not match the catalog price 21.50.
        claim:      item-001-v1#price.amount  (ucp-catalog · price.amount = 23.50)
        reference:  item-001-v1
        rule:       LST-PRICE-VALUE
        class:      price

============================================================================
No language model runs in this demo; the comparison is exact, deterministic
logic. Simulated data, run on demand — not a live service, no platform access.
============================================================================
```

Relationship to the committed `docs/assets/demo.svg`: the SVG is rendered by `scripts-ts/render-demo-svg.mts` from its own live `node bin/check.mjs demo` run — **line-for-line the same output after that generator's recorded normalization** (CRLF→LF; trailing newlines trimmed before splitting; `render-demo-svg.mts:28`). It is not claimed byte-identical to this raw capture.

## §1–§7 — the eval suites (vitest; table = condensed extractions, verbatim blocks in the appendix)

| SHOWCASE § | Command | Exit | Result (verbatim from the run) |
|---|---|---|---|
| 1 · tool registry | `npx vitest run evals/tools` | **0** | `Test Files 6 passed (6) · Tests 90 passed (90)` |
| 2 · MCP server | `npx vitest run evals/mcp` | **0** | `Test Files 5 passed (5) · Tests 50 passed (50)` |
| 3 · crew harness | `npx vitest run evals/crew` | **0** | `Test Files 7 passed (7) · Tests 50 passed (50)` |
| 4 · delivery builders | `npx vitest run evals/delivery` | **0** | `Test Files 1 passed (1) · Tests 16 passed (16)` |
| 5 · n8n lane | `npx vitest run evals/n8n` | **0** | `Test Files 1 passed (1) · Tests 6 passed (6)` |
| 6 · approvals simulator | `npx vitest run evals/approvals` | **0** | `Test Files 2 passed (2) · Tests 28 passed (28)` |
| 7 · RAG + entity (the two deferred lanes) | `npx vitest run evals/rag evals/entity` | **0** | `Test Files 8 passed (8) · Tests 70 passed (70)` |
| 1 (second command) · RAG gates standalone | `npx vitest run evals/rag` | **0** | `Test Files 5 passed (5) · Tests 47 passed (47)` — run **2026-07-13 at `a81edd2`** (added by the batch-E amendment; omitted from the first cut). Provenance: `git diff d936998..a81edd2 -- evals/rag lib/rag` is **empty**, so the suite and the code under test are byte-identical to the named SHA. |

(§2's transcript also carries Node's `MODULE_TYPELESS_PACKAGE_JSON` performance warnings — reproduced verbatim in the appendix; noise, not failure. SHOWCASE §1's second command now has its own standalone row above, per the batch-E amendment.)

## Appendix — the vitest summary blocks, verbatim

Each block below is the complete captured output of its run (the 2026-07-12 runs at `d936998`; the standalone `evals/rag` run 2026-07-13 at `a81edd2` as provenanced above).

### §1 `npx vitest run evals/tools`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  6 passed (6)
      Tests  90 passed (90)
   Start at  23:02:41
   Duration  753ms (transform 1.12s, setup 753ms, import 1.81s, tests 282ms, environment 1ms)
```
### §2 `npx vitest run evals/mcp`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons

(node:93521) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/sharan_98/Desktop/curbside-commons/lib/mcp/server.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/sharan_98/Desktop/curbside-commons/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:93520) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/sharan_98/Desktop/curbside-commons/lib/mcp/server.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/sharan_98/Desktop/curbside-commons/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:93522) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/sharan_98/Desktop/curbside-commons/lib/mcp/server.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/sharan_98/Desktop/curbside-commons/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:93525) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/sharan_98/Desktop/curbside-commons/lib/mcp/server.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/sharan_98/Desktop/curbside-commons/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

 Test Files  5 passed (5)
      Tests  50 passed (50)
   Start at  23:02:42
   Duration  1.05s (transform 442ms, setup 335ms, import 832ms, tests 1.63s, environment 0ms)
```
### §3 `npx vitest run evals/crew`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  7 passed (7)
      Tests  50 passed (50)
   Start at  23:02:43
   Duration  673ms (transform 1.01s, setup 493ms, import 2.13s, tests 425ms, environment 1ms)
```
### §4 `npx vitest run evals/delivery`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  23:02:44
   Duration  393ms (transform 126ms, setup 35ms, import 202ms, tests 53ms, environment 0ms)
```
### §5 `npx vitest run evals/n8n`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  23:02:45
   Duration  813ms (transform 154ms, setup 42ms, import 230ms, tests 434ms, environment 0ms)
```
### §6 `npx vitest run evals/approvals`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  23:02:46
   Duration  215ms (transform 63ms, setup 78ms, import 59ms, tests 16ms, environment 0ms)
```
### §7 `npx vitest run evals/rag evals/entity`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  8 passed (8)
      Tests  70 passed (70)
   Start at  23:02:47
   Duration  3.70s (transform 704ms, setup 576ms, import 1.20s, tests 4.19s, environment 0ms)
```
### §1 (second command) `npx vitest run evals/rag` — 2026-07-13, `a81edd2`
```

 RUN  v4.1.9 /Users/sharan_98/Desktop/curbside-commons


 Test Files  5 passed (5)
      Tests  47 passed (47)
   Start at  09:32:48
   Duration  4.84s (transform 713ms, setup 570ms, import 1.32s, tests 5.06s, environment 0ms)
```

## Honest boundaries

- Every run above is **offline, $0, on SIMULATED data**; nothing here demonstrates real-platform access, real merchant data, or business impact.
- The two deferred lanes (E2 retrieval · E4 entity resolution) pass their *suites* because those suites **lock the missed-floors results and the deferred labels** — a green here means "the deferral is intact," not "the floors were met."
- This record is evidence that the showcase commands ran on 2026-07-12 at the named SHA. It is not a claim about any other commit, environment, or date.
