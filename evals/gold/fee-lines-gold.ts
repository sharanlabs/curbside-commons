/**
 * GOLD SET for the F1b fee line-item classifier (plan §5 F1, C8; §7 fee-line
 * classes). Typed TS LITERALS (legacy `semantic-judge-gold.ts` pattern), stratified
 * across all SIX §7 fee-line drift classes plus a clean-negative stratum, each
 * item carrying the {@link ClassifierInput}-shape line fields, its DECLARED
 * category, its TRUE category label, the §7 class it exercises, and a rationale.
 *
 * HONESTY (AM-7 / C8): every label text is SYNTHETIC/simulated (realistic platform
 * wording, no real merchant or platform data). This gold set is SMALL and
 * SYNTHETIC — it bounds what can be claimed: it supports an offline deterministic-
 * baseline measurement (this slice) and gives an owner-gated LIVE run something
 * pre-registered to beat; it is NOT a statistically sufficient sample of real
 * platform fee-line text, and no claim here says otherwise.
 *
 * TUNE/TEST SPLIT: disjoint by construction (every item has exactly one `split`),
 * stratified — every one of the six §7 classes plus the clean stratum appears in
 * BOTH splits with the same per-class count (3 tune + 3 test per §7 class; 3 tune +
 * 3 test clean negatives — 42 items total). Composition is enforced by
 * `fee-lines-gold-composition.test.ts` (per-class-per-split counts, disjointness,
 * pinned-ID equality) — the slice-2 close-out pattern.
 */
import {
  FEE_LINE_CLASSES,
  NOT_A_PERMITTED_FEE,
  type ClassifierInput,
  type DeclaredCategory,
  type FeeLineClass,
  type TrueCategoryLabel,
} from "@/lib/packs/fees";

/** The stratum a gold item exercises: one of the six §7 drift classes, or "clean" (no drift). */
export type GoldStratum = FeeLineClass | "clean";

export interface FeeLineGoldItem {
  readonly id: string;
  readonly stratum: GoldStratum;
  readonly split: "tune" | "test";
  /** The line's face — exactly the {@link ClassifierInput} shape (leak-free). */
  readonly input: ClassifierInput;
  /** The TRUE category label a correct classifier must predict. */
  readonly trueCategory: TrueCategoryLabel;
  /** Why this true label is correct — the audit-trail rationale (few-shot material for the live design). */
  readonly rationale: string;
}

/** Benign default sibling context: a normal 4-category monthly statement. */
const DEFAULT_SIBLINGS: readonly DeclaredCategory[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
];

function item(
  id: string,
  stratum: GoldStratum,
  split: "tune" | "test",
  opts: {
    label: string;
    declaredCategory: DeclaredCategory;
    amountCents: number;
    orderPurchasePriceCents?: number;
    trueCategory: TrueCategoryLabel;
    rationale: string;
    siblingDeclaredCategories?: readonly DeclaredCategory[];
  },
): FeeLineGoldItem {
  return {
    id,
    stratum,
    split,
    input: {
      label: opts.label,
      declaredCategory: opts.declaredCategory,
      amountCents: opts.amountCents,
      orderPurchasePriceCents: opts.orderPurchasePriceCents ?? 2000,
      isRefund: false,
      passthroughDocumented: false,
      siblingDeclaredCategories: opts.siblingDeclaredCategories ?? DEFAULT_SIBLINGS,
    },
    trueCategory: opts.trueCategory,
    rationale: opts.rationale,
  };
}

