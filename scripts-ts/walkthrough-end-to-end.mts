/**
 * END-TO-END WALKTHROUGH — every surface the product has, in one run.
 *
 * WHAT THIS IS. A single command that carries ONE audit from raw feed to the
 * messages a human would receive, printing what each surface actually produces.
 * Written for the owner's request to "show the end to end demonstration, slack,
 * all those involved" (2026-07-29).
 *
 * WHAT IT DOES NOT DO, BY CONSTRUCTION: it never sends anything. The Slack and
 * email legs call the SAME builders the owner-armed one-shots call
 * (`lib/delivery/slack.ts`, `lib/delivery/email.ts`), then print the payload
 * instead of POSTing it. There is no webhook read, no transport import, and no
 * network call anywhere in this file — a live send stays a separate,
 * owner-armed act under the eight controls in `docs/plan-a3-delivery-safety.md`.
 * That separation is the point: you can see exactly what WOULD be delivered
 * without anything being delivered.
 *
 * Run:  npx tsx scripts-ts/walkthrough-end-to-end.mts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { callTool } from "../lib/tools/registry.ts";
import { buildSlackReportPayload, serializeSlackPayload } from "../lib/delivery/slack.ts";
import { buildEmailReportMessage } from "../lib/delivery/email.ts";

const root = process.cwd();
const F = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

let step = 0;
function head(title: string, why: string) {
  step += 1;
  console.log(`\n${F.cyan}${"═".repeat(78)}${F.reset}`);
  console.log(`${F.bold}STEP ${step} · ${title}${F.reset}`);
  console.log(`${F.dim}${why}${F.reset}`);
  console.log(`${F.cyan}${"═".repeat(78)}${F.reset}\n`);
}

function excerpt(text: string, lines: number) {
  const all = text.split("\n");
  const shown = all.slice(0, lines).join("\n");
  return all.length > lines
    ? `${shown}\n${F.dim}    … ${all.length - lines} more line(s) — nothing dropped, just not printed here.${F.reset}`
    : shown;
}

console.log(`\n${F.bold}CURBSIDE COMMONS — END-TO-END WALKTHROUGH${F.reset}`);
console.log(`${F.yellow}SIMULATED DATA THROUGHOUT. No real platform, merchant, or business impact.${F.reset}`);
console.log(`${F.dim}Nothing is sent. Delivery payloads are BUILT and PRINTED, never transmitted.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   1 · THE INPUTS
   ───────────────────────────────────────────────────────────────────────── */
head(
  "The two inputs a reader supplies",
  "The whole product is one question: does the published feed agree with the merchant's own records?",
);

const feedPath = join(root, "fixtures/synthetic-restaurant/acp-feed.drifted.json");
const sorPath = join(root, "fixtures/synthetic-restaurant/sor.catalog.json");
const feed = JSON.parse(readFileSync(feedPath, "utf8"));
const sor = JSON.parse(readFileSync(sorPath, "utf8"));

