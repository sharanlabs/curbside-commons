import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * L-2 ONE-SHOT TRANSPORT GUARD SUITE — closes the audit LOW item
 * (`docs/reviews/agentic-audit-2026-07-24.md`, small-findings batch, last
 * bullet): `scripts-ts/l2-resend-one-shot.mts` is the ONLY transport-bearing
 * code in the repo, and it carried no committed assertions.
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

  it("the SIMULATED banner constant leads bodyText composition, on both halves (control #4)", () => {
    // banner is the FIRST element of the bodyText array literal
    expect(/const bodyText\s*=\s*\[\s*SIMULATED_BANNER\s*,/.test(src)).toBe(true);
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
