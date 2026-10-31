/**
 * Uber-shaped menu adapter (S3, plan §§ 4, 9, 12; research record
 * docs/research/external-references-2026-10-31.md "Top 5" #3–#4).
 *
 * Shaped like Uber Eats' public partner documentation (read 2026-10-31), not from
 * the platform; never called; not affiliated. That documentation says access to
 * its menu interface "may require written approval"; this file models the
 * published document shape only — field NAMES mirrored, no example text copied,
 * every value synthetic.
 *
 * Shape read (and nothing else — the ingest allow-list):
 *   { menus[], categories[], items[], modifier_groups[] }   all four REQUIRED
 *   menu   { service_availability[{ day_of_week "monday", time_periods[{ start_time "07:00", end_time }] }] }
 *   item   { id, title{translations{en_us}}, description, price_info{price},
 *            modifier_group_ids{ids[]}, suspension_info{suspension{suspend_until}} }
 *   group  { id, title{translations{en_us}}, modifier_options[{ type "ITEM", id }] }
 * Every other key at every depth (in_store_price, tax_info, quantity_info,
 * display_type, external_data, a planted `customer_phone` …) is dropped unread;
 * a named field of the wrong type is refused.
 *
 * Mapping onto the engine's ACP feed form (one row per item that is not an
 * add-on): price ← price_info.price, "in the lowest local currency denomination,
 * e.g. cents" (stated verbatim by Uber); modifiers ← each modifier group's
 * options, which REFERENCE other items (the option's name, price and suspension
 * are the referenced item's) — structurally unlike the nested options of the
 * other shape; the 86 ← suspension_info.suspension.suspend_until, Unix seconds:
 * null, absent or not after `asOf` = available, later than `asOf` = out_of_stock.
 * `asOf` is a required parameter — an instant passed as data, never a clock read.
 *
 * An item that omits modifier_group_ids makes no add-on claim; `{ ids: [] }`
 * claims "none".
 *
 * Rows: an item referenced as a modifier option is read as an add-on, not as a
 * menu row (an item that is both is read as an add-on only — the record then
 * reports the row missing, loudly, never silently).
 *
 * Hours: service_availability is per MENU; the field that ties a category to its
 * items is not named in the research record (UNVERIFIED — left out, never filled
 * from memory or from an unofficial source). So the item → menu path is known only
 * when the document has exactly ONE menu, and hours are attached only then; with
 * several menus the copy makes no hours claim.
 *
 * Category objects: the research record names the `categories` list (required)
 * and `menu.category_ids`, but no field ON a category. The adapter reads nothing
 * from a category; the builder writes `{ id, title }` by the title convention —
 * an inference, UNVERIFIED as field names.
 *
 * Description: named on the item; its form is not stated in the research record
 * (titles are stated as `{translations:{en_us}}`). Both a plain string and that
 * translations form are read (UNVERIFIED which one the documentation uses).
 *
 * Plain: reads a menu written the way Uber Eats' public developer pages describe
 * one — menus, categories, items, add-on groups that point at items — and turns
 * it into the rows the checker reads, labeled as shaped like those pages.
 */
import type { AcpFeed, AcpFeedHoursWindow, AcpFeedItem, AcpFeedModifier } from "../acp-feed.ts";
import { parseInstant } from "../instants.ts";
import {
  SHAPED_LIKE_UBER,
  UNSTATED_ROW_FIELDS,
  arrayAt,
  centsText,
  fail,
  idAt,
  integerPriceAt,
  localTimeAt,
  objectAt,
  stringAt,
  type PlatformShapedFeed,
  type ReadCtx,
} from "./shared.ts";

export interface UberShapedOptions {
  /** The instant a suspension is judged against (RFC 3339) — data, never the clock. */
  readonly asOf: string;
}

const DAY_CODES: Readonly<Record<string, string>> = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
  sunday: "SUN",
};

// ── the document types (what a builder writes; the adapter reads `unknown`) ──

