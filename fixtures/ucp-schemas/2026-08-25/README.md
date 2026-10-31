# Pinned UCP JSON Schemas — `2026-08-25`

Professional register leads; *plain-English lines are marked ▸*.

## What this is

The official **Universal Commerce Protocol (UCP)** JSON Schemas, vendored verbatim
at spec version **`2026-08-25`** (the `v2026-08-25` release tag of the
`Universal-Commerce-Protocol/ucp` spec repository). This folder is **vendored and ACTIVE since 2026-10-31** (Wave 2 / S1.5b): the listings pack pins `2026-08-25` (`UCP_PINNED_VERSION`), and the `2026-04-08` folder stays vendored for comparison. It is checked by the conformance eval
(`evals/packs/ucp-conformance.test.ts`, which runs over both vendored versions) and
by the differential oracle, so the move to `2026-08-25` is a measured, separate
decision rather than a silent one.

▸ *Plain: the newer official rulebook, downloaded and frozen at its dated version,
sitting next to the one we use. We can test against it; we have not switched to it.*

## Provenance (verify before any public claim)

| Field | Value |
| --- | --- |
| Protocol | Universal Commerce Protocol (UCP) |
| Spec version vendored | `2026-08-25` |
| Source repo | `https://github.com/Universal-Commerce-Protocol/ucp` |
| Source tag | `v2026-08-25` (resolves to commit `cd78fb38e8…`; full sha `cd78fb38e819de77d9b527d110476eccb876f1bd`) |
| Raw base URL | `https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/v2026-08-25/source/schemas` |
| Access date | 2026-10-12 |
| Dialect | JSON Schema `draft/2020-12` |
| Files | 116 (`schemas/**`) |
| License | **Apache-2.0** (`LICENSE`; Copyright 2026 UCP Authors) — byte-identical to the repo `LICENSE` at the tag |

Per-file `sha256` + `$id` + original repo path are recorded in `PROVENANCE.json`;
a freeze-integrity eval recomputes each hash and asserts it matches, so a vendored
schema cannot be edited without CI catching it. The bytes were re-checked on
2026-10-12 against a fresh clone of the tag (`diff -r` clean, schemas and `LICENSE`).

## Layout change versus `2026-04-08` (recorded)

Same source repo and path (`source/schemas/`). The layout moved: types shared across
verticals now live under `common/types/` (they were under `shopping/types/`), and the
tree gained `common/*.json` capability schemas, `profile.json`,
`shopping/permalink.json` and `transports/*`. Every schema is still registered by its
absolute `$id` (`https://ucp.dev/schemas/...`), which is how the loader resolves the
whole graph, so `lib/packs/listings/conformance.ts` reads this folder without change.

## How composition works (unchanged from `2026-04-08`)

- Schemas cross-reference by **relative `$ref`** resolved against each file's absolute
  `$id`. Our loader registers every vendored schema by its `$id`, so `ajv` resolves the
  graph client-side — the "client-side schema composition" the protocol mandates.
- A catalog *search* response is validated against
  `catalog_search.json#/$defs/search_response`; a *lookup* response against
  `catalog_lookup.json#/$defs/lookup_response`.
- Vendor vocabulary at schema level (`name`, `ucp_request` / `ucp_response` /
  `ucp_shared_request` visibility annotations) is treated by `ajv` (`strict:false`) as
  non-constraining annotations; every standard validation keyword is still enforced.
  **Honesty bound:** deriving per-operation views (the `resolve` step) is the official
  Rust tool's job — our runtime does *structural* conformance only. The
  `test:ucp-oracle` lane (`scripts-ts/ucp-oracle-diff.mts`) is what catches divergence
  when `cargo` and `ucp-schema` are present.

▸ *Plain: the rulebook comes in pieces that point at each other; we load every piece so
the checker can follow the pointers. The official checker also hides or shows fields
depending on the request type — we don't do that hiding step, so we check shape, not
per-request visibility, and say so.*
