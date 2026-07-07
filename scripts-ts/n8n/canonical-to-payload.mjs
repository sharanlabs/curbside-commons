#!/usr/bin/env node
/**
 * A4 n8n stage 2 — build the A3 delivery payload from a canonical report file
 * (plan §5 row A4: fixture → registry tool → A3 PAYLOAD; this is the payload
 * stage the committed workflow's second Execute Command node invokes).
 * Pure build, zero network — the SIMULATED banner and all A3 invariants come
 * from the builders themselves.
 *
 * Usage (repo root):
 *   node scripts-ts/n8n/canonical-to-payload.mjs --in .n8n-artifacts/canonical.json \
 *     --format slack --tool audit_statement --subject "statement 2026-06 (simulated)" \
 *     --out .n8n-artifacts/slack-payload.json
 *
 * Email format additionally takes --date (RFC 5322 string — determinism is the
 * caller's job, same as the A3 builder contract).
 *
 * Plain: button two — turn the saved report into the ready-to-post (never
 * posted) Slack message or email file.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function arg(name, required = true) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || i === process.argv.length - 1) {
    if (!required) return undefined;
    console.error(`missing --${name}`);
    process.exit(2);
  }
  return process.argv[i + 1];
}

const canonical = readFileSync(arg("in"), "utf8");
const format = arg("format");
const tool = arg("tool");
const subject = arg("subject");
const out = arg("out");

mkdirSync(dirname(out), { recursive: true });
if (format === "slack") {
  const { buildSlackReportPayload, serializeSlackPayload } = await import("../../lib/delivery/slack.ts");
  writeFileSync(out, serializeSlackPayload(buildSlackReportPayload(canonical, { tool, subject })));
} else if (format === "email") {
  const date = arg("date");
  const { buildEmailReportMessage } = await import("../../lib/delivery/email.ts");
  writeFileSync(out, buildEmailReportMessage(canonical, { tool, subject, date }));
} else {
  console.error(`unknown --format "${format}" (slack | email)`);
  process.exit(2);
}
console.log(`wrote ${format} payload -> ${out}`);
process.exit(0);
