#!/usr/bin/env node
/**
 * OFFLINE BUILD — a real `next build` with no font-host network.
 *
 * Discovered 2026-08-02 (session 43), after four sessions of "the build needs
 * fonts.googleapis.com". Two blocks, two keys:
 *
 *   1. `next/font` ships a test hook — NEXT_FONT_GOOGLE_MOCKED_RESPONSES — a
 *      CJS module mapping the CSS-request URL to CSS text; font `src` URLs
 *      that start with "/" are read from DISK (fetch-font-file.js).
 *   2. Turbopack's font replacer evaluates that module in a helper process
 *      that BINDS A PORT, which a sandbox may deny (EPERM) — the webpack
 *      pipeline runs it in-process, so the build uses `--webpack`.
 *
 * The bytes are REAL: the v8 mockup embeds both production faces as base64
 * variable woff2 (Onest wght 100–900, JetBrains Mono wght 100–800, latin
 * subset — verified against the faces the app requests). So the offline build
 * carries genuine typography, not a fallback: layout metrics are authentic
 * for latin text, and the C10 rendered-HTML scan sees production-identical
 * text either way.
 *
 * Usage:  node scripts/build-offline.mjs
 * Output: out/ (static export), same as `npm run build` on a networked shell.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockup = path.join(repo, "mockups/sample-home-listings-v8-2026-07-17.html");
const work = fs.mkdtempSync(path.join(os.tmpdir(), "cc-fonts-"));

const html = fs.readFileSync(mockup, "utf8");
const faces = [...html.matchAll(/font-family:'([^']+)';[^}]*?base64,([A-Za-z0-9+/=]+)/g)];
const files = {};
for (const [, family, b64] of faces) {
  const buf = Buffer.from(b64, "base64");
  if (buf.subarray(0, 4).toString() !== "wOF2") {
    throw new Error(`extracted ${family} is not woff2 — the mockup changed; re-verify before trusting this build`);
  }
  const file = path.join(work, family.toLowerCase().replace(/\s+/g, "-") + ".woff2");
  fs.writeFileSync(file, buf);
  files[family] = file;
}
if (!files["Onest"] || !files["JetBrains Mono"]) {
  throw new Error(`mockup no longer embeds both faces (found: ${Object.keys(files).join(", ") || "none"})`);
}

const RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const mock = `
const face = (family, weights, file) =>
  "/* latin */\\n@font-face {\\n  font-family: '" + family + "';\\n  font-style: normal;\\n  font-weight: " + weights + ";\\n  font-display: swap;\\n  src: url(" + file + ") format('woff2');\\n  unicode-range: ${RANGE};\\n}\\n";
module.exports = new Proxy({}, {
  get(_t, url) {
    if (typeof url !== "string") return undefined;
    if (url.includes("Onest")) return face("Onest", "100 900", ${JSON.stringify(files["Onest"])});
    if (url.includes("JetBrains")) return face("JetBrains Mono", "100 800", ${JSON.stringify(files["JetBrains Mono"])});
    return undefined; // unmocked URL -> next/font errors loudly with the URL
  },
});
`;
const mockPath = path.join(work, "font-mocks.cjs");
fs.writeFileSync(mockPath, mock);

console.log(`offline build: real font bytes from ${path.basename(mockup)} → ${work}`);
execFileSync("npx", ["next", "build", "--webpack"], {
  cwd: repo,
  stdio: "inherit",
  env: { ...process.env, NEXT_FONT_GOOGLE_MOCKED_RESPONSES: mockPath },
});
