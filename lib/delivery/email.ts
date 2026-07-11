/**
 * A3 EMAIL DELIVERY BUILDER — a PURE function from an engine report's
 * canonical payload to a complete RFC 5322 email message string (plan §5 row
 * A3, AC-8). PROVIDER-AGNOSTIC by design (owner call O-A5 dissolved for the
 * build): the output is a standard MIME message any sender (Resend, or a free
 * alternative like a self-hosted SMTP relay) could transmit — but this module
 * holds NO transport, NO credentials, NO addresses beyond RFC 2606 `.example`
 * placeholders. Sending = the owner-gated L-2 transient demo
 * (`docs/plan-a3-delivery-safety.md`).
 *
 * RFC DISCIPLINE (Codex A3 review P1, accepted-fixed): the message carries a
 * caller-supplied deterministic `Date` header (RFC 5322 requires origination
 * date; a hidden clock would break byte-frozen goldens, so the DATE IS AN
 * INPUT); every line uses CRLF; the text body is quoted-printable-encoded
 * (UTF-8 content, ≤76-char lines) and the JSON report attachment is
 * base64-encoded (76-char wrap) — so no logical line exceeds the RFC 998-char
 * limit and no 8-bit byte travels under a 7bit label.
 *
 * HEADER SAFETY (Codex A3 review P2, accepted-fixed): all header-derived
 * metadata (`subject`, `tool`, `date`) is validated — CR/LF/control characters
 * and non-ASCII are REJECTED loudly, so header injection (`\r\nBcc: ...`)
 * is impossible by construction.
 *
 * Plain: this writes the email — subject, readable summary, and the full
 * machine report attached — but cannot send it. The address lines are
 * deliberately fake ".example" placeholders, the date is handed in (never
 * secretly read from a clock), and a sneaky "subject" that tries to smuggle
 * extra mail headers into the message gets refused loudly.
 */

export const EMAIL_FROM_PLACEHOLDER = "truth-audit@sender.example";
export const EMAIL_TO_PLACEHOLDER = "merchant-ops@recipient.example";
const MIME_BOUNDARY = "commerce-truth-audit-boundary-0000000000000000"; // fixed: determinism over cleverness
const MAX_ENCODED_LINE = 76;

export interface EmailReportMeta {
  readonly tool: string;
  readonly subject: string;
  /** RFC 5322 date string, caller-supplied for determinism (e.g. "Mon, 06 Jul 2026 12:00:00 +0000"). */
  readonly date: string;
}

/** Reject CR/LF/control chars and non-ASCII in any header-bound value (header-injection guard). */
function assertHeaderSafe(field: string, value: string): string {
  if (value.length === 0) throw new Error(`delivery/email: header field "${field}" must be non-empty`);
  if (/[\r\n]/.test(value)) throw new Error(`delivery/email: header field "${field}" contains CR/LF — header injection refused`);
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new Error(`delivery/email: header field "${field}" contains control characters — refused`);
  if (/[^ -~]/.test(value)) {
    throw new Error(`delivery/email: header field "${field}" contains non-ASCII — use an ASCII value (RFC 2047 encoding is out of scope for this builder)`);
  }
  return value;
}

/** Quoted-printable encode (RFC 2045): UTF-8 bytes, soft line breaks at ≤76 chars, deterministic. */
export function quotedPrintable(text: string): string {
  const bytes = Buffer.from(text.replace(/\r?\n/g, "\r\n"), "utf8");
  let line = "";
  const out: string[] = [];
  const push = (tok: string): void => {
    if (line.length + tok.length > MAX_ENCODED_LINE - 1) {
      out.push(`${line}=`); // soft break
      line = "";
    }
    line += tok;
  };
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0x0d && bytes[i + 1] === 0x0a) {
      out.push(line);
      line = "";
      i++;
      continue;
    }
    const printable = (b >= 33 && b <= 126 && b !== 61) || b === 32 || b === 9;
    push(printable ? String.fromCharCode(b) : `=${b.toString(16).toUpperCase().padStart(2, "0")}`);
  }
  out.push(line);
  // trailing space/tab on a line must be encoded — handle by encoding line-final SP/TAB
  return out.map((l) => l.replace(/([ \t])$/, (m) => `=${m.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`)).join("\r\n");
}

/** base64 with a 76-char wrap (RFC 2045), deterministic. */
export function base64Wrapped(text: string): string {
  const b64 = Buffer.from(text, "utf8").toString("base64");
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += MAX_ENCODED_LINE) lines.push(b64.slice(i, i + MAX_ENCODED_LINE));
  return lines.join("\r\n");
}

interface ParsedForDelivery {
  readonly ok: boolean;
  readonly findings: ReadonlyArray<{ readonly id: string; readonly severity: string; readonly plainLine: string }>;
}

function parseCanonical(canonical: string): ParsedForDelivery {
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

/**
 * Build one complete RFC 5322 message (multipart/mixed: quoted-printable text
 * summary + base64 report.json attachment). Pure and deterministic given
 * (canonical, meta) — the date is part of meta by design.
 */
export function buildEmailReportMessage(canonical: string, meta: EmailReportMeta): string {
  const subject = assertHeaderSafe("subject", meta.subject);
  const tool = assertHeaderSafe("tool", meta.tool);
  const date = assertHeaderSafe("date", meta.date);
  const report = parseCanonical(canonical);
  const verdictLine = report.ok
    ? `PASS - no violations (${report.findings.length} non-gating finding(s))`
    : `FAIL - violations present (${report.findings.length} finding(s))`;

  const bodyText = [
    // Template v2 (2026-07-10, plan v3.3 S4b): name migrated → "Curbside Commons"
    // (decision-log row precedes this edit; goldens regenerated under the allowlist).
    "SIMULATED DATA - Curbside Commons demonstration output.",
    "Not real merchant data, not legal advice. Recommendations only - the engine decides, humans approve.",
    "",
    `Result: ${verdictLine}`,
    `Tool: ${tool} (deterministic engine, $0 offline)`,
    "",
    ...report.findings.slice(0, 20).map((f) => `- [${f.severity}] ${f.plainLine} (${f.id})`),
    ...(report.findings.length > 20 ? [`...and ${report.findings.length - 20} more finding(s) - full report attached.`] : []),
    "",
    "The full machine-readable report is attached (report.json).",
  ].join("\n");

  const lines = [
    `Date: ${date}`,
    `From: Curbside Commons (simulated) <${EMAIL_FROM_PLACEHOLDER}>`,
    `To: <${EMAIL_TO_PLACEHOLDER}>`,
    `Subject: [SIMULATED] Truth-audit result: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${MIME_BOUNDARY}"`,
    "",
    "This is a multi-part message in MIME format.",
    `--${MIME_BOUNDARY}`,
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: quoted-printable",
    "",
    quotedPrintable(bodyText),
    `--${MIME_BOUNDARY}`,
    'Content-Type: application/json; name="report.json"',
    'Content-Disposition: attachment; filename="report.json"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Wrapped(canonical),
    `--${MIME_BOUNDARY}--`,
    "",
  ];
  return lines.join("\r\n");
}
