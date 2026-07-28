"use client";

/**
 * The two-file audit workbench — the working tool (owner commission
 * 2026-07-27: "I WANT WORKING WEBSITE WHERE I WILL UPLOAD TEST FILES").
 *
 * WHAT CHANGED AND WHY. The previous surface took ONE file (a feed) and
 * checked it against a catalog compiled into the page. That is a demonstration
 * of a rule, not an audit of your data: upload your own feed and nearly every
 * row comes back "unknown or missing", because your items were never in our
 * five illustrative records. A real audit takes BOTH sides — the claims and
 * the records they are checked against — which is exactly what the CLI has
 * always done (`runCheck(feedPath, catalogPath, surface)`, cli.ts:37).
 *
 * HONESTY OF THE REPORT HEADER. When the record side is the reader's own, the
 * run is no longer ours and no longer matched by ids we minted, so the report
 * must not say it was. That is slice 1: `verifyAcpFeed` passes the provenance
 * describing the actual run (verify-in-browser.ts). Without it this component
 * would stamp a reader's real records with the committed corpus's own labels —
 * a claim broader than the thing backing it, the exact defect class this repo
 * has caught six times across sessions 34-35.
 *
 * (Lab vocabulary is deliberately absent from this file, comments included:
 * every byte here ships in the client bundle, and the C10 gate scans the
 * source, not just the rendered text.)
 *
 * ZERO NETWORK, STILL. Every byte is read with FileReader and verified in this
 * tab. Nothing is uploaded anywhere — "upload" here means "into the page", and
 * the import-graph guard proves the closure cannot reach a network at all.
 */
import { useState } from "react";
import type { VerifierReport } from "@/lib/verifier-core/report";
import type { SyntheticCatalog } from "@/lib/packs/listings/types";
import { FileDrop, type SlotStatus } from "./FileDrop";
import type { RunOrigin } from "./verify-in-browser";
import {
  SOR_CATALOG,
  catalogSampleText,
  cleanFindingFor,
  parseAcpFeedText,
  parseCatalogText,
  sampleFeedText,
  verifyAcpFeed,
} from "./verify-in-browser";

interface SlotState {
  readonly text: string;
  readonly fileName: string | null;
  readonly status: SlotStatus | null;
  /**
   * Where this slot's content came from, recorded FROM THE ACTION. Inferring it
   * from the bytes was wrong twice (gate findings 1-4): a reader's file that
   * happens to match the fixture is still theirs, and clicking "use the sample"
   * yields the fixture no matter what the parser hands back.
   */
  readonly source: "sample" | "reader";
}

const EMPTY: SlotState = { text: "", fileName: null, status: null, source: "reader" };

interface RunState {
  readonly report: VerifierReport;
  readonly origin: RunOrigin;
  readonly feedRows: number;
  readonly recordRows: number;
}

function severityCounts(report: VerifierReport) {
  const counts = { error: 0, warn: 0, info: 0 };
  for (const f of report.findings) counts[f.severity] += 1;
  return counts;
}

