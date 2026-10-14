/**
 * Listings pack — synthetic SOR types (W1, plan §5 W1 + §8 data plan).
 *
 * The merchant system-of-record is modeled on the SQUARE CATALOG API OBJECT
 * SHAPE (CatalogItem → CatalogItemVariation → Money-in-cents, CatalogModifierList)
 * as a SIMULATED SUBSET. This is OUR INTERPRETATION of that public API shape for
 * a synthetic corpus — it is not Square data, not a Square client, and claims no
 * Square affiliation (C10). Stock state models plan §7's availability semantics
 * (in-stock · 86'd/sold-out · hidden).
 *
 * Plain: a fake-but-realistic restaurant menu in the shape a real point-of-sale
 * keeps it — items, size/option variations, prices in cents — clearly labeled
 * simulated.
 */

/** Availability in the SOR (plan §7 availability semantics). */
export type SorStockState = "in_stock" | "soldout_86" | "hidden";

/** One sellable variation of an item (≈ Square CatalogItemVariation subset). */
export interface SorVariation {
  /** Stable SOR id — the shared synthetic id the faithful feed reuses (C3). */
  readonly id: string;
  /** Variation name, e.g. "Small" / "Large". */
  readonly name: string;
  /** Price in integer cents (≈ Square Money.amount, USD). */
  readonly priceCents: number;
  readonly stock: SorStockState;
}

/** One modifier option (≈ Square CatalogModifier subset). */
export interface SorModifierOption {
  readonly id: string;
  readonly name: string;
  /** ≈ CatalogModifier.price_money.amount (USD cents). */
  readonly priceDeltaCents: number;
  /**
   * 86'd — the option is sold out while its item stays orderable (≈ Square
   * ModifierLocationOverrides.sold_out, which Square keeps PER LOCATION and
   * seller-set; this single-location corpus flattens it to one flag). Absent
   * means not sold out. Checked against developer.squareup.com
   * (CatalogModifier · ModifierLocationOverrides), read 2026-10-12.
   */
  readonly soldOut?: boolean;
}

/** A modifier list attached to an item (≈ Square CatalogModifierList subset). */
export interface SorModifierList {
  readonly id: string;
  readonly name: string;
  readonly options: readonly SorModifierOption[];
}

/** One menu item (≈ Square CatalogItem subset). */
export interface SorItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly variations: readonly SorVariation[];
  readonly modifierLists: readonly SorModifierList[];
}

/** Day of week, in the CatalogAvailabilityPeriod vocabulary. */
export type SorDayOfWeek = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

/**
 * One hours window (≈ Square CatalogAvailabilityPeriod: day_of_week ·
 * start_local_time · end_local_time, partial-time RFC 3339 "HH:MM:SS" local).
 * Checked against developer.squareup.com (CatalogAvailabilityPeriod, Beta
 * there), read 2026-10-12.
 */
export interface SorAvailabilityPeriod {
  readonly id: string;
  readonly dayOfWeek: SorDayOfWeek;
  readonly startLocalTime: string;
  readonly endLocalTime: string;
}

/**
 * The hours a category is sold (≈ CatalogCategory.availability_period_ids
 * resolved to their periods). Square attaches periods to the CATEGORY, not the
 * item — so does this record; an item inherits its category's windows.
 */
export interface SorCategoryAvailability {
  readonly category: string;
  readonly periods: readonly SorAvailabilityPeriod[];
}

/** The synthetic restaurant SOR — the truth side of every W1 check. */
export interface SyntheticCatalog {
  /** Honesty label — always true for this corpus (C10). */
  readonly simulated: true;
  /** Generator provenance so the corpus is reproducible (plan §8: seeded). */
  readonly generator: { readonly name: string; readonly seed: number; readonly version: string };
  /** ISO-4217 currency for all prices. */
  readonly currency: "USD";
  /** Fixed "now" for staleness rules — data, never a clock read (determinism). */
  readonly asOf: string;
  readonly merchantName: string;
  readonly items: readonly SorItem[];
  /**
   * Category hours (menu model, 2026-10-12). Optional: a record without it
   * states no hours, and a served window is then compared against "(none)".
   */
  readonly categoryAvailability?: readonly SorCategoryAvailability[];
}
