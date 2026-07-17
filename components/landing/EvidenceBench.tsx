"use client";

import { useEffect, useRef, useState } from "react";
import type { BenchSpecimen, BrowseFinding } from "@/lib/landing/specimen";

/**
 * EvidenceBench — the operable examination table for section 01 (redesign C-REDO;
 * session-21 substance upgrade, owner directive 2026-07-16).
 *
 * A finite, deterministic ~2.8s resolve the reader can replay OR step through at
 * their own pace: the value, the correspondence line, the governing rule, the
 * arithmetic, the mismatch, and the evidence receipt relight in sequence into one
 * supported finding. Every figure is grounded in the engine measurables
 * (props from lib/landing/specimen.ts).
 *
 * Session-21 additions (design review 2026-07-16 D-3/D-4, research digest):
 *   • the ×100 delta is a RENDERED first-class element at the axis terminus —
 *     the reader never computes it (NN/g explicit-differences). It renders
 *     STATIC on purpose: animating a fabricated 1→100 roll would be proof
 *     theater on a surface whose whole point is refusing theater.
 *   • a discrete step-through (WCAG 2.5.7 — no timing, no dragging) inspects
 *     any stage of the completed examination; stepping is interruptible and
 *     cancels a running replay.
 *   • native <details> provenance receipts name the exact source of each
 *     figure (no-JS-native; Chromium print-suppression handled by the
 *     beforeprint open/restore lifecycle).
 *   • the tally opens a browsable index of ALL committed findings — the
 *     header can no longer imply depth the surface doesn't carry (D-4).
 *
 * The bench OPENS COMPLETE in every mode (owner pick 2026-07-15 — the
 * storyboard's ships-done lesson). "Replay the check" re-runs the resolve; the
 * full footprint stays in layout at low emphasis while the stages relight, so
 * the replay has zero height delta. A single polite live region announces the
 * verdict once the run settles (and each stage as the reader steps).
 */

const STAGE_MS = [140, 520, 960, 1400, 1840, 2320] as const; // stages 1..6

const STEPS = [
  { n: 1, label: "1 · CLAIM", announce: "the served claim" },
  { n: 2, label: "2 · RECORD", announce: "the merchant record" },
  { n: 3, label: "3 · RULE", announce: "the governing rule" },
  { n: 4, label: "4 · ARITHMETIC", announce: "the arithmetic" },
  { n: 5, label: "5 · MISMATCH", announce: "the mismatch" },
  { n: 6, label: "6 · RECEIPT", announce: "the evidence receipt" },
] as const;

