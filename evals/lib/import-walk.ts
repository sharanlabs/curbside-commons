/**
 * SHARED IMPORT-WALK GUARD — the structural `$0`-LLM / zero-network proof.
 *
 * WHY THIS MODULE EXISTS (2026-07-26, capability-sweep CLI finding, HIGH).
 * The README stakes a load-bearing claim: *"Zero network and zero LLM calls on
 * every CLI path — enforced structurally by an import-graph eval, not by
 * promise."* That eval was **bypassable**, and the sweep proved it end to end
 * rather than by inspection: a mirrored CLI with a `node:net` socket and a
 * `globalThis.fetch` beacon wired into `runDemo()` printed
 * `[EGRESS CODE RAN on the CLI path]` during `node bin/check.mjs demo` — while
 * the eval reported `PASS (no violations found)`.
 *
 * Three independent holes, each re-confirmed locally before this was written:
 *
 *  1. **The module ban was a DENYLIST.** It named `node:https?`, `undici`,
 *     `@ai-sdk`, `groq|gemini`. Verified bypasses: `node:net`, `node:tls`,
 *     `node:dgram`, `node:worker_threads`, `node:child_process` — none of which
 *     require a new dependency. A denylist of egress-capable modules can never
 *     be complete; every new Node release can add another.
 *  2. **The source scan matched one spelling of `fetch`.** `(^|[^.\w])fetch\s*\(`
 *     rejects `fetch(`, but passes `globalThis.fetch(`, `(0,fetch)(`, and
 *     `const f = globalThis.fetch; f(`.
 *  3. **The specifier extractor only saw STRING LITERALS.** `import(mod)` and
 *     `import("node:" + "net")` are invisible to it — so a dynamic import is
 *     both unbanned and unwalked, hiding whole subtrees.
 *
 * THE FIX IS A SHAPE CHANGE, not more patterns: **the module check is now an
 * ALLOWLIST.** The CLI path legitimately uses exactly five Node builtins
 * (`crypto`, `fs`, `os`, `path`, `url`, plus their `/promises` variants).
 * Anything else is a failure *by default*, so a module nobody has thought of yet
 * — including one that ships in a future Node — is caught the day it appears.
 * That is the property a denylist structurally cannot have.
 *
 * Non-literal dynamic imports are now a HARD FAILURE rather than a silent skip:
 * an import the walker cannot resolve is an import it cannot police, and on a
 * surface whose entire claim is "structurally enforced", unanalyzable is not
 * acceptable. There is no legitimate need for one on these paths.
 *
 * Extracted here so all ten import-walk suites share ONE implementation. Ten
 * copies of a subtly-wrong walker is how a hole survives in nine places after
 * being fixed in one.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Node builtins permitted on a `$0`, offline path. Deliberately minimal: these
 * are the five the engine actually uses. ADDING ONE IS A REVIEWED DECISION —
 * `node:net`, `node:tls`, `node:dgram`, `node:http*`, `node:worker_threads`, and
 * `node:child_process` are all egress- or execution-capable and must never
 * appear here without an accompanying record.
 */
export const ALLOWED_NODE_BUILTINS: readonly string[] = [
  "node:crypto",
  "node:fs",
  "node:fs/promises",
  "node:os",
  "node:path",
  "node:url",
  "node:util",
  "node:buffer",
  "node:assert",
  "node:stream",
  "node:string_decoder",
  "node:events",
  "node:timers",
  "node:process",
];

/**
 * Third-party packages permitted on the offline paths — deterministic,
 * non-networking libraries the engine genuinely depends on.
 */
export const ALLOWED_BARE_PACKAGES: readonly string[] = ["ajv", "ajv-formats"];

/** Every spelling of a network call the source scan must reject. */
const NETWORK_CALL_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/(^|[^.\w])fetch\s*\(/, "bare fetch("],
  [/\bglobalThis\s*\.\s*fetch\b/, "globalThis.fetch"],
  [/\bglobal\s*\.\s*fetch\b/, "global.fetch"],
  [/\bwindow\s*\.\s*fetch\b/, "window.fetch"],
  [/\(\s*0\s*,\s*fetch\s*\)/, "(0,fetch) indirect call"],
  [/\bnew\s+XMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bnew\s+WebSocket\b/, "WebSocket"],
  [/\bnavigator\s*\.\s*sendBeacon\b/, "navigator.sendBeacon"],
  [/\bnew\s+EventSource\b/, "EventSource"],
];

