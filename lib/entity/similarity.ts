/**
 * E4 — deterministic string-similarity primitives for the advisory ensemble
 * (pre-reg §1: token-set / Jaro-Winkler / phonetic; $0, no deps, no LLM).
 *
 * Plain: three different rulers for "how alike are these two names" — letter
 * order, shared words, and sound-alike codes — each pure arithmetic.
 */

/** Jaro similarity (standard definition). */
function jaro(a: string, b: string): number {
  if (a === b) return 1;
  const la = a.length;
  const lb = b.length;
  if (la === 0 || lb === 0) return 0;
  const window = Math.max(0, Math.floor(Math.max(la, lb) / 2) - 1);
  const aMatched = new Array<boolean>(la).fill(false);
  const bMatched = new Array<boolean>(lb).fill(false);
  let matches = 0;
  for (let i = 0; i < la; i += 1) {
    const from = Math.max(0, i - window);
    const to = Math.min(lb - 1, i + window);
    for (let j = from; j <= to; j += 1) {
      if (!bMatched[j] && a[i] === b[j]) {
        aMatched[i] = true;
        bMatched[j] = true;
        matches += 1;
        break;
      }
    }
  }
  if (matches === 0) return 0;
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < la; i += 1) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k += 1;
    if (a[i] !== b[k]) transpositions += 1;
    k += 1;
  }
  const t = transpositions / 2;
  return (matches / la + matches / lb + (matches - t) / matches) / 3;
}

/** Jaro-Winkler (standard p=0.1, max prefix 4). */
export function jaroWinkler(a: string, b: string): number {
  const j = jaro(a, b);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i += 1) {
    if (a[i] === b[i]) prefix += 1;
    else break;
  }
  return j + prefix * 0.1 * (1 - j);
}

/** Token-set ratio: 2·|A∩B| / (|A|+|B|) over unique whitespace tokens. */
export function tokenSetRatio(a: string, b: string): number {
  const ta = new Set(a.split(" ").filter((t) => t.length > 0));
  const tb = new Set(b.split(" ").filter((t) => t.length > 0));
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let common = 0;
  for (const t of ta) if (tb.has(t)) common += 1;
  return (2 * common) / (ta.size + tb.size);
}

/** American Soundex of one token (standard 4-char code; non-alpha → ""). */
export function soundex(token: string): string {
  const s = token.toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length === 0) return "";
  const code = (c: string): string => {
    if ("BFPV".includes(c)) return "1";
    if ("CGJKQSXZ".includes(c)) return "2";
    if ("DT".includes(c)) return "3";
    if (c === "L") return "4";
    if ("MN".includes(c)) return "5";
    if (c === "R") return "6";
    return ""; // vowels + H/W/Y
  };
  let out = s[0];
  let prev = code(s[0]);
  for (let i = 1; i < s.length && out.length < 4; i += 1) {
    const c = code(s[i]);
    if (c !== "" && c !== prev) out += c;
    if (!"HW".includes(s[i])) prev = c;
  }
  return out.padEnd(4, "0");
}

/** Phonetic similarity: token-set ratio over per-token Soundex codes. */
export function phoneticSimilarity(a: string, b: string): number {
  const codes = (s: string) => s.split(" ").filter((t) => t.length > 0).map(soundex).join(" ");
  return tokenSetRatio(codes(a), codes(b));
}
