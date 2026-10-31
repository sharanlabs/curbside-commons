/**
 * A2 TRAJECTORY RENDERING — the human-readable register of a crew run
 * (plan AC-7; documentation-standard two-register rule: the typed
 * `TrajectoryRecord` is the machine register, this text is the plain one).
 *
 * Plain: turns the team's step-by-step logbook into a page a person can read
 * top to bottom — who did what, what got blocked, and whether the run ended as
 * a suggestion for the human or a hand-off to the human.
 */
import { ROOT_CAUSE_SEAT_STATE } from "./classification.ts";
import { ROUTE_TABLE_LABEL } from "./route.ts";
import type { CrewImpact, TrajectoryRecord } from "./types.ts";

const KIND_TAG: Readonly<Record<string, string>> = {
  model_turn: "MODEL TURN",
  tool_call: "TOOL CALL",
  blocked_tool_call: "BLOCKED",
  refused_result: "REFUSED",
  recommendation: "RECOMMENDATION",
  forced_escalation: "FORCED ESCALATION",
  escalation: "ESCALATION",
  route: "ROUTE",
  deferred: "DEFER",
  skipped: "SKIPPED",
};

/** The exact chip on every impact figure line. */
export const IMPACT_CHIP = "simulated";

/**
 * What the code does and does not enforce about the Reviewer's policy
 * (security review 2026-10-31 F3a, orchestrator decision): the
 * "flag-attention → escalate" rule lives in the Reviewer's prompt only.
 */
export const REVIEWER_ENFORCEMENT_NOTE =
  "flag-attention → escalate is model-enforced; code forces escalation on anomalies only; code enforcement deferred to S5 with a re-exam";

/** Cents → "$d.cc" (every figure is derived from the record, never typed). */
function dollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

function impactLine(impact: CrewImpact): string {
  if (impact.kind === "skipped") return `impact: ${impact.reason} — no figures`;
  const assumptions = impact.assumptions.map((a) => `${a.name} = ${String(a.value)}`).join("; ");
  return (
    `impact [${IMPACT_CHIP}]: ${impact.ordersAtRiskDistinct} distinct order(s) at risk · ` +
    `observed menu refunds ${dollars(impact.observedMenuRefundCents)} · ` +
    `prospective exposure ${dollars(impact.prospectiveExposureCents)} · ` +
    `agent-cancel exposure ${dollars(impact.agentCancelExposureCents)} · ` +
    `error-charge exposure ${dollars(impact.errorChargeExposureCents)}` +
    (assumptions.length > 0 ? ` (assumptions: ${assumptions})` : "")
  );
}

/** The S2 block — rendered ONLY for a run of a case carrying `s2`; a legacy render is byte-unchanged. */
function s2Lines(record: TrajectoryRecord): string[] {
  if (record.route === undefined) return [];
  const lines: string[] = [];
  lines.push(
    `route (${ROUTE_TABLE_LABEL}): ${record.route.route}${record.route.artifacts.length > 0 ? ` → ${record.route.artifacts.join(" · ")}` : ""} — ${record.route.reason}`,
  );
  lines.push(
    record.explanation === undefined
      ? "root cause (deterministic baseline): not computed — see the steps above"
      : `root cause (${record.explanation.label}): ${record.explanation.class} — cited events: ${
          record.explanation.citedEvents.length > 0 ? record.explanation.citedEvents.map((i) => `#${i}`).join(" · ") : "none"
        } — ${record.explanation.reason}`,
  );
  lines.push(`root-cause seat (LLM): ${record.rootCauseSeat ?? ROOT_CAUSE_SEAT_STATE} — not examined on any model; never called in this run`);
  if (record.impact !== undefined) lines.push(impactLine(record.impact));
  if (record.reviewerLabelState !== undefined) {
    lines.push(`reviewer seat: ${record.reviewerLabelState} (approve | escalate only; ${REVIEWER_ENFORCEMENT_NOTE})`);
  }
  lines.push("");
  return lines;
}

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
  lines.push(...s2Lines(record));
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
