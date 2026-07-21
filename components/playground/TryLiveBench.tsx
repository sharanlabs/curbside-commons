"use client";

/**
 * The chapter-03 reader-operated bench (build piece 3, 2026-07-20; design
 * source `mockups/takeover-03-try-2026-07-18.html`).
 *
 * LIVE BEYOND THE MOCKUP (recorded deviation, spec §8's preferred tier): the
 * mockup replayed recorded runs for the ghost/drop presets; here EVERY preset
 * runs the REAL engine in this tab, on an edited copy of the committed feed —
 * the same acpFeedToClaims → runListingsVerification composition the CLI runs
 * (components/playground/verify-in-browser.ts, golden-equality proven). The
 * REPLAY register stays on /proof, where runs are genuinely historical.
 *
 * Presets:
 *   sample — the committed feed, unedited (the recomputed reference result);
 *   price  — the served price of one line is yours to edit; the whole feed
 *            re-verifies live as you type;
 *   ghost  — one row the catalog never had is added to the feed;
 *   drop   — one clean row is removed from the feed.
 * The verdict panel reports the full tally plus the DELTA the reader's edit
 * caused, derived by comparing finding keys against the reference run.
 *
 * Floors: SSR renders the settled reference result (verdict, tally, receipt) —
 * no-JS and print read a complete story; the preset cards, ticks, input, and
 * print button are interactive-only and hidden without JS (<noscript> CSS, no
 * dead controls). Reduced motion: no stamp/tick choreography, instant swaps.
 */
import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useMounted, usePrefersReducedMotion } from "@/components/client-flags";
import type { VerifierReport } from "@/lib/verifier-core/report";
import type { AcpFeed } from "@/lib/packs/listings/acp-feed";
import { cleanFinding, SAMPLE_FEED, SOR_CATALOG, verifyAcpFeed } from "./verify-in-browser";

type Scenario = "sample" | "price" | "ghost" | "drop";

const PRICE_ITEM_ID = "item-001-v1";
const GHOST_ID = "item-999-v1";

// DERIVED from the committed catalog (never typed): the record count the bench
// is pinned to, and the merchant's own row for the editable price line.
export const CATALOG_RECORDS = SOR_CATALOG.items.reduce(
  (n, item) => n + item.variations.length,
  0,
);
const PRICE_RECORD = (() => {
  for (const item of SOR_CATALOG.items) {
    const v = item.variations.find((x) => x.id === PRICE_ITEM_ID);
    if (v) return v;
  }
  throw new Error(`bench: catalog has no variation ${PRICE_ITEM_ID}`);
})();
const RECORD_CENTS = PRICE_RECORD.priceCents;
const RECORD_DOLLARS = `$${(RECORD_CENTS / 100).toFixed(2)}`;

type FeedRow = AcpFeed["items"][number] & {
  item_id: string;
  title?: string;
  price?: string;
  group_id?: string;
};

const findingKey = (f: VerifierReport["findings"][number]) =>
  `${f.claim.id}:${f.ruleId}:${f.claim.field}`;

function counts(report: VerifierReport): { error: number; warn: number; info: number } {
  const c = { error: 0, warn: 0, info: 0 };
  for (const f of report.findings) c[f.severity] += 1;
  return c;
}

function tallyLine(report: VerifierReport): string {
  const c = counts(report);
  const n = report.findings.length;
  return `${n} finding${n === 1 ? "" : "s"} — ${c.error} error · ${c.warn} warn · ${c.info} info`;
}

/** The reference run — computed once per session; identical text → identical report. */
function useReference(): {
  report: VerifierReport;
  keys: Set<string>;
  cleanRow: FeedRow;
} {
  return useMemo(() => {
    const report = verifyAcpFeed(SAMPLE_FEED);
    const keys = new Set(report.findings.map(findingKey));
    const rows = SAMPLE_FEED.items as readonly FeedRow[];
    const named = new Set(
      report.findings.map((f) => f.claim.id.split("#")[0]),
    );
    const cleanRow =
      rows.find((r) => !named.has(r.item_id) && r.item_id !== PRICE_ITEM_ID) ?? rows[0];
    return { report, keys, cleanRow };
  }, []);
}

