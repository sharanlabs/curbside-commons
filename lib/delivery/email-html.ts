/**
 * A3 EMAIL HTML BUILDER — a PURE function from an engine report's canonical
 * payload to an email-safe HTML body (the `html` half of the multipart the
 * Resend one-shot sends beside its plain-text body). Sibling of
 * `lib/delivery/slack.ts` / `lib/delivery/email.ts`, same discipline.
 *
 * OFFLINE BY CONSTRUCTION: this module builds a string. It holds no client, no
 * API key, no transport — sending anything anywhere is the owner-gated L-2
 * transient demo, governed by `docs/plan-a3-delivery-safety.md`. Input is the
 * CANONICAL STRING a registry tool returned (JSON-level consumption, never an
 * engine type).
 *
 * HONESTY (C10 extended): the SIMULATED plaque is the FIRST rendered content
 * of every body this builder emits — the builder throws if composition ever
 * loses it. All report-derived text is HTML-entity-escaped, so a hostile
 * finding string cannot inject markup into a recipient's mail client.
 *
 * COMPOSITION (v5, owner-adopted — a byte-for-byte translation of the design
 * source `mockups/email-v5-light-tweakable-2026-07-22.html`):
 *   hidden preheader (optional) → SIMULATED plaque with ultramarine medallion
 *   (first rendered content) → mono eyebrow + a 28px letterhead kicker rule →
 *   verdict stamp (FAIL ember / PASS graphite) + a 28px headline whose
 *   violation COUNT is set in ember → mono tabular meta line
 *   ("Simulated statement · {period} · sent {date}") → an airy 3-column ledger
 *   (hung ember index · plain-language sentence · faint mono rule id, hairline
 *   rows, no chrome) → one action (only when the caller supplies `siteLink`) →
 *   a quiet ultramarine keyline evidence pointer → footer: reason-for-email +
 *   honesty line. The email is the NOTIFICATION; `report.json` is the report.
 *
 * EMAIL-CLIENT REALITY: one centered 560px table, every critical style inline,
 * spacing as td padding, system font stacks only, zero images, zero scripts,
 * zero shadows/gradients. A SINGLE `<style>` block rides the one head carrying
 * only `:root{color-scheme:light;}`. The body is LIGHT-LOCKED — the two
 * color-scheme metas both say `light` and there is no dark-mode override
 * channel — so a mail client's forced-inversion pass is opted out, not fought.
 * Base colors stay off-black on off-white (never pure #000/#fff). The ONLY
 * outbound reference is the caller-supplied site link.
 *
 * Lamp ledger (site law): ember #b42318 marks violations ONLY (a PASS body
 * carries no ember at all — the stamp is graphite, the ledger index of any
 * non-violation row is faint); gold is reserved for held-status site-wide and
 * is deliberately absent here; ultramarine #2438d6 is the brand accent, never
 * a lamp.
 *
 * Plain: this turns an audit report into a short, presentable notification —
 * the SIMULATED plaque first, the verdict with counts up top, each finding as
 * one plain-language line with its rule id, one button to the public site,
 * and one sentence pointing at the attached report.json. Nothing here can
 * send it.
 */

/** Caller-supplied metadata. `date` is an INPUT for determinism (never Date.now). */
export interface EmailHtmlMeta {
  readonly tool: string;
  /**
   * Subject line — rendered verbatim in the document `<title>` AND mined for
   * the statement period shown in the meta line (the first `YYYY-MM[-DD]` token
   * it carries). No separate period field is required: the subject the L-2
   * one-shot composes already carries the period (e.g. "… — 2026-06").
   */
  readonly subject: string;
  /** Display date string shown in the meta line (e.g. "2026-07-22"). */
  readonly date: string;
  /**
   * Optional public-site link for the action button. CALLER-supplied so this
   * module's source stays URL-literal-free (the A3 transport-free boundary
   * contract: a builder must never be able to name an endpoint). Omit it and
   * the body carries zero outbound refs.
   */
  readonly siteLink?: string;
  /**
   * Optional inbox preview text (40–100 chars, front-loaded), rendered as the
   * standard hidden-preheader div before the plaque. It is PREVIEW metadata,
   * not rendered content — the SIMULATED plaque remains the first thing a
   * reader sees, and the subject's own [SIMULATED] lead token precedes the
   * preheader in every inbox list line.
   */
  readonly preheader?: string;
}

/**
 * Findings rendered in full before the explicit "…and N more" row. Curated to
 * SIX (owner directive — "clean, not cluttered"): the email carries the
 * verdict and the top lines, the attached report.json carries the full set.
 */
export const EMAIL_HTML_FINDINGS_CAP = 6;

