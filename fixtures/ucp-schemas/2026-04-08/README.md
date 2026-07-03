# Pinned UCP JSON Schemas — `2026-04-08`

Professional register leads; *plain-English lines are marked ▸*.

## What this is

The official **Universal Commerce Protocol (UCP)** JSON Schemas, pinned verbatim
at spec version **`2026-04-08`** (the `v2026-04-08` release tag of the
`Universal-Commerce-Protocol/ucp` spec repository). These are the **conformance
reference** for the listings pack's UCP *conformance* leg — `lib/packs/listings/conformance.ts`
compiles them with `ajv` and checks whether a catalog-response document is
*shaped* the way the protocol requires.

▸ *Plain: the official rulebook for what a UCP catalog answer must look like. We
downloaded it, froze it at one dated version, and check documents against it.*

## Provenance (verify before any public claim)

| Field | Value |
| --- | --- |
| Protocol | Universal Commerce Protocol (UCP) |
| Spec version pinned | `2026-04-08` |
| Source repo | `https://github.com/Universal-Commerce-Protocol/ucp` |
| Source tag | `v2026-04-08` (tag sha `a2d8bf0b8f`) |
| Raw base URL | `https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/v2026-04-08/source/schemas` |
| Access date | 2026-07-03 |
| Dialect | JSON Schema `draft/2020-12` |
| Files | 78 (`schemas/**`) |
| License | **Apache-2.0** (`LICENSE`; Copyright 2026 UCP Authors) — verified live from the repo `LICENSE` file |

Per-file `sha256` + `$id` + original repo path are recorded in `PROVENANCE.json`;
a freeze-integrity eval recomputes each hash and asserts it matches, so a pinned
schema cannot be edited without CI catching it.

## Repo-structure note (divergence recorded)

The W2 task expected the JSON Schemas to live in the `ucp-schema` repo. Verified
live on 2026-07-03: `ucp-schema` is the **Rust `compose`/`resolve`/`validate`
tool** (the cargo-only differential oracle, `v1.4.0`); the canonical JSON Schemas
live in the **sibling spec repo `ucp`** under `source/schemas/` (served at
`ucp.dev/schemas/...`). These are pinned from that authoritative source at the
spec tag whose name equals our `UCP_PINNED_VERSION`.

## How composition works (followed, not invented)

UCP layers an extensibility protocol on top of JSON Schema (per the `ucp-schema`
README, read as reference on 2026-07-03):

- Schemas cross-reference by **relative `$ref`** resolved against each file's
  absolute `$id` (`https://ucp.dev/schemas/...`). Our loader registers every
  pinned schema by its `$id`, so `ajv` resolves the whole graph client-side —
  this IS the "client-side schema composition" the protocol mandates.
- A catalog *search* response is validated against
  `catalog_search.json#/$defs/search_response` (required: `ucp`, `products`);
  a *lookup* response against `catalog_lookup.json#/$defs/lookup_response`.
- The protocol also carries **vendor vocabulary at schema level** — a `name`
  capability id and `ucp_request` / `ucp_response` / `ucp_shared_request`
  visibility annotations. Our `ajv` runs `strict:false`, so these are treated as
  non-constraining annotations while **every standard validation keyword**
  (`type`/`required`/`pattern`/`minItems`/`minimum`/`format`) is still enforced.
  **Honesty bound:** applying the annotations to derive per-operation views (the
  `resolve` step) is the official Rust tool's job — our runtime does *structural*
  conformance only. The `test:ucp-oracle` CI lane (`scripts-ts/ucp-oracle-diff.mts`)
  is what would catch any divergence, when `cargo` is present.

▸ *Plain: the rulebook comes in pieces that point at each other; we load all the
pieces so the checker can follow the pointers. The official checker also hides or
shows fields depending on the request type — we don't do that hiding step, so we
check shape, not per-request visibility, and say so.*
