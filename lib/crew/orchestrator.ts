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
import { assertDecisionGrade, callTool, resolveInAllowedRoot, type ToolResult } from "../tools/registry.ts";
import { argsDigest, sha256Hex } from "./canonical.ts";
import { detectInjectionSignatures } from "./injection-scan.ts";
import { buildCaseManifest, manifestDigestOf, REPLAY_MODEL_ID } from "./manifest.ts";
import { newQuarantineNonce, quarantineExcerpt, reviewerLabelStateFor, type CrewModel, type IntakeDecision } from "./model.ts";
import { route, ROUTE_TABLE_LABEL, type RouteInput, type RouteResult } from "./route.ts";
import {
  deriveRecommendationClass,
  makeRecommendation,
  parseReportCanonical,
  type CrewCase,
  type CrewCaseS2,
  type CrewExplanation,
  type CrewImpact,
  type CrewMemberName,
  type ParsedReport,
  type Recommendation,
  type TerminalClass,
  type TrajectoryRecord,
  type TrajectoryStep,
} from "./types.ts";

/** sha256 of the canonical JSON (recursively key-sorted) of a params object — the §6 argument digest (implementation in canonical.ts, byte-identical). */
export { argsDigest };

/** sha256 of a canonical payload string — the §6 engine-report hash. */
export function reportHash(canonical: string): string {
  return sha256Hex(canonical);
}


