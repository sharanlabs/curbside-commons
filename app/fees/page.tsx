import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { FeesView } from "@/components/fees/FeesView";
import { FeeJewel } from "@/components/fees/FeeJewel";
import { FeePlaygroundClient } from "@/components/fees/FeePlaygroundClient";
import {
  CAPS_VIEW,
  EXTERNAL_EVIDENCE_RULES,
  FEE_BOUNDARY,
  RULE_TABLE_FRESHNESS,
  VERDICT_TAG_DISPLAY,
} from "@/components/fees/fee-report-data";

/**
 * 02 Fee audit (build piece 3, 2026-07-20; design source
 * `mockups/takeover-02-fees-2026-07-17.html`, ADOPTED SHA cb1f45fb…, translated
 * IN ULTRAMARINE — the D1 recolor at build). NYC-alone scoping (spec §4), the
 * four caps, the averaging-clause jewel, four example months as paper receipts,
 * the 11/6 proof boundary, the in-browser audit (real engine paste leg), and
 * the D5-corrected door to 03 (the FEED bench — statement pasting lives here).
 * Every figure derives from the fee data layer (committed goldens + registry).
 */
export const metadata: Metadata = {
  title: "Fee audit — a statement read against the law",
  description:
    "One delivery-platform statement, checked line by line against NYC Administrative Code §20-563.3 — the four caps, the category lock, the refund window — with the statement line, the clause, the rule, and the arithmetic attached to every finding.",
};

