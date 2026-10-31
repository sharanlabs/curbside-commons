import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * cli-experience (Wave 2 lane 7): `check.mjs scenario` exercised as a real child
 * process. Mutation proofs (2026-10-31, each reverted):
 *  - scenario.ts `goldenMatch: serialized === golden` -> `true`: the one-byte-change test RED.
 *  - scenario.ts `figures: manifest.figures` -> `{}`: the figures-equal test RED.
 *  - scenario.ts directory filter pinned to one id: the --list and every-scenario tests RED.
 *  - scenario.ts gains `import "node:https"`: the lib/cli egress-tooth test RED.
 */

const root = process.cwd();
const cli = join(root, "bin", "check.mjs");
const scenarios = join(root, "fixtures", "scenarios");

interface RunResult {
  readonly status: number;
  readonly stdout: string;
}
function runCli(args: readonly string[]): RunResult {
  try {
    return { status: 0, stdout: execFileSync(process.execPath, [cli, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    return { status: e.status ?? -1, stdout: e.stdout ?? "" };
  }
}

const present = readdirSync(scenarios, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(scenarios, d.name, "manifest.json")))
  .map((d) => d.name)
  .sort();

describe("scenario CLI (real process)", () => {
  it("--list enumerates exactly the folders present", () => {
    const r = runCli(["scenario", "--list", "--json"]);
    expect(r.status).toBe(0);
    const rows = JSON.parse(r.stdout) as { id: string; title: string }[];
    expect(rows.map((x) => x.id).sort()).toEqual(present);
    expect(present.length).toBeGreaterThanOrEqual(5);
    for (const row of rows) expect(row.title.length).toBeGreaterThan(0);
    const text = runCli(["scenario", "--list"]);
    for (const id of present) expect(text.stdout).toContain(id);
  }, 60000);

  it("every present scenario exits 0 and --json figures equal the manifest", () => {
    for (const id of present) {
      const r = runCli(["scenario", id, "--json"]);
      expect(r.status, id).toBe(0);
      const run = JSON.parse(r.stdout) as { id: string; goldenMatch: boolean; figures: unknown };
      const manifest = JSON.parse(readFileSync(join(scenarios, id, "manifest.json"), "utf8")) as { figures: unknown };
      expect(run.id).toBe(id);
      expect(run.goldenMatch).toBe(true);
      expect(run.figures).toEqual(manifest.figures);
      expect(Object.keys(run.figures as object).length).toBeGreaterThan(0);
      const text = runCli(["scenario", id]);
      expect(text.stdout).toContain("matches the committed expectation");
    }
  }, 120000);

  it("a one-byte change to expected/report.json exits 1 and says DIFFERS", () => {
    const tmp = mkdtempSync(join(tmpdir(), "scn-"));
    try {
      const id = present[0];
      cpSync(join(scenarios, id), join(tmp, "fixtures", "scenarios", id), { recursive: true });
      const golden = join(tmp, "fixtures", "scenarios", id, "expected", "report.json");
      writeFileSync(golden, `${readFileSync(golden, "utf8")} `);
      const r = runCli(["scenario", id, "--root", tmp]);
      expect(r.status).toBe(1);
      expect(r.stdout).toContain("DIFFERS from the committed expectation");
      expect(JSON.parse(runCli(["scenario", id, "--root", tmp, "--json"]).stdout).goldenMatch).toBe(false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 60000);

  it("exit 2 on an unknown id, bad flag, missing id, and a missing input", () => {
    expect(runCli(["scenario", "no-such-scenario"]).status).toBe(2);
    expect(runCli(["scenario", "../package"]).status).toBe(2);
    expect(runCli(["scenario"]).status).toBe(2);
    expect(runCli(["scenario", present[0], "--bogus"]).status).toBe(2);
    const tmp = mkdtempSync(join(tmpdir(), "scn-"));
    try {
      const id = present[0];
      cpSync(join(scenarios, id), join(tmp, "fixtures", "scenarios", id), { recursive: true });
      rmSync(join(tmp, "fixtures", "scenarios", id, "expected"), { recursive: true });
      expect(runCli(["scenario", id, "--root", tmp]).status).toBe(2);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 60000);

  it("usage lists the new verbs", () => {
    const r = runCli(["help"]);
    expect(r.stdout).toContain("scenario <id>");
    expect(r.stdout).toContain("ledger verify <file>");
  }, 60000);
});

describe("lib/cli egress tooth: no network or model module reachable", () => {
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
  it("walks lib/cli/** transitively", () => {
    const queue = readdirSync(join(root, "lib", "cli")).filter((f) => f.endsWith(".ts")).map((f) => join(root, "lib", "cli", f));
    expect(queue.length).toBeGreaterThanOrEqual(2);
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
      for (const spec of importsOf(file)) {
        for (const pattern of banned) expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        const resolved = resolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    expect(seen.size).toBeGreaterThan(8);
  });
});
