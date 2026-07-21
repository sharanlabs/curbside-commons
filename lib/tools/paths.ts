/**
 * TOOL PATH CONTAINMENT — the ONE guard every registry tool that reads a
 * caller-supplied file path must pass its path through BEFORE `readFileSync`
 * (plan §5 row A0 hardening; guidelines-monitor security review 2026-07-20).
 *
 * The file-path tools (`audit_statement`, `check_feed`, `classify_and_audit`)
 * take their target path as a plain string. ajv proves it is a non-empty
 * string — NOT that it stays inside an allowed location. Without containment a
 * caller (an MCP client, the agent crew, an n8n lane) could hand
 * `../../../etc/passwd` or an absolute `/etc/passwd` and the tool would happily
 * read outside the project. This module is the containment: resolve the path,
 * reject anything — `..` traversal, an absolute path, OR a symlink whose REAL
 * target — that lands outside the allowed roots, and hand back the safe
 * absolute path the tool then reads (so what is validated is exactly what is
 * read).
 *
 * ALLOWED ROOTS (what today's real inputs actually need — checked against the
 * live call sites, never overspecified):
 *  - the REPO ROOT — every committed input lives here (`fixtures/**`,
 *    `evals/**`); relative paths resolve against it exactly as `readFileSync`
 *    resolves them against a repo-root cwd.
 *  - the OS TEMP DIR — tests legitimately write ephemeral statement/feed
 *    fixtures to `os.tmpdir()` and point a tool at that absolute path
 *    (`registry-advisory-never-gates.test.ts`), a supported, non-secret scratch
 *    location.
 * `/etc/passwd`, `~/.ssh/*`, and any `..`-climb out of the project stay outside
 * BOTH and are refused.
 *
 * Containment is checked on CANONICALIZED (`realpathSync`) paths so a symlinked
 * prefix — e.g. macOS `/var` → `/private/var` for the temp dir — never causes a
 * false accept OR a false reject.
 *
 * Plain: the bouncer that makes sure a "which file?" answer can only ever point
 * at a file INSIDE this project (or the disposable temp scratch dir) — never at
 * your SSH keys, never at `/etc/passwd` — before the tool opens it.
 */
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** This file lives at `<repo>/lib/tools/paths.ts`; the repo root is two levels up. */
const REPO_ROOT = realpathSync(resolve(fileURLToPath(import.meta.url), "..", "..", ".."));

/** The canonical allowed roots a tool path may resolve within (see file header). */
const ALLOWED_ROOTS: readonly string[] = Object.freeze([REPO_ROOT, realpathSync(tmpdir())]);

/**
 * Thrown BEFORE any `readFileSync` when a caller-supplied path escapes the
 * allowed roots — registered and typed like the registry's other input errors
 * ({@link import("./types.ts").ToolInputError}), never a bare string throw. A
 * consumer (MCP server, crew, n8n) sees this exactly as it sees a
 * `StatementParseError`: a runtime failure that surfaces loudly, never a silent
 * read of an out-of-root file.
 */
export class ToolPathError extends Error {
  /** The parameter name the offending value arrived on (e.g. "statementPath"). */
  readonly param: string;
  /** The caller-supplied value, verbatim. */
  readonly value: string;
  /** Where it canonically resolved to — outside every allowed root. */
  readonly resolved: string;
  /** The allowed roots the path had to stay within. */
  readonly roots: readonly string[];
  constructor(param: string, value: string, resolved: string, roots: readonly string[]) {
    super(
      `tool path "${param}" escapes the allowed root: "${value}" resolves to "${resolved}", ` +
        `which is outside [${roots.join(", ")}] — path traversal and absolute-path escapes are refused`,
    );
    this.name = "ToolPathError";
    this.param = param;
    this.value = value;
    this.resolved = resolved;
    this.roots = Object.freeze([...roots]);
  }
}

/**
 * True iff `p` (already canonical) is one of, or sits under, an allowed root.
 *
 * The prefix match is DELIBERATELY case-sensitive — do NOT "fix" it to be
 * case-insensitive. On a case-sensitive filesystem (Linux, where CI runs)
 * `/Foo` and `/foo` are DIFFERENT files, so a case-insensitive compare would
 * UNDER-reject — accept an out-of-root path that merely differs in case from an
 * allowed root (a real containment bypass). The only cost of the case-sensitive
 * compare is that on a case-insensitive host (macOS) a caller passing an
 * alternately-cased path to a real in-root file is refused — that is
 * FAIL-CLOSED (safe) and no legitimate caller does it (real callers pass the
 * canonical fixture/schema paths). Correctness of the security boundary beats
 * convenience on one platform. (Security review 2026-07-21, sol run-2 lead —
 * adjudicated: keep case-sensitive, document the intent.)
 */
function withinAllowedRoot(p: string): boolean {
  return ALLOWED_ROOTS.some((root) => p === root || p.startsWith(root + sep));
}

/**
 * Canonicalize the deepest ancestor of `p` that exists — used only when `p`
 * itself does not exist, so containment can still be judged (against a real,
 * symlink-followed path) without a `realpathSync` throw. The filesystem root
 * always exists, so this terminates.
 */
function canonicalNearestExisting(p: string): string {
  let cur = p;
  for (;;) {
    try {
      return realpathSync(cur);
    } catch {
      const parent = dirname(cur);
      if (parent === cur) return cur;
      cur = parent;
    }
  }
}

/**
 * Resolve `candidate` and return the safe absolute path, or throw
 * {@link ToolPathError} if it escapes the allowed roots. `param` names the
 * field the value arrived on, for a message a caller can act on.
 *
 * An EXISTING target is canonicalized with `realpathSync` and its real location
 * must sit within an allowed root (this catches a symlink planted in-root that
 * points out). A NON-EXISTENT target is judged by its nearest existing
 * ancestor's real location — enough to reject an out-of-root `..`-climb while
 * letting a legitimate-but-missing in-root path fall through to the tool's own
 * `readFileSync` ENOENT (behavior unchanged).
 */
export function resolveInAllowedRoot(candidate: string, param: string): string {
  const resolved = resolve(REPO_ROOT, candidate);
  let real: string;
  try {
    real = realpathSync(resolved);
  } catch {
    const anchor = canonicalNearestExisting(resolved);
    if (!withinAllowedRoot(anchor)) {
      throw new ToolPathError(param, candidate, resolved, ALLOWED_ROOTS);
    }
    return resolved;
  }
  if (!withinAllowedRoot(real)) {
    throw new ToolPathError(param, candidate, real, ALLOWED_ROOTS);
  }
  return real;
}
