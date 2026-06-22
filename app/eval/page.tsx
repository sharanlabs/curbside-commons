import Link from "next/link";
import { getReplaySnapshot } from "@/lib/replay/run";
import { liveSamples } from "@/lib/replay/live-samples";
import { PLATFORM_NAME } from "@/lib/product";

const DIMS = ["structure", "state-consistency", "policy", "no-leakage"] as const;

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
        human ever sees it — is it well-formed, do its declared claims all check out against this
        merchant&apos;s data, and does it avoid forbidden promises?
      </p>
      <p className="mt-2 max-w-3xl text-sm text-neutral-500">
        <span className="font-medium text-neutral-600">Technically:</span> deterministic graders over the
        draft contract (structure · state-consistency · policy · no-leakage). They share the gate&apos;s rule
        definitions; their teeth are proven by paired corrupted-record tests (a grader that can&apos;t
        fail is theater) — including on the recorded real-Gemini drafts, where no-leakage catches a raw
        enum / risk-level leak the other dimensions missed.
      </p>
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800">
        These corpus scores grade the <span className="font-semibold">deterministic stub</span> output. The
        same graders also scored a <span className="font-semibold">recorded real Gemini run</span> — shown
        below (key-gated, $0.0042 spent) — so this stays honest about real output. The public{" "}
        <span className="font-semibold">demo itself makes no live calls</span>.
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-neutral-900">
          Recorded Gemini run — static fixture{" "}
          <span className="font-normal text-neutral-500">
            ({liveSamples.provenance.model}, {liveSamples.provenance.recorded_at})
          </span>
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] text-neutral-600">
          A <span className="font-medium">frozen recording</span> of a local Gemini API run (one merchant per
          blocker). The public demo does <span className="font-medium">not</span> re-run or independently
          verify it (REPLAY-only, zero spend) — reproduce it yourself with your own key:{" "}
          <code className="rounded bg-neutral-100 px-1 text-[11px]">node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts</code>.
          Total cost: <span className="tabular-nums">${liveSamples.provenance.total_cost_usd.toFixed(4)}</span>{" "}
          (cap $5). Modes: {Object.entries(liveSamples.provenance.modes).map(([k, v]) => `${v} ${k}`).join(" · ")}.
          Gate: {Object.entries(liveSamples.provenance.gate).map(([k, v]) => `${v} ${k}`).join(" · ")}.
        </p>

        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            What the live run showed (honest)
          </div>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-[12px] text-neutral-700">
            {liveSamples.provenance.honest_findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Blocker</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Mode</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Gate</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Eval</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {liveSamples.rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 text-[13px] text-neutral-700">{r.blocker}</td>
                  <td className="px-4 py-2.5 text-[12px] font-mono text-neutral-600">{r.mode}</td>
                  <td className="px-4 py-2.5 text-[13px] text-neutral-600">{r.gatekeeper}</td>
                  <td className="px-4 py-2.5 tabular-nums text-neutral-600">{r.eval}</td>
                  <td className="px-4 py-2.5 tabular-nums text-neutral-500">${r.costUsd.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
