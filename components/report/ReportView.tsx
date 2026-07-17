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
 * (see the `@media print` block in globals.css). The data is the bundled report
 * fixtures, imported statically at build: zero LLM, zero network, $0 — the
 * report-rendering path imports no provider/LLM module (proven by
 * evals/packs/report-view-c1.test.ts). A surface toggle switches between the two
 * serving surfaces the same source-of-record was checked against (ACP static feed
 * / UCP catalog response); each renders as its own one-page report.
 *
 * Disclaimer-free (redesign Slice D, decision-log 2026-07-14): the rendered
 * SIMULATED banner was removed. The output is a genuine deterministic computation
 * on illustrative input — never asserted as live/real; no false claim (C10 green).
 *
 * Plain: shows the checker's result as a printable one-pager — a plain sentence
 * per catch, then the exact receipts. No AI in the verifier, no live data.
 */

const SURFACES = {
  acp: {
    label: "ACP static feed",
    plain: "agent-commerce product feed format",
    report: toReportView(acpJson as unknown as VerifierReport),
  },
  ucp: {
    label: "UCP catalog response",
    plain: "open live-catalog shape (normalized, not wire format)",
    report: toReportView(ucpJson as unknown as VerifierReport),
  },
} as const;

type SurfaceKey = keyof typeof SURFACES;

// Display-layer copy: the matching-mode enum is an internal token; render it as a
// reader-facing description of HOW records were matched (no internal labels).
const MATCHING_MODE_DISPLAY: Record<string, { value: string; plain: string }> = {
  "synthetic-controlled": {
    value: "exact — shared item IDs",
    plain: "the copy and the catalog share item IDs, so matching is exact (no entity resolution)",
  },
  "real-world": {
    value: "entity-resolved",
    plain: "the copy and the records are matched by resolved identity",
  },
};

// Display-layer copy cleanup for finding text that comes from the committed data:
// keep the meaning, present it in the site's plain product voice. This is an
// EXAMPLE report on illustrative input, so the finding lines are reworded away
// from live-operational framing ("being served to customers" / "still served" /
// "vs the real") toward serving-copy-vs-record reference language.
function cleanCopy(s: string): string {
  return s
    .replace(/\bbeing served to customers\b/gi, "present in the serving copy")
    .replace(/\bstill served\b/gi, "still present in the serving copy")
    .replace(/\bvs the real\b/gi, "vs the record")
    .replace(/\bsimulated\b/gi, "example");
}

function SeverityBadge({ severity }: { severity: FindingRow["severity"] }) {
  return <span className={`rpt-sev ${severity}`}>{severity}</span>;
}

function FindingCard({ row, index }: { row: FindingRow; index: number }) {
  return (
    <li className="rpt-finding">
      <div className="rpt-finding-lead">
        <span className="rpt-idx">{String(index + 1).padStart(2, "0")}</span>
        {/* C4: the plain-words line leads every finding. */}
        <p className="rpt-plain">{cleanCopy(row.plainLine)}</p>
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
      <header className="rpt-head">
        <p className="rpt-eyebrow">Verifier report · listings truth check</p>
        <h1 className="rpt-title">What the copy says vs. what the restaurant&rsquo;s records say</h1>
        <p className="rpt-intro">
          An example serving copy of a menu (what an AI shopping assistant would read), checked line
          by line against the restaurant&rsquo;s own records. Below is every difference the checker
          caught &mdash; each in plain words first, then the exact receipts. Deterministic and $0,
          with no AI calls in this verifier runtime: the same input always gives this same report.
        </p>
      </header>

      {/* Surface toggle — the same SOR, two serving surfaces (C3). Honest toggle
          buttons (NEW-10): a role="group" of native buttons using aria-pressed —
          not a faked tablist (no tabpanels/ids/arrow-key model exists here). */}
      <div className="rpt-toolbar" role="group" aria-label="Serving surface">
        {(Object.keys(SURFACES) as SurfaceKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={surface === key}
            className={`rpt-tab ${surface === key ? "active" : ""}`}
            onClick={() => setSurface(key)}
          >
            {SURFACES[key].label}
          </button>
        ))}
      </div>
      {/* No-JS: the surface toggle is inert without hydration — hide the dead buttons
          and say plainly which surface this static view shows. */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".rpt-toolbar{display:none}" }} />
        <p className="rpt-intro">
          Scripting is off, so this static view shows the {SURFACES[surface].label} check; the
          second serving surface is available with scripting on.
        </p>
      </noscript>

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

      {/* Header surface — surface · spec pin · matching mode — as a ledger. */}
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
                <span className="rpt-mono">
                  {MATCHING_MODE_DISPLAY[report.matchingMode]?.value ?? report.matchingMode}
                </span>
                <span className="rpt-rc-sub">
                  {MATCHING_MODE_DISPLAY[report.matchingMode]?.plain ?? report.matchingModePlain}
                </span>
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
          Every row above carries its four receipts &mdash; the claim, the record row it was checked
          against, the rule it caught, and how severe it is. No language model runs in this verifier
          &mdash; the comparison is exact, deterministic logic, and the same input always produces
          this same report.
          </p>
        </div>
      </footer>
    </main>
  );
}
