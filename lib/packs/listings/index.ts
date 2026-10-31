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

/**
 * Menu-model drift classes (S1-engine, 2026-10-12). Each is a finer cut of one
 * taxonomy class above, owned by exactly one rule — so a report's `category`
 * stays inside the eight, and C6 measures these three by rule id.
 */
export const MENU_MODEL_DRIFT_CLASSES = ["modifier-price", "modifier-missing", "hours-window"] as const;

export type MenuModelDriftClass = (typeof MENU_MODEL_DRIFT_CLASSES)[number];

export const MENU_MODEL_RULES: Readonly<
  Record<
    MenuModelDriftClass,
    { readonly ruleId: string; readonly severity: "error" | "warn"; readonly category: ListingsDriftClass }
  >
> = {
  "modifier-price": { ruleId: "LST-MOD-PRICE-VALUE", severity: "error", category: "price" },
  "modifier-missing": { ruleId: "LST-MOD-MISSING", severity: "error", category: "existence" },
  "hours-window": { ruleId: "LST-HOURS-WINDOW", severity: "warn", category: "staleness" },
};

/** Pack descriptor — a real module so evals/packs can assert it loads. */
export const LISTINGS_PACK = {
  id: "listings",
  useCase: "UC-2",
  status: "w1-wedge",
  classes: LISTINGS_DRIFT_CLASSES,
} as const;

// Public pack surface (the CLI entry lives in ./cli.ts and is intentionally NOT
// re-exported here — it imports node:fs, which the browser-safe barrel avoids).
export type {
  SorAvailabilityPeriod,
  SorCategoryAvailability,
  SorDayOfWeek,
  SorItem,
  SorModifierList,
  SorModifierOption,
  SorVariation,
  SorStockState,
  SyntheticCatalog,
} from "./types.ts";
export {
  CORPUS_AS_OF,
  CORPUS_SEED,
  generateCatalog,
  generateMenuModelCatalog,
  mulberry32,
} from "./generate.ts";
export type {
  AcpAvailability,
  AcpFeed,
  AcpFeedHoursWindow,
  AcpFeedItem,
  AcpFeedModifier,
} from "./acp-feed.ts";
export { buildFaithfulFeed, centsToDecimal } from "./acp-feed.ts";
export type { ModifierOptionClaimValue, ModifierSetClaimValue, RecordModifierOption } from "./modifiers.ts";
export {
  buildFaithfulMenuFeed,
  menuModelClaims,
  minutesOfLocalTime,
  projectModifier,
  recordHours,
  recordModifierOptions,
  windowLabel,
} from "./modifiers.ts";
export type { DriftManifestEntry, DriftSurface, DriftedFeedBundle } from "./drift.ts";
export { applyCorpusDrift, applyMenuModelDrift, applyModifierPriceDrift } from "./drift.ts";
export type { UcpCatalogItem, UcpCatalogResponseFixture } from "./ucp.ts";
export { UCP_PINNED_VERSION, buildUcpResponse } from "./ucp.ts";
export type {
  UcpPrice,
  UcpSearchResponse,
  UcpWireProduct,
  UcpWireVariant,
} from "./ucp-wire.ts";
export { buildUcpSearchResponse, ucpSearchResponseToClaims } from "./ucp-wire.ts";
export { DuplicateFeedRowError, FeedShapeError, acpFeedToClaims, ucpResponseToClaims } from "./adapters.ts";
export type { DuplicateVariationId, VariationLocation } from "./reference.ts";
export {
  DuplicateVariationIdError,
  ListingsInputError,
  ReservedIdError,
  assertNoReservedVariationIds,
  assertUniqueVariationIds,
  duplicateVariationIdMessage,
  expectedTitle,
  findDuplicateVariationId,
  indexCatalog,
  reservedIdProblem,
  sorReference,
} from "./reference.ts";
export { HOURS_WINDOW_GRACE_MINUTES, hoursWindowDetector, listingsDetectors, mojibake } from "./detectors.ts";
export { LISTINGS_SPEC_VERSION, runListingsVerification } from "./run.ts";

// S3 (2026-10-31): platform-shaped inputs — shaped like the public partner
// documentation of two delivery platforms (read 2026-10-31), not from either;
// never called; not affiliated. Browser-safe (no node:fs).
export type {
  PlatformClaim,
  PlatformRefusalKind,
  PlatformShapedFeed,
  PlatformShapedReport,
  ShapedLike,
} from "./adapters-platform/shared.ts";
export {
  CARRIER_SENTENCE,
  PlatformShapeError,
  SHAPED_LIKE_DOORDASH,
  SHAPED_LIKE_UBER,
  UNSTATED_FIELDS,
  platformFeedToClaims,
  runPlatformShapedCheck,
  serializePlatformShapedReport,
} from "./adapters-platform/shared.ts";
export type {
  DoorDashPriceUnit,
  DoorDashShapedDocument,
  DoorDashShapedOptions,
} from "./adapters-platform/doordash-shaped.ts";
export { acpFeedToDoorDashShaped, doordashShapedToFeed } from "./adapters-platform/doordash-shaped.ts";
export type { UberShapedDocument, UberShapedOptions } from "./adapters-platform/uber-shaped.ts";
export { acpFeedToUberShaped, uberShapedToFeed } from "./adapters-platform/uber-shaped.ts";
export type { OrderErrorRow, OrderErrorsTrigger, OrderIssueType } from "./adapters-platform/order-errors-csv.ts";
export {
  ORDER_ERRORS_CARRIER,
  ORDER_ERRORS_COLUMNS,
  ORDER_ERRORS_SHAPED_LIKE,
  OrderErrorsCsvError,
  parseOrderErrorsCsv,
} from "./adapters-platform/order-errors-csv.ts";
