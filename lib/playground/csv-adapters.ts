/**
 * Spreadsheet adapters — the bring-your-own-data path (S1 of
 * docs/plan-testable-instrument-2026-09-01.md; owner GO 2026-09-01: two files,
 * one per slot; `as_of` defaults to the drop-day and says so).
 *
 * WHY THIS EXISTS. The engine reads about seven fields per side; everything
 * else in the ACP/UCP JSON the slots accept is protocol ceremony no tester has
 * or wants to type. These adapters turn a spreadsheet-shaped CSV into the SAME
 * types the engine already takes (`AcpFeed`, `SyntheticCatalog`), so the engine,
 * the report and the delivery builders do not change and every existing golden
 * still binds. Nothing here decides anything about a menu: the adapters carry
 * values to the engine; the engine judges them.
 *
 * TWO RULES, both inherited from the JSON parsers and kept deliberately:
 *   1. WRONG VALUES ARE NEVER REFUSED. A price that disagrees, a currency of
 *      "usd", a garbled name — those are the product's purpose and must reach the
 *      engine as FINDINGS. Only rows the engine cannot INDEX are refused (a
 *      missing or duplicate id, an id it would misread, a price it cannot turn
 *      into a number, a stock word it has no meaning for), and every refusal
 *      names the spreadsheet row so the reader can find it.
 *   2. NOTHING IS GUESSED. Blank optional cells take a documented default; an
 *      unparseable cell is refused, not coerced. The one default that could
 *      change a verdict — the record's `as_of` date — is reported back to the
 *      caller (`asOfSource`) so the UI can say where the date came from.
 *
 * ONE HONEST LIMIT, recorded in the round-trip test: feed prices are normalized
 * to two decimals ("21.5" → "21.50", "12" → "12.00") because spreadsheets drop
 * trailing zeros on save and the engine compares price strings exactly. That
 * means the JSON-only defect "cents serialized where dollars belong" ("2150")
 * cannot be expressed from a spreadsheet — it arrives as "2150.00" and is caught
 * as a plain price mismatch instead. A spreadsheet cannot carry that defect
 * class; the adapter does not pretend it can.
 *
 * Plain: two small translators — one for the spreadsheet of what the app shows,
 * one for the spreadsheet of what the till says — into the checker's own language.
 */
import type { AcpAvailability, AcpFeed, AcpFeedItem } from "../packs/listings/acp-feed.ts";
import { centsToDecimal } from "../packs/listings/acp-feed.ts";
import type { SorItem, SorStockState, SorVariation, SyntheticCatalog } from "../packs/listings/types.ts";
import { parseCsv, toCsv, type CsvRow } from "./csv.ts";

// ---------------------------------------------------------------------------
// Column contracts — the header each template ships with. Order matters only
// for the writer; the reader matches by normalized name and ignores extras.
// ---------------------------------------------------------------------------

/** `menu-as-published.csv` — what the marketplace / agent surface shows. */
export const FEED_COLUMNS = [
  "item_id",
  "name",
  "variation",
  "price",
  "sale_price",
  "currency",
  "availability",
  "available_from",
  "expires",
  "searchable",
  "buyable",
  "group",
] as const;

/** `menu-record.csv` — what the merchant's own system says. */
export const RECORD_COLUMNS = ["item_id", "name", "variation", "price", "stock", "as_of", "group"] as const;

export const FEED_TEMPLATE_FILENAME = "menu-as-published.csv";
export const RECORD_TEMPLATE_FILENAME = "menu-record.csv";

/**
 * Plain words accepted in cells, keyed in `wordKey` form (lower-case, with
 * spaces / underscores / hyphens collapsed to one space) so "pre-order",
 * "pre_order", "Pre Order" and "preorder" all resolve. Lookups may miss, and
 * the type says so.
 */
const AVAILABILITY_WORDS: Readonly<Record<string, AcpAvailability | undefined>> = {
  "in stock": "in_stock",
  instock: "in_stock",
  available: "in_stock",
  "out of stock": "out_of_stock",
  "sold out": "out_of_stock",
  soldout: "out_of_stock",
  unavailable: "out_of_stock",
  "pre order": "pre_order",
  preorder: "pre_order",
  backorder: "backorder",
  unknown: "unknown",
};

