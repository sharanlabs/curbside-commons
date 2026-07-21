import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";
import { TryLiveBench, CATALOG_RECORDS } from "@/components/playground/TryLiveBench";
import { SOR_CATALOG } from "@/components/playground/verify-in-browser";

/**
 * 03 Try it live (build piece 3, 2026-07-20; design source
 * `mockups/takeover-03-try-2026-07-18.html`, ADOPTED SHA adaee213…). The
 * reader-operated bench: preset edits run the REAL engine on this page
 * (live beyond the mockup's replays — recorded deviation), the bench terms
 * state the pinned world, the receipt prints, and the paste leg below takes
 * a whole feed of your own. Door to 04.
 */
export const metadata: Metadata = {
  title: "Try it live — verify a feed in your browser",
  description:
    "The same deterministic engine that wrote the chapter 01 ledger, running in your browser: edit the feed, watch the verdict answer, keep the receipt. No AI calls, no network requests — nothing you type leaves the page.",
};

export default function PlaygroundPage() {
  return (
    <main className="p3-main">
      {/* ===== CHAPTER HEAD ===== */}
      <section className="p2-head ds-wrap" aria-labelledby="p3-h1">
        <p className="lp-eyebrow">03 · TRY IT LIVE</p>
        <span className="lp-sec-rule" aria-hidden="true" />
        <h1 className="p2-h1" id="p3-h1">
          Verify a feed <span className="lit">in your browser</span>
        </h1>
        <p className="p2-lede">
          The same deterministic engine that produced the chapter 01 ledger runs here. No AI
          calls. $0 to run. No network requests during a run — nothing pasted leaves the page.
        </p>
        <p className="p2-chips">
          <span className="schip live">DETERMINISTIC</span>
          <span className="schip">NO AI CALLS</span>
          <span className="schip">$0 TO RUN</span>
          <span className="schip">NO NETWORK REQUESTS</span>
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
              The reference world is the merchant catalog of {CATALOG_RECORDS} records.{" "}
              <b>An item outside those records reads as unknown or missing.</b> That is the
              verifier being honest, not broken.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            FIG. 01 — THE BENCH TERMS · PINNED WORLD
          </p>
        </Reveal>
      </section>

      {/* ===== PASTE YOUR OWN ===== */}
      <section className="sect ds-wrap" aria-labelledby="paste-h2">
        <Reveal>
          <p className="lp-eyebrow">PASTE YOUR OWN</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="paste-h2">
            Bring a whole feed.
          </h2>
          <p className="lp-foot">
            Paste a feed document — or load the committed one and edit it freely — and the engine
            checks it line by line against the same pinned catalog, locally, in this tab.
          </p>
        </Reveal>
        <Reveal>
          <PlaygroundClient />
        </Reveal>
      </section>

      {/* ===== DOOR ===== */}
      <section className="sect sect-last ds-wrap">
        <Reveal>
          <Link className="door" href="/proof">
            <span>
              <span className="d-eyebrow">CONTINUE · 04</span>
              <span className="d-title">Proof</span>
              <span className="d-sub">The instrument&rsquo;s logbook — every score, misses kept in.</span>
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
