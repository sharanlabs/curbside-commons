/**
 * Emit candidate eval-case stubs from a run ledger.
 *
 * Run: npx tsx scripts-ts/ledger-to-eval-candidates.mts <ledger.jsonl> <NEW-output-folder>
 *
 * Reads the ledger, refuses it if it does not verify, and writes one
 * `<runId>.candidate.json` per signed / withdrawn / expired disposition into the
 * output folder. The folder MUST NOT exist (it is a new split; an existing or
 * exposed split is never reused or overwritten). Writes only inside that folder.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { candidatesFromLedger } from "../lib/ledger/candidates.ts";
import { readLedgerFile } from "../lib/ledger/fs.ts";

export function emitCandidates(ledgerPath: string, outDir: string): string[] {
  const out = resolve(outDir);
  if (existsSync(out)) throw new Error(`refusing to write into an existing folder: ${out}`);
  const stubs = candidatesFromLedger(readLedgerFile(ledgerPath));
  mkdirSync(out, { recursive: true });
  return stubs.map((s) => {
    const file = join(out, `${s.source.runId}-seq${s.source.seq}.candidate.json`);
    writeFileSync(file, `${JSON.stringify(s, null, 2)}\n`, "utf8");
    return file;
  });
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop() ?? "\0")) {
  const [ledger, dir] = process.argv.slice(2);
  if (!ledger || !dir) {
    console.error("usage: ledger-to-eval-candidates.mts <ledger.jsonl> <new-output-folder>");
    process.exit(2);
  }
  const written = emitCandidates(ledger, dir);
  console.log(`wrote ${written.length} candidate stub(s) to ${resolve(dir)}`);
}
