/**
 * Guard for `.env.example` (Wave 2, lane ci-hygiene).
 *
 * Plain English: the template a newcomer copies must name every environment variable
 * the code actually reads, and must never carry a value (so a real key can never be
 * committed through it).
 *
 * Mutation proof (recorded 2026-10-31): deleting the `UCP_ORACLE_INSTALL=` line from
 * `.env.example` turned "lists every variable the code reads" red naming
 * UCP_ORACLE_INSTALL; restoring it returned the suite to green. Putting a value after
 * `GROQ_API_KEY=` turned "holds no value" red; restored.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const SKIP = new Set(["node_modules", "legacy", ".next", "out", ".git", ".worktrees"]);
const EXT = /\.(ts|tsx|mts|mjs|js)$/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (EXT.test(name)) acc.push(p);
  }
  return acc;
}

function envVarsRead(): Map<string, string> {
  const found = new Map<string, string>();
  for (const top of ["lib", "app", "bin", "scripts-ts"]) {
    for (const file of walk(join(root, top))) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) {
        if (!found.has(m[1])) found.set(m[1], file);
      }
    }
  }
  return found;
}

const templateLines = readFileSync(join(root, ".env.example"), "utf8").split("\n");
const assignments = templateLines
  .map((l) => /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(l))
  .filter((m): m is RegExpExecArray => m !== null);

describe(".env.example", () => {
  it("lists every variable the code reads", () => {
    const listed = new Set(assignments.map((m) => m[1]));
    const missing = [...envVarsRead()].filter(([name]) => !listed.has(name)).map(([n, f]) => `${n} (read in ${f})`);
    expect(missing).toEqual([]);
  });

  it("finds a non-trivial set of variables (the scan itself is alive)", () => {
    expect(envVarsRead().size).toBeGreaterThanOrEqual(15);
  });

  it("holds no value after any `=` (no secrets in the tracked template)", () => {
    const withValue = assignments.filter((m) => m[2].trim() !== "").map((m) => m[1]);
    expect(withValue).toEqual([]);
  });

  it("carries no key-shaped string anywhere, comments included", () => {
    const text = templateLines.join("\n");
    expect(text).not.toMatch(/gsk_[A-Za-z0-9]{10,}|AIza[0-9A-Za-z_-]{20,}|re_[A-Za-z0-9]{16,}|hooks\.slack\.com\/services\/T[A-Z0-9]{6,}/);
  });
});
