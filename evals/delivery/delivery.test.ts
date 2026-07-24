import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { callTool } from "@/lib/tools/registry.ts";
import {
  buildSlackReportPayload,
  serializeSlackPayload,
  SIMULATED_BANNER,
  SLACK_MAX_BLOCKS,
} from "@/lib/delivery/slack.ts";
import { base64Wrapped, buildEmailReportMessage, EMAIL_FROM_PLACEHOLDER, EMAIL_TO_PLACEHOLDER } from "@/lib/delivery/email.ts";
import { buildEmailReportHtml, EMAIL_HTML_FINDINGS_CAP } from "@/lib/delivery/email-html.ts";

const FIXED_DATE = "Mon, 06 Jul 2026 12:00:00 +0000"; // deterministic by design — the date is an INPUT (Codex A3 P1)

/**
 * A3 — delivery payload builders (plan §5 row A3, AC-8): pure functions from
 * a registry tool's canonical payload to Slack Block Kit JSON / an RFC 5322
 * message. Byte-frozen goldens; SIMULATED banner mandatory; `.example`
 * addresses only; truncation is explicit, never silent; block limits enforced
 * (50-block Slack limit freshness-checked 2026-07-07).
 */

const GOLD = join(process.cwd(), "evals", "delivery", "gold");
const FEES_DRIFTED = { statementPath: "fixtures/synthetic-restaurant/fees/statement.drifted.json" };
const FEED_DRIFTED = {
  feedPath: "fixtures/synthetic-restaurant/acp-feed.drifted.json",
  catalogPath: "fixtures/synthetic-restaurant/sor.catalog.json",
  surface: "acp",
};

const feesCanonical = callTool("audit_statement", FEES_DRIFTED).canonical;
const feedCanonical = callTool("check_feed", FEED_DRIFTED).canonical;
const cleanCanonical = callTool("audit_statement", { statementPath: "fixtures/synthetic-restaurant/fees/statement.faithful.json" }).canonical;

describe("A3 slack builder — goldens + invariants", () => {
  const cases = [
    { name: "slack-fees-drifted", canonical: feesCanonical, meta: { tool: "audit_statement", subject: "statement 2026-06 (simulated)" } },
    { name: "slack-feed-drifted", canonical: feedCanonical, meta: { tool: "check_feed", subject: "ACP feed vs catalog (simulated)" } },
    { name: "slack-fees-clean", canonical: cleanCanonical, meta: { tool: "audit_statement", subject: "statement 2026-06 faithful (simulated)" } },
  ] as const;

  for (const c of cases) {
    it(`${c.name}: byte-identical to the committed golden`, () => {
      const payload = buildSlackReportPayload(c.canonical, c.meta);
      expect(serializeSlackPayload(payload)).toBe(readFileSync(join(GOLD, `${c.name}.golden.json`), "utf8"));
    });
  }

  it("deterministic: building twice yields identical bytes", () => {
    const a = serializeSlackPayload(buildSlackReportPayload(feesCanonical, { tool: "audit_statement", subject: "x" }));
    const b = serializeSlackPayload(buildSlackReportPayload(feesCanonical, { tool: "audit_statement", subject: "x" }));
    expect(a).toBe(b);
  });

  it("EVERY payload leads with the SIMULATED banner (first block + fallback text)", () => {
    for (const c of cases) {
      const payload = buildSlackReportPayload(c.canonical, c.meta);
      expect(JSON.stringify(payload.blocks[0])).toContain("SIMULATED");
      expect(payload.text).toContain("SIMULATED");
      expect(SIMULATED_BANNER).toContain("SIMULATED");
    }
  });

  it("truncation is explicit and the 50-block limit holds on an oversized report", () => {
    const many = {
      ok: false,
      findings: Array.from({ length: 60 }, (_, i) => ({
        claim: { id: `synthetic#${i}` },
        ruleId: "TEST-RULE",
        severity: "error",
        plainLine: `Synthetic finding number ${i} for the truncation test.`,
      })),
    };
    const payload = buildSlackReportPayload(`${JSON.stringify(many, null, 2)}\n`, { tool: "audit_statement", subject: "truncation" });
    expect(payload.blocks.length).toBeLessThanOrEqual(SLACK_MAX_BLOCKS);
    expect(JSON.stringify(payload.blocks)).toContain("and 40 more finding(s)");
  });

  it("Slack control characters in report-derived text are escaped — a hostile finding cannot ping a channel (Codex A3 P2)", () => {
    const hostile = {
      ok: false,
      findings: [
        { claim: { id: "inj#1" }, ruleId: "TEST-RULE", severity: "error", plainLine: "Ping <!here> and <@U12345> via <http://evil.example|link> & co." },
      ],
    };
    const payload = buildSlackReportPayload(`${JSON.stringify(hostile, null, 2)}\n`, { tool: "audit_statement", subject: "inj" });
    const body = JSON.stringify(payload.blocks);
    expect(body).not.toContain("<!here>");
    expect(body).not.toContain("<@U12345>");
    expect(body).toContain("&lt;!here&gt;");
  });

  it("refuses non-decision-grade payloads loudly (the run_demo transcript cannot become a delivery)", () => {
    const demo = callTool("run_demo", {});
    expect(() => buildSlackReportPayload(demo.canonical, { tool: "run_demo", subject: "x" })).toThrow(
      /not a decision-grade report/,
    );
  });
});

