/**
 * Fee-statement parser — F1a (plan §5 F1 item 3).
 *
 * Raw JSON → typed {@link MonthlyStatement}. Every malformed input fails LOUD
 * with a typed {@link StatementParseError}: missing/empty fields, non-integer or
 * negative money, a bad "YYYY-MM" month, a non-boolean flag, a refund without a
 * date, an unknown top-level shape. NOTHING is silently defaulted — a statement
 * that does not parse cleanly is never audited on guessed values (that would let
 * a real over-charge slip through on a coercion).
 *
 * Plain: the bill-reader. It only accepts a bill whose every line is well-formed;
 * anything missing or malformed is rejected out loud, never quietly patched.
 */
import type {
  MonthlyStatement,
  StatementLine,
  StatementMeta,
} from "./statement.ts";

/** Thrown on any malformed statement input — carries a precise, typed reason. */
export class StatementParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatementParseError";
  }
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function requireString(v: unknown, path: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new StatementParseError(`${path} must be a non-empty string`);
  }
  return v;
}

function requireIntCents(v: unknown, path: string, opts: { min: number }): number {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    throw new StatementParseError(`${path} must be an integer number of cents (no floats)`);
  }
  if (v < opts.min) {
    throw new StatementParseError(`${path} must be >= ${opts.min} (got ${v})`);
  }
  return v;
}

function requireBoolean(v: unknown, path: string): boolean {
  if (typeof v !== "boolean") {
    throw new StatementParseError(`${path} must be a boolean`);
  }
  return v;
}

function requireMonth(v: unknown, path: string): string {
  const s = requireString(v, path);
  if (!MONTH_RE.test(s)) {
    throw new StatementParseError(`${path} must be a "YYYY-MM" month (got "${s}")`);
  }
  return s;
}

function requireDate(v: unknown, path: string): string {
  const s = requireString(v, path);
  if (!DATE_RE.test(s)) {
    throw new StatementParseError(`${path} must be a "YYYY-MM-DD" date (got "${s}")`);
  }
  return s;
}

function parseMeta(raw: unknown): StatementMeta {
  if (!isObject(raw)) throw new StatementParseError("meta must be an object");
  if (raw.simulated !== true) {
    throw new StatementParseError('meta.simulated must be the literal true (honesty marker, C10)');
  }
  if (!isObject(raw.generator)) {
    throw new StatementParseError("meta.generator must be an object");
  }
  const g = raw.generator;
  if (typeof g.seed !== "number" || !Number.isInteger(g.seed)) {
    throw new StatementParseError("meta.generator.seed must be an integer");
  }
  if (raw.currency !== "USD") {
    throw new StatementParseError(`meta.currency must be "USD" (got ${JSON.stringify(raw.currency)})`);
  }
  return {
    simulated: true,
    generator: {
      name: requireString(g.name, "meta.generator.name"),
      seed: g.seed,
      version: requireString(g.version, "meta.generator.version"),
    },
    merchant: requireString(raw.merchant, "meta.merchant"),
    month: requireMonth(raw.month, "meta.month"),
    currency: "USD",
    asOf: requireDate(raw.asOf, "meta.asOf"),
    purchasePriceBaseConvention: requireString(
      raw.purchasePriceBaseConvention,
      "meta.purchasePriceBaseConvention",
    ),
  };
}

function parseLine(raw: unknown, i: number): StatementLine {
  const at = `lines[${i}]`;
  if (!isObject(raw)) throw new StatementParseError(`${at} must be an object`);
  const isRefund = requireBoolean(raw.isRefund, `${at}.isRefund`);
  const refundedAtDate =
    raw.refundedAtDate === undefined
      ? undefined
      : requireDate(raw.refundedAtDate, `${at}.refundedAtDate`);
  if (isRefund && refundedAtDate === undefined) {
    throw new StatementParseError(
      `${at}.refundedAtDate is required when isRefund is true (a dateless refund cannot satisfy the §20-563.3(e) window)`,
    );
  }
  if (!isRefund && refundedAtDate !== undefined) {
    throw new StatementParseError(`${at}.refundedAtDate is only valid on a refund line (isRefund=true)`);
  }
  return {
    orderId: requireString(raw.orderId, `${at}.orderId`),
    month: requireMonth(raw.month, `${at}.month`),
    declaredCategory: requireString(raw.declaredCategory, `${at}.declaredCategory`),
    label: requireString(raw.label, `${at}.label`),
    amountCents: requireIntCents(raw.amountCents, `${at}.amountCents`, { min: 0 }),
    orderPurchasePriceCents: requireIntCents(
      raw.orderPurchasePriceCents,
      `${at}.orderPurchasePriceCents`,
      { min: 1 },
    ),
    isRefund,
    passthroughDocumented: requireBoolean(raw.passthroughDocumented, `${at}.passthroughDocumented`),
    ...(refundedAtDate !== undefined ? { refundedAtDate } : {}),
  };
}

/**
 * Parse raw JSON text or a parsed value into a typed {@link MonthlyStatement}.
 * Throws {@link StatementParseError} on any malformed input — never coerces.
 */
export function parseStatement(input: unknown): MonthlyStatement {
  const raw = typeof input === "string" ? parseJsonText(input) : input;
  if (!isObject(raw)) {
    throw new StatementParseError("statement must be a JSON object with { meta, lines }");
  }
  if (!Array.isArray(raw.lines)) {
    throw new StatementParseError("statement.lines must be an array");
  }
  const meta = parseMeta(raw.meta);
  const lines = raw.lines.map((l, i) => parseLine(l, i));
  // A statement is MONTHLY: the audit sums every line against meta.month's caps
  // and refund window, so a line from another month would corrupt the monthly
  // averages and e-1 cure logic (M2 Codex finding #3). Reject loudly, never coerce.
  for (const [i, line] of lines.entries()) {
    if (line.month !== meta.month) {
      throw new StatementParseError(
        `lines[${i}].month "${line.month}" does not match meta.month "${meta.month}" — a monthly statement must not mix months`,
      );
    }
  }
  return { meta, lines };
}

function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new StatementParseError(
      `statement is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
