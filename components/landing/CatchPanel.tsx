"use client";

import { useEffect, useRef } from "react";

/**
 * The SHOWN catch — the differentiator centerpiece.
 *
 * The result is KNOWN and recorded, so every verdict + the "Held" banner are present in the
 * server-rendered HTML in their settled (resolved) state. JavaScript only *replays* a staggered
 * reveal as the panel scrolls into view, and ONLY when reduced-motion is off. Under reduced
 * motion (the e2e runs reduced-motion) the panel renders fully settled with no animation — the
 * verdicts, the hold, and the reviewer bar are all visible in the initial DOM.
 *
 * Two ledger lines match the merchant's own record; one confident-sounding claim — a go-live
 * date that simply isn't on the record — is caught and held for a person. Plain verdicts only;
 * the deep mechanics live one <details> reveal down (Layer 2), never in this always-visible DOM.
 */

type Result = "pass" | "fail";

const CLAIMS: Array<{ text: string; result: Result; cite: string }> = [
  {
    text: "“You’ve completed 2 of 5 setup steps.”",
    result: "pass",
    cite: "→ setup: 2 of 5 steps",
  },
  {
    text: "“Add photos to finish your listing.”",
    result: "pass",
    cite: "→ blocker: photos needed",
  },
  {
    text: "“You’ll be live by Friday.”",
    result: "fail",
    cite: "no go-live date on this record",
  },
];

function CheckGlyph() {
  return (
    <svg className="cp-glyph" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3 8l3 3 6-7"
        stroke="var(--ink)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg className="cp-glyph" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M4 4l7 7M11 4l-7 7" stroke="var(--signal-text)" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function CatchPanel() {
  const ref = useRef<HTMLDivElement | null>(null);

  // SSR renders the settled state (`cp-settled`). Class toggles happen imperatively here — never
  // via synchronous setState in the effect body — so there are no cascading renders. Under reduced
  // motion we leave the settled DOM untouched.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // motion allowed: drop to the un-resolved state, then replay on scroll-in
    el.classList.remove("cp-settled");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("cp-on");
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="ds-panel ds-panel-strong cp cp-settled"
      aria-label="A recorded draft, checked line by line against this merchant's record"
    >
      <div className="cp-cap">
        <span>outreach draft &middot; checked against the record</span>
        <span className="cp-cap-right">
          <span className="cp-tick" aria-hidden="true" />
          held for review
        </span>
      </div>

      {/* the merchant's own record — the only ground truth */}
      <div className="cp-record" aria-label="This merchant's record">
        <span className="cp-rlbl">
          this merchant&rsquo;s record &middot; the only thing the message is checked against
        </span>
        <span className="cp-rf">
          <span className="cp-rk">category:</span> <span className="cp-rv">Restaurant</span>
        </span>
        <span className="cp-rf">
          <span className="cp-rk">setup:</span>{" "}
          <span className="cp-rv ds-num">2 of 5 steps</span>
        </span>
        <span className="cp-rf">
          <span className="cp-rk">blocker:</span> <span className="cp-rv">photos needed</span>
        </span>
        <span className="cp-rf absent">
          <span className="cp-rk">go-live date:</span> <span className="cp-rv">none on file</span>
        </span>
      </div>

      <div className="cp-draft">
        {CLAIMS.map((c, i) => (
          <div key={i} className={`cp-claim ${c.result}`}>
            <div className="cp-ctext">{c.text}</div>
            <div className="cp-verdict">
              <span className={`cp-vcell ${c.result}`}>
                {c.result === "pass" ? <CheckGlyph /> : <CrossGlyph />}
                {c.result === "pass" ? "matches the data" : "not in the data"}
              </span>
              <span className="ds-mono cp-cite">{c.cite}</span>
            </div>
          </div>
        ))}

        <div className="cp-held">
          <span className="cp-held-lbl">Held for a person to approve.</span>
          <span className="ds-mono">
            1 claim the data doesn&rsquo;t back &middot; not sent, not rejected &mdash; it&rsquo;s
            your call.
          </span>
        </div>

        <div className="cp-decide" aria-label="Reviewer actions">
          <span className="cp-dnote ds-mono">
            what you do next &middot; recorded to the audit trail
          </span>
          <button className="ds-btn hold" type="button" disabled aria-disabled="true">
            Keep held
          </button>
          <button className="ds-btn" type="button" disabled aria-disabled="true">
            Edit the claim
          </button>
          <button className="ds-btn primary" type="button" disabled aria-disabled="true">
            Approve &amp; send
          </button>
        </div>
      </div>
    </div>
  );
}
