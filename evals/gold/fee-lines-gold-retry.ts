/**
 * FRESH HELD-OUT RETRY SPLIT for the F1b fee line-item classifier — the
 * owner-armed 2026-07-08 recalibration (decision-log 2026-07-08 complete-all row,
 * commit `eb34bb0`; pre-registration `docs/fee-classifier-recalibration-status.md`).
 *
 * WHY THIS FILE EXISTS: the original held-out split (`fee-lines-gold.ts`, split
 * "test") was EXPOSED by the 2026-07-05 scored run (its status doc pins the
 * no-re-run rule: that split is never re-scorable). A retry therefore requires a
 * NEW, never-scored held-out set. These 21 items are it.
 *
 * CONSTRUCTION RULE (no-rigged-exam; pre-registered): each item MIRRORS the
 * original test split item-for-item — same stratum, same declared→true category
 * mapping, same per-label denominators (delivery 4 · basic 3 · transaction 4 ·
 * enhanced 4 · not-a-permitted-fee 6), analogous amount tiers, and an analogous
 * keyword-signal profile — with NEW label wordings disjoint from all 42 existing
 * labels. The deterministic baseline is re-measured mechanically on this split and
 * PINNED before the live run; the accuracy floor is the STRICTER of the absolute
 * ≥20/21 bar and strictly-beat-the-new-pin, so the mirroring can only hold or
 * raise the bar, never lower it.
 *
 * HONESTY (AM-7 / C8): every label text is SYNTHETIC/simulated. Small + synthetic
 * bounds the claim exactly as the original gold set's header states.
 */
import {
  NOT_A_PERMITTED_FEE,
  type DeclaredCategory,
  type TrueCategoryLabel,
} from "@/lib/packs/fees";
import type { FeeLineGoldItem, GoldStratum } from "@/evals/gold/fee-lines-gold";

function retryItem(
  id: string,
  stratum: GoldStratum,
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
    split: "test",
    input: {
      label: opts.label,
      declaredCategory: opts.declaredCategory,
      amountCents: opts.amountCents,
      orderPurchasePriceCents: opts.orderPurchasePriceCents ?? 2000,
      isRefund: false,
      passthroughDocumented: false,
      siblingDeclaredCategories:
        opts.siblingDeclaredCategories ??
        (["delivery_fee", "basic_service_fee", "transaction_fee", "enhanced_service_fee"] as const),
    },
    trueCategory: opts.trueCategory,
    rationale: opts.rationale,
  };
}

