import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * L-2 ONE-SHOT TRANSPORT GUARD SUITE — closes the audit LOW item
 * (`docs/reviews/agentic-audit-2026-07-24.md`, small-findings batch, last
 * bullet): the L-2 one-shot scripts are the ONLY transport-bearing code in the
 * repo, and they carried no committed assertions.
 *
 * DOCSTRING CORRECTED 2026-07-25 (capability sweep finding #2,
 * `docs/reviews/capability-sweep-2026-07-25.md`): this header previously named
 * `l2-resend-one-shot.mts` as the ONLY transport-bearing script. That was FALSE
 * — `scripts-ts/l2-slack-one-shot.mts:94` performs `await fetch(webhook, …)` to
 * an env-supplied URL and had zero committed assertions. The false docstring was
 * the evidence the gap went unnoticed, which is exactly how an unguarded
 * contract survives a review: the prose asserted the coverage was complete, so
 * nobody looked. BOTH transport-bearing scripts are now guarded here.
 *
 * This suite pins the OFFLINE / NOT-ARMED contract WITHOUT ever reaching the
 * network. Two kinds of teeth:
 *  (1) live guard behaviour — the script is spawned with a PROVABLY-UNARMED env
 *      (every Resend arming variable stripped; asserted below) and must refuse
 *      with the documented non-zero exit BEFORE any build or send, naming what
 *      is missing/malformed;
 *  (2) static source invariants — the SIMULATED banner leads bodyText (control
 *      #4) on both halves, the single `fetch` is lexically gated behind every
 *      arming guard, and the payload digest covers subject+text+html+attachment.
 *
 * No test path can send: case (1a) has no API key, and cases (1b)/(1c) supply a
 * dummy key with a missing/malformed recipient so the run exits at the arming
 * guards, long before the fetch. The dummy key is never a real credential.
 */

const root = process.cwd();
const SCRIPT = join("scripts-ts", "l2-resend-one-shot.mts");
const DUMMY_KEY = "dummy-unarmed-key-not-a-real-credential";

/**
 * A copy of the ambient env with EVERY Resend arming variable stripped. PATH et
 * al. are kept so `node` still resolves; the arming vars are provably absent.
 */
function scrubbedEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.RESEND_TO;
  delete env.RESEND_FROM;
  return env;
}

