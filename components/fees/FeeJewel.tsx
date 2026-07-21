"use client";

import { useEffect, useRef } from "react";
import { FEE_JEWEL } from "./fee-report-data";

/**
 * The averaging-clause jewel (build piece 3, 2026-07-20; design source
 * `mockups/takeover-02-fees-2026-07-17.html`, ultramarine): the month's
 * average against the cap, with a meter whose fill crosses the cap mark.
 *
 * Every figure derives from FEE_JEWEL (computed from the drifted month's own
 * finding). The settled SSR state IS the final state — the count-up and meter
 * growth are motion-allowed enhancements only (the v9 jewel contract).
 */
export function FeeJewel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const j = FEE_JEWEL;

  useEffect(() => {
    const el = rootRef.current;
    const fig = figRef.current;
    if (!el || !fig) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top <= innerHeight) return; // settled on arrival

    el.classList.add("armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          el.classList.add("run");
          const t0 = performance.now();
          const dur = 1100;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            fig.textContent = `${(j.avgTo * (1 - Math.pow(1 - p, 3))).toFixed(1)}%`;
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
            else fig.textContent = j.avg;
          };
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
      el.classList.remove("armed", "run");
      fig.textContent = j.avg;
    };
  }, [j.avg, j.avgTo]);

  return (
    <div className="fjewel" ref={rootRef} id="fee-jewel">
      <p className="fj-label" id="fee-jewel-label">
        THE AVERAGING CLAUSE · OVER THE LINE
      </p>
      <div
        className="fj-line"
        aria-label={`${j.fees} of fees on ${j.purchases} of monthly purchases is ${j.avg}; the cap is ${j.cap}`}
      >
        <span className="fj-fig bad">
          <span ref={figRef}>{j.avg}</span>
          <small>THE MONTH&rsquo;S AVERAGE</small>
        </span>
        <span className="fj-gt" aria-hidden="true">
          &gt;
        </span>
        <span className="fj-fig">
          <span>{j.cap}</span>
          <small>THE CAP · {j.clause}</small>
        </span>
      </div>
      <div
        className="fmeter"
        role="img"
        aria-label={`Meter: the fill crosses the ${j.capShort} cap mark and ends at ${j.avg}`}
      >
        <span className="fm-fill" style={{ width: `${j.fillPct}%` }} />
        <span
          className="fm-over"
          style={{ left: `${j.fillPct}%`, width: `${j.overPct}%` }}
        />
        <span className="fm-cap" style={{ left: `${j.fillPct}%` }}>
          <i>CAP {j.cap}</i>
        </span>
        <span className="fm-zero">0%</span>
        <span className="fm-max">{j.scaleMax}</span>
      </div>
      <span className="fj-seal">RULE · {j.ruleId}</span>
      <p className="fj-sub">
        {j.fees} of fees on {j.purchases} of monthly purchases = {j.avg} · the 30-day refund
        window closed with no refund
      </p>
      <p className="fj-cap">
        The statute averages the month; the arithmetic is a division anyone can redo. The
        refund window closed with no refund recorded.
      </p>
    </div>
  );
}
