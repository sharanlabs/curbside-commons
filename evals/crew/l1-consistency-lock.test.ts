/**
 * K≥3 CONSISTENCY LOCK — the durable teeth on the 2026-07-27 owner-armed multi-rep run.
 *
 * The sibling `l1-live-lock` suite does this for the canonical K=1 record. This one
 * exists because a cross-model gate pointed out that the README promised it for
 * "every live run" while the three K=3 rep directories and the consistency report had
 * NO lock at all — a claim wider than the code backing it, which is this project's
 * recorded failure mode.
 *
 * For each frozen rep it replays the committed raw turns through the UNCHANGED shipped
 * orchestrator and re-derives everything downstream:
 *   - every committed trajectory record reproduces exactly (capture-then-replay makes
 *     records a pure function of case + turns);
 *   - every committed matrix row re-derives via `evaluateCase`;
 *   - and then the published consistency verdict re-derives from those matrices via the
 *     pre-registered floors.
 *
 * So the headline — "all seven floors cleared, flip-rate 0/20" — cannot be quietly
 * edited in the report: changing it breaks re-derivation here, and changing the
 * matrices to match breaks the replay from the raw turns.
 *
 * Offline, deterministic, $0 — the turns are data; the live lane's fetchers are never
 * imported on this path.
 *
 * Plain: three exam sittings are stored in the repo. This re-grades all three from the
 * stored answers, then re-computes the final verdict from those grades, every time the
 * suite runs.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CrewModel, IntakeDecision, ReviewerDecision } from "../../lib/crew/model.ts";
import { runCase } from "../../lib/crew/orchestrator.ts";
import type { CrewCase, TrajectoryRecord } from "../../lib/crew/types.ts";
import { evaluateCase, expectedTerminalFor, type MatrixRow } from "./harness.ts";
import { evaluateFloors, resolveCoverage, scoreConsistency, type Rep, type RepRow } from "./l1-consistency.ts";

const CONSISTENCY_DIR = join(process.cwd(), "evals", "crew", "gold", "consistency");
const LIVE_CASES_DIR = join(process.cwd(), "evals", "crew", "cases-live");

interface CommittedTurn {
  caseId: string;
  member: "intake" | "reviewer";
  ok: boolean;
  decision?: IntakeDecision | ReviewerDecision;
}
interface TurnsFile {
  model: string;
  rep?: string;
  turns: CommittedTurn[];
  degraded: Array<{ caseId: string }>;
}
interface RecordsFile {
  records: Array<{ caseId: string; record: TrajectoryRecord }>;
}
interface MatrixFile {
  model: string;
  matrix: MatrixRow[];
}
interface ReportFile {
  completeCoverage: boolean;
  verdict: string;
  floors: Array<{ id: string; value: string; pass: boolean }>;
  report: { reps: number; cases: number };
}

const repDirs = existsSync(CONSISTENCY_DIR)
  ? readdirSync(CONSISTENCY_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("rep-"))
      .map((d) => d.name)
      .sort()
  : [];

const loadCases = (): CrewCase[] =>
  readdirSync(LIVE_CASES_DIR)
    .filter((f) => f.endsWith(".case.json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(LIVE_CASES_DIR, f), "utf8")) as CrewCase);

const read = <T>(rep: string, name: string): T =>
  JSON.parse(readFileSync(join(CONSISTENCY_DIR, rep, name), "utf8")) as T;

/** Rebuild the replay model for one case from that rep's committed turns — loud on any gap. */
function committedModelFor(turnsFile: TurnsFile, caseId: string): CrewModel {
  const intake = turnsFile.turns.find((t) => t.caseId === caseId && t.member === "intake");
  if (!intake?.ok || intake.decision === undefined) throw new Error(`no committed OK intake turn for ${caseId}`);
  const reviewer = turnsFile.turns.find((t) => t.caseId === caseId && t.member === "reviewer");
  return {
    intakeTurn: () => intake.decision as IntakeDecision,
    reviewerTurn: () => {
      if (!reviewer?.ok || reviewer.decision === undefined) {
        throw new Error(`reviewer turn consulted but no committed OK reviewer turn exists for ${caseId}`);
      }
      return reviewer.decision as ReviewerDecision;
    },
  };
}

