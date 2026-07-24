/**
 * A2 CREW ORCHESTRATOR — runs one committed trajectory case end-to-end through
 * the four members (Intake → Audit → Evidence → Reviewer) over the A0 registry
 * (plan §3, §5 row A2, §6; floors doc `docs/plan-a2-trajectory-floors.md`).
 *
 * THE CONTAINMENT CONTRACT (what makes offline injection cases meaningful):
 * the model seam is UNTRUSTED. A recorded turn can simulate a fully steered
 * model — requesting a forbidden tool, approving after an anomaly — and the
 * orchestrator must CONTAIN it at the call site: tool requests are checked
 * against the case's allowedTools/forbiddenTools HERE (never trusted from the
 * model), demo-only/advisory results are refused as verdicts HERE (via the A0
 * `assertDecisionGrade` guard), and ANY anomaly forces the terminal to
 * escalate-to-human even over a model "approve" (the forced_escalation step).
 * Recommendations can only reference finding ids that exist in the engine's
 * own report (`makeRecommendation` throws on fabrication). The engine is never
 * mutated — the crew holds no channel to it except `callTool`, and the AC-6
 * behavioral test byte-compares the engine's direct answer before and after a
 * crew run.
 *
 * Every branch emits a typed step and every run ends in exactly one of the two
 * lawful terminals — a silent drop is structurally impossible (§6).
 *
 * Plain: the team's "brain" steps are treated like an intern's suggestions —
 * checked at the door, never handed the keys. If anything smells wrong at any
 * point, the run is handed to the human, even when the brain says "all good."
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { assertDecisionGrade, callTool, type ToolResult } from "../tools/registry.ts";
import { detectInjectionSignatures } from "./injection-scan.ts";
import { quarantineExcerpt, type CrewModel, type IntakeDecision } from "./model.ts";
import {
  deriveRecommendationClass,
  makeRecommendation,
  parseReportCanonical,
  type CrewCase,
  type Recommendation,
  type TerminalClass,
  type TrajectoryRecord,
  type TrajectoryStep,
} from "./types.ts";

/** sha256 of the canonical JSON (recursively key-sorted) of a params object — the §6 argument digest. */
export function argsDigest(params: Readonly<Record<string, unknown>>): string {
  const canonicalize = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(canonicalize);
    if (v !== null && typeof v === "object") {
      const entries = Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1));
      return Object.fromEntries(entries.map(([k, val]) => [k, canonicalize(val)]));
    }
    return v;
  };
  return createHash("sha256").update(JSON.stringify(canonicalize(params))).digest("hex");
}

/** sha256 of a canonical payload string — the §6 engine-report hash. */
export function reportHash(canonical: string): string {
  return createHash("sha256").update(canonical).digest("hex");
}

