#!/usr/bin/env node
/**
 * dead-css-audit.mjs — R-3: reachability-based dead-CSS detection and purge.
 *
 * Method (session 30's rule: a real reachability graph, never a grep of one file):
 * a class is USED if its exact token appears anywhere in
 *   (a) the built export's HTML (out/ ** /*.html — includes RSC flight payloads),
 *   (b) the built client JS chunks (out/_next/static — catches classes added at
 *       runtime by client components, which never appear in server HTML),
 *   (c) source (app/, components/, lib/) — string literals that feed className,
 *   (d) tests (evals/) — a class a spec pins must keep its rules.
 * The token scan over-approximates usage on purpose: false "used" keeps a rule
 * (harmless); only a token absent from EVERY surface can mark a selector dead.
 *
 * A selector is dead iff it contains at least one dead class. A rule is dropped
 * iff ALL its selectors are dead; otherwise only the dead selectors are dropped.
 * Rules with no class component (element/attr/:root) are never touched.
 * @keyframes are dropped only when no surviving declaration references the name.
 *
 * Modes:
 *   node scripts/dead-css-audit.mjs            → report (writes nothing)
 *   node scripts/dead-css-audit.mjs --purge    → rewrites app/globals.css
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import postcss from "postcss";

const ROOT = new URL("..", import.meta.url).pathname;
const CSS_PATH = join(ROOT, "app/globals.css");
const PURGE = process.argv.includes("--purge");

function* walk(dir, exts) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p, exts);
    else if (exts.includes(extname(name))) yield p;
  }
}

// ---- 1. the used-token set ----
const used = new Set();
const TOKEN = /[A-Za-z][A-Za-z0-9_-]*/g;
const surfaces = [
  { dir: join(ROOT, "out"), exts: [".html", ".js", ".txt"] },
  { dir: join(ROOT, "app"), exts: [".tsx", ".ts"] },
  { dir: join(ROOT, "components"), exts: [".tsx", ".ts"] },
  { dir: join(ROOT, "lib"), exts: [".ts", ".tsx"] },
  { dir: join(ROOT, "evals"), exts: [".ts", ".tsx"] },
];
for (const { dir, exts } of surfaces) {
  for (const file of walk(dir, exts)) {
    if (file.endsWith("globals.css")) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(TOKEN)) used.add(m[0]);
  }
}

// ---- 2. parse the stylesheet ----
const css = readFileSync(CSS_PATH, "utf8");
const root = postcss.parse(css);

const CLASS_IN_SELECTOR = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
const deadClasses = new Set();
const deadSelectors = [];
const keptRules = [];

function classesOf(selector) {
  return [...selector.matchAll(CLASS_IN_SELECTOR)].map((m) => m[1]);
}

root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
  const survivors = [];
  for (const sel of rule.selectors) {
    const cls = classesOf(sel);
    const deadHere = cls.filter((c) => !used.has(c));
    if (cls.length > 0 && deadHere.length > 0) {
      deadSelectors.push(sel);
      deadHere.forEach((c) => deadClasses.add(c));
    } else {
      survivors.push(sel);
    }
  }
  if (survivors.length === 0) {
    if (PURGE) {
      // take an immediately-preceding comment with the rule when it is the
      // rule's own annotation (separated by at most one blank line)
      const prev = rule.prev();
      rule.remove();
      if (prev?.type === "comment" && !(prev.raws.before ?? "").includes("\n\n\n"))
        prev.remove();
    }
  } else if (survivors.length < rule.selectors.length) {
    if (PURGE) rule.selectors = survivors;
  }
  if (survivors.length > 0) keptRules.push(rule);
});

if (PURGE) {
  // drop now-empty at-rules (@media, @supports)
  root.walkAtRules((at) => {
    if (/media|supports/i.test(at.name) && at.nodes && at.nodes.length === 0) {
      const prev = at.prev();
      at.remove();
      if (prev?.type === "comment" && !(prev.raws.before ?? "").includes("\n\n\n"))
        prev.remove();
    }
  });
  // drop unreferenced @keyframes: scan surviving declaration values
  const referenced = new Set();
  root.walkDecls((d) => {
    if (/^(animation|animation-name)$/.test(d.prop))
      for (const m of d.value.matchAll(TOKEN)) referenced.add(m[0]);
  });
  root.walkAtRules((at) => {
    if (/keyframes/i.test(at.name) && !referenced.has(at.params.trim())) {
      const prev = at.prev();
      at.remove();
      if (prev?.type === "comment" && !(prev.raws.before ?? "").includes("\n\n\n"))
        prev.remove();
    }
  });
  writeFileSync(CSS_PATH, root.toString());
}

const out = {
  mode: PURGE ? "purge" : "report",
  deadClassCount: deadClasses.size,
  deadSelectorCount: deadSelectors.length,
  deadClasses: [...deadClasses].sort(),
  deadSelectors: deadSelectors.sort(),
};
console.log(JSON.stringify(out, null, 2));
