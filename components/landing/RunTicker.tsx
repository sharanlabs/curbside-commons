"use client";

/**
 * STATION 2 · RUN — the check, line by line (walkthrough redesign, 2026-08-02).
 *
 * WHAT THIS IS. A verdict that simply appears is a verdict you have to take on
 * faith. The ticker shows the work: each claim matched to the record it should
 * agree with, the rule applied, and the outcome named. Idle, it says what the
 * check IS; during a run it streams; afterwards it settles to the tally.
 *
 * EVERY LINE IS A CHECK THAT HAPPENED. The lines come from `deriveChecks` in the
 * run bus, which builds HELD lines only from real findings (carrying that
 * finding's own rule id) and OK lines only for rows that produced no finding at
 * all. Nothing here is padded to make the stream look busier — a ticker showing
 * a check that did not run would be precisely the kind of claim this product
 * exists to catch.
 *
 * THE STREAM IS A SAMPLE; THE SUMMARY IS THE TRUTH. Only the first few lines are
 * narrated — a 25-row feed would otherwise take four seconds to scroll past. The
 * settle line beneath states the totals for the WHOLE run, so a capped stream
 * never implies a capped audit.
 *
 * MOTION: opacity + transform only, ~150ms apart. Under `prefers-reduced-motion`
 * every line is present and settled at once — the information is identical, only
 * the theatre is gone.
 */
import { useEffect, useState } from "react";
import { useRun, type CheckLine } from "./run-bus";

const TICK_MS = 150;

export function RunTicker() {
  const { phase, checks, report, feedRows } = useRun();
  /**
   * How many lines have arrived, keyed to the run they belong to. Keying by the
   * checks array itself means a NEW run starts from zero without an effect
   * having to reset anything — a synchronous reset inside an effect is a
   * cascading render, and the count would briefly show the previous run's.
   */
  const [reveal, setReveal] = useState<{ key: readonly CheckLine[]; n: number }>({
    key: [],
    n: 0,
  });

  useEffect(() => {
    if (phase !== "running" || checks.length === 0) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setReveal({ key: checks, n: i });
      if (i >= checks.length) window.clearInterval(timer);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [checks, phase]);

  /**
   * Only a RUNNING phase staggers. Under `prefers-reduced-motion` the workbench
   * never publishes a running phase at all — it settles immediately — so the
   * reduced-motion resolution is "every line present at once", with no media
   * query read during render to go stale or mismatch on hydration.
   */
  const shown = phase === "running" ? (reveal.key === checks ? reveal.n : 0) : checks.length;

  const counts = { error: 0, warn: 0 };
  if (report) {
    for (const f of report.findings) {
      if (f.severity === "error") counts.error += 1;
      else if (f.severity === "warn") counts.warn += 1;
    }
  }

  return (
    <div
      className={`wk-ticker${phase === "running" ? " is-live" : ""}${
        phase === "done" ? " is-done" : ""
      }`}
    >
      <div className="wk-ticker-head">
        <span id="run-h">The check, line by line</span>
        {phase === "running" && <span className="wk-live">computing · in this tab</span>}
      </div>

      <div className="wk-ticker-body" aria-live="polite">
        {checks.length === 0 ? (
          <p className="wk-ticker-idle">
            Every claim in the feed is matched to the record it should agree with, and the rule for
            that field is applied — deterministically, with no model in the loop. Press{" "}
            <b>Run</b> to watch it happen.
          </p>
        ) : (
          checks.map((c, i) => (
            <p key={`${c.id}:${c.what}`} className={`wk-tk-line${i < shown ? " is-in" : ""}`}>
              <span className="wk-tk-id">{c.id}</span>
              <span className="wk-tk-what">{c.what}</span>
              <span className={`wk-tk-v ${c.verdict === "OK" ? "ok" : "held"}`}>{c.verdict}</span>
            </p>
          ))
        )}
      </div>

      {phase === "done" && report !== null && (
        <div className="wk-ticker-sum">
          {feedRows} rows · every claim checked · {report.findings.length} findings ({counts.error}{" "}
          errors · {counts.warn} warnings) · computed in this tab
        </div>
      )}
    </div>
  );
}