describe("A3 email builder — goldens + invariants", () => {
  it("email-fees-drifted: byte-identical to the committed golden", () => {
    const msg = buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "statement 2026-06 (simulated)", date: FIXED_DATE });
    expect(msg).toBe(readFileSync(join(GOLD, "email-fees-drifted.golden.eml"), "utf8"));
  });

  it("subject and body lead with SIMULATED; addresses are RFC 2606 .example placeholders ONLY", () => {
    const msg = buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "s", date: FIXED_DATE });
    expect(msg).toContain("Subject: [SIMULATED]");
    expect(msg).toContain("SIMULATED DATA - Curbside Commons"); // template v2 (S4b identity migration, allowlisted)
    expect(msg).toContain(EMAIL_FROM_PLACEHOLDER);
    expect(msg).toContain(EMAIL_TO_PLACEHOLDER);
    const addresses = msg.match(/[\w.+-]+@[\w.-]+/g) ?? [];
    for (const a of addresses) expect(a.endsWith(".example"), `non-example address in payload: ${a}`).toBe(true);
  });

  it("deterministic + RFC-disciplined: supplied Date header, CRLF-only, no line over 998 chars (Codex A3 P1)", () => {
    const a = buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "s", date: FIXED_DATE });
    const b = buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "s", date: FIXED_DATE });
    expect(a).toBe(b);
    expect(a.startsWith(`Date: ${FIXED_DATE}\r\n`)).toBe(true);
    expect(/[^\r]\n/.test(a), "bare LF found — every line break must be CRLF").toBe(false);
    for (const line of a.split("\r\n")) expect(line.length, `line over 998 chars: ${line.slice(0, 60)}…`).toBeLessThanOrEqual(998);
    // no raw 8-bit byte travels: the whole message is ASCII (QP/base64 encoded parts)
    expect(/[^\x00-\x7f]/.test(a)).toBe(false);
  });

  it("header injection is refused loudly (Codex A3 P2)", () => {
    expect(() =>
      buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "x\r\nBcc: evil@gmail.com", date: FIXED_DATE }),
    ).toThrow(/header injection refused/);
    expect(() =>
      buildEmailReportMessage(feesCanonical, { tool: "audit_statement", subject: "s", date: "x\nX-Evil: 1" }),
    ).toThrow(/header injection refused/);
  });

  it("the attached report.json part carries the canonical payload (base64, decodable byte-for-byte)", () => {
    const msg = buildEmailReportMessage(feedCanonical, { tool: "check_feed", subject: "s", date: FIXED_DATE });
    expect(msg).toContain(base64Wrapped(feedCanonical));
    const wrapped = base64Wrapped(feedCanonical).split("\r\n").join("");
    expect(Buffer.from(wrapped, "base64").toString("utf8")).toBe(feedCanonical);
  });
});

