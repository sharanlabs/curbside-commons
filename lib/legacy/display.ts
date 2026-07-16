/**
 * Display-layer de-jargon for the preserved legacy module's WEB surfaces.
 *
 * The legacy engine, its committed records, and the CLI keep their exact internal
 * labels (that detail lives in the project, not on the public page). These swaps
 * present the RENDERED copy in a plain product voice — no internal run-mode names,
 * model ids, vendor names, or tool jargon leak onto the page.
 *
 * Ordered longest-match-first so multi-word phrases resolve before single words.
 */
const RULES: ReadonlyArray<[RegExp, string]> = [
  // Internal run-mode / model ids for the deterministic preview verdicts — never
  // shown raw on the page (domain-judge matched before judge so the longer id wins).
  [/deterministic[_-]domain[_-]judge/gi, "rules-based preview"],
  [/deterministic[_-]judge/gi, "rules-based preview"],
  [/deterministic[_-]rules/gi, "rules-based preview"],
  [/a recorded real-Gemini run is on the Eval page/gi, "a recorded model run is on the Eval page"],
  [/A real Gemini run is recorded/gi, "A recorded model run is on file"],
  [/real-Gemini run/gi, "recorded model run"],
  [/real-Gemini/gi, "recorded-model"],
  [/no live Gemini calls/gi, "no live model calls"],
  [/gpt-oss-120b/gi, "a hosted open model"],
  [/gemini-2\.5-[a-z-]+/gi, "a hosted model"],
  [/\bGemini\b/g, "the model"],
  [/\bGroq\b/g, ""],
  [/\bREPLAY-only\b/gi, "preview-only"],
  [/\bREPLAY\b/g, "Preview"],
  [/deterministic stub/gi, "rules-based sample"],
  [/\bstub-deterministic\b/gi, "rules-based-sample"],
  [/\bstub\b/gi, "rules-based sample"],
  [/simulated[_ ]sent/gi, "marked sent"],
  [/simulated send/gi, "preview send"],
  [/\bsynthetic\b/gi, "illustrative"],
  [/\bsimulated\b/gi, "illustrative"],
  [/\bDataSF\b/g, "a public business registry"],
  // Vendor / agency names inside the preserved diagnosis prose — never rendered raw.
  [/Stripe fraud hold/gi, "a payment-processor fraud hold"],
  [/\bStripe\b/g, "the payment processor"],
  [/IRS records/g, "official tax records"],
  [/\bIRS\b/g, "the tax authority"],
];

export function dejargon(s: string): string {
  return RULES.reduce((acc, [re, to]) => acc.replace(re, to), s).replace(/\s{2,}/g, " ").trim();
}
