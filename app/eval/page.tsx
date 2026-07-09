import type { Metadata } from "next";
import Link from "next/link";
import { getReplaySnapshot } from "@/legacy/activation/lib/replay/run";
import { liveSamples } from "@/legacy/activation/lib/replay/live-samples";
import { PLATFORM_NAME } from "@/lib/product";
import { Mark } from "@/components/data-surfaces/Mark";

export const metadata: Metadata = { title: "Eval / Quality" };

const DIMS = ["structure", "state-consistency", "policy", "no-leakage"] as const;

export default function EvalPage() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const dimStats = DIMS.map((dim) => ({
    dim,
    passed: snap.merchants.filter((m) => m.evalScore.results.find((r) => r.grader === dim)?.pass).length,
    total: snap.merchants.length,
  }));

  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Eval / Quality</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> every drafted message is scored before a human ever sees it — is it
        well-formed, do its declared claims all check out against this merchant&apos;s data, and does
        it avoid forbidden promises?
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> deterministic graders over the draft contract (structure ·
        state-consistency · policy · no-leakage). They share the gate&apos;s rule definitions; their
        teeth are proven by paired corrupted-record tests (a grader that can&apos;t fail is theater) —
        including on the recorded real-Gemini drafts, where no-leakage catches a raw enum / risk-level
        leak the other dimensions missed.
      </p>
      <div className="ds-note warn">
        These corpus scores grade the <b>deterministic stub</b> output. The same graders also scored a{" "}
        <b>recorded real Gemini run</b> — shown below (key-gated, $0.0042 spent) — so this stays honest
        about real output. The public <b>demo itself makes no live calls</b>.
      </div>

      <section className="ds-stats c5">
        <div className="ds-stat accent">
          <div className="v">
            {snap.summary.evalPassed}/{snap.summary.evalTotal}
          </div>
          <div className="l">drafts pass all dimensions</div>
        </div>
        {dimStats.map((d) => (
          <div key={d.dim} className="ds-stat">
            <div className="v">
              {d.passed}/{d.total}
            </div>
            <div className="l">{d.dim}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: "26px" }}>
        <div className="ds-tbl" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Merchant</th>
                {DIMS.map((d) => (
                  <th key={d} scope="col">
                    {d}
                  </th>
                ))}
                <th scope="col">Overall</th>
              </tr>
            </thead>
            <tbody>
              {snap.merchants.map((m) => (
                <tr key={m.merchant.merchant_id}>
                  <td>
                    <Link href={`/merchant/${m.merchant.merchant_id}`} className="ds-mlink">
                      {m.merchant.merchant_name}
                    </Link>
                  </td>
                  {DIMS.map((d) => {
                    const r = m.evalScore.results.find((x) => x.grader === d);
                    return (
                      <td key={d}>
                        <span className={r?.pass ? "ds-verdict ok" : "ds-verdict no"}>
                          <Mark name={r?.pass ? "check" : "x"} />
                          {r?.pass ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="ds-mono">
                    {m.evalScore.passed}/{m.evalScore.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row">
          Recorded Gemini run — static fixture{" "}
          <span style={{ fontWeight: 400, color: "var(--muted)", fontFamily: "var(--ff-sans)", fontSize: "14px" }}>
            ({liveSamples.provenance.model}, {liveSamples.provenance.recorded_at})
          </span>
        </h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          A <b style={{ color: "var(--ink-2)" }}>frozen recording</b> of a local Gemini API run (one
          merchant per blocker). The public demo does <b style={{ color: "var(--ink-2)" }}>not</b>{" "}
          re-run or independently verify it (REPLAY-only, zero spend) — reproduce it yourself with your
          own key:{" "}
          <code className="ds-code">
            node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts
          </code>
          . Total cost:{" "}
          <span className="ds-num">${liveSamples.provenance.total_cost_usd.toFixed(4)}</span> (cap $5).
          Modes: {Object.entries(liveSamples.provenance.modes).map(([k, v]) => `${v} ${k}`).join(" · ")}.
          Gate: {Object.entries(liveSamples.provenance.gate).map(([k, v]) => `${v} ${k}`).join(" · ")}.
        </p>

        <div className="ds-note" style={{ marginTop: "14px" }}>
          <div className="ds-tag role" style={{ background: "none", border: "none", padding: 0, marginBottom: "8px" }}>
            What the live run showed (honest)
          </div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", lineHeight: 1.7 }}>
            {liveSamples.provenance.honest_findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="ds-tbl">
          <table>
            <thead>
              <tr>
                <th scope="col">Blocker</th>
                <th scope="col">Mode</th>
                <th scope="col">Gate</th>
                <th scope="col">Eval</th>
                <th scope="col">Cost</th>
              </tr>
            </thead>
            <tbody>
              {liveSamples.rows.map((r, i) => (
                <tr key={i}>
                  <td className="ds-mono" style={{ fontSize: "12px" }}>
                    {r.blocker}
                  </td>
                  <td className="ds-mono" style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {r.mode}
                  </td>
                  <td>{r.gatekeeper}</td>
                  <td className="ds-mono">{r.eval}</td>
                  <td className="ds-mono" style={{ color: "var(--muted)" }}>
                    ${r.costUsd.toFixed(6)}
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
