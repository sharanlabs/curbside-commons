import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ["127.0.0.1"],
  // Static export for the episodic showcase deploy (docs/plan-deploy.md, owner-worded 2026-07-08).
  // All 30 routes prerender Static/SSG; no server features in app/. out/ is gitignored build
  // output — the legacy oracle artifacts that previously occupied out/ live in
  // legacy/activation/oracle/ (relocated 2026-07-08, byte-identical).
  output: "export",
};

export default nextConfig;
