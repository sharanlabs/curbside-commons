/**
 * L-2 PLAIN-TEXT EMAIL BODY — the `text/plain` half of the structured-API send,
 * extracted from `scripts-ts/l2-resend-one-shot.mts` (2026-07-25) so the bytes a
 * live send transmits are pinned by a committed golden.
 *
 * WHY THIS MODULE EXISTS — the gap it closes: the L-2 Resend one-shot POSTs BOTH
 * a `text` and an `html` half. The `html` half has always come from the
 * golden-tested `buildEmailReportHtml`, and the sibling Slack one-shot imports
 * `buildSlackReportPayload`, so both were byte-pinned. The `text` half alone was
 * composed INLINE in the script, covered by no golden and no assertion — making
 * it the only live-send surface in the repo whose exact bytes no test observed.
 * A capability sweep found it; this module is the fix.
 *
 * WHAT IS DELIBERATELY *NOT* CHANGED: this half does not match
 * `lib/delivery/email.ts`'s RFC 5322 `.eml` body, and that divergence is
 * intentional and owner-directed — the v5 redesign (design source
 * `mockups/email-v5-light-tweakable-2026-07-22.html`) specifies that the
 * structured-API text half MIRRORS the v5 HTML half (verdict first, capped
 * plain-language lines with rule ids, the same evidence pointer / action line /
 * footer), whereas the `.eml` builder serves a different, provider-agnostic SMTP
 * path. The defect was that the mirror was UNPINNED, never that it was wrong.
 * Extraction is byte-preserving by construction: the golden is generated from
 * this function and the one-shot now calls it, so script and test cannot drift.
 *
 * A3 TRANSPORT-FREE BOUNDARY (binding, same contract as the HTML builder): this
 * module is a PURE function of (canonical report, caller-supplied meta) → string.
 * It performs no I/O, holds no secret, and carries NO URL literal — `siteLink`
 * arrives from the caller precisely so a builder can never name an endpoint.
 */

/** Leads every body — control #4 of `docs/plan-a3-delivery-safety.md`. */
export const SIMULATED_BANNER =
  "SIMULATED DATA — Curbside Commons demonstration output. Not real merchant data, not legal advice.";

/**
 * Findings rendered in full before the explicit "…and N more" row. Mirrors
 * `EMAIL_HTML_FINDINGS_CAP` — the curation directive ("clean, not cluttered"):
 * the email carries the verdict and the top lines, report.json carries the set.
 */
export const EMAIL_TEXT_FINDINGS_CAP = 6;

export interface EmailTextMeta {
  /**
   * Public-site link for the "Run the same audit" line. CALLER-supplied so this
   * module stays URL-literal-free (the A3 boundary contract).
   */
  readonly siteLink: string;
}

interface ParsedFinding {
  readonly verdict?: unknown;
  readonly ruleId?: unknown;
  readonly plainLine?: unknown;
}

interface ParsedReport {
  readonly ok?: unknown;
  readonly findings?: ReadonlyArray<ParsedFinding>;
}

const plural = (n: number): string => (n === 1 ? "" : "s");

/**
 * The verdict headline shared by the subject line and the body's first row.
 * Exported because the one-shot needs the same string in both places and a
 * second inline copy is exactly the drift this module exists to prevent.
 */
export function emailVerdictLine(ok: boolean, findingCount: number, violationCount: number): string {
  return ok
    ? `PASS — no violations (${findingCount} non-gating finding${plural(findingCount)})`
    : `FAIL — ${violationCount} violation${plural(violationCount)} across ${findingCount} finding${plural(findingCount)}`;
}

/**
 * Build the plain-text half from a registry tool's canonical payload.
 *
 * @throws if the canonical is not a decision-grade report — the one-shot's
 * pre-send validation depends on this refusing rather than emitting a body that
 * silently claims less than it should.
 */
export function buildEmailReportText(canonical: string, meta: EmailTextMeta): string {
  const parsed = JSON.parse(canonical) as ParsedReport;
  if (typeof parsed.ok !== "boolean" || !Array.isArray(parsed.findings)) {
    throw new Error("buildEmailReportText: canonical is not a decision-grade report (missing ok/findings)");
  }
  const findings = parsed.findings;
  const violations = findings.filter((f) => f.verdict === "violation").length;
  const verdictLine = emailVerdictLine(parsed.ok, findings.length, violations);
  const remainder = findings.length - EMAIL_TEXT_FINDINGS_CAP;

  return [
    SIMULATED_BANNER,
    "",
    `Result: ${verdictLine}`,
    "",
    ...findings
      .slice(0, EMAIL_TEXT_FINDINGS_CAP)
      .map((f) => `- ${String(f.plainLine ?? "")} [${String(f.ruleId ?? "")}]`),
    // Truncation is EXPLICIT, never silent (the A3 invariant the goldens enforce).
    ...(remainder > 0
      ? [`...and ${remainder} more finding${plural(remainder)} — the full set travels in the attached report.json.`]
      : []),
    "",
    "Attached report.json has the full audit — every claim, rule, and calculation. Re-runs reproduce it byte for byte.",
    "",
    `Run the same audit: ${meta.siteLink}`,
    "",
    "One-time demonstration send. Not a subscription.",
    "Simulated data checked against real NYC law (§20-563.3 / Local Law 79 of 2025). Not legal advice. No real platform access.",
  ].join("\n");
}
