/**
 * ACP product-feed model + faithful-feed builder (W1).
 *
 * Field surface follows the PRIMARY-EXTRACTED ACP feed conformance surface
 * (developers.openai.com/commerce product-feed spec, extracted 2026-07-02 —
 * see docs/research/pivot-research-2026-07.md ADDENDUM): required fields
 * (item_id ≤100 · title ≤150 · description ≤5000 · url · brand ≤70 · image_url ·
 * price + ISO-4217 currency · availability enum · seller_name/seller_url ·
 * is_eligible_search/is_eligible_checkout · target_countries/store_country),
 * conditionals (availability_date iff pre_order; seller_privacy_policy +
 * seller_tos iff checkout-eligible), cross-field invariants (sale_price ≤ price;
 * is_eligible_checkout ⇒ is_eligible_search), variant grouping (group_id +
 * variant_dict).
 *
 * HONESTY BOUNDS (C10, RULES §6):
 * - The ACP spec is RETAIL-SHAPED (no menu/modifier model as of 2026-07-02); the
 *   menu→feed mapping here is OUR INTERPRETATION, labeled, not spec text.
 * - Price serialization as a decimal string + separate ISO-4217 currency field is
 *   an INTERPRETATION (the extract pins "price + ISO-4217 currency", not an exact
 *   wire format) — flagged UNVERIFIED-in-repo; re-extract before public claims.
 * - Synthetic URLs use example.com and are NOT claimed to resolve (the spec's
 *   url-must-resolve rule is a live-network check, out of the $0 offline wedge).
 *
 * Plain: this file turns the fake menu into the feed format AI agents read, the
 * honest way — following the published field rules we extracted, and saying so
 * where the menu world needed choices the retail spec doesn't make.
 */
import type { SyntheticCatalog } from "./types.ts";

/** ACP availability enum — verbatim from the extracted spec surface. */
export type AcpAvailability =
  | "in_stock"
  | "out_of_stock"
  | "pre_order"
  | "backorder"
  | "unknown";

/** One ACP feed row (extracted required fields + used conditionals/optionals). */
export interface AcpFeedItem {
  readonly item_id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly brand: string;
  readonly image_url: string;
  /** Decimal-string amount (interpretation — see header) + ISO-4217 currency. */
  readonly price: string;
  readonly currency: string;
  readonly availability: AcpAvailability;
  readonly seller_name: string;
  readonly seller_url: string;
  readonly is_eligible_search: boolean;
  readonly is_eligible_checkout: boolean;
  readonly target_countries: readonly string[];
  readonly store_country: string;
  /** Variant grouping (extracted): all variations of one item share group_id. */
  readonly group_id: string;
  readonly variant_dict: Readonly<Record<string, string>>;
  /** Conditional: required iff pre_order (extracted). */
  readonly availability_date?: string;
  /** Conditional: required iff checkout-eligible (extracted). */
  readonly seller_privacy_policy?: string;
  readonly seller_tos?: string;
  /** Optional (extracted as present in spec): sale price and freshness stamps. */
  readonly sale_price?: string;
  readonly expiration_date?: string;
  readonly updated_at?: string;
}

/** A full feed document — labeled simulated (C10). */
export interface AcpFeed {
  readonly simulated: true;
  readonly spec: "acp-product-feed/extract-2026-07-02";
  readonly items: readonly AcpFeedItem[];
}

/** Integer cents → decimal-string dollars ("1899" → "18.99"). */
export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Build the FAITHFUL feed: one row per non-hidden SOR variation, sharing the SOR
 * variation id as item_id (synthetic-controlled matching, C3). Mapping choices
 * (documented interpretations): hidden variations are excluded from the feed;
 * soldout_86 maps to out_of_stock; every row is search- and checkout-eligible
 * with the conditional seller policy fields therefore present.
 */
export function buildFaithfulFeed(sor: SyntheticCatalog): AcpFeed {
  const sellerUrl = "https://example.com/curbside-commons-simulated";
  const items = sor.items.flatMap((item) =>
    item.variations
      .filter((v) => v.stock !== "hidden")
      .map((v): AcpFeedItem => {
        const variantDict: Record<string, string> = { variation: v.name };
        return {
          item_id: v.id,
          title: item.variations.length > 1 ? `${item.name} (${v.name})` : item.name,
          description: item.description,
          url: `${sellerUrl}/items/${item.id}`,
          brand: sor.merchantName,
          image_url: `${sellerUrl}/img/${item.id}.png`,
          price: centsToDecimal(v.priceCents),
          currency: sor.currency,
          availability: v.stock === "soldout_86" ? "out_of_stock" : "in_stock",
          seller_name: sor.merchantName,
          seller_url: sellerUrl,
          is_eligible_search: true,
          is_eligible_checkout: true,
          target_countries: ["US"],
          store_country: "US",
          group_id: item.id,
          variant_dict: variantDict,
          seller_privacy_policy: `${sellerUrl}/privacy`,
          seller_tos: `${sellerUrl}/tos`,
          updated_at: sor.asOf,
        };
      }),
  );
  return { simulated: true, spec: "acp-product-feed/extract-2026-07-02", items };
}
