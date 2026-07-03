/**
 * append_audit — a thin STRUCTURAL append (R-TOOL-4).
 *
 * Accepts any schema-valid AuditEntry and appends it to the running log, returning the new log.
 * Its acceptance is STRUCTURAL (schema-valid + order-preserving), NOT a differential parity test.
 * It does NOT reuse the private buildAudit (which emits the fixed 6-entry REPLAY audit); the rich
 * trajectory recorder is A2 infrastructure (R-LOOP-6), not this tool.
 *
 * I/O envelope decision: the registry table lists the tool's payload as a single AuditEntry. To
 * keep the append PURE + order-preserving + testable (no hidden cross-call state), the input is the
 * envelope { log, entry } and the output is [...log, entry]. `entry` is exactly AuditEntrySchema, so
 * "accepts any schema-valid AuditEntry" stays literally true.
 */
import { z } from "zod";
import type { AuditEntry } from "@/legacy/activation/lib/replay/run";
import type { Tool } from "./registry";
import { AuditEntrySchema, AuditLogSchema } from "./schemas";

export const AppendAuditInputSchema = z.object({
  log: AuditLogSchema,
  entry: AuditEntrySchema,
});

export type AppendAuditInput = z.infer<typeof AppendAuditInputSchema>;

export const appendAudit: Tool<AppendAuditInput, AuditEntry[]> = {
  name: "append_audit",
  description:
    "Structural, order-preserving append: take a running audit log + one schema-valid AuditEntry " +
    "and return the log with the entry appended.",
  inputSchema: AppendAuditInputSchema,
  outputSchema: AuditLogSchema,
  run(input: AppendAuditInput): AuditEntry[] {
    const { log, entry } = AppendAuditInputSchema.parse(input);
    return AuditLogSchema.parse([...log, entry]) as AuditEntry[];
  },
};
