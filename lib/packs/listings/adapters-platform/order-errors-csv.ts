/**
 * Order-errors trigger — a CSV "shaped like the described contents" (S3; plan § 4
 * ERR → Intake; research record docs/research/external-references-2026-10-31.md
 * "Top 5" #5).
 *
 * THE COLUMN NAMES ARE OURS. Both delivery platforms describe, in prose, what
 * their merchant-side order-error download contains — the issue type, the item(s)
 * in error, the customer refund, the merchant charge, and the amount the
 * platform covers — and neither publishes the column headers. This shape is
 * invented: shaped like the described contents of that public partner
 * documentation (read 2026-10-31), not from either platform; never called; not
 * affiliated. Every row this file reads is synthetic.
 *
 * Columns (read by header NAME, in any order, case and spacing ignored):
 *   order_id · placed_at · issue_type (missing_item | incorrect_item | incorrect_order)
 *   · item_in_error · customer_refund_cents · merchant_charge_cents
 *   · platform_covered_cents · source_channel
 * Following the documentation's own guidance for its download (parse by header
 * name, ignore unknown columns, expect variation and new columns): an unknown
 * column is ignored — never read, never carried (so a planted customer name,
 * phone or e-mail column cannot reach a row) — and format variation is tolerated:
 * a byte-order mark, CRLF, "Order ID" / "order-id" headers, "Missing item" /
 * "MISSING-ITEM" issue words, a leading currency sign or thousands separators on
 * an amount, and any instant form the engine reads (with Z or an offset).
 *
 * Refused, with the CSV line number: an unreadable file, a missing order_id or
 * issue_type column, an issue word outside the three, an amount that is not
 * whole cents, a placed_at that is not an instant. A refusal is never a finding.
 *
 * Output: a Trigger { kind: "order-errors", rows } the crew's Intake can be handed
 * (the crew does not read it yet — that wiring is outside this lane's files).
 *
 * Plain: reads a spreadsheet of order complaints laid out the way the platforms
 * describe theirs — what went wrong, on which order, and who paid for it — and
 * keeps only the columns we name.
 */
import { parseCsv } from "../../../playground/csv.ts";
import { parseInstant } from "../instants.ts";
import { ListingsInputError } from "../reference.ts";

export const ORDER_ERRORS_SHAPED_LIKE = "order-errors-described-contents-2026-10-31";
export const ORDER_ERRORS_CARRIER =
  "Shaped like the order-error contents the delivery platforms describe in their public partner documentation (read 2026-10-31); the column names are ours — neither platform publishes these headers; not from either platform; never called; not affiliated. All data is synthetic.";

export const ORDER_ERRORS_COLUMNS = [
  "order_id",
  "placed_at",
  "issue_type",
  "item_in_error",
  "customer_refund_cents",
  "merchant_charge_cents",
  "platform_covered_cents",
  "source_channel",
] as const;

export type OrderIssueType = "missing_item" | "incorrect_item" | "incorrect_order";
const ISSUE_TYPES: readonly OrderIssueType[] = ["missing_item", "incorrect_item", "incorrect_order"];

/** One row, declared fields only. Blank optional cells are null. */
export interface OrderErrorRow {
  /** 1-based CSV line the row starts on. */
  readonly line: number;
  readonly order_id: string;
  readonly placed_at: string | null;
  readonly issue_type: OrderIssueType;
  readonly item_in_error: string | null;
  readonly customer_refund_cents: number | null;
  readonly merchant_charge_cents: number | null;
  readonly platform_covered_cents: number | null;
  readonly source_channel: string | null;
}

export interface OrderErrorsTrigger {
  readonly kind: "order-errors";
  readonly simulated: true;
  readonly shapedLike: typeof ORDER_ERRORS_SHAPED_LIKE;
  readonly carrier: string;
  readonly rows: readonly OrderErrorRow[];
}

