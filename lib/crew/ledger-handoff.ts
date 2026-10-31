/**
 * LEDGER HAND-OFF (S2-crew amendment, 2026-10-31) — turns one crew trajectory
 * into the input of one run-ledger line (`lib/ledger`, S2-ledger lane). PURE:
 * no clock (the caller supplies `at`), no file, no append — the CLI lane owns
 * writing the ledger.
 *
 * Why the shape is declared HERE rather than imported: the crew's import
 * boundary (`evals/crew/crew-import-walk.test.ts`) lets `lib/crew/**` import
 * only the crew and the registry seam. So this file declares the ledger's
 * input shape structurally, and `evals/crew/crew-ledger-handoff.test.ts`
 * proves it IS a `LedgerEntryInput` (type-checked assignment, plus a real
 * in-memory `appendLine` + `verify`) — any drift in lib/ledger's shape fails
 * the type-check there.
 *
 * What goes in: the recommendations as references (finding ids, class,
 * rationale — the engine's own ids, never prose about them); the final route
 * when the run computed one (S2), else null; the model per model-directed
 * seat that actually turned ("replay" for committed turns, or the caller's
 * model id), and "DEFER" for the LLM root-cause seat on S2 runs; approval null
 * (a crew run never signs anything).
 *
 * Plain: the crew's logbook entry for one run, written out in the exact form
 * the tamper-evident notebook accepts — without the crew ever touching the
 * notebook itself.
 */
import type { TrajectoryRecord } from "./types.ts";

/** Structural mirror of lib/ledger's RuleVersions. */
export interface CrewLedgerRuleVersions {
  readonly listingsSpec: string;
  readonly feesSpec: string;
  readonly ucpPin: string;
}

/** Structural mirror of lib/ledger's LedgerEntryInput (proven equal by test). */
export interface CrewLedgerEntryInput {
  readonly at: string;
  readonly runId: string;
  readonly scenarioId: string | null;
  readonly inputsHash: string;
  readonly ruleVersions: CrewLedgerRuleVersions;
  readonly modelVersions: ReadonlyArray<{ readonly seat: string; readonly model: string }>;
  readonly recommendations: readonly unknown[];
  readonly route: string | null;
  readonly approval: null;
}

export interface LedgerHandoffMeta {
  readonly at: string;
  readonly runId: string;
  readonly scenarioId: string | null;
  readonly inputsHash: string;
  readonly ruleVersions: CrewLedgerRuleVersions;
  /** The model id the model-directed seats ran on; default "replay" (committed turns). */
  readonly modelId?: string;
}

/** Build the ledger input for one trajectory. Pure; throws on an empty required string (the ledger would refuse it anyway). */
export function toLedgerEntryInput(trajectory: TrajectoryRecord, meta: LedgerHandoffMeta): CrewLedgerEntryInput {
  for (const [k, v] of [["at", meta.at], ["runId", meta.runId], ["inputsHash", meta.inputsHash]] as const) {
    if (typeof v !== "string" || v.length === 0) throw new Error(`toLedgerEntryInput: "${k}" must be a non-empty string`);
  }
  const model = meta.modelId ?? "replay";
  const turned = (member: string) => trajectory.steps.some((s) => s.member === member && s.kind === "model_turn");
  const modelVersions: Array<{ seat: string; model: string }> = [];
  if (turned("intake")) modelVersions.push({ seat: "intake", model });
  if (turned("reviewer")) modelVersions.push({ seat: "reviewer", model });
  if (trajectory.rootCauseSeat !== undefined) modelVersions.push({ seat: "root-cause", model: trajectory.rootCauseSeat });
  return Object.freeze({
    at: meta.at,
    runId: meta.runId,
    scenarioId: meta.scenarioId,
    inputsHash: meta.inputsHash,
    ruleVersions: Object.freeze({ ...meta.ruleVersions }),
    modelVersions: Object.freeze(modelVersions.map((m) => Object.freeze(m))),
    recommendations: Object.freeze(
      trajectory.recommendations.map((r) =>
        Object.freeze({ findingIds: [...r.findingIds], recommendationClass: r.recommendationClass, rationale: r.rationale }),
      ),
    ),
    route: trajectory.route?.route ?? null,
    approval: null,
  });
}