function runUnarmed(extra: Record<string, string> = {}): {
  status: number | null;
  output: string;
} {
  const env = { ...scrubbedEnv(), ...extra };
  const res = spawnSync("node", [SCRIPT], { cwd: root, env, encoding: "utf8", timeout: 30_000 });
  return { status: res.status, output: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

describe("L-2 one-shot transport guard — offline NOT-ARMED contract", () => {
  it("the spawn env is provably unarmed (no Resend credentials reach the child)", () => {
    const env = scrubbedEnv();
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.RESEND_TO).toBeUndefined();
    expect(env.RESEND_FROM).toBeUndefined();
  });

  it("missing RESEND_API_KEY: refuses with a non-zero exit, names the missing var, sends nothing", () => {
    const res = runUnarmed();
    expect(res.status, "guard must exit non-zero when not armed").not.toBe(0);
    expect(res.status).toBe(2);
    expect(res.output).toContain("RESEND_API_KEY is not set");
    expect(res.output).toContain("NOT armed");
    // the send is never reached: no post-fetch outcome line is printed
    expect(res.output).not.toContain("L-2 EMAIL DELIVERED");
    expect(res.output).not.toContain("L-2 EMAIL FAILED");
  });

  it("missing recipient (key present, RESEND_TO unset): names the missing recipient var and stops before the send", () => {
    const res = runUnarmed({ RESEND_API_KEY: DUMMY_KEY });
    expect(res.status).toBe(2);
    expect(res.output).toContain("RESEND_TO is not set");
    expect(res.output).not.toContain("L-2 EMAIL DELIVERED");
    expect(res.output).not.toContain("L-2 EMAIL FAILED");
  });

  it("malformed recipient (CR/LF header-injection attempt) is refused before any send (control #2)", () => {
    const res = runUnarmed({
      RESEND_API_KEY: DUMMY_KEY,
      RESEND_TO: "ok@a.example\r\nBcc: evil@b.example",
    });
    expect(res.status).toBe(2);
    expect(res.output).toContain("not a single plain email address");
    expect(res.output).not.toContain("L-2 EMAIL DELIVERED");
    expect(res.output).not.toContain("L-2 EMAIL FAILED");
  });
});

describe("L-2 one-shot transport guard — static teeth (source-level invariants)", () => {
  const src = readFileSync(join(root, SCRIPT), "utf8");

  it("the SIMULATED banner leads bodyText composition, on both halves (control #4)", () => {
    // UPDATED 2026-07-25 — the assertion follows the code, the CONTROL does not
    // move. The plain-text half used to be an inline array literal in this
    // script, so this check pattern-matched the literal's first element. That
    // composition now lives in the golden-tested `lib/delivery/email-text.ts`
    // (it was the only live-send surface no golden covered). A source-text
    // guard keyed to the OLD shape would have silently passed-then-failed on a
    // pure refactor, so it is re-pointed at the property that actually matters:
    // whatever builds the body, the banner must lead it.
    expect(/const bodyText\s*=\s*buildEmailReportText\(/.test(src)).toBe(true);
    // …and the builder is the one whose golden pins the banner-first ordering.
    const builderSrc = readFileSync(join(root, "lib", "delivery", "email-text.ts"), "utf8");
    expect(/return\s*\[\s*SIMULATED_BANNER\s*,/.test(builderSrc)).toBe(true);
    // runtime guard: refuse a plain-text body that lost the leading banner
    expect(src).toContain("!bodyText.startsWith(SIMULATED_BANNER)");
    // control #4 extends to the HTML half
    expect(src).toContain("bodyHtml.includes(SIMULATED_BANNER)");
  });

  it("the single fetch/send is lexically gated behind every arming guard exit", () => {
    const fetchAt = src.indexOf("fetch(");
    expect(fetchAt, "the script must contain the send fetch").toBeGreaterThan(-1);
    // every guard that exits with code 2 (missing key / missing+malformed
    // recipient / banner checks) appears BEFORE the one send
    const lastGuardExit = src.lastIndexOf("process.exit(2)");
    expect(lastGuardExit).toBeGreaterThan(-1);
    expect(fetchAt, "fetch must appear after the final arming guard").toBeGreaterThan(lastGuardExit);
    // and it is the ONLY fetch in the transport script
    expect([...src.matchAll(/fetch\(/g)].length).toBe(1);
  });

  it("the payload sha256 covers subject + text + html + attachment", () => {
    expect(src).toContain('createHash("sha256")');
    expect(src).toContain("${subject}\\n${bodyText}\\n${bodyHtml}\\n${attachmentBase64}");
  });
});

/**
 * THE SLACK MIRROR — capability sweep finding #2 (2026-07-25).
 *
 * `scripts-ts/l2-slack-one-shot.mts` is the repo's OTHER transport-bearing
 * script and had no committed assertions at all. It was verified by hand to
 * exit 2 and touch nothing when unarmed, so this was an UNGUARDED CONTRACT
 * rather than a live defect — but an unguarded contract is one careless edit
 * away from becoming one, and this script can reach the public internet.
 *
 * Same two kinds of teeth as the Resend suite above: spawned live-guard
 * behaviour under a provably-unarmed env, plus static source invariants. No test
 * path can send — every case either has no webhook at all or supplies a
 * deliberately non-Slack / malformed URL that trips the allowlist guards long
 * before the fetch.
 */
const SLACK_SCRIPT = join("scripts-ts", "l2-slack-one-shot.mts");

function slackEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.SLACK_WEBHOOK_URL;
  return { ...env, ...extra };
}

function runSlackUnarmed(extra: Record<string, string> = {}): { status: number | null; output: string } {
  const res = spawnSync("node", [SLACK_SCRIPT], {
    cwd: root,
    env: slackEnv(extra),
    encoding: "utf8",
    timeout: 30_000,
  });
  return { status: res.status, output: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

describe("L-2 SLACK one-shot transport guard — offline NOT-ARMED contract", () => {
  it("the spawn env is provably unarmed (no webhook reaches the child)", () => {
    expect(slackEnv().SLACK_WEBHOOK_URL).toBeUndefined();
  });

  it("missing SLACK_WEBHOOK_URL: refuses with a non-zero exit, names the missing var, sends nothing", () => {
    const res = runSlackUnarmed();
    expect(res.status).toBe(2);
    expect(res.output).toContain("SLACK_WEBHOOK_URL is not set");
    expect(res.output).toContain("NOT armed");
    expect(res.output).not.toContain("L-2 DELIVERED");
  });

  it("malformed webhook: refuses before any send", () => {
    const res = runSlackUnarmed({ SLACK_WEBHOOK_URL: "not-a-url" });
    expect(res.status).toBe(2);
    expect(res.output).toContain("not a valid URL");
    expect(res.output).not.toContain("L-2 DELIVERED");
  });

  it("host allowlist (control #2): a non-Slack host is refused even when well-formed", () => {
    // The single most important guard on this script — it is what stops an
    // env-supplied URL from turning a demo into an arbitrary-host POST.
    const res = runSlackUnarmed({ SLACK_WEBHOOK_URL: "https://evil.example/services/T000/B000/XXXX" });
    expect(res.status).toBe(2);
    expect(res.output).toContain("is not hooks.slack.com");
    expect(res.output).not.toContain("L-2 DELIVERED");
  });

  it("path allowlist: a Slack host with a non-/services/ path is refused", () => {
    const res = runSlackUnarmed({ SLACK_WEBHOOK_URL: "https://hooks.slack.com/not-services/abc" });
    expect(res.status).toBe(2);
    expect(res.output).not.toContain("L-2 DELIVERED");
  });
});

describe("L-2 SLACK one-shot transport guard — static teeth (source-level invariants)", () => {
  const slackSrc = readFileSync(join(root, SLACK_SCRIPT), "utf8");

  it("the single fetch/send is lexically gated behind every arming guard exit", () => {
    const fetchAt = slackSrc.indexOf("fetch(");
    expect(fetchAt, "the script must contain the send fetch").toBeGreaterThan(-1);
    const lastGuardExit = slackSrc.lastIndexOf("process.exit(2)");
    expect(lastGuardExit).toBeGreaterThan(-1);
    expect(fetchAt, "fetch must appear after the final arming guard").toBeGreaterThan(lastGuardExit);
    expect([...slackSrc.matchAll(/fetch\(/g)].length, "exactly one send").toBe(1);
  });

  it("the payload is built by the GOLDEN-TESTED builder, never composed inline", () => {
    // This is the property whose ABSENCE on the email side was capability-sweep
    // finding #1. The Slack lane already had it; now it is pinned so it cannot
    // regress into an inline literal the goldens do not cover.
    expect(slackSrc).toContain('from "../lib/delivery/slack.ts"');
    expect(/buildSlackReportPayload\(/.test(slackSrc)).toBe(true);
  });

  it("the host+path allowlist is enforced in source (control #2), not just by convention", () => {
    expect(slackSrc).toContain('url.host !== "hooks.slack.com"');
    expect(slackSrc).toContain('url.pathname.startsWith("/services/")');
  });
});
