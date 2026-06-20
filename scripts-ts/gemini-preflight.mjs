// Gemini key + model preflight. Run: node --env-file=.env scripts-ts/gemini-preflight.mjs
// Free, read-only ListModels — verifies the key works WITHOUT ever printing it (the key is sent
// as the x-goog-api-key request header, never in the URL and never logged). No billing.

const key = process.env.GEMINI_API_KEY?.trim();
const enable = process.env.ENABLE_LIVE_AI;
console.log("ENABLE_LIVE_AI:", enable ?? "(unset)");
if (!key) {
  console.log("GEMINI_API_KEY: MISSING — not loaded from .env (or empty).");
  process.exit(1);
}
console.log("GEMINI_API_KEY: present (non-empty) — value not displayed.");

// Key as a header, never a URL query param (query strings leak into proxy/server logs).
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
  headers: { Accept: "application/json", "x-goog-api-key": key },
});
console.log("ListModels HTTP:", res.status, res.statusText);
if (!res.ok) {
  const body = await res.text();
  console.log("ERROR (first 400 chars):", body.slice(0, 400));
  process.exit(2);
}
const data = await res.json();
const gemini = (data.models ?? [])
  .map((m) => m.name)
  .filter((n) => typeof n === "string")
  .map((n) => n.replace(/^models\//, ""))
  .filter((n) => n.startsWith("gemini-"));

console.log(`gemini models available (${gemini.length}):`);
console.log("  " + gemini.slice(0, 40).join("\n  "));

console.log("\nconfigured-table check:");
for (const w of ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"]) {
  console.log(`  ${w}: ${gemini.includes(w) ? "AVAILABLE" : "NOT available"}`);
}
console.log("\nPREFLIGHT OK — key valid, ListModels reachable.");
