import expectedAcpReport from "@/fixtures/synthetic-restaurant/expected-report.acp.json";

/**
 * The landing's shown catch (S5 retell) — a condensed excerpt of the SAME
 * committed golden report the /report page renders in full. Nothing here is
 * authored: the verdict, tally, and both findings are imported from the golden
 * and selected by rule id (if the golden ever changes shape, the build fails
 * loudly rather than showing a stale story). Server component; settled in SSR.
 */

type Finding = {
  claim: { id: string; source: string; field: string; value: unknown };
  ruleId: string;
  severity: string;
  plainLine: string;
};

const findings = expectedAcpReport.findings as Finding[];

function mustFind(ruleId: string, field: string): Finding {
  const f = findings.find((x) => x.ruleId === ruleId && x.claim.field === field);
  if (!f) throw new Error(`TruthCatch: golden report finding missing: ${ruleId}/${field}`);
  return f;
}

// The two most legible catches in the golden: a sold-out item served as in
// stock, and an item hidden in the merchant's own catalog but still served.
const CATCH_A = mustFind("LST-AVAIL-STATE", "availability");
const CATCH_B = mustFind("LST-AVAIL-HIDDEN-SHOWN", "existence");

const TALLY = {
  total: findings.length,
  errors: findings.filter((f) => f.severity === "error").length,
  warns: findings.filter((f) => f.severity === "warn").length,
};

export function TruthCatch() {
  return (
    <div className="lp-catch" role="figure" aria-label="Two findings from the committed demo verifier report">
      <div className="lp-catch-head">
        <span className="lp-catch-sim">SIMULATED</span>
        <span className="lp-catch-src">the committed demo report — synthetic restaurant</span>
      </div>
      <div className="lp-catch-verdict">
        <span className="lp-catch-fail">{expectedAcpReport.ok ? "PASS" : "FAIL"}</span>
        <span className="lp-catch-tally">
          {TALLY.total} findings · {TALLY.errors} error / {TALLY.warns} warn
        </span>
      </div>
      {[CATCH_A, CATCH_B].map((f) => (
        <div className="lp-catch-row" key={f.claim.id}>
          <p className="lp-catch-plain">{f.plainLine}</p>
          <p className="lp-catch-receipt">
            <span className="ds-mono">{f.claim.id}</span> · rule{" "}
            <span className="ds-mono">{f.ruleId}</span> · source{" "}
            <span className="ds-mono">{f.claim.source}</span>
          </p>
        </div>
      ))}
      <p className="lp-catch-foot">
        Every line above is deterministic — the same input always produces this same report, with no
        AI calls in the verifier.
      </p>
    </div>
  );
}
