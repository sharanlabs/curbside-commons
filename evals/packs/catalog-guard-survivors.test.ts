/**
 * THE TWO GUARDS NOTHING WAS WATCHING (finding 4, 2026-07-31).
 *
 * The mutation pass declared ten mutants against the shipping engine and killed
 * eight. These two SURVIVED — the suite stayed fully green with the behaviour
 * deliberately broken:
 *
 *   M06  accept a non-UTC `asOf`      -> staleness verdicts silently reverse
 *   M07  accept a non-USD catalog     -> every row reports a false mismatch
 *
 * Both guards were added by session 38's cross-model gate (findings 5 and 6).
 * Both were correct. Neither had a test. Deleting either one left 1,578 tests
 * green, which means the gate's fix was protected by nothing but the fact that
 * no one had touched that function since.
 *
 * WHY THE SUITE MISSED THEM, and it is not carelessness: several tests DO pass
 * `currency: "USD"` and a valid `asOf` — they set the fields correctly and move
 * on to what they were written to check. No test ever hands the parser a BAD
 * one. A field that every fixture supplies correctly is a field whose validator
 * is never exercised. That is the same shape as session 38's tautological reset
 * assertion, where deleting the line under test left it green.
 *
 * Each test below therefore asserts the REFUSAL, and asserts it for the stated
 * reason — a guard that refuses for the wrong reason is a guard that will be
 * "fixed" by the next person who reads the error message.
 */
import { describe, expect, it } from "vitest";
import { parseCatalogText } from "@/components/playground/verify-in-browser";

const item = {
  id: "i1",
  name: "Thing",
  variations: [{ id: "v1", name: "Regular", priceCents: 100, stock: "in_stock" }],
};

const catalog = (over: Record<string, unknown>) =>
  JSON.stringify({ asOf: "2026-07-03T00:00:00Z", items: [item], ...over });

describe("catalog guards the mutation pass found unwatched", () => {
  describe("M06 — `asOf` must be a canonical UTC instant", () => {
    // `asOf` is compared LEXICALLY downstream. That is only correct for a
    // canonical UTC form: a local-offset stamp sorts by its literal digits, so
    // a catalog can be judged fresh when it is stale, or the reverse. The
    // verdict flips silently -- there is no error for a reader to notice.
    const rejected: ReadonlyArray<readonly [string, string]> = [
      ["local-offset stamp", "2026-07-03T00:00:00+05:30"],
      ["date only, no time", "2026-07-03"],
      ["free-form date", "July 3, 2026"],
      ["not a date at all", "not-a-date"],
      ["empty string", ""],
      ["plausible but unanchored", "2026-07-03T00:00:00"],
    ];

    for (const [label, value] of rejected) {
      it(`refuses a ${label}`, () => {
        const r = parseCatalogText(catalog({ asOf: value }));
        expect(r.ok, `\`asOf\` of "${value}" must be refused`).toBe(false);
        if (r.ok) return;
        // Refused for the RIGHT reason: an empty asOf could also trip the
        // presence check, so the message must name the format problem when the
        // value is present at all.
        if (value !== "") {
          expect(r.error).toMatch(/ISO-8601|UTC/i);
        }
      });
    }

    const accepted = ["2026-07-03T00:00:00Z", "2026-07-03T00:00:00.000Z"];
    for (const value of accepted) {
      it(`accepts the canonical form ${value}`, () => {
        // A false refusal is as dishonest as a false verdict: the repo's own
        // fixtures use the second-precision form, and both sort correctly as
        // text because the fractional part comes after every field outranking it.
        const r = parseCatalogText(catalog({ asOf: value }));
        expect(r.ok, `${value} is canonical UTC and must parse`).toBe(true);
      });
    }
  });

  describe("M07 — a non-USD catalog must be refused, not silently compared", () => {
    // The engine compares a feed's currency against the catalog's own and every
    // price is integer cents. Accepting a EUR catalog would compare it against
    // USD feed prices and report a mismatch on every row -- findings that look
    // like the merchant's fault and are entirely the tool's.
    for (const currency of ["EUR", "GBP", "usd", "JPY"]) {
      it(`refuses a catalog priced in ${currency}`, () => {
        const r = parseCatalogText(catalog({ currency }));
        expect(r.ok, `${currency} must be refused, not coerced`).toBe(false);
        if (r.ok) return;
        expect(r.error).toContain(currency);
        expect(r.error).toMatch(/USD/);
      });
    }

    it("accepts USD, and accepts the field being absent", () => {
      expect(parseCatalogText(catalog({ currency: "USD" })).ok).toBe(true);
      expect(parseCatalogText(catalog({})).ok).toBe(true);
    });

    it("refuses lowercase `usd` rather than normalising it", () => {
      // Deliberate: the parser's stated contract is that it never coerces. A
      // parser that quietly upcases one field invites the reader to assume it
      // repairs others -- and the repairs a reader cannot see are the ones that
      // produce a verdict about something they did not write.
      const r = parseCatalogText(catalog({ currency: "usd" }));
      expect(r.ok).toBe(false);
    });
  });
});
