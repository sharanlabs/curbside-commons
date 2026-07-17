import type { Metadata } from "next";
import Link from "next/link";
import { SectionRail } from "@/components/data-surfaces/SectionRail";
import {
  RECORDED_LEGACY_GEMINI,
  RUN_RECORDS,
  ZERO_COST_PROOFS,
  type Provenance,
} from "@/lib/dashboard/evidence";

export const metadata: Metadata = { title: "Cost & $0 enforcement" };

/** Per-block provenance line — every figure traces to a record kept in the project (the
 *  record's exact location and freeze reference are kept in the project itself). */
function Prov({ of }: { of: Provenance }) {
  return <p className="ds-prov">Traced to a record kept in the project ({of.date}).</p>;
}

/**
 * Display-layer copy for the recorded run records. Their exact wording is kept
 * verbatim in the project (a committed test binds each value); here we render
 * them in the site's plain product voice, without internal codenames or tool
 * names.
 */
function plainLeg(value: string, label: string): { value: string; label: string } {
  const v = value.replace(/\s*\(Groq\)/gi, "").replace(/sha256-identical/gi, "identical");
  const l = label
    .replace(/L-1 crew live run/gi, "Assistant crew — recorded run")
    .replace(/L-2 recorded owner-armed Slack send \(the only send in history\)/gi, "The one recorded, approved message send")
    .replace(/L-3 n8n runtime lane/gi, "Workflow-automation lane")
    .replace(/fresh held-out split/gi, "fresh held-out set");
  return { value: v, label: l };
}

export default function CostEnforcementPage() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Cost &amp; $0 enforcement</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> the checker itself costs nothing to run — it is deterministic code with
        no AI calls — and that is enforced by standing checks, not by promise. The few live AI runs this project
        ever made are each recorded below, with their exact cost.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> automated checks prove that the verifier cannot make AI or network
        calls and that the delivery builders make no network connections. The few recorded live
        runs are frozen records, cited per figure.
      </p>

      <SectionRail
        items={[
          { id: "enforcement", label: "Enforcement" },
          { id: "live-runs", label: "Live runs" },
          { id: "ai-spend", label: "AI spend" },
        ]}
      />

      <section>
        <h2 className="ds-h2-row" id="enforcement">Machine enforcement (not policy)</h2>
        <div className="ds-tbl" style={{ marginTop: "12px" }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Claim</th>
                <th scope="col">How it holds</th>
              </tr>
            </thead>
            <tbody>
              {ZERO_COST_PROOFS.map((p) => (
                <tr key={p.claim}>
                  <td>{p.claim}</td>
                  <td style={{ fontSize: "12.5px", color: "var(--muted)" }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row" id="live-runs">Recorded live runs</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          Each run below was approved by a person, held to a bar fixed in advance where it earned a
          label, and committed as a frozen record — including the first calibration attempt, which
          deferred its label and stands unedited. The earlier module&rsquo;s one recorded AI-drafting
          spend is itemized in the section below.
        </p>
        <div className="ds-grid g2" style={{ marginTop: "12px" }}>
          {RUN_RECORDS.map((r, i) => {
            const leg = plainLeg(r.value, r.label);
            return (
              <section key={i} className="ds-card flush">
                <h3 style={{ marginTop: 0 }}>{leg.value}</h3>
                <p className="ds-card-p">{leg.label}</p>
                <Prov of={r.provenance} />
              </section>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row" id="ai-spend">The one recorded AI-drafting spend</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          The earlier activation module once recorded a real AI drafting run:{" "}
          <span className="ds-num">{RECORDED_LEGACY_GEMINI.totalUsd}</span> against a{" "}
          <span className="ds-num">{RECORDED_LEGACY_GEMINI.cap}</span> hard cap — a frozen record the
          legacy pages show with no re-spend. Details on{" "}
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
