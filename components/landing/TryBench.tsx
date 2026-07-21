"use client";

import { useState } from "react";

/**
 * TryBench — the Home "Break the feed yourself" instrument (v9 takeover build,
 * 2026-07-20). The check is the REAL rule arithmetic (cents-as-decimal), run
 * locally in the browser against the merchant record value that arrives via
 * props from lib/landing/specimen.ts. Nothing is sent anywhere.
 *
 * D6 ruling applied over the mockup: the HELD verdict chip/edge is GOLD
 * (held-status voice) — the mockup's ember here was the recorded defect; the
 * ≠ arithmetic line keeps reading as evidence inside the panel text.
 * D2 ruling: the no-JS fallback rows live INSIDE <noscript>, so they can never
 * overprint the live input when JS runs. SSR renders the opening HELD verdict
 * (the feed's claim), so the no-JS story is complete.
 */

export type TryBenchData = {
  recordCents: number; // 2150
  servedDefault: string; // "2150"
  truePrice: string; // "21.50"
  plainMismatch: string; // "24.00"
  ruleId: string; // LST-PRICE-CENTS-AS-DECIMAL
  recordRow: string; // price_cents · 2150¢ = $21.50
  servedRow: string; // offers.price · 2150.00 USD
};

type Verdict = {
  state: "held" | "pass" | "invalid";
  chip: string;
  lines: string[];
};

const fmt = (n: number) => n.toLocaleString("en-US");

/** The one-rule check — mirrors the engine's cents-as-decimal arithmetic.
 * Exported for the equivalence pack (evals/packs/landing-trybench-equivalence):
 * every verdict class this bench can produce is pinned to the REAL verifier's
 * behavior on the same input, so the page's "real rule arithmetic" claim has
 * a tooth — a drift here fails the pack, never ships silently. */
export function checkServedPrice(text: string, recordCents: number): Verdict {
  const t = text.trim();
  const valid = /^[0-9]+(\.[0-9]{1,2})?$/.test(t);
  const v = valid ? parseFloat(t) : NaN;
  if (Number.isNaN(v)) {
    return {
      state: "invalid",
      chip: "NOT A PRICE",
      lines: ["The served value must be a plain decimal amount (like 21.50 or 2150)."],
    };
  }
  const claimCents = Math.round(v * 100);
  if (claimCents === recordCents) {
    return {
      state: "pass",
      chip: "PASS",
      lines: [
        `served ${t} read as dollars → ${fmt(claimCents)}¢`,
        `merchant record → ${fmt(recordCents)}¢`,
        `${fmt(claimCents)}¢ = ${fmt(recordCents)}¢ — the claim agrees with the record.`,
      ],
    };
  }
  const ratio = claimCents / recordCents;
  const mult = claimCents % recordCents === 0 && ratio >= 2;
  const ratioLine = mult
    ? ` — the claim is ×${fmt(ratio)} the record.`
    : " — the claim does not agree with the record.";
  const lines = [
    `served ${t} read as dollars → ${fmt(claimCents)}¢`,
    `merchant record → ${fmt(recordCents)}¢`,
    `${fmt(claimCents)}¢ ≠ ${fmt(recordCents)}¢${ratioLine}`,
  ];
  if (v === recordCents) {
    lines.push(
      "The served number equals the merchant's cent count: the cents-as-decimal signature.",
    );
  }
  return {
    state: "held",
    chip: mult ? `HELD ×${fmt(ratio)}` : "HELD",
    lines,
  };
}

export function TryBench({ data }: { data: TryBenchData }) {
  const [value, setValue] = useState(data.servedDefault);
  const verdict = checkServedPrice(value, data.recordCents);

  const presets: Array<{ v: string; note: string }> = [
    { v: data.truePrice, note: "the true price" },
    { v: data.servedDefault, note: "the feed's claim" },
    { v: data.plainMismatch, note: "a plain mismatch" },
  ];

  return (
    <div className="try">
      <div className="try-form">
        <div className="live-form">
          <label htmlFor="served-input">SERVED PRICE (EDIT ME)</label>
          <input
            className="mono"
            id="served-input"
            inputMode="decimal"
            value={value}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="try-verdict"
            onChange={(ev) => setValue(ev.target.value)}
          />
          <div className="presets" style={{ marginTop: 10 }}>
            {presets.map((p) => (
              <button key={p.v} type="button" className="preset" onClick={() => setValue(p.v)}>
                <b>{p.v}</b>&nbsp;· {p.note}
              </button>
            ))}
          </div>
        </div>
        <p className="fixedrow">
          <span>MERCHANT RECORD</span>
          <span>{data.recordRow}</span>
        </p>
        <p className="fixedrow">
          <span>RULE</span>
          <span>{data.ruleId}</span>
        </p>
        <p className="try-note">
          The check on this page is the real rule arithmetic, run locally in your browser. Nothing
          is sent anywhere.
        </p>
        {/* No-JS (D2-safe by construction): the editable form is dead without
            scripting — hide it and state the served value as a fixed row. The
            SSR verdict panel already shows the feed's claim held. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".try .live-form{display:none}",
            }}
          />
          <p className="fixedrow">
            <span>SERVED PRICE</span>
            <span>{data.servedRow}</span>
          </p>
        </noscript>
      </div>
      <div className={`try-verdict ${verdict.state}`} id="try-verdict" aria-live="polite">
        <span className="v-chip">{verdict.chip}</span>
        <div>
          {verdict.lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
