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
  }, 60000);

  it("exit non-zero (1) on the drifted fixture, output = the golden report", () => {
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
    ]);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe(readFileSync(join(fixtures, "expected-report.acp.json"), "utf8"));
  }, 60000);

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
  }, 60000);

  it("exit 2 on usage errors (unknown command, missing --against, bad surface)", () => {
    expect(runCli(["frobnicate"]).status).toBe(2);
    expect(runCli(["check", "feed.json"]).status).toBe(2);
    expect(
      runCli(["check", "a.json", "--against", "b.json", "--surface", "carrier-pigeon"]).status,
    ).toBe(2);
  }, 60000);

  it("exit 2 on MIXED MODE — --conformance with --against/--surface must refuse, never silently skip the truth leg (M1 P1)", () => {
    // The M1 Codex P1: `--conformance` won over `--against`, so a user asking
    // for BOTH checks got conformance only — and the headline exhibit is
    // exactly a doc that passes conformance while lying vs the SOR. Mixed mode
    // must exit 2, not silently answer half the question.
    const ucpDir = join(root, "fixtures", "ucp-conformance-ci");
    const mixed = runCli([
      "check",
      join(ucpDir, "valid", "conformant-but-false.json"),
      "--conformance",
      "--against",
      join(fixtures, "sor.catalog.json"),
    ]);
    expect(mixed.status).toBe(2);
    const mixedSurface = runCli([
      "check",
      join(ucpDir, "valid", "conformant-but-false.json"),
      "--conformance",
      "--surface",
      "ucp",
    ]);
    expect(mixedSurface.status).toBe(2);
  }, 60000);

  it("exit 2 on SURPLUS positional arguments — extra file args must not be silently ignored (M1 P3)", () => {
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.faithful.json"),
      join(fixtures, "acp-feed.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
    ]);
    expect(r.status).toBe(2);
  }, 60000);

  it("exit 2 on an UNKNOWN flag — a typo must fail loudly, never silently use a default (W3)", () => {
    // Regression-locks the documented flag surface being REAL: before this,
    // any unrecognized flag (e.g. a --json typo) was silently ignored and the
    // run proceeded on defaults — poison for CI.
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.faithful.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
      "--jsn",
    ]);
    expect(r.status).toBe(2);
  }, 60000);
});

describe("C1 conformance leg — UCP schema validation (real process, W2)", () => {
  const ucp = join(root, "fixtures", "ucp-conformance-ci");

  it("exit 0 on a conformant catalog-response document", () => {
    const r = runCli(["check", join(ucp, "valid", "search-full-catalog.json"), "--conformance"]);
    expect(r.status).toBe(0);
    const report = JSON.parse(r.stdout) as { ok: boolean; specVersion: string };
    expect(report.ok).toBe(true);
    expect(report.specVersion).toContain("2026-04-08");
  }, 60000);

  it("exit 1 (non-zero) on a schema-violating document, findings in the LST-CONF-* family", () => {
    const r = runCli(["check", join(ucp, "invalid", "pattern-currency-lowercase.json"), "--conformance"]);
    expect(r.status).toBe(1);
    const report = JSON.parse(r.stdout) as { ok: boolean; findings: { ruleId: string }[] };
    expect(report.ok).toBe(false);
    expect(report.findings.every((f) => f.ruleId.startsWith("LST-CONF-"))).toBe(true);
  }, 60000);

  it("HEADLINE: the conformant-but-false doc PASSES conformance (exit 0) — still a lie", () => {
    const r = runCli(["check", join(ucp, "valid", "conformant-but-false.json"), "--conformance"]);
    expect(r.status).toBe(0);
  }, 60000);

  it("exit 2 on a bad --op", () => {
    expect(runCli(["check", "x.json", "--conformance", "--op", "bogus"]).status).toBe(2);
  }, 60000);
});

describe("C1 machine-JSON leg — --json alias + C10 header surface (W3)", () => {
  const ucp = join(root, "fixtures", "ucp-conformance-ci");

  it("--json emits the canonical report: byte-equal to the frozen golden, exit unchanged", () => {
    // Single spawn (cold Node TS-strip is slow) — comparing to the LOCKED golden
    // both proves the --json alias is byte-identical to the default (which the
    // default-vs-golden test above already pins) and that the goldens stay locked.
    const json = runCli([
      "check",
      join(fixtures, "acp-feed.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
      "--json",
    ]);
    expect(json.status).toBe(1);
    expect(json.stdout).toBe(readFileSync(join(fixtures, "expected-report.acp.json"), "utf8"));
  }, 60000);

  it("the truth-leg JSON always carries the C10 header surface", () => {
    const r = runCli([
      "check",
      join(fixtures, "acp-feed.drifted.json"),
      "--against",
      join(fixtures, "sor.catalog.json"),
      "--json",
    ]);
    const report = JSON.parse(r.stdout) as {
      specVersion: string;
      matchingMode: string;
      simulated: boolean;
    };
    expect(report.specVersion).toContain("ucp-pin-2026-04-08");
    expect(["synthetic-controlled", "real-world"]).toContain(report.matchingMode);
    expect(report.simulated).toBe(true);
  }, 60000);

  it("the conformance-leg JSON also carries the C10 header surface", () => {
    const r = runCli([
      "check",
      join(ucp, "valid", "search-full-catalog.json"),
      "--conformance",
      "--json",
    ]);
    expect(r.status).toBe(0);
    const report = JSON.parse(r.stdout) as {
      specVersion: string;
      matchingMode: string;
      simulated: boolean;
    };
    expect(report.specVersion).toContain("2026-04-08");
    expect(["synthetic-controlled", "real-world"]).toContain(report.matchingMode);
    expect(report.simulated).toBe(true);
  }, 60000);
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
    // `... from "x"`, dynamic `import("x")`, and bare side-effect `import "x"`.
    const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
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

  it("no reachable source performs a bare fetch() (P3-5: source-text network scan)", () => {
    // The import-graph ban is module-level; this complements it by scanning the
    // SOURCE of every reachable file for a bare `fetch(` call (the built-in HTTP
    // client). `.fetch(`/`prefetch(` are allowed by requiring a non-word, non-dot
    // char before `fetch`.
    const queue = [cli];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      let text: string;
      try {
        text = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable from the CLI in ${file}`).toBe(false);
      for (const spec of importsOf(file)) {
        const resolved = resolveRelative(file, spec);
        if (resolved !== null && (resolved.endsWith(".ts") || resolved.endsWith(".mjs"))) {
          queue.push(resolved);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