const STOCK_WORDS: Readonly<Record<string, SorStockState | undefined>> = {
  "in stock": "in_stock",
  instock: "in_stock",
  available: "in_stock",
  "sold out": "soldout_86",
  soldout: "soldout_86",
  "soldout 86": "soldout_86",
  "out of stock": "soldout_86",
  "86": "soldout_86",
  "86'd": "soldout_86",
  "86d": "soldout_86",
  hidden: "hidden",
};

const YES_WORDS = new Set(["yes", "y", "true", "1"]);
const NO_WORDS = new Set(["no", "n", "false", "0"]);

// ---------------------------------------------------------------------------
// Shared cell readers. Each returns a value or a refusal REASON (no row prefix —
// the caller adds "Row N (item_id …)" so every message is located the same way).
// ---------------------------------------------------------------------------

type Cell<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly reason: string };

const okCell = <T>(value: T): Cell<T> => ({ ok: true, value });
const badCell = (reason: string): Cell<never> => ({ ok: false, reason });

/** Header normalization: `Item ID`, `item-id`, ` ITEM_ID ` all read as `item_id`. */
export function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

const wordKey = (s: string): string => s.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/**
 * A dollar amount as a spreadsheet writes it: "21.50", "21.5", "12", "$1,250.00".
 * Returns integer cents. Refuses anything else — including three decimals, which
 * cannot be exact cents, and negatives, which the engine has no meaning for.
 */
function readMoneyCents(raw: string, what: string): Cell<number> {
  const s = raw.trim().replace(/^\$/, "").replace(/\s+/g, "");
  // Thousands commas only where thousands commas go ("1,250.00"), so "1,2,3"
  // is refused rather than silently read as 123.
  const m = /^(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) {
    return badCell(
      `${what} "${raw}" is not a dollar amount this checker can read — use digits with up to two decimals, like 21.50 (a leading $ and thousands commas are fine).`,
    );
  }
  const dollars = Number(m[1].replace(/,/g, ""));
  const centsPart = (m[2] ?? "").padEnd(2, "0");
  const cents = dollars * 100 + Number(centsPart);
  if (!Number.isSafeInteger(cents)) {
    return badCell(`${what} "${raw}" is too large to represent exactly in cents.`);
  }
  return okCell(cents);
}

/** Same reader, but yielding the engine's decimal-string form ("21.50"). */
function readMoneyDecimal(raw: string, what: string): Cell<string> {
  const cents = readMoneyCents(raw, what);
  return cents.ok ? okCell(centsToDecimal(cents.value)) : cents;
}

/**
 * A date as a spreadsheet writes it: `2026-07-03` or a full UTC instant
 * `2026-07-03T00:00:00Z`. Date-only expands to midnight UTC. The engine compares
 * these as TEXT against `as_of`, which is only correct in canonical UTC form —
 * so a local-offset stamp or a free-form date is refused, not reinterpreted.
 */
function readDate(raw: string, what: string): Cell<string> {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const iso = `${s}T00:00:00Z`;
    return Number.isNaN(Date.parse(iso))
      ? badCell(`${what} "${raw}" is not a real calendar date.`)
      : okCell(iso);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(s) && !Number.isNaN(Date.parse(s))) {
    return okCell(s);
  }
  return badCell(
    `${what} "${raw}" is not a date this checker can compare — write it as YYYY-MM-DD (or a full UTC instant like 2026-07-03T00:00:00Z). Dates are compared as text, so other forms would order wrongly.`,
  );
}

function readYesNo(raw: string, what: string, dflt: boolean): Cell<boolean> {
  const k = raw.trim().toLowerCase();
  if (k === "") return okCell(dflt);
  if (YES_WORDS.has(k)) return okCell(true);
  if (NO_WORDS.has(k)) return okCell(false);
  return badCell(`${what} "${raw}" must be yes or no (blank means ${dflt ? "yes" : "no"}).`);
}

/**
 * Ids the ENGINE would misread — refused on both sides, same reasons as the
 * JSON parsers (verify-in-browser.ts `reservedIdProblem`): claim ids are built
 * as `<id>#<field>` and split on the first `#`, and `catalog` names catalog-level
 * metadata inside the reference resolver.
 */
