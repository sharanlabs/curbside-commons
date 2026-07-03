/**
 * Real UCP catalog-response WIRE model + builder + truth adapter — W2
 * (plan §5 W2, §3; criteria C3 surface-agnostic, conformance-vs-truth headline).
 *
 * W1 shipped a SIMPLIFIED normalized UCP fixture (`ucp.ts` — built when the UCP
 * food schemas were still pending). W2 pins the ACTUAL published UCP schemas, so
 * this module builds catalog-response documents in the REAL wire shape
 * (`catalog_search.json#/$defs/search_response`: `{ ucp, products }`, each product
 * `{ id, title, description, price_range, variants[≥1] }`, each variant
 * `{ id, title, description, price{amount(minor units),currency}, availability }`).
 * These documents are what the conformance leg (conformance.ts) validates with ajv.
 *
 * TWO purposes, one document shape:
 *  1. CONFORMANCE corpus — real-shaped docs the pinned schemas judge (C5).
 *  2. CONFORMANCE-VS-TRUTH headline — `ucpSearchResponseToClaims` feeds the SAME
 *     truth comparator (run.ts) a real-UCP document, so a doc that PASSES ajv can
 *     still be caught LYING about the SOR. This is a THIRD surface adapter into
 *     the one comparator (strengthens C3: ACP feed · normalized UCP · real UCP wire).
 *
 * HONESTY BOUND (C10): these are CONSTRUCTED SIMULATIONS of the real wire shape,
 * built deterministically from the synthetic SOR (variant ids reuse SOR ids so
 * matching is synthetic-controlled). Not recorded from any real marketplace.
 *
 * Plain: now that the official UCP menu-answer format exists, we build fake menu
 * answers in that real format. The checker can judge their shape (conformance),
 * and — because the ids line up with our fake till — the SAME referee can also
 * catch a real-shaped answer quoting the wrong price (truth).
 */
import type { Claim } from "../../verifier-core/index.ts";
import { centsToDecimal } from "./acp-feed.ts";
import type { SorItem, SorVariation, SyntheticCatalog } from "./types.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** A monetary amount in ISO-4217 MINOR units (cents), per amount.json. */
export interface UcpPrice {
  readonly amount: number;
  readonly currency: string;
}

/** Variant subset we populate (real variant.json has more optional fields). */
export interface UcpWireVariant {
  readonly id: string;
  readonly title: string;
  readonly description: { readonly plain: string };
  readonly price: UcpPrice;
  readonly availability: { readonly available: boolean; readonly status: string };
}

/** Product subset we populate (real product.json has more optional fields). */
export interface UcpWireProduct {
  readonly id: string;
  readonly title: string;
  readonly description: { readonly plain: string };
  readonly price_range: { readonly min: UcpPrice; readonly max: UcpPrice };
  readonly variants: readonly UcpWireVariant[];
}

/** A real-shaped `search_response` document (validated by conformance.ts). */
export interface UcpSearchResponse {
  readonly ucp: { readonly version: string; readonly status: "success" };
  readonly products: readonly UcpWireProduct[];
}

/** SOR stock → real UCP availability.status well-known value. */
function statusFor(stock: SorVariation["stock"]): string {
  return stock === "soldout_86" ? "out_of_stock" : "in_stock";
}

/** Build ONE real-UCP-wire variant from an SOR variation (price in minor units;
 * id reused for synthetic-controlled matching). */
function wireVariant(item: SorItem, v: SorVariation): UcpWireVariant {
  return {
    id: v.id,
    title: v.name,
    description: { plain: item.description },
    price: { amount: v.priceCents, currency: "USD" },
    availability: { available: v.stock !== "soldout_86", status: statusFor(v.stock) },
  };
}

/**
 * Build a faithful real-UCP `search_response` from the SOR. Hidden variations are
 * excluded (a live catalog answer would not serve them — mirrors buildFaithfulFeed);
 * `price_range` spans the included variants (required by product.json). Deterministic:
 * ordering follows the SOR, no clock, no randomness.
 */
export function buildUcpSearchResponse(sor: SyntheticCatalog): UcpSearchResponse {
  const products = sor.items
    .map((item): UcpWireProduct | null => {
      const variations = item.variations.filter((v) => v.stock !== "hidden");
      if (variations.length === 0) return null; // no purchasable variants → omit
      const prices = variations.map((v) => v.priceCents);
      return {
        id: item.id,
        title: item.name,
        description: { plain: item.description },
        price_range: {
          min: { amount: Math.min(...prices), currency: "USD" },
          max: { amount: Math.max(...prices), currency: "USD" },
        },
        variants: variations.map((v) => wireVariant(item, v)),
      };
    })
    .filter((p): p is UcpWireProduct => p !== null);
  return { ucp: { version: UCP_PINNED_VERSION, status: "success" }, products };
}

/**
 * Adapt a real-UCP `search_response` into the normalized claim language the truth
 * comparator reads — the THIRD surface adapter (C3). Emits the fields the
 * deterministic detectors check: existence, price (amount as decimal string +
 * currency), availability, and variant label. Title/identity are intentionally
 * NOT emitted here (the ACP + normalized-UCP adapters cover those; this adapter is
 * scoped to the price/availability conformance-vs-truth headline, and reconstructing
 * the SOR's serving-title convention from wire fields would be lossy). Claim rows
 * are keyed by variant id, which equals the SOR variation id (synthetic-controlled).
 */
export function ucpSearchResponseToClaims(doc: UcpSearchResponse): readonly Claim[] {
  const claims: Claim[] = [];
  for (const product of doc.products) {
    for (const variant of product.variants) {
      const availability =
        variant.availability.available && variant.availability.status !== "out_of_stock"
          ? "in_stock"
          : "out_of_stock";
      const rows: readonly (readonly [string, unknown])[] = [
        ["existence", true],
        ["price.amount", centsToDecimal(variant.price.amount)],
        ["price.currency", variant.price.currency],
        ["availability", availability],
        ["variant_dict", { group: product.id, dict: { variation: variant.title } }],
      ];
      for (const [field, value] of rows) {
        claims.push({ id: `${variant.id}#${field}`, source: "ucp-catalog", field, value });
      }
    }
  }
  return claims;
}
