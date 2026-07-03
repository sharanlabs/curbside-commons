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
  readonly priceDeltaCents: number;
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
}
