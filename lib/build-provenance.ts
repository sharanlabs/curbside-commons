/**
 * Which source SHA a build stamps into the footer — the pure decision, split
 * out of next.config.ts so it can be tested (2026-07-27).
 *
 * WHY THIS EXISTS. The footer line is a PUBLIC PROVENANCE CLAIM: it tells a
 * reader which commit produced the page they are looking at. On the first
 * git-triggered production deploy it read `0ebcff5b03d2 (+dirty)` while the
 * commit was clean and the pushed tree was clean — the site asserting that
 * production did not correspond to any commit, when it exactly did.
 *
 * The cause is that `git status --porcelain` was being asked a question about
 * OUR working tree inside a build container that is not our working tree. A
 * CI checkout can carry untracked scaffolding for reasons that have nothing to
 * do with whether the source is faithful to a commit, so the answer describes
 * the container, not the code.
 *
 * THE RULE THIS ENCODES: when the host knows the commit authoritatively,
 * believe the host. `VERCEL_GIT_COMMIT_SHA` is set by the platform from the
 * git event that triggered the build — verified live 2026-07-27 against the
 * deployment's own metadata (`githubCommitSha`), not from memory. A local
 * `git status` cannot contradict it, because the host's value is a fact about
 * what was fetched and ours is an inference about what is lying around.
 *
 * The `+dirty` marker is kept for LOCAL builds, where the question is
 * meaningful and the answer is ours to give. Precedence:
 *
 *   1. BUILD_SOURCE_SHA        — explicit override (the clean-room PRE-GATE build)
 *   2. VERCEL_GIT_COMMIT_SHA   — the host's authoritative commit for this deploy
 *   3. local git + dirty check — a developer's own machine
 *   4. ""                      — build-info renders "untracked build" rather
 *                                than fabricating provenance
 */

/**
 * The environment a build resolves its provenance from. Indexed rather than
 * two named optionals so `process.env` (whose type is an index signature)
 * satisfies it directly — the named keys stay documented above.
 */
export type ProvenanceEnv = Readonly<Record<string, string | undefined>>;

/** Reads the local repository. Injected so the decision stays pure. */
export interface GitProbe {
  /** Full HEAD SHA, or null when git is unavailable. */
  readonly headSha: () => string | null;
  /** True when the working tree has uncommitted changes. */
  readonly isDirty: () => boolean;
}

/**
 * Resolve the source SHA to stamp. Returns "" when nothing is known — callers
 * must render the honest "untracked build" line rather than invent one.
 */
export function resolveSourceSha(env: ProvenanceEnv, git: GitProbe): string {
  if (env.BUILD_SOURCE_SHA) return env.BUILD_SOURCE_SHA;

  // The host's own answer. No dirty check: a CI checkout's untracked files say
  // nothing about whether this build corresponds to the commit, and appending
  // "+dirty" here would publish a false claim about a faithful deploy.
  const hosted = env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (hosted && /^[0-9a-f]{40}$/.test(hosted)) return hosted;

  const sha = git.headSha();
  if (!sha) return "";
  return git.isDirty() ? `${sha}+dirty` : sha;
}
