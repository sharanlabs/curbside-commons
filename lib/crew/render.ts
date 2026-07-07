/**
 * A2 TRAJECTORY RENDERING — the human-readable register of a crew run
 * (plan AC-7; documentation-standard two-register rule: the typed
 * `TrajectoryRecord` is the machine register, this text is the plain one).
 *
 * Plain: turns the team's step-by-step logbook into a page a person can read
 * top to bottom — who did what, what got blocked, and whether the run ended as
 * a suggestion for the human or a hand-off to the human.
 */
import type { TrajectoryRecord } from "./types.ts";

const KIND_TAG: Readonly<Record<string, string>> = {
  model_turn: "MODEL TURN",
  tool_call: "TOOL CALL",
  blocked_tool_call: "BLOCKED",
  refused_result: "REFUSED",
  recommendation: "RECOMMENDATION",
  forced_escalation: "FORCED ESCALATION",
  escalation: "ESCALATION",
};

/** Render one trajectory as deterministic plain text (byte-frozen goldens assert this exact output). */
export function renderTrajectory(record: TrajectoryRecord): string {
  const lines: string[] = [];
  lines.push(`CREW RUN — case ${record.caseId} (SIMULATED data; orchestration harness — offline replay)`);
  lines.push(`terminal: ${record.terminal} · class: ${record.terminalClass}`);
  lines.push(
    record.engineReportHash === null
      ? "engine report consumed: none"
      : `engine report consumed: sha256 ${record.engineReportHash}`,
  );
  lines.push("");
  record.steps.forEach((s, i) => {
    const tag = KIND_TAG[s.kind] ?? s.kind;
    const tool = s.toolName !== undefined ? ` [${s.toolName}]` : "";
    lines.push(`${String(i + 1).padStart(2, " ")}. ${s.member.toUpperCase()} · ${tag}${tool} — ${s.note}`);
    if (s.refs !== undefined && s.refs.length > 0) {
      lines.push(`      refs: ${s.refs.join(" · ")}`);
    }
  });
  lines.push("");
  if (record.anomalies.length > 0) {
    lines.push(`anomalies (${record.anomalies.length}):`);
    for (const a of record.anomalies) lines.push(`  ⚠ ${a}`);
  } else {
    lines.push("anomalies: none");
  }
  lines.push(
    record.terminal === "recommendation"
      ? `outcome: ${record.recommendations.length} recommendation(s) for the human — the engine's verdicts are untouched; these are references, not decisions.`
      : "outcome: handed to the human — nothing was approved on the crew's own authority.",
  );
  return `${lines.join("\n")}\n`;
}
