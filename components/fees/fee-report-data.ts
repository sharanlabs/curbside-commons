/**
 * Fee-surface grounding module (NYC showcase N1, plan docs/plan-nyc-showcase-2026-07-16.md).
 *
 * Every figure the /fees surface renders is derived HERE from the committed
 * fee corpus — the four statement fixtures and their golden audit reports —
 * plus the codified rule modules themselves. Nothing is hand-typed into the
 * page (which would drift):
 *   • verdicts, tallies, findings, and arithmetic come from the committed
 *     golden reports (fixtures/synthetic-restaurant/fees/expected-report.*.json),
 *     which the freeze suite proves byte-equal to auditStatement(builder);
 *   • the statement-line receipts are resolved from the committed statement
 *     fixtures by the same claim-id convention the engine writes;
 *   • the 11-executable / 6-external-evidence boundary is read from
 *     FEE_RULES + NON_STATEMENT_CHECKABLE — the drift-locked rule registry;
 *   • the rendered-figure ↔ answer-key binding is proven by
 *     evals/packs/fees-surface.test.ts.
 *
 * Display register: the committed engine strings carry internal markers
 * ("U1", "PROVISIONAL", "F1b") that are correct in the repo but are not the
 * site's plain product voice. cleanFeeCopy() rewords ONLY those markers —
 * the meaning (a provisional, assumption-dependent conclusion) always stays
 * on the surface; serialization and goldens are untouched.
 */
import driftedReportJson from "@/fixtures/synthetic-restaurant/fees/expected-report.drifted.json";
import faithfulReportJson from "@/fixtures/synthetic-restaurant/fees/expected-report.faithful.json";
import curedReportJson from "@/fixtures/synthetic-restaurant/fees/expected-report.cured.json";
import conditionalReportJson from "@/fixtures/synthetic-restaurant/fees/expected-report.conditional.json";
import driftedStatementJson from "@/fixtures/synthetic-restaurant/fees/statement.drifted.json";
import faithfulStatementJson from "@/fixtures/synthetic-restaurant/fees/statement.faithful.json";
import curedStatementJson from "@/fixtures/synthetic-restaurant/fees/statement.cured.json";
import conditionalStatementJson from "@/fixtures/synthetic-restaurant/fees/statement.conditional.json";
import type { FeeAuditReport, FeeVerdict } from "@/lib/packs/fees";
import type { FeeRule } from "@/lib/packs/fees/rules";
import { FEE_RULES, FEE_RULE_BY_ID, NON_STATEMENT_CHECKABLE } from "@/lib/packs/fees";

/* ------------------------------------------------------------------ */
/* Rule-table freshness — bound to the research record by the pack test */
/* ------------------------------------------------------------------ */

/**
 * The primary-source pin the surface shows. verifiedAsOf is BOUND to the
 * committed rule-table research record (docs/research/uc1-rule-table.md) by
 * evals/packs/fees-surface.test.ts — the page cannot show a date the record
 * does not carry.
 */
export const RULE_TABLE_FRESHNESS = {
  statute: "NYC Administrative Code §20-563.3",
  primarySource: "Local Law 79 of 2025 — the certified enacted text",
  verifiedAsOf: "2026-07-15",
  provenance: { file: "docs/research/uc1-rule-table.md", date: "2026-07-15" },
} as const;

/* --------------------------------------------- */
/* Display maps — register only, meaning preserved */
/* --------------------------------------------- */

/** Rendered verdict tags — one per engine verdict state (a state, not prose). */
export const VERDICT_TAG_DISPLAY: Readonly<Record<FeeVerdict, string>> = {
  violation: "VIOLATION",
  "conditional-pending-refund-window": "CONDITIONAL — refund window open",
  "cured-by-refund": "CURED BY REFUND — not a violation",
  "asserted-passthrough-unverified": "FLAGGED — asserted pass-through, unverified",
};

