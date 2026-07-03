/**
 * Listings pack (UC-2) — W0 PLACEHOLDER (plan §6, §7).
 *
 * Will hold the drift classes the comparator detects between a merchant SOR and
 * its serving copies (static ACP feed / live UCP catalog). No detectors yet — W1
 * fills them, and coverage is MEASURED per C6 (never an "all edge cases" claim).
 *
 * Plain: the menu-drift rulebook — the kinds of ways a menu copy can drift from
 * the merchant's real menu.
 */

/** Drift classes enumerated in plan §7 (listings). Names only in W0. */
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
  status: "placeholder-w0",
  classes: LISTINGS_DRIFT_CLASSES,
} as const;