// Spelled-out register for counts in prose position — DERIVED, never typed.
const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
] as const;
const spelled = (n: number) => WORDS[n] ?? String(n);
const spelledCap = (n: number) => {
  const w = spelled(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

export default function FeesPage() {
  return (
    <main className="p2-main">
      {/* ===== CHAPTER HEAD ===== */}
      <section className="p2-head ds-wrap" aria-labelledby="fee-h1">
        <p className="lp-eyebrow">02 · FEE AUDIT</p>
        <span className="lp-sec-rule" aria-hidden="true" />
        <h1 className="p2-h1" id="fee-h1">
          A fee statement, <span className="lit">read against the law.</span>
        </h1>
        <p className="p2-lede">
          One delivery-platform statement, checked line by line against{" "}
          <b>{RULE_TABLE_FRESHNESS.statute}</b> — the fee-cap core codified from{" "}
          {RULE_TABLE_FRESHNESS.primarySource.replace(" — the certified enacted text", "")}.
          Certified text, verified current as of {RULE_TABLE_FRESHNESS.verifiedAsOf}.
        </p>
        <p className="p2-lede">
          <b>New York City alone.</b> This law stops at the five boroughs. The listings checks in
          the previous chapter run anywhere in the US; the fee caps do not.
        </p>
        <p className="nyc-line">
          JURISDICTION · NEW YORK CITY <i>· §20-563.3 · LOCAL LAW 79 OF 2025</i>
        </p>
        <p className="p2-chips">
          <span className="schip">
            <b>{FEE_BOUNDARY.total}</b> CODIFIED RULES
          </span>
          <span className="schip">
            <b>{FEE_BOUNDARY.executable}</b> FROM THE STATEMENT
          </span>
          <span className="schip">
            <b>{FEE_BOUNDARY.external}</b> NEED OUTSIDE EVIDENCE
          </span>
        </p>
      </section>

      {/* ===== THE FOUR CAPS ===== */}
      <section className="sect ds-wrap" aria-labelledby="caps-h2">
        <Reveal>
          <p className="lp-eyebrow">THE LAW&rsquo;S ARITHMETIC</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="caps-h2">
            Four caps hold every statement.
          </h2>
          <p className="lp-foot">
            The statute names four fee types and caps each one. A fee outside these four
            categories is not allowed at all — the category lock. The boundary section below
            carries the rest of the rulebook.
          </p>
        </Reveal>
        <Reveal>
          <div className="caps">
            {CAPS_VIEW.map((c) => (
              <div className="cap-cell" key={c.key}>
                <p className="c-k">{c.key}</p>
                <p className="c-fig">{c.figure}</p>
                <p className="c-n">{c.note}</p>
                <p className="c-cl">{c.clause}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            FIG. 03 — THE FOUR CAPS · §20-563.3
          </p>
        </Reveal>
      </section>

      {/* ===== THE JEWEL — the overrun, measured ===== */}
      <section className="sect ds-wrap" aria-labelledby="fee-jewel-label">
        <Reveal>
          <FeeJewel />
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            FIG. 04 — THE OVERRUN, MEASURED
          </p>
        </Reveal>
      </section>

      {/* ===== THE EXAMPLE MONTHS ===== */}
      <section className="sect ds-wrap" aria-labelledby="months-h2">
        <Reveal>
          <p className="lp-eyebrow">THE EXAMPLE MONTHS</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="months-h2">
            Four example months, one law.
          </h2>
          <p className="lp-foot">
            The same {spelled(FEE_BOUNDARY.executable)} statement-readable rules run against four
            example months. One fails after the window closes. One passes clean. One is cured by a refund
            that arrived in time, and one waits, conditional, while its window is still open —{" "}
            <em>the window is part of the law, not a loophole.</em>
          </p>
        </Reveal>
        <FeesView />
      </section>

      {/* ===== THE BOUNDARY ===== */}
      <section className="sect ds-wrap" aria-labelledby="bound-h2">
        <Reveal>
          <p className="lp-eyebrow">THE BOUNDARY</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="bound-h2">
            What a statement can prove — and what it cannot.
          </h2>
          <p className="lp-foot">
            {spelledCap(FEE_BOUNDARY.total)} codified rules. {spelledCap(FEE_BOUNDARY.executable)}{" "}
            read straight off the statement: the four caps, the category lock, the gating clause,
            the averaging clause, the refund window. {spelledCap(FEE_BOUNDARY.external)} need
            evidence a statement cannot hold — <em>and they say so, on the record.</em>
          </p>
        </Reveal>
        <div className="bounds">
          <Reveal className="bpanel">
            <p className="b-k">FROM THE STATEMENT ITSELF · {FEE_BOUNDARY.executable} RULES</p>
            <h3>Checkable here, deterministically</h3>
            <p className="b-d">
              Every check in this chapter is arithmetic or a category read: a division against a
              cap, a fee type against the four the law names, a date against a window.{" "}
              <b>The same statement produces the same verdicts, every time.</b>
            </p>
            <p className="b-d">
              Where a platform asserts a pass-through the statement cannot verify, the verdict
              does not pretend. It flags.
            </p>
            <div className="taglegend" aria-label="The verdict tags used by this audit">
              <span className="tl-k">VERDICT TAGS</span>
              <span className="vtag vio">{VERDICT_TAG_DISPLAY.violation}</span>
              <span className="vtag cond">
                {VERDICT_TAG_DISPLAY["conditional-pending-refund-window"]}
              </span>
              <span className="vtag cured">{VERDICT_TAG_DISPLAY["cured-by-refund"]}</span>
              <span className="vtag flag">
                {VERDICT_TAG_DISPLAY["asserted-passthrough-unverified"]}
              </span>
            </div>
          </Reveal>
          <Reveal className="bpanel plain">
            <p className="b-k">NEEDS OUTSIDE EVIDENCE · {FEE_BOUNDARY.external} RULES</p>
            <h3>Outside what a statement can show</h3>
            <div className="ur-head" aria-hidden="true">
              <span>RULE</span>
              <span>STATUS</span>
            </div>
            <ul className="ur-list">
              {EXTERNAL_EVIDENCE_RULES.map((r) => (
                <li key={r.id}>
                  <span className="ur-t">{r.title}</span>
                  <span className="ur-s">UNRESOLVED — OUTSIDE THE STATEMENT</span>
                </li>
              ))}
            </ul>
            <p className="b-d">An honest audit names its edge. These stay open until the evidence exists.</p>
          </Reveal>
        </div>
        <Reveal>
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            FIG. 05 — THE PROOF BOUNDARY · {FEE_BOUNDARY.executable} / {FEE_BOUNDARY.external}
          </p>
        </Reveal>
      </section>

      {/* ===== YOUR TURN — the in-browser audit (real engine) ===== */}
      <section className="sect ds-wrap" id="felt" aria-labelledby="felt-h2">
        <Reveal>
          <p className="lp-eyebrow">YOUR TURN</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="felt-h2">
            Audit a statement in your browser.
          </h2>
          <p className="lp-foot">
            Load the example statement — or paste one in its shape, meta block and lines — and run
            the audit. The checks are the real rule arithmetic, computed locally on the lines you
            supply. Nothing is sent anywhere.
          </p>
        </Reveal>
        <Reveal>
          <FeePlaygroundClient />
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            SPECIMEN — AUDIT INSTRUMENT · LOCAL ARITHMETIC
          </p>
        </Reveal>
      </section>

      {/* ===== DOOR — continue to 03 (D5-corrected copy) ===== */}
      <section className="sect sect-last ds-wrap">
        <Reveal>
          <Link className="door" href="/playground">
            <span>
              <span className="d-eyebrow">CONTINUE · 03</span>
              <span className="d-title">Try it live</span>
              <span className="d-sub">
                The feed bench — run the same engine on a marketplace feed, in your browser.
              </span>
            </span>
            <span className="d-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
