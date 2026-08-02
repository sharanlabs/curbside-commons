import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { ProcessStrip } from "@/components/landing/ProcessStrip";
import { RunTicker } from "@/components/landing/RunTicker";
import { VerdictSlab } from "@/components/landing/VerdictSlab";
import { DeliverySection } from "@/components/landing/DeliverySection";
import { AuditWorkbench } from "@/components/playground/AuditWorkbench";
import {
  COVERAGE,
  DELIVERY_DATE,
  DELIVERY_IDLE,
  TRUST_TESTS,
  VERDICT_IDLE,
} from "@/lib/landing/specimen";

/**
 * Home — ONE RUN, CARRIED TO THE END (walkthrough redesign, 2026-08-02; design
 * source `mockups/walkthrough-one-run-2026-08-02.html`, rendered and
 * fold-verified before this port).
 *
 * WHAT CHANGED AND WHY. The previous landing handed over the instrument and then
 * explained it, which was right as far as it went — but it STOPPED at the
 * verdict. A reader who ran the tool saw a tally and a list of findings, and
 * nothing about what happens next. Meanwhile the CLI walkthrough had been
 * carrying the same run all the way to the Slack payload and the email message
 * for weeks, and none of that was on the site.
 *
 * So the page is now the run itself, in six stations: the two INPUTS, the RUN as
 * it happens, the VERDICT with its receipts, the FEES reading of the same run,
 * the DELIVERY artifacts a human would receive, and the PROOF that the whole
 * thing is deterministic. A process strip under the nav names the stations and
 * tracks where you are.
 *
 * WHAT LEFT THIS PAGE: `CommonsScene` and `TurnSection`. The scene explained
 * what happens to a claim, and the turn showed one finding's arithmetic — both
 * jobs the VERDICT slab's receipts now do with the reader's OWN run rather than
 * with a diagram. Neither file is deleted; the components remain in the repo.
 *
 * STATE OWNERSHIP. `AuditWorkbench` is still the only thing that parses input or
 * calls the verifier. The ticker, the slab, and the delivery station READ that
 * run from `components/landing/run-bus.ts`. One engine call, several readers.
 *
 * FIGURES. Every count still derives from `lib/landing/specimen.ts` — the
 * prose-figure lock in `evals/packs/fees-surface.test.ts` bans hand-typed engine
 * figures in this file, and that constraint outlives this redesign. The delivery
 * artifacts are built on the SERVER by the real builders, so the fixtures and
 * the engine measurables never reach the browser bundle.
 */
export const metadata = {
  title: "Curbside Commons — audit a marketplace feed against the merchant's records",
  description:
    "Upload a feed and the merchant records it should agree with. Every claim is checked line by line in your browser, and you see the verdict, the fee reading, and the exact messages a human would receive. No AI calls, and nothing you upload leaves your browser.",
};