/** Short tally words, keyed by verdict state (drives the rendered tally line). */
export const VERDICT_TALLY_WORD: Readonly<Record<FeeVerdict, string>> = {
  violation: "violation",
  "conditional-pending-refund-window": "conditional",
  "cured-by-refund": "cured",
  "asserted-passthrough-unverified": "flagged",
};

const VERDICT_ORDER: readonly FeeVerdict[] = [
  "violation",
  "conditional-pending-refund-window",
  "cured-by-refund",
  "asserted-passthrough-unverified",
];

/**
 * Reword the engine's internal markers into the site's plain product voice.
 * The provisional meaning is never dropped — it is restated in plain words.
 */
export function cleanFeeCopy(s: string): string {
  return s
    .replace(/\s*\(ASSUMED — U1 unresolved\)/g, " (assumed)")
    .replace(/ — PROVISIONAL \(U1\)/g, " — provisional on that assumed base")
    .replace(/, U1\.\)/g, ".)")
    .replace(/\(Depends on the still-open definition/g, "(Provisional: depends on the still-open definition")
    .replace(/\bU1\b/g, "the open fee-basis question");
}

/** The scope label, in product voice (the engine string carries internal markers). */
export const CLASSIFICATION_DISPLAY =
  "Fee categories are audited exactly as the platform declared them — a deterministic audit. Automated line-item re-classification is a separate advisory lane and never decides a verdict.";

/* ----------------------------------------------------- */
/* The 11 / 6 boundary — read from the drift-locked registry */
/* ----------------------------------------------------- */

const RULE_KIND_DISPLAY: Readonly<Record<string, string>> = {
  per_order_cap: "per-order cap",
  monthly_average_cap: "monthly-average cap",
  passthrough_exception: "pass-through exception",
  category_whitelist: "category lock",
  eligibility_gate: "eligibility gate",
  over_cap_refund_safe_harbor: "refund safe harbor",
};

export type ExecutableRuleRow = {
  id: string;
  clause: string;
  kind: string;
  cap: string; // "15%" or "—"
};

/** The statement-checkable rules, straight from the registry (drift-locked). */
export const EXECUTABLE_RULES: readonly ExecutableRuleRow[] = FEE_RULES.map((r) => ({
  id: r.id,
  clause: r.sourceClause,
  kind: RULE_KIND_DISPLAY[r.kind] ?? r.kind,
  cap: r.capPct !== undefined ? `${r.capPct}%` : "—",
}));

export type ExternalEvidenceRow = {
  id: string;
  title: string;
  plain: string;
};

/**
 * Product-voice display copy for the six rules a statement alone cannot check.
 * SET-LOCKED to NON_STATEMENT_CHECKABLE by evals/packs/fees-surface.test.ts:
 * a rule added to (or removed from) the registry without a display row here
 * fails the build — the boundary can never silently under-render.
 */
export const EXTERNAL_EVIDENCE_DISPLAY: Readonly<Record<string, Omit<ExternalEvidenceRow, "id">>> = {
  "NYC-563.3-a-3": {
    title: "Service radius",
    plain:
      "A platform charging the delivery fee must serve customers within at least a one-mile radius of the restaurant, absent exigent circumstances such as severe weather. That is a fact about the service, not a number on the bill.",
  },
  "NYC-563.3-f-1": {
    title: "Search visibility",
    plain:
      "A restaurant paying the basic service fee must be findable in search. Whether that holds lives on the serving surface, not in a fee statement.",
  },
  "NYC-563.3-l-1": {
    title: "Commissioner's report",
    plain:
      "The statute also obliges the city's commissioner to report on these caps. A duty of the agency — context for readers, never a statement fact.",
  },
  "NYC-563.3-g-1-iv": {
    title: "30-day fee-change notice",
    plain:
      "A fee change may take effect no earlier than 30 days after notice to the restaurant. Checking that needs the notice records themselves — a monthly statement does not carry them.",
  },
  "NYC-563.3-g-3": {
    title: "Clear disclosure",
    plain:
      "Fees must be disclosed clearly and conspicuously. A presentation duty a fee statement cannot evidence; a charge hiding under a non-permitted label is caught separately by the category lock.",
  },
  "NYC-563.3-h-1": {
    title: "Itemization duty",
    plain:
      "Every transaction must appear on an itemized monthly statement. This rule defines the audit's own input — the audit presupposes it rather than checks it.",
  },
};

