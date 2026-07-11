/**
 * A3 SLACK DELIVERY BUILDER — a PURE function from an engine report's
 * canonical payload to a Slack Block Kit message payload (plan
 * `docs/plan-agentic-extension.md` §5 row A3, AC-8).
 *
 * OFFLINE BY CONSTRUCTION: this module builds JSON. It holds no client, no
 * webhook URL, no token, no transport — sending anything anywhere is the
 * owner-gated L-2 transient demo, governed by `docs/plan-a3-delivery-safety.md`.
 * Input is the CANONICAL STRING a registry tool returned (never an engine
 * type — same JSON-level consumption discipline as the crew; this module
 * imports node builtins only).
 *
 * HONESTY (C10 extended): every payload leads with the SIMULATED banner block
 * — the builder throws if a caller somehow produces a payload without it
 * (belt + suspenders: the banner is also byte-asserted by tests and goldens).
 *
 * LIMITS (freshness-checked 2026-07-07, docs.slack.dev/reference/block-kit:
 * "up to 50 blocks in each message" — verified verbatim; Slack publishes no
 * official machine-readable Block Kit JSON Schema, so conformance here is
 * structural self-checks + byte-frozen goldens, per AC-8's "where available"):
 * findings are rendered up to a fixed cap with an explicit truncation block —
 * never silently dropped — and the total block count is asserted ≤ 50. The
 * 3000-char section / 150-char header caps are CONSERVATIVE caps we enforce
 * ourselves (chosen below Slack's documented per-block ceilings).
 *
 * Plain: this turns an audit report into a ready-to-post Slack message — but
 * nothing here can post it. Every message starts with a big "SIMULATED"
 * banner, long reports say "…and N more" instead of quietly cutting off, and
 * the whole thing is checked against Slack's 50-block rule before it leaves.
 */

/** The subset of Block Kit block shapes this builder emits. */
export interface SlackBlock {
  readonly type: "header" | "section" | "context" | "divider";
  readonly [key: string]: unknown;
}

/** A built Slack message payload — JSON only, no transport. */
export interface SlackReportPayload {
  readonly text: string; // notification fallback line
  readonly blocks: readonly SlackBlock[];
}

export const SLACK_MAX_BLOCKS = 50; // docs.slack.dev/reference/block-kit, fetched 2026-07-07
const SECTION_TEXT_CAP = 3000; // conservative self-enforced cap
const HEADER_TEXT_CAP = 150; // conservative self-enforced cap
const FINDINGS_RENDER_CAP = 20; // fixed render cap; the truncation block names the remainder

// Template v2 (2026-07-10, plan v3.3 S4b): product name migrated "Commerce Truth
// Audit" → "Curbside Commons" (decision-log row precedes this edit; goldens
// regenerated under the recorded allowlist; the historical L-2 send record keeps
// the v1 name it actually sent). Literal by contract — this module imports nothing.
export const SIMULATED_BANNER = "🧪 SIMULATED DATA — Curbside Commons demonstration output. Not real merchant data, not legal advice.";

interface ParsedForDelivery {
  readonly ok: boolean;
  readonly findings: ReadonlyArray<{ readonly id: string; readonly ruleId: string; readonly severity: string; readonly plainLine: string }>;
}

/** JSON-level parse (same discipline as the crew): loud on shape surprises. */
function parseCanonical(canonical: string): ParsedForDelivery {
  const raw = JSON.parse(canonical) as { ok?: unknown; findings?: unknown };
  if (typeof raw.ok !== "boolean" || !Array.isArray(raw.findings)) {
    throw new Error("delivery/slack: canonical payload is not a decision-grade report (boolean ok + findings[] required)");
  }
  return {
    ok: raw.ok,
    findings: raw.findings.map((f: unknown, i: number) => {
      const ff = f as { claim?: { id?: unknown }; ruleId?: unknown; severity?: unknown; plainLine?: unknown };
      if (typeof ff.claim?.id !== "string" || typeof ff.ruleId !== "string") {
        throw new Error(`delivery/slack: finding[${i}] lacks claim.id/ruleId`);
      }
      return {
        id: ff.claim.id,
        ruleId: ff.ruleId,
        severity: typeof ff.severity === "string" ? ff.severity : "unknown",
        plainLine: typeof ff.plainLine === "string" ? ff.plainLine : "",
      };
    }),
  };
}

const clip = (s: string, cap: number): string => (s.length <= cap ? s : `${s.slice(0, cap - 1)}…`);

/**
 * Escape Slack mrkdwn control characters in REPORT-DERIVED (untrusted) text
 * (Codex A3 review P2, accepted-fixed): `&`, `<`, `>` are Slack's control
 * characters — unescaped, a hostile finding line containing `<!here>` or
 * `<@U…>` would become a LIVE notification the moment an L-2 demo posts the
 * payload. Escaping (per Slack's own formatting rules) renders such content
 * as inert text.
 */
export const escapeSlackText = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Metadata the caller supplies (which tool produced the report, for the context line). */
export interface SlackReportMeta {
  readonly tool: string;
  readonly subject: string; // e.g. "statement 2026-06 (simulated)" — caller-worded, banner-independent
}

/**
 * Build the Block Kit payload for one decision-grade report. Pure and
 * deterministic: same canonical + meta → identical payload bytes.
 */
export function buildSlackReportPayload(canonical: string, meta: SlackReportMeta): SlackReportPayload {
  const report = parseCanonical(canonical);
  const verdictLine = report.ok
    ? `✅ PASS — no violations (${report.findings.length} non-gating finding(s))`
    : `❌ FAIL — violations present (${report.findings.length} finding(s))`;

  const blocks: SlackBlock[] = [
    { type: "section", text: { type: "mrkdwn", text: `*${SIMULATED_BANNER}*` } },
    { type: "header", text: { type: "plain_text", text: clip(`Truth-audit result: ${meta.subject}`, HEADER_TEXT_CAP), emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: clip(`*${verdictLine}*\n_tool: \`${escapeSlackText(meta.tool)}\` · deterministic engine · $0 offline_`, SECTION_TEXT_CAP) } },
    { type: "divider" },
  ];

  for (const f of report.findings.slice(0, FINDINGS_RENDER_CAP)) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: clip(`*[${escapeSlackText(f.severity)}]* ${escapeSlackText(f.plainLine)}\n\`${escapeSlackText(f.id)}\` · rule \`${escapeSlackText(f.ruleId)}\``, SECTION_TEXT_CAP),
      },
    });
  }
  if (report.findings.length > FINDINGS_RENDER_CAP) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `_…and ${report.findings.length - FINDINGS_RENDER_CAP} more finding(s) — see the full report (never silently dropped)._` },
    });
  }
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: "SIMULATED · Curbside Commons · recommendations only — the engine decides, humans approve." }],
  });

  if (blocks.length > SLACK_MAX_BLOCKS) {
    throw new Error(`delivery/slack: ${blocks.length} blocks exceeds Slack's ${SLACK_MAX_BLOCKS}-block message limit`);
  }
  const first = blocks[0] as { text?: { text?: string } };
  if (!first.text?.text?.includes("SIMULATED")) {
    throw new Error("delivery/slack: payload must lead with the SIMULATED banner"); // unreachable by construction; kept loud
  }

  return Object.freeze({ text: `${SIMULATED_BANNER} ${verdictLine}`, blocks: Object.freeze(blocks) });
}

/** Serialize a payload exactly as tests/goldens freeze it. */
export function serializeSlackPayload(payload: SlackReportPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}
