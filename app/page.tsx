import Link from "next/link";
import { getReplaySnapshot, type ReplayMerchant } from "@/lib/replay/run";
import { PLATFORM_NAME, HONEST_DATA_LABEL } from "@/lib/product";

const RISK_STYLES: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  High: "bg-red-50 text-red-700 ring-red-600/20",
};

function statusBadge(rm: ReplayMerchant): { text: string; cls: string } {
  if (rm.outreachStatus === "simulated_sent")
    return { text: "Simulated sent", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
  if (rm.outreachStatus === "draft_rejected")
    return { text: "Rejected", cls: "bg-red-50 text-red-700 ring-red-600/20" };
  if (rm.merchant.review_required)
    return { text: "Held for review", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  return { text: "Drafted", cls: "bg-neutral-100 text-neutral-600 ring-neutral-500/20" };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-neutral-500">{label}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-neutral-400">{sub}</div> : null}
    </div>
  );
}

const PIPELINE: Array<{ step: string; plain: string; tech: string }> = [
  { step: "Triage", plain: "Find who's stuck, and how badly.", tech: "Deterministic risk score + level (auditable formula)." },
  { step: "Diagnose", plain: "Pin the exact blocker.", tech: "Onboarding-step → blocker/next-action map." },
  { step: "Draft", plain: "Write the right next message.", tech: "Bounded, schema-constrained LLM (REPLAY here; a real Gemini run is recorded — see Eval)." },
  { step: "Gate", plain: "Check each declared claim against the data.", tech: "Claims-gatekeeper: each declared claim traces to merchant data + forbidden-claim guardrails (undeclared prose isn't fully semantically verified — a documented boundary)." },
  { step: "Score", plain: "Measure draft quality.", tech: "Eval graders: structure · state-consistency · policy." },
  { step: "Approve", plain: "A human decides: hold / reject / send.", tech: "Human-in-the-loop gate; simulated send; full audit trail." },
];

export default function Home() {
  const snap = getReplaySnapshot(PLATFORM_NAME);
  const s = snap.summary;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {PLATFORM_NAME} · stalled-merchant activation
      </p>

      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">
        Activate stalled, long-tail merchants — responsibly.
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-neutral-700">
        <span className="font-medium">In plain terms:</span> it spots which delivery-marketplace
        merchants are stuck getting set up and why, drafts a next message whose claims are checked
        against the merchant&apos;s own data, and keeps a human in charge — built to be measured,
        audited, and adopted.
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-500">
        <span className="font-medium text-neutral-600">Technically:</span> deterministic risk + blocker
        triage → bounded, schema-constrained LLM drafting → a claims-gatekeeper that ties every declared
        claim to the merchant&apos;s own data → an eval harness over the output → a human approval gate with an
        audit trail. Avoids the false-claim/churn failure the AI-outreach wave is hitting.
      </p>

      <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800">
        <span className="font-semibold">Honest data label:</span> {HONEST_DATA_LABEL}
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Merchants" value={String(s.merchants)} sub="hybrid set" />
        <Stat label="Simulated sent" value={String(s.sent)} sub="eligible + clean" />
        <Stat label="Held for review" value={String(s.held)} sub="human gate" />
        <Stat label="Eval passing" value={`${s.evalPassed}/${s.evalTotal}`} sub="quality dims" />
        <Stat label="Gemini spend" value="$0.00" sub={`≤ $5 cap · ${snap.costLedger.liveCalls} live calls`} />
        <Stat label="Mode" value="REPLAY" sub="demo makes no live calls" />
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-neutral-900">How it works &amp; why it&apos;s safe</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE.map((p, i) => (
            <div key={p.step} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{p.step}</span>
              </div>
              <p className="mt-1.5 text-[13px] text-neutral-700">{p.plain}</p>
              <p className="mt-1 text-[12px] text-neutral-500">{p.tech}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-neutral-900">Activation queue</h2>
        <p className="mt-1 text-[13px] text-neutral-500">
          Fictional businesses with synthetic activation state — the adapter ingests real DataSF
          public records (fictional display, real-data capability). Open one to see the full why-chain
          end to end.
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Merchant</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Risk</th>
                <th className="px-4 py-2.5 font-medium">Blocker</th>
                <th className="px-4 py-2.5 font-medium">Quality</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {snap.merchants.map((rm) => {
                const badge = statusBadge(rm);
                return (
                  <tr key={rm.merchant.merchant_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/merchant/${rm.merchant.merchant_id}`}
                        className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                      >
                        {rm.merchant.merchant_name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{rm.merchant.merchant_category}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${RISK_STYLES[rm.merchant.risk_level]}`}
                      >
                        {rm.merchant.risk_level} · {rm.merchant.risk_score}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-neutral-600">
                      {rm.merchant.current_blocker_code}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-neutral-600">
                      {rm.evalScore.passed}/{rm.evalScore.total}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-4 text-[12px] leading-relaxed text-neutral-500">
        <p>
          <span className="font-medium text-neutral-600">Data provenance:</span> {snap.provenance.source} (
          {snap.provenance.dataset_id}), {snap.provenance.license}. Real layer = business name + category
          only; activation state synthetic. Human-led, AI-assisted, professionally reviewed — never a claim
          of real marketplace access or business impact.
        </p>
      </footer>
    </main>
  );
}
