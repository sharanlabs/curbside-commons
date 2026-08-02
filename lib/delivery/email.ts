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

/**
 * COMPOSITION vs ENCODING (2026-08-02). Everything a recipient READS — the
 * verdict line, the body text, the subject, the placeholder addresses, and the
 * header-injection guard — now lives in `email-message.ts`, which touches no
 * Node global. This module keeps what genuinely needs `Buffer`: the
 * quoted-printable and base64 ENCODERS, and the MIME assembly around them.
 *
 * The split exists because the site's DELIVERY station renders the readable
 * message (headers + body) in the browser, and a second copy of that
 * composition in a React component is precisely the drift `email-text.ts` was
 * extracted to prevent. Same strings, one source; the committed golden
 * (`evals/delivery/gold/email-fees-drifted.golden.eml`) pins both halves.
 */
import {
  assertHeaderSafe,
  buildEmailReportBodyText,
  emlSubjectLine,
  EMAIL_FROM_PLACEHOLDER,
  EMAIL_TO_PLACEHOLDER,
  EML_FINDINGS_CAP,
  type EmailReportMeta,
} from "./email-message.ts";

// Re-exported so existing importers (tests, the L-2 one-shot) keep their paths.
export { EMAIL_FROM_PLACEHOLDER, EMAIL_TO_PLACEHOLDER, EML_FINDINGS_CAP };
export type { EmailReportMeta };

const MIME_BOUNDARY = "commerce-truth-audit-boundary-0000000000000000"; // fixed: determinism over cleverness
const MAX_ENCODED_LINE = 76;


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

/**
 * Build one complete RFC 5322 message (multipart/mixed: quoted-printable text
 * summary + base64 report.json attachment). Pure and deterministic given
 * (canonical, meta) — the date is part of meta by design.
 */
export function buildEmailReportMessage(canonical: string, meta: EmailReportMeta): string {
  const subject = assertHeaderSafe("subject", meta.subject);
  const date = assertHeaderSafe("date", meta.date);
  // Composition lives in email-message.ts — the site renders the SAME strings.
  const bodyText = buildEmailReportBodyText(canonical, meta);

  const lines = [
    `Date: ${date}`,
    `From: Curbside Commons (simulated) <${EMAIL_FROM_PLACEHOLDER}>`,
    `To: <${EMAIL_TO_PLACEHOLDER}>`,
    `Subject: ${emlSubjectLine(subject)}`,
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
