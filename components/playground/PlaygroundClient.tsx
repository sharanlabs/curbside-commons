"use client";

/**
 * Playground client — paste a feed, run the real engine, read the receipts
 * (owner commission 2026-07-13; the full slice the 2026-07-11 prototype
 * existed to evaluate).
 *
 * All verification happens in this browser tab via components/playground/
 * verify-in-browser.ts (the CLI's exact composition). No network requests, no
 * AI calls, nothing leaves the page. The reference is an illustrative catalog
 * shipped with the project — a pasted feed is genuinely verified against it,
 * and items outside those example records read as unknown or missing.
 */
import { useState } from "react";
import type { VerifierReport } from "@/lib/verifier-core/report";
import {
  cleanFinding,
  parseAcpFeedText,
  sampleFeedText,
  verifyAcpFeed,
} from "./verify-in-browser";

type RunSource = "sample" | "pasted";

interface RunState {
  readonly report: VerifierReport;
  readonly source: RunSource;
}

function severityCounts(report: VerifierReport): { error: number; warn: number; info: number } {
  const counts = { error: 0, warn: 0, info: 0 };
  for (const f of report.findings) counts[f.severity] += 1;
  return counts;
}

export function PlaygroundClient() {
  const [text, setText] = useState("");
  const [textIsSample, setTextIsSample] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadSample() {
    setText(sampleFeedText());
    setTextIsSample(true);
    setRun(null);
    setError(null);
  }

  function runVerification() {
    setRun(null);
    const parsed = parseAcpFeedText(text);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    // Determinism note: identical text → identical report, so re-running the
    // untouched sample always reproduces the committed golden verdict.
    // batch-F P2 fix: an engine failure must surface as an honest error, never
    // a crashed page or a fake verdict.
    try {
      const report = verifyAcpFeed(parsed.feed);
      setRun({ report, source: textIsSample && text === sampleFeedText() ? "sample" : "pasted" });
    } catch (e) {
      setError(
        `The verifier could not process this feed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  const counts = run ? severityCounts(run.report) : null;

  return (
    <div className="pg-wrap">
      <div className="pg-controls">
        <label className="pg-label" htmlFor="pg-feed">
          ACP feed JSON
        </label>
        <textarea
          id="pg-feed"
          className="pg-input"
          spellCheck={false}
          value={text}
          placeholder='Paste an ACP feed document here — a JSON object with an "items" array — or load the sample and edit it.'
          onChange={(e) => {
            setText(e.target.value);
            setTextIsSample(false);
          }}
        />
        <div className="pg-actions">
          <button type="button" className="lp-btn primary pg-run" onClick={runVerification}>
            Verify this feed
          </button>
          <button type="button" className="lp-btn ghost" onClick={loadSample}>
            Load the sample feed
          </button>
        </div>
        {/* No-JS: the whole playground runs in the reader's browser — without
            scripting there is nothing to run, so the dead controls are hidden and
            the requirement is stated plainly. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{ __html: ".pg-actions,.pg-input{display:none}" }}
          />
          <p className="pg-hint">
            The playground runs the verifier entirely in your browser and needs scripting turned
            on; nothing runs on a server either way.
          </p>
        </noscript>
        <p className="pg-hint">
          Tip: load the sample, change a price or a name, and verify again — the findings change
          with your edit. The engine is deterministic: the same text always produces the same
          report.
        </p>
      </div>

      {error !== null && (
        <div className="pg-error" role="alert">
          <strong>No verdict.</strong> {error}
        </div>
      )}

      {run !== null && counts !== null && (
        <section className="pg-result" aria-label="Verification result">
          <header className="pg-verdict-head">
            <p className={run.report.ok ? "pg-verdict ok" : "pg-verdict fail"}>
              {run.report.ok ? "PASS" : "FAIL"}
            </p>
            <p className="pg-tally">
              {run.report.findings.length} finding{run.report.findings.length === 1 ? "" : "s"} —{" "}
              {counts.error} error · {counts.warn} warn · {counts.info} info
            </p>
          </header>

          <p className="pg-prov">
            {run.source === "sample" ? (
              <>
                This is the sample feed — the verdict above is the reference result for it,
                recomputed in your browser just now, so it always matches the one shown on{" "}
                <a href="/report">/report</a>.
              </>
            ) : (
              <>
                Computed in your browser just now by the same deterministic engine — no AI calls, no
                network requests, nothing left this page. Your feed was checked against the
                illustrative merchant catalog: items outside those records honestly read as unknown
                or missing.
              </>
            )}
          </p>

          <dl className="pg-meta">
            <div>
              <dt>spec version</dt>
              <dd className="pg-mono">{run.report.specVersion}</dd>
            </div>
            <div>
              <dt>matching mode</dt>
              <dd className="pg-mono">exact — shared item IDs</dd>
            </div>
            <div>
              <dt>reference</dt>
              <dd className="pg-mono">illustrative catalog</dd>
            </div>
          </dl>

          {run.report.findings.length > 0 && (
            <ol className="pg-findings">
              {run.report.findings.map((f) => (
                <li key={`${f.claim.id}:${f.ruleId}:${f.claim.field}`} className="pg-finding">
                  <p className="pg-plain">
                    <span className={`pg-sev ${f.severity}`}>{f.severity}</span>{" "}
                    {cleanFinding(f.plainLine ?? "")}
                  </p>
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
                      <dt>checked against</dt>
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
              No drift detected — every claim in this feed matches the catalog records.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
