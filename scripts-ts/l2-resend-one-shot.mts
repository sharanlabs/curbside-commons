/**
 * L-2 ONE-SHOT EMAIL (RESEND) DELIVERY DEMO — the transient live send governed
 * by `docs/plan-a3-delivery-safety.md` (ALL eight controls binding, no
 * exceptions). Sibling of `l2-slack-one-shot.mts`; owner-armed only.
 *
 * WHY A DEDICATED TRANSPORT: `lib/delivery/email.ts` builds a provider-agnostic
 * RFC 5322 MIME message (for an SMTP sender). Resend's HTTP API takes STRUCTURED
 * fields ({from,to,subject,text,attachments}) instead, so this script derives
 * the subject + text from the SAME real audit and attaches the machine report —
 * the SIMULATED banner leads the body (enforced here, control #4).
 *
 * ARMING (owner act): put the Resend API key and YOUR OWN recipient in the
 * gitignored `.env`, then run:
 *   RESEND_API_KEY=...            (owner added)
 *   RESEND_TO=you@your-domain     (a recipient YOU own — control #2)
 *   RESEND_FROM="Curbside Commons (simulated) <onboarding@resend.dev>"  (optional; Resend's test sender by default)
 *   node --env-file=.env scripts-ts/l2-resend-one-shot.mts
 *
 * CONTROLS ENCODED HERE (mirrors the Slack one-shot):
 *  #1 one word = one session: at most one send per invocation, only on arming.
 *  #2 allowlisted recipient: the ONLY destination is the env `RESEND_TO`; the
 *     endpoint is the fixed Resend host (no override); the recipient is
 *     validated as a single plain address (no CR/LF, no comma-list, no bcc smuggling).
 *  #3 one-shot: a single POST; ANY outcome ends the run; no retry path exists.
 *  #4 banner: the SIMULATED banner leads the body and rides the subject; a build
 *     without it throws before the send.
 *  #5 secrets: the API key is read from env, never printed, never logged; the
 *     run record stores host + a REDACTED recipient marker only.
 *  #6 record: a timestamped, redacted run record is written to docs/reviews/,
 *     probed with an ARMED line BEFORE the irreversible send.
 *  #7 free tier: Resend free tier via its test sender (onboarding@resend.dev).
 *  #8 failure semantics: a non-2xx/thrown send is reported as-is and exits
 *     non-zero — never retried to green.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildEmailReportHtml, EMAIL_HTML_FINDINGS_CAP } from "../lib/delivery/email-html.ts";
import { callTool } from "../lib/tools/registry.ts";

const SIMULATED_BANNER =
  "SIMULATED DATA — Curbside Commons demonstration output. Not real merchant data, not legal advice.";
const RESEND_ENDPOINT = "https://api.resend.com/emails"; // fixed host — no caller override (control #2)

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("L-2 email: RESEND_API_KEY is not set — the demo is NOT armed. Add it to .env (owner act) and re-run.");
  process.exit(2);
}
const to = process.env.RESEND_TO;
if (!to) {
  console.error(
    "L-2 email: RESEND_TO is not set — add YOUR OWN recipient address to .env (control #2, allowlisted recipient) and re-run.",
  );
  process.exit(2);
}
// Recipient must be ONE plain address — reject CR/LF (header injection), commas
// (multi-recipient), and anything that is not a single addr-spec (control #2).
if (/[\r\n,;<>]/.test(to) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
  console.error("L-2 email: RESEND_TO is not a single plain email address — refusing to send (control #2).");
  process.exit(2);
}
const from = process.env.RESEND_FROM?.trim() || "Curbside Commons (simulated) <onboarding@resend.dev>";

// The demo payload: the REAL engine's audit of the committed drifted statement —
// the same canonical the Slack one-shot and the byte-frozen goldens use.
const FEES_DRIFTED = { statementPath: "fixtures/synthetic-restaurant/fees/statement.drifted.json" };
const canonical = callTool("audit_statement", FEES_DRIFTED).canonical;
const parsed = JSON.parse(canonical) as {
  ok?: unknown;
  findings?: ReadonlyArray<{ claim?: { id?: unknown }; verdict?: unknown; ruleId?: unknown; plainLine?: unknown }>;
};
if (typeof parsed.ok !== "boolean" || !Array.isArray(parsed.findings)) {
  console.error("L-2 email: canonical audit is not a decision-grade report — refusing to send.");
  process.exit(2);
}
const findings = parsed.findings;
const violations = findings.filter((f) => f.verdict === "violation").length;
const plural = (n: number) => (n === 1 ? "" : "s");
const verdictLine = parsed.ok
  ? `PASS — no violations (${findings.length} non-gating finding${plural(findings.length)})`
  : `FAIL — ${violations} violation${plural(violations)} across ${findings.length} finding${plural(findings.length)}`;

// Subject + preheader per the session-32 research digest
// (`docs/research/research-email-design-2026-07-22.md` §6, move #11): subject
// ≤50 chars, verdict-first with counts; preheader 40–100 chars, front-loaded.
// The [SIMULATED] lead token is control #4 riding the subject — it stays.
const subject = `[SIMULATED] Fee audit: ${
  parsed.ok ? "no violations" : `${violations} violation${plural(violations)}`
} — 2026-06`;
// Preheader wording: sol content pass 2026-07-22, adjudicated primary-model-final.
const preheader = parsed.ok
  ? "No violations found in simulated statement 2026-06. See the arithmetic in report.json."
  : `${violations} NYC fee-cap violation${plural(violations)} found in simulated statement 2026-06. See the arithmetic in report.json.`;

// The public site link — caller-supplied HERE (the pure HTML builder may not
// carry a URL literal, A3 boundary). Shared by the plain-text link line and the
// HTML action button so both halves point at the same audit.
const siteLink = "https://curbside-commons.pages.dev/fees";

// Plain-text half, curated to MIRROR the v5 HTML half (owner directive; design
// source mockups/email-v5-light-tweakable-2026-07-22.html): verdict first,
// capped plain-language lines with rule ids, then the same evidence pointer,
// action line, and footer copy the HTML body carries — no claim ids, no runtime
// meta (that detail travels in the report.json attachment). The SIMULATED
// banner leads (control #4). The "engine decides, humans approve" line stays
// cut from both halves (prior adjudication; the mantra lives on the site/docs).
const bodyText = [
  SIMULATED_BANNER,
  "",
  `Result: ${verdictLine}`,
  "",
  ...findings
    .slice(0, EMAIL_HTML_FINDINGS_CAP)
    .map((f) => `- ${String(f.plainLine ?? "")} [${String(f.ruleId ?? "")}]`),
  ...(findings.length > EMAIL_HTML_FINDINGS_CAP
    ? [
        `...and ${findings.length - EMAIL_HTML_FINDINGS_CAP} more finding${plural(findings.length - EMAIL_HTML_FINDINGS_CAP)} — the full set travels in the attached report.json.`,
      ]
    : []),
  "",
  "Attached report.json has the full audit — every claim, rule, and calculation. Re-runs reproduce it byte for byte.",
  "",
  `Run the same audit: ${siteLink}`,
  "",
  "One-time demonstration send. Not a subscription.",
  "Simulated data checked against real NYC law (§20-563.3 / Local Law 79 of 2025). Not legal advice. No real platform access.",
].join("\n");

// Control #4 — the banner MUST lead the body; refuse to send otherwise.
if (!bodyText.startsWith(SIMULATED_BANNER)) {
  console.error("L-2 email: payload must lead with the SIMULATED banner — refusing to send.");
  process.exit(2);
}

const startedAt = new Date().toISOString();

// The HTML half of the multipart body — the same audit in presentable form,
// composed by the golden-tested pure builder (`lib/delivery/email-html.ts`:
// banner-first, entity-escaped, URL-literal-free source, dark-mode defensive).
// The site link + preheader are caller-supplied HERE because the builder may
// not carry a URL literal and the preview text is inbox metadata.
const bodyHtml = buildEmailReportHtml(canonical, {
  tool: "audit_statement",
  subject,
  date: startedAt.slice(0, 10),
  siteLink,
  preheader,
});
// Control #4 extends to the HTML half — refuse to send without the banner.
if (!bodyHtml.includes(SIMULATED_BANNER)) {
  console.error("L-2 email: HTML body must carry the SIMULATED banner — refusing to send.");
  process.exit(2);
}

const attachmentBase64 = Buffer.from(canonical, "utf8").toString("base64");
const payloadSha256 = createHash("sha256")
  .update(`${subject}\n${bodyText}\n${bodyHtml}\n${attachmentBase64}`)
  .digest("hex");
const recordPath = join("docs", "reviews", `l2-resend-one-shot-${startedAt.replace(/[:.]/g, "-")}.md`);
// Probe the record path BEFORE the irreversible send (control #6, probe-before-spend).
writeFileSync(
  recordPath,
  `# L-2 One-Shot Email (Resend) Delivery Demo — ARMED ${startedAt} (send in progress; replaced by the outcome)\n`,
);

let status = 0;
let statusText = "";
let bodyResp = "";
let failure: string | undefined;
try {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to.trim()],
      subject,
      text: bodyText,
      html: bodyHtml,
      attachments: [{ filename: "report.json", content: attachmentBase64 }],
    }),
    redirect: "error", // one-shot means one destination — no redirect replay (control #3)
  });
  status = res.status;
  statusText = res.statusText;
  bodyResp = (await res.text()).slice(0, 200);
} catch (e) {
  failure = e instanceof Error ? e.message : String(e);
}
const finishedAt = new Date().toISOString();
const ok = !failure && status >= 200 && status < 300;

const record = `# L-2 One-Shot Email (Resend) Delivery Demo — Run Record (${startedAt})

**Arming:** owner word ${startedAt.slice(0, 10)} — recorded verbatim in \`docs/decision-log.md\` (the owner placed the Resend API key
+ recipient in the gitignored \`.env\`, then armed this send). Controls: \`docs/plan-a3-delivery-safety.md\` — all eight held.

| Field | Value |
| --- | --- |
| Sent at | ${startedAt} → ${finishedAt} |
| Target | the owner's own inbox via Resend — recipient **REDACTED** (control #5); sender \`${from.replace(/<.*>/, "<REDACTED>")}\` |
| Transport | Resend HTTP API (\`${RESEND_ENDPOINT}\`), API key **REDACTED** (env-only, never logged) |
| Payload | \`audit_statement\` over \`fixtures/synthetic-restaurant/fees/statement.drifted.json\` → subject + plain-text body + HTML body (golden-tested builder) + report.json attachment |
| Payload sha256 | \`${payloadSha256}\` (subject+text+html+attachment; reproducible offline: same engine, same fixture, same date input) |
| Banner | SIMULATED banner leads the body and rides the subject (enforced; refuses without it) |
| HTTP result | ${failure ? `TRANSPORT FAILURE: ${failure}` : `${status} ${statusText} — body (≤200ch): ${bodyResp.replace(/[\r\n]+/g, " ")}`} |
| Outcome | ${ok ? "DELIVERED (one-shot; session ended)" : "FAILED — reported as-is, NOT retried (control #8); a fresh demo needs a fresh owner word"} |
| Retries | 0 (no retry path exists — control #3) |

One message, one send, session over (control #1/#3). No secret (API key or recipient) appears in this record or any log.
`;
writeFileSync(recordPath, record);

console.log(
  `L-2 EMAIL ${ok ? "DELIVERED" : "FAILED"} — HTTP ${failure ? `(transport: ${failure})` : `${status} ${statusText}`}; payload sha256 ${payloadSha256.slice(0, 16)}…; record ${recordPath}`,
);
process.exit(ok ? 0 : 1);
