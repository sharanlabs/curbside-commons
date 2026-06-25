/**
 * triage_merchant — wraps normalizeRow + validateMerchantRow (lib/core/pipeline.ts).
 *
 * Delegation-only (R-TOOL-1): mirrors exactly what runCore does per row — normalize at the
 * 1-based row index, validate, and throw on any validation error (so merchant_id=M00x +
 * source_row_index match the oracle). No business logic of its own.
 */
import { z } from "zod";
import { normalizeRow, validateMerchantRow } from "@/lib/core/pipeline";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { MerchantInputSchema, MerchantSchema } from "./schemas";

/** Input: the 1-based row index + the MerchantInput + optional approvals (mirrors runCore args). */
export const TriageInputSchema = z.object({
  index: z.number().int().positive(),
  row: MerchantInputSchema,
  approvals: z.record(z.string(), z.string()).optional(),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;

export const triageMerchant: Tool<TriageInput, Merchant> = {
  name: "triage_merchant",
  description:
    "Deterministic triage: normalize a raw merchant row at its 1-based index and validate it. " +
    "Wraps normalizeRow + validateMerchantRow; throws if validation fails.",
  inputSchema: TriageInputSchema,
  outputSchema: MerchantSchema,
  run(input: TriageInput): Merchant {
    const { index, row, approvals } = TriageInputSchema.parse(input);
    const merchant = normalizeRow(row, index, approvals ?? {});
    const errors = validateMerchantRow(merchant);
    if (errors.length) {
      throw new Error(`row ${index} (${merchant.merchant_id}) failed validation: ${errors.join(",")}`);
    }
    return MerchantSchema.parse(merchant) as Merchant;
  },
};
