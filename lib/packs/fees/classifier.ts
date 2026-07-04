/**
 * Fee line-item CLASSIFIER seam — F1b (plan §5 F1, C8; §7 fee-line classes).
 *
 * The declared-vs-TRUE seam documented in `statement.ts` gets its classifier here:
 * given a statement line's FACE (free-text label + declared category + amounts +
 * statement context), predict the line's TRUE category. The deterministic F1a spine
 * audits categories AS-DECLARED; this seam is what would let it reason about what a
 * line ACTUALLY is when the platform mislabels it.
 *
 * ── HONESTY / ANTI-THEATER (AM-7 precedent, C8) ───────────────────────────────
 * An LLM classifier EARNS its "calibrated" label ONLY by beating the deterministic
 * baseline ({@link DeterministicBaselineClassifier}) on HELD-OUT gold, on the
 * owner-gated live run. Until then the LLM label DEFERS:
 *   - the offline {@link MockOracleClassifier} CANNOT earn it — it reads the answer
 *     and is a WIRING STUB only (it proves the seam surfaces a relabeling, never
 *     that any model can);
 *   - there is NO live classifier wired here — the live lane is DESIGNED
 *     ({@link LIVE_CLASSIFIER_DESIGN}, a typed prompt-input contract + doc) but
 *     NOT connected to any provider. Zero network imports; a test proves it.
 * No file in this seam calls a model or the network. The gold set is SIMULATED.
 *
 * Plain: the piece that would read what a fee REALLY is when the bill mislabels it.
 * Right now it's a measured floor (dumb keyword rules) plus a test stand-in that
 * cheats by reading the answer — the real AI version is fully specced but not
 * plugged in, and it isn't allowed to claim it's good until it out-scores the floor
 * on held-out examples in an owner-approved live run.
 */
import type { FeeLineClass } from "./index.ts";
import {
  isLegalFeeCategory,
  type DeclaredCategory,
  type LegalFeeCategory,
  type StatementLine,
} from "./statement.ts";

/**
 * The classifier's TRUE-category label vocabulary. Either one of the four legally
 * permitted categories (§20-563.3(d)) or the catch-all `not-a-permitted-fee` — a
 * line whose true nature is no permitted category at all (a bundled lump, a
 * promotion deduction, an invented charge).
 */
export type TrueCategoryLabel = LegalFeeCategory | "not-a-permitted-fee";

/** The catch-all label — a line that is truly no permitted fee category. */
export const NOT_A_PERMITTED_FEE = "not-a-permitted-fee" as const;

/** Ordered label vocabulary — runtime export so evals/metrics can enumerate per-category. */
export const TRUE_CATEGORY_LABELS: readonly TrueCategoryLabel[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
  NOT_A_PERMITTED_FEE,
] as const;

export function isTrueCategoryLabel(v: string): v is TrueCategoryLabel {
  return (TRUE_CATEGORY_LABELS as readonly string[]).includes(v);
}

/**
 * How each of the six plan §7 fee-line drift classes MAPS onto the true-category
 * vocabulary (documented so the gold-set labels are internally consistent). This is
 * the drift class the item EXERCISES vs. the true category it should be RELABELED to:
 *
 *  - `over-cap`                → true == the DECLARED legal category (the drift is the
 *                                AMOUNT, not the category — the classifier confirms it).
 *  - `misclassification`      → true is a DIFFERENT legal category than declared, or
 *                                `not-a-permitted-fee` (e.g. a marketing charge booked
 *                                as delivery).
 *  - `relabeling`             → true is a different legal category than the declared
 *                                legal category (an enhanced fee dressed as delivery).
 *  - `bundling`               → `not-a-permitted-fee` (a single line lumping >1 charge
 *                                is not any one permitted fee).
 *  - `promotion-deduction-mischaracterization` → `not-a-permitted-fee` (a promo
 *                                deduction is not a permitted fee category).
 *  - `processing-fee-base-inflation` → `transaction_fee` (it IS a processing fee;
 *                                the drift is the inflated base, not the category).
 *
 * NOTE: this is a documentation map for the gold set's rationale, NOT a shortcut the
 * classifier is allowed to use — the classifier never sees the §7 class or the
 * answer key (see {@link ClassifierInput}).
 */
export const SEVEN_CLASS_TRUE_CATEGORY_NOTE: Readonly<Record<FeeLineClass, string>> = {
  "over-cap": "true == declared legal category (amount drift, not category)",
  misclassification: "true is a different legal category, or not-a-permitted-fee",
  relabeling: "true is a different legal category than the declared legal category",
  bundling: "not-a-permitted-fee (a lumped line is no single permitted fee)",
  "promotion-deduction-mischaracterization": "not-a-permitted-fee",
  "processing-fee-base-inflation": "transaction_fee (a processing fee, base inflated)",
};

