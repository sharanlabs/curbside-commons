/**
 * L-1 live-run eval lock — the durable teeth on the owner-armed live crew run
 * (pre-registration `docs/plan-l1-crew-live.md`; floors
 * `docs/plan-a2-trajectory-floors.md` §3/§4; status
 * `docs/crew-live-l1-status.md`).
 *
 * The live run's raw model turns are COMMITTED (`l1-live-turns.json`). This
 * lock replays those exact turns through the UNCHANGED shipped orchestrator
 * (`runCase`) offline and re-derives everything downstream:
 *  - every committed trajectory record reproduces exactly (capture-then-replay
 *    means the records are a pure function of case + turns);
 *  - every committed matrix row re-derives via `evaluateCase` — the same
 *    floors function the offline replay uses;
 *  - the per-member floor summary re-derives from the matrix, so a tampered
 *    verdict cannot survive: flipping a FAIL to PASS in any committed artifact
 *    breaks re-derivation here, and inventing kinder expectations breaks the
 *    engine-derived composition lock instead.
 *
 * Offline, deterministic, $0 — no network import can reach this path (the
 * turns are data; the live lane's fetchers are never imported here).
 *
 * Plain: the AI's real exam answers are stored in the repo; this test re-runs
 * the whole grading from those stored answers every time the suite runs. If
 * anyone edits the grade, the re-grade catches it.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CrewModel, IntakeDecision, ReviewerDecision } from "../../lib/crew/model.ts";
import { runCase } from "../../lib/crew/orchestrator.ts";
import type { CrewCase, TrajectoryRecord } from "../../lib/crew/types.ts";
import { evaluateCase, type MatrixRow } from "./harness.ts";

const GOLD = join(process.cwd(), "evals", "crew", "gold");
const LIVE_CASES_DIR = join(process.cwd(), "evals", "crew", "cases-live");

interface CommittedTurn {
  caseId: string;
  member: "intake" | "reviewer";
  ok: boolean;
  decision?: IntakeDecision | ReviewerDecision;
}
interface TurnsFile {
  model: string;
  turns: CommittedTurn[];
  degraded: Array<{ caseId: string }>;
}
interface RecordsFile {
  records: Array<{ caseId: string; record: TrajectoryRecord }>;
}
interface MatrixFile {
  matrix: MatrixRow[];
  summary: Record<
    string,
    { cases: number; degraded: number; safetyPass: number; classMatch: number; judged: boolean; floorsPass: boolean }
  >;
}

const turnsFile = JSON.parse(readFileSync(join(GOLD, "l1-live-turns.json"), "utf8")) as TurnsFile;
const recordsFile = JSON.parse(readFileSync(join(GOLD, "l1-live-records.json"), "utf8")) as RecordsFile;
const matrixFile = JSON.parse(readFileSync(join(GOLD, "l1-live-matrix.json"), "utf8")) as MatrixFile;

function loadLiveCases(): CrewCase[] {
  return readdirSync(LIVE_CASES_DIR)
    .filter((f) => f.endsWith(".case.json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(LIVE_CASES_DIR, f), "utf8")) as CrewCase);
}

/** Rebuild the replay model for one case from the committed live turns — loud on any gap. */
function committedModelFor(caseId: string): CrewModel {
  const intake = turnsFile.turns.find((t) => t.caseId === caseId && t.member === "intake");
  if (!intake?.ok || intake.decision === undefined) {
    throw new Error(`no committed OK intake turn for ${caseId}`);
  }
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

describe("L-1 live-run lock (committed turns → re-derived records, matrix, floors)", () => {
  const cases = loadLiveCases();
  const degradedIds = new Set(turnsFile.degraded.map((d) => d.caseId));

  it("replaying the committed live turns through the unchanged orchestrator reproduces every committed record", () => {
    for (const { caseId, record } of recordsFile.records) {
      const crewCase = cases.find((c) => c.caseId === caseId);
      expect(crewCase, caseId).toBeDefined();
      const replayed = runCase(crewCase as CrewCase, committedModelFor(caseId));
      expect(replayed, caseId).toEqual(record);
    }
  });

  it("every committed matrix row re-derives from its committed record via the same floors function", () => {
    expect(matrixFile.matrix.length).toBe(recordsFile.records.length);
    for (const row of matrixFile.matrix) {
      const crewCase = cases.find((c) => c.caseId === row.caseId) as CrewCase;
      const { record } = recordsFile.records.find((r) => r.caseId === row.caseId) as { record: TrajectoryRecord };
      expect(evaluateCase(crewCase, record), row.caseId).toEqual(row);
    }
  });

  it("the per-member floor summary re-derives from the matrix (100% safety + 5/5 class-match; degraded → unjudged)", () => {
    for (const member of ["intake", "audit", "evidence", "reviewer"]) {
      const focus = cases.filter((c) => c.member === member);
      const deg = focus.filter((c) => degradedIds.has(c.caseId)).length;
      const rows = matrixFile.matrix.filter((r) => r.member === member);
      const expected = {
        cases: focus.length,
        degraded: deg,
        safetyPass: rows.filter((r) => r.safetyPass).length,
        classMatch: rows.filter((r) => r.classMatch).length,
        judged: deg === 0,
        floorsPass:
          deg === 0 &&
          rows.filter((r) => r.safetyPass).length === focus.length &&
          rows.filter((r) => r.classMatch).length === focus.length,
      };
      expect(matrixFile.summary[member], member).toEqual(expected);
    }
  });

  it("scored + degraded partitions the whole held-out split (nothing silently dropped)", () => {
    const scored = new Set(recordsFile.records.map((r) => r.caseId));
    for (const c of cases) {
      expect(scored.has(c.caseId) || degradedIds.has(c.caseId), c.caseId).toBe(true);
      expect(scored.has(c.caseId) && degradedIds.has(c.caseId), c.caseId).toBe(false);
    }
  });
});
