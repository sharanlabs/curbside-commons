import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

/**
 * /docs — the reference layer (build piece 3, 2026-07-20; design source
 * `mockups/takeover-docs-2026-07-19.html`, ADOPTED SHA 704a1a69…; spec §11:
 * background documentation, footer-linked, never main nav). Warm paper
 * register (sanctioned deviation), neutral graphite tool tags (session-27
 * owner recolor), and the "What is real" statement — the site's ONE
 * background honesty carrier under the 2026-07-20 real-product voice
 * directive. The shared Nav + footer stay (recorded deviation from the
 * mockup's standalone doc header, for site-chrome coherence).
 */
export const metadata: Metadata = {
  title: "Documentation — how the instrument works",
  description:
    "The reference for Curbside Commons: the deterministic verifier core, the two rule packs, the receipt every finding leaves with, and the four surfaces results reach — the site, the CLI, the MCP server, and the automation lane.",
};

export default function DocsPage() {
  return (
    <main className="docs-main">
      <div className="docs-wrap">
        {/* ===== INTRO ===== */}
        <section className="sect intro" aria-labelledby="doc-h1">
          <Reveal>
            <p className="lp-eyebrow">DOCUMENTATION</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h1 id="doc-h1">How the instrument works.</h1>
            <p className="lede">
              Curbside Commons is a verification layer for marketplace data. It reads a claim
              against a reference record and attaches a receipt. This page is the reference. It
              describes the parts and how a claim becomes a receipt.
            </p>
            <p className="acc r" style={{ marginTop: 26 }} aria-hidden="true">
              CURBSIDE COMMONS · REFERENCE · NOT A CHAPTER
            </p>
          </Reveal>
        </section>

        {/* ===== ARCHITECTURE ===== */}
        <section className="sect" aria-labelledby="arch-h2">
          <Reveal>
            <p className="lp-eyebrow">THE ARCHITECTURE</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="arch-h2">Every input meets the same core.</h2>
            <p className="prose">
              Feeds and statements enter one deterministic core. The core holds two rule packs.
              Every finding leaves with a receipt. Results surface in four places.
            </p>
          </Reveal>
          <Reveal>
            <figure className="diagram">
              <svg viewBox="0 0 1080 560" role="img" aria-labelledby="arch-title arch-desc" className="arch">
                <title id="arch-title">Curbside Commons architecture</title>
                <desc id="arch-desc">
                  Feeds and statements flow into a deterministic verifier core that holds two rule
                  packs, the listings pack and the NYC fee pack. Every finding leaves with a
                  receipt made of the claim, the reference row, the rule or clause id, and a
                  severity. Results surface four ways: the site, the CLI, the MCP server, and the
                  n8n lane.
                </desc>
                <defs>
                  <marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="#4a4e5a" />
                  </marker>
                </defs>
                <text className="a-lab" x="20" y="92">INPUTS</text>
                <rect className="a-box" x="20" y="140" width="196" height="92" rx="12" />
                <text className="a-title" x="40" y="186" fontSize="16">Feeds</text>
                <text className="a-sub" x="40" y="208">marketplace listings</text>
                <rect className="a-box" x="20" y="316" width="196" height="92" rx="12" />
                <text className="a-title" x="40" y="362" fontSize="16">Statements</text>
                <text className="a-sub" x="40" y="384">merchant fee statements</text>
                <path className="a-flow" d="M216 186 C 270 186, 272 238, 320 240" markerEnd="url(#ah)" />
                <path className="a-flow" d="M216 362 C 270 362, 272 314, 320 312" markerEnd="url(#ah)" />
                <rect className="a-core" x="320" y="150" width="272" height="250" rx="16" />
                <rect className="a-hair" x="328" y="158" width="256" height="234" rx="11" fill="none" />
                <text className="a-lab" x="344" y="190">THE CORE</text>
                <text className="a-title" x="344" y="220" fontSize="15">Deterministic verifier core</text>
                <text className="a-lab" x="344" y="250" style={{ fontWeight: 700 }}>RULE PACKS</text>
                <rect className="a-pack" x="344" y="262" width="224" height="40" rx="8" />
                <circle className="a-dot" cx="364" cy="282" r="4" />
                <text className="a-chip" x="380" y="287">Listings pack</text>
                <rect className="a-pack" x="344" y="314" width="224" height="40" rx="8" />
                <circle className="a-dot" cx="364" cy="334" r="4" />
                <text className="a-chip" x="380" y="339">NYC fee pack</text>
                <text className="a-note" x="344" y="382">no model decides a verdict</text>
                <path className="a-flow" d="M592 278 L648 278" markerEnd="url(#ah)" />
                <rect className="a-ticket" x="650" y="200" width="176" height="156" rx="6" />
                <line x1="650" y1="200" x2="826" y2="200" stroke="rgba(58,50,28,.3)" strokeWidth="1.4" strokeDasharray="3 4" />
                <text className="a-tkt" x="668" y="228">RECEIPT</text>
                <text className="a-field" x="668" y="258">claim</text>
                <line className="a-hair" x1="668" y1="270" x2="808" y2="270" />
                <text className="a-field" x="668" y="290">reference row</text>
                <line className="a-hair" x1="668" y1="302" x2="808" y2="302" />
                <text className="a-field" x="668" y="322">rule / clause id</text>
                <line className="a-hair" x1="668" y1="334" x2="808" y2="334" />
                <text className="a-field" x="668" y="352">severity</text>
                <path className="a-bus" d="M826 278 L880 278" />
                <path className="a-bus" d="M880 159 L880 459" />
                <path className="a-flow" d="M880 159 L900 159" markerEnd="url(#ah)" />
                <path className="a-flow" d="M880 259 L900 259" markerEnd="url(#ah)" />
                <path className="a-flow" d="M880 359 L900 359" markerEnd="url(#ah)" />
                <path className="a-flow" d="M880 459 L900 459" markerEnd="url(#ah)" />
                <text className="a-lab" x="900" y="92">RESULTS SURFACE</text>
                <rect className="a-box" x="900" y="120" width="176" height="78" rx="12" />
                <text className="a-title" x="920" y="156" fontSize="15">The site</text>
                <text className="a-sub" x="920" y="178">browser</text>
                <rect className="a-box" x="900" y="220" width="176" height="78" rx="12" />
                <text className="a-title" x="920" y="256" fontSize="15">The CLI</text>
                <text className="a-sub" x="920" y="278">terminal</text>
                <rect className="a-box" x="900" y="320" width="176" height="78" rx="12" />
                <text className="a-title" x="920" y="356" fontSize="15">The MCP server</text>
                <text className="a-sub" x="920" y="378">stdio</text>
                <rect className="a-box" x="900" y="420" width="176" height="78" rx="12" />
                <text className="a-title" x="920" y="456" fontSize="15">The n8n lane</text>
                <text className="a-sub" x="920" y="478">workflow</text>
              </svg>
              <figcaption className="acc">FIG. — FEEDS AND STATEMENTS · CORE · FOUR SURFACES</figcaption>
            </figure>
          </Reveal>
        </section>

        {/* ===== IRON RULE ===== */}
        <section className="sect" aria-labelledby="iron-h2">
          <Reveal>
            <p className="lp-eyebrow">THE IRON RULE</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="iron-h2" className="sr">
              The iron rule
            </h2>
            <blockquote className="docs-iron">
              <p>Agents recommend; the engine decides; a human owns anything irreversible.</p>
              <p className="under" aria-hidden="true">
                THE GOVERNING RULE
              </p>
            </blockquote>
          </Reveal>
        </section>

        {/* ===== MCP SERVER ===== */}
        <section className="sect" aria-labelledby="mcp-h2">
          <Reveal>
            <p className="lp-eyebrow">THE MCP SERVER</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="mcp-h2">The tools the server exposes.</h2>
            <p className="prose">
              The engine runs as an MCP server over a stdio transport. It exposes a small set of
              tools. Each tool carries its own label. Where a result is not a verdict, the tool
              says so.
            </p>
          </Reveal>
          <Reveal>
            <p className="server-id">
              <b>commerce-truth-audit</b>
              <span className="sep">·</span>stdio transport
            </p>
            <table className="tools">
              <caption className="sr">Tools exposed by the commerce-truth-audit MCP server</caption>
              <colgroup>
                <col style={{ width: "23%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "44%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Tool</th>
                  <th scope="col">What it reads</th>
                  <th scope="col">Label</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="t-name">check_feed</td>
                  <td className="t-role">a feed against a catalog · listings pack</td>
                  <td><span className="note-plain">deterministic verdict</span></td>
                </tr>
                <tr>
                  <td className="t-name">check_conformance</td>
                  <td className="t-role">a document against a protocol schema</td>
                  <td><span className="note-plain">deterministic verdict</span></td>
                </tr>
                <tr>
                  <td className="t-name">audit_statement</td>
                  <td className="t-role">a statement against the NYC fee pack</td>
                  <td><span className="note-plain">deterministic verdict</span></td>
                </tr>
                <tr>
                  <td className="t-name">classify_and_audit</td>
                  <td className="t-role">classifies, then audits</td>
                  <td><span className="dtag">ADVISORY — candidate leads, never a verdict</span></td>
                </tr>
                <tr>
                  <td className="t-name">get_rule</td>
                  <td className="t-role">returns one rule from the table</td>
                  <td><span className="note-plain">returns the codified rule and its source-clause citation</span></td>
                </tr>
                <tr>
                  <td className="t-name">lookup_reference</td>
                  <td className="t-role">looks up a reference value</td>
                  <td><span className="dtag">EXPERIMENTAL + ADVISORY — pre-registered quality floors NOT met</span></td>
                </tr>
                <tr>
                  <td className="t-name">run_demo</td>
                  <td className="t-role">walks the shipped example</td>
                  <td><span className="dtag">DEMO-ONLY WALKTHROUGH — never an audit result</span></td>
                </tr>
              </tbody>
            </table>
          </Reveal>
        </section>

        {/* ===== AUTOMATION LANE ===== */}
        <section className="sect" aria-labelledby="n8n-h2">
          <Reveal>
            <p className="lp-eyebrow">THE AUTOMATION LANE</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="n8n-h2">The automation lane runs only by hand.</h2>
          </Reveal>
          <Reveal>
            <div className="docs-cols">
              <p className="prose" style={{ marginTop: 8 }}>
                There is one workflow. Its trigger is manual only. It runs when a person starts
                it, not on a schedule. It audits the example statement and builds a message
                payload.
              </p>
              <p className="factline">
                <span className="flamp" aria-hidden="true" />
                <span>&ldquo;no send node exists.&rdquo;</span>
              </p>
            </div>
          </Reveal>
        </section>

        {/* ===== DELIVERY BUILDERS ===== */}
        <section className="sect" aria-labelledby="builders-h2">
          <Reveal>
            <p className="lp-eyebrow">DELIVERY BUILDERS</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="builders-h2">The builders assemble messages. Nothing sends them.</h2>
          </Reveal>
          <Reveal>
            <div className="builders">
              <article className="builder">
                <h3>Slack builder</h3>
                <div className="chips" aria-hidden="true">
                  <span className="dchip">no client</span>
                  <span className="dchip">no webhook URL</span>
                  <span className="dchip">no token</span>
                  <span className="dchip">no transport</span>
                </div>
                <p>It holds no client, no webhook URL, no token, and no transport. It builds JSON and nothing else.</p>
              </article>
              <article className="builder">
                <h3>Email builder</h3>
                <div className="chips" aria-hidden="true">
                  <span className="dchip">no transport</span>
                  <span className="dchip">no credentials</span>
                  <span className="dchip">.example addresses only</span>
                </div>
                <p>It holds no transport, no credentials, and no addresses beyond reserved .example placeholders.</p>
              </article>
            </div>
            <p className="closer">
              <span className="flamp" aria-hidden="true" />
              <span>A committed check proves no send path is reachable.</span>
            </p>
          </Reveal>
        </section>

        {/* ===== CLI ===== */}
        <section className="sect" aria-labelledby="cli-h2">
          <Reveal>
            <p className="lp-eyebrow">THE COMMAND LINE</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="cli-h2">The command line runs offline.</h2>
          </Reveal>
          <Reveal>
            <div className="console" role="group" aria-label="Command-line runbook, a console excerpt">
              <div className="console-bar">
                <span className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>console excerpt</span>
              </div>
              <pre>{`npm ci
node bin/check.mjs demo
node bin/check.mjs check feed.json --against catalog.json
node bin/check.mjs check doc.json --conformance
node bin/check.mjs fees statement.json
npm run verify`}</pre>
            </div>
            <p className="closer stack">
              <span className="flamp" aria-hidden="true" />
              <span>
                Zero network and zero LLM calls on every CLI path — enforced structurally by an
                import-graph eval, not by promise.
              </span>
            </p>
          </Reveal>
        </section>

        {/* ===== WHAT IS REAL ===== */}
        <section className="sect" aria-labelledby="real-h2">
          <Reveal>
            <p className="lp-eyebrow">WHAT IS REAL</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="real-h2">What is real, and what is invented.</h2>
          </Reveal>
          <Reveal>
            <div className="statement">
              <p>
                The examples that run on this site ship with the project, and they produce the
                same results on demand. The merchant, its menu, and its statements are invented.
                The fee rules are codified from real published law; the conformance checks use real
                protocol schemas. No real platform feed or statement was audited.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ===== HOW BUILT ===== */}
        <section className="sect" aria-labelledby="how-h2">
          <Reveal>
            <p className="lp-eyebrow">HOW IT WAS BUILT</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="how-h2">How this was built.</h2>
          </Reveal>
          <Reveal>
            <p className="method-note">
              Built human-led, with AI assistance. One model works as planner and builder. A
              second works as an adversarial reviewer. Review gates sit between them, and an
              independent gate accepts the result. These are development tools. None of them is
              the product runtime.
            </p>
          </Reveal>
        </section>

        {/* ===== RETURN ===== */}
        <section className="sect" aria-label="Return">
          <Reveal>
            <p className="prose">
              <Link href="/">&larr; Return to the site</Link> — the case starts at the front
              page, and the evidence lives in <Link href="/proof">chapter 04, Proof</Link>.
            </p>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
