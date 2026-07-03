/**
 * Trust-boundary helpers for the HYBRID real-data layer.
 *
 * The real open-source layer (DataSF business names) is UNTRUSTED text: a business
 * name or description can carry control chars, unbounded length, or an injection
 * payload. Every real-data field crosses these helpers before it reaches a Merchant,
 * a Gemini prompt, or a rendered surface (Law 11 / plan Blindspots: "untrusted
 * real-data surface"). One copy, used by the SF adapter (and reusable by any future
 * source adapter), so a new source can't quietly skip the boundary.
 *
 * Ported from resilix lib/signals/sanitize.ts; the all-synthetic v1 prototype had no
 * such surface, which is exactly the assumption the rebuild corrects.
 */

export const MAX_NAME_LEN = 120;
export const MAX_TEXT_LEN = 500;

/**
 * Strip control chars (C0/DEL/C1) to a space via a numeric-codepoint scan (not a
 * control-char regex), collapse whitespace, trim, cap length. Non-strings -> "".
 */
export function sanitizeText(value: unknown, maxLen: number = MAX_TEXT_LEN): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code <= 0x1f || (code >= 0x7f && code <= 0x9f) ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

/** Only http/https URLs are safe to render as a link (no javascript:/data:). */
export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
