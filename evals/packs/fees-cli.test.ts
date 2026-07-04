import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * F1a CLI leg (plan item 8) exercised as a real child process: exit 0 on a clean
 * statement, 1 on any violation, 2 on usage / bad input; the --json output is
 * byte-equal to the frozen golden. The $0-LLM property is enforced STRUCTURALLY:
 * a transitive import-graph scan from the fees CLI module proves it can never
 * reach an LLM / provider / network module (the cli-c1 pattern + alias resolver).
 */

const root = process.cwd();
const cli = join(root, "bin", "check.mjs");
const fees = join(root, "fixtures", "synthetic-restaurant", "fees");

interface RunResult {
  readonly status: number;
  readonly stdout: string;
}
function runCli(args: readonly string[]): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [cli, ...args], { encoding: "utf8" });
    return { status: 0, stdout };
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    return { status: e.status ?? -1, stdout: e.stdout ?? "" };
  }
}

describe("F1a fees CLI leg (real process)", () => {
  it("exit 0 on the faithful statement", () => {
    expect(runCli(["fees", join(fees, "statement.faithful.json")]).status).toBe(0);
  }, 60000);

  it("exit 1 on the drifted statement (violations present)", () => {
    expect(runCli(["fees", join(fees, "statement.drifted.json")]).status).toBe(1);
  }, 60000);

  it("exit 0 on the cured statement (refunded in window) and the conditional statement (window open)", () => {
    expect(runCli(["fees", join(fees, "statement.cured.json")]).status).toBe(0);
    expect(runCli(["fees", join(fees, "statement.conditional.json")]).status).toBe(0);
  }, 60000);

  it("--json is byte-equal to the frozen golden report, exit unchanged", () => {
    const r = runCli(["fees", join(fees, "statement.drifted.json"), "--json"]);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe(readFileSync(join(fees, "expected-report.drifted.json"), "utf8"));
  }, 60000);

  it("exit 2 on usage errors (unknown flag, no positional, surplus positional)", () => {
    expect(runCli(["fees", join(fees, "statement.drifted.json"), "--bogus"]).status).toBe(2);
    expect(runCli(["fees", "--json"]).status).toBe(2);
    expect(runCli(["fees", "a.json", "b.json"]).status).toBe(2);
  }, 60000);

  it("exit 2 on unreadable / malformed input (parser throws → bin maps to usage)", () => {
    expect(runCli(["fees", join(root, "nonexistent.json")]).status).toBe(2);
    expect(runCli(["fees", join(root, "package.json")]).status).toBe(2); // valid JSON, wrong shape
  }, 60000);

  it("the report carries the honest deferred-classifier scope label", () => {
    const r = runCli(["fees", join(fees, "statement.drifted.json"), "--json"]);
    const report = JSON.parse(r.stdout) as { classification: string; simulated: boolean };
    expect(report.classification).toContain("DEFERRED (F1b)");
    expect(report.simulated).toBe(true);
  }, 60000);
});

describe("F1a fees leg $0-LLM: structural import-graph proof", () => {
  const banned = [/lib\/agents\//, /@ai-sdk/, /^ai$|\/ai\//, /node:https?/, /undici/, /groq|gemini/i];

  function importsOf(file: string): string[] {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
    for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
    return specs;
  }
  function resolve(fromFile: string, spec: string): string | null {
    let base: string | null = null;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
    if (base === null) return null;
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.json`, join(base, "index.ts")];
    return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
  }

  it("no module reachable from the fees CLI matches a banned pattern (and no bare fetch)", () => {
    const queue = [join(root, "lib", "packs", "fees", "cli.ts")];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable from the fees CLI in ${file}`).toBe(false);
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
        const resolved = resolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    // Sanity: the walk traversed the pack (statement, parser, rules, finding, audit).
    expect(seen.size).toBeGreaterThan(5);
  });
});
