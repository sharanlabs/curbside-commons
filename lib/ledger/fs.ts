/**
 * The ONLY file in lib/ledger that touches the filesystem: read a ledger file,
 * append one verified-shape line. Kept apart from the pure core so the core can
 * be proven free of file and network access by an import walk.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";

import { appendLine, type LedgerEntryInput } from "./chain.ts";

/** Read a ledger file; a missing file is an empty ledger. */
export function readLedgerFile(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

/** Append one entry to the file (adds only the new line) and return that line. */
export function appendLedgerFile(path: string, input: LedgerEntryInput): string {
  const existing = readLedgerFile(path);
  const next = appendLine(existing, input);
  const line = next.slice(existing.length);
  appendFileSync(path, line, "utf8");
  return line;
}