/** The six external-evidence lanes, honestly unresolved (never forced to pass/fail). */
export const EXTERNAL_EVIDENCE_RULES: readonly ExternalEvidenceRow[] = [
  ...NON_STATEMENT_CHECKABLE.keys(),
].map((id) => {
  const display = EXTERNAL_EVIDENCE_DISPLAY[id];
  if (!display) throw new Error(`fees surface: external-evidence rule ${id} has no display row`);
  return { id, ...display };
});

/** The measured boundary counts — computed from the registry, never typed. */
export const FEE_BOUNDARY = {
  executable: FEE_RULES.length,
  external: NON_STATEMENT_CHECKABLE.size,
  total: FEE_RULES.length + NON_STATEMENT_CHECKABLE.size,
} as const;

/* --------------------------------------------- */
/* View models — one per committed statement/golden */
/* --------------------------------------------- */

type StatementLineJson = {
  orderId: string;
  declaredCategory: string;
  label: string;
  amountCents: number;
  orderPurchasePriceCents: number;
  isRefund: boolean;
  refundedAtDate?: string;
};

type StatementJson = {
  meta: { month: string; asOf: string };
  lines: StatementLineJson[];
};

export type FeeFindingRow = {
  key: string;
  plain: string;
  professional: string;
  severity: string;
  verdict: FeeVerdict;
  verdictTag: string;
  feeClass: string;
  ruleId: string;
  clause: string;
  claimId: string;
  statementLine: string;
  arithmetic: string;
  provisional: boolean;
};

export type FeeReportViewModel = {
  ok: boolean;
  findingCount: number;
  tally: Readonly<Record<FeeVerdict, number>>;
  tallyLine: string;
  monthDisplay: string;
  evaluatedAsOf: string;
  specPin: string;
  assumedBaseDisplay: string;
  rows: FeeFindingRow[];
};