export const FEE_LINES_GOLD_RETRY: readonly FeeLineGoldItem[] = [
  // ── over-cap: true == declared (drift is the AMOUNT). Mirrors overcap-test-1..3. ──
  retryItem("overcap-retry-1", "over-cap", {
    label: "Doorstep delivery charge",
    declaredCategory: "delivery_fee",
    amountCents: 470, // 23.5% of 2000 — over the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Doorstep wording still names delivery; over cap by amount only.",
  }),
  retryItem("overcap-retry-2", "over-cap", {
    label: "Listing & catalog fee",
    declaredCategory: "basic_service_fee",
    amountCents: 190, // 9.5% — over the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Listing/catalog wording names the basic-service tier; over cap by amount only.",
  }),
  retryItem("overcap-retry-3", "over-cap", {
    label: "Enhanced advertising service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 640, // 32% — over the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "'Enhanced' wording names the enhanced tier; over cap by amount only.",
  }),

  // ── misclassification: true ≠ declared. Mirrors misclass-test-1..3 mappings. ──
  retryItem("misclass-retry-1", "misclassification", {
    label: "Featured placement fee",
    declaredCategory: "delivery_fee",
    amountCents: 135,
    trueCategory: "enhanced_service_fee",
    rationale: "'Featured placement' is a marketing/visibility extra booked under delivery_fee.",
  }),
  retryItem("misclass-retry-2", "misclassification", {
    label: "Card network charge",
    declaredCategory: "enhanced_service_fee",
    amountCents: 58,
    trueCategory: "transaction_fee",
    rationale: "A card-network charge booked under enhanced_service_fee; it is truly a transaction fee.",
  }),
  retryItem("misclass-retry-3", "misclassification", {
    label: "Express courier fee",
    declaredCategory: "basic_service_fee",
    amountCents: 255,
    trueCategory: "delivery_fee",
    rationale: "A courier/delivery charge booked under basic_service_fee; it is truly a delivery fee.",
  }),

  // ── relabeling: re-declared across periods. Mirrors relabel-test-1..3 mappings. ──
  retryItem("relabel-retry-1", "relabeling", {
    label: "Basic listing charge",
    declaredCategory: "transaction_fee",
    amountCents: 68,
    trueCategory: "basic_service_fee",
    rationale: "A basic-listing charge re-declared under transaction_fee.",
  }),
  retryItem("relabel-retry-2", "relabeling", {
    label: "Service & delivery upgrade fee",
    declaredCategory: "delivery_fee",
    amountCents: 150,
    trueCategory: "enhanced_service_fee",
    rationale: "An upgraded (enhanced-tier) service charge kept under the delivery_fee label across periods.",
  }),
  retryItem("relabel-retry-3", "relabeling", {
    label: "Regular delivery fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 235,
    trueCategory: "delivery_fee",
    rationale: "'Regular delivery' is a genuine delivery charge re-declared as enhanced_service_fee.",
  }),

  // ── bundling: true = not-a-permitted-fee. Mirrors bundle-test-1..3 signals. ──
  retryItem("bundle-retry-1", "bundling", {
    label: "Bundled platform charge",
    declaredCategory: "transaction_fee",
    amountCents: 95,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Generic 'bundled' wording signals a lumped, non-single-category charge.",
  }),
  retryItem("bundle-retry-2", "bundling", {
    label: "Delivery & advertising combo fee",
    declaredCategory: "basic_service_fee",
    amountCents: 315,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps delivery and advertising into one line — no single permitted category applies.",
  }),
  retryItem("bundle-retry-3", "bundling", {
    label: "All-inclusive bundled fee",
    declaredCategory: "delivery_fee",
    amountCents: 355,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'All-inclusive bundled' signals multiple charges lumped into one line.",
  }),

  // ── promotion-deduction-mischaracterization: true = not-a-permitted-fee. ──
  retryItem("promo-retry-1", "promotion-deduction-mischaracterization", {
    label: "Ad promo deduction",
    declaredCategory: "transaction_fee",
    amountCents: 92,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "An ad-promo deduction dressed as a transaction fee — not a permitted fee category.",
  }),
  retryItem("promo-retry-2", "promotion-deduction-mischaracterization", {
    label: "Promotional credit adjustment",
    declaredCategory: "delivery_fee",
    amountCents: 122,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A promotional credit adjustment dressed as delivery — not a permitted fee category.",
  }),
  retryItem("promo-retry-3", "promotion-deduction-mischaracterization", {
    label: "Promo spend recovery",
    declaredCategory: "basic_service_fee",
    amountCents: 108,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'Promo spend recovery' dressed as a basic service fee — not a permitted fee category.",
  }),

  // ── processing-fee-base-inflation: true = transaction_fee (inflated amount). ──
  retryItem("procfee-retry-1", "processing-fee-base-inflation", {
    label: "Card settlement fee",
    declaredCategory: "transaction_fee",
    amountCents: 295, // 14.75% — far over the 3% cap
    trueCategory: "transaction_fee",
    rationale: "Genuinely a card-settlement (processing) fee; the base is inflated, category is correct.",
  }),
  retryItem("procfee-retry-2", "processing-fee-base-inflation", {
    label: "Payment authorization fee",
    declaredCategory: "transaction_fee",
    amountCents: 275,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a payment-authorization (processing) fee; the base is inflated, category is correct.",
  }),
  retryItem("procfee-retry-3", "processing-fee-base-inflation", {
    label: "Interchange processing charge",
    declaredCategory: "transaction_fee",
    amountCents: 315,
    trueCategory: "transaction_fee",
    rationale: "Genuinely an interchange/processing charge; the base is inflated, category is correct.",
  }),

  // ── clean negatives: no drift; within cap. Mirrors clean-test-1..3 categories. ──
  retryItem("clean-retry-1", "clean", {
    label: "Enhanced tier service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 320, // 16% — within the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "Clean, unambiguous enhanced-tier service fee, within cap — no drift.",
  }),
  retryItem("clean-retry-2", "clean", {
    label: "Basic platform service fee",
    declaredCategory: "basic_service_fee",
    amountCents: 90, // 4.5% — within the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Clean, unambiguous basic service fee, within cap — no drift.",
  }),
  retryItem("clean-retry-3", "clean", {
    label: "Local delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 260, // 13% — within the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Clean, unambiguous delivery fee, within cap — no drift.",
  }),
] as const;
