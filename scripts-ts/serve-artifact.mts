/**
 * Artifact-mode static server (plan v3.3 S5 → consumed by the RELEASE GATE).
 *
 * Serves a RECORDED `out/` export exactly the way a static host (Cloudflare
 * Pages) maps clean URLs — /eval → out/eval.html, / → out/index.html,
 * /legacy/merchant/M001 → out/legacy/merchant/M001.html — with NO dev server,
 * NO build step, and zero dependencies (node builtins only). The release gate's
 * e2e contracts run against this so they exercise the immutable artifact, not
 * a rebuild.
 *
 * Usage: node scripts-ts/serve-artifact.mts [port] [dir]   (defaults 3200, out/)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.argv[2] ?? 3200);
const ROOT = resolve(process.argv[3] ?? "out");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function candidates(urlPath: string): string[] {
  // Normalize + confine to ROOT (no traversal).
  const clean = normalize(urlPath).replace(/^(\.\.[/\\])+/, "").replace(/\/+$/, "");
  const p = clean === "" || clean === "/" ? "/index" : clean;
  return [join(ROOT, p), join(ROOT, `${p}.html`), join(ROOT, p, "index.html")];
}

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  for (const file of candidates(urlPath)) {
    if (!file.startsWith(ROOT)) break; // traversal guard
    if (existsSync(file) && extname(file) !== "") {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
      return;
    }
  }
  const notFound = join(ROOT, "404.html");
  res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  res.end(existsSync(notFound) ? await readFile(notFound) : "404");
});

server.listen(PORT, () => {
  console.log(`artifact-mode static server: ${ROOT} on http://localhost:${PORT}`);
});