const dollars = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const pct = (part: number, whole: number): string => `${((part / whole) * 100).toFixed(1)}%`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthDisplay(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

function dateDisplay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/**
 * Resolve a finding's claim id back to the statement line it names — the same
 * `#L<index>` convention the engine's line tagger writes. Monthly-aggregate and
 * statement-level findings (no line tag) get an honest aggregate description.
 */
function statementLineFor(
  claimId: string,
  field: string,
  statement: StatementJson,
): string {
  const tag = claimId.match(/#L(\d+)$/);
  if (tag) {
    const line = statement.lines[Number(tag[1])];
    if (!line) throw new Error(`fees surface: claim ${claimId} names a line the statement does not have`);
    return `"${line.label}" · order ${line.orderId} · ${dollars(line.amountCents)}`;
  }
  if (field === "monthlyAverage") {
    const category = claimId.split("#")[1] ?? "";
    const n = statement.lines.filter((l) => !l.isRefund && l.declaredCategory === category).length;
    return `monthly aggregate — the ${category.replace(/_/g, " ")} charge lines (${n}) in ${monthDisplay(statement.meta.month)}`;
  }
  return `statement-level — ${monthDisplay(statement.meta.month)} as a whole`;
}

/** The arithmetic receipt, COMPUTED from the claim value + statement + rule caps. */
function arithmeticFor(
  finding: FeeAuditReport["findings"][number],
  statement: StatementJson,
): string {
  const rule = FEE_RULE_BY_ID.get(finding.ruleId);
  const value = finding.claim.value as unknown;
  if (
    finding.claim.field === "monthlyAverage" &&
    typeof value === "object" &&
    value !== null &&
    "sumFeesCents" in value
  ) {
    const v = value as { sumFeesCents: number; sumPurchasePriceCents: number; capPct: number };
    return `${dollars(v.sumFeesCents)} of fees on ${dollars(v.sumPurchasePriceCents)} of monthly purchases = ${pct(v.sumFeesCents, v.sumPurchasePriceCents)} — cap ${v.capPct}%`;
  }
  const tag = finding.claim.id.match(/#L(\d+)$/);
  if (tag && rule?.capPct !== undefined) {
    const line = statement.lines[Number(tag[1])];
    if (line) {
      return `${dollars(line.amountCents)} on a ${dollars(line.orderPurchasePriceCents)} order = ${pct(line.amountCents, line.orderPurchasePriceCents)} — cap ${rule.capPct}%`;
    }
  }
  if (finding.ruleId === "NYC-563.3-d-1") {
    return `declared category "${String(value)}" is not one of the four the law permits`;
  }
  if (finding.ruleId === "NYC-563.3-d-4") {
    return "an enhanced service fee is charged while no basic service fee exists on the statement";
  }
  if (tag && finding.claim.field === "passthroughDocumented") {
    const line = statement.lines[Number(tag[1])];
    if (line) {
      return `${dollars(line.amountCents)} on a ${dollars(line.orderPurchasePriceCents)} order = ${pct(line.amountCents, line.orderPurchasePriceCents)} — above the 3% cap, cleared only if the pass-through holds`;
    }
  }
  return "see the finding's own stated computation";
}

/**
 * The refund evidence a cured/conditional verdict rests on (batch P2 fix,
 * 2026-07-16): a "cured by refund" call must SHOW the refund — amount and date,
 * read from the statement's own refund lines, never asserted bare.
 */
function refundEvidenceFor(
  finding: FeeAuditReport["findings"][number],
  statement: StatementJson,
): string {
  if (
    finding.verdict !== "cured-by-refund" &&
    finding.verdict !== "conditional-pending-refund-window"
  ) {
    return "";
  }
  const category = finding.claim.id.split("#")[1] ?? "";
  const refunds = statement.lines.filter(
    (l) => l.isRefund && l.declaredCategory === category,
  );
  if (finding.verdict === "cured-by-refund") {
    const shown = refunds
      .map((l) => `refund ${dollars(l.amountCents)} on ${l.refundedAtDate ?? "an undated line"}`)
      .join("; ");
    return shown ? `; cured by ${shown} — inside the 30-day window` : "";
  }
  return "; no covering refund yet — the 30-day window is still open";
}

function toFeeView(reportJson: unknown, statementJson: unknown): FeeReportViewModel {
  const report = reportJson as FeeAuditReport;
  const statement = statementJson as StatementJson;
  const tallyLine =
    report.findings.length === 0
      ? "no findings — every fee line is within cap as declared"
      : VERDICT_ORDER.map((v) => `${report.verdictTally[v]} ${VERDICT_TALLY_WORD[v]}`).join(" · ");
  return {
    ok: report.ok,
    findingCount: report.findings.length,
    tally: report.verdictTally,
    tallyLine,
    monthDisplay: monthDisplay(statement.meta.month),
    evaluatedAsOf: dateDisplay(statement.meta.asOf),
    specPin: report.specVersion,
    assumedBaseDisplay: cleanFeeCopy(report.assumedPurchasePriceBase),
    rows: report.findings.map((f) => ({
      key: `${f.claim.id}:${f.ruleId}`,
      plain: cleanFeeCopy(f.plainLine),
      professional: cleanFeeCopy(f.professionalLine),
      severity: f.severity,
      verdict: f.verdict,
      verdictTag: VERDICT_TAG_DISPLAY[f.verdict],
      feeClass: f.feeClass,
      ruleId: f.ruleId,
      clause: f.referenceRowId,
      claimId: f.claim.id,
      statementLine: statementLineFor(f.claim.id, f.claim.field, statement),
      arithmetic: `${arithmeticFor(f, statement)}${refundEvidenceFor(f, statement)}`,
      provisional: f.provisional.length > 0,
    })),
  };
}

export type FeeStatementKey = "drifted" | "faithful" | "cured" | "conditional";

export type FeeStatementCase = {
  key: FeeStatementKey;
  label: string;
  plain: string;
  view: FeeReportViewModel;
};

/**
 * The four committed months, each a different legal outcome the statute encodes:
 * violations · a clean month · an over-cap cured by an in-window refund · an
 * over-cap still inside the open refund window.
 */
export const FEE_CASES: readonly FeeStatementCase[] = [
  {
    key: "drifted",
    label: "Over the caps",
    plain: "a month with unlawful and over-cap lines",
    view: toFeeView(driftedReportJson, driftedStatementJson),
  },
  {
    key: "faithful",
    label: "Within the caps",
    plain: "a clean month — every fee line within its cap",
    view: toFeeView(faithfulReportJson, faithfulStatementJson),
  },
  {
    key: "cured",
    label: "Refunded in time",
    plain: "an over-cap month cured by a refund inside the 30-day window",
    view: toFeeView(curedReportJson, curedStatementJson),
  },
  {
    key: "conditional",
    label: "Window still open",
    plain: "an over-cap month evaluated while the refund window is still open",
    view: toFeeView(conditionalReportJson, conditionalStatementJson),
  },
];

/* ------------------------------------------------------------- */
/* Chapter-02 view derivations (build piece 3, 2026-07-20)        */
/* ------------------------------------------------------------- */

/** The four headline caps, straight from the drift-locked registry. */
export type CapCell = { key: string; figure: string; note: string; clause: string };
const capOf = (id: string): FeeRule => {
  const r = FEE_RULES.find((x) => x.id === id);
  if (!r || r.capPct === undefined) throw new Error(`fees surface: cap rule ${id} missing`);
  return r;
};
export const CAPS_VIEW: readonly CapCell[] = [
  {
    key: "DELIVERY",
    figure: `${capOf("NYC-563.3-a-1").capPct}%`,
    note: "Per order, and as a monthly average across all orders.",
    clause: capOf("NYC-563.3-a-1").sourceClause,
  },
  {
    key: "ORDER-TAKING",
    figure: `${capOf("NYC-563.3-b-1").capPct}%`,
    note: "The (b) fee, for listing and taking the order.",
    clause: capOf("NYC-563.3-b-1").sourceClause,
  },
  {
    key: "CARD PROCESSING",
    figure: `${capOf("NYC-563.3-c-1").capPct}%`,
    note: "A flat cap on the transaction fee, per order.",
    clause: capOf("NYC-563.3-c-1").sourceClause,
  },
  {
    key: "ENHANCED TIER",
    figure: `${capOf("NYC-563.3-d-2").capPct}%`,
    note: "The (d) tier — only if a plain basic plan was offered first.",
    clause: capOf("NYC-563.3-d-2").sourceClause,
  },
];

/**
 * The averaging-clause jewel — COMPUTED from the drifted month's own
 * monthly-average finding (never typed): the month's average, the cap, the
 * division, and the meter geometry on a 0–20% scale.
 */
export const FEE_JEWEL = (() => {
  const report = driftedReportJson as unknown as FeeAuditReport;
  const f = report.findings.find((x) => x.ruleId === "NYC-563.3-a-2");
  if (!f) throw new Error("fees surface: the drifted month has no averaging-clause finding");
  const v = f.claim.value as { sumFeesCents: number; sumPurchasePriceCents: number; capPct: number };
  const avgPct = (v.sumFeesCents / v.sumPurchasePriceCents) * 100;
  const scaleMax = 20;
  return {
    ruleId: f.ruleId,
    clause: f.referenceRowId,
    fees: dollars(v.sumFeesCents),
    purchases: dollars(v.sumPurchasePriceCents),
    avg: `${avgPct.toFixed(1)}%`,
    avgTo: Number(avgPct.toFixed(1)),
    cap: `${v.capPct.toFixed(1)}%`,
    capShort: `${v.capPct}%`,
    scaleMax: `${scaleMax}%`,
    fillPct: (v.capPct / scaleMax) * 100,
    overPct: ((avgPct - v.capPct) / scaleMax) * 100,
    overBy: `${(avgPct - v.capPct).toFixed(1)}`,
  } as const;
})();
