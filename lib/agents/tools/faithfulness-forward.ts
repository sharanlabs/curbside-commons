/**
 * check_faithfulness_forward — wraps runGatekeeper (lib/agents/gatekeeper.ts).
 *
 * The deterministic claims firewall: every DECLARED claim must trace to a merchant field, the
 * draft must be schema-valid + guardrail-clean, no register leak. Delegation-only (R-TOOL-1):
 * LLM-free, a tool not an agent.
 */
import { z } from "zod";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { GatekeeperReport } from "@/lib/agents/gatekeeper";
import { runGatekeeper } from "@/lib/agents/gatekeeper";
import type { OutreachDraft } from "@/lib/agents/draft";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { GatekeeperReportSchema, MerchantSchema, OutreachDraftSchema } from "./schemas";

export const FaithfulnessForwardInputSchema = z.object({
  draft: OutreachDraftSchema,
  merchant: MerchantSchema,
  platformName: z.string().optional(),
});

export type FaithfulnessForwardInput = z.infer<typeof FaithfulnessForwardInputSchema>;

export const checkFaithfulnessForward: Tool<FaithfulnessForwardInput, GatekeeperReport> = {
  name: "check_faithfulness_forward",
  description:
    "Deterministic forward faithfulness (claim->data): every declared claim must name a " +
    "verifiable merchant field whose value matches. Wraps runGatekeeper().",
  inputSchema: FaithfulnessForwardInputSchema,
  outputSchema: GatekeeperReportSchema,
  run(input: FaithfulnessForwardInput): GatekeeperReport {
    const { draft, merchant, platformName } = FaithfulnessForwardInputSchema.parse(input);
    const report = runGatekeeper(
      draft as OutreachDraft,
      merchant as Merchant,
      platformName ?? REFERENCE_PLATFORM_NAME,
    );
    return GatekeeperReportSchema.parse(report) as GatekeeperReport;
  },
};
