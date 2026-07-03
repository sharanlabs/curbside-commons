import demoJson from "@/fixtures/synthetic-restaurant/expected-demo.json";
import type { DemoBeat, DemoFinding, DemoTranscript } from "@/lib/packs/listings/demo/types";
import { DEMO_SIMULATED_BANNER, DEMO_SUBHEAD } from "@/lib/packs/listings/demo/copy";

/**
 * The one-page demo walkthrough (D1; plan §5 D1, criteria C7/C10).
 *
 * A STATIC, desktop-first page that renders the COMMITTED demo transcript
 * (fixtures/synthetic-restaurant/expected-demo.json) — exactly as the report page
 * renders committed golden reports. Zero LLM, zero network, $0: the demo-render
 * path imports no provider/LLM/fs module (proven by evals/packs/demo-blindness's
 * web import-graph scan). The honesty-critical copy (the verbatim C7 claim, the
 * actor label, the banner) is single-sourced from the demo copy module.
 *
 * Two registers throughout: the plain line leads every beat, the technical detail
 * sits under it, the receipts last — legible to a nontechnical viewer with no
 * explanation.
 *
 * Plain: shows the scripted demo as a printable one-pager — the agent trusts the
 * menu, the checker catches what the agent could not see — with the "everything
 * here is made-up test data" label impossible to miss.
 */

const transcript = demoJson as unknown as DemoTranscript;

function Receipts({ finding, index }: { finding: DemoFinding; index: number }) {
  return (
    <li className="rpt-finding">
      <div className="rpt-finding-lead">
        <span className="rpt-idx">{String(index + 1).padStart(2, "0")}</span>
        {/* C4: the plain-words line leads. */}
        <p className="rpt-plain">{finding.plainLine}</p>
        <span className={`rpt-sev ${finding.severity}`}>{finding.severity}</span>
      </div>
      {/* C2: the four evidence fields, always visible. */}
      <dl className="rpt-receipts" aria-label="evidence">
        <div className="rpt-rc">
          <dt>claim</dt>
          <dd>
            <span className="rpt-mono">{finding.claimId}</span>
            <span className="rpt-rc-sub">
              {finding.claimSource} · {finding.claimField} = {finding.claimValue}
            </span>
          </dd>
        </div>
        <div className="rpt-rc">
          <dt>reference row</dt>
          <dd className="rpt-mono">{finding.referenceRowId}</dd>
        </div>
        <div className="rpt-rc">
          <dt>rule / spec-clause</dt>
          <dd className="rpt-mono">{finding.ruleId}</dd>
        </div>
        <div className="rpt-rc">
          <dt>class</dt>
          <dd className="rpt-mono">{finding.category || "—"}</dd>
        </div>
      </dl>
    </li>
  );
}

function Beat({ beat, ordinal }: { beat: DemoBeat; ordinal: number }) {
  return (
    <section className="dmo-beat" aria-label={beat.title}>
      <div className="dmo-beat-head">
        <span className="dmo-beat-no">Beat {ordinal}</span>
        <h2 className="dmo-beat-title">{beat.title}</h2>
      </div>
      {/* C4: the plain line leads the beat. */}
      <p className="dmo-beat-plain">{beat.plain}</p>
      <ul className="dmo-beat-lines">
        {beat.lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {beat.verdicts && beat.verdicts.length > 0 ? (
        <div className="dmo-verdicts">
          {beat.verdicts.map((v, i) => (
            <span key={i} className={`dmo-verdict ${v.ok ? "ok" : "flag"}`}>
              {v.label}
            </span>
          ))}
        </div>
      ) : null}
      {beat.findings && beat.findings.length > 0 ? (
        <ol className="rpt-findings dmo-findings">
          {beat.findings.map((f, i) => (
            <Receipts key={`${f.claimId}:${f.ruleId}`} finding={f} index={i} />
          ))}
        </ol>
      ) : null}
    </section>
  );
}

export function DemoView() {
  return (
    <main className="rpt-wrap dmo-wrap" id="demo">
      {/* C10: the SIMULATED label — unmissable, survives print. */}
      <div className="rpt-sim" role="note">
        <span className="rpt-sim-tag">SIMULATED</span>
        <span className="rpt-sim-text">{DEMO_SIMULATED_BANNER}</span>
      </div>

      <header className="rpt-head">
        <p className="rpt-eyebrow">Verifier demo · listings truth check</p>
        {/* C7: the verbatim demo claim is the only headline. */}
        <h1 className="rpt-title">{transcript.claim}</h1>
        <p className="rpt-intro">{DEMO_SUBHEAD}</p>
        <dl className="rpt-meta dmo-meta">
          <div className="rpt-mrow">
            <dt>actor</dt>
            <dd>{transcript.actorLabel}</dd>
          </div>
          <div className="rpt-mrow">
            <dt>spec version</dt>
            <dd className="rpt-mono">{transcript.specVersion}</dd>
          </div>
          <div className="rpt-mrow">
            <dt>data</dt>
            <dd className="rpt-mono">simulated: {String(transcript.simulated)}</dd>
          </div>
        </dl>
      </header>

      <div className="dmo-beats">
        {transcript.beats.map((beat, i) => (
          <Beat key={beat.id} beat={beat} ordinal={i + 1} />
        ))}
      </div>

      <footer className="rpt-foot">
        <p>
          The agent read only the published feed and never saw the restaurant&rsquo;s records; the
          verifier checked that same feed against those records and cited every catch with its four
          receipts. No language model runs in this demo &mdash; the comparison is exact,
          deterministic logic. Simulated prototype, run on demand &mdash; not a live service, no
          real platform access. Human-led, AI-assisted, professionally reviewed.
        </p>
      </footer>
    </main>
  );
}
