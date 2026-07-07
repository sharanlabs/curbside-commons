/**
 * A2 CREW TYPES — the typed vocabulary of the crew orchestration harness
 * (plan `docs/plan-agentic-extension.md` §3, §5 row A2, §6; floors doc
 * `docs/plan-a2-trajectory-floors.md`).
 *
 * The crew consumes the A0 registry ONLY — every engine fact it touches
 * arrives as a SERIALIZED registry response (`ToolResult.canonical`, a JSON
 * string) and is parsed here at the JSON level. No type, constructor, or
 * function from `lib/verifier-core/**` or `lib/packs/**` is imported anywhere
 * under `lib/crew/**` (the import-walk eval proves it; plan AC-6 as amended
 * by Codex — TypeScript's structural typing makes "no reachable constructor"
 * unsound, so the enforced boundary is imports + behavior, not nominal types).
 *
 * A {@link Recommendation} is the ONLY thing a crew run can produce about an
 * audit: references to finding ids that already exist in the engine's own
 * report, plus a class from a committed enum. `makeRecommendation` throws on
 * any id not present in the report — a fabricated reference is a loud failure,
 * never a silent invention (§6 safety invariant).
 *
 * Plain: the helper team can only point at problems the checker itself already
 * wrote down — it has no pen of its own. If it ever "cites" a problem that
 * isn't in the checker's report, the run blows up loudly instead of passing a
 * made-up claim along.
 */

/** The four crew members (plan §3; classification per member in classification.ts). */
export type CrewMemberName = "intake" | "audit" | "evidence" | "reviewer";

/** The committed recommendation-class enum (§6 case schema field `expectedRecommendationClass`). */
export const RECOMMENDATION_CLASSES = ["no-action", "flag-attention", "flag-violations"] as const;
export type RecommendationClass = (typeof RECOMMENDATION_CLASSES)[number];

/** Terminal class of a whole run: a recommendation class, or none because the run escalated. */
export type TerminalClass = RecommendationClass | "none-escalated";

/** One finding as the crew sees it — parsed from a registry response's canonical JSON, never from engine types. */
export interface ParsedFinding {
  readonly id: string;
  readonly ruleId: string;
  readonly severity: string;
  readonly plainLine: string;
}

/** A decision-grade engine report, parsed at the JSON level from `ToolResult.canonical`. */
export interface ParsedReport {
  readonly ok: boolean;
  readonly findings: readonly ParsedFinding[];
  readonly findingIds: readonly string[];
}

/**
 * Parse a registry response's canonical JSON into the crew's own report view.
 * LOUD on any shape surprise — the crew never guesses at engine output.
 */
export function parseReportCanonical(canonical: string): ParsedReport {
  const raw = JSON.parse(canonical) as { ok?: unknown; findings?: unknown };
  if (typeof raw.ok !== "boolean" || !Array.isArray(raw.findings)) {
    throw new Error(
      `crew: canonical payload is not a decision-grade report (need boolean "ok" + array "findings"; got keys ${Object.keys(raw).join(",")})`,
    );
  }
  const findings: ParsedFinding[] = raw.findings.map((f: unknown, i: number) => {
    const ff = f as { claim?: { id?: unknown }; ruleId?: unknown; severity?: unknown; plainLine?: unknown };
    if (typeof ff.claim?.id !== "string" || typeof ff.ruleId !== "string") {
      throw new Error(`crew: finding[${i}] lacks claim.id/ruleId — refusing to consume an unrecognized report shape`);
    }
    return Object.freeze({
      id: ff.claim.id,
      ruleId: ff.ruleId,
      severity: typeof ff.severity === "string" ? ff.severity : "unknown",
      plainLine: typeof ff.plainLine === "string" ? ff.plainLine : "",
    });
  });
  return Object.freeze({
    ok: raw.ok,
    findings: Object.freeze(findings),
    findingIds: Object.freeze(findings.map((f) => f.id)),
  });
}

