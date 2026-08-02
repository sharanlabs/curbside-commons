"use client";

/**
 * STATION 3 · VERDICT — the slab (walkthrough redesign, 2026-08-02).
 *
 * THE MOST DESIGNED OBJECT ON THE PAGE, because it is the one a reader came for.
 * It carries the mark (FAIL/PASS with its lamp), the tally, where each side of
 * the run came from, and two receipts with the evidence attached.
 *
 * WHERE IT CAME FROM. This rendering used to live inside `AuditWorkbench`,
 * directly beneath the drop zones. The six-station page gives the verdict a
 * station of its own, so the rendering moved here — but the ENGINE did not. The
 * workbench still holds the only parse and the only `verifyAcpFeed` call; this
 * component reads the result off the run bus and draws it. There is one run, and
 * one owner of it.
 *
 * IT IS COMPLETE BEFORE ANY RUN. The slab opens on the bundled pair's committed
 * verdict, passed in from the server as `idle`. So the page tells its whole
 * story on arrival — and keeps telling it with scripting turned off, where the
 * previous landing's explanatory half used to do that job.
 *
 * THE HONESTY SENTENCE IS PART OF THE OBJECT, not a footnote under it: the rules
 * and the arithmetic are real, the merchant is invented, and the link to the
 * full statement sits in the same strip as the provenance it qualifies.
 */
import Link from "next/link";
import type { VerdictView } from "@/lib/landing/verdict-view";
import { toVerdictView } from "@/lib/landing/verdict-view";
import { cleanFindingFor } from "@/components/playground/verify-in-browser";
import { useRun } from "./run-bus";

