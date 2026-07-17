"use client";

import { useEffect, useState } from "react";

/**
 * SectionRail — the "On this page" instrument rail for the data surfaces
 * (session-22 ③, the D-2 upgrade: demo/eval/metrics/cost move from scroll
 * document to navigable instrument).
 *
 * Real anchor links (no-JS functional; Web Interface Guidelines: `<a>` for
 * navigation, never div-onClick), a live reading-position marker via
 * IntersectionObserver (`aria-current="location"`), visible focus, and
 * `scroll-margin-top` on the targets (globals.css) so the sticky chrome never
 * swallows a jumped-to heading. Smooth scrolling comes from the global
 * reduced-motion-scoped `scroll-behavior` rule, not from script.
 */

export type RailItem = { id: string; label: string };

export function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const targets = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    // The active section is the one whose TOP sits lowest inside the reading
    // band (the scrollspy convention: the section the reader just arrived at
    // beats the tail of the one scrolled past); leaving entries keep the marker.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    // Bottom-of-page case: the final section may never rise into the reading
    // band, so at document end the marker belongs to the last target.
    const lastId = targets[targets.length - 1]!.id;
    const onScroll = () => {
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) setActive(lastId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav className="dsr" aria-label="On this page">
      <ol className="dsr-list">
        {items.map((it) => (
          <li key={it.id}>
            <a
              className="dsr-link"
              href={`#${it.id}`}
              aria-current={active === it.id ? "location" : undefined}
              onClick={() => setActive(it.id)}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
