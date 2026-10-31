/**
 * Instants — the one canonicalizer for every date the listings pack compares
 * (S1.5, Codex cross-check 2026-10-12 § 4).
 *
 * The staleness rules used to compare ISO-8601 STRINGS (`actual >= asOf`).
 * Text order is instant order only for one canonical spelling, and the copy
 * does not have to use it. Codex's offline probes: an expiry 100 ms in the
 * future ("…12:00:00.100Z" against "…12:00:00Z") sorted BEFORE as-of and was
 * reported expired; an already-expired instant written with a +02:00 offset
 * sorted AFTER and passed; an unparseable date passed silently. Every
 * comparison now goes through {@link parseInstant}, both sides, first.
 *
 * Accepted forms (RFC 3339 profile of ISO 8601): a calendar date
 * `YYYY-MM-DD` (read as 00:00 UTC, as ECMAScript reads it), or a date-time
 * `YYYY-MM-DDTHH:MM[:SS[.fraction]]` followed by `Z` or a `±HH:MM` offset.
 * Refused, so the caller reports them instead of guessing:
 * - a date-time with NO offset — ECMAScript reads it in the machine's local
 *   zone, so the same document would give different verdicts on different
 *   machines;
 * - impossible calendar fields that `Date.parse` silently rolls over
 *   (`2026-02-30` → 2 March; `T24:00`), out-of-range offsets, anything else.
 * Fractions beyond milliseconds are truncated (the instant is a millisecond
 * count).
 *
 * Plain: before two dates are compared, both are turned into the exact moment
 * they name — so "12:00 in Paris" and "10:00 in London" are the same moment,
 * and a date nobody can read is reported, never waved through.
 */

const FORM =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|([+-])(\d{2}):(\d{2})))?$/;

/** The accepted forms, as a reader sees them (quoted in LST-DATE-INVALID findings). */
export const INSTANT_FORMS = "a calendar date, or a date-time with Z or a ±HH:MM offset";

/** Days in a 1-indexed month of a (proleptic Gregorian) year — day 0 of the next month. */
function daysIn(year: number, month: number): number {
  const t = new Date(0);
  t.setUTCFullYear(year, month, 0);
  return t.getUTCDate();
}

/**
 * The instant a date string names, in epoch milliseconds — or `null` when the
 * value is not one of the accepted forms (or is not a string at all).
 */
export function parseInstant(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const m = FORM.exec(raw);
  if (!m) return null;
  const [, ys, mos, ds, hs, mis, ss, frac, zone, sign, ohs, oms] = m;
  const year = Number(ys);
  const month = Number(mos);
  const day = Number(ds);
  if (month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) return null;
  const hour = hs === undefined ? 0 : Number(hs);
  const minute = mis === undefined ? 0 : Number(mis);
  const second = ss === undefined ? 0 : Number(ss);
  if (hour > 23 || minute > 59 || second > 59) return null;
  const millis = frac === undefined ? 0 : Number(frac.slice(0, 3).padEnd(3, "0"));
  let offsetMinutes = 0;
  if (zone !== undefined && zone !== "Z") {
    const oh = Number(ohs);
    const om = Number(oms);
    if (oh > 23 || om > 59) return null;
    offsetMinutes = (sign === "-" ? -1 : 1) * (oh * 60 + om);
  }
  // setUTCFullYear, not Date.UTC: Date.UTC maps years 0–99 to 1900–1999.
  const t = new Date(0);
  t.setUTCFullYear(year, month - 1, day);
  t.setUTCHours(hour, minute, second, millis);
  return t.getTime() - offsetMinutes * 60_000;
}
