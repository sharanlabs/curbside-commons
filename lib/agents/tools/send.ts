/**
 * simulate_send — wraps computeSendEligible + idempotencyKey (lib/core/pipeline.ts).
 *
 * Mirrors runCore's send loop EXACTLY (lib/core/pipeline.ts:259-268): given a POST-DRAFT merchant,
 * if it is send-eligible AND already "drafted", it transitions to "simulated_sent" with a derived
 * idempotency key; otherwise it returns the computed eligibility unchanged. Delegation-only
 * (R-TOOL-1) — the only two functions called are computeSendEligible + idempotencyKey; all the
 * branching mirrors core verbatim and adds no new rule.
 *
 * NOTE: the tool reports the send TRANSITION; the caller applies it back to the merchant record
 * (exactly as runCore mutates the row in its send loop). last_outreach_at is already AS_OF_DATE on
 * a "drafted" row, so a sent row keeps it — no separate field is returned (matches core).
 */
import { computeSendEligible, idempotencyKey } from "@/lib/core/pipeline";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { MerchantSchema, SimulateSendOutputSchema } from "./schemas";

export type SimulateSendOutput = {
  send_eligible: boolean;
  idempotency_key: string;
  outreach_status: Merchant["outreach_status"];
};

export const simulateSend: Tool<Merchant, SimulateSendOutput> = {
  name: "simulate_send",
  description:
    "Deterministic idempotent simulated send: for a send-eligible, already-drafted merchant, " +
    "transition to simulated_sent with an idempotency key; else report computed eligibility " +
    "unchanged. Wraps computeSendEligible + idempotencyKey (mirrors runCore's send loop).",
  inputSchema: MerchantSchema,
  outputSchema: SimulateSendOutputSchema,
  run(input: Merchant): SimulateSendOutput {
    const m = MerchantSchema.parse(input) as Merchant;
    const eligible = computeSendEligible(m.contact_eligible, m.review_required, m.approval_state);
    if (eligible && m.outreach_status === "drafted") {
      return SimulateSendOutputSchema.parse({
        send_eligible: true,
        idempotency_key: idempotencyKey(m.merchant_id, m.current_blocker_code),
        outreach_status: "simulated_sent",
      }) as SimulateSendOutput;
    }
    // Already-sent (a retry/resume or a second call): PRESERVE the idempotency key — clearing it would
    // erase the duplicate-send guard a caller relies on when applying a "simulated_sent" transition
    // (Codex A1 P2). Recompute deterministically if somehow absent. Otherwise (drafted/rejected/none)
    // no key exists yet -> "".
    const idempotency_key =
      m.outreach_status === "simulated_sent"
        ? m.idempotency_key || idempotencyKey(m.merchant_id, m.current_blocker_code)
        : "";
    return SimulateSendOutputSchema.parse({
      send_eligible: eligible,
      idempotency_key,
      outreach_status: m.outreach_status,
    }) as SimulateSendOutput;
  },
};
