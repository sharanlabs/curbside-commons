"use client";

import { useState } from "react";
import type { MethodDetail } from "@/lib/landing/specimen";

/**
 * MethodRelation — section 02 (redesign C-REDO). The four load-bearing words of the
 * thesis sentence — claim, record, rule, verdict — are native buttons. Selecting one
 * swaps a single detail panel that shows that part of the same grounded specimen, so a
 * verdict reads as a relationship you can inspect rather than a label to trust.
 *
 * Native <button> semantics carry keyboard operation (Tab / Enter / Space); aria-pressed
 * marks the active word; a polite live region announces the swapped panel.
 */

export function MethodRelation({ details }: { details: MethodDetail[] }) {
  const [active, setActive] = useState(details[0]?.key ?? "claim");
  const current = details.find((d) => d.key === active) ?? details[0];

  const word = (k: string, label: string) => (
    <button
      type="button"
      className="mr-word"
      aria-pressed={active === k}
      onClick={() => setActive(k)}
    >
      {label}
    </button>
  );

  return (
    <div className="mr">
      <p className="mr-sentence">
        A {word("claim", "claim")} meets a {word("record", "record")} through a{" "}
        {word("rule", "rule")}. The {word("verdict", "verdict")} keeps all three attached, so the
        conclusion can be checked instead of trusted.
      </p>

      <div className="mr-panel mr-live-panel" aria-live="polite">
        <span className="mr-panel-label mono">{current.label}</span>
        <p className="mr-panel-value mono">{current.value}</p>
        <p className="mr-panel-note">{current.note}</p>
      </div>

      {/* No-JS: the word-buttons are inert without hydration, so the button sentence
          is replaced by a static one (plain emphasis, no dead controls), the single
          swapping panel is hidden, and every part is exposed statically — all four
          remain reachable. Hydrated users keep the interactive sentence + panel. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: ".mr-sentence{display:none}.mr-live-panel{display:none}",
          }}
        />
        <p className="mr-sentence mr-sentence-static" style={{ display: "block" }}>
          A <em>claim</em> meets a <em>record</em> through a <em>rule</em>. The <em>verdict</em>{" "}
          keeps all three attached, so the conclusion can be checked instead of trusted.
        </p>
        <dl className="mr-noscript">
          {details.map((d) => (
            <div className="mr-panel" key={d.key}>
              <dt className="mr-panel-label mono">{d.label}</dt>
              <dd>
                <p className="mr-panel-value mono">{d.value}</p>
                <p className="mr-panel-note">{d.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </noscript>
    </div>
  );
}
