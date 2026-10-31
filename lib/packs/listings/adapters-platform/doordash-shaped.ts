/**
 * DoorDash-shaped menu adapter (S3, plan §§ 4, 9, 12; research record
 * docs/research/external-references-2026-10-31.md "Top 5" #1–#2).
 *
 * Shaped like DoorDash's public partner documentation (read 2026-10-31), not from
 * the platform; never called; not affiliated. That documentation says its
 * marketplace menu interface is "not yet generally available", so this file models
 * the published document shape only. Field NAMES are mirrored; no example text is
 * copied; every value this file ever reads is synthetic.
 *
 * Shape read (and nothing else — the ingest allow-list):
 *   { store, menus[] }
 *   menus[i]  { open_hours[{ day_index "MON", start_time, end_time }], menu }
 *   menu      { active, categories[] }
 *   category  { active, items[] }
 *   item      { name, description, merchant_supplied_id, active, price, base_price, extras[] }
 *   extra     { name, merchant_supplied_id, active, options[] }
 *   option    { name, merchant_supplied_id, active, price, base_price, extras[] }   (nested extras, ≤ 3 deep)
 * Every other key, at every depth (store fields, sort_id, tax_rate, is_alcohol,
 * min/max option counts, special_hours, a planted `customer_email` …) is dropped
 * unread. A named field of the wrong type is refused.
 *
 * Mapping onto the engine's ACP feed form (one row per item):
 *   item_id ← merchant_supplied_id · title ← name · description ← description;
 *   price ← `price` (the documentation's Delivery price) or, with
 *     `priceField: "base_price"`, `base_price` (Pickup / Storefront / Voice) — the
 *     channel is an explicit choice, never guessed (Codex 2026-10-12 § 2 A);
 *   availability ← `active:false` on the item (or on its category or menu) is the
 *     86, served as out_of_stock;
 *   modifiers ← extras[].options[] (option `active:false` = an 86'd option); an item
 *     that omits `extras` makes no add-on claim, `extras: []` claims "none";
 *   hours ← the menu's open_hours, attached to every item in that menu.
 * An item listed in two menus (lunch and dinner, say) is one row whose hours are
 * both menus' windows; if the two listings state anything else differently, the
 * document is refused — the copy would be saying two things about one id.
 *
 * PRICE UNIT — cents inferred, not stated by DoorDash. Its public partner
 * documentation (read 2026-10-31) pairs integer prices with dollar amounts in
 * prose and never names the unit. The unit
 * is therefore an explicit parameter, `priceUnit`, defaulting to "cents"; "dollars"
 * reads the same integers as whole dollars.
 *
 * Override vs sticky (the documentation's "respect attribute if manually set"
 * rule — the real-world analog of scenario 4): once a field is edited by hand in
 * the merchant portal, the integration's payload no longer changes the OVERRIDE
 * fields (name, description, sort order, min/max quantity, active) while the
 * STICKY fields (base price, calories, dietary tags) still follow the payload.
 * This adapter reads one document as it stands; it does not replay that rule —
 * a document that disagrees with the record is reported as disagreement with the
 * supplied record, never as a statement of which edit won.
 *
 * Not modeled (UNVERIFIED in the research record, so left out rather than filled
 * from memory or from any unofficial source): the time format of
 * start_time/end_time (HH:MM and HH:MM:SS are both accepted); date-specific
 * special_hours; per-option quantity rules.
 *
 * Plain: reads a menu written the way DoorDash's public developer pages describe
 * one — store, menus, categories, items, add-on groups, add-ons — and turns it
 * into the same rows the checker already reads, labeled as shaped like those
 * pages, never as DoorDash's own data.
 */
import type { AcpFeedHoursWindow, AcpFeedItem, AcpFeedModifier } from "../acp-feed.ts";
import { centsToDecimal, type AcpFeed } from "../acp-feed.ts";
import {
  SHAPED_LIKE_DOORDASH,
  UNSTATED_ROW_FIELDS,
  arrayAt,
  booleanAt,
  fail,
  idAt,
  integerPriceAt,
  localTimeAt,
  objectAt,
  stringAt,
  type PlatformShapedFeed,
  type ReadCtx,
} from "./shared.ts";

