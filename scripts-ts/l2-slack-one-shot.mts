/**
 * L-2 ONE-SHOT SLACK DELIVERY DEMO — the transient live send governed by
 * `docs/plan-a3-delivery-safety.md` (ALL eight controls binding, no exceptions).
 *
 * ARMING: owner word 2026-07-08 ("complete all step by step." + structured-ask
 * pick "Slack webhook" — decision-log row, commit `eb34bb0`). Recipient
 * (control #2) = the owner's OWN workspace channel, bound to the incoming
 * webhook the owner placed in the gitignored `.env` as SLACK_WEBHOOK_URL.
 *
 * Run (owner-armed only):
 *   node --env-file=.env scripts-ts/l2-slack-one-shot.mts
 *
 * CONTROLS ENCODED HERE:
 *  #1 one word = one session: this script sends at most once per invocation and
 *     is only ever invoked on the recorded arming.
 *  #2 allowlisted recipient: the ONLY destination is the env webhook — no
 *     address book, no channel override parameter, no second target.
 *  #3 one-shot: a single POST; ANY outcome (success or failure) ends the run;
 *     no retry path exists in this file.
 *  #4 banner: the payload builder throws without the SIMULATED banner leading.
 *  #5 secrets: the webhook URL is read from env, never printed, never logged;
 *     the run record stores host + a REDACTED marker only.
 *  #6 record: a timestamped, redacted run record is written to docs/reviews/.
 *  #7 free tier: Slack free-workspace incoming webhook.
 *  #8 failure semantics: a non-2xx/thrown send is reported as-is and exits
 *     non-zero — never retried to green.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { callTool } from "../lib/tools/registry.ts";
import { buildSlackReportPayload, serializeSlackPayload } from "../lib/delivery/slack.ts";

const webhook = process.env.SLACK_WEBHOOK_URL;
if (!webhook) {
  console.error("L-2: SLACK_WEBHOOK_URL is not set — the demo is NOT armed. Add it to .env (owner act) and re-run.");
  process.exit(2);
}
let url: URL;
try {
  url = new URL(webhook);
} catch {
  console.error("L-2: SLACK_WEBHOOK_URL is not a valid URL — refusing to send.");
  process.exit(2);
}
// Allowlist (control #2), hardened per the Codex 2026-07-09 P1: https only, exact
// Slack webhook host, AND the /services/ webhook path shape — anything else refuses.
if (url.protocol !== "https:") {
  console.error(`L-2: webhook protocol "${url.protocol}" is not https: — refusing to send.`);
  process.exit(2);
}
if (url.host !== "hooks.slack.com") {
  console.error(`L-2: webhook host "${url.host}" is not hooks.slack.com — refusing to send (allowlist control #2).`);
  process.exit(2);
}
if (!url.pathname.startsWith("/services/")) {
  console.error("L-2: webhook path is not a Slack /services/ incoming-webhook path — refusing to send.");
  process.exit(2);
}
const host = url.host;

// The demo payload: the REAL engine's audit of the committed drifted statement —
// the same canonical → Block Kit path the byte-frozen goldens lock (evals/delivery/).
const FEES_DRIFTED = { statementPath: "fixtures/synthetic-restaurant/fees/statement.drifted.json" };
const canonical = callTool("audit_statement", FEES_DRIFTED).canonical;
const payload = buildSlackReportPayload(canonical, {
  tool: "audit_statement",
  subject: "statement 2026-06 (simulated)",
});
const serialized = serializeSlackPayload(payload);
const payloadSha256 = createHash("sha256").update(serialized).digest("hex");

const startedAt = new Date().toISOString();

// Control #6 hardened per the Codex 2026-07-09 P1: the run record path is PROBED
// with an ARMED/pending record BEFORE the irreversible send (the 2026-07-05
// probe-write-before-spend lesson), and the filename carries the full timestamp so
// a same-day re-arming can never overwrite a prior record.
const recordPath = join(
  "docs",
  "reviews",
  `l2-slack-one-shot-${startedAt.replace(/[:.]/g, "-")}.md`,
);
writeFileSync(
  recordPath,
  `# L-2 One-Shot Slack Delivery Demo — ARMED ${startedAt} (send in progress; this probe line is replaced by the outcome record)\n`,
);

let status = 0;
let statusText = "";
let bodyText = "";
let failure: string | undefined;
try {
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: payload.text, blocks: payload.blocks }),
    // One-shot means ONE destination: any redirect (301/302/307/308) aborts the
    // send rather than replaying the POST elsewhere (Codex 2026-07-09 P1).
    redirect: "error",
  });
  status = res.status;
  statusText = res.statusText;
  bodyText = (await res.text()).slice(0, 200);
} catch (e) {
  failure = e instanceof Error ? e.message : String(e);
}
const finishedAt = new Date().toISOString();
const ok = !failure && status >= 200 && status < 300;

// Control #6 — the redacted run record (committed by the session, not by this script's secret path).
const record = `# L-2 One-Shot Slack Delivery Demo — Run Record (${startedAt})

**Arming:** owner word 2026-07-08 "complete all step by step." + structured-ask pick "Slack webhook"
(decision-log row; authorization commit \`eb34bb0\`). Controls: \`docs/plan-a3-delivery-safety.md\` — all eight held.

| Field | Value |
| --- | --- |
| Sent at | ${startedAt} → ${finishedAt} |
| Target | the owner's own Slack workspace channel via incoming webhook — host \`${host}\`, URL **REDACTED** (control #5) |
| Payload | \`audit_statement\` over \`fixtures/synthetic-restaurant/fees/statement.drifted.json\` → Block Kit via \`lib/delivery/slack.ts\` (the goldens' exact path) |
| Payload sha256 | \`${payloadSha256}\` (serialized form — reproducible offline: same builder, same fixture) |
| Banner | SIMULATED banner leads the payload (builder-enforced, throws without it) |
| HTTP result | ${failure ? `TRANSPORT FAILURE: ${failure}` : `${status} ${statusText} — body (≤200ch): ${bodyText}`} |
| Outcome | ${ok ? "DELIVERED (one-shot; session ended)" : "FAILED — reported as-is, NOT retried (control #8); a fresh demo needs a fresh owner word"} |
| Retries | 0 (no retry path exists — control #3) |

One message, one send, session over (control #1/#3). No secret appears in this record or any log.
`;
writeFileSync(recordPath, record); // replaces the pre-send ARMED probe with the outcome

console.log(`L-2 ${ok ? "DELIVERED" : "FAILED"} — HTTP ${failure ? `(transport: ${failure})` : `${status} ${statusText}`}; payload sha256 ${payloadSha256.slice(0, 16)}…; record ${recordPath}`);
process.exit(ok ? 0 : 1);
