"use client";

/**
 * Fee playground client (NYC showcase N2) — paste a fee statement, run the real
 * audit engine in this browser tab, read the receipts. No network requests, no
 * AI calls, nothing leaves the page (components/fees/audit-in-browser.ts is the
 * whole bridge; its import closure is walked fail-closed by the pack tests).
 */
import { useState } from "react";
import NumberFlow from "@number-flow/react";
import type { FeeAuditReport } from "@/lib/packs/fees";
import { VERDICT_TAG_DISPLAY, VERDICT_TALLY_WORD, cleanFeeCopy } from "./fee-report-data";
import { auditStatementText, sampleStatementText } from "./audit-in-browser";

type RunSource = "sample" | "pasted";

interface RunState {
  readonly report: FeeAuditReport;
  readonly source: RunSource;
}

export function FeePlaygroundClient() {
  const [text, setText] = useState("");
  const [textIsSample, setTextIsSample] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadSample() {
    setText(sampleStatementText());
    setTextIsSample(true);
    setRun(null);
    setError(null);
  }

  function runAudit() {
    setRun(null);
    const result = auditStatementText(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setRun({
      report: result.report,
      source: textIsSample && text === sampleStatementText() ? "sample" : "pasted",
    });
  }

  // NumberFlow's first real use (session-22 ③): each tally figure animates when a
  // re-audit changes it — an honest transition on a surface whose values genuinely
  // move (reduced-motion readers get the instant swap; NumberFlow honors the
  // preference itself). NumberFlow keeps its digits in shadow DOM, so the visible
  // line is marked presentation-only and an sr-only mirror carries the sentence
  // as one natural line for assistive tech and text tooling.
  const tallyFlows = (report: FeeAuditReport) =>
    (Object.keys(VERDICT_TALLY_WORD) as Array<keyof typeof VERDICT_TALLY_WORD>).map((v, i) => (
      <span key={v}>
        {i > 0 ? " · " : ""}
        <NumberFlow value={report.verdictTally[v]} /> {VERDICT_TALLY_WORD[v]}
      </span>
    ));

  const tallyText = (report: FeeAuditReport): string =>
    `${report.findings.length} finding${report.findings.length === 1 ? "" : "s"} — ` +
    (Object.keys(VERDICT_TALLY_WORD) as Array<keyof typeof VERDICT_TALLY_WORD>)
      .map((v) => `${report.verdictTally[v]} ${VERDICT_TALLY_WORD[v]}`)
      .join(" · ");

  return (
    <div className="pg-wrap">
      <div className="pg-controls">
        <label className="pg-label" htmlFor="fee-statement">
          Fee statement JSON
        </label>
        <textarea
          id="fee-statement"
          className="pg-input"
          spellCheck={false}
          value={text}
          placeholder='Paste a monthly fee-statement document here — a JSON object with "meta" and "lines" — or load the example statement and edit it.'
          onChange={(e) => {
            setText(e.target.value);
            setTextIsSample(false);
          }}
        />
        <div className="pg-actions">
          <button type="button" className="lp-btn primary pg-run" onClick={runAudit}>
            Audit this statement
          </button>
          <button type="button" className="lp-btn ghost" onClick={loadSample}>
            Load the example statement
          </button>
        </div>
        <noscript>
          {/* Batch P3 (2026-07-16): hide the WHOLE JS-only control group — the
              textarea, buttons, its label, and the edit-and-re-audit tip — so
              no-JS readers see only the honest fallback line, never an orphaned
              label or an impossible instruction. */}
          <style
            dangerouslySetInnerHTML={{
              __html: ".pg-actions,.pg-input,.pg-label,.pg-tip{display:none}",
            }}
          />
          <p className="pg-hint">
            The pasted-statement audit runs entirely in your browser and needs scripting turned
            on; the four example months above are available either way.
          </p>
        </noscript>
        <p className="pg-hint pg-tip">
          Tip: load the example statement, change one fee amount or a refund date, and audit again — the
          verdicts move with your edit. The audit is deterministic: the same statement always
          produces the same result.
        </p>
      </div>

      {error !== null && (
        <div className="pg-error" role="alert">
          <strong>No verdict.</strong> {error}
        </div>
      )}

      {run !== null && (
        <section className="pg-result" aria-label="Fee audit result">
          <header className="pg-verdict-head">
            <p className={run.report.ok ? "pg-verdict ok" : "pg-verdict fail"}>
              {run.report.ok ? "PASS" : "FAIL"}
            </p>
            <p className="pg-tally">
              <span aria-hidden="true">
                <NumberFlow value={run.report.findings.length} /> finding
                {run.report.findings.length === 1 ? "" : "s"} — {tallyFlows(run.report)}
              </span>
              <span className="pg-tally-text">{tallyText(run.report)}</span>
            </p>
          </header>

          <p className="pg-prov">
            {run.source === "sample" ? (
              <>
                This is the sample statement — the audit above is the reference result for it,
                recomputed in your browser just now, so it always matches the &ldquo;Over the
                caps&rdquo; example month rendered above.
              </>
            ) : (
              <>
                Computed in your browser just now by the same deterministic audit — no AI calls,
                no network requests, nothing left this page. The caps are the codified NYC
                &sect;20-563.3 rules; your statement was read exactly as written.
              </>
            )}
          </p>

          {run.report.findings.length > 0 && (
            <ol className="pg-findings">
              {run.report.findings.map((f) => (
                <li key={`${f.claim.id}:${f.ruleId}`} className="pg-finding">
                  <p className="pg-plain">
                    <span className={`pg-sev ${f.severity}`}>{f.severity}</span>{" "}
                    {cleanFeeCopy(f.plainLine)}
                  </p>
                  <p className={`fee-vtag ${f.verdict}`}>{VERDICT_TAG_DISPLAY[f.verdict]}</p>
                  <dl className="pg-receipts">
                    <div>
                      <dt>claim</dt>
                      <dd className="pg-mono">
                        {f.claim.id} · {f.claim.field}
                      </dd>
                    </div>
                    <div>
                      <dt>asserted</dt>
                      <dd className="pg-mono">{JSON.stringify(f.claim.value)}</dd>
                    </div>
                    <div>
                      <dt>the clause</dt>
                      <dd className="pg-mono">{f.referenceRowId}</dd>
                    </div>
                    <div>
                      <dt>rule</dt>
                      <dd className="pg-mono">{f.ruleId}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          )}

          {run.report.findings.length === 0 && (
            <p className="pg-clean">
              No findings — every fee line on this statement is within its cap as declared. Duties
              needing evidence beyond the statement stay unresolved either way.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
