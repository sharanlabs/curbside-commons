/**
 * S2-crew replay harness — the S2 case set lives in its OWN directory
 * (`evals/crew/cases-s2/`) because the pre-registered A2 composition lock
 * (`crew-composition-lock.test.ts`, never edited) asserts that
 * `evals/crew/cases/` holds exactly its 20 pinned ids. Same evaluation as A2:
 * `evaluateCase` from the A2 harness, unchanged.
 *
 * Plain: the new practice questions sit in their own folder so the old,
 * sealed question folder keeps exactly the questions it was sealed with.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { RecordedModel, type RecordedTurnsFixture } from "../../lib/crew/model.ts";
import { runCase } from "../../lib/crew/orchestrator.ts";
import type { CrewCase, TrajectoryRecord } from "../../lib/crew/types.ts";
import { evaluateCase, type MatrixRow } from "./harness.ts";

export const CASES_S2_DIR = join(process.cwd(), "evals", "crew", "cases-s2");

/** Load every committed S2 case, sorted by caseId. */
export function loadS2Cases(): CrewCase[] {
  return readdirSync(CASES_S2_DIR)
    .filter((f) => f.endsWith(".case.json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(CASES_S2_DIR, f), "utf8")) as CrewCase);
}

/** The raw committed S2 turns fixture. */
export function loadS2TurnsFixture(): RecordedTurnsFixture {
  return JSON.parse(readFileSync(join(CASES_S2_DIR, "recorded-turns.json"), "utf8")) as RecordedTurnsFixture;
}

/** The committed S2 recorded-turns model (manifest-bound). */
export function loadS2RecordedModel(): RecordedModel {
  return new RecordedModel(loadS2TurnsFixture());
}

/** Replay every S2 case through the real orchestrator. */
export function replayS2(): { records: Map<string, TrajectoryRecord>; matrix: MatrixRow[] } {
  const model = loadS2RecordedModel();
  const records = new Map<string, TrajectoryRecord>();
  const matrix: MatrixRow[] = [];
  for (const c of loadS2Cases()) {
    const record = runCase(c, model);
    records.set(c.caseId, record);
    matrix.push(evaluateCase(c, record));
  }
  return { records, matrix };
}