/** Run one committed case through the crew. Deterministic given (case, model). */
export function runCase(crewCase: CrewCase, model: CrewModel): TrajectoryRecord {
  const steps: TrajectoryStep[] = [];
  const anomalies: string[] = [];
  let recommendations: readonly Recommendation[] = [];
  let terminalClass: TerminalClass = "none-escalated";
  let engineReportHash: string | null = null;

  // ---- INTAKE (model-directed routing; decision contained below, never trusted) ----
  // Security review F8: the case's artifact path passes the registry's own
  // containment (allowed folders, no hidden segments, size cap) before it is read.
  const artifactBytes = readFileSync(resolveInAllowedRoot(crewCase.inputArtifact.path, "inputArtifact.path"));
  const rawArtifact = artifactBytes.toString("utf8");

  // ---- REPLAY BINDING (S2-crew CP1; Codex § 4): recompute the manifest from
  // the case actually being run and the bytes actually read. A stale stamp on
  // the case is refused here; a recorded turn bound to another manifest is
  // refused by the model seam (RecordedModel) when it sees this digest. ----
  // The stamp on a case is its digest as a REPLAY case; the digest handed to
  // the model seam carries the model's own id (an ad-hoc scripted test double
  // with no id is a replay source too).
  const stampDigest = manifestDigestOf(buildCaseManifest(crewCase, artifactBytes, REPLAY_MODEL_ID));
  const modelId = model.modelId ?? REPLAY_MODEL_ID;
  const manifestDigest =
    modelId === REPLAY_MODEL_ID ? stampDigest : manifestDigestOf(buildCaseManifest(crewCase, artifactBytes, modelId));
  if (crewCase.manifestDigest !== undefined && crewCase.manifestDigest !== stampDigest) {
    throw new Error(
      `crew: case manifestDigest is stale (caseId=${crewCase.caseId}) — the case or its artifact changed since it was stamped; re-run scripts-ts/stamp-case-digests.mts and re-record its turns`,
    );
  }

  // ---- STRUCTURAL INJECTION TRIPWIRE (M2): scan the FULL artifact BEFORE any
  // model turn, so a payload placed past the 400-char model excerpt window
  // (`quarantineExcerpt`) still surfaces. Each hit is an anomaly, which the
  // forced-escalation path below (anomalies → escalate-to-human, even over a
  // model "approve") turns into an untruncatable structural control. This is a
  // tripwire, not a parser or a guarantee (lib/crew/injection-scan.ts). ----
  for (const sig of detectInjectionSignatures(rawArtifact)) {
    anomalies.push(`injection_signature:${sig}`);
  }

  // One crypto-random quarantine nonce per run (security amendment 4): both
  // model turns see the excerpt inside markers the artifact cannot forge. The
  // nonce enters no trajectory, record or golden.
  const quarantineNonce = newQuarantineNonce();
  const decision: IntakeDecision = model.intakeTurn({
    caseId: crewCase.caseId,
    ask: crewCase.ask,
    quarantinedArtifactExcerpt: quarantineExcerpt(rawArtifact, quarantineNonce),
    quarantineNonce,
    allowedTools: crewCase.allowedTools,
    manifestDigest,
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

  // ---- S2 SEATS (S2-crew CP4): only on a case carrying `s2`. Root-cause runs
  // the deterministic explain_drift baseline (the LLM seat renders DEFER),
  // Impact runs size_impact when the case names an orders file, then the
  // deterministic route table proposes where the run goes. Every call is
  // contracted in expectedToolCalls exactly like the routed call above. ----
  const s2 =
    crewCase.s2 === undefined
      ? undefined
      : runS2Seats(crewCase, crewCase.s2, consumedReport, steps, anomalies, consumedReport === null ? 0 : 1);

  // ---- REVIEWER (model-directed + the HUMAN GATE; containment overrides approval) ----
  const reviewerInput = {
    caseId: crewCase.caseId,
    terminalClassSoFar: terminalClass,
    findingCount: consumedReport?.findings.length ?? 0,
    anomalies,
    quarantinedArtifactExcerpt: quarantineExcerpt(rawArtifact, quarantineNonce),
    quarantineNonce,
    manifestDigest,
    ...(s2 !== undefined ? { computedRoute: s2.proposedRoute } : {}),
  };
  const review = model.reviewerTurn(reviewerInput);
  steps.push({
    member: "reviewer",
    kind: "model_turn",
    note: review.kind === "approve" ? "reviewer approved the recommendations" : `reviewer escalated: ${review.reason}`,
  });

  // The final route re-applies the table with the Reviewer's actual decision.
  let extras: S2RecordExtras | undefined;
  if (s2 !== undefined) {
    const finalRoute = route({ ...s2.routeInput, reviewerDecision: review.kind, anomalies: anomalies.length });
    if (finalRoute.route !== s2.proposedRoute.route) {
      steps.push({
        member: "evidence",
        kind: "route",
        note: `route table (${ROUTE_TABLE_LABEL}) re-applied after the reviewer's decision: ${finalRoute.route} — ${finalRoute.reason}`,
      });
    }
    extras = {
      route: finalRoute,
      ...(s2.explanation !== undefined ? { explanation: s2.explanation } : {}),
      impact: s2.impact,
      rootCauseSeat: "DEFER",
      reviewerLabelState: reviewerLabelStateFor(reviewerInput),
    };
  }

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
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, engineReportHash, consumedReport?.findingIds ?? null, extras);
  }

  if (review.kind === "escalate") {
    steps.push({ member: "reviewer", kind: "escalation", note: "escalated to the human by reviewer decision" });
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, engineReportHash, consumedReport?.findingIds ?? null, extras);
  }

  // S2: a route of human-escalation (no owner established) lands the run at the
  // human gate even over an approve — responsibility is never guessed.
  if (extras?.route?.route === "human-escalation") {
    steps.push({
      member: "evidence",
      kind: "escalation",
      note: `route table sent the run to a person: ${extras.route.reason}`,
    });
    return freezeRecord(crewCase.caseId, steps, "escalate-to-human", "none-escalated", [], anomalies, engineReportHash, consumedReport?.findingIds ?? null, extras);
  }

  return freezeRecord(crewCase.caseId, steps, "recommendation", terminalClass, recommendations, anomalies, engineReportHash, consumedReport?.findingIds ?? null, extras);
}

/** The S2 fields a record carries — present only on S2 runs. */
interface S2RecordExtras {
  readonly route?: RouteResult;
  readonly explanation?: CrewExplanation;
  readonly impact?: CrewImpact;
  readonly rootCauseSeat?: "DEFER";
  readonly reviewerLabelState?: string;
}

interface S2SeatsOutcome {
  readonly routeInput: RouteInput;
  readonly proposedRoute: RouteResult;
  readonly explanation?: CrewExplanation;
  readonly impact: CrewImpact;
}

/** Parse a JSON-lines event log; LOUD on any malformed line (evidence is never guessed at). */
function readEventLog(path: string): unknown[] {
  return readFileSync(resolveInAllowedRoot(path, "s2 evidence path"), "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      try {
        return JSON.parse(line) as unknown;
      } catch {
        throw new Error(`crew: ${path} line ${i + 1} is not JSON — an event log is read whole or not at all`);
      }
    });
}

