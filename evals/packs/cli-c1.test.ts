import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * C1 — the one-command validator, exercised as a real child process: exit 0 on
 * a clean copy, non-zero (1) on any drift, 2 on usage errors; zero-config on
 * the shipped fixtures; output is the machine-readable report (byte-equal to
 * the golden). The $0-LLM property is enforced STRUCTURALLY: a transitive
 * import-graph scan proves the CLI path can never reach an LLM/provider/network
 * module (stronger than a runtime cost assertion, which only covers executed
 * branches).
 */

const root = process.cwd();
const fixtures = join(root, "fixtures", "synthetic-restaurant");
const cli = join(root, "bin", "check.mjs");

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

describe("C1 one-command validator (real process)", () => {
  it("exit 0 + empty findings on the faithful fixture (zero-config)", () => {
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.faithful.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
    ]);
    expect(r.status).toBe(0);
    const report = JSON.parse(r.stdout) as { ok: boolean; findings: unknown[] };
    expect(report.ok).toBe(true);
    expect(report.findings).toHaveLength(0);
  });

  it("exit non-zero (1) on the drifted fixture, output = the golden report", () => {
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
    ]);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe(readFileSync(join(fixtures, "expected-report.acp.json"), "utf8"));
  });

  it("ucp surface: exit 1 on the drifted catalog response, golden byte-equal", () => {
    const r = runCli([
      "check",
      join(fixtures, "ucp-catalog-response.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
      "--surface",
      "ucp",
    ]);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe(readFileSync(join(fixtures, "expected-report.ucp.json"), "utf8"));
  });

  it("exit 2 on usage errors (unknown command, missing --against, bad surface)", () => {
    expect(runCli(["frobnicate"]).status).toBe(2);
    expect(runCli(["check", "feed.json"]).status).toBe(2);
    expect(
      runCli(["check", "a.json", "--against", "b.json", "--surface", "carrier-pigeon"]).status,
    ).toBe(2);
  });
});

describe("C1 $0-LLM: structural import-graph proof", () => {
  // Modules that must be unreachable from the CLI path (LLM providers, cost
  // ledger for live calls, HTTP clients). Path fragments + specifier patterns.
  const banned = [
    /lib\/agents\//,
    /@ai-sdk/,
    /^ai$|\/ai\//,
    /node:https?/,
    /undici/,
    /groq|gemini/i,
  ];

  function importsOf(file: string): string[] {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    const re = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g;
    for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
    return specs;
  }

  function resolveRelative(fromFile: string, spec: string): string | null {
    if (!spec.startsWith(".")) return null;
    return join(fromFile, "..", spec);
  }

  it("no module reachable from bin/check.mjs matches a banned pattern", () => {
    const queue = [cli];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
        const resolved = resolveRelative(file, spec);
        if (resolved !== null && (resolved.endsWith(".ts") || resolved.endsWith(".mjs"))) {
          queue.push(resolved);
        }
      }
    }
    // Sanity: the walk actually traversed the engine + pack, not just the entry.
    expect(seen.size).toBeGreaterThan(10);
  });
});
