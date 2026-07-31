/**
 * INPUT SIZE CAP — both doors share one limit (F-1, 2026-07-31).
 *
 * `docs/security/vuln-scan-2026-07-31-upload-surface.md` found the 5 MB ceiling
 * enforced on the FILE path (`FileDrop.tsx`, via `file.size`) and absent from
 * the PASTE path, so the identical document was refused as a file and accepted
 * as a paste. A limit one door enforces and the other does not is a limit on
 * one door.
 *
 * The fix put the bound in the two parsers, where both routes converge — so the
 * rule is applied once rather than by two callers agreeing to apply it. These
 * tests pin the property that made the defect possible: **the file path and the
 * paste path must refuse the same size.** A future tune of one constant cannot
 * silently reopen the gap.
 *
 * REFUSAL, NOT TRUNCATION. Truncating would hand the engine a document the
 * reader never wrote and return a verdict on it — a confident answer about the
 * wrong input, the exact defect class this product exists to catch. The tests
 * assert the refusal says so, because a reader who is not told will assume the
 * verdict covered everything they pasted.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MAX_INPUT_CHARS,
  parseAcpFeedText,
  parseCatalogText,
} from "@/components/playground/verify-in-browser";

const REPO = process.cwd();

/** Valid JSON, deliberately over the cap — refusal must come from SIZE. */
function oversizedFeed(): string {
  const pad = "x".repeat(MAX_INPUT_CHARS);
  return JSON.stringify({
    spec: "acp-product-feed/extract-2026-07-02",
    note: pad,
    items: [],
  });
}

function oversizedCatalog(): string {
  const pad = "x".repeat(MAX_INPUT_CHARS);
  return JSON.stringify({ asOf: "2026-07-03T00:00:00Z", note: pad, items: [] });
}

describe("input size cap", () => {
  it("refuses an oversized feed instead of parsing it", () => {
    const text = oversizedFeed();
    expect(text.length).toBeGreaterThan(MAX_INPUT_CHARS);

    const result = parseAcpFeedText(text);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/larger than/i);
  });

  it("refuses an oversized catalog instead of parsing it", () => {
    const text = oversizedCatalog();
    expect(text.length).toBeGreaterThan(MAX_INPUT_CHARS);

    const result = parseCatalogText(text);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/larger than/i);
  });

  it("says it did not truncate, so a reader cannot assume a partial verdict", () => {
    const feed = parseAcpFeedText(oversizedFeed());
    const catalog = parseCatalogText(oversizedCatalog());
    for (const r of [feed, catalog]) {
      expect(r.ok).toBe(false);
      if (r.ok) continue;
      // The reader must learn that NOTHING ran -- not that something ran on a
      // prefix. A silent truncation would be the worse bug.
      expect(r.error).toMatch(/not truncated/i);
      expect(r.error).toMatch(/did not supply/i);
    }
  });

  it("still accepts a document just under the cap (the bound is not a wall)", () => {
    // A refusal that fires early would be its own defect: a false refusal is as
    // dishonest as a false verdict (parseCatalogText's own stated principle).
    const items = [
      {
        id: "i1",
        name: "Thing",
        variations: [{ id: "v1", name: "Regular", priceCents: 100, stock: "in_stock" }],
      },
    ];
    const base = JSON.stringify({ asOf: "2026-07-03T00:00:00Z", items });
    const room = MAX_INPUT_CHARS - base.length - 64;
    const text = JSON.stringify({
      asOf: "2026-07-03T00:00:00Z",
      note: "y".repeat(room),
      items,
    });

    expect(text.length).toBeLessThan(MAX_INPUT_CHARS);
    const result = parseCatalogText(text);
    expect(result.ok, "a document under the cap must still parse").toBe(true);
  });

  it("the FILE path and the PASTE path enforce the SAME limit — the F-1 defect", () => {
    // This is the property, not the number. F-1 existed because FileDrop held
    // its own 5 MB constant while the parsers held none; re-introducing a
    // second literal is how the gap comes back.
    const src = readFileSync(join(REPO, "components/playground/FileDrop.tsx"), "utf8");

    expect(
      src,
      "FileDrop must derive its cap from MAX_INPUT_CHARS rather than declaring " +
        "its own. Two constants that both mean 'the limit' drift apart the first " +
        "time one is tuned — which is how the file path and the paste path came " +
        "to disagree (F-1).",
    ).toMatch(/MAX_BYTES\s*=\s*MAX_INPUT_CHARS/);

    expect(
      /const MAX_BYTES\s*=\s*\d/.test(src),
      "FileDrop declares a NUMERIC size cap again. That is the F-1 defect " +
        "returning: the file path would enforce one number and the paste path " +
        "another. Derive it from MAX_INPUT_CHARS instead.",
    ).toBe(false);
  });
});
