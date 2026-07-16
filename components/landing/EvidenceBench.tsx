"use client";

import { useEffect, useRef, useState } from "react";
import type { BenchSpecimen } from "@/lib/landing/specimen";

/**
 * EvidenceBench — the operable examination table for section 01 (redesign C-REDO).
 *
 * A finite, deterministic ~2.8s resolve the reader can replay: the value, the
 * correspondence line, the governing rule, the arithmetic, and the break relight in
 * sequence into one supported finding, then the surface goes still. Every figure is
 * grounded in the engine measurables (props from lib/landing/specimen.ts).
 *
 * The bench OPENS COMPLETE in every mode (owner pick 2026-07-15 — the storyboard's
 * ships-done lesson: settled states are complete and useful; nothing opens empty).
 * "Replay the check" re-runs the resolve; the full footprint stays in layout at low
 * emphasis while the stages relight, so the replay has zero height delta. A single
 * polite live region announces the verdict once the run settles.
 */

const STAGE_MS = [140, 520, 960, 1400, 1840, 2320] as const; // stages 1..6

export function EvidenceBench({ bench }: { bench: BenchSpecimen }) {
  // SSR + first paint + rest state = the settled examination (stage 6): the bench
  // opens complete in every mode (no-JS, reduced motion, and allowed motion alike).
  const [stage, setStage] = useState(6);
  const [phase, setPhase] = useState<"running" | "done">("done");
  const [live, setLive] = useState("");
  const reducedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return clearTimers;
  }, []);

  const verdictLine = `Analysis complete. One finding: ${bench.finding.plain} Severity ${bench.finding.severity}.`;

  function run() {
    clearTimers();
    setLive("");
    if (reducedRef.current) {
      setStage(6);
      setPhase("done");
      setLive(verdictLine);
      return;
    }
    setPhase("running");
    setStage(0);
    STAGE_MS.forEach((ms, i) => {
      timers.current.push(
        setTimeout(() => {
          const s = i + 1;
          setStage(s);
          if (s === 6) {
            setPhase("done");
            setLive(verdictLine);
          }
        }, ms),
      );
    });
  }

  const lit = (n: number) => (stage >= n ? " is-lit" : "");
  // The bench opens complete, so the evidence is already exposed before any replay —
  // staged content therefore stays in the accessibility tree throughout (hiding
  // already-read content mid-replay would serve nothing); visually it dims to low
  // emphasis and relights per stage, and the live region announces the settle.
  const filled = stage >= 6;
  const buttonLabel = phase === "running" ? "Analyzing…" : "Replay the check";

  return (
    <div className="eb" data-phase={phase}>
      <div className="eb-head">
        <span className="eb-kicker mono">EVIDENCE BENCH / ILLUSTRATIVE RUN</span>
        <span className="eb-tally mono">
          {bench.tally.total} findings · {bench.tally.errors} error · {bench.tally.warns} warn
        </span>
      </div>

      <div className="eb-table">
        <div className="eb-col eb-claim">
          <span className="eb-col-label mono">CLAIM SURFACE</span>
          <span className="eb-field mono">{bench.claim.field}</span>
          <span className={`eb-money mono${lit(1)}`}>
            {bench.claim.money}
          </span>
          <span className="eb-sub mono">
            {bench.claim.unit}
          </span>
        </div>

        <div className="eb-axis">
          <span className={`eb-corr${lit(2)}`} aria-hidden="true" />
          <div className={`eb-rule${lit(3)}`}>
            <span className="eb-rule-name mono">
              {bench.rule.label} {bench.rule.factor}
            </span>
            <span className="eb-rule-plain mono">{bench.rule.plain}</span>
          </div>
          <div className={`eb-math${lit(4)}`}>
            <span className="mono">{bench.arithmetic.left}</span>
            <span className="mono">{bench.arithmetic.right}</span>
          </div>
          <div className={`eb-break${lit(5)}`}>
            <span className="mono">{bench.arithmetic.break}</span>
          </div>
        </div>

        <div className="eb-col eb-record">
          <span className="eb-col-label mono">MERCHANT RECORD</span>
          <span className="eb-field mono">{bench.record.field}</span>
          <span className={`eb-money mono${lit(2)}`}>
            {bench.record.cents}
          </span>
          <span className="eb-sub mono">
            {bench.record.money}
          </span>
        </div>
      </div>

      <div className={`eb-receipt${filled ? " is-filled" : ""}`}>
        <span className="eb-receipt-label mono">{filled ? "EVIDENCE LOCKED" : "EVIDENCE ATTACHED"}</span>
        <div className={`eb-receipt-body${lit(6)}`}>
          <p className="eb-receipt-head">
            <span className="eb-sev">{bench.finding.severity.toUpperCase()}</span>
            <span className="eb-receipt-rule mono">PRICE MISMATCH</span>
          </p>
          <p className="eb-receipt-plain">{bench.finding.plain}</p>
          <dl className="eb-receipt-rows">
            <div>
              <dt className="mono">claim</dt>
              <dd className="mono">
                {bench.claim.field} · {bench.claim.money}
              </dd>
            </div>
            <div>
              <dt className="mono">record</dt>
              <dd className="mono">
                {bench.record.field} · {bench.record.money}
              </dd>
            </div>
            <div>
              <dt className="mono">rule</dt>
              <dd className="mono">
                {bench.rule.label} {bench.rule.factor}
              </dd>
            </div>
            <div>
              <dt className="mono">comparison</dt>
              <dd className="mono">{bench.arithmetic.break}</dd>
            </div>
          </dl>
          <span className="eb-receipt-foot mono">
            finding {bench.finding.index} of {bench.finding.total}
          </span>
        </div>
      </div>

      <div className="eb-actions">
        <button
          type="button"
          className="lp-btn primary eb-run"
          onClick={run}
          disabled={phase === "running"}
        >
          {buttonLabel}
        </button>
      </div>

      <p className="eb-live" aria-live="polite" role="status">
        {live}
      </p>

      {/* No-JS: the bench already shows the completed examination; the replay control
          is inert without hydration, so it is hidden rather than left as a dead button. */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".eb-actions{display:none}" }} />
      </noscript>
    </div>
  );
}
