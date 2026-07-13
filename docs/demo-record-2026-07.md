# Demo record — 2026-07 (S7, plan v3.3)

**What this is:** the committed record of one complete run of every `docs/SHOWCASE.md` command, executed **verbatim as published**, with captured transcripts and exit codes. It exists so a reviewer can see what the showcase actually does without running it — and so the showcase's own commands are periodically proven runnable.

**Source under test (named, per plan §S7):** commit **`d9369985b744228f85dc435fab5f1159cbb82ac4`** (`d936998`, main, pushed, CI green — run 29208347657 observed on its parent chain). *Committing this record necessarily advances HEAD past that SHA; this record names what it tested — it does NOT claim to be "the release SHA."*

**Environment:** macOS (darwin 25.1.0) · Node `v24.15.0` · npm `11.12.1` · run 2026-07-12, repo root, offline ($0 — no LLM, no network; the suites' own network-denial gates enforce this). Data: SIMULATED fixtures throughout.

**Capture policy (stated, not implied):** engine-command transcripts and vitest summary blocks are reproduced **verbatim**; the one long machine-JSON output (§0b, 230 lines) is excerpted with its counts stated and an explicit elision note. Nothing else is trimmed.

---

## The defect this record caught (and its fix)

Running §0's menu-truth command **exactly as SHOWCASE.md published it** failed:

```
$ node bin/check.mjs --feed fixtures/synthetic-restaurant/acp-feed.drifted.json --against fixtures/synthetic-restaurant/sor.catalog.json --surface acp
Unknown command: --feed
(usage text follows)
```
**Exit code: 2** (the CLI's loud-usage exit — by design, a typo never silently runs a default).

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
**Exit code: 0** (a walkthrough, not a gate — as documented). Transcript: **65 lines, byte-identical to the committed `docs/assets/demo.svg` source capture** (same generator contract as `scripts-ts/render-demo-svg.mts`); four beats — the actor reads the surface, selects trusting it, the verifier flags the drift the actor could not see (LST-PRICE-VALUE, 12.00 vs 10.00 on item-006-v1), and the conformance-foil (spec-valid, still false: 23.50 vs 21.50 on item-001-v1). Ends: *"No language model runs in this demo; the comparison is exact, deterministic logic. Simulated data, run on demand — not a live service, no platform access."*

## §1–§7 — the eval suites (vitest, verbatim summary blocks)

| SHOWCASE § | Command | Exit | Result (verbatim from the run) |
|---|---|---|---|
| 1 · tool registry | `npx vitest run evals/tools` | **0** | `Test Files 6 passed (6) · Tests 90 passed (90)` |
| 2 · MCP server | `npx vitest run evals/mcp` | **0** | `Test Files 5 passed (5) · Tests 50 passed (50)` |
| 3 · crew harness | `npx vitest run evals/crew` | **0** | `Test Files 7 passed (7) · Tests 50 passed (50)` |
| 4 · delivery builders | `npx vitest run evals/delivery` | **0** | `Test Files 1 passed (1) · Tests 16 passed (16)` |
| 5 · n8n lane | `npx vitest run evals/n8n` | **0** | `Test Files 1 passed (1) · Tests 6 passed (6)` |
| 6 · approvals simulator | `npx vitest run evals/approvals` | **0** | `Test Files 2 passed (2) · Tests 28 passed (28)` |
| 7 · RAG + entity (the two deferred lanes) | `npx vitest run evals/rag evals/entity` | **0** | `Test Files 8 passed (8) · Tests 70 passed (70)` |

(§2's transcript also carries Node's `MODULE_TYPELESS_PACKAGE_JSON` performance warnings — noise, not failure; recorded here so the transcript claim stays honest. §1's suite covers the RAG corpus-pin gate listed under SHOWCASE §1's second command; §7 re-runs `evals/rag` alongside `evals/entity`, so the 44 RAG tests are counted inside the 70.)

## Honest boundaries

- Every run above is **offline, $0, on SIMULATED data**; nothing here demonstrates real-platform access, real merchant data, or business impact.
- The two deferred lanes (E2 retrieval · E4 entity resolution) pass their *suites* because those suites **lock the missed-floors results and the deferred labels** — a green here means "the deferral is intact," not "the floors were met."
- This record is evidence that the showcase commands ran on 2026-07-12 at the named SHA. It is not a claim about any other commit, environment, or date.
