/**
 * Build provenance (plan v3.3 E1a — the deployed-SHA/date line, consumed at S8).
 *
 * The values are inlined at BUILD TIME by next.config.ts (env → NEXT_PUBLIC_*):
 *   - NEXT_PUBLIC_BUILD_SHA  — the source git SHA the build was produced from
 *     ("+dirty" suffix when the working tree had uncommitted changes, so the
 *     label never claims a clean SHA falsely), or "" when git was unavailable.
 *   - NEXT_PUBLIC_BUILD_TIME_UTC — one fixed UTC ISO timestamp for the build.
 *
 * The clean-room PRE-GATE build overrides both via BUILD_SOURCE_SHA /
 * BUILD_TIMESTAMP_UTC (see next.config.ts). The label is deliberately
 * "source … at build time", NEVER "deployed" — deployment is a separate act
 * and this line must stay accurate on any host, including local builds.
 */

export type BuildInfo = {
  /** Full source SHA (possibly "+dirty"-suffixed), or null when untracked. */
  sha: string | null;
  /** First 12 hex chars of the SHA (dirty marker preserved), or null. */
  shortSha: string | null;
  /** UTC ISO-8601 timestamp fixed at build time, or null. */
  timeUtc: string | null;
  /** One honest display line — never claims more than the build knows. */
  label: string;
};

const RAW_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? "";
const RAW_TIME = process.env.NEXT_PUBLIC_BUILD_TIME_UTC ?? "";

/** A full git SHA with an optional "+dirty" working-tree marker. */
export const BUILD_SHA_PATTERN = /^[0-9a-f]{40}(\+dirty)?$/;

export function deriveBuildInfo(rawSha: string, rawTime: string): BuildInfo {
  const sha = BUILD_SHA_PATTERN.test(rawSha) ? rawSha : null;
  const timeUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(rawTime) ? rawTime : null;
  const shortSha = sha ? sha.slice(0, 12) + (sha.endsWith("+dirty") ? " (+dirty)" : "") : null;
  const label =
    sha && timeUtc
      ? `Built from source ${shortSha} at ${timeUtc} (build-time values, not a deployment claim)`
      : "Untracked build — source SHA unavailable at build time";
  return { sha, shortSha, timeUtc, label };
}

export const BUILD_INFO: BuildInfo = deriveBuildInfo(RAW_SHA, RAW_TIME);