/**
 * The TYPED PROMPT-INPUT CONTRACT — everything a classifier (deterministic, mock, or
 * the designed live one) MAY see about a line. It is deliberately a SUBSET of the
 * statement line: the FACE of the charge plus benign statement context.
 *
 * NO GROUND-TRUTH LEAKAGE (C8): this shape carries NO `trueCategory`, NO answer-key
 * reference, and nothing derived from them. A live classifier prompt is built ONLY
 * from these fields; the answer key never enters the classifier's context.
 */
export interface ClassifierInput {
  /** The platform's free-text line label as printed on the statement. */
  readonly label: string;
  /** What the platform CLAIMS the line is (legal category OR arbitrary label). */
  readonly declaredCategory: DeclaredCategory;
  /** The charged amount, integer cents. */
  readonly amountCents: number;
  /** The order's purchase price, integer cents (the cap base). */
  readonly orderPurchasePriceCents: number;
  /** True iff this line is a refund/credit. */
  readonly isRefund: boolean;
  /** True iff the platform documents this line as an exact processor pass-through. */
  readonly passthroughDocumented: boolean;
  /** Benign statement context: the set of DECLARED categories present on the same statement. */
  readonly siblingDeclaredCategories: readonly DeclaredCategory[];
}

/** Build the leak-free {@link ClassifierInput} for one line within its statement context. */
export function toClassifierInput(
  line: StatementLine,
  siblingDeclaredCategories: readonly DeclaredCategory[],
): ClassifierInput {
  return {
    label: line.label,
    declaredCategory: line.declaredCategory,
    amountCents: line.amountCents,
    orderPurchasePriceCents: line.orderPurchasePriceCents,
    isRefund: line.isRefund,
    passthroughDocumented: line.passthroughDocumented,
    siblingDeclaredCategories,
  };
}

/** A classifier's prediction for one line. */
export interface ClassifierPrediction {
  /** The predicted TRUE category. */
  readonly predicted: TrueCategoryLabel;
  /** A short, human-readable reason (for the advisory finding's evidence + audit trail). */
  readonly rationale: string;
}

/**
 * The line-item classifier SEAM (DI, like the legacy semantic/domain judges). Every
 * implementation is a pure function object — the deterministic baseline, the mock
 * wiring stub, and the DESIGNED-but-unwired live lane all satisfy this one interface,
 * so `auditWithClassification` is agnostic to which is injected.
 */
export interface LineItemClassifier {
  /** A stable name for provenance / reporting (e.g. "deterministic-baseline"). */
  readonly name: string;
  /**
   * Whether this classifier's label is EARNED. `false` for the baseline (it IS the
   * floor, not a beat-the-floor result) and for the mock (it cheats). Only an
   * owner-gated live run that beats the baseline on held-out gold may set this true —
   * and no live classifier is wired here, so nothing sets it true in this slice.
   */
  readonly earnsLabel: false;
  classify(input: ClassifierInput): ClassifierPrediction;
}

// ── DETERMINISTIC BASELINE — the anti-theater floor (AM-7) ─────────────────────

/**
 * One keyword rule: if the lowercased label matches, predict `to`. Rules are tried
 * in array order (first match wins), so more specific patterns precede general ones.
 */
interface KeywordRule {
  readonly test: RegExp;
  readonly to: TrueCategoryLabel;
  readonly why: string;
}

/**
 * The baseline's label-text rules. Deliberately SIMPLE and imperfect — this is the
 * FLOOR the LLM classifier must beat on held-out gold to earn its label, not a
 * best-effort classifier. Order matters (first match wins).
 */
const BASELINE_RULES: readonly KeywordRule[] = [
  { test: /\b(promo|promotion|adjustment|discount recoup|misc|other|bundle|bundled|combined|&)\b/i, to: NOT_A_PERMITTED_FEE, why: "label reads as a promo/adjustment/bundled/misc line — no single permitted fee" },
  { test: /\b(transaction|processing|card|payment|swipe|interchange)\b/i, to: "transaction_fee", why: "label names card/payment processing" },
  { test: /\b(enhanced|premium|marketing|boost|sponsor|featured|promoted listing|advertis)\b/i, to: "enhanced_service_fee", why: "label reads as an optional/marketing extra (enhanced tier)" },
  { test: /\b(basic service|basic|listing|search|discoverab)\b/i, to: "basic_service_fee", why: "label reads as a basic listing/search service fee" },
  { test: /\b(delivery|courier|dispatch|last[- ]mile|drop[- ]?off)\b/i, to: "delivery_fee", why: "label names delivery/courier" },
];