/** Whole cents (default) or whole dollars — the unit the documentation leaves unstated. */
export type DoorDashPriceUnit = "cents" | "dollars";

export interface DoorDashShapedOptions {
  /** Default "cents" — inferred from the public partner documentation, which does not state the unit. */
  readonly priceUnit?: DoorDashPriceUnit;
  /** Default "price" (Delivery); "base_price" = Pickup / Storefront / Voice. */
  readonly priceField?: "price" | "base_price";
}

/** The day codes the documentation's `day_index` uses (the record uses the same three letters). */
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
/** Nested option → extras → options, at most this many extra levels below an item. */
export const MAX_EXTRA_DEPTH = 3;

// ── the document types (what a builder writes; the adapter reads `unknown`) ──

export interface DoorDashShapedOption {
  readonly name: string;
  readonly merchant_supplied_id: string;
  readonly active: boolean;
  readonly price: number;
  readonly base_price?: number;
  readonly extras?: readonly DoorDashShapedExtra[];
}
export interface DoorDashShapedExtra {
  readonly name: string;
  readonly merchant_supplied_id: string;
  readonly active: boolean;
  readonly options: readonly DoorDashShapedOption[];
}
export interface DoorDashShapedItem {
  readonly name: string;
  readonly description: string;
  readonly merchant_supplied_id: string;
  readonly active: boolean;
  readonly price: number;
  readonly base_price?: number;
  readonly extras?: readonly DoorDashShapedExtra[];
}
export interface DoorDashShapedCategory {
  readonly name: string;
  readonly merchant_supplied_id: string;
  readonly active: boolean;
  readonly items: readonly DoorDashShapedItem[];
}
export interface DoorDashShapedOpenHours {
  readonly day_index: (typeof DAYS)[number];
  readonly start_time: string;
  readonly end_time: string;
}
export interface DoorDashShapedMenuEntry {
  readonly id: string;
  readonly open_hours: readonly DoorDashShapedOpenHours[];
  readonly menu: {
    readonly name: string;
    readonly merchant_supplied_id: string;
    readonly active: boolean;
    readonly categories: readonly DoorDashShapedCategory[];
  };
}
export interface DoorDashShapedDocument {
  readonly store: { readonly merchant_supplied_id: string };
  readonly menus: readonly DoorDashShapedMenuEntry[];
}

// ── the adapter ─────────────────────────────────────────────────────────────

function readOptions(
  ctx: ReadCtx,
  extras: readonly unknown[],
  path: string,
  depth: number,
  inheritedOut: boolean,
  toPrice: (n: number) => string,
  priceField: "price" | "base_price",
  out: AcpFeedModifier[],
): void {
  if (depth > MAX_EXTRA_DEPTH) fail(ctx, "depth", path, `extras nest deeper than ${MAX_EXTRA_DEPTH} levels below an item.`);
  extras.forEach((rawExtra, e) => {
    const ep = `${path}[${e}]`;
    const extra = objectAt(ctx, rawExtra, ep);
    const listId = idAt(ctx, extra, "merchant_supplied_id", ep);
    const listName = stringAt(ctx, extra, "name", ep, true) as string;
    const extraOut = inheritedOut || !booleanAt(ctx, extra, "active", ep, true);
    arrayAt(ctx, extra, "options", ep, true).forEach((rawOpt, o) => {
      const op = `${ep}.options[${o}]`;
      const opt = objectAt(ctx, rawOpt, op);
      const cents = integerPriceAt(ctx, opt, priceField, op);
      if (cents === undefined) fail(ctx, "missing-key", `${op}.${priceField}`, `the option states no \`${priceField}\`.`);
      const optOut = extraOut || !booleanAt(ctx, opt, "active", op, true);
      out.push({
        id: idAt(ctx, opt, "merchant_supplied_id", op),
        list_id: listId,
        list_name: listName,
        name: stringAt(ctx, opt, "name", op, true) as string,
        price_delta: toPrice(cents),
        availability: optOut ? "out_of_stock" : "in_stock",
      });
      readOptions(ctx, arrayAt(ctx, opt, "extras", op, false), `${op}.extras`, depth + 1, optOut, toPrice, priceField, out);
    });
  });
}

