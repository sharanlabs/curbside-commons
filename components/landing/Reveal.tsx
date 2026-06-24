"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A scroll-reveal wrapper. SSR-renders settled (no opacity-0 in the static HTML), so the page
 * is fully readable with JS disabled and under reduced motion. When motion is allowed, it strips
 * the settled state on mount, then re-adds `.in` as the block scrolls into view — a one-shot
 * stagger that never hides content from the initial DOM.
 */
export function Reveal({
  children,
  stagger = false,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  stagger?: boolean;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // motion allowed: opt this block into the animated lifecycle, then reveal on intersect
    el.classList.add(stagger ? "ds-stagger" : "ds-reveal");
    el.classList.remove("in");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stagger]);

  const cls = [stagger ? "ds-stagger in" : "ds-reveal in", className].filter(Boolean).join(" ");

  return Tag === "section" ? (
    <section ref={ref as React.RefObject<HTMLElement>} className={cls}>
      {children}
    </section>
  ) : (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cls}>
      {children}
    </div>
  );
}
