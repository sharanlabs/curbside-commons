"use client";

/**
 * STATION 5 · DELIVERY — what a human would receive (walkthrough redesign,
 * 2026-08-02).
 *
 * WHY THIS STATION EXISTS. A verdict that stays on a screen changes nothing. The
 * CLI walkthrough has always ended by BUILDING the two messages an operations
 * channel would get and printing them instead of sending them; this brings that
 * ending onto the site.
 *
 * NOTHING IS TRANSMITTED, AND THAT IS STRUCTURAL. This component imports the
 * BUILDERS and nothing else — no client, no webhook, no address, no transport.
 * `evals/packs/landing-delivery-egress.test.ts` walks this file's real import
 * graph with a fail-closed allowlist and rejects any egress capability, so the
 * guarantee is enforced rather than asserted. The same discipline, and the same
 * walker, that guards the CLI and the end-to-end walkthrough.
 *
 * NOT ONE WORD OF THESE MESSAGES IS WRITTEN HERE. Every string is read from
 * `buildSlackReportPayload` / `buildEmailReportBodyText` output via
 * `lib/landing/delivery-artifacts.ts`. The SIMULATED banner in particular
 * arrives as the builder's own first block — the builder throws if a payload
 * lacks it — rather than being retyped into JSX, where it could quietly drift
 * out of agreement with what a recipient would actually receive.
 *
 * IDLE vs LIVE. Before a run, the artifacts are built on the SERVER from the
 * bundled pair's committed report and arrive as props (so the fixture never
 * enters the browser bundle). After a run, they are rebuilt here from that run's
 * own canonical, through the same function.
 */
import { useMemo } from "react";
import {
  buildDeliveryArtifacts,
  type DeliveryArtifacts,
} from "@/lib/landing/delivery-artifacts";
import { useRun } from "./run-bus";

export function DeliverySection({
  idle,
  date,
}: {
  readonly idle: DeliveryArtifacts;
  /** Deterministic date for a rebuilt message — the builders never read a clock. */
  readonly date: string;
}) {
  const { report, origin } = useRun();

  const artifacts = useMemo<DeliveryArtifacts>(() => {
    if (report === null) return idle;
    // The subject states WHAT was audited. It must follow the run's recorded
    // origin, not a constant: calling a reader's own files "the bundled pair"
    // would put a false description in a message they are being shown as the
    // thing a recipient would receive.
    const readerSide = origin !== null && (origin.feed === "reader" || origin.catalog === "reader");
    return buildDeliveryArtifacts(JSON.stringify(report), {
      tool: "check_feed",
      subject: readerSide ? "your run (simulated)" : "bundled pair (simulated)",
      date,
    });
  }, [report, origin, idle, date]);

  return (
    <div className="wk-artifacts">
      {/* ---- Slack: the Block Kit payload, block for block ---- */}
      <div className="wk-artifact">
        <div className="wk-art-head">
          <span>Slack message · Block Kit payload</span>
          <span className="wk-stamp">Built, not sent</span>
        </div>
        <div className="wk-art-body">
          {artifacts.slack.map((row, i) => {
            switch (row.kind) {
              case "banner":
                return (
                  <p className="wk-sk-banner" key={i}>
                    {row.text}
                  </p>
                );
              case "header":
                return (
                  <p className="wk-sk-header" key={i}>
                    {row.text}
                  </p>
                );
              case "verdict":
                return (
                  <span key={i}>
                    <span className="wk-sk-verdict">{row.verdict}</span>
                    <span className="wk-sk-sub">{row.sub}</span>
                  </span>
                );
              case "divider":
                return <span className="wk-sk-div" key={i} aria-hidden="true" />;
              case "finding":
                return (
                  <p className="wk-sk-finding" key={i}>
                    <span className="wk-sev">[{row.severity}]</span> {row.text}
                    <span className="wk-ids">{row.ids}</span>
                  </p>
                );
              case "note":
                return (
                  <p className="wk-sk-more" key={i}>
                    {row.text}
                  </p>
                );
              case "context":
                return (
                  <p className="wk-sk-ctx" key={i}>
                    {row.text}
                  </p>
                );
            }
          })}
        </div>
        <div className="wk-art-foot">
          Every block the delivery builder emits, in its own order — banner first, by construction.
        </div>
      </div>

      {/* ---- Email: the message a recipient would open ---- */}
      <div className="wk-artifact">
        <div className="wk-art-head">
          <span>Email · RFC 5322 message</span>
          <span className="wk-stamp">Built, not sent</span>
        </div>
        <div className="wk-art-body">
          <div className="wk-em-heads">
            <span className="wk-h">From:</span> {artifacts.email.from}
            <br />
            <span className="wk-h">To:</span> {artifacts.email.to}
            <br />
            <span className="wk-h">Subject:</span> {artifacts.email.subject}
            <br />
            <span className="wk-h">Date:</span> {artifacts.email.date}
          </div>
          <p className="wk-em-body">{artifacts.email.body}</p>
        </div>
        <div className="wk-art-foot">
          Plain text first, findings counted rather than dropped, headers injection-guarded — the
          same message an owner-armed send would carry.
        </div>
      </div>
    </div>
  );
}