/** Canonical text of a row without its hours — two listings of one id must agree on it. */
const rowKey = (r: AcpFeedItem): string => JSON.stringify({ ...r, hours: undefined });

/**
 * Read a DoorDash-shaped menu document into the engine's feed form. Throws
 * {@link PlatformShapeError} (a ListingsInputError) on anything it cannot read.
 */
export function doordashShapedToFeed(doc: unknown, opts: DoorDashShapedOptions = {}): PlatformShapedFeed {
  const unit: DoorDashPriceUnit = opts.priceUnit ?? "cents";
  const priceField = opts.priceField ?? "price";
  const toPrice = unit === "cents" ? centsToDecimal : (n: number) => n.toFixed(2);
  const ctx: ReadCtx = { shapedLike: SHAPED_LIKE_DOORDASH, row: null };
  if (unit !== "cents" && unit !== "dollars") fail(ctx, "option", "priceUnit", `"${String(unit)}" is not a price unit this adapter knows (cents or dollars).`);
  if (priceField !== "price" && priceField !== "base_price") fail(ctx, "option", "priceField", `"${String(priceField)}" is not a price field (price or base_price).`);

  const root = objectAt(ctx, doc, "document");
  if (!("store" in root)) fail(ctx, "missing-key", "document.store", "the envelope has no `store` — this is not a DoorDash-shaped menu document.");
  objectAt(ctx, root.store, "document.store");
  const menus = arrayAt(ctx, root, "menus", "document", true);

  const rows = new Map<string, AcpFeedItem>();
  let rowNumber = 0;
  menus.forEach((rawEntry, m) => {
    ctx.row = null;
    const mp = `menus[${m}]`;
    const entry = objectAt(ctx, rawEntry, mp);
    const hours: AcpFeedHoursWindow[] = arrayAt(ctx, entry, "open_hours", mp, false).map((rawH, h) => {
      const hp = `${mp}.open_hours[${h}]`;
      const oh = objectAt(ctx, rawH, hp);
      const day = stringAt(ctx, oh, "day_index", hp, true) as string;
      if (!(DAYS as readonly string[]).includes(day)) fail(ctx, "type", `${hp}.day_index`, `"${day}" is not a day code (MON … SUN).`);
      return { day, open: localTimeAt(ctx, oh, "start_time", hp), close: localTimeAt(ctx, oh, "end_time", hp) };
    });
    const menu = objectAt(ctx, entry.menu, `${mp}.menu`);
    const menuOut = !booleanAt(ctx, menu, "active", `${mp}.menu`, true);
    arrayAt(ctx, menu, "categories", `${mp}.menu`, true).forEach((rawCat, c) => {
      ctx.row = null;
      const cp = `${mp}.menu.categories[${c}]`;
      const cat = objectAt(ctx, rawCat, cp);
      const catOut = menuOut || !booleanAt(ctx, cat, "active", cp, true);
      arrayAt(ctx, cat, "items", cp, true).forEach((rawItem, i) => {
        rowNumber += 1;
        ctx.row = rowNumber;
        const ip = `${cp}.items[${i}]`;
        const item = objectAt(ctx, rawItem, ip);
        const id = idAt(ctx, item, "merchant_supplied_id", ip);
        const cents = integerPriceAt(ctx, item, priceField, ip);
        if (cents === undefined) fail(ctx, "missing-key", `${ip}.${priceField}`, `the item states no \`${priceField}\`.`);
        const out = catOut || !booleanAt(ctx, item, "active", ip, true);
        // An item that omits `extras` states nothing about add-ons (the documentation's
        // omit-don't-null rule); `extras: []` states "none" — a claim the record can contradict.
        let modifiers: AcpFeedModifier[] | undefined;
        if (item.extras !== undefined) {
          modifiers = [];
          readOptions(ctx, arrayAt(ctx, item, "extras", ip, true), `${ip}.extras`, 1, false, toPrice, priceField, modifiers);
        }
        const row: AcpFeedItem = {
          ...UNSTATED_ROW_FIELDS,
          item_id: id,
          title: stringAt(ctx, item, "name", ip, true) as string,
          description: stringAt(ctx, item, "description", ip, false) ?? "",
          price: toPrice(cents),
          availability: out ? "out_of_stock" : "in_stock",
          group_id: id,
          ...(modifiers !== undefined ? { modifiers } : {}),
          ...(hours.length > 0 ? { hours } : {}),
        };
        const prior = rows.get(id);
        if (prior === undefined) {
          rows.set(id, row);
        } else if (rowKey(prior) === rowKey(row)) {
          rows.set(id, { ...prior, hours: [...(prior.hours ?? []), ...hours] });
        } else {
          fail(ctx, "duplicate", ip, `merchant_supplied_id "${id}" is listed again with different contents — the copy states two things about one id.`);
        }
      });
    });
  });
  return { simulated: true, spec: "acp-product-feed/extract-2026-07-02", shapedLike: SHAPED_LIKE_DOORDASH, items: [...rows.values()] };
}

