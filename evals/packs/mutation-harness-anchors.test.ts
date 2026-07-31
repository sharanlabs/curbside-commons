/**
 * THE MUTATION HARNESS'S OWN GUARD (2026-07-31).
 *
 * `docs/quality/mutate.py` measures whether the suite's guards can fail. It
 * does that by finding ten exact strings in shipping source and replacing them.
 * Those strings are line-level couplings to code the harness does not own.
 *
 * WHEN THE ENGINE CHANGES, THEY STOP MATCHING — AND THE HARNESS GOES QUIET.
 * It reports `UNAPPLIED` for the mutant it could not place and carries on
 * scoring the rest, so a run can report "10/10, 100%" while silently measuring
 * six. That is a measurement tool that stops measuring without saying so, which
 * is the same defect class this session's mutation pass was written to find:
 *   - session 35: a scorer took its denominator from the observations, so a case
 *     absent from every rep never counted and 19/19 read as COMPLETE.
 *   - session 38: a door test filtered on one phrase over 3 of 6 routes and
 *     would not have caught the defect it was written for.
 *
 * The harness inherited the shape it exists to detect. This file closes that:
 * every anchor must still appear EXACTLY ONCE in the file it targets. If an
 * anchor rots, this goes red in the normal suite — seconds, not the ~10 full
 * suite runs the harness itself costs — and names the mutant to re-derive.
 *
 * This does NOT run the mutation pass (that is deliberate: it is a periodic
 * deep check, not a per-commit gate). It guarantees the pass is still *able*
 * to run honestly when someone does run it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = process.cwd();
const HARNESS = "docs/quality/mutate.py";

/**
 * Parsed from the harness rather than duplicated here. A hand-copied list would
 * be a second place to update, and the two would drift — which is exactly the
 * failure F-1 came from (`FileDrop` holding its own copy of the size cap).
 */
function anchorsFromHarness(): ReadonlyArray<{ id: string; file: string; old: string }> {
  const src = readFileSync(join(REPO, HARNESS), "utf8");
  const block = src.slice(src.indexOf("MUTANTS = ["), src.indexOf("\n]", src.indexOf("MUTANTS = [")));

  // Each entry: ("Mxx", "path", "desc", "old", "new") -- python string literals,
  // possibly implicitly concatenated across lines.
  const out: Array<{ id: string; file: string; old: string }> = [];
  const entry = /\("(M\d+)",\s*"([^"]+)",\s*((?:[^()]|\([^)]*\))*?)\),/gs;
  let m: RegExpExecArray | null;
  while ((m = entry.exec(block)) !== null) {
    const [, id, file, rest] = m;
    // Pull the string literals in `rest`; the mutant's `old` is the 2nd group
    // (after the description), assembled from any implicit concatenation.
    const groups = splitTopLevelArgs(rest);
    if (groups.length < 2) continue;
    out.push({ id, file, old: pyLiteral(groups[1]) });
  }
  return out;
}

/** Split on commas that are not inside a string literal. */
function splitTopLevelArgs(s: string): string[] {
  const args: string[] = [];
  let cur = "";
  let inStr: string | null = null;
  let esc = false;
  for (const ch of s) {
    if (inStr) {
      cur += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === ",") {
      args.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

/**
 * Evaluate python string literals: both quote styles, r-prefixes, and implicit
 * concatenation across lines.
 *
 * Single quotes are not optional here. Three of the ten anchors are written
 * `'...has an unknown `stock`...'` precisely BECAUSE they contain double quotes
 * — a double-quote-only parser silently returns "" for them, and an empty
 * anchor matches nothing, which would have reported the engine as changed when
 * it had not. (It did, on the first run of this file.)
 */
function pyLiteral(src: string): string {
  let out = "";
  const lit = /(r?)("|')((?:[^\\]|\\.)*?)\2/gs;
  let m: RegExpExecArray | null;
  while ((m = lit.exec(src)) !== null) {
    const [, raw, quote, body] = m;
    out += raw
      ? body
      : body
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(new RegExp(`\\\\${quote}`, "g"), quote)
          .replace(/\\\\/g, "\\");
  }
  return out;
}

describe("mutation harness anchors still bind to the engine", () => {
  const anchors = anchorsFromHarness();

  it("parses all ten mutants out of the harness", () => {
    // If this drops, the parser above broke and every check below would pass
    // vacuously over an empty list -- a green that means nothing.
    expect(
      anchors.length,
      `Parsed ${anchors.length} mutants from ${HARNESS}, expected 10. Either the ` +
        `harness changed shape or this parser broke. A vacuous pass over an empty ` +
        `list is worse than a failure.`,
    ).toBe(10);
  });

  it.each(anchors.map((a) => [a.id, a.file, a.old] as const))(
    "%s still matches exactly one site in %s",
    (id, file, old) => {
      const src = readFileSync(join(REPO, file), "utf8");
      const count = src.split(old).length - 1;

      expect(
        count,
        `Mutant ${id} anchors to a string that now appears ${count} time(s) in ${file}, ` +
          `not once.\n\n` +
          (count === 0
            ? `The code it targets has changed, so ${id} would report UNAPPLIED and the ` +
              `harness would score the remaining mutants as if the set were complete — ` +
              `a measurement tool that quietly stops measuring.`
            : `The anchor is ambiguous, so ${id} could mutate the wrong site and report a ` +
              `verdict about code it did not test.`) +
          `\n\nRe-derive ${id} against the current source in ${HARNESS}. Do not delete it: ` +
          `a shrinking mutant set raises the score without improving the tests.`,
      ).toBe(1);
    },
  );
});
