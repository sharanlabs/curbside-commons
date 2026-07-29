import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkImports } from "../lib/import-walk.ts";

const REPO_ROOT = process.cwd();

/**
 * THE WALKTHROUGH SENDS NOTHING — proven structurally, not promised.
 *
 * `scripts-ts/walkthrough-end-to-end.mts` demonstrates every surface the
 * product has, INCLUDING the Slack and email legs. Those legs are the whole
 * risk: they call the same builders the owner-armed one-shots call, and the
 * only thing separating "showing the payload" from "delivering the payload" is
 * that this script imports the BUILDER and not a transport.
 *
 * A comment saying so is worth nothing — this repo has now recorded three
 * separate cases of a comment asserting a guarantee the code did not implement
 * (the `L1_OUT_DIR` containment claim, the "$0/zero-network" eval a beacon
 * walked through, and the display-tier block whose comment promised tracking
 * the cascade discarded). So the claim is enforced by the same fail-closed
 * import walk that guards the CLI and MCP surfaces: an ALLOWLIST, which means
 * a module nobody wrote a rule for still fails.
 *
 * If someone later adds `fetch`, a webhook read, or any egress-capable import
 * to the walkthrough, this test goes red before the demo can send anything.
 */
describe("the end-to-end walkthrough is zero-egress by construction", () => {
  it("walks the real import graph and finds no network capability at all", () => {
    const entry = join(REPO_ROOT, "scripts-ts", "walkthrough-end-to-end.mts");
    const { violations, seen } = walkImports(entry, { root: REPO_ROOT });

    // The walk must actually traverse the engine + both delivery builders, or
    // a clean result would prove nothing (the fixture-bug shape the import-walk
    // guard's own tests were written to prevent).
    expect(seen.size, "the walk did not traverse the walkthrough's real closure").toBeGreaterThan(20);
    expect(
      [...seen].some((f) => f.endsWith("slack.ts")),
      "the walk never reached the Slack builder — the riskiest leg went unchecked",
    ).toBe(true);
    expect(
      [...seen].some((f) => f.endsWith("email.ts")),
      "the walk never reached the email builder",
    ).toBe(true);

    expect(
      violations,
      `the walkthrough gained network capability: ${JSON.stringify(violations)}`,
    ).toEqual([]);
  });
});
