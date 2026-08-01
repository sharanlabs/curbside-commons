import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { TryLiveBench, CATALOG_RECORDS } from "@/components/playground/TryLiveBench";
import { SOR_CATALOG } from "@/components/playground/verify-in-browser";

/**
 * How it works — the demonstration bench (was "03 Try it live"; design source
 * `mockups/takeover-03-try-2026-07-18.html`, ADOPTED SHA adaee213…). Preset
 * edits run the REAL engine on this page, the bench terms state the pinned
 * world, and the receipt prints.
 *
 * THE UPLOAD TOOL WAS REMOVED FROM THIS PAGE 2026-07-28 and now lives at the
 * top of `/`. It sat here as section four of five, ~2990px down behind the
 * chapter head, the bench, the receipt and the terms — which is why the owner
 * still could not find it after session 36 built it. Two pages offering the
 * same upload would also be two surfaces free to drift; this repo has already
 * shipped that defect once (a retired host serving an older `/playground`, so
 * two live sites disagreed about what the product IS). One tool, one place.
 */
export const metadata: Metadata = {
  title: "How it works — the audit engine, running in your browser",
  description:
    "The same deterministic engine that audits your files, shown on a pinned feed: edit the feed, watch the verdict answer, keep the receipt. No AI calls — nothing you type leaves your browser.",
};

export default function PlaygroundPage() {
  return (
    <main className="p3-main">
      {/* ===== HEAD ===== */}
      <section className="p2-head ds-wrap" aria-labelledby="p3-h1">
        <p className="lp-eyebrow">HOW IT WORKS</p>
        <span className="lp-sec-rule" aria-hidden="true" />
        <h1 className="p2-h1" id="p3-h1">
          The engine, <span className="lit">shown on a pinned feed</span>
        </h1>
        <p className="p2-lede">
          This is the same deterministic engine that runs on your own files, working on a fixed
          feed so you can watch each rule fire. No AI calls. $0 to run. The audit itself makes
          no requests — nothing typed leaves your browser.
        </p>
        <p className="p2-chips">
          <span className="schip live">DETERMINISTIC</span>
          <span className="schip">NO AI CALLS</span>
          <span className="schip">$0 TO RUN</span>
          <span className="schip">NOTHING LEAVES YOUR BROWSER</span>
        </p>
      </section>

      {/* ===== THE BENCH ===== */}
      <section className="sect ds-wrap" id="bench-sec" aria-labelledby="bench-h2">
        <Reveal>
          <p className="lp-eyebrow">THE BENCH · READER OPERATED</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="bench-h2">
            Edit the feed. The verdict answers.
          </h2>
          <p className="lp-foot">
            Pick an edit. Every one runs the <em>real engine</em> on this page — the committed
            feed, or your edited copy of it — and the verdict panel reports both the full tally
            and exactly what your edit changed.
          </p>
        </Reveal>
        <TryLiveBench />
      </section>

      {/* ===== THE INSTRUMENT'S TERMS ===== */}
      <section className="sect ds-wrap" aria-labelledby="terms-h2">
        <Reveal>
          <p className="lp-eyebrow">THE INSTRUMENT&rsquo;S TERMS</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="terms-h2">
            What the bench can see.
          </h2>
        </Reveal>
        <Reveal>
          <div className="mcols">
            <div className="mcol">
              <p className="mk">MATCHING</p>
              <p className="mv" style={{ fontSize: 15 }}>
                exact — shared item IDs
              </p>
              <p className="mn">A feed line meets its catalog row by ID. No fuzzy matching, no guesses.</p>
            </div>
            <div className="mcol">
              <p className="mk">REFERENCE</p>
              <p className="mv" style={{ fontSize: 15 }}>
                merchant catalog · {CATALOG_RECORDS} records
              </p>
              <p className="mn">The merchant world this bench checks against.</p>
            </div>
            <div className="mcol">
              <p className="mk">PIN</p>
              <p className="mv" style={{ fontSize: 15 }}>
                catalog as-of {SOR_CATALOG.asOf}
              </p>
              <p className="mn">The reference is pinned. The same input meets the same world, every run.</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="p3-boundary">
            <span className="basof">THE HONEST BOUNDARY</span>
            <p>
              The bench above checks against the bundled catalog of {CATALOG_RECORDS} records.{" "}
              <b>An item outside those records reads as unknown or missing.</b> That is the
              verifier being honest, not broken — and it is why auditing your own feed takes your
              record file too, so your items are checked against your catalog.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ===== BACK TO THE TOOL — this page demonstrates; the home page runs ===== */}
      <section className="sect ds-wrap" aria-labelledby="own-h2">
        <Reveal>
          <p className="lp-eyebrow">YOUR OWN FILES</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="own-h2">
            Run this on your feed.
          </h2>
          <p className="lp-foot">
            The bench above is pinned to a fixed feed so every rule is visible. To audit your own data,
            the tool takes two files — the feed an agent reads and the merchant record it should
            agree with — and checks every claim in your browser, exactly as shown here.
          </p>
        </Reveal>
        <Reveal>
          <Link className="door" href="/">
            <span>
              <span className="d-eyebrow">THE TOOL</span>
              <span className="d-title">Audit your own feed</span>
              <span className="d-sub">
                Drag in your two files, or run the bundled pair. Nothing leaves the page.
              </span>
            </span>
            <span className="d-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </Reveal>
      </section>

      {/* ===== DOOR ===== */}
      <section className="sect sect-last ds-wrap">
        <Reveal>
          <Link className="door" href="/proof">
            <span>
              <span className="d-eyebrow">EVIDENCE</span>
              <span className="d-title">Proof</span>
              <span className="d-sub">The instrument&rsquo;s logbook — every score, misses kept in.</span>
            </span>
            <span className="d-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