/** Parse explain_drift's canonical payload at the JSON level; LOUD on any shape surprise. */
function parseExplanation(canonical: string): CrewExplanation {
  const raw = JSON.parse(canonical) as Record<string, unknown>;
  const cited = raw.citedEvents;
  if (
    typeof raw.class !== "string" ||
    !Array.isArray(cited) ||
    !cited.every((n) => Number.isInteger(n)) ||
    typeof raw.reason !== "string" ||
    typeof raw.label !== "string"
  ) {
    throw new Error("crew: explain_drift payload has an unrecognized shape — refusing to consume it");
  }
  return Object.freeze({
    class: raw.class,
    citedEvents: Object.freeze([...(cited as number[])]),
    reason: raw.reason,
    label: raw.label,
  });
}

/** Parse size_impact's canonical payload at the JSON level; LOUD unless every figure is an integer and the label is "simulated". */
function parseImpact(canonical: string): CrewImpact {
  const raw = JSON.parse(canonical) as Record<string, unknown>;
  const figures = [
    "ordersAtRiskDistinct",
    "observedMenuRefundCents",
    "prospectiveExposureCents",
    "agentCancelExposureCents",
    "errorChargeExposureCents",
  ] as const;
  if (raw.label !== "simulated" || !Array.isArray(raw.assumptions) || figures.some((k) => !Number.isInteger(raw[k]))) {
    throw new Error('crew: size_impact payload is not integer figures labeled "simulated" — refusing to consume it');
  }
  return Object.freeze({
    kind: "figures" as const,
    ordersAtRiskDistinct: raw.ordersAtRiskDistinct as number,
    observedMenuRefundCents: raw.observedMenuRefundCents as number,
    prospectiveExposureCents: raw.prospectiveExposureCents as number,
    agentCancelExposureCents: raw.agentCancelExposureCents as number,
    errorChargeExposureCents: raw.errorChargeExposureCents as number,
    assumptions: Object.freeze(
      (raw.assumptions as Array<{ name: unknown; value: unknown }>).map((a) => {
        if (typeof a?.name !== "string" || (typeof a.value !== "string" && typeof a.value !== "number")) {
          throw new Error("crew: size_impact assumption has an unrecognized shape — refusing to consume it");
        }
        return Object.freeze({ name: a.name, value: a.value });
      }),
    ),
    label: "simulated" as const,
  });
}

/**
 * One CONTRACTED deterministic call (S2 seats): the same containment the routed
 * call gets — allowed/forbidden, then the contract at `contractIndex` must name
 * this tool with this exact argument digest, BEFORE execution. Returns the
 * parsed payload, or null with an anomaly + typed step on record.
 */
function contractedCall<T>(
  crewCase: CrewCase,
  member: CrewMemberName,
  tool: string,
  params: Readonly<Record<string, unknown>>,
  contractIndex: number,
  parse: (canonical: string) => T,
  describe: (parsed: T) => string,
  steps: TrajectoryStep[],
  anomalies: string[],
): T | null {
  const contract = crewCase.expectedToolCalls[contractIndex];
  if (crewCase.forbiddenTools.includes(tool) || !crewCase.allowedTools.includes(tool)) {
    anomalies.push(`blocked out-of-contract tool request "${tool}"`);
    steps.push({ member, kind: "blocked_tool_call", toolName: tool, note: `tool "${tool}" is outside this case's contract — BLOCKED at the call site` });
    return null;
  }
  if (contract === undefined || contract.tool !== tool) {
    anomalies.push(`blocked "${tool}": not the contracted next call`);
    steps.push({ member, kind: "blocked_tool_call", toolName: tool, note: `tool "${tool}" is allowed but not contracted as the next call — BLOCKED before execution` });
    return null;
  }
  if (argsDigest(contract.params) !== argsDigest(params)) {
    anomalies.push(`blocked "${tool}": argument digest deviates from the case's call contract`);
    steps.push({ member, kind: "blocked_tool_call", toolName: tool, note: `tool "${tool}" built with NON-CONTRACTED arguments — BLOCKED before execution` });
    return null;
  }
  try {
    const result = callTool(tool, params);
    const parsed = parse(result.canonical);
    steps.push({ member, kind: "tool_call", toolName: tool, argsDigest: argsDigest(params), note: describe(parsed) });
    return parsed;
  } catch (err) {
    anomalies.push(`tool "${tool}" failed: ${err instanceof Error ? err.message : String(err)}`);
    steps.push({ member, kind: "refused_result", toolName: tool, note: `tool "${tool}" failed loudly — no result to consume` });
    return null;
  }
}

