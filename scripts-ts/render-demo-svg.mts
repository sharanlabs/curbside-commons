/**
 * README demo visual — rendered FROM a real captured run (plan v3.4 RV2).
 *
 * Runs `node bin/check.mjs demo` (the same command the README documents),
 * captures its stdout, and renders EVERY line verbatim into an animated SVG
 * "terminal card". Nothing is staged: the SVG's text nodes are the captured
 * bytes, XML-escaped. Deterministic — no clock, no randomness; the same demo
 * output always yields the same SVG bytes.
 *
 * Motion: the demo's beats fade in sequentially (opacity-only, CSS inside the
 * SVG), honoring prefers-reduced-motion (everything visible immediately).
 * Ground is light per the standing no-dark-background preference.
 *
 * Usage: node scripts-ts/render-demo-svg.mts   → writes docs/assets/demo.svg
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "docs", "assets", "demo.svg");

// ---- 1. The REAL run (captured verbatim) -----------------------------------
const raw = execFileSync("node", [join(root, "bin", "check.mjs"), "demo"], {
  encoding: "utf8",
  cwd: root,
});
const lines = raw.replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n");

// ---- 2. Geometry (derived from the capture, never hardcoded) ---------------
const FONT = 13; // px, monospace
const CHAR_W = FONT * 0.602; // ui-monospace advance approximation
const LINE_H = 19;
const PAD_X = 28;
const PAD_TOP = 64; // chrome bar + breathing room
const PAD_BOTTOM = 28;
const maxCols = Math.max(...lines.map((l) => l.length));
const width = Math.ceil(maxCols * CHAR_W + PAD_X * 2);
const height = PAD_TOP + lines.length * LINE_H + PAD_BOTTOM;

// ---- 3. Beat grouping for the sequential reveal -----------------------------
// A new "beat block" starts at each `----`/`====` separator line; the reveal
// staggers block by block so the story reads top-down like the live terminal.
const isRule = (l: string) => /^[=-]{20,}$/.test(l.trim());
let block = 0;
const blockOf: number[] = lines.map((l, i) => {
  if (i > 0 && isRule(l) && !isRule(lines[i - 1] ?? "")) block += 1;
  return block;
});
const blockCount = block + 1;
const STEP_S = 0.55; // delay between blocks
const FADE_S = 0.5;

// ---- 4. Verbatim line rendering (XML-escaped; classes are styling only) ----
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const classFor = (l: string): string => {
  if (/\[ERROR\]/.test(l)) return "err";
  if (/\[FLAG\]/.test(l)) return "flag";
  if (/\[OK\]/.test(l)) return "ok";
  if (/^BEAT \d/.test(l.trim())) return "beat";
  if (isRule(l)) return "rule";
  if (/^\s*▸/.test(l)) return "note";
  if (/^(claim|reference|rule|class):|^\s+(claim|reference|rule|class):/.test(l.trim())) return "receipt";
  return "body";
};
const text = lines
  .map((l, i) => {
    const y = PAD_TOP + (i + 1) * LINE_H - 6;
    const cls = classFor(l);
    return `<text x="${PAD_X}" y="${y}" class="ln b${blockOf[i]} ${cls}" xml:space="preserve">${esc(l)}</text>`;
  })
  .join("\n");

const delays = Array.from({ length: blockCount }, (_, i) =>
  `.b${i}{animation-delay:${(i * STEP_S).toFixed(2)}s}`,
).join("");

// ---- 5. The SVG -------------------------------------------------------------
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Captured terminal run of: node bin/check.mjs demo — a simulated agent trusts a spec-valid feed; the deterministic verifier flags the price drift with receipts. Simulated data.">
<title>node bin/check.mjs demo — real captured output (simulated data)</title>
<style>
  .card{fill:#ffffff;stroke:#d9d4cc;stroke-width:1}
  .bar{fill:#f6f4f0}
  .dot{fill:#c9c2b8}
  .cmd{font:600 ${FONT}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#5c5648}
  .ln{font:${FONT}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#2b2620;opacity:0;animation:in ${FADE_S}s cubic-bezier(0.23,1,0.32,1) forwards}
  .rule{fill:#b3aca0}
  .beat{fill:#1a1712;font-weight:700}
  .note{fill:#5c5648;font-style:italic}
  .receipt{fill:#6e675c}
  .err{fill:#a01f14;font-weight:600}
  .flag{fill:#8a2233;font-weight:700}
  .ok{fill:#1f6b45;font-weight:600}
  ${delays}
  @keyframes in{to{opacity:1}}
  @media (prefers-reduced-motion: reduce){.ln{animation:none;opacity:1}}
</style>
<rect class="card" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10"/>
<rect class="bar" x="1" y="1" width="${width - 2}" height="36" rx="9"/>
<rect class="bar" x="1" y="20" width="${width - 2}" height="17"/>
<circle class="dot" cx="20" cy="19" r="5"/><circle class="dot" cx="38" cy="19" r="5"/><circle class="dot" cx="56" cy="19" r="5"/>
<text class="cmd" x="76" y="23.5">$ node bin/check.mjs demo</text>
${text}
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(
  `wrote ${OUT}: ${lines.length} captured lines verbatim, ${blockCount} reveal blocks, ${width}x${height}`,
);