export interface UberText {
  readonly translations: { readonly en_us: string };
}
export interface UberShapedItem {
  readonly id: string;
  readonly title: UberText;
  readonly description: UberText;
  readonly price_info: { readonly price: number };
  readonly modifier_group_ids?: { readonly ids: readonly string[] };
  readonly suspension_info?: { readonly suspension: { readonly suspend_until: number | null } };
}
export interface UberShapedGroup {
  readonly id: string;
  readonly title: UberText;
  readonly modifier_options: readonly { readonly type: "ITEM"; readonly id: string }[];
}
export interface UberShapedMenu {
  readonly id: string;
  readonly title: UberText;
  readonly service_availability: readonly {
    readonly day_of_week: string;
    readonly time_periods: readonly { readonly start_time: string; readonly end_time: string }[];
  }[];
  readonly category_ids: readonly string[];
}
export interface UberShapedDocument {
  readonly menus: readonly UberShapedMenu[];
  readonly categories: readonly { readonly id: string; readonly title: UberText }[];
  readonly items: readonly UberShapedItem[];
  readonly modifier_groups: readonly UberShapedGroup[];
}

// ── the adapter ─────────────────────────────────────────────────────────────

function textAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string, required: boolean): string | undefined {
  const v = obj[key];
  if (v === undefined) {
    if (required) fail(ctx, "missing-key", `${path}.${key}`, `the required \`${key}\` is absent.`);
    return undefined;
  }
  const t = objectAt(ctx, v, `${path}.${key}`);
  const tr = objectAt(ctx, t.translations, `${path}.${key}.translations`);
  return stringAt(ctx, tr, "en_us", `${path}.${key}.translations`, true);
}