export default function Landing() {
  return (
    <>
      <ProcessStrip />
      <main className="lp-main wk-main">
        {/* ===== STATION 1 · INPUTS — the announcement and the instrument, as
                 one object. Deliberately NOT a full viewport: both drop zones
                 AND the run control stay above a 900px fold at 1280 (the
                 canonical.spec contract). ===== */}
        <section className="wk-s-inputs ds-wrap" id="audit" aria-labelledby="hero-h1">
          <h1 id="hero-h1" className="cs-h1 wk-h1">
            Dinner can be ordered while you sleep.
            <br />
            <span className="cs-h1-lit">What the agent read needs proof.</span>
          </h1>
          <p className="cs-lede wk-lede">
            Curbside Commons checks a marketplace feed against the merchant&rsquo;s own records and
            reports every claim that disagrees — then shows you exactly what would be delivered, and
            to whom.
          </p>
          <AuditWorkbench />
        </section>

        {/* ===== STATION 2 · RUN — the check, narrated from the real result ===== */}
        <section className="wk-s-run ds-wrap" id="run" aria-labelledby="run-h">
          <RunTicker />
        </section>

        {/* ===== STATION 3 · VERDICT — the slab, with the arithmetic attached ===== */}
        <section className="wk-s-verdict ds-wrap" id="verdict" aria-labelledby="verdict-h2">
          <Reveal>
            <p className="lp-eyebrow">THE VERDICT</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 className="lp-h2" id="verdict-h2">
              Findings, with the arithmetic attached.
            </h2>
          </Reveal>
          <VerdictSlab idle={VERDICT_IDLE} />
        </section>

        {/* ===== STATION 4 · FEES — the same run, read against the law ===== */}
        <section className="wk-s-fees ds-wrap" id="fees" aria-labelledby="fees-h2">
          <Reveal>
            <p className="lp-eyebrow">THE LAW</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 className="lp-h2" id="fees-h2">
              The fee statement, read against the law.
            </h2>
            <p className="lp-foot">
              New York City caps delivery fees. The same run reads a fee statement against the
              codified rules of Administrative Code &sect;20-563.3 — and every finding cites the rule
              it stands on.
            </p>
          </Reveal>
          <div className="wk-fees-grid">
            <Reveal as="section" className="wk-fee-card finding">
              <p className="wk-fee-k">
                <span>A held charge</span>
                <span className="wk-fee-sev">ERROR</span>
              </p>
              <h3>A fee above the cap</h3>
              <p className="d">
                The statement&rsquo;s delivery fee exceeds what the ordinance permits for the
                order&rsquo;s subtotal. The finding names the charge, the cap, and the difference —
                and links the rule text itself.
              </p>
              <Link className="go" href="/fees">
                Read the rule it cites{" "}
                <span className="arr" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </Reveal>
            <Reveal as="section" className="wk-fee-card">
              <p className="wk-fee-k">
                <span>The rulebook</span>
              </p>
              <h3>Codified, and honest about reach</h3>
              <p className="d">
                Rules that can be checked from the statement itself are checked. Rules that need
                outside evidence say so — a limit stated is a limit kept.
              </p>
              <div className="wk-fee-counts">
                <div>
                  <span className="wk-n">{COVERAGE.feeRulesTotal}</span>
                  <span className="wk-k2">Rules codified</span>
                </div>
                <div>
                  <span className="wk-n">{COVERAGE.feeExecutable}</span>
                  <span className="wk-k2">Checkable here</span>
                </div>
                <div>
                  <span className="wk-n">{COVERAGE.feeExternal}</span>
                  <span className="wk-k2">Need evidence</span>
                </div>
              </div>
              <Link className="go" href="/fees">
                Open the fee rules{" "}
                <span className="arr" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ===== STATION 5 · DELIVERY — built by the real builders, never sent.
                 The artifacts are constructed on the server for the idle state
                 and rebuilt in the browser after a run; no transport exists on
                 this page, and an import-graph eval proves it. ===== */}
        <section className="wk-s-delivery ds-wrap" id="delivery" aria-labelledby="delivery-h2">
          <Reveal>
            <p className="lp-eyebrow">DELIVERY</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 className="lp-h2" id="delivery-h2">
              What a human would receive.
            </h2>
            <p className="lp-foot">
              A verdict that stays on a screen changes nothing. The run builds the two messages an
              operations channel would get — and shows them to you here instead of sending them,
              because this page has no way to send anything.
            </p>
          </Reveal>
          <DeliverySection idle={DELIVERY_IDLE} date={DELIVERY_DATE} />
          <p className="wk-delivery-note">
            <b>Nothing is transmitted.</b> These artifacts are built by the same code paths an
            owner-armed, one-shot demonstration uses — but no send transport is wired into this
            site. You are looking at the end of the pipeline, on paper.
          </p>
        </section>

        {/* ===== STATION 6 · PROOF ===== */}
        <section className="sect sect-last ds-wrap" id="proof" aria-labelledby="trust-h2">
          <Reveal>
            <p className="lp-eyebrow">WHY TRUST THE VERDICT</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 className="lp-h2" id="trust-h2">
              The same input, the same receipt, every time.
            </h2>
            <p className="lp-foot">
              Verdicts are deterministic. No model is in the loop when a claim is judged. Failures
              are reported, not hidden.
            </p>
          </Reveal>
          <div className="trust">
            <Reveal className="fact">
              <p className="fig">1 = 1</p>
              <p className="cap">DETERMINISTIC</p>
              <p className="d">A verdict is exact rule logic, byte for byte. No model decides it.</p>
            </Reveal>
            <Reveal className="fact">
              <p className="fig">
                <span className="accent">{TRUST_TESTS.figure}</span>
              </p>
              <p className="cap">AUTOMATED TESTS</p>
              <p className="d">
                {TRUST_TESTS.plain.charAt(0).toUpperCase() + TRUST_TESTS.plain.slice(1)}{" "}
                compare the engine&rsquo;s output with the results it has committed to.
              </p>
            </Reveal>
            <Reveal className="fact">
              <p className="fig">DEFER</p>
              <p className="cap">ON THE RECORD</p>
              <p className="d">
                Where evidence fell short of a pre-registered floor, the label says so. A
                first-attempt DEFER stays published.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <div className="lp-cta-row lp-cta-close">
              <a className="lp-btn primary" href="#audit">
                Audit a feed
              </a>
              <Link className="lp-btn ghost" href="/docs">
                What is real, what is invented
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
