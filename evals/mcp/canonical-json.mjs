/**
 * Canonical-JSON helper shared by the A1 MCP tests and the transcript
 * recorder (plan §5 row A1, AC-4).
 *
 * WHY THIS EXISTS (documented normalization, per the dispatch packet's
 * "if the SDK injects nondeterminism, normalize it ... and document exactly
 * what is normalized"): the MCP TypeScript SDK's wire types (`Tool.inputSchema`
 * in particular) are Zod OBJECTS with a few explicitly declared keys
 * (`type`, `properties`, `required`) plus a catchall for the rest. When a
 * `tools/list` response round-trips through the SDK client's own
 * `ListToolsResultSchema.parse(...)`, Zod reconstructs each `inputSchema`
 * object with its DECLARED keys first (in the schema's own declaration
 * order), then the catchall (`$schema`, `$id`, `title`,
 * `additionalProperties`, ...) appended afterwards — a different key ORDER
 * than the committed schema file on disk, even though every key and value is
 * unchanged. A raw `JSON.stringify(a) === JSON.stringify(b)` byte comparison
 * would therefore spuriously fail on key order alone, not on any real content
 * drift. `canonicalize` recursively sorts every plain object's keys
 * (alphabetically) before stringification so the comparison is byte-equal ON
 * THE CANONICAL FORM — i.e. genuinely order-independent equality, the only
 * property either the packet's "byte-equal" intent or a JSON-Schema-in-JSON
 * comparison can honestly claim once one leg of the comparison has gone
 * through a lossy-to-order library. Arrays are left in their original
 * order (`required` arrays, `enum` arrays, etc. are semantically
 * order-SENSITIVE per JSON Schema, so sorting them would be wrong).
 *
 * Plain: the SDK's own libraries re-shuffle a JSON Schema's field ORDER on
 * the way through (never its meaning) — this puts both copies back into one
 * fixed, predictable order before comparing, so the comparison is honest
 * about content instead of tripping on cosmetic ordering.
 */

/** @param {unknown} value */
export function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map((v) => canonicalize(v));
  }
  if (value !== null && typeof value === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = canonicalize(/** @type {Record<string, unknown>} */ (value)[key]);
    }
    return out;
  }
  return value;
}

/** @param {unknown} value */
export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}