const SIMULATED_BANNER =
  "SIMULATED DATA — Curbside Commons demonstration output. Not real merchant data, not legal advice.";

/* palette — v5 light-locked tokens, lifted verbatim from the design source
   mockups/email-v5-light-tweakable-2026-07-22.html. Off-black on off-white,
   never pure #000/#fff; the card carries an ultramarine top+bottom edge. */
const INK = "#12141c"; // plaque ground + headline (site --ink)
const INK_2 = "#22252f"; // ledger body text (site --ink-2)
const GRAPHITE = "#4a4e5a"; // footer text + the PASS stamp ground (site --graphite)
const EMBER = "#b42318"; // violation marks ONLY — headline count, FAIL stamp, violation index (site --ember)
const UM = "#2438d6"; // brand accent, never a lamp (site --um): card edge, medallion, button, keyline
const CARD = "#fdfdfb"; // card ground (near-white)
const WASH = "#f1f1ee"; // page ground
const CARD_BORDER = "#e7e7e2"; // card 1px hairline border
const LIGHT = "#f5f6f8"; // near-white text on solid grounds (button, PASS stamp)
const PLAQUE_TEXT = "#f4f5f8"; // SIMULATED banner text on the dark plaque
const STAMP_FAIL_TEXT = "#fdecea"; // FAIL stamp text (warm off-white on ember)
const EYEBROW_FAINT = "#6a6e7a"; // eyebrow " · Simulated fee audit" faint half
const FAINT = "#5c6069"; // meta line + rule-id column + non-violation index
const KICKER_RULE = "#d7d7cf"; // 28px letterhead kicker hairline
const LEDGER_HAIR = "#eceae4"; // ledger row hairlines (top on every row, bottom on the last)
const FOOTER_HAIR = "#e6e6e1"; // footer top border
const CHIP_BG = "#eeeeea"; // report.json chip ground
const CHIP_BORDER = "#e3e2db"; // report.json chip border
const POINTER_TEXT = "#3b3f4b"; // evidence-pointer body text

