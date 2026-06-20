import Link from "next/link";
import { getReplaySnapshot } from "@/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";

const DIMS = ["structure", "state-consistency", "policy"] as const;

export default function EvalPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const dimStats = DIMS.map((dim) => ({
    dim,
    passed: snap.merchants.filter((m) => m.evalScore.results.find((r) => r.grader === dim)?.pass).length,
    total: snap.merchants.length,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Eval / Quality</h1>
      <p className="mt-2 max-w-3xl text-[15px] text-neutral-700">
        <span className="font-medium">In plain terms:</span> every drafted message is scored before a
        human ever sees it — is it well-formed, does it only say things that are true for this merchant,
        and does it avoid forbidden promises?
      </p>
      <p className="mt-2 max-w-3xl text-sm text-neutral-500">
        <span className="font-medium text-neutral-600">Technically:</span> deterministic graders over the
        draft contract (structure · state-consistency · policy). They share the gate&apos;s rule
        definitions; their teeth are proven by paired corrupted-record tests (a grader that can&apos;t
        fail is theater).
      </p>
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800">
        These scores grade the <span className="font-semibold">deterministic stub</span> output. Scoring the{" "}
        <span className="font-semibold">real Gemini</span> output + capturing an authentic caught failure is
        the Phase-B step (key-gated, &lt; $5) — not staged here.
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="text-2xl font-semibold tabular-nums">
            {snap.summary.evalPassed}/{snap.summary.evalTotal}
          </div>
          <div className="mt-0.5 text-xs font-medium text-neutral-500">drafts pass all dimensions</div>
        </div>
        {dimStats.map((d) => (
          <div key={d.dim} className="rounded-lg border border-neutral-200 px-4 py-3">
            <div className="text-2xl font-semibold tabular-nums">
              {d.passed}/{d.total}
            </div>
            <div className="mt-0.5 text-xs font-medium text-neutral-500">{d.dim}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Merchant</th>
              {DIMS.map((d) => (
                <th key={d} scope="col" className="px-4 py-2.5 font-medium">{d}</th>
              ))}
              <th scope="col" className="px-4 py-2.5 font-medium">Overall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {snap.merchants.map((m) => (
              <tr key={m.merchant.merchant_id} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/merchant/${m.merchant.merchant_id}`}
                    className="font-medium text-neutral-900 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2"
                  >
                    {m.merchant.merchant_name}
                  </Link>
                </td>
                {DIMS.map((d) => {
                  const r = m.evalScore.results.find((x) => x.grader === d);
                  return (
                    <td key={d} className="px-4 py-2.5">
                      <span className={r?.pass ? "text-emerald-600" : "text-red-600"}>
                        {r?.pass ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 tabular-nums text-neutral-600">
                  {m.evalScore.passed}/{m.evalScore.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