function idProblem(id: string): string | null {
  if (id.includes("#")) {
    return `its id "${id}" contains "#", which the checker uses internally to separate a row from a field — this row would be compared against "${id.split("#")[0]}" instead.`;
  }
  if (id === "catalog") {
    return `its id is the reserved word "catalog", which names the whole record inside the checker, so this row would not be checked as a row.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Table reading shared by both adapters: header → column index, ragged rows,
// required columns, blank-row skipping.
// ---------------------------------------------------------------------------

interface Table {
  readonly col: ReadonlyMap<string, number>;
  readonly rows: readonly CsvRow[];
}

function readTable(
  text: string,
  what: string,
  known: readonly string[],
  required: readonly string[],
): { readonly ok: true; readonly table: Table } | { readonly ok: false; readonly error: string } {
  if (!text.trim()) {
    return { ok: false, error: `The ${what} spreadsheet is empty — download the template, fill it in, and drop it here.` };
  }
  const parsed = parseCsv(text);
  if (!parsed.ok) return parsed;
  if (parsed.rows.length === 0) {
    return { ok: false, error: `The ${what} spreadsheet has no rows at all.` };
  }
  const [header, ...rows] = parsed.rows;
  const col = new Map<string, number>();
  header.cells.forEach((h, i) => {
    const key = normalizeHeader(h);
    if (key && !col.has(key)) col.set(key, i);
  });
  const missing = required.filter((r) => !col.has(r));
  if (missing.length > 0) {
    return {
      ok: false,
      error:
        `The ${what} spreadsheet's first row must name its columns, and ${missing.map((m) => `"${m}"`).join(", ")} ` +
        `${missing.length === 1 ? "is" : "are"} missing. The template's columns are: ${known.join(", ")}.`,
    };
  }
  if (rows.length === 0) {
    return { ok: false, error: `The ${what} spreadsheet has a header row but no data rows beneath it.` };
  }
  for (const r of rows) {
    if (r.cells.length > header.cells.length) {
      return {
        ok: false,
        error:
          `Row ${r.line} has ${r.cells.length} cells but the header names ${header.cells.length} columns — ` +
          `usually a comma inside a name that the spreadsheet did not quote. Nothing was checked, because the ` +
          `columns after that comma would be read shifted by one.`,
      };
    }
  }
  return { ok: true, table: { col, rows } };
}

const cellOf = (t: Table, r: CsvRow, name: string): string => {
  const i = t.col.get(name);
  return i === undefined ? "" : (r.cells[i] ?? "");
};

// ---------------------------------------------------------------------------
// Feed side
// ---------------------------------------------------------------------------

export type FeedCsvResult =
  | { readonly ok: true; readonly feed: AcpFeed }
  | { readonly ok: false; readonly error: string };

/**
 * `menu-as-published.csv` → `AcpFeed`. Only the fields a rule reads are carried;
 * the protocol fields the type requires but no rule reads are filled with empty
 * strings so nothing invented can show up in a finding.
 */