export const FEE_LINES_GOLD: readonly FeeLineGoldItem[] = [
  // ── over-cap: true == the DECLARED legal category (the drift is the AMOUNT, not
  // the category — a correct classifier CONFIRMS the declared category). ────────
  item("overcap-tune-1", "over-cap", "tune", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 500, // 25% of 2000 — over the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Plainly-labeled delivery fee; over cap by amount only — category is correctly delivery_fee.",
  }),
  item("overcap-tune-2", "over-cap", "tune", {
    label: "Basic service fee",
    declaredCategory: "basic_service_fee",
    amountCents: 200, // 10% of 2000 — over the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Plainly-labeled basic service fee; over cap by amount only.",
  }),
  item("overcap-tune-3", "over-cap", "tune", {
    label: "Enhanced service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 600, // 30% of 2000 — over the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "Plainly-labeled enhanced service fee; over cap by amount only.",
  }),
  item("overcap-test-1", "over-cap", "test", {
    label: "Courier delivery charge",
    declaredCategory: "delivery_fee",
    amountCents: 480,
    trueCategory: "delivery_fee",
    rationale: "Courier wording still names delivery; over cap by amount only.",
  }),
  item("overcap-test-2", "over-cap", "test", {
    label: "Listing & search fee",
    declaredCategory: "basic_service_fee",
    amountCents: 180,
    trueCategory: "basic_service_fee",
    rationale: "Listing/search wording names the basic-service tier; over cap by amount only.",
  }),
  item("overcap-test-3", "over-cap", "test", {
    label: "Enhanced marketing service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 620,
    trueCategory: "enhanced_service_fee",
    rationale: "'Enhanced' wording names the enhanced tier; over cap by amount only.",
  }),

  // ── misclassification: true is a DIFFERENT legal category than declared, or
  // not-a-permitted-fee (the charge's true nature was never what was declared). ──
  item("misclass-tune-1", "misclassification", "tune", {
    label: "Marketing boost",
    declaredCategory: "delivery_fee",
    amountCents: 150,
    trueCategory: "enhanced_service_fee",
    rationale: "A marketing/boost charge booked under delivery_fee; it is truly an optional enhanced-tier extra.",
  }),
  item("misclass-tune-2", "misclassification", "tune", {
    label: "Card processing surcharge",
    declaredCategory: "basic_service_fee",
    amountCents: 60,
    trueCategory: "transaction_fee",
    rationale: "A card-processing surcharge booked under basic_service_fee; it is truly a transaction fee.",
  }),
  item("misclass-tune-3", "misclassification", "tune", {
    label: "Photography upgrade fee",
    declaredCategory: "transaction_fee",
    amountCents: 90,
    trueCategory: "enhanced_service_fee",
    rationale: "A photo-upgrade extra booked under transaction_fee; it is truly an enhanced-tier extra.",
  }),
  item("misclass-test-1", "misclassification", "test", {
    label: "Premium placement fee",
    declaredCategory: "delivery_fee",
    amountCents: 140,
    trueCategory: "enhanced_service_fee",
    rationale: "'Premium placement' is a marketing/visibility extra booked under delivery_fee.",
  }),
  item("misclass-test-2", "misclassification", "test", {
    label: "Payment gateway fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 55,
    trueCategory: "transaction_fee",
    rationale: "A payment-gateway charge booked under enhanced_service_fee; it is truly a transaction fee.",
  }),
  item("misclass-test-3", "misclassification", "test", {
    label: "Same-day courier fee",
    declaredCategory: "basic_service_fee",
    amountCents: 260,
    trueCategory: "delivery_fee",
    rationale: "A courier/delivery charge booked under basic_service_fee; it is truly a delivery fee.",
  }),

  // ── relabeling: true is a different legal category than the DECLARED legal
  // category — the cross-period-relabel flavor (a charge renamed/re-declared under
  // a different legal label from one period to the next; here exercised as a
  // single mislabeled instance since a single statement cannot show the "across
  // months" element — see plan-f1b-classifier.md's scope note). ──────────────────
  item("relabel-tune-1", "relabeling", "tune", {
    label: "Delivery & fulfillment fee",
    declaredCategory: "delivery_fee",
    amountCents: 130,
    trueCategory: "enhanced_service_fee",
    rationale: "'Fulfillment' wording covers a re-declared enhanced-tier charge kept under the delivery_fee label across periods.",
  }),
  item("relabel-tune-2", "relabeling", "tune", {
    label: "Delivery service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 250,
    trueCategory: "delivery_fee",
    rationale: "The label swapped the other way: a genuine delivery charge re-declared as enhanced_service_fee.",
  }),
  item("relabel-tune-3", "relabeling", "tune", {
    label: "Enhanced visibility fee",
    declaredCategory: "basic_service_fee",
    amountCents: 70,
    trueCategory: "enhanced_service_fee",
    rationale: "'Enhanced visibility' names the enhanced tier, re-declared under basic_service_fee.",
  }),
  item("relabel-test-1", "relabeling", "test", {
    label: "Basic service charge",
    declaredCategory: "transaction_fee",
    amountCents: 65,
    trueCategory: "basic_service_fee",
    rationale: "A basic-listing charge re-declared under transaction_fee.",
  }),
  item("relabel-test-2", "relabeling", "test", {
    label: "Service & delivery relabel fee",
    declaredCategory: "delivery_fee",
    amountCents: 145,
    trueCategory: "enhanced_service_fee",
    rationale: "Relabeled service charge kept under the delivery_fee category across periods.",
  }),
  item("relabel-test-3", "relabeling", "test", {
    label: "Standard delivery fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 240,
    trueCategory: "delivery_fee",
    rationale: "'Standard delivery' is a genuine delivery charge re-declared as enhanced_service_fee.",
  }),

  // ── bundling: true = not-a-permitted-fee (a single lumped line is no ONE
  // permitted category). ───────────────────────────────────────────────────────
  item("bundle-tune-1", "bundling", "tune", {
    label: "Service & delivery bundle",
    declaredCategory: "basic_service_fee",
    amountCents: 300,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps a service charge and a delivery charge into one line — no single permitted category applies.",
  }),
  item("bundle-tune-2", "bundling", "tune", {
    label: "Combined delivery + processing fee",
    declaredCategory: "delivery_fee",
    amountCents: 280,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps delivery and processing into one line — no single permitted category applies.",
  }),
  item("bundle-tune-3", "bundling", "tune", {
    label: "All-in-one platform fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 400,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "An undifferentiated all-in-one charge — no single permitted category applies.",
  }),
  item("bundle-test-1", "bundling", "test", {
    label: "Bundled service charge",
    declaredCategory: "transaction_fee",
    amountCents: 90,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Generic 'bundled' wording signals a lumped, non-single-category charge.",
  }),
  item("bundle-test-2", "bundling", "test", {
    label: "Delivery & marketing combo fee",
    declaredCategory: "basic_service_fee",
    amountCents: 320,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps delivery and marketing into one line — no single permitted category applies.",
  }),
  item("bundle-test-3", "bundling", "test", {
    label: "Full-service bundled fee",
    declaredCategory: "delivery_fee",
    amountCents: 350,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'Full-service bundled' signals multiple charges lumped into one line.",
  }),

  // ── promotion-deduction-mischaracterization: true = not-a-permitted-fee (a promo
  // deduction dressed as a fee is not a permitted fee category at all). ─────────
  item("promo-tune-1", "promotion-deduction-mischaracterization", "tune", {
    label: "Promo adjustment",
    declaredCategory: "delivery_fee",
    amountCents: 120,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A promotion-deduction dressed as a delivery fee — not a permitted fee category.",
  }),
  item("promo-tune-2", "promotion-deduction-mischaracterization", "tune", {
    label: "Promotion deduction",
    declaredCategory: "basic_service_fee",
    amountCents: 100,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Explicit 'promotion deduction' wording — not a permitted fee category.",
  }),
  item("promo-tune-3", "promotion-deduction-mischaracterization", "tune", {
    label: "Discount recoup fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 110,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A discount-recoup charge dressed as an enhanced service fee — not a permitted fee category.",
  }),
  item("promo-test-1", "promotion-deduction-mischaracterization", "test", {
    label: "Marketing promo deduction",
    declaredCategory: "transaction_fee",
    amountCents: 95,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A marketing-promo deduction dressed as a transaction fee — not a permitted fee category.",
  }),
  item("promo-test-2", "promotion-deduction-mischaracterization", "test", {
    label: "Promotional adjustment charge",
    declaredCategory: "delivery_fee",
    amountCents: 125,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Promotional adjustment dressed as delivery — not a permitted fee category.",
  }),
  item("promo-test-3", "promotion-deduction-mischaracterization", "test", {
    label: "Promo cost recovery",
    declaredCategory: "basic_service_fee",
    amountCents: 105,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'Promo cost recovery' dressed as a basic service fee — not a permitted fee category.",
  }),

  // ── processing-fee-base-inflation: true = transaction_fee (it IS a processing
  // fee; the drift is the inflated BASE/amount, not the category). ────────────
  item("procfee-tune-1", "processing-fee-base-inflation", "tune", {
    label: "Payment processing fee",
    declaredCategory: "transaction_fee",
    amountCents: 300, // 15% of 2000 — over the hard 3% cap
    trueCategory: "transaction_fee",
    rationale: "Genuinely a processing fee; the drift is the inflated base/amount, not the category.",
  }),
  item("procfee-tune-2", "processing-fee-base-inflation", "tune", {
    label: "Card transaction fee",
    declaredCategory: "transaction_fee",
    amountCents: 280,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a card-transaction fee; the base is inflated, category is correct.",
  }),
  item("procfee-tune-3", "processing-fee-base-inflation", "tune", {
    label: "Processing & interchange fee",
    declaredCategory: "transaction_fee",
    amountCents: 320,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a processing/interchange fee; the base is inflated, category is correct.",
  }),
  item("procfee-test-1", "processing-fee-base-inflation", "test", {
    label: "Transaction processing charge",
    declaredCategory: "transaction_fee",
    amountCents: 290,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a transaction-processing charge; the base is inflated, category is correct.",
  }),
  item("procfee-test-2", "processing-fee-base-inflation", "test", {
    label: "Card swipe fee",
    declaredCategory: "transaction_fee",
    amountCents: 270,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a card-swipe (processing) fee; the base is inflated, category is correct.",
  }),
  item("procfee-test-3", "processing-fee-base-inflation", "test", {
    label: "Payment handling fee",
    declaredCategory: "transaction_fee",
    amountCents: 310,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a payment-handling (processing) fee; the base is inflated, category is correct.",
  }),

  // ── clean negatives: no drift — declared category is legal and the true
  // category equals it; amount stays within cap. ──────────────────────────────
  item("clean-tune-1", "clean", "tune", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 250, // 12.5% — within the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Clean, unambiguous delivery fee, within cap — no drift of any kind.",
  }),
  item("clean-tune-2", "clean", "tune", {
    label: "Basic listing fee",
    declaredCategory: "basic_service_fee",
    amountCents: 80, // 4% — within the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Clean, unambiguous basic listing fee, within cap — no drift.",
  }),
  item("clean-tune-3", "clean", "tune", {
    label: "Transaction fee",
    declaredCategory: "transaction_fee",
    amountCents: 50, // 2.5% — within the 3% cap
    trueCategory: "transaction_fee",
    rationale: "Clean, unambiguous transaction fee, within cap — no drift.",
  }),
  item("clean-test-1", "clean", "test", {
    label: "Enhanced service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 300, // 15% — within the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "Clean, unambiguous enhanced service fee, within cap — no drift.",
  }),
  item("clean-test-2", "clean", "test", {
    label: "Basic service fee",
    declaredCategory: "basic_service_fee",
    amountCents: 80,
    trueCategory: "basic_service_fee",
    rationale: "Clean, unambiguous basic service fee, within cap — no drift.",
  }),
  item("clean-test-3", "clean", "test", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 240,
    trueCategory: "delivery_fee",
    rationale: "Clean, unambiguous delivery fee, within cap — no drift (a second delivery exemplar for the split).",
  }),
] as const;

/** All strata expected in the gold set: the six §7 classes + "clean". */
export const GOLD_STRATA: readonly GoldStratum[] = [...FEE_LINE_CLASSES, "clean"];

export const FEE_LINES_GOLD_TUNE: readonly FeeLineGoldItem[] = FEE_LINES_GOLD.filter((g) => g.split === "tune");
export const FEE_LINES_GOLD_TEST: readonly FeeLineGoldItem[] = FEE_LINES_GOLD.filter((g) => g.split === "test");
