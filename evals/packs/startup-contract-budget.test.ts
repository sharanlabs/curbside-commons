/**
 * STARTUP-CONTRACT BUDGET (added 2026-07-31, session 40).
 *
 * `AGENTS.md`:7 and `RULES.md` §15 order EVERY agent — Codex reviewers included
 * — to read five docs before doing anything. By 2026-07-30 those five totalled
 * **1.31 MB**, and three cross-model gate runs died on it (sessions 34, 36, 38);
 * the last burned 20+ minutes at `xhigh` and returned a log containing only the
 * echoed prompt. Session 40 archived the closed history out, taking the list to
 * ~89 KB.
 *
 * THIS FILE EXISTS BECAUSE THAT CLEANUP, ON ITS OWN, GUARANTEES NOTHING.
 * The docs reached 1.31 MB by accretion — every session appending its wrap note
 * to the file the next session must read — and nothing stopped it. A one-time
 * tidy with no guard just restarts the same climb. So the budget is asserted
 * rather than intended.
 *
 * It also removes a defect this test's own author hit twice in one session:
 * writing a measured byte-count into `AGENTS.md` prose, then invalidating it by
 * writing more prose. A number maintained by hand in a document that grows is
 * wrong by construction. `AGENTS.md` now states the BUDGET, which is stable, and
 * this file is what makes the budget true.
 *
 * ON THE LIMIT: 250 KB is ~2.8x current headroom, so ordinary session wrap notes
 * do not trip it — this is a runaway brake, not a style rule. If it fails, the
 * fix is to ARCHIVE closed sessions (see `docs/archive/2026-07-31-state-docs/`),
 * not to raise the number. Raising it is the decision that produced 1.31 MB.
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = process.cwd();

/** The read list exactly as `AGENTS.md`:7 / `RULES.md` §15 enumerate it. */
const STARTUP_DOCS = [
  "RULES.md",
  "PROJECT_STATE.md",
  "CURRENT_TASK.md",
  "HANDOFF.md",
  "docs/task-log.md",
] as const;

const BUDGET_BYTES = 250_000;

/**
 * The other two `RULES.md` §10 recording surfaces. They are NOT in the
 * `AGENTS.md`:7 startup list, so they never contributed to the three dead gate
 * runs — but they were on the same trajectory (`decision-log.md` had reached
 * 373 KB, `implementation-journal.md` 147 KB) and were archived in the same
 * pass. Tidying them without a guard would leave them climbing again, which is
 * the mistake this whole file exists to stop repeating.
 *
 * The limit is deliberately LOOSER than the startup budget: nothing is forced
 * to read these to begin work, so the cost of growth is lower. It is a runaway
 * brake, not a size preference.
 */
const RECORD_DOCS = [
  "docs/decision-log.md",
  "docs/implementation-journal.md",
] as const;

const RECORD_BUDGET_BYTES = 400_000;

/** Pre-archive measurement, kept so the failure message can show the stakes. */
const PRE_ARCHIVE_BYTES = 1_310_000;

function sizeOf(rel: string): number {
  return statSync(join(REPO, rel)).size;
}

