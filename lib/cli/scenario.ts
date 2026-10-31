/**
 * Scenario verbs for bin/check.mjs: `scenario <id>` and `scenario --list`.
 *
 * Runs one labeled scenario folder (fixtures/scenarios/<id>/) through the SAME
 * public engine entry points scripts-ts/generate-scenarios.mts uses, serializes
 * with the serializer the goldens use, and byte-compares to expected/report.json.
 * A mismatch means the engine or the fixture changed — never this file.
 * Figures a reader sees come from the folder's manifest (derived at generation),
 * never typed here. ZERO model / network calls (import-walk proven by test).
 *
 * Plain: point it at a scenario id; it re-runs the checker on that story's data
 * and tells you whether the answer still matches the one committed with it.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { acpFeedToClaims, runListingsVerification, type AcpFeed, type SyntheticCatalog } from "../packs/listings/index.ts";
import { auditStatement, parseStatement, serializeFeeReport } from "../packs/fees/index.ts";
import { serializeReport } from "../verifier-core/verify.ts";

export interface ScenarioListing {
  readonly id: string;
  readonly number: number;
  readonly pack: string;
  readonly title: string;
}

export interface ScenarioRun {
  readonly id: string;
  readonly pack: string;
  readonly verdict: "PASS" | "FAIL";
  readonly findings: number;
  readonly errors: number;
  readonly warnings: number;
  readonly rowsRead: number | null;
  readonly goldenMatch: boolean;
  readonly figures: Record<string, string | number>;
  readonly enginePin: string;
}

/** Thrown for an unknown id or unreadable input; the bin maps it to exit 2. */
export class ScenarioError extends Error {}

interface Manifest {
  readonly id: string;
  readonly number: number;
  readonly pack: string;
  readonly figures: Record<string, string | number>;
}

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (err) {
    throw new ScenarioError(`cannot read ${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function scenarioDirs(root: string): string[] {
  const base = join(root, "fixtures", "scenarios");
  if (!existsSync(base)) throw new ScenarioError(`no scenario folder at ${base}`);
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(base, d.name, "manifest.json")))
    .map((d) => d.name)
    .sort();
}

function briefTitle(dir: string): string {
  const p = join(dir, "brief.md");
  if (!existsSync(p)) return "";
  const first = readFileSync(p, "utf8")
    .split("\n")
    .find((l) => l.startsWith("# "));
  return first ? first.slice(2).trim() : "";
}

/** Every scenario folder present, ordered by plan number. Never hard-codes ids. */
export function listScenarios(root: string): ScenarioListing[] {
  const out: ScenarioListing[] = [];
  for (const name of scenarioDirs(root)) {
    const dir = join(root, "fixtures", "scenarios", name);
    const m = readJson<Manifest>(join(dir, "manifest.json"));
    out.push({ id: m.id, number: m.number, pack: m.pack, title: briefTitle(dir) });
  }
  return out.sort((a, b) => a.number - b.number);
}

/** Run one scenario through the engine and compare to its committed expectation. */
export function runScenario(root: string, id: string): ScenarioRun {
  if (!/^[a-z0-9-]+$/.test(id) || !scenarioDirs(root).includes(id)) {
    throw new ScenarioError(`unknown scenario "${id}" (try: scenario --list)`);
  }
  const dir = join(root, "fixtures", "scenarios", id);
  const manifest = readJson<Manifest>(join(dir, "manifest.json"));
  const inputs = join(dir, "inputs");
  let serialized: string;
  let verdict: "PASS" | "FAIL";
  let findings: number;
  let errors: number;
  let warnings: number;
  let rowsRead: number | null = null;
  let enginePin: string;

  if (manifest.pack === "listings") {
    const feed = readJson<AcpFeed>(join(inputs, "feed.json"));
    const record = readJson<SyntheticCatalog>(join(inputs, "record.json"));
    if (!Array.isArray(feed.items)) throw new ScenarioError(`${id}: inputs/feed.json is not an ACP feed`);
    const report = runListingsVerification(acpFeedToClaims(feed), record);
    serialized = serializeReport(report);
    verdict = report.ok ? "PASS" : "FAIL";
    findings = report.findings.length;
    errors = report.findings.filter((f) => f.severity === "error").length;
    warnings = report.findings.filter((f) => f.severity === "warn").length;
    rowsRead = feed.items.length;
    enginePin = report.specVersion;
  } else if (manifest.pack === "fees") {
    let report;
    try {
      report = auditStatement(parseStatement(readFileSync(join(inputs, "statement.json"), "utf8")));
    } catch (err) {
      throw new ScenarioError(`${id}: ${err instanceof Error ? err.message : String(err)}`);
    }
    serialized = serializeFeeReport(report);
    verdict = report.ok ? "PASS" : "FAIL";
    findings = report.findings.length;
    errors = report.findings.filter((f) => f.severity === "error").length;
    warnings = report.findings.filter((f) => f.severity === "warn").length;
    enginePin = report.specVersion;
  } else {
    throw new ScenarioError(`${id}: unknown pack "${manifest.pack}"`);
  }

  let golden: string;
  try {
    golden = readFileSync(join(dir, "expected", "report.json"), "utf8");
  } catch (err) {
    throw new ScenarioError(`cannot read expected/report.json for ${id}: ${err instanceof Error ? err.message : String(err)}`);
  }
  return {
    id,
    pack: manifest.pack,
    verdict,
    findings,
    errors,
    warnings,
    rowsRead,
    goldenMatch: serialized === golden,
    figures: manifest.figures,
    enginePin,
  };
}

export function renderScenarioList(list: readonly ScenarioListing[]): string {
  return list.map((s) => `${s.id}  #${s.number}  ${s.pack}  ${s.title}`).join("\n") + "\n";
}

export function renderScenarioRun(r: ScenarioRun): string {
  const lines = [
    `${r.id}  (${r.pack})`,
    `verdict: ${r.verdict === "PASS" ? "PASS (no findings)" : "FAIL (findings present)"}`,
    `tally: ${r.findings} finding(s), ${r.errors} error(s), ${r.warnings} warning(s)${r.rowsRead === null ? "" : `, ${r.rowsRead} row(s) read`}`,
    r.goldenMatch
      ? "matches the committed expectation"
      : "DIFFERS from the committed expectation (regenerate with node scripts-ts/generate-scenarios.mts only if you changed the engine on purpose)",
    "the brief's figures:",
    ...Object.entries(r.figures).map(([k, v]) => `  ${k}: ${v}`),
    `engine: ${r.enginePin}`,
  ];
  return lines.join("\n") + "\n";
}