function buildFeed(scenario: Scenario, priceText: string, cleanRow: FeedRow): AcpFeed | null {
  if (scenario === "sample") return SAMPLE_FEED;
  if (scenario === "price") {
    if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(priceText.trim())) return null;
    return {
      ...SAMPLE_FEED,
      items: (SAMPLE_FEED.items as readonly FeedRow[]).map((r) =>
        r.item_id === PRICE_ITEM_ID ? { ...r, price: priceText.trim() } : r,
      ),
    } as AcpFeed;
  }
  if (scenario === "ghost") {
    const ghost: FeedRow = {
      ...cleanRow,
      item_id: GHOST_ID,
      group_id: "item-999",
      title: "Midnight Special (Large)",
    };
    return { ...SAMPLE_FEED, items: [...(SAMPLE_FEED.items as readonly FeedRow[]), ghost] } as AcpFeed;
  }
  return {
    ...SAMPLE_FEED,
    items: (SAMPLE_FEED.items as readonly FeedRow[]).filter(
      (r) => r.item_id !== cleanRow.item_id,
    ),
  } as AcpFeed;
}

export function TryLiveBench() {
  const { report: refReport, keys: refKeys, cleanRow } = useReference();
  const [scenario, setScenario] = useState<Scenario>("sample");
  // Defaults DERIVED from the record: the hundredfold read = the cent count
  // written as a decimal price; the true price = the cents as dollars.
  const hundredfold = RECORD_CENTS.toFixed(2);
  const truePrice = (RECORD_CENTS / 100).toFixed(2);
  const [priceText, setPriceText] = useState(hundredfold);
  const [stampKey, setStampKey] = useState(0);
  const [ticksOn, setTicksOn] = useState(0);
  const interactive = useMounted();
  const reduced = usePrefersReducedMotion();

  // The current run — synchronous, deterministic, computed in this tab.
  const feed = buildFeed(scenario, priceText, cleanRow);
  const report = useMemo(() => (feed ? verifyAcpFeed(feed) : null), [feed]);

  // Tick choreography on preset change (motion-allowed only).
  const playTicks = () => {
    if (reduced) return;
    setTicksOn(0);
    let i = 0;
    const step = () => {
      i += 1;
      setTicksOn(i);
      if (i < 4) setTimeout(step, 130);
    };
    setTimeout(step, 90);
  };

  // Same-document View Transition on the scenario swap — Baseline Newly
  // Available (motion-currency sweep 2026-07-20); feature-detected +
  // reduced-motion-gated, instant swap as the base path.
  const pick = (s: Scenario) => {
    const apply = () => {
      setScenario(s);
      setStampKey((k) => k + 1);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (typeof doc.startViewTransition === "function" && !reduced) {
      doc.startViewTransition(() => flushSync(apply));
    } else {
      apply();
    }
    playTicks();
  };

  const added = report
    ? report.findings.filter((f) => !refKeys.has(findingKey(f)))
    : [];
  const currentKeys = new Set((report?.findings ?? []).map(findingKey));
  const removed = report
    ? refReport.findings.filter((f) => !currentKeys.has(findingKey(f)))
    : [];

  const verdict =
    report === null ? "NOT A PRICE" : report.ok ? "PASS" : "FAIL";
  const tone = report === null ? "invalid" : report.ok ? "pass" : "held";

  const prov =
    scenario === "sample"
      ? "RECOMPUTED REFERENCE RESULT"
      : "COMPUTED ON THIS PAGE · LIVE";

  const focus = (() => {
    if (report === null)
      return (
        <>
          The served value must be a plain decimal amount, like 21.50 or 2150.00.
          <br />
          Fix the field and the whole feed re-verifies, live.
        </>
      );
    if (scenario === "sample")
      return (
        <>
          The verdict above is the reference result, recomputed here. It matches the chapter 01
          ledger, finding for finding.
          <br />
          For each finding, the receipt below keeps the claim, the asserted value, the reference row, and the rule together.
        </>
      );
    if (scenario === "price") {
      const priceFinding = report.findings.find(
        (f) => f.claim.id.startsWith(`${PRICE_ITEM_ID}#price`) && f.severity === "error",
      );
      return priceFinding ? (
        <>
          The edited line fails: <span className="neq">{cleanFinding(priceFinding.plainLine ?? "")}</span>
          <br />
          The rest of the tally is the feed&rsquo;s own record, unchanged by your edit.
        </>
      ) : (
        <>
          Your edit agrees with the merchant record — the served price line goes clean, and the
          tally drops by one.
          <br />
          The remaining findings are the feed&rsquo;s own, on other lines.
        </>
      );
    }
    if (scenario === "ghost")
      return (
        <>
          One row was added that the merchant catalog never had. Under exact ID matching, no
          catalog row answers — <span className="neq">the ghost rule fires</span>, one new finding
          on top of the feed&rsquo;s own.
        </>
      );
    return (
      <>
        One clean line was removed from the feed. &ldquo;{String(cleanRow.title ?? cleanRow.item_id)}&rdquo;
        exists in the merchant catalog — <span className="neq">its absence is itself a finding</span>,
        one more on top of the feed&rsquo;s own.
      </>
    );
  })();

  const deltaLine =
    scenario === "sample" || report === null
      ? null
      : `your edit: +${added.length} finding${added.length === 1 ? "" : "s"} · −${removed.length}`;

  // #93 (sol batch, 2026-07-20): with no run there is NOTHING to show — the
  // receipt and console must never fall back to the reference findings under a
  // NO RUN stamp.
  const shownFindings = report?.findings ?? [];
  const shownCounts = counts(report ?? refReport);

  return (
    <>
      {interactive && (
        <div className="pcards" role="group" aria-label="Bench presets">
          <button
            type="button"
            className="pcard"
            aria-pressed={scenario === "sample"}
            onClick={() => pick("sample")}
          >
            <span className="ptab" aria-hidden="true">
              LIVE
            </span>
            <span className="p-title">Load the committed feed</span>
            <span className="p-sub">RECOMPUTED REFERENCE RESULT</span>
            <span className="p-held">HELD ×{refReport.findings.length}</span>
          </button>
          <button
            type="button"
            className="pcard"
            aria-pressed={scenario === "price"}
            onClick={() => pick("price")}
          >
            <span className="ptab" aria-hidden="true">
              LIVE
            </span>
            <span className="p-title">Edit one served price yourself</span>
            <span className="p-sub">COMPUTED ON THIS PAGE, AS YOU TYPE</span>
            <span className="p-held">THE ×100 LINE</span>
          </button>
          <button
            type="button"
            className="pcard"
            aria-pressed={scenario === "ghost"}
            onClick={() => pick("ghost")}
          >
            <span className="ptab" aria-hidden="true">
              LIVE
            </span>
            <span className="p-title">Serve an item the catalog never had</span>
            <span className="p-sub">ONE ROW ADDED · REAL ENGINE</span>
            <span className="p-held">GHOST ROW</span>
          </button>
          <button
            type="button"
            className="pcard"
            aria-pressed={scenario === "drop"}
            onClick={() => pick("drop")}
          >
            <span className="ptab" aria-hidden="true">
              LIVE
            </span>
            <span className="p-title">Drop a row from the feed</span>
            <span className="p-sub">ONE ROW REMOVED · REAL ENGINE</span>
            <span className="p-held">MISSING LINE</span>
          </button>
        </div>
      )}

      <div className="bench3">
        <span className="btab" aria-hidden="true">
          INSTRUMENT · LOCAL
        </span>
        <div className="bench3-form">
          <p className="acc" aria-hidden="true">
            THE EDIT
          </p>
          {scenario === "sample" && (
            <div>
              <p className="fixedrow">
                <span>FEED</span>
                <span className="fr-v">the committed feed · unedited</span>
              </p>
              <p className="fixedrow">
                <span>REFERENCE</span>
                <span className="fr-v">the merchant catalog · {CATALOG_RECORDS} records</span>
              </p>
              <p className="fixedrow">
                <span>RUN</span>
                <span className="fr-v">the run behind the chapter 01 ledger</span>
              </p>
            </div>
          )}
          {scenario === "price" && (
            <div>
              <label htmlFor="served-input">SERVED PRICE — {PRICE_ITEM_ID.toUpperCase()} (EDIT ME)</label>
              <input
                id="served-input"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
              />
              <div className="b3-presets">
                <button type="button" className="b3-preset" onClick={() => { setPriceText(truePrice); setStampKey((k) => k + 1); }}>
                  <b>{truePrice}</b>&nbsp;· the true price
                </button>
                <button type="button" className="b3-preset" onClick={() => { setPriceText(hundredfold); setStampKey((k) => k + 1); }}>
                  <b>{hundredfold}</b>&nbsp;· the hundredfold read
                </button>
              </div>
              <p className="fixedrow" style={{ marginTop: 14 }}>
                <span>MERCHANT RECORD</span>
                <span className="fr-v">
                  price_cents · {RECORD_CENTS.toLocaleString("en-US")}¢ = {RECORD_DOLLARS}
                </span>
              </p>
            </div>
          )}
          {scenario === "ghost" && (
            <div>
              <p className="fixedrow">
                <span>THE EDIT</span>
                <span className="fr-v">+ serve &ldquo;Midnight Special (Large)&rdquo;</span>
              </p>
              <p className="fixedrow">
                <span>CATALOG</span>
                <span className="fr-v">no row for it · {CATALOG_RECORDS} records</span>
              </p>
              <p className="fixedrow">
                <span>RULE</span>
                <span className="fr-v">LST-EXIST-GHOST</span>
              </p>
            </div>
          )}
          {scenario === "drop" && (
            <div>
              <p className="fixedrow">
                <span>THE EDIT</span>
                <span className="fr-v">− drop the line &ldquo;{String(cleanRow.title ?? cleanRow.item_id)}&rdquo;</span>
              </p>
              <p className="fixedrow">
                <span>CATALOG</span>
                <span className="fr-v">the item exists in the merchant catalog</span>
              </p>
              <p className="fixedrow">
                <span>RULE</span>
                <span className="fr-v">LST-EXIST-MISSING</span>
              </p>
            </div>
          )}
          {interactive && (
            <div className="bt-row" aria-hidden="true">
              {["READ FEED", "MATCH IDS", "APPLY RULES", "VERDICT"].map((t, i) => (
                <span className={`bt${ticksOn > i ? " on" : ""}`} key={t}>
                  <i>
                    <b />
                  </i>
                  <span>{t}</span>
                </span>
              ))}
            </div>
          )}
          <p className="bench3-note">
            Every preset runs the real engine in your browser, on the lines shown. Nothing typed
            here is sent anywhere; the page makes no network requests.
          </p>
        </div>

        <div className={`vpanel ${tone}`} aria-live="polite">
          <p className="vprov">{prov}</p>
          <p className="vhead">
            <span
              key={stampKey}
              className={`vstamp${verdict === "PASS" ? " ok" : verdict === "NOT A PRICE" ? " inv" : ""}${interactive && !reduced ? " land" : ""}`}
            >
              {verdict}
            </span>
            <span className="vtally">
              {report === null ? "no run — the bench needs a plain decimal amount" : tallyLine(report)}
            </span>
          </p>
          {deltaLine && <p className="vprov">{deltaLine.toUpperCase()}</p>}
          <div className="vlines">{focus}</div>
        </div>
      </div>

      <div
        className="pb-bar p4-console"
        aria-label="The bench result, as a proof object"
      >
        <span className="pb-dot" aria-hidden="true" />
        <code className="pb-line">
          {verdict} &nbsp;&middot;&nbsp;{" "}
          <b>
            {scenario === "sample"
              ? "COMMITTED FEED"
              : scenario === "price"
                ? "READER EDIT · ONE PRICE"
                : scenario === "ghost"
                  ? "GHOST ROW SERVED"
                  : "ONE ROW DROPPED"}
          </b>{" "}
          &nbsp;&middot;&nbsp;{" "}
          <i>
            {report === null
              ? "NO RULE CAN RUN"
              : `${report.findings.length} FINDINGS`}
          </i>{" "}
          {report !== null && (
            <>
              &nbsp;&middot;&nbsp; {shownCounts.error} ERR &nbsp;&middot;&nbsp; {shownCounts.warn}{" "}
              WARN
            </>
          )}
        </code>
        <span className="pb-flag">{verdict === "PASS" ? "PASS" : verdict === "FAIL" ? "FAIL" : "WAIT"}</span>
      </div>

      {/* ===== THE RECEIPT — whatever sits on the bench, on paper ===== */}
      <div className="sect turn3-grid" id="receipt-sec">
        <div>
          <p className="lp-eyebrow">THE RECEIPT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="keep-h2">
            Keep the receipt.
          </h2>
          <p className="lp-foot">
            Whatever sits on the bench renders here: the claim, the asserted value, what it was
            checked against, and the rule, per finding. Run an edit above and this paper follows.{" "}
            <em>The receipt is the product.</em>
          </p>
          {interactive && (
            <p className="keepline">
              <button type="button" className="lp-btn primary" onClick={() => window.print()}>
                Print this receipt
              </button>
            </p>
          )}
        </div>
        <div>
          <article className="receipt" aria-label="Bench receipt for the current result">
            <div className="rc-head">
              <p className="rc-title">CURBSIDE COMMONS · BENCH RECEIPT</p>
              <p className="rc-case">
                {scenario === "sample" ? "COMMITTED FEED · REFERENCE RUN" : "READER EDIT · LIVE RUN"}
              </p>
            </div>
            {/* Keyboard-reachable scroll region (axe scrollable-region-focusable —
                the e2e rewrite's catch, 2026-07-20). */}
            <div
              className="rc-scroll"
              tabIndex={0}
              role="region"
              aria-label="Receipt findings, scrollable"
            >
              <ol className="rc-steps">
                <li className="rc-step">
                  <span className="rc-num">—</span>
                  <span className="rc-key">VERDICT</span>
                  <span className="rc-val">
                    {verdict} — {report === null ? "no run — awaiting a plain decimal amount" : tallyLine(report)}
                    <small>
                      {scenario === "sample"
                        ? "the reference result, recomputed here · matches the chapter 01 ledger"
                        : "computed live on this page by the real engine"}
                    </small>
                  </span>
                </li>
                {shownFindings.map((f, i) => (
                  <li className="rc-step" key={findingKey(f)}>
                    <span className="rc-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`rc-key ${f.severity === "error" ? "err" : "wrn"}`}>
                      {f.severity.toUpperCase()}
                    </span>
                    <span className="rc-val">
                      {cleanFinding(f.plainLine ?? "")}
                      <small>
                        claim {f.claim.id} · checked against {f.referenceRowId} · {f.ruleId}
                      </small>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rc-stamp">
              <span className={`stamp${verdict === "PASS" ? " graphitest" : ""}`}>
                {verdict === "NOT A PRICE" ? "NO RUN" : verdict}
              </span>
              <span className="rc-attach">CLAIM · ASSERTED · CHECKED · RULE — KEPT ATTACHED</span>
            </div>
          </article>
          <p className="acc r rc-acc" aria-hidden="true">
            SPECIMEN — BENCH RECEIPT · PAPER ·{" "}
            {scenario === "sample" ? "REFERENCE RUN" : "READER EDIT"}
          </p>
        </div>
      </div>
    </>
  );
}