export function feedFromCsv(text: string): FeedCsvResult {
  const t = readTable(text, "published-menu", FEED_COLUMNS, ["item_id", "price"]);
  if (!t.ok) return t;
  const { table } = t;
  const items: AcpFeedItem[] = [];
  const seen = new Set<string>();

  for (const r of table.rows) {
    const id = cellOf(table, r, "item_id").trim();
    const at = (reason: string): FeedCsvResult => ({
      ok: false,
      error: `Row ${r.line}${id ? ` (item_id "${id}")` : ""}: ${reason}`,
    });
    if (!id) return at("has no item_id. Every row needs one so a finding can say which row it is about.");
    const idp = idProblem(id);
    if (idp) return at(idp);
    if (seen.has(id)) {
      return at(
        `repeats an item_id that appears earlier in this spreadsheet. Two rows with one id would be checked as a single row, and no report could say which one it meant.`,
      );
    }
    seen.add(id);

    const price = readMoneyDecimal(cellOf(table, r, "price"), "price");
    if (!price.ok) return at(price.reason);
    const saleRaw = cellOf(table, r, "sale_price").trim();
    const sale = saleRaw ? readMoneyDecimal(saleRaw, "sale_price") : okCell<string | undefined>(undefined);
    if (!sale.ok) return at(sale.reason);

    const availRaw = cellOf(table, r, "availability").trim();
    const availability: AcpAvailability | undefined = availRaw ? AVAILABILITY_WORDS[wordKey(availRaw)] : "in_stock";
    if (availability === undefined) {
      return at(
        `availability "${availRaw}" is not a state this checker knows — use in stock, out of stock, or pre-order (blank means in stock).`,
      );
    }

    const fromRaw = cellOf(table, r, "available_from").trim();
    const from = fromRaw ? readDate(fromRaw, "available_from") : okCell<string | undefined>(undefined);
    if (!from.ok) return at(from.reason);
    const expRaw = cellOf(table, r, "expires").trim();
    const exp = expRaw ? readDate(expRaw, "expires") : okCell<string | undefined>(undefined);
    if (!exp.ok) return at(exp.reason);

    const searchable = readYesNo(cellOf(table, r, "searchable"), "searchable", true);
    if (!searchable.ok) return at(searchable.reason);
    const buyable = readYesNo(cellOf(table, r, "buyable"), "buyable", true);
    if (!buyable.ok) return at(buyable.reason);

    const currencyRaw = cellOf(table, r, "currency").trim();
    const variation = cellOf(table, r, "variation").trim();
    const group = cellOf(table, r, "group").trim();

    items.push({
      item_id: id,
      title: cellOf(table, r, "name").trim(),
      description: "",
      url: "",
      brand: "",
      image_url: "",
      price: price.value,
      // Verbatim on purpose: "usd" is a finding, not a typo to fix for the reader.
      currency: currencyRaw || "USD",
      availability,
      seller_name: "",
      seller_url: "",
      is_eligible_search: searchable.value,
      is_eligible_checkout: buyable.value,
      target_countries: [],
      store_country: "",
      group_id: group || id,
      // Always present, even when blank: the record side reads a blank
      // variation as "" too, so a sheet with no variations on either side
      // matches instead of firing "label (none) vs expected ''" on every row.
      variant_dict: { variation },
      ...(from.value !== undefined ? { availability_date: from.value } : {}),
      ...(sale.value !== undefined ? { sale_price: sale.value } : {}),
      ...(exp.value !== undefined ? { expiration_date: exp.value } : {}),
    });
  }

  return { ok: true, feed: { simulated: true, spec: "acp-product-feed/extract-2026-07-02", items } };
}

// ---------------------------------------------------------------------------
// Record side
// ---------------------------------------------------------------------------

export interface RecordCsvOptions {
  /**
   * The moment the file was supplied, as an ISO instant (`new Date().toISOString()`
   * in the UI; a fixed string in tests). Used ONLY when the sheet has no `as_of`
   * cell, and then truncated to that day at 00:00:00Z. The adapter never reads a
   * clock itself, so the same inputs always give the same catalog.
   */
  readonly today: string;
}

export type RecordCsvResult =
  | {
      readonly ok: true;
      readonly catalog: SyntheticCatalog;
      /** Where the record's date came from — the UI must say so when defaulted. */
      readonly asOfSource: "column" | "default";
    }
  | { readonly ok: false; readonly error: string };

/**
 * `menu-record.csv` → `SyntheticCatalog`. Rows are variations; they group into
 * items by the `group` cell when present, otherwise by `name` (rows sharing a
 * name are sizes/options of one item — the natural spreadsheet reading, and
 * what decides whether the expected title is "Name" or "Name (Variation)").
 */
