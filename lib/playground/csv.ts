/**
 * CSV reader/writer — RFC 4180 plus the three things spreadsheet apps actually
 * do to a file (S1 of docs/plan-testable-instrument-2026-09-01.md, D-6).
 *
 * Hand-rolled on purpose. The browser verifier runs inside a fail-closed import
 * allowlist (evals/packs/landing-delivery-egress.test.ts); a parsing library
 * would need its own allowlist exception for ~60 lines of logic that is small
 * enough to test exhaustively. No dependency, no I/O, no clock.
 *
 * What it tolerates because spreadsheets produce it:
 *   - a UTF-8 byte-order mark at the start (Excel writes one on "CSV UTF-8");
 *   - CRLF or LF line endings, mixed;
 *   - quoted fields containing commas, doubled quotes, and line breaks;
 *   - trailing empty lines.
 *
 * What it refuses, with the line number: an unterminated quote (the rest of the
 * file would otherwise be swallowed into one cell and every row after it would
 * vanish silently — a wrong verdict on data the reader never wrote).
 *
 * Plain: turns spreadsheet text into rows of cells, and back, without guessing.
 */

export interface CsvRow {
  /** Cells in column order, as written (not trimmed). */
  readonly cells: readonly string[];
  /** 1-based line on which the row STARTS — the number a spreadsheet shows. */
  readonly line: number;
}

export type CsvParseResult =
  | { readonly ok: true; readonly rows: readonly CsvRow[] }
  | { readonly ok: false; readonly error: string };

/** Parse CSV text into rows. Empty lines are dropped; cells are not trimmed. */
export function parseCsv(text: string): CsvParseResult {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: CsvRow[] = [];
  let cells: string[] = [];
  let cell = "";
  let inQuotes = false;
  let line = 1;
  let rowStart = 1;
  let quoteOpenedAt = 0;

  const endRow = (): void => {
    cells.push(cell);
    cell = "";
    // A row whose every cell is blank is a trailing/empty line, not data.
    if (cells.some((c) => c.trim() !== "")) rows.push({ cells, line: rowStart });
    cells = [];
    rowStart = line;
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (ch === "\n") line++;
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      quoteOpenedAt = line;
    } else if (ch === ",") {
      cells.push(cell);
      cell = "";
    } else if (ch === "\r") {
      // CRLF: the LF that follows ends the row; a lone CR is treated as a newline too.
      if (src[i + 1] === "\n") i++;
      line++;
      endRow();
    } else if (ch === "\n") {
      line++;
      endRow();
    } else {
      cell += ch;
    }
  }
  if (inQuotes) {
    return {
      ok: false,
      error:
        `A quote opened on line ${quoteOpenedAt} is never closed. Everything after it would be ` +
        `read as one cell and every later row would disappear, so nothing was parsed.`,
    };
  }
  // Final row without a trailing newline.
  if (cell !== "" || cells.length > 0) endRow();
  return { ok: true, rows };
}

/** Quote a cell only when RFC 4180 requires it (comma, quote, CR/LF). */
export function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Serialize rows with LF endings and a trailing newline; no BOM. */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}
