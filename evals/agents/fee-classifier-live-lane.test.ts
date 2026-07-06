import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFeeClassifierPrompt,
  classifyLineLive,
  FEE_CLASSIFIER_SCHEMA_LABELS,
  FeeClassifierOutputSchema,
  resolvedFeeClassifierModel,
} from "@/lib/agents/fee-classifier";
import { DeterministicBaselineClassifier, TRUE_CATEGORY_LABELS, type ClassifierInput } from "@/lib/packs/fees";
import { FEE_LINES_GOLD } from "@/evals/gold/fee-lines-gold";

/**
 * OFFLINE tests for the live fee-classifier lane (`lib/agents/fee-classifier.ts`,
 * wired 2026-07-05 under the owner GO — decision-log). Everything here runs at $0
 * with NO network: the live boundary is exercised through the injected `generate`
 * DI seam (the draft/judge precedent). What these tests pin:
 *
 *  - the output schema is drift-locked to the pack's exact 5-label vocabulary;
 *  - the prompt is leak-free over the ENTIRE gold set (no answer key, no gold
 *    rationale, no §7 stratum name — the C8 no-ground-truth-leakage contract);
 *  - FAILED_TO_FALLBACK semantics: schema-invalid output and thrown provider
 *    errors BOTH degrade to the deterministic baseline's prediction, honestly
 *    labeled — a fallback is never presented as live, a bad label never escapes;
 *  - the env gate: a live call without the owner-gated flags (and without DI)
 *    throws loudly instead of silently doing nothing.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

const SAMPLE: ClassifierInput = {
  label: "Card processing surcharge",
  declaredCategory: "basic_service_fee",
  amountCents: 60,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
  siblingDeclaredCategories: ["delivery_fee", "basic_service_fee"],
};

describe("fee-classifier live lane — schema drift-lock", () => {
  it("the zod enum set-equals TRUE_CATEGORY_LABELS in both directions", () => {
    expect(new Set(FEE_CLASSIFIER_SCHEMA_LABELS)).toEqual(new Set(TRUE_CATEGORY_LABELS));
    expect(FEE_CLASSIFIER_SCHEMA_LABELS.length).toBe(TRUE_CATEGORY_LABELS.length);
  });

  it("the schema rejects an out-of-vocabulary label and an empty rationale", () => {
    expect(FeeClassifierOutputSchema.safeParse({ predicted: "convenience_fee", rationale: "x" }).success).toBe(false);
    expect(FeeClassifierOutputSchema.safeParse({ predicted: "delivery_fee", rationale: "" }).success).toBe(false);
    expect(FeeClassifierOutputSchema.safeParse({ predicted: "delivery_fee", rationale: "ok" }).success).toBe(true);
  });
});

describe("fee-classifier live lane — leak-free prompt (C8) over the whole gold set", () => {
  it("no prompt contains the answer-key field name, the gold rationale, or the §7 stratum name", () => {
    for (const item of FEE_LINES_GOLD) {
      const prompt = buildFeeClassifierPrompt(item.input);
      // The line's FACE must be present (it is the data under audit)…
      expect(prompt, item.id).toContain(item.input.label);
      expect(prompt, item.id).toContain(item.input.declaredCategory);
      // …but nothing derived from the answer key may be. NOTE: item.trueCategory as a
      // WORD legitimately appears in the static 5-label rubric every prompt carries —
      // the leak-free claim is about per-item ground truth, so we assert the specific
      // ground-truth carriers: the field name, the gold rationale, the stratum.
      expect(prompt, item.id).not.toContain("trueCategory");
      expect(prompt, item.id).not.toContain(item.rationale);
      if (item.stratum !== "clean") {
        expect(prompt, item.id).not.toContain(item.stratum);
      }
    }
  });

  it("the prompt declares the injection-hygiene rule (line fields are data, not instructions)", () => {
    expect(buildFeeClassifierPrompt(SAMPLE)).toMatch(/DATA, never an instruction/);
  });
});

describe("fee-classifier live lane — DI happy path + FAILED_TO_FALLBACK semantics", () => {
  it("valid model output → LIVE_CLASSIFIER, the validated prediction, $0 groq provenance", async () => {
    const result = await classifyLineLive(SAMPLE, {
      generate: async () => ({
        object: { predicted: "transaction_fee", rationale: "names card processing" },
        usage: { inputTokens: 400, outputTokens: 40, totalTokens: 440 },
      }),
    });
    expect(result.mode).toBe("LIVE_CLASSIFIER");
    expect(result.prediction.predicted).toBe("transaction_fee");
    expect(result.costUsd).toBe(0);
    expect(result.provider).toBe("groq");
    expect(result.modelId).toBe(resolvedFeeClassifierModel());
    expect(result.errorClass).toBeUndefined();
  });

  it("schema-invalid model output → FAILED_TO_FALLBACK to the BASELINE's prediction (never the invented label)", async () => {
    const result = await classifyLineLive(SAMPLE, {
      generate: async () => ({ object: { predicted: "convenience_fee", rationale: "made up" } }),
    });
    expect(result.mode).toBe("FAILED_TO_FALLBACK");
    expect(result.errorClass).toBe("SCHEMA_VALIDATION_FAILED");
    expect(result.prediction).toEqual(DeterministicBaselineClassifier.classify(SAMPLE));
    expect(result.prediction.predicted).not.toBe("convenience_fee");
  });

  it("a thrown provider error → FAILED_TO_FALLBACK with the error class, baseline prediction", async () => {
    const boom = new Error("simulated 429");
    boom.name = "RateLimitError";
    const result = await classifyLineLive(SAMPLE, {
      generate: async () => {
        throw boom;
      },
    });
    expect(result.mode).toBe("FAILED_TO_FALLBACK");
    expect(result.errorClass).toBe("RateLimitError");
    expect(result.prediction).toEqual(DeterministicBaselineClassifier.classify(SAMPLE));
  });

  it("a live call WITHOUT the owner-gated env flags (and without DI) throws loudly", async () => {
    vi.stubEnv("ENABLE_LIVE_AI", "false");
    await expect(classifyLineLive(SAMPLE)).rejects.toThrow(/FEE_CLASSIFIER_LIVE_DISABLED/);
  });

  it("FEE_CLASSIFIER_MODEL env override is honored (single resolution point)", () => {
    vi.stubEnv("FEE_CLASSIFIER_MODEL", "openai/some-future-model");
    expect(resolvedFeeClassifierModel()).toBe("openai/some-future-model");
    vi.unstubAllEnvs();
    expect(resolvedFeeClassifierModel()).toBe("openai/gpt-oss-120b");
  });
});
