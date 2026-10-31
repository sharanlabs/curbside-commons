/**
 * STAMP CASE DIGESTS (S2-crew CP1) — writes each replay case's manifest digest
 * (`lib/crew/manifest.ts`) into the case JSON (`manifestDigest`, right after
 * `caseId`) and into that case's entry in the sibling `recorded-turns.json`
 * (first key), so a recorded turn carries the digest it was recorded under.
 *
 * Idempotent: a second run writes byte-identical files. It refuses to rewrite
 * a file it cannot round-trip exactly (so a stamp can never smuggle a
 * reformat), and it never touches anything but the `manifestDigest` key.
 * `recorded-turns.json` keeps its `\uXXXX` escapes (ASCII serializer, verified
 * to round-trip the committed file byte-for-byte before the first stamp).
 *
 * Run: node --experimental-strip-types scripts-ts/stamp-case-digests.mts
 * Check only (exit 1 when anything would change):
 *      node --experimental-strip-types scripts-ts/stamp-case-digests.mts --check
 *
 * Re-run it whenever a lane regenerates a fixture a stamped case reads — the
 * digest binds the artifact BYTES, so a regenerated fixture un-binds every
 * recorded turn that read it (that is the point).
 *
 * Plain: this puts the fingerprint of each test question onto the question and
 * onto its saved answer, so a later change to either is caught.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { caseManifestDigest } from "../lib/crew/manifest.ts";
import type { CrewCase } from "../lib/crew/types.ts";

/** The replay case directories that carry recorded turns (the frozen L-1 split is NOT stamped: its turns are a live run's provenance). */
export const STAMPED_CASE_DIRS = ["evals/crew/cases", "evals/crew/cases-s2"] as const;

type Mode = "plain" | "ascii";

const asciiEscape = (s: string): string =>
  s.replace(/[\u007f-￿]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);

function serialize(value: unknown, mode: Mode): string {
  const text = JSON.stringify(value, null, 2);
  return `${mode === "ascii" ? asciiEscape(text) : text}\n`;
}

/** Which serializer round-trips this file exactly — or throw (never reformat a file silently). */
function modeOf(path: string, text: string): Mode {
  const parsed: unknown = JSON.parse(text);
  if (serialize(parsed, "plain") === text) return "plain";
  if (serialize(parsed, "ascii") === text) return "ascii";
  throw new Error(`stamp-case-digests: ${path} does not round-trip under either serializer — refusing to rewrite it`);
}

/** Return `obj` with `key: value` placed right after `afterKey` (or first when afterKey is null), replacing any existing `key`. */
function withKey(obj: Record<string, unknown>, key: string, value: unknown, afterKey: string | null): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (afterKey === null) out[key] = value;
  for (const [k, v] of Object.entries(obj)) {
    if (k === key) continue;
    out[k] = v;
    if (k === afterKey) out[key] = value;
  }
  return out;
}

export interface PlannedWrite {
  readonly path: string;
  readonly content: string;
}

/** Compute every file's stamped content (no writes). `root` defaults to the cwd. */
export function planStamps(root: string = process.cwd()): PlannedWrite[] {
  const writes: PlannedWrite[] = [];
  for (const rel of STAMPED_CASE_DIRS) {
    const dir = join(root, rel);
    const turnsPath = join(dir, "recorded-turns.json");
    if (!existsSync(turnsPath)) continue;
    const turnsText = readFileSync(turnsPath, "utf8");
    const turnsMode = modeOf(turnsPath, turnsText);
    let turns = JSON.parse(turnsText) as Record<string, Record<string, unknown>>;
    const seen = new Set<string>();
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".case.json")).sort()) {
      const path = join(dir, file);
      const text = readFileSync(path, "utf8");
      const mode = modeOf(path, text);
      const raw = JSON.parse(text) as Record<string, unknown>;
      const crewCase = raw as unknown as CrewCase;
      const digest = caseManifestDigest(crewCase);
      writes.push({ path, content: serialize(withKey(raw, "manifestDigest", digest, "caseId"), mode) });
      const entry = turns[crewCase.caseId];
      if (entry === undefined) {
        throw new Error(`stamp-case-digests: ${crewCase.caseId} has no entry in ${turnsPath} — record its turns first`);
      }
      turns = { ...turns, [crewCase.caseId]: withKey(entry, "manifestDigest", digest, null) };
      seen.add(crewCase.caseId);
    }
    for (const caseId of Object.keys(turns)) {
      if (!seen.has(caseId)) throw new Error(`stamp-case-digests: ${turnsPath} carries turns for "${caseId}" but no such case exists`);
    }
    writes.push({ path: turnsPath, content: serialize(turns, turnsMode) });
  }
  return writes;
}

function main(): void {
  const check = process.argv.includes("--check");
  let changed = 0;
  for (const w of planStamps()) {
    if (readFileSync(w.path, "utf8") === w.content) continue;
    changed += 1;
    if (check) console.log(`would change: ${w.path}`);
    else writeFileSync(w.path, w.content);
  }
  console.log(check ? `${changed} file(s) out of date` : `${changed} file(s) stamped`);
  if (check && changed > 0) process.exitCode = 1;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) main();
