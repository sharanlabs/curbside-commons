/**
 * THE DELIVERY STATION'S VIEW MODEL — the built Slack payload and email message,
 * reduced to something a component can render without retyping a single word of
 * them (walkthrough redesign, 2026-08-02).
 *
 * WHY THIS EXISTS. The site's DELIVERY station shows what a human would receive.
 * The one way to get that wrong is to WRITE the message in JSX — then the page
 * says whatever a designer typed, and the builders say something else, and
 * nothing catches the divergence. So every string below is READ from
 * `buildSlackReportPayload` / `buildEmailReportBodyText` output. This module
 * classifies and de-marks that output for display; it never authors it. The
 * SIMULATED banner in particular is the builder's own literal, arriving through
 * `blocks[0]` exactly as a Slack channel would receive it.
 *
 * SHARED BY BOTH SIDES, DELIBERATELY. The idle artifacts are built on the SERVER
 * from the bundled report (so the fixture never enters the browser bundle); a
 * live run rebuilds them in the browser from that run's own canonical. One
 * function serves both, so the artifact a reader sees before a run and the one
 * they see after are produced by identical code.
 *
 * TRANSPORT-FREE, and provably so: this module imports the two BUILDERS and
 * nothing else. `evals/packs/landing-delivery-egress.test.ts` walks the real
 * import graph from the rendering component and fails on any egress capability.
 */
import { buildSlackReportPayload, type SlackBlock } from "@/lib/delivery/slack.ts";
import {
  buildEmailReportBodyText,
  emlSubjectLine,
  EMAIL_FROM_PLACEHOLDER,
  EMAIL_TO_PLACEHOLDER,
} from "@/lib/delivery/email-message.ts";

/**
 * Strip Slack's mrkdwn control markers for on-page display.
 *
 * `_italic_` is unwrapped only when it BRACKETS a whole run, never globally —
 * the walkthrough script learned this the expensive way: a blanket `_` strip
 * rewrote `service_and_delivery` into `serviceanddelivery`, i.e. a preview that
 * quietly rewrote the data it was previewing.
 */
function demark(text: string): string {
  return text.replace(/\*/g, "").replace(/`/g, "").replace(/^_(.*)_$/gm, "$1");
}

/** One rendered row of the Slack artifact, classified from the builder's block. */
export type SlackRow =
  | { readonly kind: "banner"; readonly text: string }
  | { readonly kind: "header"; readonly text: string }
  | { readonly kind: "verdict"; readonly verdict: string; readonly sub: string }
  | { readonly kind: "divider" }
  | { readonly kind: "finding"; readonly severity: string; readonly text: string; readonly ids: string }
  | { readonly kind: "note"; readonly text: string }
  | { readonly kind: "context"; readonly text: string };

function blockText(block: SlackBlock): string {
  const b = block as unknown as {
    text?: { text?: string };
    elements?: ReadonlyArray<{ text?: string }>;
  };
  return b.text?.text ?? b.elements?.map((e) => e.text ?? "").join(" ") ?? "";
}

/**
 * Classify the builder's blocks into rows the station can typeset.
 *
 * Position is used only where the builder's own contract fixes it (the banner is
 * block 0 BY CONSTRUCTION — the builder throws otherwise). Everything after the
 * divider is content, distinguished by shape rather than by index, so a report
 * with more or fewer findings classifies correctly without arithmetic.
 */
export function slackRows(blocks: readonly SlackBlock[]): SlackRow[] {
  const rows: SlackRow[] = [];
  blocks.forEach((block, i) => {
    const raw = blockText(block);
    const text = demark(raw);
    if (block.type === "divider") {
      rows.push({ kind: "divider" });
      return;
    }
    if (block.type === "header") {
      rows.push({ kind: "header", text });
      return;
    }
    if (block.type === "context") {
      rows.push({ kind: "context", text });
      return;
    }
    // The banner is the builder's guaranteed first block.
    if (i === 0) {
      rows.push({ kind: "banner", text });
      return;
    }
    const [first = "", second = ""] = text.split("\n");
    // The verdict section is the one carrying the tool line beneath its headline.
    if (second.startsWith("tool:")) {
      rows.push({ kind: "verdict", verdict: first, sub: second });
      return;
    }
    // A finding section leads with its severity in brackets.
    const sev = /^\[([^\]]+)\]\s*/.exec(first);
    if (sev) {
      rows.push({
        kind: "finding",
        severity: sev[1],
        text: first.slice(sev[0].length),
        ids: second,
      });
      return;
    }
    rows.push({ kind: "note", text });
  });
  return rows;
}

/** The email artifact, as headers plus the readable body the builder composes. */
export interface EmailArtifact {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly date: string;
  readonly body: string;
}

export interface DeliveryArtifacts {
  readonly slack: readonly SlackRow[];
  readonly email: EmailArtifact;
}

export interface DeliveryMeta {
  /** Which tool produced the report — the builders' context line. */
  readonly tool: string;
  /** Caller-worded subject describing WHAT was audited. */
  readonly subject: string;
  /**
   * RFC 5322 date. Caller-supplied and deterministic by contract — the builder
   * never reads a clock, because a hidden clock would make the same report
   * produce different bytes on every render.
   */
  readonly date: string;
}

/**
 * Build both artifacts from one canonical report. Pure: same inputs, same
 * output, on the server and in the browser alike.
 */
export function buildDeliveryArtifacts(canonical: string, meta: DeliveryMeta): DeliveryArtifacts {
  const payload = buildSlackReportPayload(canonical, { tool: meta.tool, subject: meta.subject });
  return {
    slack: slackRows(payload.blocks),
    email: {
      from: EMAIL_FROM_PLACEHOLDER,
      to: EMAIL_TO_PLACEHOLDER,
      subject: emlSubjectLine(meta.subject),
      date: meta.date,
      body: buildEmailReportBodyText(canonical, { tool: meta.tool, subject: meta.subject }),
    },
  };
}