// ── the builder (the inverse on every stated field; used by tests and the scenario generator) ──

export interface ReshapeOptions {
  /** The category a row belongs to (the record's, read by the generator — the copy form carries none). */
  readonly categoryOf: (row: AcpFeedItem) => string;
  readonly storeId: string;
}

const decimalToCents = (d: string): number => {
  const m = /^(\d+)\.(\d{2})$/.exec(d);
  if (!m) throw new Error(`reshape: "${d}" is not a two-decimal amount`);
  return Number(m[1]) * 100 + Number(m[2]);
};

/**
 * Write an ACP-form copy as a DoorDash-shaped document: one menu (holding one
 * category) per (category, hours) pair, one item per row, one extra per modifier
 * list. Prices in whole cents. Deterministic: order follows the feed.
 */
export function acpFeedToDoorDashShaped(feed: AcpFeed, opts: ReshapeOptions): DoorDashShapedDocument {
  const groups = new Map<string, { category: string; hours: readonly AcpFeedHoursWindow[]; rows: AcpFeedItem[] }>();
  for (const row of feed.items) {
    const category = opts.categoryOf(row);
    const key = JSON.stringify([category, row.hours ?? []]);
    const g = groups.get(key) ?? { category, hours: row.hours ?? [], rows: [] };
    g.rows.push(row);
    groups.set(key, g);
  }
  const menus = [...groups.values()].map((g, n): DoorDashShapedMenuEntry => ({
    id: `menu-${n + 1}`,
    open_hours: g.hours.map((w) => ({ day_index: w.day as (typeof DAYS)[number], start_time: w.open, end_time: w.close })),
    menu: {
      name: g.category,
      merchant_supplied_id: `menu-${n + 1}`,
      active: true,
      categories: [
        {
          name: g.category,
          merchant_supplied_id: `category-${n + 1}`,
          active: true,
          items: g.rows.map((row): DoorDashShapedItem => {
            const lists = new Map<string, { name: string; options: DoorDashShapedOption[] }>();
            for (const m of row.modifiers ?? []) {
              const l = lists.get(m.list_id) ?? { name: m.list_name, options: [] };
              l.options.push({ name: m.name, merchant_supplied_id: m.id, active: m.availability === "in_stock", price: decimalToCents(m.price_delta) });
              lists.set(m.list_id, l);
            }
            return {
              name: row.title,
              description: row.description,
              merchant_supplied_id: row.item_id,
              active: row.availability === "in_stock",
              price: decimalToCents(row.price),
              ...(row.modifiers !== undefined
                ? { extras: [...lists.entries()].map(([id, l]) => ({ name: l.name, merchant_supplied_id: id, active: true, options: l.options })) }
                : {}),
            };
          }),
        },
      ],
    },
  }));
  return { store: { merchant_supplied_id: opts.storeId }, menus };
}
