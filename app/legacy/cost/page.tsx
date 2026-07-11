import type { Metadata } from "next";
import { getReplaySnapshot } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";
import { GEMINI_PRICING, PRICING_VERSION } from "@/lib/agents/pricing";
import { DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";

export const metadata: Metadata = { title: "Cost" };

export default function CostPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const led = snap.costLedger;

  return (
    <main className="ds-data ds-wrap ds-narrow ds-view">
      <h1>Cost ledger</h1>
      <p className="ds-note">
        This is the legacy activation surface formerly at <span className="ds-mono">/cost</span>;
        the truth-engine cost &amp; $0-enforcement page now lives there.
      </p>
      <p className="ds-lead plain">
        <b>In plain terms:</b> the live-drafting path is budget-guarded, so a run can&apos;t quietly
        exceed the cap. Spend is computed from real reported tokens against a pinned price list, and a
        fail-closed hard stop blocks any call that would cross it.
      </p>

      <section className="ds-stats c4">
        <div className="ds-stat accent">
          <div className="v">${led.totalUsd.toFixed(2)}</div>
          <div className="l">spent this run</div>
        </div>
        <div className="ds-stat">
          <div className="v">${DEFAULT_BUDGET_CAP_USD.toFixed(2)}</div>
          <div className="l">hard cap (fail-closed)</div>
        </div>
        <div className="ds-stat">
          <div className="v">{led.liveCalls}</div>
          <div className="l">live calls</div>
        </div>
        <div className="ds-stat">
          <div className="v">{snap.servedMode}</div>
          <div className="l">serve mode</div>
        </div>
      </section>

      <p className="ds-note">{led.note}</p>

      <section>
        <h2 className="ds-h2-row">How the cap holds</h2>
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: "18px",
            fontSize: "13px",
            lineHeight: 1.8,
            color: "var(--ink-2)",
          }}
        >
          <li>Cost = real API-reported tokens × a pinned, versioned price table (not an estimate).</li>
          <li>Before every live call, a fail-closed guard blocks it if spent + next-estimate would exceed the cap.</li>
          <li>A batch threads cumulative spend, so the cap holds across the whole run — not just per call.</li>
          <li>An unknown model id fails loud (never silently prices at $0); a billed-then-failed call still records its cost.</li>
          <li>The price table was pinned + verified against official Gemini pricing for the recorded run; it must be re-checked before any future live run (never trusted from memory).</li>
        </ul>
      </section>

      <section>
        <h2 className="ds-h2-row">
          Pinned price table{" "}
          <span style={{ fontWeight: 400, color: "var(--muted)", fontFamily: "var(--ff-sans)", fontSize: "14px" }}>
            ({PRICING_VERSION})
          </span>
        </h2>
        <div className="ds-tbl">
          <table>
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">Input $/1M</th>
                <th scope="col">Output $/1M</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(GEMINI_PRICING).map(([model, p]) => (
                <tr key={model}>
                  <td className="ds-mono" style={{ fontSize: "12.5px" }}>
                    {model}
                  </td>
                  <td className="ds-mono">${p.inputPerMillionUsd}</td>
                  <td className="ds-mono">${p.outputPerMillionUsd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