describe("startup-contract budget", () => {
  it("the five docs every agent must read stay under the budget", () => {
    const sizes = STARTUP_DOCS.map((d) => [d, sizeOf(d)] as const);
    const total = sizes.reduce((n, [, s]) => n + s, 0);

    const breakdown = sizes
      .sort((a, b) => b[1] - a[1])
      .map(([d, s]) => `    ${d.padEnd(22)} ${s.toLocaleString()} B`)
      .join("\n");

    expect(
      total,
      `The AGENTS.md:7 startup read list is ${total.toLocaleString()} B, over the ` +
        `${BUDGET_BYTES.toLocaleString()} B budget.\n\n${breakdown}\n\n` +
        `This list reached ${PRE_ARCHIVE_BYTES.toLocaleString()} B once and killed three ` +
        `cross-model gate runs (sessions 34, 36, 38). The fix is to archive closed ` +
        `sessions into docs/archive/, the way session 40 did — NOT to raise this ` +
        `budget. Raising it is the decision that produced 1.31 MB.`,
    ).toBeLessThan(BUDGET_BYTES);
  });

  it("AGENTS.md states the budget rather than a hand-maintained measurement", () => {
    const agents = readFileSync(join(REPO, "AGENTS.md"), "utf8");

    // A literal byte/KB measurement in the prose goes stale the moment anyone
    // appends to any of the five docs -- including whoever wrote the number.
    // The instruction must cite the enforced budget instead.
    expect(
      /250\s*KB/i.test(agents),
      "AGENTS.md no longer cites the 250 KB budget for the step-1 read list.\n" +
        "Do NOT fix this by writing the current measured size into the prose — that " +
        "was the original defect, and it goes stale the moment anyone appends to any " +
        "of the five docs (it went stale twice in the session that added this test). " +
        "Cite the BUDGET, which is stable, and let this file enforce it.",
    ).toBe(true);

    expect(
      /startup-contract-budget/.test(agents),
      "AGENTS.md no longer points at evals/packs/startup-contract-budget.test.ts.\n" +
        "A reader must be able to see that the size claim is enforced rather than " +
        "asserted — an unreferenced guard reads as a promise. Restore the reference, " +
        "or delete this test too and stop claiming the list is bounded.",
    ).toBe(true);
  });

  it("the other RULES §10 recording surfaces stay under their own budget", () => {
    const sizes = RECORD_DOCS.map((d) => [d, sizeOf(d)] as const);
    const total = sizes.reduce((n, [, s]) => n + s, 0);

    const breakdown = sizes
      .map(([d, s]) => `    ${d.padEnd(34)} ${s.toLocaleString()} B`)
      .join("\n");

    expect(
      total,
      `The RULES.md §10 recording surfaces total ${total.toLocaleString()} B, over the ` +
        `${RECORD_BUDGET_BYTES.toLocaleString()} B budget.\n\n${breakdown}\n\n` +
        `These are not in the AGENTS.md:7 startup list, so this is not urgent the way ` +
        `the startup budget is — but they reached 520,000 B by the same accretion, and ` +
        `the fix is the same: archive closed entries into docs/archive/ BY DATE (both ` +
        `files are appended out of chronological order, so a positional cut mis-sorts ` +
        `them). Do not raise this number.`,
    ).toBeLessThan(RECORD_BUDGET_BYTES);
  });

  it("the read list fits a reviewer's context window — the thing that actually broke", () => {
    /**
     * Bytes were always a proxy. What killed sessions 34, 36 and 38 was
     * CONTEXT: a reviewer ordered to read the startup contract before doing
     * anything could not fit it in a context window at all.
     *
     * Measured at `858fb17` (the commit before the archive), the five docs came
     * to **~312,000 tokens** — 156% of a 200k window. Session 38's log
     * estimated "~140k"; the real figure was 2.2x that. That is why the run
     * returned a log containing only the echoed prompt: the context was
     * exhausted before any work could begin. It was not slow, it was
     * arithmetically impossible.
     *
     * This asserts the property that makes the gate runnable — the read list
     * plus a scoped diff has to leave most of the window for actual reasoning.
     * ~4 chars/token is the standard English-prose approximation; exactness is
     * not the point when the failure was off by 56 percentage points.
     */
    const CHARS_PER_TOKEN = 4;
    const REVIEWER_BUDGET_TOKENS = 60_000; // ~30% of a 200k window

    const tokens = STARTUP_DOCS.reduce((n, d) => n + sizeOf(d) / CHARS_PER_TOKEN, 0);

    expect(
      Math.round(tokens),
      `The startup read list is ~${Math.round(tokens).toLocaleString()} tokens, over the ` +
        `${REVIEWER_BUDGET_TOKENS.toLocaleString()}-token reviewer budget.\n\n` +
        `This is the measurement that matters more than the byte count. Before ` +
        `2026-07-31 these docs were ~312,000 tokens — 156% of a 200k context ` +
        `window — so a reviewer instructed to read them first could not start at ` +
        `all. Three cross-model gate runs died that way (sessions 34, 36, 38).\n\n` +
        `Archive closed sessions into docs/archive/. Do not raise this budget: a ` +
        `reviewer that spends its window on history has none left for the diff.`,
    ).toBeLessThan(REVIEWER_BUDGET_TOKENS);
  });

  it("the archive it points at exists and is not itself in the read list", () => {
    const archive = "docs/archive/2026-07-31-state-docs";
    expect(statSync(join(REPO, archive)).isDirectory()).toBe(true);
    for (const doc of STARTUP_DOCS) {
      expect(doc.startsWith(archive)).toBe(false);
    }
  });
});
