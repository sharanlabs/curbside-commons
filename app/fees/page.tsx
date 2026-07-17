import type { Metadata } from "next";
import { FeesView } from "@/components/fees/FeesView";
import { FeePlaygroundClient } from "@/components/fees/FeePlaygroundClient";
import {
  EXECUTABLE_RULES,
  EXTERNAL_EVIDENCE_RULES,
  FEE_BOUNDARY,
  RULE_TABLE_FRESHNESS,
} from "@/components/fees/fee-report-data";

/**
 * /fees — the NYC fee-cap audit surface (NYC showcase N1+N2, plan
 * docs/plan-nyc-showcase-2026-07-16.md; copy: the sol narrative draft
 * 2026-07-16, Fable-adjudicated). Server-rendered from the committed example
 * statements + their audit records; the paste leg runs the real engine
 * client-side. Deterministic, $0, no AI in this audit — stated on the surface.
 */
export const metadata: Metadata = {
  title: "Fee-cap audit — a statement read against NYC's caps",
  description:
    "A delivery fee statement audited against the 17 codified rules of NYC Administrative Code §20-563.3: verdicts, per-finding receipts, the boundary between statement-checkable rules and those needing external evidence — and an in-browser audit for pasted statements.",
};

export default function FeesPage() {
  return (
    <main className="lp-main pg-page fee-page">
      <section className="pg-sec" aria-labelledby="fee-h1">
        <p className="lp-eyebrow">THE FEE-CAP AUDIT</p>
        <h1 id="fee-h1" className="pg-h1">
          A fee statement, read against the law.
        </h1>
        <p className="pg-lede">
          Curbside Commons checks a supplied delivery-fee statement against{" "}
          {FEE_BOUNDARY.total} rules codified from the fee-cap core of{" "}
          {RULE_TABLE_FRESHNESS.statute}, based on the certified text verified current as of{" "}
          {RULE_TABLE_FRESHNESS.verifiedAsOf}. This is a statement-level audit: it reports what
          the supplied bill establishes and leaves facts requiring evidence beyond the statement
          unresolved.
        </p>
        <p className="pg-boundary">
          Four example months bring the boundary into view: violations, a clean result, a refund
          that cures, and a refund window still open.
        </p>
      </section>

      <section className="pg-sec" aria-label="The audit, rendered">
        <FeesView />
      </section>

      {/* ----- The 11 / 6 boundary — rendered with the same care ----- */}
      <section className="pg-sec fee-boundary-sec" aria-labelledby="fee-boundary-h2">
        <h2 id="fee-boundary-h2" className="fee-h2">
          What a statement can prove — and what it cannot.
        </h2>
        <p className="pg-lede">
          {FEE_BOUNDARY.executable} of the {FEE_BOUNDARY.total} codified rules can be checked from
          the statement itself; {FEE_BOUNDARY.external} require external evidence and remain
          honestly unresolved rather than being forced into pass or fail. The statute also carries
          duties outside this audit&rsquo;s fee-cap scope &mdash; advertising consent, marketing
          inserts, menu-price parity &mdash; which no fee statement could evidence; they are out
          of scope by design.
        </p>
        <div className="fee-lanes">
          <div className="fee-lane">
            <h3 className="fee-lane-title">
              Checked from the statement <span className="fee-lane-count">{FEE_BOUNDARY.executable}</span>
            </h3>
            <ul className="fee-rule-list">
              {EXECUTABLE_RULES.map((r) => (
                <li key={r.id} className="fee-rule-row">
                  <span className="fee-rule-id rpt-mono">{r.id}</span>
                  <span className="fee-rule-kind">
                    {r.kind}
                    {r.cap !== "—" ? ` · ${r.cap}` : ""}
                  </span>
                  <span className="fee-rule-clause rpt-mono">{r.clause}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="fee-lane fee-lane-external">
            <h3 className="fee-lane-title">
              Needs evidence beyond the statement{" "}
              <span className="fee-lane-count">{FEE_BOUNDARY.external}</span>
            </h3>
            <ul className="fee-ext-list">
              {EXTERNAL_EVIDENCE_RULES.map((r) => (
                <li key={r.id} className="fee-ext-row">
                  <p className="fee-ext-title">
                    {r.title} <span className="fee-rule-id rpt-mono">{r.id}</span>
                  </p>
                  <p className="fee-ext-plain">{r.plain}</p>
                  <p className="fee-ext-state">UNRESOLVED — outside what a statement can show</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ----- The paste leg — the real audit, in your browser ----- */}
      <section className="pg-sec" aria-labelledby="fee-paste-h2">
        <h2 id="fee-paste-h2" className="fee-h2">
          Audit a statement in your browser.
        </h2>
        <p className="pg-lede">
          Paste a statement to run the audit right here; only the words you supply are examined,
          and nothing leaves the browser. No AI calls, $0 to run, no network requests.
        </p>
        <FeePlaygroundClient />
      </section>

      <section className="pg-sec pg-foot-sec" aria-label="Provenance">
        <p className="pg-foot">
          Run on demand. The audit engine, the codified rule table, and the example statements
          ship with this project; the sample statement always produces the same audit, so you can
          check the result against the &ldquo;Over the caps&rdquo; example month above.
        </p>
      </section>
    </main>
  );
}