export function EvidenceBench({
  bench,
  findings,
}: {
  bench: BenchSpecimen;
  findings: BrowseFinding[];
}) {
  // SSR + first paint + rest state = the settled examination (stage 6): the bench
  // opens complete in every mode (no-JS, reduced motion, and allowed motion alike).
  const [stage, setStage] = useState(6);
  const [phase, setPhase] = useState<"running" | "done">("done");
  const [live, setLive] = useState("");
  const reducedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
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

  // Print lifecycle: Chromium omits closed <details> bodies from paper, and a
  // mid-step state would print a dimmed examination — open every disclosure and
  // settle the bench for print, then restore the reader's state after.
  //
  // Batch P2 (2026-07-16): the lifecycle state lives in REFS and the listeners
  // subscribe ONCE — the earlier stage-dependent effect re-subscribed on every
  // stage change, so `beforeprint` mutating the stage threw away the very
  // closure `afterprint` needed (the restore only ever worked from the steady
  // state). A print that interrupts a running replay cannot restore elapsed
  // timers, so the honest resume is to RE-RUN the deterministic replay; a
  // settled bench restores its exact stage.
  const stageRef = useRef(stage);
  const phaseRef = useRef(phase);
  const runRef = useRef<() => void>(() => {});
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let opened: HTMLDetailsElement[] = [];
    let priorStage = 6;
    let priorPhase: "running" | "done" = "done";
    const before = () => {
      priorStage = stageRef.current;
      priorPhase = phaseRef.current;
      clearTimers();
      setStage(6);
      setPhase("done");
      opened = Array.from(root.querySelectorAll("details")).filter((d) => !d.open);
      opened.forEach((d) => {
        d.open = true;
      });
    };
    const after = () => {
      opened.forEach((d) => {
        d.open = false;
      });
      opened = [];
      if (priorPhase === "running") {
        runRef.current();
      } else {
        setStage(priorStage);
      }
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
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

  // Keep the print-lifecycle refs in sync after every commit (never during
  // render — React ref discipline); the listeners above read only these refs.
  useEffect(() => {
    stageRef.current = stage;
    phaseRef.current = phase;
    runRef.current = run;
  });

  // Discrete inspection of the completed examination — interruptible (a step
  // mid-replay cancels the timers and takes the reader straight to that stage).
  function stepTo(n: number, announce: string) {
    clearTimers();
    setPhase("done");
    setStage(n);
    setLive(n === 6 ? verdictLine : `Stage ${n} of 6 — ${announce}.`);
  }

  const lit = (n: number) => (stage >= n ? " is-lit" : "");
  // The bench opens complete, so the evidence is already exposed before any replay —
  // staged content therefore stays in the accessibility tree throughout (hiding
  // already-read content mid-replay would serve nothing); visually it dims to low
  // emphasis and relights per stage, and the live region announces the settle.
  const filled = stage >= 6;
  const buttonLabel = phase === "running" ? "Replaying…" : "Replay the check";

  return (
    <div className="eb" data-phase={phase} ref={rootRef}>
      <div className="eb-head">
        <span className="eb-kicker mono">EVIDENCE BENCH / ILLUSTRATIVE RUN</span>
        <details className="eb-browse">
          <summary className="eb-tally mono">
            {bench.tally.total} findings · {bench.tally.errors} error · {bench.tally.warns} warn
          </summary>
          <ol className="eb-browse-list">
            {findings.map((f) => (
              <li key={f.index} aria-current={f.onBench ? "true" : undefined}>
                <span className="mono eb-browse-idx">
                  {String(f.index).padStart(2, "0")}
                </span>
                <span className={`mono eb-browse-sev is-${f.severity}`}>{f.severity}</span>
                <span className="eb-browse-line">
                  {f.plain}
                  {f.onBench ? <em className="mono"> · on the bench</em> : null}
                </span>
              </li>
            ))}
          </ol>
        </details>
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
          <details className="eb-prov">
            <summary className="mono">WHERE THIS COMES FROM</summary>
            <dl>
              <dt className="mono">source</dt>
              <dd className="mono">{bench.provenance.claim.source}</dd>
              <dt className="mono">claim id</dt>
              <dd className="mono">{bench.provenance.claim.id}</dd>
              <dt className="mono">served</dt>
              <dd className="mono">{bench.provenance.claim.served}</dd>
            </dl>
          </details>
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
          <p className={`eb-delta${lit(5)}`}>
            <span className="eb-delta-num mono" aria-hidden="true">
              ×100
            </span>
            <span className="eb-delta-cap mono">
              THE CLAIM IS 100× THE MERCHANT&apos;S OWN RECORD
            </span>
          </p>
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
          <details className="eb-prov">
            <summary className="mono">WHERE THIS COMES FROM</summary>
            <dl>
              <dt className="mono">system row</dt>
              <dd className="mono">{bench.provenance.record.rowId}</dd>
              <dt className="mono">recorded</dt>
              <dd className="mono">
                {bench.provenance.record.cents} ({bench.record.money})
              </dd>
              <dt className="mono">rule</dt>
              <dd className="mono">{bench.provenance.rule.id}</dd>
            </dl>
          </details>
        </div>
      </div>

      <div className={`eb-receipt${filled ? " is-filled" : ""}`}>
        <span className="eb-receipt-label mono">EVIDENCE ATTACHED</span>
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
        <div className="eb-steps" role="group" aria-label="Step through the examination">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              className="eb-step mono"
              aria-pressed={phase === "done" && stage === s.n}
              onClick={() => stepTo(s.n, s.announce)}
            >
              {s.label}
            </button>
          ))}
        </div>
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

      {/* No-JS: the bench already shows the completed examination and the native
          <details> disclosures still operate; the replay + step controls are inert
          without hydration, so they are hidden rather than left as dead buttons. */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".eb-actions{display:none}" }} />
      </noscript>
    </div>
  );
}
