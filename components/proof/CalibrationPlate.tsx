"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMounted, usePrefersReducedMotion } from "@/components/client-flags";

/**
 * The fee-line classifier calibration plate (build piece 2, 2026-07-20; design
 * source `mockups/takeover-04-proof-2026-07-18.html`): the first run's DEFER on
 * the left, the retry's clean pass on the right, the earned label underneath,
 * and an interactive-only "Replay the count-up" control.
 *
 * Every figure arrives as a prop derived in app/proof/page.tsx from
 * lib/dashboard/evidence.ts (the anti-fabrication contract) — this component
 * never types a number of its own.
 *
 * Floors held at source: the settled SSR state carries the final figures (the
 * sr sentences carry them for readers); the replay button renders ONLY when JS
 * runs and motion is allowed, so no-JS/reduced-motion never see a dead control
 * (the v9 `[hidden]` defect class, avoided structurally).
 */
export type CalibrationPlateData = {
  defer: {
    date: string;
    score: string; // "20/21"
    cap: string;
    line: string; // the pinned floor arithmetic, from the recorded reason
    note: string;
    srSentence: string;
  };
  retry: {
    date: string;
    score: string; // "21/21"
    scoreTo: number;
    cap: string;
    accuracy: string; // "1.0000"
    accuracyTo: number;
    kappa: string;
    kappaTo: number;
    calls: string;
    callsTo: number;
    cost: string;
    srSentence: string;
  };
  earnedLabel: string;
};

const ease = (p: number) => 1 - Math.pow(1 - p, 3);

export function CalibrationPlate({ data }: { data: CalibrationPlateData }) {
  const plateRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const accRef = useRef<HTMLElement>(null);
  const kapRef = useRef<HTMLElement>(null);
  const callsRef = useRef<HTMLElement>(null);
  const rafs = useRef<number[]>([]);
  const mounted = useMounted();
  const reduced = usePrefersReducedMotion();
  const replayable = mounted && !reduced; // JS + motion proven — the replay control may exist

  const animate = useCallback(() => {
    rafs.current.forEach(cancelAnimationFrame);
    rafs.current = [];
    const runs: Array<[HTMLElement | null, number, string, number, number]> = [
      // [el, to, settledText, decimals, durationMs]
      [scoreRef.current, data.retry.scoreTo, data.retry.score.split("/")[0], 0, 900],
      [accRef.current, data.retry.accuracyTo, data.retry.accuracy, 4, 1100],
      [kapRef.current, data.retry.kappaTo, data.retry.kappa, 4, 1100],
      [callsRef.current, data.retry.callsTo, data.retry.calls, 0, 900],
    ];
    for (const [el, to, settled, dec, dur] of runs) {
      if (!el) continue;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent =
          dec > 0 ? (to * ease(p)).toFixed(dec) : Math.round(to * ease(p)).toLocaleString("en-US");
        if (p < 1) rafs.current.push(requestAnimationFrame(tick));
        else el.textContent = settled;
      };
      rafs.current.push(requestAnimationFrame(tick));
    }
  }, [data]);

  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top <= innerHeight) return; // settled on arrival

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          animate();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    const rafList = rafs.current;
    return () => {
      io.disconnect();
      rafList.forEach(cancelAnimationFrame);
    };
  }, [animate]);

  return (
    <>
      <div className="cal" ref={plateRef}>
        <div className="cal-grid">
          <div className="cal-run">
            <div className="run-head">
              <span className="run-when">{data.defer.date} · FIRST RUN</span>
              <span className="vd defer">DEFERRED</span>
            </div>
            <p className="sr">{data.defer.srSentence}</p>
            <p className="run-fig defer" aria-hidden="true">
              {data.defer.score.split("/")[0]}
              <span className="of">/{data.defer.score.split("/")[1]}</span>
            </p>
            <p className="run-cap" aria-hidden="true">
              {data.defer.cap}
            </p>
            <p className="run-line" aria-hidden="true">
              {data.defer.line}
            </p>
            <p className="run-note">{data.defer.note}</p>
          </div>
          <div className="cal-arrow" aria-hidden="true">
            <span>RETRY</span>
            <span className="arr">→</span>
            <span>FRESH SET</span>
          </div>
          <div className="cal-run">
            <div className="run-head">
              <span className="run-when">{data.retry.date} · RETRY</span>
              <span className="vd pass">CALIBRATED</span>
            </div>
            <p className="sr">{data.retry.srSentence}</p>
            <p className="run-fig" aria-hidden="true">
              <span ref={scoreRef}>{data.retry.score.split("/")[0]}</span>
              <span className="of">/{data.retry.score.split("/")[1]}</span>
            </p>
            <p className="run-cap" aria-hidden="true">
              {data.retry.cap}
            </p>
            <div className="run-metrics" aria-hidden="true">
              <span>
                <b ref={accRef}>{data.retry.accuracy}</b>accuracy
              </span>
              <span>
                <b ref={kapRef}>{data.retry.kappa}</b>Cohen&rsquo;s kappa
              </span>
              <span>
                <b ref={callsRef}>{data.retry.calls}</b>calls
              </span>
              <span>
                <b>{data.retry.cost}</b>cost
              </span>
            </div>
          </div>
        </div>
        <p className="cal-label">
          Earned label: <span>{data.earnedLabel}</span>
        </p>
      </div>
      <div className="cal-foot">
        <p className="acc" aria-hidden="true">
          SPECIMEN — CALIBRATION RECORD · FEE-LINE CLASSIFIER
        </p>
        {replayable && (
          <button type="button" className="lp-btn ghost" onClick={animate}>
            Replay the count-up
          </button>
        )}
      </div>
    </>
  );
}
