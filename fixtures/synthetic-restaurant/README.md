# synthetic-restaurant corpus — W1 (the wedge torture corpus)

**Plain-English:** a fake-but-realistic restaurant whose menu copies contain
deliberately planted lies, so the verifier has documented drift to catch. The
"answer key" (`drift-manifest.json`) records every planted lie; the golden
reports record exactly what the verifier catches. **Nothing here is real
merchant data — every artifact is SIMULATED and labeled so.**

---

## Contents

| File | What it is |
| --- | --- |
| `sor.catalog.json` | The merchant **system-of-record** — a simulated menu in a Square-Catalog-API-shaped subset (items → variations → prices in cents, modifier lists). The truth side of every check. |
| `acp-feed.faithful.json` | The truthful serving copy in the ACP product-feed shape (field surface per the primary-extracted spec, 2026-07-02; the menu→retail-shape mapping is our labeled interpretation). |
| `acp-feed.drifted.json` | The same feed with **15 planted drifts** across the plan §7 taxonomy. |
| `ucp-catalog-response.faithful.json` / `.drifted.json` | **Constructed simulations** of a UCP catalog-capability response shape over the same menu state (UCP food schemas are pending; we record none of this from any real marketplace and claim no access). The drifted response also skews `supported_versions` (§7 spec-version-skew). |
| `drift-manifest.json` | The ground-truth answer key: every injection's class, target row, before/after, and which surfaces carry it. |
| `expected-report.acp.json` / `expected-report.ucp.json` | The golden verifier reports for the drifted copies — byte-compared in CI (deterministic output ordering makes this exact). |

## Reproducibility (seeded, plan §8)

The corpus is the deterministic output of a seeded generator — no hand-tampering
is possible without CI catching it:

- Generator: `lib/packs/listings/generate.ts` at seed **20260703**, as-of **2026-07-03T00:00:00Z**.
- Regenerate everything: `node scripts-ts/generate-wedge-fixtures.mts`
- Freeze-integrity evals (`evals/packs/listings-wedge.test.ts`) assert the
  committed files byte-match regeneration.

## Run the verifier on this corpus (zero-config, C1)

```
# the drifted copy — exits 1 and prints every catch with receipts
node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.drifted.json \
  --against fixtures/synthetic-restaurant/sor.catalog.json

# the faithful copy — exits 0, zero findings
node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.faithful.json \
  --against fixtures/synthetic-restaurant/sor.catalog.json

# the constructed UCP response surface
node bin/check.mjs check fixtures/synthetic-restaurant/ucp-catalog-response.drifted.json \
  --against fixtures/synthetic-restaurant/sor.catalog.json --surface ucp
```

npm shortcuts: `npm run check:fixtures` (drifted — exits non-zero BY DESIGN; the
catch is the demo) · `npm run check:fixtures:clean` (faithful — exits 0). No LLM
or network call happens on any of these paths (C1: $0-LLM, enforced by an
import-graph eval).

## Taxonomy keying (C6 — measured, never overclaimed)

Every manifest entry carries its plan §7 drift class. Coverage of the 8
enumerated listings classes is **measured** by `evals/packs/listings-coverage-c6.test.ts`
(currently: 8/8 classes have ≥1 injection and 8/8 are caught across the two
surfaces). This is a statement about the enumerated taxonomy v1 — subcases the
taxonomy names but the corpus does not yet model (e.g. hours-window
availability) are visible in the plan §7 text, and coverage claims never extend
beyond what the eval measures.

## License

**License: not yet designated — an owner call gated on the Pub slice** (no
LICENSE file exists in this repo as of 2026-07-03; publication requires the
owner to pick one, per plan §5 Pub gate). Until then this corpus is
all-rights-reserved by default and NOT yet published.

## Honesty box

- All data simulated; the merchant, items, and prices are invented.
- The ACP mapping is our interpretation of a retail-shaped spec for a menu
  domain (labeled in `lib/packs/listings/acp-feed.ts`); the exact price wire
  format is UNVERIFIED-in-repo pending re-extraction.
- The UCP fixtures are constructed simulations of a response shape, not
  recordings of any real marketplace, agent, or merchant.
- No claim of real platform access, real drift rates, or real business impact.
