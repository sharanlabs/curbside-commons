/**
 * Surface adapters — W1 (C3: "one comparator, two adapters").
 *
 * Each adapter normalizes a serving surface into the SAME claim language
 * (field paths + value forms), so the comparator and detectors are truly
 * surface-agnostic: the ACP static feed and the constructed UCP catalog
 * response produce comparable claims, and the C3 differential test can assert
 * the same drift is caught from both.
 *
 * Claim id convention: `<servingRowId>#<fieldPath>`. Row-level context needed by
 * cross-field rules travels on a dedicated `invariants` claim; group-level
 * variant ambiguity travels on `variant_dict` claims.
 *
 * Plain: two translators turn "what the feed says" and "what the live answer
 * says" into the same list of checkable statements, so one referee can judge
 * both.
 */
import type { Claim } from "../../verifier-core/index.ts";
import type { AcpFeed, AcpFeedItem } from "./acp-feed.ts";
import type { UcpCatalogResponseFixture } from "./ucp.ts";

/** Cross-field tuple carried by the per-row `invariants` claim (ACP surface). */
export interface AcpInvariantsValue {
  readonly price: string;
  readonly sale_price?: string;
  readonly is_eligible_search: boolean;
  readonly is_eligible_checkout: boolean;
}

function rowClaims(
  source: Claim["source"],
  rowId: string,
  fields: readonly (readonly [string, unknown])[],
): Claim[] {
  return fields.map(([field, value]) => ({
    id: `${rowId}#${field}`,
    source,
    field,
    value,
  }));
}

/** Normalize an ACP feed into claims. */
export function acpFeedToClaims(feed: AcpFeed): readonly Claim[] {
  return feed.items.flatMap((r: AcpFeedItem) => {
    const invariants: AcpInvariantsValue = {
      price: r.price,
      ...(r.sale_price !== undefined ? { sale_price: r.sale_price } : {}),
      is_eligible_search: r.is_eligible_search,
      is_eligible_checkout: r.is_eligible_checkout,
    };
    return rowClaims("acp-feed", r.item_id, [
      ["existence", true],
      ["title", r.title],
      ["price.amount", r.price],
      ["price.currency", r.currency],
      ["availability", r.availability],
      ["variant_dict", { group: r.group_id, dict: r.variant_dict }],
      ...(r.expiration_date !== undefined
        ? ([["expiration_date", r.expiration_date]] as const)
        : []),
      ...(r.availability === "pre_order"
        ? ([["availability_date", r.availability_date ?? null]] as const)
        : []),
      ["invariants", invariants],
    ]);
  });
}

/**
 * Normalize a (constructed) UCP catalog response into claims. Availability
 * vocabulary is normalized to the shared enum (interpretation, documented:
 * available → in_stock, unavailable → out_of_stock). The response-level
 * `supported_versions` becomes a catalog-meta claim (§7 spec-version skew).
 */
export function ucpResponseToClaims(resp: UcpCatalogResponseFixture): readonly Claim[] {
  const meta: Claim = {
    id: "catalog#spec.supported_versions",
    source: "ucp-catalog",
    field: "spec.supported_versions",
    value: resp.supported_versions,
  };
  const perItem = resp.items.flatMap((it) =>
    rowClaims("ucp-catalog", it.id, [
      ["existence", true],
      ["title", it.title],
      ["price.amount", it.price.amount],
      ["price.currency", it.price.currency],
      ["availability", it.availability === "available" ? "in_stock" : "out_of_stock"],
      ["variant_dict", { group: it.group_id, dict: it.variant }],
    ]),
  );
  return [meta, ...perItem];
}