describe("K>=3 consistency lock (frozen reps -> re-derived records, matrices, verdict)", () => {
  it("the K>=3 run is present and has at least the pre-registered 3 reps", () => {
    expect(repDirs.length).toBeGreaterThanOrEqual(3);
  });

  const cases = loadCases();

  for (const rep of repDirs) {
    describe(rep, () => {
      const turnsFile = read<TurnsFile>(rep, "l1-live-turns.json");
      const recordsFile = read<RecordsFile>(rep, "l1-live-records.json");
      const matrixFile = read<MatrixFile>(rep, "l1-live-matrix.json");

      it("replaying this rep's committed turns reproduces every committed record", () => {
        for (const { caseId, record } of recordsFile.records) {
          const crewCase = cases.find((c) => c.caseId === caseId);
          expect(crewCase, caseId).toBeDefined();
          expect(runCase(crewCase as CrewCase, committedModelFor(turnsFile, caseId)), caseId).toEqual(record);
        }
      });

      it("every committed matrix row re-derives from its record via the same floors function", () => {
        expect(matrixFile.matrix.length).toBe(recordsFile.records.length);
        for (const row of matrixFile.matrix) {
          const crewCase = cases.find((c) => c.caseId === row.caseId) as CrewCase;
          const { record } = recordsFile.records.find((r) => r.caseId === row.caseId) as { record: TrajectoryRecord };
          expect(evaluateCase(crewCase, record), row.caseId).toEqual(row);
        }
      });

      it("scored + degraded partitions the committed split (nothing silently dropped)", () => {
        const scored = new Set(recordsFile.records.map((r) => r.caseId));
        const degraded = new Set(turnsFile.degraded.map((d) => d.caseId));
        for (const c of cases) {
          expect(scored.has(c.caseId) || degraded.has(c.caseId), c.caseId).toBe(true);
          expect(scored.has(c.caseId) && degraded.has(c.caseId), c.caseId).toBe(false);
        }
      });
    });
  }

  it("all reps answered the SAME exam with the SAME model", () => {
    const models = new Set(repDirs.map((r) => read<MatrixFile>(r, "l1-live-matrix.json").model));
    expect(models.size, `reps disagree on the model: ${[...models].join(", ")}`).toBe(1);
  });

  it("THE PUBLISHED VERDICT re-derives from the frozen matrices via the pre-registered floors", () => {
    // This is the tamper-evidence that matters: the report cannot claim a verdict the
    // committed per-case rows do not produce, and the rows cannot be edited to suit
    // because the per-rep replay above re-derives them from the raw turns.
    const report = read<ReportFile>(".", "consistency-report.json");
    const authoritativeIds = loadCases().map((c) => c.caseId).sort();
    const matrices = repDirs.map((r) => read<MatrixFile>(r, "l1-live-matrix.json").matrix);

    const coverage = resolveCoverage(
      authoritativeIds,
      matrices.map((m) => m.map((r) => r.caseId)),
    );
    expect(coverage.completeCoverage).toBe(report.completeCoverage);

    const reps: Rep[] = matrices.map((m) => {
      const byId = new Map(m.map((r) => [r.caseId, r as RepRow]));
      return { matrix: coverage.commonIds.map((id) => byId.get(id) as RepRow) };
    });
    const expectedByCaseId = Object.fromEntries(loadCases().map((c) => [c.caseId, expectedTerminalFor(c)]));

    const scored = scoreConsistency(reps);
    const { floors, allPass } = evaluateFloors(scored, expectedByCaseId);

    expect(scored.reps).toBe(report.report.reps);
    expect(scored.cases).toBe(report.report.cases);
    for (const published of report.floors) {
      const recomputed = floors.find((f) => f.id === published.id);
      expect(recomputed, published.id).toBeDefined();
      expect({ id: recomputed?.id, value: recomputed?.value, pass: recomputed?.pass }).toEqual({
        id: published.id,
        value: published.value,
        pass: published.pass,
      });
    }
    expect(allPass && coverage.completeCoverage ? "FLOORS CLEARED" : "DEFERRED").toBe(report.verdict);
  });
});
