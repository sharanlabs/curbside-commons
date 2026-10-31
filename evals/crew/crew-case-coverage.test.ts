/**
 * CREW-CASE COVERAGE (W3-a CP1; plan-wave3 § 2a bullet 1). Folder-driven: every
 * scenario folder under `fixtures/scenarios/` that holds a `manifest.json` must
 * have at least one crew case whose `inputArtifact.path` lies inside it, in a
 * case directory that a replay suite actually globs. Nothing here is a
 * hand-listed count: the folders are read from disk, the cases are read from
 * disk, and the replay suites are read as source.
 *
 *  - SCENARIOS: every directory of `fixtures/scenarios/` with a `manifest.json`.
 *  - CASES: every `*.case.json` under the two scenario case directories
 *    (`evals/crew/cases-s2/`, `evals/crew/cases-s3/`). The A2 split
 *    (`evals/crew/cases/`) and the exposed L-1 split (`cases-live/`) read the
 *    bundled corpus, not a scenario folder, and are pinned by their own locks.
 *  - REPLAY GLOB: a `*.ts` file under `evals/crew/` that reads a directory with
 *    `readdirSync(<DIR>).filter((f) => f.endsWith(".case.json"))`, where `<DIR>`
 *    is declared in the same file as `join(<root>, "evals", "crew", "<dir>")`,
 *    and that runs the loaded cases through `runCase(`. A test file qualifies
 *    on its own; a harness module qualifies when a `*.test.ts` under
 *    `evals/crew/` imports it.
 *  - INVERSE: no case points at a scenario folder that does not exist (or at
 *    a file that does not exist, or outside `fixtures/scenarios/`).
 *
 * ── Mutation record (2026-10-31; each red observed, then restored) ──
 *  M0 the natural red, before the two W3-a cases existed → 2 failed / 9 passed,
 *     naming exactly `modifier-drift` and `spec-valid-lie`.
 *  M1 the glob filter in `evals/crew/harness-s2.ts` changed to
 *     `.endsWith(".case.jsonx")` (working tree only) → 8 failed / 3 passed
 *     (the directory-globbed test; agent-86, fee-precheck, partner-onboarding,
 *     platform-override, sync-outage lose their only replaying directory; plus
 *     the natural two), restored with `git checkout -- evals/crew/harness-s2.ts`
 *     → back to M0.
 *  M2 a stray case `zz-mutation.case.json` written into `evals/crew/cases-s3/`
 *     with `inputArtifact.path` = `fixtures/scenarios/no-such-folder/inputs/feed.json`
 *     → 3 failed / 8 passed (the INVERSE test red, naming the stray case and
 *     its folder, plus the natural two); file deleted → back to M0.
 *
 * Plain: the site says eight scenarios are built. This test opens the scenario
 * shelf itself and checks that each one has a crew practice run that a replay
 * test really plays, so the claim can never quietly go stale; it also checks
 * that no practice run points at a scenario that is not on the shelf.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CREW = join(ROOT, "evals", "crew");
const SCENARIOS_REL = "fixtures/scenarios";

/** The scenario case directories (repo-relative). */
const SCENARIO_CASE_DIRS = ["evals/crew/cases-s2", "evals/crew/cases-s3"] as const;

/** Every scenario folder holding a manifest.json, read from disk. */
const scenarioIds: readonly string[] = readdirSync(join(ROOT, SCENARIOS_REL), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, SCENARIOS_REL, d.name, "manifest.json")))
  .map((d) => d.name)
  .sort();

interface CaseRef {
  readonly dir: string;
  readonly file: string;
  readonly caseId: string;
  readonly artifactPath: string;
}

/** Every case under the scenario case directories, read from disk. */
const caseRefs: readonly CaseRef[] = SCENARIO_CASE_DIRS.flatMap((dir) =>
  readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith(".case.json"))
    .sort()
    .map((file) => {
      const raw = JSON.parse(readFileSync(join(ROOT, dir, file), "utf8")) as { caseId?: unknown; inputArtifact?: { path?: unknown } };
      if (typeof raw.caseId !== "string" || typeof raw.inputArtifact?.path !== "string") {
        throw new Error(`crew-case-coverage: ${dir}/${file} lacks caseId or inputArtifact.path`);
      }
      return { dir, file, caseId: raw.caseId, artifactPath: raw.inputArtifact.path };
    }),
);

