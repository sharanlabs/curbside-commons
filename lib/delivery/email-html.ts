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
 * HONESTY (C10 extended): the SIMULATED banner is the FIRST rendered content
 * of every body this builder emits — the builder throws if composition ever
 * loses it. All report-derived text is HTML-entity-escaped, so a hostile
 * finding string cannot inject markup into a recipient's mail client.
 *
 * COMPOSITION (v2, session 32 — grounded in the live research digest at
 * `docs/research/research-email-design-2026-07-22.md`, fetched 2026-07-22;
 * digest move numbers cited inline):
 *   hidden preheader (optional, move #11) → SIMULATED plaque (first rendered
 *   content) → mono eyebrow → verdict stamp chip (move #4) + 24px/−0.5px
 *   headline with counts (move #3) → hairline-divided finding rows: plain
 *   language + mono rule-id chip, ember mark strictly on violations
 *   (moves #5/#9) → one action (move #8, only when the caller supplies
 *   `siteLink`) → one-sentence attachment panel (moves #6/#12) → 12px footer:
 *   reason-for-email + honesty line (move #12). The email is the NOTIFICATION;
 *   `report.json` is the report (owner curation directive, 2026-07-22).
 *
 * EMAIL-CLIENT REALITY (digest §1): one centered 560px table (move #1), every
 * critical style inline, spacing as td padding on a 4/8 scale (move #2),
 * system font stacks only, zero images, zero scripts, zero shadows/gradients.
 * ONE `<style>` block rides the head as an ENHANCEMENT channel only (move #10)
 * carrying the dark-mode overrides (`prefers-color-scheme` + `[data-ogsc]`,
 * digest §2) behind an empty decoy head (the Yahoo-Android first-head strip,
 * digest "off-radar traps"). Base colors are dark-mode DEFENSIVE: near-black
 * on near-white, never pure #000/#fff (digest §2). The ONLY outbound
 * reference is the caller-supplied site link.
 *
 * Lamp ledger (site law): ember #b42318 marks violations ONLY (a PASS body
 * carries no ember at all — its dark-mode variant is emitted conditionally);
 * gold is reserved for held-status site-wide and is deliberately absent here;
 * ultramarine #2438d6 is the brand accent, never a lamp.
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
  readonly subject: string;
  /** Display date string shown in the header (e.g. "2026-07-22"). */
  readonly date: string;
  /**
   * Optional public-site link for the action button. CALLER-supplied so this
   * module's source stays URL-literal-free (the A3 transport-free boundary
   * contract: a builder must never be able to name an endpoint). Omit it and
   * the body carries zero outbound refs.
   */
  readonly siteLink?: string;
  /**
   * Optional inbox preview text (digest §6, move #11: 40–100 chars,
   * front-loaded), rendered as the standard hidden-preheader div before the
   * banner. It is PREVIEW metadata, not rendered content — the SIMULATED
   * plaque remains the first thing a reader sees, and the subject's own
   * [SIMULATED] lead token precedes the preheader in every inbox list line.
   */
  readonly preheader?: string;
}

/**
 * Findings rendered in full before the explicit "…and N more" row. Curated to
 * SIX (owner directive 2026-07-22 — "clean, not cluttered"; digest §6 "less is
 * more" / move #12): the email carries the verdict and the top lines, the
 * attached report.json carries the full set.
 */
export const EMAIL_HTML_FINDINGS_CAP = 6;

const SIMULATED_BANNER =
  "SIMULATED DATA — Curbside Commons demonstration output. Not real merchant data, not legal advice.";

/* palette — site tokens (app/globals.css) made dark-mode DEFENSIVE per digest
   §2: near-black on near-white, no pure #000/#fff anywhere in the body. */
const INK = "#12141c"; // plaque ground, heading text (site --ink)
const INK_2 = "#22252f"; // body text (site --ink-2)
const GRAPHITE = "#4a4e5a"; // muted text + the PASS stamp ground (site --graphite)
const EMBER = "#b42318"; // violation marks ONLY (site --ember)
const EMBER_DARK = "#e0604c"; // the same lamp, legible on dark grounds — emitted only when violations exist
const UM = "#2438d6"; // brand accent, never a lamp (site --um)
const CARD = "#fdfdfb"; // card ground (near-white, digest §2)
const WASH = "#f1f1ee"; // page ground
const PANEL = "#f6f6f3"; // soft panel fill (digest move #6)
const CHIP_BG = "#eeeeea"; // mono chip ground (digest move #9)
const HAIRLINE = "#e5e5e0"; // hairline dividers/borders (digest §3: hex hairlines, no shadows)
const LIGHT = "#f5f6f8"; // near-white text on dark/solid grounds (never pure #fff)

/* dark-mode overrides (enhancement channel, digest §2 + move #7) */
const D_BG = "#15161b";
const D_CARD = "#1d1f26";
const D_PLAQUE = "#262932";
const D_PANEL = "#252831";
const D_CHIP_BG = "#2a2d37";
const D_HAIR = "#363943";
const D_INK = "#f0f1f4";
const D_BODY = "#d7dae1";
const D_MUTE = "#a9aeba";
const D_CHIP_TEXT = "#c3c7d1";

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
 * The dark-mode rule set, emitted twice: inside `@media (prefers-color-scheme:
 * dark)` for the clients that honor it, and `[data-ogsc]`-prefixed for
 * Outlook.com's own darkening pass (digest §2.4). Order matters: `.em-hair`
 * (a border-color shorthand) precedes `.em-mark`/`.em-nomark` so the left
 * mark's color wins on cells that carry both. The ember dark variant is
 * emitted ONLY when the report has violations, so a PASS body stays free of
 * every ember hue (lamp ledger).
 */
function darkRules(prefix: string, hasViolations: boolean): string {
  const p = prefix === "" ? "" : `${prefix} `;
  return [
    `${p}body,${p}.em-bg{background:${D_BG} !important;}`,
    `${p}.em-card{background:${D_CARD} !important;border-color:${D_HAIR} !important;}`,
    `${p}.em-plaque{background:${D_PLAQUE} !important;}`,
    `${p}.em-ink{color:${D_INK} !important;}`,
    `${p}.em-body{color:${D_BODY} !important;}`,
    `${p}.em-mute{color:${D_MUTE} !important;}`,
    `${p}.em-hair{border-color:${D_HAIR} !important;}`,
    `${p}.em-panel{background:${D_PANEL} !important;}`,
    `${p}.em-chip{background:${D_CHIP_BG} !important;border-color:${D_HAIR} !important;color:${D_CHIP_TEXT} !important;}`,
    `${p}.em-nomark{border-left-color:${D_CARD} !important;}`,
    ...(hasViolations ? [`${p}.em-mark{border-left-color:${EMBER_DARK} !important;}`] : []),
  ].join("\n");
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
  const headline = r.ok ? "No violations found" : `${violations} violation${violations === 1 ? "" : "s"} found`;
  const stampBg = r.ok ? GRAPHITE : EMBER;
  const reviewedSuffix =
    findings.length !== violations ? ` &middot; ${findings.length} finding(s) reviewed` : "";

  const shown = findings.slice(0, EMAIL_HTML_FINDINGS_CAP);
  const remainder = findings.length - shown.length;

  /* Finding rows (digest move #5): plain language left, right-aligned mono
     rule-id chip; hairline top divider from the second row on; a 3px ember
     mark in the left gutter strictly on violations (neutral rows carry a
     card-colored border of identical geometry so text alignment never moves).
     Both cells of a row share identical vertical padding — classic Outlook
     equalizes it across the row (digest "off-radar traps"). */
  const findingRows = shown
    .map((f, i) => {
      const isViolation = f.verdict === "violation";
      const markClass = isViolation ? "em-mark" : "em-nomark";
      const markColor = isViolation ? EMBER : CARD;
      const divider = i > 0 ? `border-top:1px solid ${HAIRLINE};` : "";
      const dividerClass = i > 0 ? " em-hair" : "";
      return `<tr>
<td class="em-body ${markClass}${dividerClass}" valign="top" style="${divider}border-left:3px solid ${markColor};padding:12px 0 12px 13px;font-family:${TEXT};font-size:15px;line-height:24px;color:${INK_2};">${escapeHtml(f.plainLine)}</td>
<td${i > 0 ? ' class="em-hair"' : ""} align="right" valign="top" width="112" style="${divider}padding:12px 0 12px 12px;"><span class="em-chip" style="font-family:${MONO};font-size:11px;letter-spacing:0.3px;color:${GRAPHITE};background:${CHIP_BG};border:1px solid ${HAIRLINE};border-radius:3px;padding:3px 8px;white-space:nowrap;">${escapeHtml(f.ruleId)}</span></td>
</tr>`;
    })
    .join("\n");

  const emptyRow =
    findings.length === 0
      ? `<tr><td class="em-body" style="padding:12px 0 12px 16px;font-family:${TEXT};font-size:15px;line-height:24px;color:${INK_2};">Every fee line on this statement sits inside the audited caps &mdash; nothing to flag.</td></tr>`
      : "";

  const remainderRow =
    remainder > 0
      ? `<tr><td colspan="2" class="em-mute em-hair" style="border-top:1px solid ${HAIRLINE};padding:12px 0 12px 16px;font-family:${TEXT};font-size:13px;line-height:20px;color:${GRAPHITE};">&hellip;and ${remainder} more finding(s) &mdash; the full set travels in the attached <span style="font-family:${MONO};">report.json</span>.</td></tr>`
      : "";

  /* One action (digest move #8): bulletproof nested-table button, solid
     ultramarine, ≥44px target (12+20+12). Rendered only when the caller
     supplies the link — otherwise the body has zero outbound refs. */
  const actionRow = meta.siteLink
    ? `<tr><td style="padding:24px 32px 0 32px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td bgcolor="${UM}" style="background:${UM};border-radius:6px;"><a href="${escapeHtml(meta.siteLink)}" style="display:inline-block;font-family:${TEXT};font-size:15px;line-height:20px;font-weight:600;color:${LIGHT};text-decoration:none;padding:12px 28px;">Run the same audit</a></td>
</tr></table>
</td></tr>`
    : "";

  /* Hidden inbox preview text (digest §6, move #11) — precedes the plaque in
     the DOM but is invisible in the rendered body; the tail padding keeps
     inbox previews from bleeding into body text. */
  const preheaderDiv = meta.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;mso-hide:all;">${escapeHtml(meta.preheader)}${"&nbsp;&zwnj;".repeat(24)}</div>\n`
    : "";

  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head></head>
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(meta.subject)}</title>
<style>
:root{color-scheme:light dark;}
@media (prefers-color-scheme:dark){
${darkRules("", violations > 0)}
}
${darkRules("[data-ogsc]", violations > 0)}
</style>
</head>
<body class="em-bg" style="margin:0;padding:0;background:${WASH};">
${preheaderDiv}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="em-bg" style="background:${WASH};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" class="em-card" style="width:560px;max-width:100%;background:${CARD};border:1px solid ${HAIRLINE};border-radius:6px;">

<!-- SIMULATED plaque — always the first rendered content (C10) -->
<tr><td class="em-plaque" bgcolor="${INK}" style="background:${INK};border-top:3px solid ${UM};border-radius:5px 5px 0 0;padding:16px 32px;font-family:${MONO};font-size:11px;letter-spacing:0.3px;line-height:18px;color:${LIGHT};">${escapeHtml(SIMULATED_BANNER)}</td></tr>

<!-- eyebrow -->
<tr><td style="padding:28px 32px 0 32px;">
<span style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1.5px;color:${UM};text-transform:uppercase;">Curbside Commons</span><span class="em-mute" style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:${GRAPHITE};text-transform:uppercase;">&nbsp;&middot;&nbsp;Simulated demonstration</span>
</td></tr>

<!-- verdict, first (digest move #12): stamp chip + headline with counts -->
<tr><td style="padding:20px 32px 0 32px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td bgcolor="${stampBg}" style="background:${stampBg};border-radius:3px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1px;color:${LIGHT};padding:5px 12px;text-transform:uppercase;">${verdictWord}</td>
</tr></table>
</td></tr>
<tr><td style="padding:12px 32px 0 32px;"><h1 class="em-ink" style="margin:0;font-family:${TEXT};font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.5px;color:${INK};">${headline}</h1></td></tr>
<tr><td class="em-mute" style="padding:8px 32px 0 32px;font-family:${TEXT};font-size:14px;line-height:22px;color:${GRAPHITE};">${escapeHtml(meta.subject)} &middot; ${escapeHtml(meta.date)}${reviewedSuffix}</td></tr>

<!-- findings: plain language + rule id, nothing else (curation directive) -->
<tr><td style="padding:16px 32px 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${findingRows}${emptyRow}
${remainderRow}
</table>
</td></tr>
${actionRow}
<!-- the one quiet evidence pointer (digest move #12) -->
<tr><td style="padding:24px 32px 28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td class="em-panel em-hair em-body" style="background:${PANEL};border:1px solid ${HAIRLINE};border-radius:5px;padding:16px 20px;font-family:${TEXT};font-size:14px;line-height:22px;color:${INK_2};">The attached <span class="em-chip" style="font-family:${MONO};font-size:12px;background:${CHIP_BG};border:1px solid ${HAIRLINE};border-radius:3px;padding:1px 6px;">report.json</span> carries the full audit &mdash; every claim, rule id, and the arithmetic &mdash; and the same audit re-run offline reproduces it byte-for-byte.</td>
</tr></table>
</td></tr>

<!-- footer as trust surface (digest §5 + move #12): reason-for-email + honesty line -->
<tr><td class="em-mute em-hair" style="border-top:1px solid ${HAIRLINE};padding:20px 32px 28px 32px;font-family:${TEXT};font-size:12px;line-height:18px;color:${GRAPHITE};">You are receiving this because a Curbside Commons demonstration send was armed for this address &mdash; a one-shot, never a subscription.<br><br>Simulated data audited against real codified NYC law (&sect;20-563.3 / Local Law 79 of 2025). Not legal advice; no penalties computed; no real platform access claimed.</td></tr>

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