export function recordFromCsv(text: string, opts: RecordCsvOptions): RecordCsvResult {
  const t = readTable(text, "merchant-record", RECORD_COLUMNS, ["item_id", "name", "price"]);
  if (!t.ok) return t;
  const { table } = t;

  const seen = new Set<string>();
  let asOf: string | undefined;
  let asOfLine = 0;
  /** Insertion-ordered grouping: key → item under construction. */
  const groups = new Map<string, { id: string; name: string; variations: SorVariation[] }>();

  for (const r of table.rows) {
    const id = cellOf(table, r, "item_id").trim();
    const at = (reason: string): RecordCsvResult => ({
      ok: false,
      error: `Row ${r.line}${id ? ` (item_id "${id}")` : ""}: ${reason}`,
    });
    if (!id) return at("has no item_id. The id is what a published row is matched against.");
    const idp = idProblem(id);
    if (idp) return at(idp);
    if (seen.has(id)) {
      return at(
        `repeats an item_id that appears earlier in this spreadsheet. A published row would be checked against whichever copy came last, and the report could not say which.`,
      );
    }
    seen.add(id);

    const name = cellOf(table, r, "name").trim();
    if (!name) return at("has no name. The name is how a published row is matched when its id does not resolve.");

    const price = readMoneyCents(cellOf(table, r, "price"), "price");
    if (!price.ok) return at(price.reason);

    const stockRaw = cellOf(table, r, "stock").trim();
    const stock: SorStockState | undefined = stockRaw ? STOCK_WORDS[wordKey(stockRaw)] : "in_stock";
    if (stock === undefined) {
      return at(`stock "${stockRaw}" is not a state this checker knows — use in stock, sold out, or hidden (blank means in stock).`);
    }

    const asOfRaw = cellOf(table, r, "as_of").trim();
    if (asOfRaw) {
      const d = readDate(asOfRaw, "as_of");
      if (!d.ok) return at(d.reason);
      if (asOf !== undefined && d.value !== asOf) {
        return at(
          `as_of "${asOfRaw}" disagrees with "${asOf}" on row ${asOfLine}. A record has one date; put the same as_of on every row, or leave the column blank to use the day you dropped the file.`,
        );
      }
      if (asOf === undefined) {
        asOf = d.value;
        asOfLine = r.line;
      }
    }

    const variation = cellOf(table, r, "variation").trim();
    const groupCell = cellOf(table, r, "group").trim();
    const key = groupCell ? `g:${groupCell}` : `n:${name}`;
    let g = groups.get(key);
    if (!g) {
      g = { id: groupCell || name, name, variations: [] };
      groups.set(key, g);
    }
    g.variations.push({ id, name: variation, priceCents: price.value, stock });
  }

  const items: SorItem[] = [...groups.values()].map((g) => ({
    id: g.id,
    name: g.name,
    description: "",
    category: "",
    variations: g.variations,
    modifierLists: [],
  }));

  let asOfSource: "column" | "default" = "column";
  if (asOf === undefined) {
    if (!/^\d{4}-\d{2}-\d{2}T/.test(opts.today) || Number.isNaN(Date.parse(opts.today))) {
      return { ok: false, error: `The record has no as_of column and no usable drop time was supplied ("${opts.today}").` };
    }
    asOf = `${opts.today.slice(0, 10)}T00:00:00Z`;
    asOfSource = "default";
  }

  return {
    ok: true,
    asOfSource,
    catalog: {
      // NORMALIZED, never inherited (same rule as the JSON path): what a REPORT
      // says about a run is decided by the caller's provenance, not the file.
      simulated: true,
      generator: { name: "reader-supplied spreadsheet", seed: 0, version: "csv" },
      merchantName: "Uploaded merchant",
      currency: "USD",
      asOf,
      items,
    },
  };
}

// ---------------------------------------------------------------------------
// Writers — the templates. Generated from the committed fixtures by
// scripts-ts/generate-csv-templates.mts and freeze-locked; the UI can produce
// the identical bytes at runtime from SAMPLE_FEED / SOR_CATALOG.
// ---------------------------------------------------------------------------

const AVAILABILITY_WORD: Readonly<Record<AcpAvailability, string>> = {
  in_stock: "in stock",
  out_of_stock: "out of stock",
  pre_order: "pre-order",
  backorder: "backorder",
  unknown: "unknown",
};

const STOCK_WORD: Readonly<Record<SorStockState, string>> = {
  in_stock: "in stock",
  soldout_86: "sold out",
  hidden: "hidden",
};

/** A feed as the published-menu spreadsheet. Prices and dates are written verbatim. */
export function feedToCsv(feed: AcpFeed): string {
  const rows: string[][] = [[...FEED_COLUMNS]];
  for (const r of feed.items) {
    rows.push([
      r.item_id,
      r.title,
      r.variant_dict["variation"] ?? "",
      r.price,
      r.sale_price ?? "",
      r.currency,
      AVAILABILITY_WORD[r.availability],
      r.availability_date ?? "",
      r.expiration_date ?? "",
      r.is_eligible_search ? "yes" : "no",
      r.is_eligible_checkout ? "yes" : "no",
      r.group_id,
    ]);
  }
  return toCsv(rows);
}

/** A catalog as the merchant-record spreadsheet; `as_of` repeated on every row. */
export function catalogToCsv(catalog: SyntheticCatalog): string {
  const rows: string[][] = [[...RECORD_COLUMNS]];
  for (const item of catalog.items) {
    for (const v of item.variations) {
      rows.push([v.id, item.name, v.name, centsToDecimal(v.priceCents), STOCK_WORD[v.stock], catalog.asOf, item.id]);
    }
  }
  return toCsv(rows);
}