/**
 * Derive the recommendation class from the engine's report — deterministic,
 * never model-decided: violations (`ok:false`) → flag-violations; non-gating
 * findings present (`ok:true`, findings > 0: conditional/cured/asserted states)
 * → flag-attention; clean → no-action.
 */
export function deriveRecommendationClass(report: ParsedReport): RecommendationClass {
  if (!report.ok) return "flag-violations";
  return report.findings.length > 0 ? "flag-attention" : "no-action";
}

/** A crew recommendation — finding REFERENCES + a committed class. Never a verdict, never a mutation. */
export interface Recommendation {
  readonly findingIds: readonly string[];
  readonly recommendationClass: RecommendationClass;
  readonly rationale: string;
}

/**
 * The ONLY sanctioned {@link Recommendation} constructor: every referenced id
 * must exist in the engine report it points at (§6 safety invariant — a
 * fabricated finding reference throws, it never travels).
 */
export function makeRecommendation(
  report: ParsedReport,
  findingIds: readonly string[],
  recommendationClass: RecommendationClass,
  rationale: string,
): Recommendation {
  const known = new Set(report.findingIds);
  for (const id of findingIds) {
    if (!known.has(id)) {
      throw new Error(
        `crew: fabricated finding reference "${id}" — not present in the engine report (${report.findingIds.length} real finding(s))`,
      );
    }
  }
  return Object.freeze({
    findingIds: Object.freeze([...findingIds]),
    recommendationClass,
    rationale,
  });
}

/** The step kinds a trajectory can record (§6: silent drop is impossible — every branch emits a step). */
export type TrajectoryStepKind =
  | "model_turn"
  | "tool_call"
  | "blocked_tool_call"
  | "refused_result"
  | "recommendation"
  | "forced_escalation"
  | "escalation";

/** One ordered step of a crew run (AC-7: the legible trace unit). */
export interface TrajectoryStep {
  readonly member: CrewMemberName;
  readonly kind: TrajectoryStepKind;
  readonly toolName?: string;
  readonly argsDigest?: string;
  readonly note: string;
  readonly refs?: readonly string[];
}

/** The two lawful terminals (§6: terminal ∈ {recommendation, escalate-to-human} — nothing else, never undefined). */
export type TrajectoryTerminal = "recommendation" | "escalate-to-human";

/** The typed record of one whole crew run (AC-7). */
export interface TrajectoryRecord {
  readonly caseId: string;
  readonly steps: readonly TrajectoryStep[];
  readonly terminal: TrajectoryTerminal;
  readonly terminalClass: TerminalClass;
  readonly recommendations: readonly Recommendation[];
  readonly anomalies: readonly string[];
  /** sha256 of the consumed decision-grade canonical payload; null when no report was consumed. */
  readonly engineReportHash: string | null;
  /**
   * The consumed engine report's OWN finding ids (null when no report was
   * consumed) — carried on the record so the floor harness can independently
   * assert every recommendation reference exists in the engine's report
   * (Codex A2 review P1: expected ⊆ actual alone would let a fabricated EXTRA
   * reference ride through the floor).
   */
  readonly consumedFindingIds: readonly string[] | null;
}

/** One committed trajectory case (§6 schema — see docs/plan-a2-trajectory-floors.md). */
export interface CrewCase {
  readonly caseId: string;
  readonly member: CrewMemberName;
  readonly inputArtifact: { readonly path: string };
  readonly ask: string;
  readonly allowedTools: readonly string[];
  readonly forbiddenTools: readonly string[];
  readonly expectedToolCalls: ReadonlyArray<{
    readonly tool: string;
    readonly params: Readonly<Record<string, unknown>>;
  }>;
  readonly expectedEngineReportHash: string | null;
  readonly expectedRecommendationClass: TerminalClass;
  readonly expectedFindingRefs: readonly string[];
  /** §6 gate expectation: approve-recommendation ⇔ terminal "recommendation"; escalate-to-human ⇔ terminal "escalate-to-human". */
  readonly expectedGateState: "approve-recommendation" | "escalate-to-human";
}
