import { getReplaySnapshot } from "@/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";
import { GEMINI_PRICING, PRICING_VERSION } from "@/lib/agents/pricing";
import { DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";

export default function CostPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const led = snap.costLedger;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Cost ledger</h1>
      <p className="mt-2 max-w-3xl text-[15px] text-neutral-700">
        <span className="font-medium">In plain terms:</span> the AI can never quietly run up a bill. Spend
        is computed from real reported tokens against a pinned price list, and a hard stop blocks any call
        that would cross the cap.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="text-2xl font-semibold tabular-nums">${led.totalUsd.toFixed(2)}</div>
          <div className="mt-0.5 text-xs font-medium text-neutral-500">spent this run</div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="text-2xl font-semibold tabular-nums">${DEFAULT_BUDGET_CAP_USD.toFixed(2)}</div>
          <div className="mt-0.5 text-xs font-medium text-neutral-500">hard cap (fail-closed)</div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="text-2xl font-semibold tabular-nums">{led.liveCalls}</div>
          <div className="mt-0.5 text-xs font-medium text-neutral-500">live calls</div>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="text-2xl font-semibold">{snap.servedMode}</div>
          <div className="mt-0.5 text-xs font-medium text-neutral-500">serve mode</div>
        </div>
      </section>

      <p className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] text-neutral-600">
        {led.note}
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">How the cap holds</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] text-neutral-700">
          <li>Cost = real API-reported tokens × a pinned, versioned price table (not an estimate).</li>
          <li>Before every live call, a fail-closed guard blocks it if spent + next-estimate would exceed the cap.</li>
          <li>A batch threads cumulative spend, so the cap holds across the whole run — not just per call.</li>
          <li>An unknown model id fails loud (never silently prices at $0); a billed-then-failed call still records its cost.</li>
          <li>Re-verified against current official Gemini pricing at use-time (never trusted from memory).</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">
          Pinned price table <span className="font-normal text-neutral-400">({PRICING_VERSION})</span>
        </h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Model</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Input $/1M</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Output $/1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {Object.entries(GEMINI_PRICING).map(([model, p]) => (
                <tr key={model}>
                  <td className="px-4 py-2.5 font-mono text-[13px]">{model}</td>
                  <td className="px-4 py-2.5 tabular-nums text-neutral-600">${p.inputPerMillionUsd}</td>
                  <td className="px-4 py-2.5 tabular-nums text-neutral-600">${p.outputPerMillionUsd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
