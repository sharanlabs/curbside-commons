// Groq key + DAILY-WINDOW preflight. Run: node --env-file=.env scripts-ts/groq-preflight.mjs
// Why: for the cross-family live run the BINDING constraint is the Groq free-tier daily-token
// window (≈200k/day), NOT the $5 Gemini cap. A depleted window is what degraded the A3-7 re-run
// (judge + domain critic fell back → vacuous K). This makes ONE tiny max_tokens=1 completion
// (~a handful of tokens, free tier) and prints the x-ratelimit-* headers so we can confirm the
// window is FRESH before arming the full run. The key is sent as a Bearer header, never printed.
const key = process.env.GROQ_API_KEY?.trim();
const model = process.env.JUDGE_MODEL?.trim() || "openai/gpt-oss-120b";
console.log("ENABLE_LIVE_AI:", process.env.ENABLE_LIVE_AI ?? "(unset)");
if (!key) {
  console.log("GROQ_API_KEY: MISSING — not loaded from .env (or empty).");
  process.exit(1);
}
console.log("GROQ_API_KEY: present (non-empty) — value not displayed.");
console.log("probe model:", model);

const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "ok" }],
    max_tokens: 1,
    temperature: 0,
  }),
});
console.log("HTTP:", res.status, res.statusText);

const rl = {};
for (const [k, v] of res.headers.entries()) if (k.startsWith("x-ratelimit")) rl[k] = v;
console.log("rate-limit headers:");
for (const k of Object.keys(rl).sort()) console.log(`  ${k}: ${rl[k]}`);

if (!res.ok) {
  const body = await res.text();
  console.log("ERROR (first 400 chars):", body.slice(0, 400));
  process.exit(2);
}

const remTokens = Number(rl["x-ratelimit-remaining-tokens"]);
const limTokens = Number(rl["x-ratelimit-limit-tokens"]);
if (Number.isFinite(remTokens) && Number.isFinite(limTokens) && limTokens > 0) {
  const pct = ((remTokens / limTokens) * 100).toFixed(1);
  console.log(`\nremaining tokens: ${remTokens}/${limTokens} (${pct}% of the window)`);
  console.log(`reset-tokens in: ${rl["x-ratelimit-reset-tokens"] ?? "(n/a)"}`);
}
console.log("\nPREFLIGHT OK — key valid, Groq reachable. Read the window % above before arming.");