console.log(`  A · THE FEED    ${F.dim}(what an AI agent reads)${F.reset}`);
console.log(`      ${feedPath.replace(root + "/", "")} — ${feed.items?.length ?? 0} rows`);
console.log(`  B · THE RECORD  ${F.dim}(the merchant's system of record — the truth side)${F.reset}`);
console.log(`      ${sorPath.replace(root + "/", "")} — ${sor.items?.length ?? 0} items\n`);
console.log(`  ${F.dim}These are the same two files the website's upload tool accepts.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   2 · THE ENGINE
   ───────────────────────────────────────────────────────────────────────── */
head(
  "The deterministic engine runs (no AI, no network, $0)",
  "Same input → same verdict, every time. This is the tool surface an agent calls.",
);

// `surface` is REQUIRED by the tool's input schema — the first draft of this
// script omitted it and the registry refused the call with a named missing
// property rather than guessing a default. Worth leaving on the record: that
// refusal is the same discipline the parsers apply to reader uploads.
const feedResult = callTool("check_feed", { feedPath, catalogPath: sorPath, surface: "acp" });

// The envelope is FLAT and its payload is a CANONICAL STRING, not a nested
// object — one serialization that every surface (site, CLI, Slack, email)
// consumes, so no surface can drift into its own private shape. This script's
// first draft assumed `result.report` and crashed; the contract is in
// lib/tools/types.ts and it is the contract that is right.
interface Finding {
  readonly claim: { id: string; source: string; field: string; value: unknown };
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: string;
  readonly category: string;
  readonly plainLine: string;
}
const feedDoc = JSON.parse(feedResult.canonical) as {
  ok: boolean;
  simulated: boolean;
  specVersion: string;
  findings: Finding[];
};
const findings = feedDoc.findings ?? [];

console.log(`  tool called:  ${F.bold}check_feed${F.reset}  ${F.dim}(one of 7 MCP tools)${F.reset}`);
console.log(`  verdict:      ${feedResult.ok ? F.green + "PASS" : "\x1b[31mFAIL"}${F.reset}  ${F.dim}(exit code ${feedResult.exitCode} — CI-usable)${F.reset}`);
console.log(`  findings:     ${F.bold}${findings.length}${F.reset}`);
console.log(`  simulated:    ${feedDoc.simulated}`);
console.log(`  spec pin:     ${F.dim}${feedDoc.specVersion}${F.reset}\n`);
console.log(`  ${F.dim}THE RECEIPTS. No finding is a bare assertion — each one names the claim it${F.reset}`);
console.log(`  ${F.dim}read, where it read it, the record it checked against, and the rule applied:${F.reset}\n`);
for (const f of findings.slice(0, 3)) {
  console.log(`    [${f.severity}] ${f.plainLine}`);
  console.log(`      ${F.dim}claim:     ${f.claim.id}  ${F.reset}${F.dim}(${f.claim.source} · ${f.claim.field} = ${JSON.stringify(f.claim.value)})${F.reset}`);
  console.log(`      ${F.dim}reference: ${f.referenceRowId}${F.reset}`);
  console.log(`      ${F.dim}rule:      ${f.ruleId} · ${f.category}${F.reset}`);
}
if (findings.length > 3) console.log(`    ${F.dim}… and ${findings.length - 3} more.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   3 · CONFORMANCE vs TRUTH
   ───────────────────────────────────────────────────────────────────────── */
head(
  "Conformance is not truth — the distinction the product exists for",
  "A document can be perfectly spec-VALID and still be FALSE. Schema checks cannot see this.",
);
console.log(`  A spec validator asks:  ${F.bold}is this document correctly SHAPED?${F.reset}`);
console.log(`  This engine asks:       ${F.bold}is this document TRUE?${F.reset}\n`);
console.log(`  ${F.dim}The feed above is well-formed. It is also wrong in ${findings.length} places.${F.reset}`);
console.log(`  ${F.dim}Two separate rule families answer the two questions: LST-CONF-* vs LST-*.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   4 · THE FEE AUDIT
   ───────────────────────────────────────────────────────────────────────── */
head(
  "The second pack: NYC delivery fee caps, read against codified law",
  "Same engine shape, different domain — real published law, simulated statement.",
);

const stmtPath = join(root, "fixtures/synthetic-restaurant/fees/statement.drifted.json");
const feeResult = callTool("audit_statement", { statementPath: stmtPath });
const feeDoc = JSON.parse(feeResult.canonical) as { findings: Finding[] };
const feeFindings = feeDoc.findings ?? [];

console.log(`  tool called:  ${F.bold}audit_statement${F.reset}`);
console.log(`  statute:      NYC Administrative Code §20-563.3 (Local Law 79 of 2025)`);
console.log(`  verdict:      ${feeResult.ok ? F.green + "PASS" : "\x1b[31mFAIL"}${F.reset}  ${F.dim}(exit code ${feeResult.exitCode})${F.reset}`);
console.log(`  findings:     ${F.bold}${feeFindings.length}${F.reset}\n`);
for (const f of feeFindings.slice(0, 3)) {
  console.log(`    [${f.severity}] ${f.plainLine}`);
  console.log(`      ${F.dim}rule ${f.ruleId}${F.reset}`);
}
if (feeFindings.length > 3) console.log(`    ${F.dim}… and ${feeFindings.length - 3} more.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   5 · SLACK
   ───────────────────────────────────────────────────────────────────────── */
head(
  "The Slack message — BUILT, NOT SENT",
  "The exact Block Kit payload the owner-armed one-shot would POST. Nothing leaves this process.",
);

const slackPayload = buildSlackReportPayload(feeResult.canonical, {
  tool: "audit_statement",
  subject: "statement 2026-06 (simulated)",
});

console.log(`  ${F.bold}What a reader would SEE in the channel:${F.reset}\n`);
for (const block of slackPayload.blocks as Array<Record<string, never>>) {
  const b = block as unknown as { type: string; text?: { text: string }; elements?: Array<{ text: string }> };
  if (b.type === "divider") { console.log(`    ${F.dim}${"─".repeat(60)}${F.reset}`); continue; }
  // Strip Slack's *bold* and `code` markers for a plain-text preview, but NOT
  // underscores: rule ids and fee categories contain them (`service_and_delivery`),
  // and a preview that quietly rewrites the data it previews is worse than no
  // preview. Indent continuation lines so multi-line blocks stay readable.
  const t = b.text?.text ?? b.elements?.map((e) => e.text).join(" ") ?? "";
  // `_italic_` is stripped only when it WRAPS a run (paired at the edges),
  // never globally — a blanket `_` strip rewrote `service_and_delivery` into
  // `serviceanddelivery` in the first cut of this preview.
  const plain = t.replace(/\*/g, "").replace(/`/g, "").replace(/^_(.*)_$/gm, "$1");
  console.log(plain.split("\n").map((l) => `    ${l}`).join("\n"));
}

console.log(`\n  ${F.bold}The raw payload (first lines of what would be POSTed):${F.reset}\n`);
console.log(excerpt(serializeSlackPayload(slackPayload), 8));

console.log(`\n  ${F.yellow}▲ SAFETY, BY CONSTRUCTION:${F.reset}`);
console.log(`    · The payload builder ${F.bold}throws${F.reset} if the SIMULATED banner is not first.`);
console.log(`    · This script imports the BUILDER only — no webhook, no transport, no network.`);
console.log(`    · A live send is a separate owner-armed act under 8 written controls`);
console.log(`      (${F.dim}docs/plan-a3-delivery-safety.md${F.reset}); it has been run 2× to the owner's own channel.`);

/* ─────────────────────────────────────────────────────────────────────────
   6 · EMAIL
   ───────────────────────────────────────────────────────────────────────── */
head(
  "The email — BUILT, NOT SENT",
  "Same report, same discipline: a real RFC-822 message, printed rather than delivered.",
);

// `date` is CALLER-SUPPLIED rather than read from the clock, so the same report
// always builds the same bytes (that determinism is what lets goldens pin it).
// The meta takes no `to`/`from`: the builder fills both with RFC 2606 `.example`
// reserved domains, which can never resolve. So the composed message is a
// complete, valid RFC-822 document that is ALSO undeliverable by construction —
// choosing a real recipient is the owner-armed one-shot's job, under control #2.
const email = buildEmailReportMessage(feeResult.canonical, {
  tool: "audit_statement",
  subject: "statement 2026-06 (simulated)",
  date: "Wed, 29 Jul 2026 12:00:00 +0000",
});

console.log(excerpt(email, 16));
console.log(`\n  ${F.dim}Full message: ${email.length} bytes — a complete multipart RFC-822 document.${F.reset}`);
console.log(`  ${F.dim}Both halves (HTML + plain text) are byte-pinned by goldens, so a silent`);
console.log(`  change to either is a failing test.${F.reset}`);
console.log(`\n  ${F.yellow}▲ Note the addresses: ${F.reset}${F.dim}sender.example / recipient.example are RFC 2606`);
console.log(`  reserved domains that can never resolve — the message is valid and`);
console.log(`  undeliverable at the same time, which is exactly what a demo should be.${F.reset}`);

/* ─────────────────────────────────────────────────────────────────────────
   7 · WHERE ELSE THIS RUNS
   ───────────────────────────────────────────────────────────────────────── */
head("The same engine, five surfaces", "One implementation. No surface re-implements a rule.");

const surfaces: Array<[string, string, string]> = [
  ["Website", "curbside-commons.vercel.app", "upload two files, get a verdict + downloadable report"],
  ["CLI", "node bin/check.mjs …", "the same audit in a terminal, exit-coded for CI"],
  ["MCP server", "node bin/mcp-server.mjs", "7 tools an AI agent can call directly"],
  ["Slack", "lib/delivery/slack.ts", "Block Kit payload (owner-armed send)"],
  ["Email", "lib/delivery/email.ts", "RFC-822 message (owner-armed send)"],
];
for (const [name, how, what] of surfaces) {
  console.log(`  ${F.bold}${name.padEnd(12)}${F.reset}${F.dim}${how.padEnd(34)}${F.reset}${what}`);
}

console.log(`\n${F.cyan}${"═".repeat(78)}${F.reset}`);
console.log(`${F.bold}WALKTHROUGH COMPLETE${F.reset} — ${step} steps.`);
console.log(`${F.yellow}Everything above ran on simulated data. Nothing was sent anywhere.${F.reset}`);
console.log(`${F.cyan}${"═".repeat(78)}${F.reset}\n`);
