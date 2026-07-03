/**
 * Fees pack (UC-1) — W0 PLACEHOLDER (plan §6, §7).
 *
 * Will hold the fee-line classes the classifier + judges audit against the
 * codified NYC cap rule table (§20-563.3). No classifier yet — F1 fills it, with
 * held-out precision/recall published per C8. W0 only enumerates the classes.
 *
 * Plain: the fee-drift rulebook — the documented ways a delivery statement can
 * misstate fees against the legal caps.
 */

/** Fee-line classes enumerated in plan §7 (fees). Names only in W0. */
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
  status: "placeholder-w0",
  classes: FEE_LINE_CLASSES,
} as const;