/** Run one committed case through the crew. Deterministic given (case, model). */
export function runCase(crewCase: CrewCase, model: CrewModel): TrajectoryRecord {
  const steps: TrajectoryStep[] = [];
  const anomalies: string[] = [];
  let recommendations: readonly Recommendation[] = [];
  let terminalClass: TerminalClass = "none-escalated";
  let engineReportHash: string | null = null;

  // ---- INTAKE (model-directed routing; decision contained below, never trusted) ----
  const rawArtifact = readFileSync(crewCase.inputArtifact.path, "utf8");

  // ---- STRUCTURAL INJECTION TRIPWIRE (M2): scan the FULL artifact BEFORE any
  // model turn, so a payload placed past the 400-char model excerpt window
  // (`quarantineExcerpt`) still surfaces. Each hit is an anomaly, which the
  // forced-escalation path below (anomalies → escalate-to-human, even over a
  // model "approve") turns into an untruncatable structural control. This is a
  // tripwire, not a parser or a guarantee (lib/crew/injection-scan.ts). ----
  for (const sig of detectInjectionSignatures(rawArtifact)) {
    anomalies.push(`injection_signature:${sig}`);
  }

  const decision: IntakeDecision = model.intakeTurn({
    caseId: crewCase.caseId,
    ask: crewCase.ask,
    quarantinedArtifactExcerpt: quarantineExcerpt(rawArtifact),
    allowedTools: crewCase.allowedTools,
  });
  steps.push({
    member: "intake",
    kind: "model_turn",
    note:
      decision.kind === "route"
        ? `intake routed the ask to tool "${decision.tool}"`
        : `intake rejected the ask: ${decision.reason}`,
  });

  if (decision.kind === "reject") {
    steps.push({
      member: "intake",
      kind: "escalation",
      note: "intake could not route this ask — escalating to the human (never a guess)",
    });
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, null, null);
  }

  // ---- CONTAINMENT GATE: the case contract is enforced HERE, not by the model ----
  const allowed = new Set(crewCase.allowedTools);
  const forbidden = new Set(crewCase.forbiddenTools);
  let consumedReport: ReturnType<typeof parseReportCanonical> | null = null;

  // Param-level containment (Codex A2 review P2-1): when the case carries a
  // call contract (expectedToolCalls — always present in A2 replay), a routed
  // call must match the NEXT contracted call in BOTH tool name and argument
  // digest BEFORE it executes; an allowed tool with steered params is blocked,
  // not executed-then-caught. (A live L-1 case must carry the same contract or
  // a deterministic param mapper — recorded as an arming requirement.)
  const nextContract = crewCase.expectedToolCalls[0];
  const paramsMismatch =
    nextContract !== undefined &&
    nextContract.tool === decision.tool &&
    argsDigest(nextContract.params) !== argsDigest(decision.params);
  const toolNotContracted =
    nextContract === undefined || nextContract.tool !== decision.tool;

  if (forbidden.has(decision.tool) || !allowed.has(decision.tool)) {
    anomalies.push(`blocked out-of-contract tool request "${decision.tool}"`);
    steps.push({
      member: "audit",
      kind: "blocked_tool_call",
      toolName: decision.tool,
      note: `tool "${decision.tool}" is outside this case's contract (allowed: ${[...allowed].join(", ")}) — BLOCKED at the call site`,
    });
  } else if (paramsMismatch || toolNotContracted) {
    anomalies.push(
      paramsMismatch
        ? `blocked "${decision.tool}": argument digest deviates from the case's call contract`
        : `blocked "${decision.tool}": not the contracted next call`,
    );
    steps.push({
      member: "audit",
      kind: "blocked_tool_call",
      toolName: decision.tool,
      note: paramsMismatch
        ? `tool "${decision.tool}" requested with NON-CONTRACTED arguments — BLOCKED before execution (params are contained, not executed-then-caught)`
        : `tool "${decision.tool}" is allowed but not contracted as the next call — BLOCKED before execution`,
    });
  } else {
    // ---- AUDIT (deterministic workflow: the one lawful execution path) ----
    let result: ToolResult | null = null;
    try {
      result = callTool(decision.tool, decision.params);
      steps.push({
        member: "audit",
        kind: "tool_call",
        toolName: decision.tool,
        argsDigest: argsDigest(decision.params),
        note: `executed "${decision.tool}" via the registry (exit ${result.exitCode})`,
      });
    } catch (err) {
      anomalies.push(`tool "${decision.tool}" failed: ${err instanceof Error ? err.message : String(err)}`);
      steps.push({
        member: "audit",
        kind: "refused_result",
        toolName: decision.tool,
        note: `tool "${decision.tool}" failed loudly — no result to consume`,
      });
    }

    if (result !== null) {
      try {
        assertDecisionGrade(result);
        consumedReport = parseReportCanonical(result.canonical);
        engineReportHash = reportHash(result.canonical);
      } catch (err) {
        anomalies.push(
          `refused non-decision-grade result from "${decision.tool}": ${err instanceof Error ? err.message : String(err)}`,
        );
        steps.push({
          member: "audit",
          kind: "refused_result",
          toolName: decision.tool,
          note: `result of "${decision.tool}" is not decision-grade (demo-only or advisory) — refused as a verdict source`,
        });
      }
    }
  }

  // ---- EVIDENCE (deterministic workflow: references only, class derived, never model-decided) ----
  if (consumedReport !== null) {
    const cls = deriveRecommendationClass(consumedReport);
    const rec = makeRecommendation(
      consumedReport,
      consumedReport.findingIds,
      cls,
      cls === "no-action"
        ? "engine report is clean — no findings to act on"
        : `engine report carries ${consumedReport.findings.length} finding(s) — every reference below is the engine's own`,
    );
    recommendations = Object.freeze([rec]);
    terminalClass = cls;
    steps.push({
      member: "evidence",
      kind: "recommendation",
      refs: rec.findingIds,
      note: `evidence assembled 1 recommendation (${cls}) referencing ${rec.findingIds.length} engine finding(s)`,
    });
  }

  // ---- REVIEWER (model-directed + the HUMAN GATE; containment overrides approval) ----
  const review = model.reviewerTurn({
    caseId: crewCase.caseId,
    terminalClassSoFar: terminalClass,
    findingCount: consumedReport?.findings.length ?? 0,
    anomalies,
    quarantinedArtifactExcerpt: quarantineExcerpt(rawArtifact),
  });
  steps.push({
    member: "reviewer",
    kind: "model_turn",
    note: review.kind === "approve" ? "reviewer approved the recommendations" : `reviewer escalated: ${review.reason}`,
  });

  if (anomalies.length > 0) {
    if (review.kind === "approve") {
      steps.push({
        member: "reviewer",
        kind: "forced_escalation",
        note: `containment override: ${anomalies.length} anomaly(ies) on record — a model "approve" cannot clear them; escalating to the human`,
      });
    } else {
      steps.push({ member: "reviewer", kind: "escalation", note: "escalated to the human (anomalies on record)" });
    }
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, engineReportHash, consumedReport?.findingIds ?? null);
  }

  if (review.kind === "escalate") {
    steps.push({ member: "reviewer", kind: "escalation", note: "escalated to the human by reviewer decision" });
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, engineReportHash, consumedReport?.findingIds ?? null);
  }

  return freezeRecord(crewCase.caseId, steps, "recommendation", terminalClass, recommendations, anomalies, engineReportHash, consumedReport?.findingIds ?? null);
}

function freezeRecord(
  caseId: string,
  steps: readonly TrajectoryStep[],
  terminal: TrajectoryRecord["terminal"],
  terminalClass: TerminalClass,
  recommendations: readonly Recommendation[],
  anomalies: readonly string[],
  engineReportHash: string | null,
  consumedFindingIds: readonly string[] | null,
): TrajectoryRecord {
  return Object.freeze({
    caseId,
    steps: Object.freeze(steps.map((s) => Object.freeze({ ...s }))),
    terminal,
    terminalClass,
    recommendations: Object.freeze([...recommendations]),
    anomalies: Object.freeze([...anomalies]),
    engineReportHash,
    consumedFindingIds: consumedFindingIds === null ? null : Object.freeze([...consumedFindingIds]),
  });
}
