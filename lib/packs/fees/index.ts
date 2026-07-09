/**
 * Fees pack (UC-1) — F1a deterministic spine (plan §5 F1, §6, §7).
 *
 * The fee-statement audit pack: a typed statement schema, a loud parser, the 17
 * codified NYC §20-563.3 rules as typed predicates (drift-locked to the JSON
 * twin), a deterministic audit engine with the §20-563.3(e) refund-window verdict
 * states, the U1-provisional finding wrapper, and a seeded corpus + answer key.
 * The LLM line-item classifier seam (true-vs-declared category) is F1b: the
 * deterministic baseline + mock live here; the wired live lane is
 * `lib/agents/fee-classifier.ts` (owner-armed run 2026-07-05 → label DEFERRED —
 * `docs/fee-classifier-calibration-status.md`; owner-armed RETRY 2026-07-09 on a
 * fresh pre-registered held-out split → ALL floors cleared, label CALIBRATED —
 * `docs/fee-classifier-recalibration-status.md`).
 *
 * Plain: the fee-drift rulebook plus the machinery that reads a delivery bill,
 * checks every fee against the real legal caps, and proves each catch with
 * receipts. The AI fee-reader took its first one-shot test and missed one
 * pre-agreed bar, so it held no title; the owner-approved retest on brand-new
 * questions (same bars, locked in beforehand) scored 21/21 — the title is earned,
 * for the small simulated exam and nothing more.
 */

/** Fee-line classes enumerated in plan §7 (fees). */
export const FEE_LINE_CLASSES = [
  "bundling",
  "relabeling",
  "misclassification",
  "over-cap",
  "promotion-deduction-mischaracterization",
  "processing-fee-base-inflation",
] as const;

export type FeeLineClass = (typeof FEE_LINE_CLASSES)[number];

/** Pack descriptor — a real module so evals/packs can assert it loads. */
export const FEES_PACK = {
  id: "fees",
  useCase: "UC-1",
  status:
    "f1b-classifier-layer; live lane wired; run 2026-07-05: DEFERRED → owner-armed retry 2026-07-09 (fresh pre-registered split): label CALIBRATED (docs/fee-classifier-recalibration-status.md)",
  classes: FEE_LINE_CLASSES,
} as const;

// Public pack surface. The CLI entry lives in ./cli.ts and is intentionally NOT
// re-exported here — it imports node:fs, which the browser-safe barrel avoids.
export type {
  LegalFeeCategory,
  DeclaredCategory,
  StatementLine,
  StatementMeta,
  StatementGenerator,
  MonthlyStatement,
} from "./statement.ts";
export {
  LEGAL_FEE_CATEGORIES,
  isLegalFeeCategory,
  PURCHASE_PRICE_BASE_STATUS,
  ASSUMED_PURCHASE_PRICE_BASE,
} from "./statement.ts";
export { StatementParseError, parseStatement } from "./parser.ts";
export type { FeeRule, FeeRuleKind } from "./rules.ts";
export {
  FEE_RULES,
  FEE_RULE_BY_ID,
  NON_STATEMENT_CHECKABLE,
  BASE_DERIVED_RULE_IDS,
  normalizeTwinDriftClasses,
  perOrderCapExceeded,
  monthlyAverageExceeded,
  categoryUnlawful,
  enhancedWithoutBasic,
  transactionPassthroughAllowed,
} from "./rules.ts";
export type { FeeFinding, FeeFindingInput, FeeVerdict, FeeAuditReport } from "./finding.ts";
export {
  PROVISIONAL_U1,
  FEE_VERDICTS,
  makeFeeFinding,
  MissingProvisionalMarkerError,
  sortFeeFindings,
  buildFeeReport,
  serializeFeeReport,
} from "./finding.ts";
export {
  FEES_SPEC_VERSION,
  FEES_CLASSIFICATION_LABEL,
  auditStatement,
  claimIdPart,
  makeLineTagger,
} from "./audit.ts";
export type { FeeAnswerKey, FeeAnswerKeyEntry, FeeDetectionMode } from "./generate.ts";
export {
  FEES_CORPUS_SEED,
  buildFaithfulStatement,
  buildDriftedStatement,
  buildCuredStatement,
  buildConditionalStatement,
  buildFeeAnswerKey,
  buildCorpusReports,
} from "./generate.ts";

// F1b classifier seam (plan §5 F1b, C8) — zero network/LLM imports (verified by
// the extended fees-cli import-graph eval). The live lane is WIRED (2026-07-05,
// owner GO) but lives OUTSIDE this pack (`lib/agents/fee-classifier.ts`, env-gated)
// and is never imported here, so the pack's zero-network proof still holds.
export type {
  ClassifierInput,
  ClassifierPrediction,
  LineItemClassifier,
  TrueCategoryLabel,
} from "./classifier.ts";
export {
  DeterministicBaselineClassifier,
  LIVE_CLASSIFIER_DESIGN,
  NOT_A_PERMITTED_FEE,
  SEVEN_CLASS_TRUE_CATEGORY_NOTE,
  TRUE_CATEGORY_LABELS,
  isTrueCategoryLabel,
  makeMockOracleClassifier,
  toClassifierInput,
} from "./classifier.ts";
export type { ClassifierAdvisoryFinding, ClassifiedFeeAuditReport } from "./classified-audit.ts";
export { auditWithClassification } from "./classified-audit.ts";
