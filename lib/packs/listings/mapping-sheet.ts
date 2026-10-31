/**
 * The id-mapping sheet — a human-owned reference layer in front of the record
 * (S3 CP2; plan § 4 MAP → ENGINE; plan § 6 control register: "the id-mapping
 * sheet is cited as a reference row when it resolves an identity").
 *
 * A platform-shaped copy keys its rows by the platform's own ids (opaque,
 * merchant- or platform-controlled strings), not by the record's variation ids.
 * A person who knows both keeps a sheet that says which is which:
 *
 *   platform_item_id, record_variation_id, mapped_by, mapped_at, note
 *
 * When a copy row's id is NOT a record variation id but the sheet maps it to one,
 * the row resolves to that record row, and every finding whose receipt would be
 * that record row cites the SHEET LINE instead: `referenceRowId: "mapping:<line>"`
 * (the spreadsheet line a reader sees; the header is line 1). The resolution is
 * also returned on its own, labeled `matching: "mapping-sheet"`.
 *
 * What the sheet never does:
 *  - it never decides OWNERSHIP. `mapped_by` records who kept the line; it is not
 *    read by any rule, never enters a report, and never says who caused a finding
 *    (Codex cross-check 2026-10-12 § 3 p.1). Who owns a finding is a scenario input;
 *  - it never guesses. A row the sheet does not map takes the engine's existing
 *    path (exact-name resolution, ambiguity reported, otherwise a ghost);
 *  - it never overrides the record's own ids: a copy row already keyed by a record
 *    id resolves by that id.
 *
 * Lifecycle (blindspot pass Q9): a line that maps to a record row which no longer
 * exists is STALE — reported as LST-MAP-STALE (warn, existence) and resolving
 * nothing; a line the sheet lacks is the ordinary unresolved path; two record rows
 * sharing one name with no line is ambiguity, reported, never resolved by guess.
 *
 * Refused (a refusal is not a finding — nothing is verified): a missing column, a
 * blank or reserved id, a platform id listed twice, a mapped_at that is not an
 * instant, a line that re-maps one record id to another, and any mapping under
 * which two copy rows would be judged as one record row.
 *
 * Plain: the spreadsheet where someone wrote "the platform's item 17 is our
 * small calamari". The checker uses it to line rows up and cites the line it
 * used — and never reads it as "who is to blame".
 */
import type { Claim, Reference, ReferenceMatch, VerifierReport } from "../../verifier-core/index.ts";
import { makeFinding } from "../../verifier-core/guard.ts";
import { buildReport } from "../../verifier-core/verify.ts";
import { parseCsv } from "../../playground/csv.ts";
import { parseInstant } from "./instants.ts";
import { ListingsInputError, indexCatalog, reservedIdProblem, sorReference } from "./reference.ts";
import { runListingsVerification, type ListingsRunProvenance } from "./run.ts";
import type { SyntheticCatalog } from "./types.ts";

export const MAPPING_SHEET_COLUMNS = ["platform_item_id", "record_variation_id", "mapped_by", "mapped_at", "note"] as const;

/** One sheet line, declared columns only. */
export interface MappingSheetRow {
  /** 1-based spreadsheet line (the header is line 1). */
  readonly line: number;
  readonly platform_item_id: string;
  readonly record_variation_id: string;
  readonly mapped_by: string;
  readonly mapped_at: string;
  readonly note: string;
}

export interface MappingSheet {
  readonly rows: readonly MappingSheetRow[];
}

/** A sheet the engine refuses; `line` is the spreadsheet line, or null for a whole-sheet problem. */
export class MappingSheetError extends ListingsInputError {
  readonly line: number | null;
  constructor(line: number | null, problem: string) {
    super(`The id-mapping sheet was refused${line === null ? "" : ` at line ${line}`}: ${problem} Nothing was verified.`);
    this.name = "MappingSheetError";
    this.line = line;
  }
}