/** A file the trigger reader refuses; `line` is the CSV line, or null for a whole-file problem. */
export class OrderErrorsCsvError extends ListingsInputError {
  readonly line: number | null;
  constructor(line: number | null, problem: string) {
    super(`The order-errors file was refused${line === null ? "" : ` at line ${line}`}: ${problem} Nothing was read.`);
    this.name = "OrderErrorsCsvError";
    this.line = line;
  }
}

const header = (h: string): string => h.replace(/^﻿/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const word = (s: string): string => s.trim().toLowerCase().replace(/[\s-]+/g, "_");

/** "1,250" · "$12" · "€ 300" · "-150" → whole cents; anything with a decimal point refuses (a cents column holds cents). */
function cents(raw: string, column: string, line: number): number | null {
  const s = raw.trim();
  if (s === "") return null;
  const m = /^(-)?\s*[$€£]?\s*(\d{1,3}(?:,\d{3})+|\d+)$/.exec(s);
  if (!m) throw new OrderErrorsCsvError(line, `${column} "${raw}" is not a whole number of cents.`);
  const n = Number(m[2].replace(/,/g, ""));
  if (!Number.isSafeInteger(n)) throw new OrderErrorsCsvError(line, `${column} "${raw}" is too large to read exactly.`);
  return m[1] ? -n : n;
}

/** Read an order-errors CSV into a trigger. Throws OrderErrorsCsvError. */
export function parseOrderErrorsCsv(textIn: string): OrderErrorsTrigger {
  const parsed = parseCsv(textIn);
  if (!parsed.ok) throw new OrderErrorsCsvError(null, parsed.error);
  const [head, ...body] = parsed.rows;
  if (head === undefined) throw new OrderErrorsCsvError(null, "the file is empty.");
  const col = new Map<string, number>();
  head.cells.forEach((h, i) => {
    const k = header(h);
    if ((ORDER_ERRORS_COLUMNS as readonly string[]).includes(k) && !col.has(k)) col.set(k, i);
  });
  for (const required of ["order_id", "issue_type"]) {
    if (!col.has(required)) throw new OrderErrorsCsvError(head.line, `the header names no ${required} column (columns read: ${ORDER_ERRORS_COLUMNS.join(", ")}).`);
  }
  const cell = (cells: readonly string[], name: string): string => {
    const i = col.get(name);
    return i === undefined ? "" : (cells[i] ?? "");
  };
  const optional = (s: string): string | null => (s.trim() === "" ? null : s.trim());
  const rows = body.map((r): OrderErrorRow => {
    const orderId = cell(r.cells, "order_id").trim();
    if (orderId === "") throw new OrderErrorsCsvError(r.line, "order_id is blank.");
    const issue = word(cell(r.cells, "issue_type"));
    if (!(ISSUE_TYPES as readonly string[]).includes(issue)) {
      throw new OrderErrorsCsvError(r.line, `issue_type "${cell(r.cells, "issue_type")}" is not one of ${ISSUE_TYPES.join(", ")}.`);
    }
    const placed = optional(cell(r.cells, "placed_at"));
    if (placed !== null && parseInstant(placed) === null) {
      throw new OrderErrorsCsvError(r.line, `placed_at "${placed}" is not a readable instant.`);
    }
    return {
      line: r.line,
      order_id: orderId,
      placed_at: placed,
      issue_type: issue as OrderIssueType,
      item_in_error: optional(cell(r.cells, "item_in_error")),
      customer_refund_cents: cents(cell(r.cells, "customer_refund_cents"), "customer_refund_cents", r.line),
      merchant_charge_cents: cents(cell(r.cells, "merchant_charge_cents"), "merchant_charge_cents", r.line),
      platform_covered_cents: cents(cell(r.cells, "platform_covered_cents"), "platform_covered_cents", r.line),
      source_channel: optional(cell(r.cells, "source_channel")),
    };
  });
  return { kind: "order-errors", simulated: true, shapedLike: ORDER_ERRORS_SHAPED_LIKE, carrier: ORDER_ERRORS_CARRIER, rows };
}