export function VerdictSlab({ idle }: { readonly idle: VerdictView }) {
  const { report, origin, feedRows, recordRows } = useRun();

  // A live run replaces the bundled view entirely — never merges with it. A
  // tally from one run beside a receipt from another is the exact confusion the
  // workbench's invalidate() rule exists to prevent.
  const view: VerdictView =
    report !== null && origin !== null
      ? toVerdictView({
          report,
          rows: feedRows,
          feedSide: origin.feed === "reader" ? "your upload" : "bundled feed",
          recordSide: origin.catalog === "reader" ? "your upload" : "bundled catalog",
          clean: (s) => cleanFindingFor(origin, s),
        })
      : idle;

  const live = report !== null;

  /** Keep the evidence. Object-URL only — no network leg, so the "nothing
   *  leaves this page" promise covers downloads too. */
  function downloadReport() {
    if (report === null) return;
    const url = URL.createObjectURL(
      new Blob([`${JSON.stringify(report, null, 2)}\n`], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "curbside-commons-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    /* `data-live` states whether this is the reader's OWN run or the bundled
       pair the page opens on. The slab is always present now — it has a complete
       idle state — so "is there a result?" is no longer answerable by the
       element's existence, and a test (or a reader) needs the distinction said
       out loud rather than inferred. */
    <section
      className="wk-slab"
      data-live={live ? "true" : "false"}
      aria-label={live ? "Audit result" : "The bundled pair's verdict"}
    >
      <div className="wk-slab-top">
        <p className="wk-verdict-mark">
          <span
            className={`wk-verdict-lamp ${view.fail ? "fail" : "ok"}`}
            aria-hidden="true"
          />
          <span className={`wk-verdict-word ${view.fail ? "fail" : "ok"}`}>
            {view.fail ? "FAIL" : "PASS"}
          </span>
        </p>
        <div className="wk-tally">
          <div>
            <span className="wk-n">{view.findings}</span>
            <span className="wk-k">Findings</span>
          </div>
          <div>
            <span className="wk-n err">{view.errors}</span>
            <span className="wk-k">Errors</span>
          </div>
          <div>
            <span className="wk-n wrn">{view.warnings}</span>
            <span className="wk-k">Warnings</span>
          </div>
          <div>
            <span className="wk-n">{view.rows}</span>
            <span className="wk-k">Rows read</span>
          </div>
        </div>
        <div className="wk-slab-acts">
          {live && (
            <button type="button" className="lp-btn ghost wk-dl" onClick={downloadReport}>
              Download the report
            </button>
          )}
          <Link className="wk-slab-cta" href="/report">
            See a full worked report &rarr;
          </Link>
        </div>
      </div>

      <div className="wk-prov">
        <span>feed side: {view.feedSide}</span>
        <span>record side: {view.recordSide}</span>
        {/* The C3 label describes the MATCHING MECHANISM — exact shared-id
            lookup — never who owns the data (gate finding 2). Ownership is the
            two rows beside it. The spec pin travels with every report, so a
            verdict can always be traced to the rules it was reached under. */}
        {live && report !== null ? (
          <>
            <span>matching: {report.matchingMode}</span>
            <span>spec {report.specVersion}</span>
          </>
        ) : (
          <span>spec pinned</span>
        )}
        <span className="wk-real">
          The rules and the arithmetic are real; the merchant is invented.{" "}
          <Link href="/docs">What is real &rarr;</Link>
        </span>
      </div>

      {/* THE RUN'S OWN PROVENANCE, in plain words. This sentence travelled here
          with the rendering it belongs to, and it is not decoration: a verdict
          that does not say which records it was reached against is the one
          thing this surface may never produce. Every phrase reads from the
          recorded ACTION (`origin`), never from an "is this slot non-empty"
          proxy — the distinction gate finding 4 was raised over, when clicking
          "use the bundled catalog" put "your own records" on screen beside a
          report correctly labelled otherwise. */}
      <p className="wk-prov-line">
        {live && origin !== null ? (
          <>
            {feedRows} feed rows checked against {recordRows}{" "}
            {origin.catalog === "reader" ? "of your own records" : "bundled records"}, computed in
            your browser just now — no AI calls, and nothing you uploaded left this page.
            {origin.catalog === "sample" &&
              " Items outside the bundled records honestly read as unknown or missing."}
          </>
        ) : (
          <>
            The bundled pair, as the engine committed it — {view.rows} feed rows against the bundled
            records. Run it above and the same check recomputes in your browser, on your own files
            if you bring them.
          </>
        )}
      </p>

      {view.receipts.length > 0 ? (
        <div className="wk-receipts">
          {view.receipts.map((r) => (
            <div className="wk-receipt" key={`${r.claimId}:${r.ruleId}`}>
              <p className="wk-rc-head">
                <Link className="wk-rc-rule" href={r.ruleHref}>
                  {r.ruleId}
                </Link>
                <span className={`wk-rc-sev ${r.severity}`}>{r.severity.toUpperCase()}</span>
              </p>
              <h3>{r.plain}</h3>
              <p className="wk-rc-math">
                <span className="wk-lbl">the feed says</span>
                <span className="wk-bad">{r.asserted}</span>
                <span className="wk-lbl">the field</span>
                <span>{r.field}</span>
                <span className="wk-lbl">checked against</span>
                <span>{r.referenceRowId}</span>
                <span className="wk-lbl">the claim is</span>
                <span>{r.claimId}</span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="wk-clean">
          No drift detected — every claim in this feed agrees with the records it was checked
          against.
        </p>
      )}

      {/* THE WHOLE SET, folded away. Two receipts are what the eye can take;
          the tally names more than two, and a tally this surface will not
          itemise is a claim without its evidence. */}
      {view.all.length > view.receipts.length && (
        <details className="wk-all">
          <summary>
            All {view.all.length} findings, as the engine listed them
          </summary>
          <ol className="wk-all-list">
            {view.all.map((f) => (
              <li key={`${f.claimId}:${f.ruleId}:${f.field}`}>
                <span className={`wk-all-sev ${f.severity}`}>{f.severity}</span>
                <span className="wk-all-plain">{f.plain}</span>
                <span className="wk-all-ids">
                  {f.claimId} · {f.ruleId}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