const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";
const TEXT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** HTML-entity escape for ALL report-derived text (injection guard). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface FindingView {
  readonly verdict: string;
  readonly ruleId: string;
  readonly plainLine: string;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * The statement period for the meta line: the first `YYYY-MM` (optionally
 * `-DD`) token in the caller's subject. The L-2 one-shot's subject always
 * carries it ("… — 2026-06"); if a subject somehow carries none, the period
 * segment is omitted and the meta line reads "Simulated statement · sent …".
 */
function statementPeriod(subject: string): string {
  const m = subject.match(/\b(\d{4}-\d{2}(?:-\d{2})?)\b/);
  return m ? m[1] : "";
}

/**
 * Build the HTML body. Throws on a payload that is not a decision-grade
 * report (same refusal contract as the Slack builder: a demo transcript can
 * never become a delivery).
 */
export function buildEmailReportHtml(canonical: string, meta: EmailHtmlMeta): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(canonical);
  } catch {
    throw new Error(`delivery/email-html: canonical payload for tool "${meta.tool}" is not JSON — not a decision-grade report`);
  }
  const r = parsed as { ok?: unknown; findings?: unknown };
  if (typeof r.ok !== "boolean" || !Array.isArray(r.findings)) {
    throw new Error(`delivery/email-html: canonical payload for tool "${meta.tool}" is not a decision-grade report (no ok/findings)`);
  }
  const findings: FindingView[] = r.findings.map((f) => {
    const o = (f ?? {}) as Record<string, unknown>;
    return {
      verdict: asString(o.verdict) || "unknown",
      ruleId: asString(o.ruleId),
      plainLine: asString(o.plainLine),
    };
  });

  const violations = findings.filter((f) => f.verdict === "violation").length;
  const verdictWord = r.ok ? "PASS" : "FAIL";
  const stampBg = r.ok ? GRAPHITE : EMBER;
  const stampText = r.ok ? LIGHT : STAMP_FAIL_TEXT;
  // Headline: the violation COUNT is set in ember, count-span ONLY when there
  // are violations (a PASS reads "No violations found", plain; a gating report
  // with zero flagged violations reads the count plainly, no lamp).
  const headlineHtml = r.ok
    ? "No violations found"
    : violations > 0
      ? `<span class="em-idx" style="color:${EMBER};">${violations}</span> violation${violations === 1 ? "" : "s"} found`
      : `${violations} violation${violations === 1 ? "" : "s"} found`;
  const reviewedSuffix =
    findings.length !== violations
      ? ` &middot; ${findings.length} finding${findings.length === 1 ? "" : "s"} reviewed`
      : "";
  const period = statementPeriod(meta.subject);
  const metaLine = `Simulated statement${period ? ` &middot; ${escapeHtml(period)}` : ""} &middot; sent ${escapeHtml(meta.date)}${reviewedSuffix}`;

  const shown = findings.slice(0, EMAIL_HTML_FINDINGS_CAP);
  const remainder = findings.length - shown.length;
  const hasRemainder = remainder > 0;

  /* Airy ledger (design source): a hung ember mono index (violation-only lamp;
     faint on any non-violation row), the plain-language sentence, and a faint
     right-aligned mono rule id. A hairline top border on EVERY row; a hairline
     bottom border on the last visible element (last finding row, or the
     remainder / empty-state row when present). No rail, no chip, no chrome. */
  const rows: string[] = shown.map((f, i) => {
    const isViolation = f.verdict === "violation";
    const idxColor = isViolation ? EMBER : FAINT;
    const isLast = i === shown.length - 1 && !hasRemainder;
    const bottom = isLast ? `border-bottom:1px solid ${LEDGER_HAIR};` : "";
    const num = String(i + 1).padStart(2, "0");
    return `<tr>
<td class="em-idx em-hair" valign="top" width="28" style="border-top:1px solid ${LEDGER_HAIR};${bottom}padding:18px 0 18px 0;font-family:${MONO};font-size:12px;font-weight:700;line-height:24px;letter-spacing:0.5px;color:${idxColor};font-variant-numeric:tabular-nums;">${num}</td>
<td class="em-body em-hair" valign="top" style="border-top:1px solid ${LEDGER_HAIR};padding:18px 14px 18px 0;font-family:${TEXT};font-size:15px;line-height:24px;color:${INK_2};text-wrap:pretty;${bottom}">${escapeHtml(f.plainLine)}</td>
<td class="em-faint em-hair" align="right" valign="top" width="104" style="border-top:1px solid ${LEDGER_HAIR};padding:18px 0 18px 10px;font-family:${MONO};font-size:10.5px;line-height:24px;letter-spacing:0.4px;color:${FAINT};white-space:nowrap;font-variant-numeric:tabular-nums;${bottom}">${escapeHtml(f.ruleId)}</td>
</tr>`;
  });

  if (findings.length === 0) {
    rows.push(
      `<tr><td class="em-body em-hair" valign="top" style="border-top:1px solid ${LEDGER_HAIR};border-bottom:1px solid ${LEDGER_HAIR};padding:18px 0 18px 0;font-family:${TEXT};font-size:15px;line-height:24px;color:${INK_2};text-wrap:pretty;">No fee lines in this simulated statement exceed the audited caps.</td></tr>`,
    );
  }
  if (hasRemainder) {
    rows.push(
      `<tr><td colspan="3" class="em-faint em-hair" valign="top" style="border-top:1px solid ${LEDGER_HAIR};border-bottom:1px solid ${LEDGER_HAIR};padding:18px 0 18px 0;font-family:${TEXT};font-size:13px;line-height:20px;color:${FAINT};">&hellip;and ${remainder} more finding${remainder === 1 ? "" : "s"} &mdash; the full set travels in the attached <span class="em-chip" style="font-family:${MONO};font-size:12px;background:${CHIP_BG};border:1px solid ${CHIP_BORDER};border-radius:4px;padding:1px 6px;">report.json</span>.</td></tr>`,
    );
  }
  const ledger = rows.join("\n");

  /* One action: bulletproof nested-table button, solid ultramarine with bevel
     edges, ≥44px target (13+20+13). Rendered only when the caller supplies the
     link — otherwise the body has zero outbound refs. */
  const actionRow = meta.siteLink
    ? `<tr><td style="padding:28px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td bgcolor="${UM}" style="background:${UM};border-radius:10px;"><a href="${escapeHtml(meta.siteLink)}" style="display:inline-block;font-family:${TEXT};font-size:15px;line-height:20px;font-weight:600;letter-spacing:0.1px;color:${LIGHT};text-decoration:none;padding:13px 28px;border-radius:10px;border-top:1px solid rgba(255,255,255,0.26);border-bottom:1px solid rgba(0,0,0,0.22);">Run the same audit</a></td>
</tr></table>
</td></tr>
`
    : "";

  /* Hidden inbox preview text — precedes the plaque in the DOM but is invisible
     in the rendered body; the tail padding keeps inbox previews from bleeding
     into body text. */
  const preheaderDiv = meta.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;mso-hide:all;">${escapeHtml(meta.preheader)}${"&nbsp;&zwnj;".repeat(24)}</div>\n`
    : "";

  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(meta.subject)}</title>