/**
 * The deterministic keyword/heuristic baseline classifier. Label-text rules first;
 * if none match, fall back to the DECLARED category when it is itself a legal
 * category, else `not-a-permitted-fee`. Pure, $0, no network — this is the measured
 * floor F1b's baseline eval scores.
 */
export const DeterministicBaselineClassifier: LineItemClassifier = {
  name: "deterministic-baseline",
  earnsLabel: false,
  classify(input: ClassifierInput): ClassifierPrediction {
    const label = input.label.toLowerCase();
    for (const rule of BASELINE_RULES) {
      if (rule.test.test(label)) {
        return { predicted: rule.to, rationale: `baseline: ${rule.why}` };
      }
    }
    if (isLegalFeeCategory(input.declaredCategory)) {
      return {
        predicted: input.declaredCategory,
        rationale: "baseline: no label keyword matched; fell back to the (legal) declared category",
      };
    }
    return {
      predicted: NOT_A_PERMITTED_FEE,
      rationale: "baseline: no label keyword matched and the declared category is not a permitted one",
    };
  },
};

// ── MOCK ORACLE — a WIRING STUB only (does NOT earn the label) ──────────────────

/**
 * A mock classifier backed by an ANSWER MAP. It reads the intended true category and
 * returns it — so it is an ORACLE, not a model: it exists ONLY to prove the audit
 * seam CAN surface a relabeling (deliverable 7's wiring proof). It CANNOT earn the
 * LLM label (AM-7): reading the answer is not beating the baseline. Tests use it to
 * exercise the plumbing; the coverage eval still reports the deferred class deferred.
 *
 * @param answers map from a line key (`orderId#declaredCategory`) to its true label.
 */
export function makeMockOracleClassifier(
  answers: ReadonlyMap<string, TrueCategoryLabel>,
  keyOf: (input: ClassifierInput) => string,
): LineItemClassifier {
  return {
    name: "mock-oracle-wiring-stub",
    earnsLabel: false,
    classify(input: ClassifierInput): ClassifierPrediction {
      const answer = answers.get(keyOf(input));
      if (answer !== undefined) {
        return { predicted: answer, rationale: "mock-oracle: read the answer key (WIRING STUB — not an earned prediction)" };
      }
      // Unknown line → defer to the declared category (never invent a relabeling).
      const fallback: TrueCategoryLabel = isLegalFeeCategory(input.declaredCategory)
        ? input.declaredCategory
        : NOT_A_PERMITTED_FEE;
      return { predicted: fallback, rationale: "mock-oracle: no answer entry; echoed the declared category" };
    },
  };
}

// ── LIVE LANE — DESIGNED, NOT WIRED ────────────────────────────────────────────

/**
 * The DESIGN of the live LLM classifier (deliverable 6a) — data + doc only, NO
 * provider call, NO network import. The full recalibration + pre-registration plan
 * lives in `docs/plan-f1b-classifier.md`; this const is the machine-readable spine
 * of it (so a later, owner-gated slice wires a provider to exactly this contract).
 */
export const LIVE_CLASSIFIER_DESIGN = {
  /** Model lane: Groq free tier first (plan §5; gpt-oss-120b precedent), cross-family judge. */
  modelLane: "groq-free-tier (gpt-oss-120b class); Gemini stays ≤$5-capped + demo-scoped",
  /** The classifier sees ONLY {@link ClassifierInput} — never the answer key or trueCategory. */
  promptInputContract: "ClassifierInput (label · declaredCategory · amounts · isRefund · passthroughDocumented · siblingDeclaredCategories) — NO ground-truth",
  /** Structured output the provider must return (parsed + validated before use). */
  outputShape: "{ predicted: TrueCategoryLabel, rationale: string }",
  /** Failure/fallback semantics — the FAILED_TO_FALLBACK precedent. */
  fallback: "on parse/schema/timeout failure → FAILED_TO_FALLBACK: defer to the deterministic baseline; NEVER silently invent a label",
  /** The honesty gate. */
  ownerGate: "no live run without the owner's word; no 'calibrated' claim below the pre-registered floor (docs/plan-f1b-classifier.md)",
  /** Not wired in this slice. */
  wired: false,
} as const;

/** Thrown if code ever tries to run the live classifier — it is DESIGNED, not wired (fail loud). */
export class LiveClassifierNotWiredError extends Error {
  constructor() {
    super(
      "the live LLM classifier is DESIGNED (LIVE_CLASSIFIER_DESIGN + docs/plan-f1b-classifier.md) but NOT wired to any provider — no live run without the owner gate",
    );
    this.name = "LiveClassifierNotWiredError";
  }
}
