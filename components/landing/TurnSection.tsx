"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TurnSection — the site's ONE theatrical beat (v9 takeover build, 2026-07-20):
 * the six-step examination receipt assembles line by line, the arithmetic
 * counts up, the ≠ line flashes ember (the violation evidence voice, D6), and
 * the HOLD stamp lands on a spring. A replay control re-runs the assembly.
 *
 * Floors: SSR renders the receipt SETTLED (the armed/run classes exist only
 * after JS runs — opens-complete under no-JS); reduced motion never arms the
 * receipt and never shows the replay control; print forces the settled state.
 * Every figure arrives via props derived from lib/landing/specimen.ts.
 */

export type TurnReceiptData = {
  caseLine: string; // CASE 001 · FINDING 11/16
  claim: { field: string; unit: string; claimId: string };
  record: { field: string; cents: string; money: string };
  rule: { id: string; plain: string };
  claimDollars: string; // 2150.00
  claimCents: number; // 215000
  recordCents: number; // 2150
  severity: string; // error
  findingIndex: string; // 11
  findingTotal: string; // 16
  remainingErrors: number; // 10
  warns: number; // 5
  itemLabel: string; // Crispy Calamari (Small)
  served: string; // 2150
};

const fmt = (n: number) => n.toLocaleString("en-US");

export function TurnSection({ data }: { data: TurnReceiptData }) {
  const receiptRef = useRef<HTMLElement>(null);
  const figRef = useRef<HTMLSpanElement>(null);
  const neqRef = useRef<HTMLSpanElement>(null);
  const [replayVisible, setReplayVisible] = useState(false);
  const reducedRef = useRef(false);
  const timerRef = useRef(0);
  const rafRef = useRef(0);

  const assemble = () => {
    const receipt = receiptRef.current;
    const fig = figRef.current;
    const neq = neqRef.current;
    if (!receipt) return;
    receipt.classList.remove("run");
    neq?.classList.remove("hot");
    void receipt.offsetWidth; // restart the CSS animations
    receipt.classList.add("armed", "run");
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (reducedRef.current || !fig) return;
      const t0 = performance.now();
      const dur = 900;
      const from = data.recordCents;
      const to = data.claimCents;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        fig.textContent = fmt(v);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else neq?.classList.add("hot");
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 640);
  };

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    const receipt = receiptRef.current;
    if (reduced || !("IntersectionObserver" in window) || !receipt) return;

    let io: IntersectionObserver | null = null;
    const r = receipt.getBoundingClientRect();
    if (r.top > innerHeight) {
      receipt.classList.add("armed");
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (en.isIntersecting) {
              assemble();
              io?.unobserve(en.target);
              setReplayVisible(true);
            }
          }
        },
        { threshold: 0.35 },
      );
      io.observe(receipt);
    } else {
      setReplayVisible(true);
    }
    return () => {
      io?.disconnect();
      window.clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      receipt.classList.remove("armed", "run");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="turn-grid">
      <div>
        <p className="lp-eyebrow">THE ORDER IN FLIGHT</p>
        <span className="lp-sec-rule" aria-hidden="true" />
        <h2 className="lp-h2" id="turn-h2">
          The check runs in the open.
        </h2>
        <p className="lp-foot">
          An ordering agent reads the feed and builds a basket: {data.itemLabel}, listed at{" "}
          {data.served}. No human looks at this screen. The order is seconds from placement. This
          is where the check runs.
        </p>
        <p className="lp-foot">
          Each line of the receipt can be checked: the claim as served, the record as kept, the
          rule applied, and the arithmetic that exposes the error. The claim is held before the
          order is placed. <em>This receipt is the product.</em>
        </p>
        <p className="replay">
          <button
            className="lp-btn ghost"
            type="button"
            hidden={!replayVisible}
            onClick={assemble}
          >
            Replay the assembly
          </button>
        </p>
      </div>
      <div>
        <article
          ref={receiptRef}
          className="receipt"
          aria-label="Examination receipt for the held claim"
        >
          <div className="rc-head">
            <p className="rc-title">CURBSIDE COMMONS · EXAMINATION RECEIPT</p>
            <p className="rc-case">{data.caseLine}</p>
          </div>
          <ol className="rc-steps">
            <li className="rc-step">
              <span className="rc-num">01</span>
              <span className="rc-key">CLAIM</span>
              <span className="rc-val">
                {data.claim.field} · {data.claim.unit}
                <small>as served by the feed · {data.claim.claimId}</small>
              </span>
            </li>
            <li className="rc-step">
              <span className="rc-num">02</span>
              <span className="rc-key">RECORD</span>
              <span className="rc-val">
                {data.record.field} · {data.record.cents}¢ = {data.record.money}
                <small>the merchant&rsquo;s own row · read independently</small>
              </span>
            </li>
            <li className="rc-step">
              <span className="rc-num">03</span>
              <span className="rc-key">RULE</span>
              <span className="rc-val">
                {data.rule.id}
                <small>{data.rule.plain}</small>
              </span>
            </li>
            <li className="rc-step">
              <span className="rc-num">04</span>
              <span className="rc-key">ARITHMETIC</span>
              <span className="rc-val">
                {data.claimDollars} × 100 = <span ref={figRef}>{fmt(data.claimCents)}</span>¢
                <br />
                <span ref={neqRef} className="neq">
                  {fmt(data.claimCents)}¢ ≠ {fmt(data.recordCents)}¢
                </span>{" "}
                <small>the claim is ×100 the record</small>
              </span>
            </li>
            <li className="rc-step">
              <span className="rc-num">05</span>
              <span className="rc-key">VERDICT</span>
              <span className="rc-val">
                {data.severity} · the claim does not agree with the record
              </span>
            </li>
            <li className="rc-step">
              <span className="rc-num">06</span>
              <span className="rc-key">FINDING</span>
              <span className="rc-val">
                {data.findingIndex} of {data.findingTotal} · attached to this case
                <small>
                  {data.remainingErrors} more errors and {data.warns} warnings follow in the audit
                </small>
              </span>
            </li>
          </ol>
          <div className="rc-stamp">
            <span className="stamp">HOLD</span>
            <span className="rc-attach">CLAIM · RECORD · RULE — KEPT ATTACHED</span>
          </div>
        </article>
        <p className="acc r rc-acc" aria-hidden="true">
          SPECIMEN — EXAMINATION RECEIPT · PAPER · CASE 001
        </p>
      </div>
    </div>
  );
}