const header = (h: string): string => h.replace(/^﻿/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");

/** Parse the sheet (columns by header name; unknown columns ignored). Throws MappingSheetError. */
export function parseMappingSheet(text: string): MappingSheet {
  const parsed = parseCsv(text);
  if (!parsed.ok) throw new MappingSheetError(null, parsed.error);
  const [head, ...body] = parsed.rows;
  if (head === undefined) throw new MappingSheetError(null, "the sheet is empty.");
  const col = new Map<string, number>();
  head.cells.forEach((h, i) => {
    const k = header(h);
    if ((MAPPING_SHEET_COLUMNS as readonly string[]).includes(k) && !col.has(k)) col.set(k, i);
  });
  for (const required of ["platform_item_id", "record_variation_id", "mapped_by", "mapped_at"]) {
    if (!col.has(required)) throw new MappingSheetError(head.line, `the header names no ${required} column (a human-owned sheet records who mapped each line, and when).`);
  }
  const cell = (cells: readonly string[], name: string): string => (cells[col.get(name) ?? -1] ?? "").trim();
  const seen = new Map<string, number>();
  const rows = body.map((r): MappingSheetRow => {
    const row: MappingSheetRow = {
      line: r.line,
      platform_item_id: cell(r.cells, "platform_item_id"),
      record_variation_id: cell(r.cells, "record_variation_id"),
      mapped_by: cell(r.cells, "mapped_by"),
      mapped_at: cell(r.cells, "mapped_at"),
      note: cell(r.cells, "note"),
    };
    for (const k of ["platform_item_id", "record_variation_id", "mapped_by", "mapped_at"] as const) {
      if (row[k] === "") throw new MappingSheetError(r.line, `${k} is blank.`);
    }
    for (const k of ["platform_item_id", "record_variation_id"] as const) {
      const problem = reservedIdProblem(row[k]);
      if (problem) throw new MappingSheetError(r.line, `${k} ${problem}`);
    }
    if (parseInstant(row.mapped_at) === null) throw new MappingSheetError(r.line, `mapped_at "${row.mapped_at}" is not a readable instant.`);
    const first = seen.get(row.platform_item_id);
    if (first !== undefined) {
      throw new MappingSheetError(r.line, `platform_item_id "${row.platform_item_id}" is mapped again (first on line ${first}) — one platform id, one record row.`);
    }
    seen.set(row.platform_item_id, r.line);
    return row;
  });
  return { rows };
}

/** The sheet line cited when it resolves an identity. */
export const mappingRowId = (line: number): string => `mapping:${line}`;

/** One identity the sheet resolved on a run. */
export interface MappingResolution {
  readonly platformItemId: string;
  readonly recordVariationId: string;
  readonly referenceRowId: string;
  readonly matching: "mapping-sheet";
}

interface Layer {
  /** Copy row id → the live sheet line that maps it (stale lines excluded). */
  readonly live: ReadonlyMap<string, MappingSheetRow>;
  readonly stale: readonly MappingSheetRow[];
}

function layerOf(sor: SyntheticCatalog, sheet: MappingSheet): Layer {
  const { byVariationId } = indexCatalog(sor);
  const live = new Map<string, MappingSheetRow>();
  const stale: MappingSheetRow[] = [];
  for (const row of sheet.rows) {
    if (byVariationId.has(row.platform_item_id)) {
      if (row.platform_item_id !== row.record_variation_id) {
        throw new MappingSheetError(row.line, `"${row.platform_item_id}" is already a record variation id; mapping it to "${row.record_variation_id}" would give one id two meanings.`);
      }
      continue; // an identity line: the record id already resolves
    }
    if (!byVariationId.has(row.record_variation_id)) stale.push(row);
    else live.set(row.platform_item_id, row);
  }
  return { live, stale };
}

/**
 * The sheet as a Reference layer in front of {@link sorReference}: the record's
 * own ids resolve first, unchanged; a copy row the record does not know, which a
 * live sheet line maps, resolves to that record row with the sheet line as its
 * receipt. (The engine's `MatchingMode` type has two values; the sheet's own label,
 * "mapping-sheet", is carried on {@link MappingResolution}.)
 */
export function mappingSheetReference(sor: SyntheticCatalog, sheet: MappingSheet): Reference {
  const base = sorReference(sor);
  const { live } = layerOf(sor, sheet);
  const { byVariationId } = indexCatalog(sor);
  return {
    kind: "pos-catalog",
    resolve(claim: Claim): ReferenceMatch | null {
      const hit = base.resolve(claim);
      if (hit) return hit;
      const row = live.get(claim.id.split("#")[0]);
      if (!row) return null;
      return { referenceRowId: mappingRowId(row.line), matching: "synthetic-controlled", value: byVariationId.get(row.record_variation_id)! };
    },
  };
}

export interface MappedRun {
  readonly report: VerifierReport;
  readonly resolutions: readonly MappingResolution[];
}

/**
 * Run the listings engine with the sheet in front of the record. The engine run
 * is the ordinary one (one engine; its completeness sweep and every rule
 * unchanged): each mapped copy row is judged under the record id the sheet names,
 * then every finding is handed back under the copy's own row id, and a receipt
 * that named that record row names the sheet line instead. Stale lines are
 * reported as LST-MAP-STALE.
 */
export function runListingsVerificationWithMapping(
  claims: readonly Claim[],
  sor: SyntheticCatalog,
  sheet: MappingSheet,
  provenance: ListingsRunProvenance = {},
): MappedRun {
  const { live, stale } = layerOf(sor, sheet);
  const { byVariationId } = indexCatalog(sor);
  const rowOf = (id: string): string => id.split("#")[0];
  const servedRows = new Set(claims.map((c) => rowOf(c.id)).filter((r) => r !== "catalog"));

  // Which record row each served copy row will be judged under; two copy rows on one record row is refused.
  const judgedAs = new Map<string, { copyRow: string; line: number | null }>();
  for (const r of servedRows) {
    const row = live.get(r);
    const target = row ? row.record_variation_id : byVariationId.has(r) ? r : null;
    if (target === null) continue;
    const prior = judgedAs.get(target);
    if (prior) {
      throw new MappingSheetError(row?.line ?? prior.line, `copy rows "${prior.copyRow}" and "${r}" would both be judged as record row "${target}" — one record row, one copy row.`);
    }
    judgedAs.set(target, { copyRow: r, line: row ? row.line : null });
  }

  const back = new Map<string, MappingSheetRow>(); // record id → the line that mapped a copy row onto it
  const resolutions: MappingResolution[] = [];
  for (const r of [...servedRows].sort()) {
    const row = live.get(r);
    if (!row) continue;
    back.set(row.record_variation_id, row);
    resolutions.push({ platformItemId: r, recordVariationId: row.record_variation_id, referenceRowId: mappingRowId(row.line), matching: "mapping-sheet" });
  }

  const rename = (id: string, from: string, to: string): string => to + id.slice(from.length);
  const judged = claims.map((c) => {
    const r = rowOf(c.id);
    const row = live.get(r);
    return row ? { ...c, id: rename(c.id, r, row.record_variation_id) } : c;
  });
  const base = runListingsVerification(judged, sor, provenance);
  const handedBack = base.findings.map((f) => {
    const r = rowOf(f.claim.id);
    const row = back.get(r);
    if (!row) return f;
    return makeFinding({
      ...f,
      claim: { ...f.claim, id: rename(f.claim.id, r, row.platform_item_id) },
      referenceRowId: f.referenceRowId === r ? mappingRowId(row.line) : f.referenceRowId,
    });
  });
  const source = claims[0]?.source ?? "acp-feed";
  const staleFindings = stale.map((row) =>
    makeFinding({
      claim: {
        id: `${mappingRowId(row.line)}#record_variation_id`,
        source,
        field: "mapping.record_variation_id",
        value: { platform_item_id: row.platform_item_id, record_variation_id: row.record_variation_id },
      },
      referenceRowId: "catalog-meta",
      ruleId: "LST-MAP-STALE",
      severity: "warn",
      category: "existence",
      plainLine: `Line ${row.line} of the id-mapping sheet maps "${row.platform_item_id}" to record row "${row.record_variation_id}", which the merchant's record does not have — the line is stale and resolves nothing.`,
    }),
  );
  return {
    report: buildReport([...handedBack, ...staleFindings], { specVersion: base.specVersion, matchingMode: base.matchingMode, simulated: base.simulated }),
    resolutions,
  };
}
