/**
 * Advisory classifier-derived audit path — F1b deliverable 7 (plan §5 F1, C8).
 *
 * `auditWithClassification` layers an OPTIONAL, ADVISORY classifier pass on top of
 * the UNCHANGED F1a deterministic engine: it calls `auditStatement` exactly as the
 * default path does (byte-identical; `fees-freeze.test.ts` + this slice's own
 * goldens-unchanged assertion prove it), then separately runs an injected
 * {@link LineItemClassifier} over every non-refund line and reports a candidate
 * relabeling wherever the classifier's predicted TRUE category diverges from the
 * DECLARED category. These candidates are ADVISORY — they are a lead, never a
 * verdict — and are reported in a completely separate array from the base report's
 * findings.
 *
 * DESIGN ESCALATION E-1 (freeze-safety over literal wording): the packet describes
 * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
 * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
 * at F1b build time its three members (`violation` /
 * `conditional-pending-refund-window` / `cured-by-refund`) were all STATUTORY
 * DISPOSITIONS of a settled cap check; none honestly describes an unconfirmed
 * AI-derived relabeling candidate, and growing the union just for the advisory
 * lane would have byte-broken the frozen F1a goldens via `verdictTally`.
 * (The M2 reconciliation, 2026-07-04, later DID add a fourth member —
 * `asserted-passthrough-unverified`, a c-2 statement-side state — under a
 * SANCTIONED golden regeneration; that state belongs to the deterministic audit,
 * still not to advisory candidates, so this resolution stands unchanged.)
 * Resolution (conservative): reuse the SAME universal C2 receipts constructor
 * every finding in this repo is built through (`makeFinding`,
 * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
 * define a fees-domain advisory type ({@link ClassifierAdvisoryFinding})
 * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
 * cannot be affected because this module never calls `buildFeeReport`.
 * The one live change borrowed from the
 * literal spec is the claim source: `ClaimSource` (verifier-core/claim.ts) gains the
 * `"classifier"` member (a plain string-literal addition with no exhaustive switch
 * anywhere in the codebase — verified before the edit — so it cannot break anything
 * that reads `Claim.source`).
 *
 * HONESTY (AM-7 / C8): whichever classifier is injected, its `earnsLabel` is always
 * `false` in this slice (no live classifier is wired — see classifier.ts). An
 * advisory finding built from the {@link MockOracleClassifier} PROVES the seam CAN
 * surface a relabeling (deliverable 7's wiring proof); it is never presented as a
 * caught violation, and the C6 coverage eval (unmodified) keeps reporting the
 * fee-answer-key's `deferred-to-classifier` entries as deferred, not caught.
 *
 * Plain: this is the "and here's what the AI classifier WOULD flag" layer, bolted
 * onto the untouched legal checker. It never changes what the legal checker says by
 * itself, and everything it flags is labeled "candidate, not proven" until an
 * owner-approved live run earns the right to say otherwise.
 *
 * HONESTY (C10): every statement this module runs against is SIMULATED (see
 * `statement.ts`); nothing here reads or implies real platform data.
 */
import { makeFinding } from "../../verifier-core/guard.ts";
import type { Finding } from "../../verifier-core/index.ts";
import { auditStatement } from "./audit.ts";
import {
  toClassifierInput,
  type ClassifierPrediction,
  type LineItemClassifier,
  type TrueCategoryLabel,
} from "./classifier.ts";
import type { FeeAuditReport } from "./finding.ts";
import type { DeclaredCategory, MonthlyStatement, StatementLine } from "./statement.ts";

/**
 * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
 * {@link FeeVerdict}, and never gates `report.ok`. Built through the SAME core C2
 * guard (`makeFinding`) every finding in this repo passes through, so it still
 * cannot exist without its receipts (claim · referenceRowId · ruleId · severity).
 */
