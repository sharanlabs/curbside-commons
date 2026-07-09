import type { Metadata } from "next";
import { getReplaySnapshot } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";

export const metadata: Metadata = { title: "Metrics" };

function Bar({ label, value, total, accent }: { label: string; value: number; total: number; accent?: boolean }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ds-bar-row">
      <div className="ds-bar-top">
        <span>{label}</span>
        <span className="bv">
          {value} · {pct}%
        </span>
      </div>
      <div className={accent ? "ds-bar acc" : "ds-bar"}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const s = snap.summary;
  const blockers = Object.entries(s.blockers).sort((a, b) => b[1] - a[1]);

  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Workflow metrics (simulated)</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> what the demo routes and tracks for an activation team — how many
        stalled merchants get a claim-checked nudge, how many are held for a human, and what&apos;s
        blocking them.
      </p>
      <div className="ds-note warn">
        Figures are <b>simulated</b> over the hybrid demo set (fictional names, synthetic activation
        state) — illustrative of the workflow, <b>not activation, revenue, or reactivation outcomes</b>.
      </div>

      <section className="ds-stats c4">
        {[
          { label: "Stalled merchants", value: s.merchants },
          { label: "Simulated sent", value: s.sent },
          { label: "Held for review", value: s.held },
          { label: "Auto-rejected", value: s.rejected },
        ].map((c) => (
          <div key={c.label} className="ds-stat">
            <div className="v">{c.value}</div>
            <div className="l">{c.label}</div>
          </div>
        ))}
      </section>

      <div className="ds-grid g2" style={{ marginTop: "26px" }}>
        <section className="ds-card flush">
          <h2>Blocker mix</h2>
          <p className="ds-card-p" style={{ color: "var(--muted)", marginBottom: "14px" }}>
            Where merchants are stuck (the work to do).
          </p>
          {blockers.map(([blocker, count]) => (
            <Bar key={blocker} label={blocker} value={count} total={s.merchants} />
          ))}
        </section>

        <section className="ds-card flush">
          <h2>Risk distribution</h2>
          <p className="ds-card-p" style={{ color: "var(--muted)", marginBottom: "14px" }}>
            High-risk merchants are held for human approval; lower-risk eligible ones can
            simulate-send.
          </p>
          {(["High", "Medium", "Low"] as const).map((level) => (
            <Bar key={level} label={level} value={s.riskLevels[level] ?? 0} total={s.merchants} accent />
          ))}
          <dl className="ds-ratefacts">
            <dt>Simulated send rate (of total)</dt>
            <dd>{Math.round((s.sent / s.merchants) * 100)}%</dd>
            <dt>Held-for-review rate</dt>
            <dd>{Math.round((s.held / s.merchants) * 100)}%</dd>
          </dl>
        </section>
      </div>
    </main>
  );
}
