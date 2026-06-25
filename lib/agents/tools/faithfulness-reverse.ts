/**
 * check_faithfulness_reverse — wraps the MOCK semantic judge mockJudgeResult
 * (lib/agents/semantic-judge.ts).
 *
 * OFFLINE + deterministic (R-TOOL-6): this A1 tool wraps the deterministic mock judge, NOT the
 * live cross-family Groq judge. A1 makes ZERO live calls — the live reverse-faithfulness path is
 * A2. The mock is a keyword heuristic giving the Faithfulness panel real structure at $0; its
 * real detection power is the separate, still-pending live calibration, not an A1 claim.
 * Delegation-only (R-TOOL-1).
 */
import { z } from "zod";
import type { JudgeResult } from "@/lib/agents/semantic-judge";
import { mockJudgeResult } from "@/lib/agents/semantic-judge";
import type { OutreachDraft } from "@/lib/agents/draft";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { JudgeResultSchema, MerchantSchema, OutreachDraftSchema } from "./schemas";

export const FaithfulnessReverseInputSchema = z.object({
  draft: OutreachDraftSchema,
  merchant: MerchantSchema,
});

export type FaithfulnessReverseInput = z.infer<typeof FaithfulnessReverseInputSchema>;

export const checkFaithfulnessReverse: Tool<FaithfulnessReverseInput, JudgeResult> = {
  name: "check_faithfulness_reverse",
  description:
    "Deterministic reverse faithfulness (prose->data): the OFFLINE mock semantic judge — " +
    "per-claim entailment of the draft prose against the merchant data row. Wraps mockJudgeResult() " +
    "(NOT the live judge; A1 makes zero live calls).",
  inputSchema: FaithfulnessReverseInputSchema,
  outputSchema: JudgeResultSchema,
  run(input: FaithfulnessReverseInput): JudgeResult {
    const { draft, merchant } = FaithfulnessReverseInputSchema.parse(input);
    const result = mockJudgeResult(draft as OutreachDraft, merchant as Merchant);
    return JudgeResultSchema.parse(result) as JudgeResult;
  },
};