describe("A3 import/network boundary — builders are JSON-in/JSON-out, transport-free", () => {
  const files = ["lib/delivery/slack.ts", "lib/delivery/email.ts", "lib/delivery/email-html.ts"];

  it("delivery modules import node builtins only (no engine, no registry, no SDK, no transport)", () => {
    for (const f of files) {
      const text = readFileSync(join(process.cwd(), f), "utf8");
      const specs = [...text.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
      expect(specs, `${f} must import nothing at all (pure builders)`).toStrictEqual([]);
    }
  });

  it("no network construct in any delivery source (fetch/require/dynamic-import/webhook literals)", () => {
    for (const f of files) {
      const text = readFileSync(join(process.cwd(), f), "utf8");
      expect(
        /(^|[^.\w])fetch\s*\(|require\s*\(|createRequire|hooks\.slack\.com|https?:\/\/|node:https?|node:net|node:tls|node:dgram|WebSocket|XMLHttpRequest|import\s+["']/.test(text),
        f,
      ).toBe(false);
    }
  });

  it("both builders carry the SIMULATED literal (C10 discipline extended over delivery templates)", () => {
    for (const f of files) {
      expect(readFileSync(join(process.cwd(), f), "utf8")).toContain("SIMULATED");
    }
  });
});

describe("A3 email HTML builder — goldens + invariants", () => {
  // siteLink is CALLER-supplied by design: the builder source must stay
  // URL-literal-free (boundary suite above), so the one outbound reference is
  // an input — fixed here for the golden's determinism, like `date`. The
  // subject + preheader are likewise caller data: fixed here to the same
  // verdict-first strings the L-2 one-shot composes for the drifted audit (so
  // the golden is a faithful snapshot of the v5 production email, matching the
  // owner-adopted mockup email-v5-light-tweakable-2026-07-22.html). The
  // statement period rendered in the meta line is derived from the subject.
  const HTML_META = {
    tool: "audit_statement",
    subject: "[SIMULATED] Fee audit: 5 violations — 2026-06",
    date: "2026-07-22",
    siteLink: "https://curbside-commons.pages.dev/fees",
    preheader: "5 NYC fee-cap violations found in simulated statement 2026-06. See the arithmetic in report.json.",
  } as const;

  // PASS-state meta — mirrors HTML_META's discipline (fixed date, caller-supplied
  // siteLink, subject reflecting the passing statement, verdict-first preheader):
  // the same strings the L-2 one-shot composes for a clean (ok:true) audit. The
  // statement period in the meta line is derived from the subject, as for FAIL.
  const PASS_HTML_META = {
    tool: "audit_statement",
    subject: "[SIMULATED] Fee audit: no violations — 2026-06",
    date: "2026-07-22",
    siteLink: "https://curbside-commons.pages.dev/fees",
    preheader: "No violations found in simulated statement 2026-06. See the arithmetic in report.json.",
  } as const;

  it("email-html-fees-drifted: byte-identical to the committed golden", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    expect(html).toBe(readFileSync(join(GOLD, "email-html-fees-drifted.golden.html"), "utf8"));
  });

  it("deterministic: building twice yields identical bytes", () => {
    expect(buildEmailReportHtml(feesCanonical, HTML_META)).toBe(buildEmailReportHtml(feesCanonical, HTML_META));
  });

  // PASS state gets the SAME first-class byte-frozen treatment as FAIL: the clean
  // (ok:true, 0-findings) canonical rendered through the real builder — graphite
  // stamp, "No violations found" headline, the empty-state ledger sentence, no
  // ember anywhere (lamp ledger). See the pass-rate note in the work report: the
  // canonical carries no reviewed-line count, so the honest empty-state sentence
  // is kept verbatim rather than fabricating a denominator.
  it("email-html-fees-pass: byte-identical to the committed golden (PASS state, first-class)", () => {
    const html = buildEmailReportHtml(cleanCanonical, PASS_HTML_META);
    expect(html).toBe(readFileSync(join(GOLD, "email-html-fees-pass.golden.html"), "utf8"));
  });

  it("PASS deterministic: building twice yields identical bytes", () => {
    expect(buildEmailReportHtml(cleanCanonical, PASS_HTML_META)).toBe(buildEmailReportHtml(cleanCanonical, PASS_HTML_META));
  });

  // v5 anchors: the per-row claim ids stay out (curation directive — the email
  // is the notification, report.json is the report); the FAIL stamp and the
  // rule-id ("NYC-563.3") ledger column anchor the verdict + findings regions.
  it("the SIMULATED banner is the first rendered content (before header, verdict, findings)", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    const banner = html.indexOf("SIMULATED DATA");
    expect(banner).toBeGreaterThan(-1);
    for (const later of ["Curbside Commons</span>", ">FAIL</td>", "NYC-563.3"]) {
      expect(banner, `banner must precede ${JSON.stringify(later)}`).toBeLessThan(html.indexOf(later));
    }
  });

  it("report-derived text is entity-escaped — a hostile finding cannot inject markup", () => {
    const hostile = JSON.parse(feesCanonical);
    hostile.findings[0].plainLine = `<script>alert(1)</script><img src=x onerror=alert(2)> & "q" 'a'`;
    const html = buildEmailReportHtml(`${JSON.stringify(hostile, null, 2)}\n`, HTML_META);
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  // Amended contract (session 32, red-green): `<style>` is now ALLOWED as the
  // enhancement channel for the dark-mode overrides (digest moves #7/#10) —
  // but ONLY as a single block inside <head>, never in the body (Gmail strips
  // body styles; critical styles stay inline). script/link/img/iframe remain
  // banned everywhere, and the single-outbound-URL rule is unchanged.
  it("one <style> block, head-only; script/link/img/iframe banned everywhere; the ONLY outbound reference is the caller-supplied site link", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    expect(/<(script|link|img|iframe)\b/i.test(html)).toBe(false);
    expect([...html.matchAll(/<style\b/gi)].length).toBe(1);
    expect(html.indexOf("<style"), "<style> must open inside <head>").toBeLessThan(html.indexOf("<body"));
    expect(html.indexOf("</style>"), "<style> must close before <body>").toBeLessThan(html.indexOf("<body"));
    const urls = [...html.matchAll(/https?:\/\/[^"'\s<]+/g)].map((m) => m[0]);
    expect(urls).toStrictEqual([HTML_META.siteLink]);
  });

  it("omitting siteLink yields a body with ZERO outbound references", () => {
    const rest = { tool: HTML_META.tool, subject: HTML_META.subject, date: HTML_META.date };
    const html = buildEmailReportHtml(feesCanonical, rest);
    expect(/https?:\/\//.test(html)).toBe(false);
  });

  it("truncation is explicit on an oversized report, never silent", () => {
    const many = JSON.parse(feesCanonical);
    const base = many.findings[0];
    many.findings = Array.from({ length: EMAIL_HTML_FINDINGS_CAP + 7 }, (_, i) => ({ ...base, plainLine: `finding ${i}` }));
    const html = buildEmailReportHtml(`${JSON.stringify(many, null, 2)}\n`, HTML_META);
    expect(html).toContain(`and 7 more findings`);
    expect(html).toContain("report.json");
  });

  it("refuses non-decision-grade payloads loudly (the run_demo transcript cannot become a delivery)", () => {
    const demo = callTool("run_demo", {});
    expect(() => buildEmailReportHtml(demo.canonical, HTML_META)).toThrow(/not a decision-grade report/);
  });

  it("lamp ledger honored: PASS renders graphite (no ember anywhere, in either mode); gold renders NOWHERE on any report", () => {
    const clean = buildEmailReportHtml(cleanCanonical, HTML_META);
    expect(clean).toContain(">PASS</td>");
    expect(clean).not.toContain("#b42318"); // ember = violation-only
    expect(clean).not.toContain("#e0604c"); // the dark-mode ember variant is emitted only when violations exist
    for (const html of [clean, buildEmailReportHtml(feesCanonical, HTML_META)]) {
      expect(html).not.toContain("#ffb020"); // gold = held-status only, absent from email entirely
    }
  });

  // ---- v5 invariants (owner-adopted light-locked redesign) ----

  it("preheader: hidden preview div carries the caller text before the banner, invisible; omitted entirely when absent (digest move #11)", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    const pre = html.indexOf(HTML_META.preheader);
    expect(pre).toBeGreaterThan(-1);
    expect(HTML_META.preheader.length).toBeGreaterThanOrEqual(40); // digest §6: 40–100 chars
    expect(HTML_META.preheader.length).toBeLessThanOrEqual(100);
    // preview metadata only: hidden with display:none, never rendered content
    const divOpen = html.lastIndexOf("<div", pre);
    expect(html.slice(divOpen, pre)).toContain("display:none");
    // the banner stays the first RENDERED content even with the preheader ahead of it in the DOM
    expect(pre).toBeLessThan(html.indexOf("SIMULATED DATA"));
    const noPreheader = { tool: HTML_META.tool, subject: HTML_META.subject, date: HTML_META.date, siteLink: HTML_META.siteLink };
    expect(buildEmailReportHtml(feesCanonical, noPreheader)).not.toContain("display:none");
  });

  it("light-locked (v5): color-scheme=light meta + root, ONE decoy-free head, NO dark-mode block or data-ogsc overrides", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    expect(html).toContain('<meta name="color-scheme" content="light">');
    expect(html).toContain('<meta name="supported-color-schemes" content="light">');
    expect(html).toContain(":root{color-scheme:light;}");
    // the v2 dark-mode enhancement channel is excised in v5 (owner-adopted design)
    expect(html).not.toContain("light dark");
    expect(html).not.toContain("@media (prefers-color-scheme:dark)");
    expect(html).not.toContain("[data-ogsc]");
    // single, decoy-free head (the v2 empty-first-head strip is gone)
    expect([...html.matchAll(/<head\b/gi)].length).toBe(1);
  });

  it("light-locked defensive base colors: no pure #fff / #000 anywhere (near-black on near-white; rgba edges only)", () => {
    for (const html of [buildEmailReportHtml(feesCanonical, HTML_META), buildEmailReportHtml(cleanCanonical, HTML_META)]) {
      expect(html.toLowerCase()).not.toContain("#ffffff");
      expect(html.toLowerCase()).not.toContain("#000000");
      expect(/#(?:fff|000)\b/i.test(html)).toBe(false);
    }
  });

  it("curation contract: no claim ids, no per-row verdict/severity words, no runtime meta (the email is the notification, report.json is the report)", () => {
    const html = buildEmailReportHtml(feesCanonical, HTML_META);
    for (const f of (JSON.parse(feesCanonical) as { findings: Array<{ claim?: { id?: string } }> }).findings) {
      if (f.claim?.id) expect(html, `claim id ${f.claim.id} must live in report.json only`).not.toContain(escapeHtmlLike(f.claim.id));
    }
    expect(html).not.toContain("verdict:");
    expect(html).not.toContain(">error<"); // the old per-row severity chip
    expect(html).not.toContain("deterministic engine");
    expect(html).not.toContain("$0 offline");
  });
});

// The builder entity-escapes report-derived text, so the absence probe must
// look for the ESCAPED form a claim id would take in the body.
function escapeHtmlLike(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
