import type { Metadata } from "next";
import Link from "next/link";
import { getReplaySnapshot, type ReplayMerchant } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME, HONEST_DATA_LABEL } from "@/lib/product";
import { Mark } from "@/components/data-surfaces/Mark";

export const metadata: Metadata = { title: "Console" };

const RISK_CHIP: Record<string, string> = { Low: "low", Medium: "medium", High: "high" };

function statusBadge(rm: ReplayMerchant): { text: string; cls: string } {
  if (rm.outreachStatus === "simulated_sent") return { text: "Simulated sent", cls: "sent" };
  if (rm.outreachStatus === "draft_rejected") return { text: "Rejected", cls: "rejected" };
  if (rm.merchant.review_required) return { text: "Held for review", cls: "held" };
  return { text: "Drafted", cls: "neutral" };
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "ds-stat accent" : "ds-stat"}>
      <div className="v">{value}</div>
      <div className="l">{label}</div>
      {sub ? <div className="s">{sub}</div> : null}
    </div>
  );
}

const PIPELINE: Array<{ step: string; plain: string; tech: string }> = [
  { step: "Triage", plain: "Find who's stuck, and how badly.", tech: "Deterministic risk score + level (auditable formula)." },
  { step: "Diagnose", plain: "Pin the exact blocker.", tech: "Onboarding-step → blocker/next-action map." },
  { step: "Draft", plain: "Write the right next message.", tech: "Bounded, schema-constrained LLM (REPLAY here; a real Gemini run is recorded — see Eval)." },
  { step: "Gate", plain: "Check each declared claim against the data.", tech: "Claims-gatekeeper: each declared claim traces to merchant data + forbidden-claim guardrails (undeclared prose isn't fully semantically verified — a documented boundary)." },
  { step: "Score", plain: "Measure draft quality.", tech: "Eval graders: structure · state-consistency · policy · no-leakage." },
  { step: "Approve", plain: "A human decides: hold / reject / send.", tech: "Human-in-the-loop gate; simulated send; full audit trail." },
];

export default function Console() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const s = snap.summary;

  return (
    <main className="ds-data ds-wrap ds-view">
      <p className="ds-kicker">
        <Mark name="record" />
        {PLATFORM_NAME} · stalled-merchant activation
      </p>

      <h1>Activate stalled, long-tail merchants — responsibly.</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> it finds which delivery-marketplace merchants are stuck getting set
        up and why, drafts the next message with every claim checked against the merchant&apos;s own
        data, and keeps a person in charge — built to be measured, audited, and adopted.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> deterministic risk + blocker triage → bounded, schema-constrained LLM
        drafting → a claims-gatekeeper that ties every declared claim to the merchant&apos;s own data
        → an eval harness over the output → a human approval gate with an audit trail. Avoids the
        false-claim/churn failure the AI-outreach wave is hitting.
      </p>

      <div className="ds-note warn">
        <b>Honest data label:</b> {HONEST_DATA_LABEL}
      </div>

      <section className="ds-stats c6">
        <Stat label="Merchants" value={String(s.merchants)} sub="hybrid set" />
        <Stat label="Simulated sent" value={String(s.sent)} sub="eligible + clean" />
        <Stat label="Held for review" value={String(s.held)} sub="human gate" />
        <Stat label="Eval passing" value={`${s.evalPassed}/${s.evalTotal}`} sub="quality dims" />
        <Stat
          label="Gemini spend"
          value="$0.00"
          sub={`≤ $5 cap · ${snap.costLedger.liveCalls} live calls`}
          accent
        />
        <Stat label="Mode" value="REPLAY" sub="demo makes no live calls" />
      </section>

      <section>
        <h2 className="ds-h2-row">How it works &amp; why it&apos;s safe</h2>
        <div className="ds-grid g3">
          {PIPELINE.map((p) => (
            <div key={p.step} className="ds-card">
              <div className="ds-card-t">{p.step}</div>
              <p className="ds-card-p">{p.plain}</p>
              <p className="ds-card-tech">{p.tech}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row">Activation queue</h2>
        <p className="ds-runline">
          Fictional businesses with synthetic activation state — the adapter ingests real DataSF
          public records (fictional display, real-data capability). Open one to see the full
          why-chain end to end.
        </p>
        <div className="ds-tbl">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Risk</th>
                <th>Blocker</th>
                <th>Quality</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {snap.merchants.map((rm) => {
                const badge = statusBadge(rm);
                return (
                  <tr key={rm.merchant.merchant_id}>
                    <td>
                      <Link href={`/legacy/merchant/${rm.merchant.merchant_id}`} className="ds-mlink">
                        {rm.merchant.merchant_name}
                      </Link>
                    </td>
                    <td>{rm.merchant.merchant_category}</td>
                    <td>
                      <span className={`ds-chip ${RISK_CHIP[rm.merchant.risk_level]}`}>
                        {rm.merchant.risk_level} · {rm.merchant.risk_score}
                      </span>
                    </td>
                    <td className="ds-mono" style={{ fontSize: "12px" }}>
                      {rm.merchant.current_blocker_code}
                    </td>
                    <td className="ds-mono">
                      {rm.evalScore.passed}/{rm.evalScore.total}
                    </td>
                    <td>
                      <span className={`ds-chip ${badge.cls}`}>{badge.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer
        style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid var(--rule)" }}
      >
        <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--muted)", maxWidth: "90ch", margin: 0 }}>
          <b style={{ color: "var(--graphite)", fontWeight: 600 }}>Data provenance:</b>{" "}
          {snap.provenance.source} ({snap.provenance.dataset_id}), {snap.provenance.license}. Real
          layer = business name + category only; activation state synthetic. Human-led, AI-assisted,
          professionally reviewed — never a claim of real marketplace access or business impact.
        </p>
      </footer>
    </main>
  );
}
