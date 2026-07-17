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

/** ONE source for the thesis sentence — the interactive render and the no-JS
    fallback both assemble from these fragments, so the two copies cannot drift
    (batch P2, 2026-07-16: the fallback had kept a superseded wording). */
const SENTENCE = {
  lead: "A ",
  afterClaim: " is checked against a ",
  afterRecord: " under a ",
  afterRule: ". The ",
  tail: " keeps all three together, so the conclusion can be checked instead of trusted.",
} as const;

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
        {SENTENCE.lead}
        {word("claim", "claim")}
        {SENTENCE.afterClaim}
        {word("record", "record")}
        {SENTENCE.afterRecord}
        {word("rule", "rule")}
        {SENTENCE.afterRule}
        {word("verdict", "verdict")}
        {SENTENCE.tail}
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
          {SENTENCE.lead}
          <em>claim</em>
          {SENTENCE.afterClaim}
          <em>record</em>
          {SENTENCE.afterRecord}
          <em>rule</em>
          {SENTENCE.afterRule}
          <em>verdict</em>
          {SENTENCE.tail}
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
