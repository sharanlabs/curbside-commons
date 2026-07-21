"use client";

import { useState } from "react";

/**
 * The accession ledger — all sixteen findings as register rows with severity
 * filters (v9 takeover, 2026-07-20). Rows arrive as props from
 * lib/landing/specimen.ts FINDINGS_INDEX — the drift-locked derived index
 * (evals/packs/landing-browse-drift-lock.test.ts pins it to the committed
 * landing golden), so the rendered plain lines can never drift from the
 * engine's own report.
 *
 * No-JS (the recorded defect class, D2-safe by construction): the filter
 * toolbar is hidden by a <noscript> style — SSR shows all sixteen rows with
 * no dead controls; scripting reveals the working filters.
 */

export type LedgerRow = {
  index: number;
  severity: string; // "error" | "warn"
  ruleId: string;
  plain: string;
  onBench: boolean;
};

type Filter = "all" | "error" | "warn";

export function Ledger({ rows }: { rows: LedgerRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const errors = rows.filter((r) => r.severity === "error").length;
  const warns = rows.filter((r) => r.severity === "warn").length;

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: `ALL · ${rows.length}` },
    { id: "error", label: `ERRORS · ${errors}` },
    { id: "warn", label: `WARNINGS · ${warns}` },
  ];

  const visible = rows.filter((r) => filter === "all" || r.severity === filter);

  return (
    <>
      <div className="idx-tools">
        <p className="acc r" aria-hidden="true">
          REGISTER — {rows.length} ROWS · CASE 001
        </p>
        <div className="flt-row" role="group" aria-label="Filter findings by severity">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className="flt"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <noscript>
        {/* Without scripting the filters are dead controls — hide them; all
            rows below render regardless (opens-complete). */}
        <style dangerouslySetInnerHTML={{ __html: ".idx-tools{display:none!important}" }} />
      </noscript>
      <div className="f-head" aria-hidden="true">
        <span>№</span>
        <span>SEVERITY</span>
        <span>RULE ID</span>
        <span>WHAT THE RECEIPT SAYS</span>
      </div>
      <ol className="idx-list">
        {visible.map((r) => (
          <li className={`f-row${r.onBench ? " bench" : ""}`} key={r.index} data-sev={r.severity}>
            <span className="f-no">{String(r.index).padStart(2, "0")}</span>
            <span className={`sev ${r.severity}`}>
              {r.severity === "warn" ? "WARN" : "ERROR"}
            </span>
            <span className="f-rule">{r.ruleId}</span>
            <span className="f-plain">
              {r.plain}
              {r.onBench ? <span className="f-mark">ON THE RECEIPT ABOVE</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
