import demoJson from "@/fixtures/synthetic-restaurant/expected-demo.json";
import type { DemoBeat, DemoFinding, DemoTranscript } from "@/lib/packs/listings/demo/types";
import { DEMO_SUBHEAD } from "@/lib/packs/listings/demo/copy";
import { SectionRail } from "@/components/data-surfaces/SectionRail";

/**
 * The one-page demo walkthrough (D1; plan §5 D1, criterion C7).
 *
 * A STATIC, desktop-first page that renders the bundled demo transcript
 * (fixtures/synthetic-restaurant/expected-demo.json) — exactly as the report page
 * renders its bundled reports. Zero LLM, zero network, $0: the demo-render path
 * imports no provider/LLM/fs module (proven by evals/packs/demo-blindness's web
 * import-graph scan).
 *
 * Two registers throughout: the plain line leads every beat, the technical detail
 * sits under it, the receipts last — legible to a nontechnical viewer with no
 * explanation.
 *
 * Disclaimer-free (redesign Slice D, decision-log 2026-07-14): the rendered
 * SIMULATED banner was removed. The walkthrough is a genuine deterministic
 * computation on illustrative input — never asserted as live/real; no false claim
 * (C10 BANNED_CLAIMS stays green). The CLI transcript keeps its honest labels.
 *
 * Plain: shows the scripted demo as a printable one-pager — the agent trusts the
 * menu, the checker catches what the agent could not see.
 */

const transcript = demoJson as unknown as DemoTranscript;

// The public /demo headline. The committed transcript's own claim string is kept
// intact in the repo (and drift-locked to the demo copy module); the WEB page shows
// this reader-facing headline of the same mechanism — a claim checked against the record.
const WEB_DEMO_HEADLINE =
  "A shopping agent trusts the copy; the verifier checks it against the record.";

// Display-layer copy cleanup for text drawn from the committed transcript: keep the
// meaning, drop the internal actor tag, and render in the site's plain product voice.
function clean(s: string): string {
  return s
    .replace(/\s*[—-]\s*simulated\b/gi, "")
    .replace(/\bsimulated\b/gi, "example")
    .replace(/\bsynthetic\b/gi, "illustrative");
}

function Receipts({ finding, index }: { finding: DemoFinding; index: number }) {
  return (
    <li className="rpt-finding">
      <div className="rpt-finding-lead">
        <span className="rpt-idx">{String(index + 1).padStart(2, "0")}</span>
        {/* C4: the plain-words line leads. */}
        <p className="rpt-plain">{clean(finding.plainLine)}</p>
        <span className={`rpt-sev ${finding.severity}`}>{finding.severity}</span>
      </div>
      {/* C2: the four evidence fields, always visible. */}
      <dl className="rpt-receipts" aria-label="evidence">
        <div className="rpt-rc">
          <dt>claim</dt>
          <dd>
            <span className="rpt-mono">{finding.claimId}</span>
            <span className="rpt-mono-sub">
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
    <section className="dmo-beat" id={beat.id} aria-label={clean(beat.title)}>
      <div className="dmo-beat-head">
        <span className="dmo-beat-no">Beat {ordinal}</span>
        <h2 className="dmo-beat-title">{clean(beat.title)}</h2>
      </div>
      {/* C4: the plain line leads the beat. */}
      <p className="dmo-beat-plain">{clean(beat.plain)}</p>
      <ul className="dmo-beat-lines">
        {beat.lines.map((line, i) => (
          <li key={i}>{clean(line)}</li>
        ))}
      </ul>
      {beat.verdicts && beat.verdicts.length > 0 ? (
        <div className="dmo-verdicts">
          {beat.verdicts.map((v, i) => (
            <span key={i} className={`dmo-verdict ${v.ok ? "ok" : "flag"}`}>
              {clean(v.label)}
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
      <header className="rpt-head">
        <p className="rpt-eyebrow">Verifier demo · listings truth check</p>
        {/* The public headline of the demo mechanism (the committed transcript claim
            stays in the repo, drift-locked to the demo copy module). */}
        <h1 className="rpt-title">{WEB_DEMO_HEADLINE}</h1>
        <p className="rpt-intro">{DEMO_SUBHEAD}</p>
        <dl className="rpt-meta dmo-meta">
          <div className="rpt-mrow">
            <dt>actor</dt>
            <dd>{clean(transcript.actorLabel)}</dd>
          </div>
          <div className="rpt-mrow">
            <dt>spec version</dt>
            <dd className="rpt-mono">{transcript.specVersion}</dd>
          </div>
        </dl>
      </header>

      <SectionRail
        items={transcript.beats.map((beat, i) => ({
          id: beat.id,
          label: `Beat ${i + 1}`,
        }))}
      />

      <div className="dmo-beats">
        {transcript.beats.map((beat, i) => (
          <Beat key={beat.id} beat={beat} ordinal={i + 1} />
        ))}
      </div>

      <footer className="rpt-foot">
        <p>
          The agent read only the published feed and never saw the restaurant&rsquo;s records; the
          verifier checked that same feed against those records and cited every catch with its four
          receipts. The menu, the restaurant, and every record here are illustrative &mdash;
          invented for this demonstration; no real merchant&rsquo;s data appears. No language model
          runs in this demo &mdash; the comparison is exact, deterministic logic, and the same input
          always produces this same walkthrough.
        </p>
      </footer>
    </main>
  );
}
