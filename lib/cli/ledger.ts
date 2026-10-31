/**
 * Ledger verbs for bin/check.mjs: `ledger verify|checkpoint|diff`.
 * Reads only (lib/ledger/fs.ts readLedgerFile); nothing here appends or writes.
 * ZERO model / network calls (import-walk proven by test).
 *
 * Plain: check that a run ledger's hash chain is intact, print the marker to
 * record elsewhere, or compare two ledgers run by run.
 */
import { checkpoint, diff, verify, type LedgerCheckpoint } from "../ledger/index.ts";
import { readLedgerFile } from "../ledger/fs.ts";

export interface LedgerCliResult {
  readonly output: string;
  readonly exitCode: 0 | 1;
}

/** Thrown for usage / unreadable input; the bin maps it to exit 2. */
export class LedgerCliError extends Error {}

function load(path: string): string {
  const text = readLedgerFile(path);
  if (text === "") throw new LedgerCliError(`ledger file is missing or empty: ${path}`);
  return text;
}

export function parseCheckpointArg(arg: string): LedgerCheckpoint {
  const m = /^(\d+):([0-9a-f]{64})$/.exec(arg);
  if (!m) throw new LedgerCliError(`--checkpoint must be <seq>:<sha256 hex> (got "${arg}")`);
  return { seq: Number(m[1]), hash: m[2] };
}

export function ledgerVerify(path: string, cp?: LedgerCheckpoint): LedgerCliResult {
  const r = verify(load(path), cp);
  if (r.ok) return { output: `ok: the hash chain verifies${cp ? ` against checkpoint ${cp.seq}` : ""}\n`, exitCode: 0 };
  return { output: `FAILED at seq ${r.failedAtSeq ?? "?"}: ${r.reason ?? "unspecified"}\n`, exitCode: 1 };
}

export function ledgerCheckpoint(path: string): LedgerCliResult {
  const text = load(path);
  const v = verify(text);
  if (!v.ok) {
    return { output: `refusing to checkpoint a ledger that does not verify (failed at seq ${v.failedAtSeq ?? "?"}: ${v.reason ?? "unspecified"})\n`, exitCode: 1 };
  }
  const c = checkpoint(text);
  return {
    output: `${c.seq}:${c.hash}\nRecord this value out of band (somewhere the ledger file cannot reach); pass it back with ledger verify --checkpoint to detect a rewrite or truncation.\n`,
    exitCode: 0,
  };
}

export function ledgerDiff(pathA: string, pathB: string): LedgerCliResult {
  const d = diff(load(pathA), load(pathB));
  const section = (title: string, rows: readonly { line: string }[]): string =>
    `${title} (${rows.length})\n${rows.map((r) => `  ${r.line}`).join("\n")}${rows.length ? "\n" : ""}`;
  const output = [section("added", d.added), section("removed", d.removed), section("changed", d.changed)].join("");
  const same = d.added.length + d.removed.length + d.changed.length === 0;
  return { output: same ? `${output}no differences by run\n` : output, exitCode: 0 };
}
