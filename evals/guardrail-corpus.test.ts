/**
 * Guardrail regression corpus — locks the TS core guardrail to the Python oracle's 45 cases
 * (eval/guardrail_regression.v1.json, which validated "GUARDRAIL 45/45" on the Python side).
 * Previously only ~5 inline cases exercised the TS guardrail; this is the missing regression lock
 * (evals-specialist root-cause finding). Tests the CORE guardrail (scanText + runGuardrail) — the
 * faithful Python port — not the product-tier precision refinement.
 */
import { describe, it, expect } from "vitest";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import { runGuardrail, scanText } from "@/lib/core/guardrail";
import { makeDraft, normalizeRow } from "@/lib/core/pipeline";
import type { MerchantInput } from "@/lib/core/types";
import corpus from "@/eval/guardrail_regression.v1.json";

interface Case {
  case_id: string;
  kind: string;
  category: string;
  text?: string | null;
  expect_flags: string[];
  merchant_context?: { steps_completed?: number; merchant_name?: string } | null;
  draft_overrides?: { next_best_action?: string };
}

const cases = corpus.cases as Case[];
const textCases = cases.filter((c) => c.kind !== "structural_positive" && typeof c.text === "string");

// GR-POS-009 stores a PLACEHOLDER, not a literal secret (RULES §11 — no contiguous sk_live in the
// repo). The Python eval substitutes the real assignment-form text at runtime; replicate it here,
// assembled from fragments the same way (scripts/eval.py REGRESSION_TEXT_SENTINELS).
const SENTINELS: Record<string, string> = {
  ["__" + "REGRESSION_PII_API_KEY_ASSIGNMENT" + "__"]:
    "Use " + "api" + "_" + "key" + "=" + "sk" + "_" + "live" + "_" + "abcdefghijklmnop" + " to connect.",
};
const resolveText = (c: Case): string => SENTINELS[c.text as string] ?? (c.text as string);

describe("guardrail regression corpus (45) — TS core matches the Python oracle", () => {
  it("covers all 45 cases", () => {
    expect(cases.length).toBe(45);
  });

  it.each(textCases.map((c) => [c.case_id, c] as const))(
    "%s: scanText flags match the oracle",
    (_id, c) => {
      const flags = scanText(resolveText(c), REFERENCE_PLATFORM_NAME);
      if (c.expect_flags.length === 0) {
        // clean cases (near-miss, the 20 real source nudges, stub templates): NO over-flagging.
        expect(flags).toEqual([]);
      } else {
        // positive cases: the oracle's expected category is detected. (A stricter text can trip more
        // than one forbidden pattern, e.g. "30% more orders" -> revenue + metric; the oracle asserts
        // the primary category, so we assert containment, not an exact set.)
        expect(flags).toEqual(expect.arrayContaining(c.expect_flags));
      }
    },
  );

  // stub_clean cases (text=null): reconstruct the merchant, build the DETERMINISTIC stub draft, and
  // assert it is guardrail-clean — exactly as scripts/eval.py does (so all 45 cases actually run).
  const stubCleanCases = cases.filter((c) => c.kind === "stub_clean");
  it.each(stubCleanCases.map((c) => [c.case_id, c] as const))(
    "%s: the deterministic stub draft is guardrail-clean",
    (_id, c) => {
      const ctx = c.merchant_context ?? {};
      const merchant = normalizeRow(
        {
          merchant_name: ctx.merchant_name ?? "Stub Co",
          merchant_category: "Restaurant",
          days_since_signup: 10,
          last_login_days_ago: 3,
          steps_completed: ctx.steps_completed ?? 0,
          source_risk_level: "Low",
        },
        1,
      );
      const draft = makeDraft(merchant, REFERENCE_PLATFORM_NAME);
      expect(runGuardrail(draft, merchant, REFERENCE_PLATFORM_NAME)).toEqual(c.expect_flags);
    },
  );

  it("every case is exercised (text/stub/structural), not just counted", () => {
    expect(textCases.length + stubCleanCases.length + 1).toBe(45);
  });

  it("structural state_mismatch case (action override) flags state_mismatch", () => {
    const c = cases.find((x) => x.kind === "structural_positive");
    expect(c).toBeTruthy();
    const steps = c?.merchant_context?.steps_completed ?? 2;
    const input: MerchantInput = {
      merchant_name: "Struct Co",
      merchant_category: "Restaurant",
      days_since_signup: 10,
      last_login_days_ago: 3,
      steps_completed: steps,
      source_risk_level: "Low",
    };
    const merchant = normalizeRow(input, 1);
    const draft = makeDraft(merchant, REFERENCE_PLATFORM_NAME);
    if (c?.draft_overrides?.next_best_action) draft.next_best_action = c.draft_overrides.next_best_action;
    expect(runGuardrail(draft, merchant, REFERENCE_PLATFORM_NAME)).toContain("state_mismatch");
  });
});
