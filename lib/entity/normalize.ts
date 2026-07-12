/**
 * E4 — name normalization, incl. the BASELINE chain frozen by pre-reg
 * AMENDMENT A2, EXACTLY: NFKC → casefold → collapse whitespace → strip
 * punctuation → strip the enumerated legal-suffix list {llc, inc, corp, co,
 * ltd, dba, d.b.a.} (after punctuation-strip, "d.b.a." IS "dba", so the
 * token list is {llc, inc, corp, co, ltd, dba}, removed only as trailing
 * tokens, repeatedly). No post-hoc changes — any change = a new
 * pre-registration.
 *
 * Plain: the standard cleanup both the dumb baseline and the fancier matcher
 * share — lowercase it, tidy the spaces and dots, drop "LLC"-style tails —
 * locked in writing before any grading happened.
 */

const LEGAL_SUFFIX_TOKENS = new Set(["llc", "inc", "corp", "co", "ltd", "dba"]);

/** The A2 baseline normalization chain (frozen). */
export function baselineNormalize(name: string): string {
  const cleaned = name
    .normalize("NFKC")
    .toLowerCase() // casefold (ASCII-adequate for this fictional corpus; NFKC precedes)
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
  const tokens = cleaned.split(" ").filter((t) => t.length > 0);
  while (tokens.length > 1 && LEGAL_SUFFIX_TOKENS.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  return tokens.join(" ");
}

/** Baseline matcher (the PROTECTED DEFAULT): SAME iff normalized-exact equal; never abstains. */
export function baselineVerdict(a: string, b: string): "SAME" | "DIFFERENT" {
  return baselineNormalize(a) === baselineNormalize(b) ? "SAME" : "DIFFERENT";
}
