"use client";

import { useEffect, useRef } from "react";

/**
 * A count-up figure for the /proof measurable rails (build piece 2, 2026-07-20;
 * design source `mockups/takeover-04-proof-2026-07-18.html`).
 *
 * The v9 jewel contract, held at source (decision-log 2026-07-17): the settled
 * SSR text IS the final formatted figure — no-JS, reduced-motion, print, and
 * direct-load-in-view all render the finished number with zero choreography.
 * When motion is allowed and the figure starts below the fold, it counts up
 * once on intersect, ending on exactly the same settled string.
 */
export type CountFigProps = {
  /** The numeric final value (drives the animation). */
  to: number;
  /** The settled display string — rendered by the server, restored at the end. */
  text: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
};

const fmt = (v: number, decimals: number) =>
  decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");

export function CountFig({ to, text, decimals = 0, durationMs = 900, className }: CountFigProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top <= innerHeight) return; // already visible: stay settled

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / durationMs);
            el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)), decimals);
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
            else el.textContent = text; // settle on the exact server string
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
      el.textContent = text;
    };
  }, [to, text, decimals, durationMs]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
