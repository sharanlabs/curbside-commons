"use client";

import { useState } from "react";
import acpJson from "@/fixtures/synthetic-restaurant/expected-report.acp.json";
import ucpJson from "@/fixtures/synthetic-restaurant/expected-report.ucp.json";
import type { VerifierReport } from "@/lib/verifier-core/report";
import { toReportView, type FindingRow, type ReportView as ReportViewModel } from "@/lib/packs/listings/report-view";

/**
 * The one-page verifier report (W3; plan §5 W3 · S-9 "the report IS a document").
 *
 * Renders a VerifierReport as ONE self-contained page — desktop web + printable
 * (see the `@media print` block in globals.css). The data is the COMMITTED golden
 * fixture reports, imported statically and bundled at build: zero LLM, zero
 * network, $0 — the report-rendering path imports no provider/LLM module (proven
 * by evals/packs/report-view-c1.test.ts). A surface toggle switches between the
 * two serving surfaces the same SOR was checked against (ACP static feed / UCP
 * catalog response); each renders as its own one-page report.
 *
 * Plain: shows the checker's result as a printable one-pager — a plain sentence
 * per catch, then the exact receipts — with the "everything here is made-up test
 * data" label impossible to miss. No AI, no live data.
 */

const SURFACES = {
  acp: {
    label: "ACP static feed",
    plain: "OpenAI/Stripe product-feed shape",
    report: toReportView(acpJson as unknown as VerifierReport),
  },
  ucp: {
    label: "UCP catalog response",
    plain: "constructed simulation of the Google-led live-catalog shape (normalized, not wire format)",
    report: toReportView(ucpJson as unknown as VerifierReport),
  },
} as const;

type SurfaceKey = keyof typeof SURFACES;

function SeverityBadge({ severity }: { severity: FindingRow["severity"] }) {
  return <span className={`rpt-sev ${severity}`}>{severity}</span>;
}

function FindingCard({ row, index }: { row: FindingRow; index: number }) {
  return (
    <li className="rpt-finding">
      <div className="rpt-finding-lead">
        <span className="rpt-idx">{String(index + 1).padStart(2, "0")}</span>
        {/* C4: the plain-words line leads every finding. */}
        <p className="rpt-plain">{row.plainLine}</p>
        <SeverityBadge severity={row.severity} />
      </div>
      {/* C2: the four evidence fields, always visible — claim · reference row · rule · severity. */}
      <dl className="rpt-receipts" aria-label="evidence">
        <div className="rpt-rc">
          <dt>claim</dt>
          <dd>
            <span className="rpt-mono">{row.claimId}</span>
            <span className="rpt-mono-sub">
              {/* M1 P2: the claim's SOURCE surface is part of the receipt —
                  ACP/UCP rows share field paths, so "which copy said it"
                  must be visible, not implied. */}
              {row.claimSource} · {row.claimField} = {row.claimValue}
            </span>
          </dd>
        </div>
        <div className="rpt-rc">
          <dt>reference row</dt>
          <dd className="rpt-mono">{row.referenceRowId}</dd>
        </div>
        <div className="rpt-rc">
          <dt>rule / spec-clause</dt>
          <dd className="rpt-mono">{row.ruleId}</dd>
        </div>
        <div className="rpt-rc">
          <dt>class</dt>
          <dd className="rpt-mono">{row.category || "—"}</dd>
        </div>
      </dl>
    </li>
  );
}

function Verdict({ report }: { report: ReportViewModel }) {
  const { tally } = report;
  return (
    <div className={`rpt-verdict ${report.ok ? "ok" : "fail"}`}>
      <span className="rpt-verdict-flag">{report.ok ? "PASS" : "FAIL"}</span>
      <span className="rpt-verdict-count">
        {report.ok
          ? "no drift detected"
          : `${report.findingCount} finding${report.findingCount === 1 ? "" : "s"}`}
      </span>
      {!report.ok ? (
        <span className="rpt-verdict-tally">
          {tally.error} error · {tally.warn} warn · {tally.info} info
        </span>
      ) : null}
    </div>
  );
}

