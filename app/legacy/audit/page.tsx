import type { Metadata } from "next";
import Link from "next/link";
import { getReplaySnapshot, type ReplayMerchant } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";
import { dejargon } from "@/lib/legacy/display";
import { Mark } from "@/components/data-surfaces/Mark";

export const metadata: Metadata = { title: "Audit" };

function finalState(rm: ReplayMerchant): string {
  if (rm.outreachStatus === "simulated_sent") return "Marked sent";
  if (rm.outreachStatus === "draft_rejected") return "Rejected";
  if (rm.merchant.review_required) return "Held for review";
  return "Drafted";
}

export default function AuditPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);

  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Audit Trail</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> every merchant&apos;s decision is recorded — what was found, what the
        gatekeeper said, how the draft scored, and what happened. No black boxes.
      </p>
      <p className="ds-runline">
        Run executed deterministically at{" "}
        <span className="ds-mono" style={{ color: "var(--ink-2)" }}>
          {snap.generatedAt}
        </span>{" "}
        (mode {dejargon(snap.servedMode)}). Open a merchant for its full step-by-step trail.
      </p>

      <section style={{ marginTop: "22px" }}>
        <div className="ds-tbl" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Merchant</th>
                <th scope="col">Triage</th>
                <th scope="col">Gatekeeper</th>
                <th scope="col">Eval</th>
                <th scope="col">Outcome</th>
                <th scope="col">Trail</th>
              </tr>
            </thead>
            <tbody>
              {snap.merchants.map((rm) => (
                <tr key={rm.merchant.merchant_id}>
                  <td style={{ fontWeight: 550, color: "var(--ink)" }}>{rm.merchant.merchant_name}</td>
                  <td className="ds-mono" style={{ fontSize: "12px" }}>
                    {rm.merchant.risk_level} · {rm.merchant.current_blocker_code}
                  </td>
                  <td>
                    <span className={rm.gatekeeper.status === "PASS" ? "ds-verdict ok" : "ds-verdict warn"}>
                      <Mark name={rm.gatekeeper.status === "PASS" ? "check" : "flag"} />
                      {rm.gatekeeper.status}
                    </span>
                  </td>
                  <td className="ds-mono">
                    {rm.evalScore.passed}/{rm.evalScore.total}
                  </td>
                  <td>{finalState(rm)}</td>
                  <td>
                    <Link
                      href={`/legacy/merchant/${rm.merchant.merchant_id}`}
                      className="ds-mlink"
                      style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--muted)" }}
                    >
                      view ({rm.audit.length} steps)
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
