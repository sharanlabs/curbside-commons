/**
 * Drift injector — W1 (plan §5 W1: "drift injector keyed to the §7 taxonomy").
 *
 * Takes the FAITHFUL feed + the SOR and produces the DRIFTED feed plus a
 * ground-truth manifest (class · target · before/after · surfaces). Injection is
 * fully deterministic: targets are selected by explicit predicates over the
 * generated catalog (first match in stable order), never randomly at inject
 * time. Each injection targets a row no earlier injection touched (tracked by
 * LIVE row id — including re-keyed ids — so injections never stack on one row
 * and every class is independently detectable). The manifest is what the C6
 * coverage eval and the C3 differential test measure against.
 *
 * Required by C3/Codex amendment 5 and asserted by tests: ≥1 identity/ID-mismatch
 * (entity-resolution) injection and ≥1 modifier/variant-ambiguity injection.
 *
 * Plain: we deliberately break the copy of the menu in each documented way a real
 * copy drifts — wrong price, showing a sold-out dish, a ghost item, a renamed id,
 * two variants that can't be told apart — one break per row, and we write down
 * every break so the tests know exactly what the verifier must catch.
 */
import type { AcpFeed, AcpFeedItem } from "./acp-feed.ts";
import type { SyntheticCatalog } from "./types.ts";
import type { ListingsDriftClass } from "./index.ts";

/** Which serving surfaces carry a given injected drift (C3 differential). */
export type DriftSurface = "both" | "acp-only" | "ucp-only";

/** One ground-truth manifest entry. */
export interface DriftManifestEntry {
  readonly id: string;
  readonly class: ListingsDriftClass;
  readonly targetFeedItemId: string;
  readonly field: string;
  readonly before: string;
  readonly after: string;
  readonly surfaces: DriftSurface;
  readonly note: string;
}

export interface DriftedFeedBundle {
  readonly feed: AcpFeed;
  readonly manifest: readonly DriftManifestEntry[];
}

/** Patch one row by id. THROWS if the id matches no row — a drift injection
 * must never silently no-op, or the manifest would overstate ground truth. */
function replaceRow(
  items: readonly AcpFeedItem[],
  itemId: string,
  patch: Partial<AcpFeedItem>,
): AcpFeedItem[] {
  if (!items.some((r) => r.item_id === itemId)) {
    throw new Error(`drift injector: replaceRow target ${itemId} not present`);
  }
  return items.map((r) => (r.item_id === itemId ? { ...r, ...patch } : r));
}

/**
 * Apply the W1 corpus drift set. Selection predicates are documented inline;
 * every mutation is recorded in the manifest. Throws if a predicate finds no
 * target (a generator change would then fail loudly, never silently un-cover a
 * taxonomy class).
 */
