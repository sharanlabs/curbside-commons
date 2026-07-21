"use client";

import { useEffect, useRef } from "react";

/**
 * The ×100 jewel — the 01 Listings page's staged macro-detail (v9 takeover,
 * 2026-07-20): one number read two ways, counted up under a bezel.
 *
 * The v9 jewel defect class is fixed AT SOURCE here and in the CSS contract
 * (decision-log 2026-07-17): the settled SSR state carries NO reveal classes,
 * so no-JS / reduced-motion / print all render the finished arithmetic; JS
 * adds `armed` then `run` together (never `armed` alone), and the count-up
 * writes into a span whose settled text is already the final figure — the
 * three proven paths (nav arrival, direct load in view, reduced motion) all
 * end with the figure visible.
 *
 * Every figure arrives via props from lib/landing/specimen.ts (derived).
 */

export type JewelData = {
  claimCents: number; // 215000
  recordCents: number; // 2150
  claimDollars: string; // "2150.00"
  ruleId: string; // LST-PRICE-CENTS-AS-DECIMAL
  findingIndex: string; // "11"
  findingTotal: string; // "16"
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function Jewel({ data }: { data: JewelData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    const fig = figRef.current;
    if (!el || !fig) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    // Direct-load-in-view path: already visible → stay settled, no choreography.
    if (el.getBoundingClientRect().top <= innerHeight) return;

    el.classList.add("armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          el.classList.add("run"); // armed+run together — the fixed contract
          const t0 = performance.now();
          const dur = 1100;
          const from = data.recordCents;
          const to = data.claimCents;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            fig.textContent = `${fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))))}¢`;
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
      el.classList.remove("armed", "run");
      fig.textContent = `${fmt(data.claimCents)}¢`;
    };
  }, [data.claimCents, data.recordCents]);

  return (
    <div className="jewel" ref={rootRef} id="jewel">
      <p className="j-label" id="jewel-label">
        FINDING {data.findingIndex} OF {data.findingTotal} · THE ×100 CLAIM
      </p>
      <div
        className="j-line"
        aria-label={`${data.claimDollars} dollars times 100 is ${fmt(data.claimCents)} cents; the merchant record is ${fmt(data.recordCents)} cents`}
      >
        <span className="j-fig bad" ref={figRef}>
          {fmt(data.claimCents)}¢
        </span>
        <span className="j-neq" aria-hidden="true">
          ≠
        </span>
        <span className="j-fig">{fmt(data.recordCents)}¢</span>
      </div>
      <p className="j-sub">
        {data.claimDollars} × 100 = {fmt(data.claimCents)}¢ · merchant record ={" "}
        {fmt(data.recordCents)}¢
      </p>
      <span className="j-seal">RULE · {data.ruleId}</span>
      <p className="j-cap">
        One number, read two ways. As dollars, it is $
        {Number(data.claimDollars).toLocaleString("en-US", { minimumFractionDigits: 2 })}. In the
        merchant&rsquo;s record, {fmt(data.recordCents)}¢ is $
        {(data.recordCents / 100).toFixed(2)}. The rule distinguishes the two; the arithmetic
        shows the error.
      </p>
    </div>
  );
}