export function ReportView() {
  const [surface, setSurface] = useState<SurfaceKey>("acp");
  const active = SURFACES[surface];
  const report = active.report;

  return (
    <main className="rpt-wrap" id="report">
      {/* C10: the SIMULATED label — visually unmissable, and it survives print. */}
      <div className="rpt-sim" role="note">
        <span className="rpt-sim-tag">SIMULATED</span>
        <span className="rpt-sim-text">
          Synthetic test data — an invented restaurant, invented menu, invented prices. Not real
          DoorDash / Square / Uber&nbsp;Eats / Grubhub data, access, or business impact. The
          verification rules and the pinned data-format standard are real; the restaurant, its
          menu, and its records are invented.
        </span>
      </div>

      <header className="rpt-head">
        <p className="rpt-eyebrow">Verifier report · listings truth check</p>
        <h1 className="rpt-title">What the copy says vs. what the restaurant&rsquo;s records say</h1>
        <p className="rpt-intro">
          A serving copy of a menu (what an AI shopping assistant would read) checked, line by line,
          against the restaurant&rsquo;s own system-of-record. Below is every difference the checker
          caught &mdash; each in plain words first, then the exact receipts. Deterministic and $0,
          with no AI calls in this verifier runtime: the same input always gives this same report.
        </p>
      </header>

      {/* Surface toggle — the same SOR, two serving surfaces (C3). */}
      <div className="rpt-toolbar" role="tablist" aria-label="serving surface">
        {(Object.keys(SURFACES) as SurfaceKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={surface === key}
            className={`rpt-tab ${surface === key ? "active" : ""}`}
            onClick={() => setSurface(key)}
          >
            {SURFACES[key].label}
          </button>
        ))}
      </div>

      {/* The Ledger modular grid: a caption rail against one continuous hairline,
          every block flush-left. The rail labels are layout armature (they mirror
          the owner-picked sample's rails), not report copy. */}
      <section className="rpt-sec" aria-labelledby="rpt-rail-verdict">
        <h2 id="rpt-rail-verdict" className="rpt-rail">
          Verdict
        </h2>
        <div className="rpt-bodycol">
          <Verdict report={report} />
        </div>
      </section>

      {/* C10 header surface — spec pin · matching mode · simulated flag — as a ledger. */}
      <section className="rpt-sec" aria-labelledby="rpt-rail-meta">
        <h2 id="rpt-rail-meta" className="rpt-rail">
          Meta
        </h2>
        <div className="rpt-bodycol">
          <dl className="rpt-meta">
            <div className="rpt-mrow">
              <dt>surface</dt>
              <dd>
                {active.label} <span className="rpt-rc-sub">({active.plain})</span>
              </dd>
            </div>
            <div className="rpt-mrow">
              <dt>spec version</dt>
              <dd className="rpt-mono">{report.specVersion}</dd>
            </div>
            <div className="rpt-mrow">
              <dt>matching mode</dt>
              <dd>
                <span className="rpt-mono">{report.matchingMode}</span>
                <span className="rpt-rc-sub">{report.matchingModePlain}</span>
              </dd>
            </div>
            <div className="rpt-mrow">
              <dt>data</dt>
              <dd>
                <span className="rpt-mono">simulated: {String(report.simulated)}</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rpt-sec" aria-labelledby="rpt-rail-findings">
        <h2 id="rpt-rail-findings" className="rpt-rail">
          Findings
        </h2>
        <div className="rpt-bodycol">
          <ol className="rpt-findings">
            {report.rows.map((row, i) => (
              <FindingCard key={`${row.claimId}:${row.ruleId}`} row={row} index={i} />
            ))}
          </ol>
        </div>
      </section>

      <footer className="rpt-sec rpt-foot">
        <div className="rpt-rail" aria-hidden="true" />
        <div className="rpt-bodycol">
          <p>
          Every row above carries its four receipts &mdash; the claim, the catalog row it was checked
          against, the rule it broke, and how severe it is. No language model runs in this verifier
          &mdash; the comparison is exact, deterministic logic. Simulated prototype, run on demand
          &mdash; not a live service. Human-led, AI-assisted, professionally reviewed.
          </p>
        </div>
      </footer>
    </main>
  );
}
