# The verifier corpus — index (W3 packaging, plan §5 W3 / C9)

**Plain-English:** this folder is the published test corpus for the verifier — a
self-contained set of made-up (but realistic) menu data plus the "answer keys"
that say exactly what the checker should catch. It comes in **two sets**, one for
each of the two questions the verifier answers. Everything here is **SIMULATED
and labeled so** — no real restaurant, platform, or merchant data.

**Professional register:** a reproducible, taxonomy-keyed fixture corpus that
drives the two verification legs — the **truth leg** (does a serving copy match
the merchant system-of-record?) and the **conformance leg** (is a UCP
catalog-response correctly shaped per the published schemas?). Seeded generators
make every byte reproducible; freeze-integrity evals lock the committed files to
their generators so the corpus cannot be hand-tampered without CI failing.

> **This corpus is packaged for publication but NOT yet published, and carries no
> license file.** See [Licensing](#licensing) below.

---

## The two sets

| Set | Directory | Which leg it drives | What it is |
| --- | --- | --- | --- |
| **Synthetic restaurant** | [`synthetic-restaurant/`](synthetic-restaurant/README.md) | Truth leg (`LST-*`) | A simulated restaurant system-of-record, faithful + deliberately-drifted serving copies (ACP feed + a constructed UCP response), a ground-truth drift manifest, and the golden verifier reports. |
| **Fee-audit (UC-1)** | [`synthetic-restaurant/fees/`](synthetic-restaurant/fees/README.md) | Fee truth leg (`NYC-563.3-*`) | Simulated monthly delivery **fee statements** (faithful + drifted + refund-window cases) audited against the real codified NYC §20-563.3 caps, with a machine answer key keyed to the plan §7 fee-line classes and golden fee-audit reports. |
| **UCP conformance CI** | [`ucp-conformance-ci/`](ucp-conformance-ci/manifest.json) | Conformance leg (`LST-CONF-*`) | 35 real-UCP-wire-shape catalog-response documents (14 valid + 21 each violating exactly one named schema rule) + a `manifest.json` ground-truth key, plus the headline `conformant-but-false.json` exhibit. |
| **UCP schemas (reference)** | [`ucp-schemas/`](ucp-schemas/2026-04-08/README.md) | Conformance leg (reference) | The 78 official UCP JSON Schemas (`v2026-04-08`), pinned + sha256-locked, Apache-2.0. This is upstream reference data, not our synthetic corpus — its own LICENSE stands and is untouched. |

Each set has its own README/manifest with the full contents table; this index
covers what spans both.

## Taxonomy keying (measured, never "all")

Every fixture is keyed to the class it exercises — the keying lives in the
machine-readable ground-truth file for each set, so coverage is **measured**, not
asserted:

- **Synthetic-restaurant** fixtures are keyed to the **plan §7 listings drift
  taxonomy** (`price · availability · existence · identity · staleness ·
  encoding · spec-version-skew · cross-field-invariant`) via
  `synthetic-restaurant/drift-manifest.json`. Coverage of the 8 enumerated
  classes is measured by `evals/packs/listings-coverage-c6.test.ts`.
- **UCP-conformance-ci** fixtures are keyed to the **8 structural conformance
  classes** (`LST-CONF-{REQUIRED-MISSING · TYPE · PATTERN · NUMBER-RANGE ·
  ARRAY-BOUNDS · FORMAT · OBJECT-SHAPE · ENUM}`) via
  `ucp-conformance-ci/manifest.json`. Verdicts are asserted per-fixture in
  `evals/packs/ucp-conformance.test.ts`.

These are two **different** taxonomies on two **different** axes (menu-truth drift
vs. schema-shape conformance) — the corpus keeps them separate on purpose, since
the whole point is that a spec-shaped document can still be untrue. Coverage
claims never extend beyond what the evals measure; there is no "all cases" claim
anywhere.

## Regenerate (seeded, deterministic)

Both sets are the deterministic output of seeded generators — regenerate and the
bytes must match (freeze-integrity evals enforce it):

```
npm run fixtures:wedge   # regenerates synthetic-restaurant/   (seed 20260703, as-of 2026-07-03)
npm run fixtures:ucp     # regenerates ucp-conformance-ci/      (seed 20260703, as-of 2026-07-03)
npm run fixtures:fees    # regenerates synthetic-restaurant/fees/ (seed 20260703; UC-1 fee statements + answer key + goldens)
npm run fixtures:demo    # regenerates synthetic-restaurant/expected-demo.{json,txt} (the D1 demo transcript goldens)
```

`synthetic-restaurant/expected-demo.{json,txt}` are the byte-frozen goldens of the
scripted demo transcript (`node bin/check.mjs demo` / `--json`): the JSON is what
the `/demo` page renders, and a test byte-asserts the live engine output against
it, so the web demo provably cannot drift from the real verifier.

The pinned UCP schemas under `ucp-schemas/` are NOT generated — they are a pinned
upstream fetch, sha256-recorded in their `PROVENANCE.json`.

## Run the verifier on the corpus (zero-config, C1)

```
# TRUTH leg — a drifted copy exits 1 and prints every catch with receipts (JSON)
node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.drifted.json \
  --against fixtures/synthetic-restaurant/sor.catalog.json

# CONFORMANCE leg — a valid UCP catalog-response exits 0
node bin/check.mjs check fixtures/ucp-conformance-ci/valid/search-full-catalog.json \
  --conformance
```

npm shortcuts: `npm run check:fixtures` · `npm run check:fixtures:clean` ·
`npm run check:conformance`. No LLM or network call happens on any path (C1:
$0-LLM, enforced by an import-graph eval). The report page at `/report` renders
the golden reports for these fixtures as a printable one-pager.

```
# DEMO leg (D1) — the scripted walkthrough on this corpus (always exits 0)
node bin/check.mjs demo          # plain text
node bin/check.mjs demo --json   # the machine transcript
```

The demo plays a labeled, simulated, SOR-blind demonstration actor over the
drifted copy, then the verifier over the same copy, then the conformance-foil
beat — deterministic, $0, rendered at `/demo` as a one-pager.

## Shape-honesty note (carried verbatim from `synthetic-restaurant/`)

> **Shape honesty note (W2):** the two `ucp-catalog-response.*.json` files are the
> truth-leg's **normalized/simplified** shape, built for W1 while the real UCP food
> schemas were still pending — they are **not** UCP wire-shape documents and (by
> design, nothing planted) do **not** pass the W2 conformance leg against the pinned
> real schemas (both miss required `ucp` + `products`; recorded verbatim in
> `docs/reviews/w2-verify-evidence.log`). Real wire-shape documents live in
> `fixtures/ucp-conformance-ci/` — the conformance leg runs there.

## Licensing

**License: pending owner decision.** This corpus is packaged for publication but
is **not yet published**, and **no license file is included** — the license is an
explicit owner call, gated on the plan's Pub slice (plan §5 / owner call O6).
Until the owner designates one, the corpus is all-rights-reserved by default.

*(Separate and untouched: `ucp-schemas/` carries the upstream **Apache-2.0**
license of the official UCP schemas, pinned from `Universal-Commerce-Protocol/ucp
@ v2026-04-08`. That is upstream reference data with its own standing license;
this "pending" decision is about OUR synthetic corpus only.)*

## Honesty box

- All menu data is simulated — the restaurant, items, and prices are invented.
- The pinned UCP **schemas** are real, pinned, and untrusted-fetched (quarantined
  data, never executed); they are labeled `simulated: false` in their provenance.
- No claim of real platform access, real drift rates, or real business impact.
- The ACP price wire format is our labeled interpretation and is
  UNVERIFIED-in-repo pending re-extraction (see `synthetic-restaurant/README.md`).
- Human-led, AI-assisted, professionally reviewed.
