import type { Metadata } from "next";
import Link from "next/link";
import { ENGINE, type Provenance } from "@/lib/dashboard/evidence";

export const metadata: Metadata = { title: "Engine measurables" };

/** Per-block provenance line — file + freeze SHA + event date, all from the module. */
function Prov({ of }: { of: Provenance }) {
  return (
    <p className="ds-prov">
      source: <span className="ds-mono">{of.file}</span> @ <span className="ds-mono">{of.frozenAt}</span>{" "}
      ({of.date})
    </p>
  );
}

export default function EngineMeasurablesPage() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Engine measurables</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> the checker&rsquo;s substance in numbers — how many codified fee rules
        it enforces, how many official protocol schemas it validates against, and exactly what the
        public demo report contains. Each number is recomputed from the committed file it lives in.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> these figures are computed at build time from imports of the committed
        artifacts (rule table, pinned schema set, golden report) — they cannot drift from the repo. A
        committed anti-fabrication test re-derives every figure from the same sources.
      </p>

      <section className="ds-stats c4">
        <div className="ds-stat accent">
          <div className="v">{ENGINE.feeRulesTotal}</div>
          <div className="l">codified fee-cap rules (NYC &sect;20-563.3)</div>
        </div>
        <div className="ds-stat">
          <div className="v">{ENGINE.ucpSchemaCount}</div>
          <div className="l">pinned official UCP schemas</div>
        </div>
        <div className="ds-stat">
          <div className="v">{ENGINE.demoFindings}</div>
          <div className="l">findings in the demo golden report</div>
        </div>
        <div className="ds-stat">
          <div className="v">
            {ENGINE.demoErrors}/{ENGINE.demoWarns}
          </div>
          <div className="l">error / warn split</div>
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row">Fee-rule accounting</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          {ENGINE.feeRulePredicates} statement predicates the checker executes directly +{" "}
          {ENGINE.feeRulesNonCheckable} clauses registered as non-checkable from a statement alone
          (each carries its reason in the rule table) = {ENGINE.feeRulesTotal} rules, transcribed 1:1
          from the codified clause text and held by a drift-lock test.
        </p>
        <Prov of={ENGINE.feeRulesProvenance} />
      </section>

      <section>
        <h2 className="ds-h2-row">Protocol conformance surface</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          {ENGINE.ucpSchemaCount} official UCP JSON Schemas (spec version{" "}
          <span className="ds-mono">{ENGINE.ucpSpecVersion}</span>), fetched verbatim, hash-pinned, and
          validated against — never edited. The headline the engine demonstrates: a feed can be
          schema-conformant and still false against the merchant&rsquo;s own records.
        </p>
        <Prov of={ENGINE.ucpProvenance} />
      </section>

      <section>
        <h2 className="ds-h2-row">The demo golden report</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          The public <Link href="/report" className="ds-mlink">/report</Link> and{" "}
          <Link href="/demo" className="ds-mlink">/demo</Link> pages render exactly this committed
          golden: {ENGINE.demoFindings} findings — {ENGINE.demoErrors} error / {ENGINE.demoWarns} warn
          — from the synthetic-restaurant corpus. Simulated data throughout; the rules are real.
        </p>
        <Prov of={ENGINE.demoReportProvenance} />
      </section>

      <p className="ds-note" style={{ marginTop: "24px" }}>
        The legacy activation workflow metrics formerly on this page now live at{" "}
        <Link href="/legacy/metrics" className="ds-mlink">
          /legacy/metrics
        </Link>
        .
      </p>
    </main>
  );
}
