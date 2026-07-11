import type { Metadata } from "next";
import Link from "next/link";
import {
  RECORDED_LEGACY_GEMINI,
  RUN_RECORDS,
  ZERO_COST_PROOFS,
  type Provenance,
} from "@/lib/dashboard/evidence";

export const metadata: Metadata = { title: "Cost & $0 enforcement" };

/** Per-block provenance line — file + freeze SHA + event date, all from the module. */
function Prov({ of }: { of: Provenance }) {
  return (
    <p className="ds-prov">
      source: <span className="ds-mono">{of.file}</span> @ <span className="ds-mono">{of.frozenAt}</span>{" "}
      ({of.date})
    </p>
  );
}

export default function CostEnforcementPage() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Cost &amp; $0 enforcement</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> the checker itself costs nothing to run — it is deterministic code with
        no AI calls — and that is enforced by tests, not by promise. The few live AI runs this project
        ever made are each recorded below, with their exact cost.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> import-graph walks prove no module reachable from the engine&rsquo;s entry
        points can make an LLM or network call; the delivery builders are machine-held to zero imports.
        Live-leg spends are frozen run records, cited per figure.
      </p>

      <section>
        <h2 className="ds-h2-row">Machine enforcement (not policy)</h2>
        <div className="ds-tbl" style={{ marginTop: "12px" }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Claim</th>
                <th scope="col">Enforced by</th>
                <th scope="col">How it bites</th>
              </tr>
            </thead>
            <tbody>
              {ZERO_COST_PROOFS.map((p) => (
                <tr key={p.claim}>
                  <td>{p.claim}</td>
                  <td className="ds-mono" style={{ fontSize: "12px" }}>
                    {p.enforcedBy}
                  </td>
                  <td style={{ fontSize: "12.5px", color: "var(--muted)" }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row">Recorded live legs (the complete ledger)</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          Every live run in this project&rsquo;s history was owner-armed, pre-registered where it
          earned a label, and committed as a frozen record. This is the whole list — there are no
          unrecorded runs.
        </p>
        <div className="ds-grid g2" style={{ marginTop: "12px" }}>
          {RUN_RECORDS.map((r) => (
            <section key={r.provenance.file} className="ds-card flush">
              <h3 style={{ marginTop: 0 }}>{r.value}</h3>
              <p className="ds-card-p">{r.label}</p>
              <Prov of={r.provenance} />
            </section>
          ))}
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row">The one recorded legacy Gemini spend</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          The legacy activation module once recorded a real Gemini drafting run:{" "}
          <span className="ds-num">{RECORDED_LEGACY_GEMINI.totalUsd}</span> against a{" "}
          <span className="ds-num">{RECORDED_LEGACY_GEMINI.cap}</span> hard cap — a frozen fixture the
          legacy pages replay with zero re-spend. Details on{" "}
          <Link href="/legacy/cost" className="ds-mlink">
            /legacy/cost
          </Link>
          .
        </p>
        <Prov of={RECORDED_LEGACY_GEMINI.provenance} />
      </section>
    </main>
  );
}
