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
    expect(msg).toContain("SIMULATED DATA - Commerce Truth Audit");
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
  const files = ["lib/delivery/slack.ts", "lib/delivery/email.ts"];

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
