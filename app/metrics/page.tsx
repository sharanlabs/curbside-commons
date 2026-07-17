import type { Metadata } from "next";
import Link from "next/link";
import { ENGINE, type Provenance } from "@/lib/dashboard/evidence";
import { SectionRail } from "@/components/data-surfaces/SectionRail";

export const metadata: Metadata = { title: "Engine measurables" };

/** Per-block provenance line — every figure traces to a record kept in the project (the
 *  record's exact location and freeze reference are kept in the project itself). */
function Prov({ of }: { of: Provenance }) {
  return <p className="ds-prov">Traced to a record kept in the project ({of.date}).</p>;
}

export default function EngineMeasurablesPage() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Engine measurables</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> the checker&rsquo;s scope in numbers — how many codified fee rules
        it enforces, how many official protocol schemas it validates against, and exactly what the
        public demo report contains. Each number is either derived from its committed source, or
        pinned to a fixed version and checked against that source.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> the fee-rule count and the demo tally are computed at build time from the
        committed data (the rule table and the demo report); the schema count is pinned to a fixed
        spec version and checked against the pinned schema set. A standing check verifies every figure
        against its source, so none can silently drift.
      </p>

      <SectionRail
        items={[
          { id: "fee-rules", label: "Fee rules" },
          { id: "protocol", label: "Protocol surface" },
          { id: "demo-report", label: "Demo report" },
        ]}
      />

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
          <div className="l">findings in the demo report</div>
        </div>
        <div className="ds-stat">
          <div className="v">
            {ENGINE.demoErrors}/{ENGINE.demoWarns}
          </div>
          <div className="l">error / warn split</div>
        </div>
      </section>

      <section>
        <h2 className="ds-h2-row" id="fee-rules">Fee-rule accounting</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          {ENGINE.feeRulePredicates} statement predicates the checker executes directly +{" "}
          {ENGINE.feeRulesNonCheckable} clauses registered as non-checkable from a statement alone
          (each carries its reason in the rule table) = {ENGINE.feeRulesTotal} rules, transcribed 1:1
          from the codified clause text and held in place by a committed check.
        </p>
        <Prov of={ENGINE.feeRulesProvenance} />
      </section>

      <section>
        <h2 className="ds-h2-row" id="protocol">Protocol conformance surface</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          {ENGINE.ucpSchemaCount} official UCP JSON Schemas (spec version{" "}
          <span className="ds-mono">{ENGINE.ucpSpecVersion}</span>), fetched verbatim and pinned to
          a fixed version — never edited. The engine validates feeds against them. The result: a
          feed can be schema-conformant and still false against the merchant&rsquo;s own records.
        </p>
        <Prov of={ENGINE.ucpProvenance} />
      </section>

      <section>
        <h2 className="ds-h2-row" id="demo-report">The demo report</h2>
        <p className="ds-runline" style={{ maxWidth: "78ch" }}>
          The public <Link href="/report" className="ds-mlink">/report</Link> and{" "}
          <Link href="/demo" className="ds-mlink">/demo</Link> pages render exactly this committed
          example: {ENGINE.demoFindings} findings — {ENGINE.demoErrors} error / {ENGINE.demoWarns}{" "}
          warn. The example restaurant and its data are invented; the rules are real.
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
