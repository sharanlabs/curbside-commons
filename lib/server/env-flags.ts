/**
 * Dependency-free environment-flag predicates. NO AI-SDK or other heavy imports, so
 * this is safe to pull into any path, and is the single source of truth so the draft
 * runtime and any future auth check can't drift. Ported from resilix.
 */

/** Robust boolean parse: trim + lowercase, accept the common truthy forms. */
export function envBool(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/**
 * Live AI is on ONLY when explicitly enabled AND a key is present. Off by default and
 * off in the public deploy (no ENABLE_LIVE_AI / no key) — the public demo is
 * REPLAY-only, so it can never spend (plan Blindspots: public-deploy budget).
 */
export function liveAiEnabled(): boolean {
  return envBool("ENABLE_LIVE_AI") && Boolean(process.env.GEMINI_API_KEY?.trim());
}
