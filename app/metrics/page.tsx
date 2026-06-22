import { getReplaySnapshot } from "@/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-neutral-700">{label}</span>
        <span className="tabular-nums text-neutral-500">
          {value} · {pct}%
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-neutral-800" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const s = snap.summary;
  const blockers = Object.entries(s.blockers).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Workflow metrics (simulated)</h1>
      <p className="mt-2 max-w-3xl text-[15px] text-neutral-700">
        <span className="font-medium">In plain terms:</span> what the demo routes and tracks for an
        activation team — how many stalled merchants get a claim-checked nudge, how many are held for a
        human, and what&apos;s blocking them.
      </p>
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800">
        Figures are <span className="font-semibold">simulated</span> over the hybrid demo set (fictional
        names, synthetic activation state) — illustrative of the workflow, <span className="font-semibold">not
        activation, revenue, or reactivation outcomes</span>.
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Stalled merchants", value: s.merchants },
          { label: "Simulated sent", value: s.sent },
          { label: "Held for review", value: s.held },
          { label: "Auto-rejected", value: s.rejected },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 px-4 py-3">
            <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
            <div className="mt-0.5 text-xs font-medium text-neutral-500">{c.label}</div>
          </div>
        ))}
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Blocker mix</h2>
          <p className="mt-0.5 text-[12px] text-neutral-500">Where merchants are stuck (the work to do).</p>
          <div className="mt-3 space-y-2.5">
            {blockers.map(([blocker, count]) => (
              <Bar key={blocker} label={blocker} value={count} total={s.merchants} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Risk distribution</h2>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            High-risk merchants are held for human approval; lower-risk eligible ones can simulate-send.
          </p>
          <div className="mt-3 space-y-2.5">
            {(["High", "Medium", "Low"] as const).map((level) => (
              <Bar key={level} label={level} value={s.riskLevels[level] ?? 0} total={s.merchants} />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
            <dt className="text-neutral-500">Simulated send rate (of total)</dt>
            <dd className="tabular-nums">{Math.round((s.sent / s.merchants) * 100)}%</dd>
            <dt className="text-neutral-500">Held-for-review rate</dt>
            <dd className="tabular-nums">{Math.round((s.held / s.merchants) * 100)}%</dd>
          </dl>
        </section>
      </div>
    </main>
  );
}
