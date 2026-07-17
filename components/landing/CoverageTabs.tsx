"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * CoverageTabs — section 03 (redesign C-REDO). A WAI-ARIA tablist over the three
 * measured lanes. Each tab count is grounded in the engine measurables. Roving tabindex with
 * Arrow / Home / End moving selection and focus together (automatic activation);
 * aria-selected + aria-controls bind each tab to its tabpanel.
 */

export type CoverageTab = { id: string; label: string; body: string };

export function CoverageTabs({ tabs }: { tabs: CoverageTab[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (i: number) => {
    setActive(i);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = tabs.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      select(next);
    }
  };

  return (
    <div className="cv">
      <div className="cv-tabs" role="tablist" aria-label="Measured coverage categories">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`cv-tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`cv-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            className="cv-tab mono"
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`cv-panel-${t.id}`}
          aria-labelledby={`cv-tab-${t.id}`}
          hidden={active !== i}
          tabIndex={0}
          className="cv-panel"
        >
          <p className="cv-panel-body">{t.body}</p>
        </div>
      ))}
      {/* No-JS: the tabs are inert without hydration, so hide the tab row (a dead
          control is worse than none) and reveal every panel (all are already
          rendered, just `hidden`) — every lane stays reachable. Applies only when
          scripting is off; hydrated users keep the single-panel tab behavior. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: ".cv-tabs{display:none}.cv-panel[hidden]{display:block !important}",
          }}
        />
      </noscript>
    </div>
  );
}