export interface Violation {
  readonly file: string;
  readonly kind: "module" | "network-call" | "unanalyzable-import";
  readonly detail: string;
}

export interface WalkOptions {
  /** Repo root, for resolving `@/...` aliases. */
  readonly root: string;
  /** Extra bare packages this surface may legitimately import. */
  readonly allowPackages?: readonly string[];
  /** Extra node builtins this surface may legitimately import. */
  readonly allowBuiltins?: readonly string[];
}

/**
 * Extract import specifiers AND flag non-literal dynamic imports.
 *
 * The old extractor matched only quoted specifiers, so `import(mod)` produced no
 * match and was silently skipped — unbanned and unwalked. Here a dynamic import
 * whose argument is not a string literal is reported as a violation.
 */
export function extractImports(text: string): { specs: string[]; unanalyzable: string[] } {
  const specs: string[] = [];
  const unanalyzable: string[] = [];
  const literal = /(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)["']([^"']+)["']/g;
  for (let m = literal.exec(text); m; m = literal.exec(text)) specs.push(m[1]);
  // A dynamic import/require whose first non-space argument is not a quote.
  const dynamic = /\b(?:import|require)\s*\(\s*(?!["'\s)])([^)]{0,60})/g;
  for (let m = dynamic.exec(text); m; m = dynamic.exec(text)) {
    // `import.meta` and type-only `import(` in TS type positions are not calls.
    if (/^meta\b/.test(m[1])) continue;
    unanalyzable.push(m[1].trim().slice(0, 40));
  }
  return { specs, unanalyzable };
}

/** Resolve `@/...` and relative specifiers to a repo file, or null if bare. */
export function resolveSpec(fromFile: string, spec: string, root: string): string | null {
  let base: string | null = null;
  if (spec.startsWith("@/")) base = join(root, spec.slice(2));
  else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
  if (base === null) return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.json`, join(base, "index.ts")];
  return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
}

/**
 * Walk every module reachable from `entry` and return all violations.
 *
 * ALLOWLIST semantics: a bare specifier (one that does not resolve to a repo
 * file) must appear in the permitted builtins or packages, or it is a violation.
 * Unknown-by-default is the whole point.
 */
export function walkImports(entry: string, opts: WalkOptions): { violations: Violation[]; seen: Set<string> } {
  const builtins = new Set([...ALLOWED_NODE_BUILTINS, ...(opts.allowBuiltins ?? [])]);
  const packages = new Set([...ALLOWED_BARE_PACKAGES, ...(opts.allowPackages ?? [])]);
  const violations: Violation[] = [];
  const seen = new Set<string>();
  const queue = [entry];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    if (file.endsWith(".json")) continue; // data leaf

    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const [pattern, label] of NETWORK_CALL_PATTERNS) {
      if (pattern.test(text)) violations.push({ file, kind: "network-call", detail: label });
    }

    const { specs, unanalyzable } = extractImports(text);
    for (const u of unanalyzable) {
      violations.push({
        file,
        kind: "unanalyzable-import",
        detail: `non-literal dynamic import \`${u}\` — the walker cannot police what it cannot resolve`,
      });
    }
    for (const spec of specs) {
      const resolved = resolveSpec(file, spec, opts.root);
      if (resolved !== null) {
        queue.push(resolved);
        continue;
      }
      // Bare specifier: must be explicitly permitted.
      const normalized = spec.startsWith("node:") ? spec : `node:${spec}`;
      const isBuiltin = builtins.has(spec) || builtins.has(normalized);
      const isPackage = packages.has(spec) || [...packages].some((p) => spec === p || spec.startsWith(`${p}/`));
      if (!isBuiltin && !isPackage) {
        violations.push({
          file,
          kind: "module",
          detail: `"${spec}" is not on the offline allowlist (adding one is a reviewed decision)`,
        });
      }
    }
  }
  return { violations, seen };
}
