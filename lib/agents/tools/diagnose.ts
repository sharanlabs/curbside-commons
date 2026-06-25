/**
 * diagnose_blocker — wraps diagnose (lib/domain/diagnosis.ts).
 *
 * Delegation-only (R-TOOL-1): engagement-state + root-cause hypothesis + routed reactivation
 * play for one merchant. No logic of its own.
 */
import type { Diagnosis } from "@/lib/domain/diagnosis";
import { diagnose } from "@/lib/domain/diagnosis";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { DiagnosisSchema, MerchantSchema } from "./schemas";

export const diagnoseBlocker: Tool<Merchant, Diagnosis> = {
  name: "diagnose_blocker",
  description:
    "Deterministic blocker diagnosis: engagement state + root-cause hypothesis + a routed " +
    "reactivation play. Wraps diagnose().",
  inputSchema: MerchantSchema,
  outputSchema: DiagnosisSchema,
  run(input: Merchant): Diagnosis {
    const merchant = MerchantSchema.parse(input) as Merchant;
    return DiagnosisSchema.parse(diagnose(merchant)) as Diagnosis;
  },
};
