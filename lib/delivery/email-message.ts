/**
 * A3 EMAIL MESSAGE COMPOSITION — the BUFFER-FREE half of the `.eml` builder.
 *
 * WHY THIS MODULE EXISTS (2026-08-02, the DELIVERY station on the landing page).
 * `lib/delivery/email.ts` composes a complete RFC 5322 message, and to do that it
 * must ENCODE: `quotedPrintable()` and `base64Wrapped()` both call `Buffer` — a
 * Node global with no browser guarantee. The landing page's DELIVERY station
 * renders the message a human would receive: the headers and the readable
 * plain-text body. It renders NEITHER the quoted-printable body nor the base64
 * attachment, so it needs the composition and not the encoding.
 *
 * So the composition moves here, Buffer-free, and `email.ts` imports it. That is
 * the whole change: the strings a recipient reads are now built in ONE place and
 * consumed by two callers (the `.eml` assembler and the site), which is the same
 * anti-drift discipline `email-text.ts` was extracted for. A second copy of the
 * body composition living in a React component is exactly the drift this repo
 * has paid for before — the site would quietly claim something the builder does
 * not say.
 *
 * BYTE-PRESERVING BY CONSTRUCTION: `buildEmailReportMessage` calls these
 * functions rather than re-implementing them, so the committed golden
 * (`evals/delivery/gold/email-fees-drifted.golden.eml`) pins this module too.
 *
 * TRANSPORT-FREE, like every module in this directory: pure functions of
 * (canonical report, caller-supplied meta) → string. No I/O, no client, no
 * credential, no address beyond the RFC 2606 `.example` placeholders.
 */

/** RFC 2606 reserved domains — a valid message that can never be delivered. */
export const EMAIL_FROM_PLACEHOLDER = "truth-audit@sender.example";
export const EMAIL_TO_PLACEHOLDER = "merchant-ops@recipient.example";

/** Computed plural suffix (the c8c91a0 copy standard — no literal "(s)" forms). */
export const plural = (n: number): string => (n === 1 ? "" : "s");

/**
 * Findings rendered in full before the explicit "…and N more" row. Truncation is
 * EXPLICIT, never silent — the A3 invariant the goldens enforce.
 */
export const EML_FINDINGS_CAP = 20;

export interface EmailReportMeta {
  readonly tool: string;
  readonly subject: string;
  /** RFC 5322 date string, caller-supplied for determinism (e.g. "Mon, 06 Jul 2026 12:00:00 +0000"). */
  readonly date: string;
}

/**
 * Reject CR/LF/control chars and non-ASCII in any header-bound value
 * (header-injection guard, Codex A3 review P2). Lives here so the SITE renders a
 * subject through the same refusal the wire format applies — a preview that
 * displays a header the builder would reject is a preview that lies.
 */
export function assertHeaderSafe(field: string, value: string): string {
  if (value.length === 0) throw new Error(`delivery/email: header field "${field}" must be non-empty`);
  if (/[\r\n]/.test(value)) throw new Error(`delivery/email: header field "${field}" contains CR/LF — header injection refused`);
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new Error(`delivery/email: header field "${field}" contains control characters — refused`);
  if (/[^ -~]/.test(value)) {
    throw new Error(`delivery/email: header field "${field}" contains non-ASCII — use an ASCII value (RFC 2047 encoding is out of scope for this builder)`);
  }
  return value;
}

export interface EmailParsedFinding {
  readonly id: string;
  readonly severity: string;
  readonly plainLine: string;
}

export interface EmailParsedReport {
  readonly ok: boolean;
  readonly findings: readonly EmailParsedFinding[];
}

/** JSON-level parse: loud on shape surprises, never a quiet default. */
export function parseCanonicalForEmail(canonical: string): EmailParsedReport {
  const raw = JSON.parse(canonical) as { ok?: unknown; findings?: unknown };
  if (typeof raw.ok !== "boolean" || !Array.isArray(raw.findings)) {
    throw new Error("delivery/email: canonical payload is not a decision-grade report (boolean ok + findings[] required)");
  }
  return {
    ok: raw.ok,
    findings: raw.findings.map((f: unknown, i: number) => {
      const ff = f as { claim?: { id?: unknown }; severity?: unknown; plainLine?: unknown };
      if (typeof ff.claim?.id !== "string") throw new Error(`delivery/email: finding[${i}] lacks claim.id`);
      return {
        id: ff.claim.id,
        severity: typeof ff.severity === "string" ? ff.severity : "unknown",
        plainLine: typeof ff.plainLine === "string" ? ff.plainLine : "",
      };
    }),
  };
}

/** The `.eml` lane's verdict headline. */
export function emlVerdictLine(ok: boolean, findingCount: number): string {
  return ok
    ? `PASS - no violations (${findingCount} non-gating finding${plural(findingCount)})`
    : `FAIL - violations present (${findingCount} finding${plural(findingCount)})`;
}

/** The `Subject:` header value, banner marker included — the builder's own wording. */
export function emlSubjectLine(subject: string): string {
  return `[SIMULATED] Truth-audit result: ${subject}`;
}

/**
 * The readable plain-text body — what a recipient actually reads, before
 * quoted-printable encoding puts it on the wire.
 */
export function buildEmailReportBodyText(canonical: string, meta: Pick<EmailReportMeta, "tool" | "subject">): string {
  const tool = assertHeaderSafe("tool", meta.tool);
  const report = parseCanonicalForEmail(canonical);
  return [
    // Template v2 (2026-07-10, plan v3.3 S4b): name migrated → "Curbside Commons"
    // (decision-log row precedes this edit; goldens regenerated under the allowlist).
    "SIMULATED DATA - Curbside Commons demonstration output.",
    "Not real merchant data, not legal advice.",
    "",
    `Result: ${emlVerdictLine(report.ok, report.findings.length)}`,
    `Tool: ${tool} (deterministic engine, $0 offline)`,
    "",
    ...report.findings.slice(0, EML_FINDINGS_CAP).map((f) => `- [${f.severity}] ${f.plainLine} (${f.id})`),
    ...(report.findings.length > EML_FINDINGS_CAP
      ? [
          `...and ${report.findings.length - EML_FINDINGS_CAP} more finding${plural(report.findings.length - EML_FINDINGS_CAP)} - full report attached.`,
        ]
      : []),
    "",
    // Evidence pointer + footer — copy-coherent with the v5 HTML/one-shot halves
    // (design source mockups/email-v5-light-tweakable-2026-07-22.html). Non-ASCII
    // here (em-dash, §) is quoted-printable-encoded on the wire, so the message
    // stays 7-bit ASCII. Structure (plain-text .eml) is deliberately unchanged.
    "Attached report.json has the full audit — every claim, rule, and calculation. Re-runs reproduce it byte for byte.",
    "",
    "One-time demonstration send. Not a subscription.",
    "Simulated data checked against real NYC law (§20-563.3 / Local Law 79 of 2025). Not legal advice. No real platform access.",
  ].join("\n");
}
