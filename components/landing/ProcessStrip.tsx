"use client";

/**
 * THE PROCESS STRIP — six stations on one thin line, under the nav
 * (walkthrough redesign, 2026-08-02).
 *
 * WHAT IT IS FOR. The landing page carries one run from its two inputs to the
 * messages a human would receive. That is a PROCESS, and a reader dropped
 * halfway down it needs to know which part they are looking at and what comes
 * next. The strip answers both without adding a word of prose: it names the six
 * stations, marks the one you are in, and marks the ones you have passed.
 *
 * NO NUMERALS, DELIBERATELY (owner, 2026-07-28, re-applied here). The stations
 * are named, never numbered — "01 · INPUTS" tells a visitor this is a document
 * to be read in order, which is the exact read the de-numbering removed
 * sitewide. Order is carried by position and by the passed/current marks.
 *
 * IT REPORTS, IT NEVER DRIVES. The strip reads the run bus to pulse RUN while an
 * audit is in flight. It cannot start, stop, or alter a run — `AuditWorkbench`
 * owns that, and the strip is a reader of the same notice board the ticker and
 * the slab read.
 *
 * LANDING ONLY. It is rendered by `app/page.tsx` and nowhere else; the other
 * routes are destinations, not stations, and a process strip above them would
 * describe a journey they are not part of.
 */
import { useEffect, useState } from "react";
import { useRun } from "./run-bus";

/** The six stations, in the order the run passes through them. */
const STATIONS: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: "audit", label: "Inputs" },
  { id: "run", label: "Run" },
  { id: "verdict", label: "Verdict" },
  { id: "fees", label: "Fees" },
  { id: "delivery", label: "Delivery" },
  { id: "proof", label: "Proof" },
];

export function ProcessStrip() {
  const [here, setHere] = useState("audit");
  const { phase } = useRun();

  useEffect(() => {
    const sections = STATIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    // The band is deliberately narrow (the middle ~5% of the viewport): a wide
    // band leaves two sections intersecting at once and the mark flickers
    // between them as the reader scrolls.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.target.id) setHere(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const el of sections) io.observe(el);
    return () => io.disconnect();
  }, []);

  const hereIndex = STATIONS.findIndex((s) => s.id === here);

  return (
    <div className="wk-strip">
      <nav className="ds-wrap wk-strip-in" aria-label="Stations">
        {STATIONS.map((s, i) => {
          const isHere = s.id === here;
          const classes = [
            "wk-st",
            isHere ? "is-here" : "",
            !isHere && i < hereIndex ? "is-done" : "",
            s.id === "run" && phase === "running" ? "is-run" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <a
              key={s.id}
              className={classes}
              href={`#${s.id}`}
              aria-current={isHere ? "true" : undefined}
            >
              <span className="wk-dot" aria-hidden="true" />
              {s.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
