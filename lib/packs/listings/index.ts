/**
 * Listings pack (UC-2) — W1 (plan §5 W1, §7).
 *
 * The menu-truth pack: seeded synthetic SOR (Square-Catalog-shaped, simulated) →
 * faithful ACP-shaped feed → taxonomy-keyed drift injection → surface adapters
 * (ACP feed · constructed UCP catalog response) → deterministic detectors →
 * evidence-cited report. Coverage of the classes below is MEASURED by the C6
 * eval — bounded to the enumerated taxonomy, never claimed total.
 *
 * Plain: the menu-drift rulebook plus the machinery that builds a fake menu,
 * breaks its copies in documented ways, and proves the verifier catches every
 * documented break — with receipts.
 */

/** Drift classes enumerated in plan §7 (listings). */
export const LISTINGS_DRIFT_CLASSES = [
  "price",
  "availability",
  "existence",
  "identity",
  "staleness",
  "encoding",
  "spec-version-skew",
  "cross-field-invariant",
] as const;

export type ListingsDriftClass = (typeof LISTINGS_DRIFT_CLASSES)[number];

/** Pack descriptor — a real module so evals/packs can assert it loads. */
export const LISTINGS_PACK = {
  id: "listings",
  useCase: "UC-2",
  status: "w1-wedge",
  classes: LISTINGS_DRIFT_CLASSES,
} as const;

// Public pack surface (the CLI entry lives in ./cli.ts and is intentionally NOT
// re-exported here — it imports node:fs, which the browser-safe barrel avoids).
export type { SorItem, SorModifierList, SorVariation, SorStockState, SyntheticCatalog } from "./types.ts";
export { CORPUS_AS_OF, CORPUS_SEED, generateCatalog, mulberry32 } from "./generate.ts";
export type { AcpAvailability, AcpFeed, AcpFeedItem } from "./acp-feed.ts";
export { buildFaithfulFeed, centsToDecimal } from "./acp-feed.ts";
export type { DriftManifestEntry, DriftSurface, DriftedFeedBundle } from "./drift.ts";
export { applyCorpusDrift } from "./drift.ts";
export type { UcpCatalogItem, UcpCatalogResponseFixture } from "./ucp.ts";
export { UCP_PINNED_VERSION, buildUcpResponse } from "./ucp.ts";
export type {
  UcpPrice,
  UcpSearchResponse,
  UcpWireProduct,
  UcpWireVariant,
} from "./ucp-wire.ts";
export { buildUcpSearchResponse, ucpSearchResponseToClaims } from "./ucp-wire.ts";
export { acpFeedToClaims, ucpResponseToClaims } from "./adapters.ts";
export { expectedTitle, indexCatalog, sorReference } from "./reference.ts";
export { listingsDetectors, mojibake } from "./detectors.ts";
export { LISTINGS_SPEC_VERSION, runListingsVerification } from "./run.ts";