export interface ClassifierAdvisoryFinding extends Finding {
  /** Always true — the marker that this is a lead, never a settled verdict. */
  readonly advisory: true;
  /** Provenance: which classifier produced this candidate (e.g. "deterministic-baseline", "mock-oracle-wiring-stub"). */
  readonly classifierSource: string;
  /** The order this candidate concerns. */
  readonly orderId: string;
  /** What the platform DECLARED the line as. */
  readonly declaredCategory: DeclaredCategory;
  /** What the classifier PREDICTED the line's true category is. */
  readonly predictedTrueCategory: TrueCategoryLabel;
  /** Professional-register line (two-register standard). */
  readonly professionalLine: string;
  /** Plain-register line (two-register standard; always present here). */
  readonly plainLine: string;
}

/** The result of the advisory classified-audit path: the UNCHANGED base report + a separate advisory array. */
export interface ClassifiedFeeAuditReport {
  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
  readonly base: FeeAuditReport;
  /** Advisory candidates only — never merged into `base.findings` or `base.ok`. */
  readonly advisoryFindings: readonly ClassifierAdvisoryFinding[];
}

const ruleIdFor = (classifier: LineItemClassifier): string =>
  `F1B-CLASSIFIER-ADVISORY(${classifier.name})`;

function buildAdvisoryFinding(
  line: StatementLine,
  lineTag: string,
  prediction: ClassifierPrediction,
  classifier: LineItemClassifier,
): ClassifierAdvisoryFinding {
  const core = makeFinding({
    claim: {
      // Statement-position tag keeps ids unique across repeated same-order,
      // same-category lines (C2 traceability; M2 Codex finding #4).
      id: `${line.orderId}#${line.declaredCategory}#${lineTag}#classifier`,
      source: "classifier",
      field: "predictedTrueCategory",
      value: prediction.predicted,
    },
    referenceRowId: `classifier:${classifier.name}`,
    ruleId: ruleIdFor(classifier),
    severity: "info",
    category: "classifier-relabeling-candidate",
    plainLine: `The "${classifier.name}" classifier thinks the line labeled "${line.label}" (declared "${line.declaredCategory}") might actually be "${prediction.predicted}" — a candidate, not a proven catch.`,
  });
  return Object.freeze({
    ...core,
    advisory: true as const,
    classifierSource: classifier.name,
    orderId: line.orderId,
    declaredCategory: line.declaredCategory,
    predictedTrueCategory: prediction.predicted,
    professionalLine: `Classifier "${classifier.name}" predicts line "${line.label}" on order ${line.orderId} (declared "${line.declaredCategory}") is truly "${prediction.predicted}" — ${prediction.rationale}. ADVISORY: a candidate relabeling, not a settled finding; ${classifier.earnsLabel ? "" : "this classifier has NOT earned a calibrated label (AM-7)."}`,
    plainLine: core.plainLine as string,
  });
}

/**
 * Run the advisory classifier pass on top of the unchanged deterministic audit.
 * Pure in (statement, classifier) — no clock, no network, no LLM (whichever
 * classifier is injected must itself be $0/offline; the live lane is not wired).
 */
export function auditWithClassification(
  statement: MonthlyStatement,
  classifier: LineItemClassifier,
): ClassifiedFeeAuditReport {
  const base = auditStatement(statement);
  const nonRefund = statement.lines.filter((l) => !l.isRefund);
  const siblingDeclaredCategories = [...new Set(nonRefund.map((l) => l.declaredCategory))];
  const lineIndex = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));

  const advisoryFindings: ClassifierAdvisoryFinding[] = [];
  for (const line of nonRefund) {
    const input = toClassifierInput(line, siblingDeclaredCategories);
    const prediction = classifier.classify(input);
    if (prediction.predicted === line.declaredCategory) continue; // no candidate — classifier agrees with the declared label
    advisoryFindings.push(buildAdvisoryFinding(line, `L${lineIndex.get(line)}`, prediction, classifier));
  }

  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
}
