/**
 * S2-ledger CP3 — BUDGET TRUTH: settleCall overflow stop, unknown usage charged
 * at the reservation, cumulative $ cap, RPD / TPD fail-closed counters, and the
 * $0 free-tier pricing rows (which price to 0 but still COUNT).
 *
 * MUTATION PROOFS (lib/agents/budget.ts / pricing.ts, 2026-10-31; counts in the
 * return packet):
 *  M1  settleCall: drop the overflow `throw`/halt            -> RED "overflow halts"
 *  M2  settleCall: unknown usage booked as 0                 -> RED "unknown usage charged at reservation"
 *  M3  canCall: skip the RPD check                           -> RED "RPD fails closed"
 *  M4  canCall: skip the TPD check                           -> RED "TPD fails closed"
 *  M5  pricing: a free row deleted                           -> RED "$0 rows" (unknown-model throw)
 */
import { describe, expect, it } from "vitest";

import {
  BudgetBlockedError,
  BudgetExceededError,
  BudgetOverflowError,
  canCall,
  createBudgetLedger,
  dayKeyOf,
  reserveCall,
  settleCall,
  type BudgetClock,
} from "@/lib/agents/budget.ts";
import { GEMINI_PRICING, PRICING_VERSION, costUsd, freeTierLimits } from "@/lib/agents/pricing.ts";

const D1 = Date.UTC(2026, 9, 31, 12, 0, 0);
const D2 = Date.UTC(2026, 10, 1, 0, 0, 1);
const at = (ms: number): BudgetClock => ({ nowMs: () => ms });
const groqCaps = () => {
  const l = freeTierLimits("openai/gpt-oss-120b");
  if (l === null) throw new Error("fixture: groq limits missing");
  return { rpdCap: l.rpd, tpdCap: l.tpd };
};
const mk = (capUsd = 5) => createBudgetLedger({ capUsd, providers: { groq: groqCaps(), gemini: { rpdCap: null, tpdCap: null } } });

describe("settleCall — the post-call overflow stop", () => {
  it("overflow halts: billed above the reservation throws BudgetOverflowError, marks the ledger halted, and blocks the next call", () => {
    const l = mk();
    const r = reserveCall(l, "gemini", { costUsd: 0.01, tokens: 100 }, at(D1));
    expect(() => settleCall(r, { costUsd: 0.05 })).toThrow(BudgetOverflowError);
    expect(l.halted).toBe(true);
    expect(l.spentUsd).toBeCloseTo(0.05, 10); // the truth is booked even on overflow
    expect(l.reservedUsd).toBe(0);
    const v = canCall(l, "gemini", { costUsd: 0, tokens: 1 }, at(D1));
    expect(v).toMatchObject({ ok: false, code: "HALTED" });
    expect(() => reserveCall(l, "gemini", { costUsd: 0, tokens: 1 }, at(D1))).toThrow(BudgetBlockedError);
  });

  it("within the reservation settles quietly and books actual spend", () => {
    const l = mk();
    const r = reserveCall(l, "gemini", { costUsd: 0.02, tokens: 100 }, at(D1));
    settleCall(r, { costUsd: 0.015, tokens: 80 });
    expect(l.halted).toBe(false);
    expect(l.spentUsd).toBeCloseTo(0.015, 10);
    expect(l.reservedUsd).toBe(0);
    expect(l.providers.gemini.tokensToday).toBe(80); // trued up from the 100 reserved
    expect(l.calls).toBe(1);
  });

  it("unknown usage is charged at the RESERVATION, never zero (undefined usage, missing / NaN / negative cost)", () => {
    for (const usage of [undefined, {}, { tokens: 5 }, { costUsd: Number.NaN }, { costUsd: -1 }] as const) {
      const l = mk();
      const r = reserveCall(l, "gemini", { costUsd: 0.03, tokens: 100 }, at(D1));
      settleCall(r, usage);
      expect(l.spentUsd, JSON.stringify(usage)).toBeCloseTo(0.03, 10);
      expect(l.halted).toBe(false);
    }
  });

  it("a reservation settles once", () => {
    const l = mk();
    const r = reserveCall(l, "gemini", { costUsd: 0.01, tokens: 1 }, at(D1));
    settleCall(r, { costUsd: 0.01 });
    expect(() => settleCall(r, { costUsd: 0.01 })).toThrow(/already settled/);
    expect(l.spentUsd).toBeCloseTo(0.01, 10);
  });
});

describe("cumulative $ cap", () => {
  it("fails closed when spent + reserved + next would pass the cap (reservations count)", () => {
    const l = mk(1);
    reserveCall(l, "gemini", { costUsd: 0.6, tokens: 1 }, at(D1)); // reserved, not yet settled
    expect(canCall(l, "gemini", { costUsd: 0.5, tokens: 1 }, at(D1))).toMatchObject({ ok: false, code: "USD_CAP" });
    expect(() => reserveCall(l, "gemini", { costUsd: 0.5, tokens: 1 }, at(D1))).toThrow(BudgetExceededError);
    expect(canCall(l, "gemini", { costUsd: 0.4, tokens: 1 }, at(D1)).ok).toBe(true); // exactly at the cap is allowed
  });

  it("garbage in -> closed: NaN / negative estimates and an unregistered provider are refused", () => {
    const l = mk();
    expect(canCall(l, "gemini", { costUsd: Number.NaN, tokens: 1 }, at(D1)).code).toBe("BAD_INPUT");
    expect(canCall(l, "gemini", { costUsd: 0, tokens: -5 }, at(D1)).code).toBe("BAD_INPUT");
    expect(canCall(l, "mystery", { costUsd: 0, tokens: 1 }, at(D1)).code).toBe("UNKNOWN_PROVIDER");
    expect(() => createBudgetLedger({ capUsd: 0 })).toThrow(/positive/);
  });

  it("the ledger is plain JSON: it round-trips and keeps gating", () => {
    const l = mk();
    reserveCall(l, "groq", { costUsd: 0, tokens: 1000 }, at(D1));
    const back = JSON.parse(JSON.stringify(l));
    expect(back).toEqual(l);
    expect(canCall(back, "groq", { costUsd: 0, tokens: 1000 }, at(D1)).ok).toBe(true);
  });
});

