/**
 * Fixture shaping for the spreadsheet path — the one file we WRITE to look the
 * way a spreadsheet app re-saves it, rather than the way we would write it.
 *
 * Adapters tested only against the clean CSV we generate would be tested
 * against a shape a tester never produces. Spreadsheet apps are documented to
 * (a) prefix a UTF-8 byte-order mark, (b) end lines with CRLF, and (c) drop
 * trailing zeros from numbers in General-format cells ("21.50" → "21.5",
 * "12.00" → "12"). This builder applies exactly those three transformations to
 * the committed record so the adapter is exercised on the arriving shape.
 *
 * HONESTY: CONSTRUCTED from documented behaviour, not captured from Excel,
 * Numbers or Google Sheets — UNVERIFIED against a real export (RULES §6). If a
 * real export ever disagrees with this shape, commit that export beside this
 * one and test both; do not edit this builder to match a memory.
 *
 * Kept out of csv-adapters.ts so the product module carries no fixture logic,
 * and out of the generator script so the freeze-lock test can call it without
 * triggering a write.
 */
import type { SyntheticCatalog } from "../packs/listings/types.ts";
import { RECORD_COLUMNS } from "./csv-adapters.ts";
import { toCsv } from "./csv.ts";

export const RESAVE_FIXTURE_FILENAME = "menu-record.spreadsheet-resave.csv";

/** The record as a spreadsheet re-saves it: BOM + CRLF + trailing zeros dropped. */
export function spreadsheetResave(cat: SyntheticCatalog): string {
  const rows: string[][] = [[...RECORD_COLUMNS]];
  for (const item of cat.items) {
    for (const v of item.variations) {
      rows.push([
        v.id,
        item.name,
        v.name,
        // Number → string drops trailing zeros exactly the way a General-format cell does.
        String(v.priceCents / 100),
        v.stock === "in_stock" ? "in stock" : v.stock === "soldout_86" ? "sold out" : "hidden",
        cat.asOf,
        item.id,
      ]);
    }
  }
  return "\uFEFF" + toCsv(rows).replace(/\n/g, "\r\n") + "\r\n";
}
