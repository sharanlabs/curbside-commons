/**
 * Fees pack (UC-1) — F1a deterministic spine (plan §5 F1, §6, §7).
 *
 * The fee-statement audit pack: a typed statement schema, a loud parser, the 17
 * codified NYC §20-563.3 rules as typed predicates (drift-locked to the JSON
 * twin), a deterministic audit engine with the §20-563.3(e) refund-window verdict
 * states, the U1-provisional finding wrapper, and a seeded corpus + answer key.
 * The LLM line-item classifier (true-vs-declared category) is DEFERRED to F1b.
 *
 * Plain: the fee-drift rulebook plus the machinery that reads a delivery bill,
 * checks every fee against the real legal caps, and proves each catch with
 * receipts — the deterministic half; the AI classifier comes next slice.
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
  status: "f1a-deterministic-spine",
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