export function AuditWorkbench() {
  const [feed, setFeed] = useState<SlotState>(EMPTY);
  const [record, setRecord] = useState<SlotState>(EMPTY);
  const [run, setRun] = useState<RunState | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  /** Any new input invalidates the verdict on screen — a stale verdict beside
   *  changed inputs is a lie the reader has no way to detect. */
  function invalidate() {
    setRun(null);
    setRunError(null);
  }

  function feedText(text: string, fileName: string | null, source: "sample" | "reader" = "reader") {
    invalidate();
    const parsed = parseAcpFeedText(text);
    setFeed({
      text,
      fileName,
      source,
      status: !text.trim()
        ? null
        : parsed.ok
          ? { kind: "ok", summary: `${parsed.feed.items.length} rows read` }
          : { kind: "error", message: parsed.error },
    });
  }

  function recordText(
    text: string,
    fileName: string | null,
    source: "sample" | "reader" = "reader",
  ) {
    invalidate();
    const parsed = parseCatalogText(text);
    setRecord({
      text,
      fileName,
      source,
      status: !text.trim()
        ? null
        : parsed.ok
          ? { kind: "ok", summary: `${parsed.catalog.items.length} items read` }
          : { kind: "error", message: parsed.error },
    });
  }

  function runAudit() {
    invalidate();
    const parsedFeed = parseAcpFeedText(feed.text);
    if (!parsedFeed.ok) {
      setRunError(`The feed could not be read. ${parsedFeed.error}`);
      return;
    }

    // An empty record slot is not an error — it means "check against the
    // records we ship", which is the honest default and stays labelled as such.
    let catalog: SyntheticCatalog = SOR_CATALOG;
    // Origin comes from the SLOT, not from the parsed bytes: an empty slot is
    // the sample, a filled one is whatever action filled it.
    let catalogOrigin: RunOrigin["catalog"] = "sample";
    if (record.text.trim()) {
      const parsedCatalog = parseCatalogText(record.text);
      if (!parsedCatalog.ok) {
        setRunError(`The record could not be read. ${parsedCatalog.error}`);
        return;
      }
      catalog = parsedCatalog.catalog;
      catalogOrigin = record.source;
    }
    const origin: RunOrigin = { feed: feed.source, catalog: catalogOrigin };

    try {
      setRun({
        report: verifyAcpFeed(parsedFeed.feed, catalog, origin),
        origin,
        feedRows: parsedFeed.feed.items.length,
        recordRows: catalog.items.length,
      });
    } catch (e) {
      setRunError(
        `The verifier could not process this pair: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  /** Clear both slots and the verdict — the "run another" path. Without it the
   *  only way back to an empty bench was a page reload, which a reader has no
   *  reason to guess (walkthrough review, 2026-07-28). */
  function startOver() {
    setFeed(EMPTY);
    setRecord(EMPTY);
    invalidate();
  }

  /** Save text to a file in the reader's browser. Object-URL only — no network
   *  leg, so the "nothing leaves this page" promise covers downloads too. */
  function saveTextFile(text: string, fileName: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadReport() {
    if (run === null) return;
    saveTextFile(`${JSON.stringify(run.report, null, 2)}\n`, "curbside-commons-report.json");
  }

  const counts = run ? severityCounts(run.report) : null;
  const canRun = feed.text.trim().length > 0;

  return (
    <div className="wb">
      <div className="wb-slots">
        <FileDrop
          title="The feed"
          hint="What is served to the agent — the claims being made."
          textareaLabel="Feed JSON"
          value={feed.text}
          onText={feedText}
          onReadError={(m) => {
            invalidate();
            setFeed({
              text: "",
              fileName: null,
              source: "reader",
              status: { kind: "error", message: m },
            });
          }}
          onReadStart={invalidate}
          fileName={feed.fileName}
          status={feed.status}
          onLoadSample={() => feedText(sampleFeedText(), "sample-feed.json", "sample")}
          sampleLabel="Use the sample feed"
          onDownloadSample={() => saveTextFile(sampleFeedText(), "sample-feed.json")}
        />
        <FileDrop
          title="The record"
          hint="The merchant's own catalog — what the claims are checked against."
          textareaLabel="Catalog JSON"
          value={record.text}
          onText={recordText}
          onReadError={(m) => {
            invalidate();
            setRecord({
              text: "",
              fileName: null,
              source: "reader",
              status: { kind: "error", message: m },
            });
          }}
          onReadStart={invalidate}
          fileName={record.fileName}
          status={record.status}
          onLoadSample={() => recordText(catalogSampleText(), "sample-catalog.json", "sample")}
          sampleLabel="Use the sample catalog"
          onDownloadSample={() => saveTextFile(catalogSampleText(), "sample-catalog.json")}
        />
      </div>

      <div className="wb-run">
        <button type="button" className="lp-btn primary" onClick={runAudit} disabled={!canRun}>
          Run the audit
        </button>
        {/* Three states, three different sentences. A note that reads the same
            whether or not the button works tells the reader nothing about why
            it is waiting (screenshot review, 2026-07-27). */}
        {/* Reads from the slot's recorded SOURCE, not from "is it non-empty" —
            the same proxy the gate caught in the result panel (finding 4). With
            the sample catalog loaded, "your own records" was simply false. */}
        <p className="wb-run-note">
          {!canRun
            ? "Add a feed to run the audit — the record side is optional."
            : record.text.trim() && record.source === "reader"
              ? "Your feed will be checked against your own records."
              : "Your feed will be checked against the sample catalog shipped with this site."}
        </p>
      </div>

      {/* No-JS: the whole workbench runs in the reader's browser. Without
          scripting there is nothing to run, so dead controls are hidden and the
          requirement is stated plainly (the v9 defect class, session 26). */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".wb-slots,.wb-run{display:none}" }} />
        <p className="wb-hint">
          The audit runs entirely in your browser and needs scripting turned on. Nothing runs on a
          server either way.
        </p>
      </noscript>

      {runError !== null && (
        <div className="wb-error" role="alert">
          <strong>No verdict.</strong> {runError}
        </div>
      )}

      {run !== null && counts !== null && (
        <section className="wb-result" aria-label="Audit result">
          <header className="wb-verdict-head">
            <p className={run.report.ok ? "wb-verdict ok" : "wb-verdict fail"}>
              {run.report.ok ? "PASS" : "FAIL"}
            </p>
            <p className="wb-tally">
              {run.report.findings.length} finding{run.report.findings.length === 1 ? "" : "s"} —{" "}
              {counts.error} error · {counts.warn} warn · {counts.info} info
            </p>
            <button type="button" className="lp-btn ghost wb-dl" onClick={downloadReport}>
              Download the report
            </button>
          </header>

          {/* Every phrase here reads from `run.origin` — the recorded ACTION —
              so the prose and the report header can never disagree. They did:
              clicking "use the sample catalog" put "your own records" on screen
              beside a report correctly labelled otherwise (gate finding 4). */}
          <p className="wb-prov">
            {run.feedRows} feed rows checked against {run.recordRows}{" "}
            {run.origin.catalog === "reader" ? "of your own records" : "sample records"}, computed
            in your browser just now — no AI calls, no network requests, nothing left this page.
            {run.origin.catalog === "sample" &&
              " Items outside the sample records honestly read as unknown or missing."}
          </p>

          <dl className="wb-meta">
            <div>
              <dt>spec version</dt>
              <dd className="wb-mono">{run.report.specVersion}</dd>
            </div>
            <div>
              <dt>matching</dt>
              {/* The C3 label describes the MECHANISM (exact shared-id lookup),
                  never who owns the data — the distinction gate finding 2
                  corrected. Ownership is the two rows beside it. */}
              <dd className="wb-mono">{run.report.matchingMode}</dd>
            </div>
            <div>
              <dt>feed side</dt>
              <dd className="wb-mono">
                {run.origin.feed === "reader" ? "your upload" : "sample feed"}
              </dd>
            </div>
            <div>
              <dt>record side</dt>
              <dd className="wb-mono">
                {run.origin.catalog === "reader" ? "your upload" : "sample catalog"}
              </dd>
            </div>
          </dl>

          {run.report.findings.length > 0 ? (
            <ol className="wb-findings">
              {run.report.findings.map((f) => (
                <li key={`${f.claim.id}:${f.ruleId}:${f.claim.field}`} className="wb-finding">
                  <p className="wb-plain">
                    <span className={`wb-sev ${f.severity}`}>{f.severity}</span>{" "}
                    {cleanFindingFor(run.origin, f.plainLine ?? "")}
                  </p>
                  <dl className="wb-receipts">
                    <div>
                      <dt>claim</dt>
                      <dd className="wb-mono">
                        {f.claim.id} · {f.claim.field}
                      </dd>
                    </div>
                    <div>
                      <dt>asserted</dt>
                      <dd className="wb-mono">{JSON.stringify(f.claim.value)}</dd>
                    </div>
                    <div>
                      <dt>checked against</dt>
                      <dd className="wb-mono">{f.referenceRowId}</dd>
                    </div>
                    <div>
                      <dt>rule</dt>
                      <dd className="wb-mono">{f.ruleId}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          ) : (
            <p className="wb-clean">
              No drift detected — every claim in this feed agrees with the records it was checked
              against.
            </p>
          )}

          {/* WHAT NOW. A verdict with no next move is where the old surface
              stopped, and it is the step the owner named explicitly in the
              walkthrough review (2026-07-28). Three real continuations: keep
              the evidence, run again, or go read what the rules actually say. */}
          <nav className="wb-next" aria-label="Next steps">
            <button type="button" className="lp-btn ghost" onClick={startOver}>
              Audit another pair
            </button>
            <a className="wb-next-link" href="/report">
              See a full worked report
            </a>
            <a className="wb-next-link" href="/playground">
              How the rules are applied
            </a>
            <a className="wb-next-link" href="/docs">
              What is real, what is invented
            </a>
          </nav>
        </section>
      )}
    </div>
  );
}
