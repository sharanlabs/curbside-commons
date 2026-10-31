/**
 * Ledger diff: compare two ledger texts by `runId` and say, in one plain line
 * each, which runs were added, removed, or changed. Pure. When a run has several
 * lines (a run, then its approval) the LATEST line per runId is compared, and
 * only the content fields: `seq`, `at`, `prevHash` and `hash` are bookkeeping and
 * never count as a change. Does not verify either text; run `verify` first.
 */
import { canonicalContentJson } from "../approvals/canonical.ts";
import { parseLines, type LedgerEntry } from "./chain.ts";

export interface DiffLine {
  readonly runId: string;
  readonly line: string;
}
export interface LedgerDiff {
  readonly added: DiffLine[];
  readonly removed: DiffLine[];
  readonly changed: DiffLine[];
}

const FIELDS: ReadonlyArray<readonly [keyof LedgerEntry, string]> = [
  ["scenarioId", "scenario"],
  ["inputsHash", "inputs"],
  ["ruleVersions", "rule versions"],
  ["modelVersions", "model versions"],
  ["recommendations", "recommendations"],
  ["route", "route"],
  ["approval", "approval"],
];

function latestByRun(text: string): Map<string, LedgerEntry> {
  const m = new Map<string, LedgerEntry>();
  for (const e of parseLines(text)) m.set(e.runId, e); // later lines overwrite earlier
  return m;
}

function show(v: unknown): string {
  return v === null || v === undefined ? "none" : typeof v === "string" ? `"${v}"` : canonicalContentJson(v);
}

export function diff(textA: string, textB: string): LedgerDiff {
  const a = latestByRun(textA);
  const b = latestByRun(textB);
  const out: { added: DiffLine[]; removed: DiffLine[]; changed: DiffLine[] } = { added: [], removed: [], changed: [] };
  for (const runId of [...b.keys()].sort()) {
    const eb = b.get(runId) as LedgerEntry;
    const ea = a.get(runId);
    if (ea === undefined) {
      out.added.push({ runId, line: `Run ${runId} was added (scenario ${show(eb.scenarioId)}, route ${show(eb.route)}).` });
      continue;
    }
    const diffs: string[] = [];
    for (const [key, label] of FIELDS) {
      if (canonicalContentJson(ea[key]) !== canonicalContentJson(eb[key])) {
        diffs.push(`${label} ${show(ea[key])} -> ${show(eb[key])}`);
      }
    }
    if (diffs.length > 0) out.changed.push({ runId, line: `Run ${runId} changed: ${diffs.join("; ")}.` });
  }
  for (const runId of [...a.keys()].sort()) {
    if (!b.has(runId)) out.removed.push({ runId, line: `Run ${runId} is missing from the newer ledger.` });
  }
  return out;
}
