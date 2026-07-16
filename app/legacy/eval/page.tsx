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
      <p className="ds-note">
        This is the legacy activation surface formerly at <span className="ds-mono">/eval</span>;
        the truth-engine eval evidence now lives there.
      </p>
      <p className="ds-lead plain">
        <b>In plain terms:</b> every drafted message is scored before a human ever sees it — is it
        well-formed, do its declared claims all check out against this merchant&apos;s data, and does
        it avoid forbidden promises?
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> deterministic graders over the draft contract (structure ·
        state-consistency · policy · no-leakage). They share the gate&apos;s rule definitions; their
        teeth are proven by paired corrupted-record checks (a grader that can&apos;t fail is theater) —
        including on the recorded model drafts, where no-leakage catches a raw internal code / risk-level leak
        the other dimensions missed.
      </p>
      <div className="ds-note warn">
        These scores grade the <b>rules-based sample</b> output. The same graders also scored a{" "}
        <b>recorded model run</b> — shown below ($0.0042 spent) — so this stays honest about real
        output. The public <b>demo itself makes no live calls</b>.
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
                    <Link href={`/legacy/merchant/${m.merchant.merchant_id}`} className="ds-mlink">
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
        <h2 className="ds-h2-row">Recorded model run — a frozen recording</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          A <b style={{ color: "var(--ink-2)" }}>frozen recording</b> of a real model drafting run
          (one merchant per blocker), scored by the same graders. The public demo does{" "}
          <b style={{ color: "var(--ink-2)" }}>not</b> re-run or independently verify it — it costs
          nothing to view. Total recorded cost:{" "}
          <span className="ds-num">${liveSamples.provenance.total_cost_usd.toFixed(4)}</span> against a
          $5 cap.
        </p>

        <div className="ds-note" style={{ marginTop: "14px" }}>
          <div className="ds-tag role" style={{ background: "none", border: "none", padding: 0, marginBottom: "8px" }}>
            What the recorded run showed (honest)
          </div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", lineHeight: 1.7 }}>
            <li>
              The claims-gatekeeper held on live output: every declared claim checked out against the
              merchant&apos;s own data on every produced draft.
            </li>
            <li>
              Real model output sometimes came back malformed — handled by falling back to the
              rules-based sample, with the billed cost still recorded so the running cap stays honest.
              High-risk drafts were held for a human.
            </li>
            <li>
              A register check re-scored the recorded messages and caught a genuine internal-label
              leak in three of the six drafts — an authentic catch on real output. The gate now treats
              such a leak as blocking, and the prompt was tightened to prevent it going forward.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
