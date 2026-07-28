import { describe, expect, it } from "vitest";
import { resolveSourceSha, type GitProbe } from "@/lib/build-provenance";

/**
 * The footer's source-SHA claim (2026-07-27).
 *
 * Caught in production, not in a test: the first git-triggered deploy rendered
 * `Built from source 0ebcff5b03d2 (+dirty)` while both the commit and the
 * pushed tree were clean — the site telling every reader that production did
 * not correspond to any commit, when it corresponded exactly. A false
 * provenance claim on a public surface is a RULES §4 problem even when it errs
 * toward self-doubt: a reader cannot tell a cautious label from a true one.
 *
 * The cause was a category error the same shape this project keeps finding:
 * `git status --porcelain` was being asked about OUR working tree inside a
 * build container that is not our working tree. It answered honestly about the
 * container. The question was wrong.
 */

const CLEAN = "a".repeat(40);
const LOCAL = "b".repeat(40);

const probe = (sha: string | null, dirty: boolean): GitProbe => ({
  headSha: () => sha,
  isDirty: () => dirty,
});

describe("the host's authoritative commit wins over a local guess", () => {
  it("a hosted build stamps the platform's SHA, never +dirty", () => {
    // The regression. VERCEL_GIT_COMMIT_SHA is set by the platform from the git
    // event that triggered the build; untracked files in its checkout cannot
    // make the source unfaithful to that commit.
    const sha = resolveSourceSha({ VERCEL_GIT_COMMIT_SHA: CLEAN }, probe(LOCAL, true));
    expect(sha).toBe(CLEAN);
    expect(sha).not.toContain("dirty");
  });

  it("a malformed hosted value is ignored rather than published", () => {
    // Fail toward the local answer, never toward a fabricated one.
    expect(resolveSourceSha({ VERCEL_GIT_COMMIT_SHA: "HEAD" }, probe(LOCAL, false))).toBe(LOCAL);
    expect(resolveSourceSha({ VERCEL_GIT_COMMIT_SHA: "  " }, probe(LOCAL, false))).toBe(LOCAL);
  });

  it("an explicit override still outranks the host (the clean-room PRE-GATE build)", () => {
    expect(
      resolveSourceSha({ BUILD_SOURCE_SHA: "pinned", VERCEL_GIT_COMMIT_SHA: CLEAN }, probe(LOCAL, false)),
    ).toBe("pinned");
  });
});

describe("locally, the dirty marker still means what it says", () => {
  it("a dirty local tree is marked", () => {
    expect(resolveSourceSha({}, probe(LOCAL, true))).toBe(`${LOCAL}+dirty`);
  });

  it("a clean local tree is not", () => {
    expect(resolveSourceSha({}, probe(LOCAL, false))).toBe(LOCAL);
  });

  it("no git at all yields no claim — never an invented one", () => {
    // build-info renders "untracked build" from an empty string; fabricating a
    // SHA here would be the one outcome worse than admitting ignorance.
    expect(resolveSourceSha({}, probe(null, false))).toBe("");
  });
});