export function applyCorpusDrift(
  faithful: AcpFeed,
  sor: SyntheticCatalog,
): DriftedFeedBundle {
  let items: AcpFeedItem[] = [...faithful.items];
  const manifest: DriftManifestEntry[] = [];
  // LIVE ids of rows an injection has touched (re-keyed ids included) — every
  // subsequent injection selects only untouched rows.
  const touched = new Set<string>();
  const need = (row: AcpFeedItem | undefined, what: string): AcpFeedItem => {
    if (!row) throw new Error(`drift injector: no target for ${what}`);
    return row;
  };
  const firstUntouched = (pred: (r: AcpFeedItem) => boolean, what: string): AcpFeedItem =>
    need(items.find((r) => !touched.has(r.item_id) && pred(r)), what);

  // price/value — first untouched in-stock single-variation row: +$2.00 on the copy.
  {
    const t = firstUntouched(
      (r) => r.availability === "in_stock" && !r.title.includes("("),
      "price-value",
    );
    const after = (Number(t.price) + 2).toFixed(2);
    items = replaceRow(items, t.item_id, { price: after });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-001", class: "price", targetFeedItemId: t.item_id, field: "price",
      before: t.price, after, surfaces: "both",
      note: "price value drift: copy charges more than the SOR price",
    });
  }

  // price/cents-vs-decimal — next untouched in-stock row: decimal becomes raw cents.
  {
    const t = firstUntouched((r) => r.availability === "in_stock", "price-cents-vs-decimal");
    const after = String(Math.round(Number(t.price) * 100));
    items = replaceRow(items, t.item_id, { price: after });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-002", class: "price", targetFeedItemId: t.item_id, field: "price",
      before: t.price, after, surfaces: "both",
      note: "cents-vs-decimal drift: amount serialized as raw cents",
    });
  }

  // price/currency-form — next untouched row: ISO-4217 code lowercased.
  {
    const t = firstUntouched(() => true, "price-currency-form");
    items = replaceRow(items, t.item_id, { currency: t.currency.toLowerCase() });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-003", class: "price", targetFeedItemId: t.item_id, field: "currency",
      before: t.currency, after: t.currency.toLowerCase(), surfaces: "both",
      note: "currency-form drift: ISO-4217 code case-mangled",
    });
  }

  // price — sale_price > price on an untouched row (ACP-only field).
  {
    const t = firstUntouched(() => true, "price-sale-gt");
    const after = (Number(t.price) + 1).toFixed(2);
    items = replaceRow(items, t.item_id, { sale_price: after });
    touched.add(t.item_id);
    manifest.push({
      // §7 lists sale_price>price under the PRICE class (the cross-field-invariant
      // class covers eligibility implications + missing conditionals).
      id: "drift-004", class: "price", targetFeedItemId: t.item_id, field: "sale_price",
      before: "(unset)", after, surfaces: "acp-only",
      note: "price drift: sale_price exceeds price (extracted invariant sale_price ≤ price)",
    });
  }

  // cross-field — checkout-eligible while search-ineligible (ACP-only fields).
  {
    const t = firstUntouched(() => true, "xfield-checkout-search");
    items = replaceRow(items, t.item_id, { is_eligible_search: false });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-005", class: "cross-field-invariant", targetFeedItemId: t.item_id, field: "is_eligible_search",
      before: "true", after: "false", surfaces: "acp-only",
      note: "cross-field invariant break: is_eligible_checkout ⇒ is_eligible_search violated",
    });
  }

  // availability — an untouched 86'd (out_of_stock) row shown as in_stock.
  {
    const t = firstUntouched((r) => r.availability === "out_of_stock", "availability-86d-shown");
    items = replaceRow(items, t.item_id, { availability: "in_stock" });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-006", class: "availability", targetFeedItemId: t.item_id, field: "availability",
      before: "out_of_stock", after: "in_stock", surfaces: "both",
      note: "availability drift: 86'd item served as orderable",
    });
  }

  // availability — a HIDDEN SOR variation served on the surface at all.
  {
    const hidden = sor.items
      .flatMap((i) => i.variations.map((v) => ({ item: i, v })))
      .find(({ v }) => v.stock === "hidden");
    if (!hidden) throw new Error("drift injector: no hidden variation for availability-hidden");
    const row: AcpFeedItem = {
      item_id: hidden.v.id,
      title: hidden.item.variations.length > 1 ? `${hidden.item.name} (${hidden.v.name})` : hidden.item.name,
      description: hidden.item.description,
      url: `https://example.com/curbside-commons-simulated/items/${hidden.item.id}`,
      brand: sor.merchantName,
      image_url: `https://example.com/curbside-commons-simulated/img/${hidden.item.id}.png`,
      price: (hidden.v.priceCents / 100).toFixed(2),
      currency: sor.currency,
      availability: "in_stock",
      seller_name: sor.merchantName,
      seller_url: "https://example.com/curbside-commons-simulated",
      is_eligible_search: true,
      is_eligible_checkout: true,
      target_countries: ["US"],
      store_country: "US",
      group_id: hidden.item.id,
      variant_dict: { variation: hidden.v.name },
      seller_privacy_policy: "https://example.com/curbside-commons-simulated/privacy",
      seller_tos: "https://example.com/curbside-commons-simulated/tos",
      updated_at: sor.asOf,
    };
    items = [...items, row];
    touched.add(hidden.v.id);
    manifest.push({
      id: "drift-007", class: "availability", targetFeedItemId: hidden.v.id, field: "existence",
      before: "hidden (not served)", after: "served in_stock", surfaces: "both",
      note: "availability drift: hidden variation exposed on the serving surface",
    });
  }

  // existence — ghost item: a feed row with no SOR counterpart at all.
  {
    const ghost: AcpFeedItem = {
      ...need(items[0], "ghost-template"),
      item_id: "ghost-001",
      title: "Phantom Platter (simulated ghost item)",
      description: "A simulated ghost item that exists on the serving copy only.",
      group_id: "ghost-group",
      variant_dict: { variation: "Regular" },
      price: "9.99",
      availability: "in_stock",
    };
    items = [...items, ghost];
    touched.add("ghost-001");
    manifest.push({
      id: "drift-008", class: "existence", targetFeedItemId: "ghost-001", field: "existence",
      before: "(absent from SOR)", after: "served", surfaces: "both",
      note: "existence drift: ghost item — on the copy, not in the SOR",
    });
  }

  // existence — missing item: an untouched in-stock SOR variation dropped from the copy.
  {
    const t = firstUntouched((r) => r.availability === "in_stock", "existence-missing");
    items = items.filter((r) => r.item_id !== t.item_id);
    touched.add(t.item_id);
    manifest.push({
      id: "drift-009", class: "existence", targetFeedItemId: t.item_id, field: "existence",
      before: "served", after: "(missing from copy)", surfaces: "both",
      note: "existence drift: in-stock SOR item absent from the serving copy",
    });
  }

  // identity — ID-mismatch (entity resolution): stable id replaced by a legacy POS id.
  {
    const t = firstUntouched((r) => r.availability === "in_stock", "identity-id-mismatch");
    items = replaceRow(items, t.item_id, { item_id: "legacy-pos-4471" });
    touched.add(t.item_id);
    touched.add("legacy-pos-4471"); // the LIVE re-keyed id — later injections must skip it
    manifest.push({
      id: "drift-010", class: "identity", targetFeedItemId: t.item_id, field: "item_id",
      before: t.item_id, after: "legacy-pos-4471", surfaces: "both",
      note: "identity drift (REQUIRED class): copy keys the row by a legacy id — entity resolution must recover the SOR row by title",
    });
  }

  // identity — modifier/variant ambiguity: two variants of one group become indistinguishable.
  {
    // Both variant rows must still be present and untouched by earlier injections
    // (a deleted/re-keyed sibling would make this injection collide or no-op).
    const present = (id: string): boolean =>
      items.some((r) => r.item_id === id) && !touched.has(id);
    const group = sor.items.find((i) => {
      const vs = i.variations.filter((v) => v.stock !== "hidden");
      return vs.length >= 2 && vs.slice(0, 2).every((v) => present(v.id));
    });
    if (!group) throw new Error("drift injector: no multi-variation group for modifier-ambiguity");
    const [v1, v2] = group.variations.filter((v) => v.stock !== "hidden");
    items = replaceRow(items, v2.id, { variant_dict: { variation: v1.name } });
    touched.add(v2.id);
    manifest.push({
      id: "drift-011", class: "identity", targetFeedItemId: v2.id, field: "variant_dict",
      before: `{"variation":"${v2.name}"}`, after: `{"variation":"${v1.name}"}`, surfaces: "both",
      note: "identity drift (REQUIRED class): duplicate variant_dict — variants of the group are no longer distinguishable",
    });
  }

  // staleness — expired expiration_date (ACP-only field).
  {
    const t = firstUntouched((r) => r.availability === "in_stock", "staleness-expired");
    items = replaceRow(items, t.item_id, { expiration_date: "2026-01-01T00:00:00Z" });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-012", class: "staleness", targetFeedItemId: t.item_id, field: "expiration_date",
      before: "(unset)", after: "2026-01-01T00:00:00Z", surfaces: "acp-only",
      note: "staleness drift: row expired before the catalog asOf and is still served",
    });
  }

  // staleness — pre_order with a past availability_date (ACP-only fields).
  {
    const t = firstUntouched((r) => r.availability === "in_stock", "staleness-availability-date");
    items = replaceRow(items, t.item_id, {
      availability: "pre_order",
      availability_date: "2026-02-01T00:00:00Z",
    });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-013", class: "staleness", targetFeedItemId: t.item_id, field: "availability_date",
      before: "(in_stock)", after: "pre_order @ 2026-02-01", surfaces: "acp-only",
      note: "staleness drift: pre_order promise whose availability_date already passed (also an availability-state drift vs the SOR)",
    });
  }

  // encoding — UTF-8 mojibake on an untouched non-ASCII title.
  {
    const t = firstUntouched((r) => /[^ -~]/.test(r.title), "encoding-utf8");
    // Deterministic mojibake: encode the title's UTF-8 bytes as Latin-1 chars.
    const after = Array.from(new TextEncoder().encode(t.title), (b) => String.fromCharCode(b)).join("");
    items = replaceRow(items, t.item_id, { title: after });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-014", class: "encoding", targetFeedItemId: t.item_id, field: "title",
      before: t.title, after, surfaces: "both",
      note: "encoding drift: UTF-8 title double-encoded (mojibake) on the copy",
    });
  }

  // encoding — length-limit truncation of the longest untouched title.
  {
    const t = need(
      items
        .filter((r) => !touched.has(r.item_id))
        .sort((a, b) => b.title.length - a.title.length || a.item_id.localeCompare(b.item_id))[0],
      "encoding-truncation",
    );
    const after = `${t.title.slice(0, 10)}…`;
    items = replaceRow(items, t.item_id, { title: after });
    touched.add(t.item_id);
    manifest.push({
      id: "drift-015", class: "encoding", targetFeedItemId: t.item_id, field: "title",
      before: t.title, after, surfaces: "both",
      note: "encoding drift: title truncated by a length limit on the copy",
    });
  }

  return {
    feed: { simulated: true, spec: faithful.spec, items },
    manifest,
  };
}
