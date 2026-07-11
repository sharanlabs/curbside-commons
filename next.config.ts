import type { NextConfig } from "next";
import { execSync } from "node:child_process";

/**
 * Build provenance injection (plan v3.3 E1a; consumed by lib/build-info.ts and
 * rendered in the site footer). Precedence: explicit BUILD_SOURCE_SHA /
 * BUILD_TIMESTAMP_UTC env (the clean-room PRE-GATE build sets these) → live git
 * (with an honest "+dirty" marker) → empty (build-info falls back to the
 * labeled "untracked build" line rather than fabricating provenance).
 */
function resolveBuildProvenance(): { sha: string; timeUtc: string } {
  const timeUtc = process.env.BUILD_TIMESTAMP_UTC ?? new Date().toISOString();
  if (process.env.BUILD_SOURCE_SHA) return { sha: process.env.BUILD_SOURCE_SHA, timeUtc };
  try {
    const sha = execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    const dirty =
      execSync("git status --porcelain", { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim().length > 0;
    return { sha: dirty ? `${sha}+dirty` : sha, timeUtc };
  } catch {
    return { sha: "", timeUtc };
  }
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
