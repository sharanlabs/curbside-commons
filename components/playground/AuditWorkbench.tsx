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
 *
 * WHAT MOVED, AND WHAT DID NOT (walkthrough redesign, 2026-08-02). The page is
 * now six stations, and the verdict belongs to a station of its own — so the
 * RESULT RENDERING left this file for `components/landing/VerdictSlab.tsx`. The
 * ENGINE WIRING did not move and was not duplicated: this component still holds
 * the only parse, the only `verifyAcpFeed` call, and the only definition of what
 * a run means. It publishes the outcome on the run bus; the ticker, the slab and
 * the delivery station read it. One owner, several readers.
 *
 * THE CONTROL IS NEVER DEAD. It used to be `disabled` until a feed arrived,
 * which put the page's primary verb out of reach at first paint (DESIGN.md open
 * item 1). With empty slots it now reads "Run the bundled pair" and a click
 * loads the bundled pair and runs it — the door and the verb agree, so a
 * first-time reader can see the whole instrument work in one click.
 */
import { useRef, useState } from "react";
import type { VerifierReport } from "@/lib/verifier-core/report";
import type { SyntheticCatalog } from "@/lib/packs/listings/types";
import { deriveChecks, publishRun, IDLE_RUN } from "@/components/landing/run-bus";
import { FileDrop, type SlotStatus } from "./FileDrop";
import type { RunOrigin } from "./verify-in-browser";
import {
  SOR_CATALOG,
  catalogSampleText,
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


/** Reduced motion is read at click time — the reader can change it mid-session. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Stagger the ticker uses per line, and the tail it settles after. */
const TICK_MS = 150;
const TICK_TAIL_MS = 250;

export function AuditWorkbench() {
  const [feed, setFeed] = useState<SlotState>(EMPTY);
  const [record, setRecord] = useState<SlotState>(EMPTY);
  const [hasRun, setHasRun] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  /**
   * Monotonic run counter — the same shape `FileDrop` uses for out-of-order
   * `FileReader` results, and here for the same reason.
   *
   * The ticker's settle is a TIMER, so a run publishes "running" now and "done"
   * about a second later. Without a token, this sequence resurrects a dead
   * verdict: run → (before the timer fires) edit the feed → `invalidate()`
   * publishes IDLE → the stale timer fires and republishes the OLD result,
   * which is now sitting beside inputs that never produced it. That is exactly
   * the stale-verdict hazard the invalidate rule exists to prevent, arriving
   * through the back door the animation opened.
   */
  const generation = useRef(0);

  /** Any new input invalidates the verdict on screen — a stale verdict beside
   *  changed inputs is a lie the reader has no way to detect. */
  function invalidate() {
    generation.current += 1;
    setHasRun(false);
    setRunError(null);
    publishRun(IDLE_RUN);
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

  /**
   * Run one audit from EXPLICIT text, never from state.
   *
   * The bundled-pair path fills both slots and runs in the same click, and React
   * state is not readable until the next render — so reading `feed.text` here
   * would audit the PREVIOUS contents. Passing the bytes in is what makes the
   * one-click path correct rather than accidentally-correct.
   */
  function execute(
    feedSrc: { text: string; source: "sample" | "reader" },
    recordSrc: { text: string; source: "sample" | "reader" },
  ) {
    const token = ++generation.current;
    setRunError(null);
    const parsedFeed = parseAcpFeedText(feedSrc.text);
    if (!parsedFeed.ok) {
      setHasRun(false);
      publishRun(IDLE_RUN);
      setRunError(`The feed could not be read. ${parsedFeed.error}`);
      return;
    }

    // An empty record slot is not an error — it means "check against the
    // records we ship", which is the honest default and stays labelled as such.
    let catalog: SyntheticCatalog = SOR_CATALOG;
    // Origin comes from the SLOT, not from the parsed bytes: an empty slot is
    // the bundled catalog, a filled one is whatever action filled it.
    let catalogOrigin: RunOrigin["catalog"] = "sample";
    if (recordSrc.text.trim()) {
      const parsedCatalog = parseCatalogText(recordSrc.text);
      if (!parsedCatalog.ok) {
        setHasRun(false);
        publishRun(IDLE_RUN);
        setRunError(`The record could not be read. ${parsedCatalog.error}`);
        return;
      }
      catalog = parsedCatalog.catalog;
      catalogOrigin = recordSrc.source;
    }
    const origin: RunOrigin = { feed: feedSrc.source, catalog: catalogOrigin };

    let report: VerifierReport;
    try {
      report = verifyAcpFeed(parsedFeed.feed, catalog, origin);
    } catch (e) {
      setHasRun(false);
      publishRun(IDLE_RUN);
      setRunError(
        `The verifier could not process this pair: ${e instanceof Error ? e.message : String(e)}`,
      );
      return;
    }

    const checks = deriveChecks(
      report,
      parsedFeed.feed.items.map((i) => i.item_id),
    );
    const settled = {
      phase: "done" as const,
      report,
      origin,
      feedRows: parsedFeed.feed.items.length,
      recordRows: catalog.items.length,
      checks,
      error: null,
    };
    setHasRun(true);

    // The verdict is already computed — the engine is synchronous. The RUNNING
    // window exists so the ticker can narrate the checks and the process strip
    // can show the run happening; it never gates the result, which is why the
    // report travels in the running snapshot too.
    if (prefersReducedMotion()) {
      publishRun(settled);
      return;
    }
    publishRun({ ...settled, phase: "running" });
    window.setTimeout(() => {
      // A run the reader has already invalidated must never come back.
      if (token !== generation.current) return;
      publishRun(settled);
    }, checks.length * TICK_MS + TICK_TAIL_MS);
  }

  /** The bundled pair, loaded and run in one click — the empty-slot path. */
  function runBundledPair() {
    const feedSrc = sampleFeedText();
    const recordSrc = catalogSampleText();
    feedText(feedSrc, "bundled-feed.json", "sample");
    recordText(recordSrc, "bundled-catalog.json", "sample");
    execute({ text: feedSrc, source: "sample" }, { text: recordSrc, source: "sample" });
  }

  /** Clear both slots and the verdict — the "run another" path. */
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
    document.body.appendChild(a);
    a.click();
    a.remove();
    // DEFERRED, not synchronous: revoking right after click() races the
    // browser's fetch of the blob URL — if revoke lands first the download is
    // silently cancelled. Diagnosed from CI runs 30773077581/30774987483,
    // where the loaded runner lost the race that a fast machine wins.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const loaded = feed.text.trim().length > 0;
  const runLabel = hasRun ? "Run again" : loaded ? "Run the audit" : "Run the bundled pair";

  return (
    <div className="wb wk-wb">
      <div className="wk-zones">
        <FileDrop
          side="The feed"
          sideNote="what an agent reads"
          title="A published menu feed"
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
          onLoadSample={() => feedText(sampleFeedText(), "bundled-feed.json", "sample")}
          sampleLabel="Load the bundled feed"
          onDownloadSample={() => saveTextFile(sampleFeedText(), "bundled-feed.json")}
        />
        <FileDrop
          side="The record"
          sideNote="the merchant’s truth"
          title="The system of record"
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
          onLoadSample={() => recordText(catalogSampleText(), "bundled-catalog.json", "sample")}
          sampleLabel="Load the bundled catalog"
          onDownloadSample={() => saveTextFile(catalogSampleText(), "bundled-catalog.json")}
        />
      </div>

      <div className="wk-runrow">
        <button
          type="button"
          className="wk-run"
          onClick={() =>
            loaded
              ? execute(
                  { text: feed.text, source: feed.source },
                  { text: record.text, source: record.source },
                )
              : runBundledPair()
          }
        >
          {runLabel}
        </button>
        <p className="wk-run-hint">
          <b>Runs in this tab.</b> Nothing you load leaves this page.
        </p>
        {loaded && (
          <button type="button" className="wk-clear" onClick={startOver}>
            Clear both slots
          </button>
        )}
      </div>

      {/* No-JS: the whole workbench runs in the reader's browser. Without
          scripting there is nothing to run, so dead controls are hidden and the
          requirement is stated plainly (the v9 defect class, session 26). */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".wk-zones,.wk-runrow{display:none}" }} />
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
    </div>
  );
}