/** The scenario folder a repo-relative path lies inside, or null when it lies outside `fixtures/scenarios/<id>/`. */
function scenarioOf(path: string): string | null {
  if (posix.normalize(path) !== path || path.split("/").includes("..")) return null;
  const parts = path.split("/");
  if (parts.length < 4 || `${parts[0]}/${parts[1]}` !== SCENARIOS_REL) return null;
  return parts[2];
}

// ── reading the replay suites as source ──────────────────────────────────────
const crewSources: ReadonlyArray<{ readonly file: string; readonly text: string }> = readdirSync(CREW)
  .filter((f) => f.endsWith(".ts"))
  .sort()
  .map((file) => ({ file, text: readFileSync(join(CREW, file), "utf8") }));

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The case directories (repo-relative) a source globs: `readdirSync(VAR).filter((f) => f.endsWith(".case.json"))`, VAR declared in the same file. */
function globbedDirs(text: string): string[] {
  const out: string[] = [];
  const glob = /readdirSync\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\.filter\(\s*\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>\s*\2\.endsWith\(\s*"\.case\.json"\s*\)\s*\)/g;
  for (const m of text.matchAll(glob)) {
    const decl = new RegExp(`(?:export\\s+)?const\\s+${escapeRe(m[1])}\\s*=\\s*join\\(\\s*[^,()]+(?:\\(\\))?\\s*,\\s*"evals"\\s*,\\s*"crew"\\s*,\\s*"([\\w-]+)"\\s*\\)`).exec(text);
    if (decl !== null) out.push(`evals/crew/${decl[1]}`);
  }
  return out;
}

const runsCases = (text: string): boolean => /\brunCase\(/.test(text);

/** Case directory → the replay suites that glob it (a test file directly, or "<test> via <harness>"). */
const replayGlobs: ReadonlyMap<string, readonly string[]> = (() => {
  const map = new Map<string, string[]>();
  const add = (dir: string, suite: string): void => {
    map.set(dir, [...(map.get(dir) ?? []), suite]);
  };
  const tests = crewSources.filter((s) => s.file.endsWith(".test.ts"));
  for (const src of crewSources) {
    const dirs = globbedDirs(src.text);
    if (dirs.length === 0 || !runsCases(src.text)) continue;
    if (src.file.endsWith(".test.ts")) {
      for (const d of dirs) add(d, src.file);
      continue;
    }
    const importer = new RegExp(`from\\s+"\\./${escapeRe(src.file)}"`);
    for (const t of tests.filter((t) => importer.test(t.text))) for (const d of dirs) add(d, `${t.file} via ${src.file}`);
  }
  return map;
})();

describe("crew-case coverage — every scenario folder has a replaying crew case", () => {
  it("discovers scenario folders and scenario cases on disk (never an empty pass)", () => {
    expect(scenarioIds.length).toBeGreaterThan(0);
    expect(caseRefs.length).toBeGreaterThan(0);
  });

  it("every scenario case directory is globbed by a replay suite that runs its cases", () => {
    for (const dir of SCENARIO_CASE_DIRS) {
      expect(replayGlobs.get(dir)?.length ?? 0, `${dir} is globbed by no replay suite`).toBeGreaterThan(0);
    }
  });

  for (const id of scenarioIds) {
    it(`${id}: at least one crew case reads an artifact inside fixtures/scenarios/${id}/, in a replay-globbed directory`, () => {
      const covering = caseRefs.filter((c) => scenarioOf(c.artifactPath) === id && (replayGlobs.get(c.dir)?.length ?? 0) > 0);
      expect(
        covering.map((c) => `${c.dir}/${c.file}`),
        `no replaying crew case reads an artifact inside fixtures/scenarios/${id}/`,
      ).not.toHaveLength(0);
    });
  }

  it("INVERSE: no case points at a scenario folder (or file) that does not exist", () => {
    const known = new Set(scenarioIds);
    const bad = caseRefs
      .filter((c) => {
        const id = scenarioOf(c.artifactPath);
        return id === null || !known.has(id) || !existsSync(join(ROOT, c.artifactPath));
      })
      .map((c) => `${c.dir}/${c.file} → ${c.artifactPath}`);
    expect(bad).toStrictEqual([]);
  });
});
