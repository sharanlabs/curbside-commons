import Link from "next/link";
import { getReplaySnapshot, type ReplayMerchant } from "@/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";

function finalState(rm: ReplayMerchant): string {
  if (rm.outreachStatus === "simulated_sent") return "Simulated sent";
  if (rm.outreachStatus === "draft_rejected") return "Rejected";
  if (rm.merchant.review_required) return "Held for review";
  return "Drafted";
}

export default function AuditPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Audit Trail</h1>
      <p className="mt-2 max-w-3xl text-[15px] text-neutral-700">
        <span className="font-medium">In plain terms:</span> every merchant&apos;s decision is recorded —
        what was found, what the gatekeeper said, how the draft scored, and what happened. Nothing is a
        black box.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-neutral-500">
        Run executed deterministically at{" "}
        <span className="font-mono text-neutral-700">{snap.generatedAt}</span> (mode {snap.servedMode}). Open
        a merchant for its full step-by-step trail.
      </p>

      <section className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Merchant</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Triage</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Gatekeeper</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Eval</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Outcome</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Trail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {snap.merchants.map((rm) => (
              <tr key={rm.merchant.merchant_id} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{rm.merchant.merchant_name}</td>
                <td className="px-4 py-2.5 text-[13px] text-neutral-600">
                  {rm.merchant.risk_level} · {rm.merchant.current_blocker_code}
                </td>
                <td className="px-4 py-2.5">
                  <span className={rm.gatekeeper.status === "PASS" ? "text-emerald-600" : "text-amber-600"}>
                    {rm.gatekeeper.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 tabular-nums text-neutral-600">
                  {rm.evalScore.passed}/{rm.evalScore.total}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-neutral-700">{finalState(rm)}</td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/merchant/${rm.merchant.merchant_id}`}
                    className="text-[13px] text-neutral-500 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2"
                  >
                    view ({rm.audit.length} steps)
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