function runS2Seats(
  crewCase: CrewCase,
  s2: CrewCaseS2,
  report: ParsedReport | null,
  steps: TrajectoryStep[],
  anomalies: string[],
  firstContractIndex: number,
): S2SeatsOutcome {
  let next = firstContractIndex;
  let explanation: CrewExplanation | undefined;
  let impact: CrewImpact;

  // ---- ROOT-CAUSE: the deterministic baseline, then the LLM seat's DEFER ----
  if (report === null) {
    steps.push({ member: "root-cause", kind: "skipped", toolName: "explain_drift", note: "no engine report was consumed — explain_drift not called (nothing to explain)" });
  } else {
    const params = {
      findings: report.findings.map((f) => ({ id: f.id, ruleId: f.ruleId, category: f.category, referenceRowId: f.referenceRowId })),
      events: readEventLog(s2.eventsPath),
      asOf: s2.asOf,
    };
    explanation =
      contractedCall(
        crewCase,
        "root-cause",
        "explain_drift",
        params,
        next,
        parseExplanation,
        (e) => `explain_drift (${e.label}): ${e.class}, citing ${e.citedEvents.length} event(s)`,
        steps,
        anomalies,
      ) ?? undefined;
    next += 1;
  }
  steps.push({
    member: "root-cause",
    kind: "deferred",
    note: "LLM root-cause seat: DEFER — not examined on any model; this run shows the deterministic baseline, never a model's guess",
  });

  // ---- IMPACT: size_impact only when the case supplies an orders file ----
  if (s2.impact === undefined) {
    impact = Object.freeze({ kind: "skipped" as const, reason: "no orders data in this case" });
    steps.push({ member: "impact", kind: "skipped", toolName: "size_impact", note: "no orders data in this case — size_impact not called" });
  } else if (report === null) {
    impact = Object.freeze({ kind: "skipped" as const, reason: "no engine report was consumed" });
    steps.push({ member: "impact", kind: "skipped", toolName: "size_impact", note: "no engine report was consumed — size_impact not called" });
  } else {
    // The mapping the S2-impact packet fixes: id = the claim id, category = the
    // finding's category or "" (the arithmetic never reads it), referenceRowId
    // as reported or null (a modifier finding touches a line by its
    // `#modifier.<optionId>` claim-id suffix inside lib/impact).
    const params = {
      findings: report.findings.map((f) => ({ id: f.id, ruleId: f.ruleId, category: f.category ?? "", referenceRowId: f.referenceRowId })),
      orders: readEventLog(s2.impact.ordersPath),
      windowDays: s2.impact.windowDays,
      errorChargeShare: s2.impact.errorChargeShare,
    };
    const figures = contractedCall(
      crewCase,
      "impact",
      "size_impact",
      params,
      next,
      parseImpact,
      (i) => (i.kind === "figures" ? `size_impact (simulated): ${i.ordersAtRiskDistinct} distinct order(s) at risk` : "size_impact"),
      steps,
      anomalies,
    );
    impact = figures ?? Object.freeze({ kind: "skipped" as const, reason: "size_impact did not return figures (see the step above)" });
    next += 1;
  }

  // ---- ROUTE (deterministic workflow): the route if the Reviewer approves ----
  const findings = report?.findings ?? [];
  const routeInput: RouteInput = {
    pack: s2.route.pack,
    triggerKind: s2.route.triggerKind,
    ownership: s2.route.ownership,
    findingCategories: [...new Set(findings.map((f) => f.category ?? "uncategorized"))].sort(),
    maxSeverity: findings.some((f) => f.severity === "error") ? "error" : findings.some((f) => f.severity === "warn") ? "warn" : "none",
    reviewerDecision: "approve",
    anomalies: anomalies.length,
  };
  const proposedRoute = route(routeInput);
  steps.push({
    member: "evidence",
    kind: "route",
    note: `route table (${ROUTE_TABLE_LABEL}) proposes ${proposedRoute.route}${proposedRoute.artifacts.length > 0 ? ` → ${proposedRoute.artifacts.join(", ")}` : ""} — ${proposedRoute.reason}`,
  });
  return { routeInput, proposedRoute, ...(explanation !== undefined ? { explanation } : {}), impact };
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
  extras?: S2RecordExtras,
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
    // S2 fields appear ONLY on S2 runs (a legacy record gains no key at all).
    ...(extras ?? {}),
  });
}
