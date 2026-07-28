import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { resolveSourceSha } from "./lib/build-provenance.ts";

/**
 * Build provenance injection (plan v3.3 E1a; consumed by lib/build-info.ts and
 * rendered in the site footer). The DECISION lives in lib/build-provenance.ts
 * so it is testable; this function only supplies the environment and the git
 * probe. Precedence: BUILD_SOURCE_SHA (clean-room PRE-GATE) → the host's
 * authoritative commit → local git with an honest "+dirty" marker → empty
 * (build-info renders "untracked build" rather than fabricating provenance).
 *
 * The host tier was added 2026-07-27 after the first git-triggered deploy
 * published `(+dirty)` for a clean commit: `git status` was being asked about
 * our working tree inside a build container that is not our working tree.
 */
function resolveBuildProvenance(): { sha: string; timeUtc: string } {
  const timeUtc = process.env.BUILD_TIMESTAMP_UTC ?? new Date().toISOString();
  const sha = resolveSourceSha(process.env, {
    headSha: () => {
      try {
        return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
          .toString()
          .trim();
      } catch {
        return null;
      }
    },
    isDirty: () => {
      try {
        return (
          execSync("git status --porcelain", { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim().length > 0
        );
      } catch {
        return false;
      }
    },
  });
  return { sha, timeUtc };
}

const buildProvenance = resolveBuildProvenance();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: buildProvenance.sha,
    NEXT_PUBLIC_BUILD_TIME_UTC: buildProvenance.timeUtc,
  },
  typedRoutes: false,
  allowedDevOrigins: ["127.0.0.1"],
  // Static export for the episodic showcase deploy (docs/plan-deploy.md, owner-worded 2026-07-08).
  // All 30 routes prerender Static/SSG; no server features in app/. out/ is gitignored build
  // output — the legacy oracle artifacts that previously occupied out/ live in
  // legacy/activation/oracle/ (relocated 2026-07-08, byte-identical).
  output: "export",
};

export default nextConfig;