/** Read an Uber-shaped menu document into the engine's feed form. Throws PlatformShapeError. */
export function uberShapedToFeed(doc: unknown, opts: UberShapedOptions): PlatformShapedFeed {
  const ctx: ReadCtx = { shapedLike: SHAPED_LIKE_UBER, row: null };
  const asOfMs = parseInstant(opts?.asOf);
  if (asOfMs === null) fail(ctx, "option", "asOf", `"${String(opts?.asOf)}" is not a readable instant — a suspension cannot be judged without one.`);
  const asOfSeconds = Math.floor(asOfMs / 1000);

  const root = objectAt(ctx, doc, "document");
  for (const key of ["menus", "categories", "items", "modifier_groups"]) {
    if (!(key in root)) fail(ctx, "missing-key", `document.${key}`, `the envelope has no \`${key}\` — all four of menus, categories, items and modifier_groups are required.`);
  }
  const menus = arrayAt(ctx, root, "menus", "document", true);
  arrayAt(ctx, root, "categories", "document", true);
  const rawItems = arrayAt(ctx, root, "items", "document", true);
  const rawGroups = arrayAt(ctx, root, "modifier_groups", "document", true);

  // Items first: name, price, availability, the groups they carry.
  interface ReadItem {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly cents: number;
    readonly out: boolean;
    /** undefined = the item states nothing about add-ons; [] = it states "none". */
    readonly groupIds: readonly string[] | undefined;
    readonly row: number;
    readonly path: string;
  }
  const items = new Map<string, ReadItem>();
  rawItems.forEach((raw, i) => {
    ctx.row = i + 1;
    const ip = `items[${i}]`;
    const item = objectAt(ctx, raw, ip);
    const id = idAt(ctx, item, "id", ip);
    if (items.has(id)) fail(ctx, "duplicate", `${ip}.id`, `item id "${id}" appears twice in items.`);
    const priceInfo = objectAt(ctx, item.price_info, `${ip}.price_info`);
    const cents = integerPriceAt(ctx, priceInfo, "price", `${ip}.price_info`);
    if (cents === undefined) fail(ctx, "missing-key", `${ip}.price_info.price`, "the item states no price.");
    let description = "";
    if (typeof item.description === "string") description = item.description;
    else if (item.description !== undefined) description = textAt(ctx, item, "description", ip, true) as string;
    let groupIds: readonly string[] | undefined;
    if (item.modifier_group_ids !== undefined) {
      const g = objectAt(ctx, item.modifier_group_ids, `${ip}.modifier_group_ids`);
      groupIds = arrayAt(ctx, g, "ids", `${ip}.modifier_group_ids`, true).map((v, k) => {
        if (typeof v !== "string" || v === "") fail(ctx, "type", `${ip}.modifier_group_ids.ids[${k}]`, "a modifier group id must be non-empty text.");
        return v;
      });
    }
    let out = false;
    if (item.suspension_info !== undefined) {
      const si = objectAt(ctx, item.suspension_info, `${ip}.suspension_info`);
      if (si.suspension !== undefined && si.suspension !== null) {
        const s = objectAt(ctx, si.suspension, `${ip}.suspension_info.suspension`);
        const until = s.suspend_until;
        if (until !== undefined && until !== null) {
          if (typeof until !== "number" || !Number.isSafeInteger(until)) {
            fail(ctx, "type", `${ip}.suspension_info.suspension.suspend_until`, "`suspend_until` must be whole Unix seconds or null.");
          }
          out = until > asOfSeconds;
        }
      }
    }
    items.set(id, { id, title: textAt(ctx, item, "title", ip, true) as string, description, cents, out, groupIds, row: i + 1, path: ip });
  });

  // Groups: each option references an item.
  ctx.row = null;
  const groups = new Map<string, { readonly name: string; readonly optionIds: readonly string[] }>();
  const optionItemIds = new Set<string>();
  rawGroups.forEach((raw, g) => {
    const gp = `modifier_groups[${g}]`;
    const group = objectAt(ctx, raw, gp);
    const id = idAt(ctx, group, "id", gp);
    if (groups.has(id)) fail(ctx, "duplicate", `${gp}.id`, `modifier group id "${id}" appears twice.`);
    const optionIds = arrayAt(ctx, group, "modifier_options", gp, true).map((rawOpt, o) => {
      const op = `${gp}.modifier_options[${o}]`;
      const opt = objectAt(ctx, rawOpt, op);
      const type = stringAt(ctx, opt, "type", op, true);
      if (type !== "ITEM") fail(ctx, "type", `${op}.type`, `"${type}" is not "ITEM", the one option type this adapter reads.`);
      const ref = idAt(ctx, opt, "id", op);
      if (!items.has(ref)) fail(ctx, "reference", `${op}.id`, `the option references item "${ref}", which items does not list.`);
      optionItemIds.add(ref);
      return ref;
    });
    groups.set(id, { name: textAt(ctx, group, "title", gp, true) as string, optionIds });
  });

  // Hours: only from a one-menu document (see the header).
  let hours: AcpFeedHoursWindow[] = [];
  menus.forEach((raw, m) => {
    const mp = `menus[${m}]`;
    const menu = objectAt(ctx, raw, mp);
    const windows = arrayAt(ctx, menu, "service_availability", mp, false).flatMap((rawSa, s) => {
      const sp = `${mp}.service_availability[${s}]`;
      const sa = objectAt(ctx, rawSa, sp);
      const dayName = stringAt(ctx, sa, "day_of_week", sp, true) as string;
      const day = DAY_CODES[dayName];
      if (day === undefined) fail(ctx, "type", `${sp}.day_of_week`, `"${dayName}" is not a day name (monday … sunday).`);
      return arrayAt(ctx, sa, "time_periods", sp, true).map((rawTp, t) => {
        const tp = objectAt(ctx, rawTp, `${sp}.time_periods[${t}]`);
        return { day, open: localTimeAt(ctx, tp, "start_time", `${sp}.time_periods[${t}]`), close: localTimeAt(ctx, tp, "end_time", `${sp}.time_periods[${t}]`) };
      });
    });
    if (menus.length === 1) hours = windows;
  });

  const rows: AcpFeedItem[] = [];
  for (const it of items.values()) {
    if (optionItemIds.has(it.id)) continue;
    ctx.row = it.row;
    const modifiers: AcpFeedModifier[] | undefined = it.groupIds?.flatMap((gid, k) => {
      const group = groups.get(gid);
      if (!group) fail(ctx, "reference", `${it.path}.modifier_group_ids.ids[${k}]`, `the item references modifier group "${gid}", which modifier_groups does not list.`);
      return group.optionIds.map((oid): AcpFeedModifier => {
        const opt = items.get(oid)!;
        return { id: oid, list_id: gid, list_name: group.name, name: opt.title, price_delta: centsText(opt.cents), availability: opt.out ? "out_of_stock" : "in_stock" };
      });
    });
    rows.push({
      ...UNSTATED_ROW_FIELDS,
      item_id: it.id,
      title: it.title,
      description: it.description,
      price: centsText(it.cents),
      availability: it.out ? "out_of_stock" : "in_stock",
      group_id: it.id,
      ...(modifiers !== undefined ? { modifiers } : {}),
      ...(hours.length > 0 ? { hours } : {}),
    });
  }
  return { simulated: true, spec: "acp-product-feed/extract-2026-07-02", shapedLike: SHAPED_LIKE_UBER, items: rows };
}

