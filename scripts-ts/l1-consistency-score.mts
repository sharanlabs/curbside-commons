/**
 * L-1 CONSISTENCY SCORING CLI — reads the frozen per-rep matrices and scores them
 * against the seven PRE-REGISTERED floors (`docs/l1-consistency-preregistration.md`).
 *
 * Run: node scripts-ts/l1-consistency-score.mts
 *
 * Offline, deterministic, $0. It reads only committed JSON and calls the scorer
 * committed BEFORE any live data existed (`evals/crew/l1-consistency.ts`). No
 * network, no provider, no clock in the verdict — same reps in, same verdict out,
 * so a scoring dispute is settled by re-running this.
 *
 * TWO DISCIPLINES THIS FILE ENFORCES, both from the pre-registration:
 *
 *  1. NEVER SILENTLY SHRINK THE DENOMINATOR. A case that went PROVIDER-DEGRADED in
 *     one rep is absent from that rep's matrix. Scoring the intersection without
 *     saying so would drop the hardest cases and flatter every flip-rate — the
 *     scorer's own docstring names this as the way the measurement could cheat.
 *     So: complete coverage is scored plainly; incomplete coverage is scored on the
 *     intersection AND stamped `completeCoverage: false` with the dropped ids, so no
 *     label derived from it can omit the caveat.
 *
 *  2. A FLOOR MISS IS A RESULT, NOT AN ERROR. Exit code stays 0 on a miss and the
 *     numbers are written regardless. The pre-registration is explicit: a miss is
 *     published as DEFERRED and the split burns — it is never retried to green.
 *     Exiting non-zero here would invite exactly that retry.
 *
 * Plain: the exam was taken three times; this re-grades all three together and asks
 * whether the crew answers the same way each time, against a bar written before
 * anyone saw a score.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedTerminalFor } from "../evals/crew/harness.ts";
import { evaluateFloors, scoreConsistency, type Rep, type RepRow } from "../evals/crew/l1-consistency.ts";
import type { CrewCase } from "../lib/crew/types.ts";

const GOLD_DIR = join(process.cwd(), "evals", "crew", "gold");
const CONSISTENCY_DIR = join(GOLD_DIR, "consistency");
const LIVE_CASES_DIR = join(process.cwd(), "evals", "crew", "cases-live");
const REPORT_PATH = join(CONSISTENCY_DIR, "consistency-report.json");

interface MatrixFile {
  readonly model: string;
  readonly rep?: string;
  readonly startedAt: string;
  readonly matrix: readonly RepRow[];
  readonly degradedCount?: number;
}

// ---- load every rep, in stable directory order ----
const repDirs = readdirSync(CONSISTENCY_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith("rep-"))
  .map((d) => d.name)
  .sort();

if (repDirs.length === 0) {
  console.error(`no rep-* directories under ${CONSISTENCY_DIR} — run the harness with L1_OUT_DIR first`);
  process.exit(1);
}

const files: MatrixFile[] = repDirs.map(
  (d) => JSON.parse(readFileSync(join(CONSISTENCY_DIR, d, "l1-live-matrix.json"), "utf8")) as MatrixFile,
);

console.log(`reps found: ${repDirs.length} (${repDirs.join(", ")})`);
for (const [i, f] of files.entries()) {
  console.log(`  ${repDirs[i]}: ${f.matrix.length} scored, ${f.degradedCount ?? 0} degraded, model=${f.model}, started=${f.startedAt}`);
}

// The model must be identical across reps — reps differ only in provider
// nondeterminism, never in which model answered (that would be a different exam).
const models = new Set(files.map((f) => f.model));
if (models.size !== 1) {
  console.error(`\nREFUSING: reps used different models (${[...models].join(", ")}) — that is not a consistency measurement.`);
  process.exit(1);
}

// ---- coverage: intersect, but never silently ----
const idSets = files.map((f) => new Set(f.matrix.map((r) => r.caseId)));
const allIds = [...new Set(files.flatMap((f) => f.matrix.map((r) => r.caseId)))].sort();
const commonIds = allIds.filter((id) => idSets.every((s) => s.has(id)));
const droppedIds = allIds.filter((id) => !commonIds.includes(id));
const completeCoverage = droppedIds.length === 0;

if (!completeCoverage) {
  console.log(`\n⚠ COVERAGE INCOMPLETE — ${droppedIds.length} case(s) missing from at least one rep:`);
  for (const id of droppedIds) {
    const missing = repDirs.filter((_, i) => !idSets[i].has(id));
    console.log(`    ${id} — absent from ${missing.join(", ")}`);
  }
  console.log("  Scoring the intersection; the report is stamped completeCoverage:false.");
  console.log("  Any label derived from this run MUST carry that caveat.");
}

// Reps are normalised to the common case set in a FIXED order so the scorer's
// same-cases-same-order guard is satisfied by construction rather than by luck.
const reps: Rep[] = files.map((f) => {
  const byId = new Map(f.matrix.map((r) => [r.caseId, r]));
  return { matrix: commonIds.map((id) => byId.get(id) as RepRow) };
});

// ---- C-5 expectations come from the COMMITTED case files, never re-typed here ----
//
// The translation MATTERS and is imported, not rewritten. `expectedGateState` is
// `approve-recommendation | escalate-to-human`; `terminal` is
// `recommendation | escalate-to-human`. Comparing them raw type-checks (both are
// strings), agrees on escalate-to-human, and silently fails all 11
// approve-recommendation cases REGARDLESS OF CREW BEHAVIOUR — the first scoring
// run of 2026-07-27 did exactly that and reported C-5 as 9/20 against a crew that
// was in fact 20/20. A floor no possible behaviour can clear is not a strict bar,
// it is a broken gauge, and it was caught because six floors read a perfect 0.0000
// while the seventh read 9/20: an internally impossible result.
const expectedByCaseId: Record<string, string> = {};
for (const f of readdirSync(LIVE_CASES_DIR).filter((n) => n.endsWith(".case.json")).sort()) {
  const c = JSON.parse(readFileSync(join(LIVE_CASES_DIR, f), "utf8")) as CrewCase;
  expectedByCaseId[c.caseId] = expectedTerminalFor(c);
}

// ---- score ----
const report = scoreConsistency(reps);
const { floors, allPass } = evaluateFloors(report, expectedByCaseId);

console.log(`\n=== PER-CASE FLIPS (K=${report.reps}, n=${report.cases}) ===`);
for (const c of report.perCase) {
  const flags = [
    c.terminalFlip ? "terminal" : "",
    c.classFlip ? "class" : "",
    c.safetyFlip ? "SAFETY" : "",
    c.unsafeDirectionFlip ? "UNSAFE-DIR" : "",
  ].filter(Boolean);
  const mark = flags.length === 0 ? "·" : "✖";
  console.log(
    `${mark} ${c.caseId} [${c.member}] modal=${c.modalTerminal}` +
      (flags.length ? `  FLIPS: ${flags.join(",")}  (${c.terminals.join(" | ")})` : ""),
  );
}

console.log("\n=== PRE-REGISTERED FLOORS ===");
for (const f of floors) {
  console.log(`${f.pass ? "PASS" : "FAIL"}  ${f.id}: ${f.value}   [floor: ${f.floor}]`);
}

const verdict = allPass && completeCoverage ? "FLOORS CLEARED" : "DEFERRED";
console.log(`\nVERDICT: ${verdict}`);
if (!allPass) {
  console.log("A floor was missed. Per the pre-registration the numbers are published as-is,");
  console.log("the label reads DEFERRED, and the split is BURNED — this is NOT retried to green.");
} else if (!completeCoverage) {
  console.log("Every floor passed, but coverage was incomplete — the honest label is DEFERRED");
  console.log("until a run with full coverage clears the same floors.");
}

writeFileSync(
  REPORT_PATH,
  `${JSON.stringify(
    {
      scoredAt: new Date().toISOString(),
      model: files[0].model,
      reps: repDirs,
      completeCoverage,
      droppedIds,
      verdict,
      floors,
      report,
    },
    null,
    2,
  )}\n`,
);
console.log(`\nreport written: ${REPORT_PATH}`);
// Exit 0 even on a miss — see the header: a floor miss is a publishable result,
// and a non-zero exit is an invitation to re-run until it goes green.
