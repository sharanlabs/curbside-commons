/**
 * Ledger -> eval-candidate stubs (pure). A verified ledger records how real
 * (replayed) runs ended: signed (a human approved or rejected), withdrawn, or
 * expired. Each such line can seed a CANDIDATE eval case. A candidate is a stub:
 * it names its source line and disposition and says plainly that no expected
 * verdict has been authored; it is never a gold case and never joins an exposed
 * split (the script writes them into a NEW folder the caller names).
 *
 * Refuses a ledger that does not verify: candidates from a tampered history
 * would launder it into the test corpus.
 */
import { parseLines, verify, type LedgerEntry } from "./chain.ts";

export type Disposition = "signed" | "withdrawn" | "expired";

export interface CandidateStub {
  readonly candidate: true;
  readonly source: { readonly runId: string; readonly seq: number; readonly scenarioId: string | null; readonly inputsHash: string };
  readonly disposition: Disposition;
  readonly approvalDecision: string;
  readonly route: string | null;
  readonly recommendations: readonly unknown[];
  readonly status: string;
}

/** The ledger's `approval.decision` string -> a disposition, or null for anything else. */
export function dispositionOf(decision: string): Disposition | null {
  if (decision === "approve" || decision === "reject") return "signed";
  if (decision === "withdrawn") return "withdrawn";
  if (decision === "expired") return "expired";
  return null;
}

export function candidatesFromLedger(text: string): CandidateStub[] {
  const v = verify(text);
  if (!v.ok) throw new Error(`candidates: ledger does not verify (seq ${v.failedAtSeq}: ${v.reason})`);
  const out: CandidateStub[] = [];
  for (const e of parseLines(text) as LedgerEntry[]) {
    if (e.approval === null) continue;
    const disposition = dispositionOf(e.approval.decision);
    if (disposition === null) continue;
    out.push({
      candidate: true,
      source: { runId: e.runId, seq: e.seq, scenarioId: e.scenarioId, inputsHash: e.inputsHash },
      disposition,
      approvalDecision: e.approval.decision,
      route: e.route,
      recommendations: e.recommendations,
      status: "STUB: no expected verdict authored; a human writes it before this joins any split",
    });
  }
  return out;
}