describe("free-tier counters (Groq RPD 1,000 / TPD 200,000)", () => {
  it("RPD fails closed at the 1,001st request of the day", () => {
    const l = mk();
    for (let i = 0; i < 1000; i++) settleCall(reserveCall(l, "groq", { costUsd: 0, tokens: 1 }, at(D1)), { costUsd: 0, tokens: 1 });
    expect(l.providers.groq.requestsToday).toBe(1000);
    expect(canCall(l, "groq", { costUsd: 0, tokens: 1 }, at(D1))).toMatchObject({ ok: false, code: "RPD" });
    expect(() => reserveCall(l, "groq", { costUsd: 0, tokens: 1 }, at(D1))).toThrow(/RPD/);
  });

  it("TPD fails closed when the next call would pass 200,000 tokens, and lets a call that fits exactly through", () => {
    const l = mk();
    reserveCall(l, "groq", { costUsd: 0, tokens: 150_000 }, at(D1));
    expect(canCall(l, "groq", { costUsd: 0, tokens: 50_001 }, at(D1))).toMatchObject({ ok: false, code: "TPD" });
    expect(canCall(l, "groq", { costUsd: 0, tokens: 50_000 }, at(D1)).ok).toBe(true);
  });

  it("the TPD arithmetic from the Codex review: 60 cases x 3 runs x 2,000 input tokens (360,000) cannot fit one day", () => {
    const l = mk();
    let ran = 0;
    for (let i = 0; i < 180; i++) {
      if (!canCall(l, "groq", { costUsd: 0, tokens: 2000 }, at(D1)).ok) break;
      reserveCall(l, "groq", { costUsd: 0, tokens: 2000 }, at(D1));
      ran++;
    }
    expect(ran).toBe(100); // 200,000 / 2,000, then closed
    expect(canCall(l, "groq", { costUsd: 0, tokens: 2000 }, at(D1)).code).toBe("TPD");
  });

  it("counters restart on a new UTC day; the old day's counts do not block it", () => {
    const l = mk();
    reserveCall(l, "groq", { costUsd: 0, tokens: 199_000 }, at(D1));
    expect(canCall(l, "groq", { costUsd: 0, tokens: 5_000 }, at(D1)).code).toBe("TPD");
    expect(dayKeyOf(D1)).not.toBe(dayKeyOf(D2));
    expect(canCall(l, "groq", { costUsd: 0, tokens: 5_000 }, at(D2)).ok).toBe(true);
    reserveCall(l, "groq", { costUsd: 0, tokens: 5_000 }, at(D2));
    expect(l.providers.groq).toMatchObject({ requestsToday: 1, tokensToday: 5_000, dayKey: dayKeyOf(D2) });
  });

  it("token overshoot on a free call is recorded, and the next call is then refused by TPD", () => {
    const l = mk();
    const r = reserveCall(l, "groq", { costUsd: 0, tokens: 100_000 }, at(D1));
    settleCall(r, { costUsd: 0, tokens: 190_000 });
    expect(l.providers.groq.tokensToday).toBe(190_000);
    expect(canCall(l, "groq", { costUsd: 0, tokens: 20_000 }, at(D1)).code).toBe("TPD");
  });
});

describe("$0 pricing rows", () => {
  const FREE = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "gpt-oss:20b", "qwen3:8b"];

  it("version bumped; every free id is tier free, prices to $0, and carries its documented limits as data", () => {
    expect(PRICING_VERSION).toBe("2026-10-31");
    for (const id of FREE) {
      expect(GEMINI_PRICING[id].tier, id).toBe("free");
      expect(costUsd(id, 123_456, 654_321), id).toBe(0);
    }
    for (const id of FREE.slice(0, 3)) {
      expect(freeTierLimits(id)).toEqual({ rpm: 30, rpd: 1_000, tpm: 8_000, tpd: 200_000 });
    }
    expect(freeTierLimits("gpt-oss:20b")).toBeNull(); // local: no provider quota
    expect(freeTierLimits("gemini-3.8-flash")).toBeNull(); // paid rows carry no free limits
  });

  it("a $0 call still COUNTS requests and tokens in the ledger", () => {
    const l = mk();
    const cost = costUsd("openai/gpt-oss-120b", 1_500, 500);
    expect(cost).toBe(0);
    const r = reserveCall(l, "groq", { costUsd: cost, tokens: 2_000 }, at(D1));
    settleCall(r, { costUsd: 0, tokens: 1_800 });
    expect(l.spentUsd).toBe(0);
    expect(l.providers.groq).toMatchObject({ requestsToday: 1, tokensToday: 1_800 });
  });

  it("an unknown id still throws (never silently $0); the paid rows are unchanged", () => {
    expect(() => costUsd("openai/gpt-oss-999b", 10, 10)).toThrow(/not in the pinned pricing table/);
    expect(() => costUsd("gpt-oss:20b-typo", 10, 10)).toThrow(/not in the pinned pricing table/);
    expect(costUsd("gemini-3.5-flash-lite", 1_000_000, 1_000_000)).toBeCloseTo(2.8, 10);
  });
});