<style>:root{color-scheme:light;}</style>
</head>
<body class="em-bg" style="margin:0;padding:0;background:${WASH};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
${preheaderDiv}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="em-bg" bgcolor="${WASH}" style="background:${WASH};">
<tr><td align="center" style="padding:36px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" class="em-card" bgcolor="${CARD}" style="width:560px;max-width:100%;background:${CARD};border:1px solid ${CARD_BORDER};border-top:2px solid ${UM};border-bottom:2px solid ${UM};">

<!-- SIMULATED plaque — always the first rendered content (C10); ultramarine brand medallion -->
<tr><td class="em-plaque" bgcolor="${INK}" style="background:${INK};padding:15px 40px 16px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" style="font-family:${MONO};font-size:11px;letter-spacing:0.4px;line-height:18px;color:${PLAQUE_TEXT};">${escapeHtml(SIMULATED_BANNER)}</td>
<td class="em-med" align="right" valign="middle" width="22" style="padding-left:16px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${UM}" width="8" height="8" style="background:${UM};width:8px;height:8px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
</tr></table>
</td></tr>

<!-- eyebrow + letterhead kicker rule -->
<tr><td style="padding:34px 40px 0 40px;">
<span style="font-family:${MONO};font-size:10.5px;font-weight:700;letter-spacing:1.8px;color:${UM};text-transform:uppercase;">Curbside Commons</span><span class="em-faint" style="font-family:${MONO};font-size:10.5px;letter-spacing:1.4px;color:${EYEBROW_FAINT};text-transform:uppercase;">&nbsp;&middot;&nbsp;Simulated fee audit</span>
</td></tr>
<tr><td style="padding:12px 40px 0 40px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td class="em-hair em-kick" width="28" height="1" style="width:28px;height:1px;border-top:1px solid ${KICKER_RULE};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

<!-- verdict, first: stamp + count headline (ember count) + meta -->
<tr><td style="padding:22px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td class="em-stamp" bgcolor="${stampBg}" style="background:${stampBg};border:1px solid rgba(255,255,255,0.3);border-radius:4px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2.5px;color:${stampText};padding:5px 12px 5px 13px;text-transform:uppercase;">${verdictWord}</td>
</tr></table>
</td></tr>
<tr><td style="padding:14px 40px 0 40px;"><h1 class="em-ink em-h1" style="margin:0;font-family:${TEXT};font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.9px;color:${INK};text-wrap:balance;">${headlineHtml}</h1></td></tr>
<tr><td class="em-faint" style="padding:10px 40px 0 40px;font-family:${MONO};font-size:12px;line-height:19px;letter-spacing:0.2px;color:${FAINT};font-variant-numeric:tabular-nums;">${metaLine}</td></tr>

<!-- airy ledger: hung ember index (lamp) + plain sentence + faint rule id; no rail, no chrome -->
<tr><td style="padding:28px 40px 4px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${ledger}
</table>
</td></tr>
${actionRow}<!-- quiet evidence pointer: ultramarine keyline note (brand accent, not a lamp) -->
<tr><td style="padding:28px 40px 32px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="em-body" style="border-left:2px solid ${UM};padding:3px 0 3px 16px;font-family:${TEXT};font-size:13px;line-height:21px;color:${POINTER_TEXT};">Attached <span class="em-chip" style="font-family:${MONO};font-size:12px;background:${CHIP_BG};border:1px solid ${CHIP_BORDER};border-radius:4px;padding:1px 6px;">report.json</span> has the full audit — every claim, rule, and calculation. Re-runs reproduce it byte for byte.</td>
</tr></table>
</td></tr>

<!-- footer -->
<tr><td class="em-mute em-hair" style="border-top:1px solid ${FOOTER_HAIR};padding:24px 40px 28px 40px;font-family:${TEXT};font-size:12px;line-height:19px;color:${GRAPHITE};">One-time demonstration send. Not a subscription.<br><br>Simulated data checked against real NYC law (<span style="font-family:${MONO};font-size:11px;letter-spacing:0.2px;font-variant-numeric:tabular-nums;">&sect;20-563.3 / Local Law 79 of 2025</span>). Not legal advice. No real platform access.</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;

  // Belt + suspenders (mirrors the Slack builder): the banner must be the first
  // rendered content — refuse to return a body that lost it. (The hidden
  // preheader precedes it in the DOM but renders nothing.)
  const bannerAt = html.indexOf(escapeHtml(SIMULATED_BANNER));
  const headerAt = html.indexOf("Curbside Commons</span>");
  if (bannerAt === -1 || (headerAt !== -1 && bannerAt > headerAt)) {
    throw new Error("delivery/email-html: composed body lost the leading SIMULATED banner — refusing");
  }
  return html;
}