// ── the builder (the inverse on every stated field) ─────────────────────────

const decimalToCents = (d: string): number => {
  const m = /^(\d+)\.(\d{2})$/.exec(d);
  if (!m) throw new Error(`reshape: "${d}" is not a two-decimal amount`);
  return Number(m[1]) * 100 + Number(m[2]);
};
const text = (s: string): UberText => ({ translations: { en_us: s } });
const DAY_NAMES: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(DAY_CODES).map(([n, c]) => [c, n]));
const hhmm = (t: string): string => t.slice(0, 5);

/**
 * Write an ACP-form copy as an Uber-shaped document. One menu when every row
 * serves the same hours (so the hours survive the round trip); otherwise one
 * menu per distinct hours set, and the copy then makes no hours claim (see the
 * adapter header). Add-ons become items referenced by modifier groups. An
 * out-of-stock row or option is suspended until one day after `asOf`.
 */
export function acpFeedToUberShaped(feed: AcpFeed, opts: { readonly categoryOf: (row: AcpFeedItem) => string; readonly asOf: string }): UberShapedDocument {
  const asOfMs = parseInstant(opts.asOf);
  if (asOfMs === null) throw new Error(`reshape: asOf "${opts.asOf}" is not an instant`);
  const suspendUntil = Math.floor(asOfMs / 1000) + 86_400;
  const suspension = (inStock: boolean) => (inStock ? {} : { suspension_info: { suspension: { suspend_until: suspendUntil } } });

  const hoursSets = new Map<string, readonly AcpFeedHoursWindow[]>();
  for (const r of feed.items) hoursSets.set(JSON.stringify(r.hours ?? []), r.hours ?? []);
  const menuKeys = [...hoursSets.keys()];
  const categories = [...new Set(feed.items.map((r) => opts.categoryOf(r)))];

  const items: UberShapedItem[] = [];
  const optionItems = new Map<string, UberShapedItem>();
  const groups = new Map<string, { name: string; ids: string[] }>();
  for (const r of feed.items) {
    const groupIds: string[] = [];
    for (const m of r.modifiers ?? []) {
      if (!groupIds.includes(m.list_id)) groupIds.push(m.list_id);
      const g = groups.get(m.list_id) ?? { name: m.list_name, ids: [] };
      if (!g.ids.includes(m.id)) g.ids.push(m.id);
      groups.set(m.list_id, g);
      if (!optionItems.has(m.id)) {
        optionItems.set(m.id, {
          id: m.id,
          title: text(m.name),
          description: text(""),
          price_info: { price: decimalToCents(m.price_delta) },
          ...suspension(m.availability === "in_stock"),
        });
      }
    }
    items.push({
      id: r.item_id,
      title: text(r.title),
      description: text(r.description),
      price_info: { price: decimalToCents(r.price) },
      ...(r.modifiers !== undefined ? { modifier_group_ids: { ids: groupIds } } : {}),
      ...suspension(r.availability === "in_stock"),
    });
  }
  return {
    menus: menuKeys.map((k, n) => ({
      id: `menu-${n + 1}`,
      title: text(`Menu ${n + 1}`),
      service_availability: [...new Set(hoursSets.get(k)!.map((w) => w.day))].map((day) => ({
        day_of_week: DAY_NAMES[day],
        time_periods: hoursSets.get(k)!.filter((w) => w.day === day).map((w) => ({ start_time: hhmm(w.open), end_time: hhmm(w.close) })),
      })),
      category_ids: categories.map((_c, i) => `category-${i + 1}`),
    })),
    categories: categories.map((c, i) => ({ id: `category-${i + 1}`, title: text(c) })),
    items: [...items, ...optionItems.values()],
    modifier_groups: [...groups.entries()].map(([id, g]) => ({ id, title: text(g.name), modifier_options: g.ids.map((oid) => ({ type: "ITEM" as const, id: oid })) })),
  };
}

