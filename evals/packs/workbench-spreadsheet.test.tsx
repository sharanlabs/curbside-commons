// @vitest-environment jsdom
/**
 * THE SPREADSHEET DOOR, MOUNTED — S2 of docs/plan-testable-instrument-2026-09-01.md.
 *
 * The e2e spec (evals/e2e/spreadsheet.spec.ts) drives a real browser and is the
 * final word; it runs in CI. This file exists because this seat cannot launch
 * Chromium (SIGSEGV / SIGABRT under the sandbox, both raw on record, 2026-09-01)
 * and a slice that changes what the workbench DOES must not ship on unit tests
 * of its parts alone. So the real components are mounted in jsdom and driven
 * through their real events: a File through the native input, text through the
 * paste box, a click on Run, and the slab read back — the same seams a reader
 * uses, short of pixels.
 *
 * Deliberately NOT asserted here: layout, colour, focus order, downloads' bytes
 * (the download path needs `URL.createObjectURL`, which jsdom lacks — the bytes
 * are proven equal to the committed templates in csv-input-dispatch.test.ts).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AuditWorkbench } from "@/components/playground/AuditWorkbench";
import { VerdictSlab } from "@/components/landing/VerdictSlab";
import { IDLE_RUN, publishRun } from "@/components/landing/run-bus";
import { VERDICT_IDLE } from "@/lib/landing/specimen";

const FIX = join(process.cwd(), "fixtures", "synthetic-restaurant", "csv");
const publishedCsv = readFileSync(join(FIX, "menu-as-published.csv"), "utf8");
const recordCsv = readFileSync(join(FIX, "menu-record.csv"), "utf8");

beforeAll(() => {
  // jsdom has no matchMedia. The workbench reads prefers-reduced-motion at
  // click time; "reduce" makes it publish the settled run synchronously, which
  // is also what every e2e spec does (emulateMedia reducedMotion).
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  // The run bus is module-level state; reset it so one test's verdict cannot
  // leak into the next one's "idle" assertion.
  act(() => publishRun(IDLE_RUN));
});

/** A feed spreadsheet that agrees with the record spreadsheet in every read field. */
function faithfulFeedFrom(rec: string): string {
  const [header, ...rows] = rec.trim().split("\n");
  expect(header).toBe("item_id,name,variation,price,stock,as_of,group");
  const parsed = rows.map((r) => r.split(","));
  const per = new Map<string, number>();
  for (const r of parsed) per.set(r[6], (per.get(r[6]) ?? 0) + 1);
  const out = ["item_id,name,variation,price,sale_price,currency,availability,available_from,expires,searchable,buyable,group"];
  for (const [id, name, variation, price, stock, , group] of parsed) {
    if (stock === "hidden") continue;
    const title = (per.get(group) ?? 1) > 1 ? `${name} (${variation})` : name;
    out.push([id, title, variation, price, "", "USD", stock === "sold out" ? "out of stock" : "in stock", "", "", "yes", "yes", group].join(","));
  }
  return out.join("\n") + "\n";
}

function mount() {
  const utils = render(
    <>
      <AuditWorkbench />
      <VerdictSlab idle={VERDICT_IDLE} />
    </>,
  );
  const slot = (label: string) => {
    const el = screen.getByText(label).closest(".wk-zone");
    if (!(el instanceof HTMLElement)) throw new Error(`no slot for ${label}`);
    return el;
  };
  const fileInput = (label: string) => {
    const input = slot(label).querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("no file input");
    return input;
  };
  const paste = (label: string) => {
    const ta = slot(label).querySelector("textarea");
    if (!(ta instanceof HTMLTextAreaElement)) throw new Error("no textarea");
    return ta;
  };
  const run = () => fireEvent.click(screen.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }));
  const liveSlab = () => document.querySelector('.wk-slab[data-live="true"]');
  return { ...utils, slot, fileInput, paste, run, liveSlab };
}

/** Drop a file through the NATIVE input — FileReader is jsdom's own, asynchronous. */
async function dropFile(input: HTMLInputElement, name: string, text: string) {
  const file = new File([text], name, { type: "text/csv" });
  fireEvent.change(input, { target: { files: [file] } });
}

describe("the workbench reads spreadsheets through both doors and the slab tells the truth about them", () => {
  it("the two templates dropped through the file inputs reproduce the bundled pair's verdict, labelled as the reader's", async () => {
    const w = mount();
    expect(document.querySelector('.wk-slab[data-live="false"]')).not.toBeNull();

    await dropFile(w.fileInput("The feed"), "menu-as-published.csv", publishedCsv);
    await dropFile(w.fileInput("The record"), "menu-record.csv", recordCsv);
    await waitFor(() => expect(w.slot("The feed")).toHaveTextContent(/25 rows read from a spreadsheet/));
    await waitFor(() => expect(w.slot("The record")).toHaveTextContent(/12 items read from a spreadsheet/));
    expect(w.slot("The feed")).toHaveTextContent("menu-as-published.csv");

    w.run();
    await waitFor(() => expect(w.liveSlab()).not.toBeNull());
    const slab = w.liveSlab() as HTMLElement;
    expect(within(slab).getByText("FAIL", { selector: ".wk-verdict-word" })).toBeInTheDocument();
    expect(slab.querySelectorAll(".wk-all-list > li")).toHaveLength(16);
    const tally = slab.querySelector(".wk-tally")?.textContent ?? "";
    expect(tally).toMatch(/16/);
    expect(tally).toMatch(/11/);
    expect(tally).toMatch(/5/);
    const prov = slab.querySelector(".wk-prov")?.textContent ?? "";
    expect(prov).toContain("feed side: your upload");
    expect(prov).toContain("record side: your upload");
    expect(prov).toContain("matching: synthetic-controlled");
    const line = slab.querySelector(".wk-prov-line")?.textContent ?? "";
    expect(line).toContain("of your own records");
    // The record carried its own as_of column, so no drop-day sentence.
    expect(line).not.toContain("dated");
  });

  it("one edited cell through the paste route → exactly one finding, the planted value echoed", async () => {
    const w = mount();
    const faithful = faithfulFeedFrom(recordCsv);
    const edited = faithful.replace(/^(item-006-v1,[^,]*,[^,]*,)10\.00,/m, (_m, lead: string) => `${lead}8642.31,`);
    expect(edited).not.toBe(faithful);

    fireEvent.change(w.paste("The feed"), { target: { value: edited } });
    fireEvent.change(w.paste("The record"), { target: { value: recordCsv } });
    // A pasted slot has no file name, so the parse status is shown as a line.
    expect(w.slot("The feed")).toHaveTextContent(/24 rows read from a spreadsheet/);

    w.run();
    await waitFor(() => expect(w.liveSlab()).not.toBeNull());
    const slab = w.liveSlab() as HTMLElement;
    expect(within(slab).getByText("FAIL", { selector: ".wk-verdict-word" })).toBeInTheDocument();
    // One finding renders as one receipt card; the "all findings" fold only
    // appears when there are more findings than receipts.
    expect(slab.querySelectorAll(".wk-receipt")).toHaveLength(1);
    expect(slab.querySelector(".wk-all")).toBeNull();
    expect(slab.querySelector(".wk-receipt")?.textContent).toContain("LST-PRICE-VALUE");
    expect(slab.querySelector(".wk-receipt")?.textContent).toContain("8642.31");
    // The tally's figures, in order: findings · errors · warnings · rows read.
    expect([...slab.querySelectorAll(".wk-tally .wk-n")].map((n) => n.textContent)).toEqual(["1", "1", "0", "24"]);
  });

  it("a record with no as_of column is dated the drop-day, and the slab says so — with the date as a <time>", async () => {
    const w = mount();
    const noAsOf = recordCsv
      .split("\n")
      .map((l) => (l ? l.split(",").filter((_, i) => i !== 5).join(",") : l))
      .join("\n");
    expect(noAsOf.split("\n")[0]).toBe("item_id,name,variation,price,stock,group");

    fireEvent.change(w.paste("The feed"), { target: { value: faithfulFeedFrom(recordCsv) } });
    fireEvent.change(w.paste("The record"), { target: { value: noAsOf } });
    w.run();
    await waitFor(() => expect(w.liveSlab()).not.toBeNull());
    const slab = w.liveSlab() as HTMLElement;
    expect(within(slab).getByText("PASS", { selector: ".wk-verdict-word" })).toBeInTheDocument();
    const line = slab.querySelector(".wk-prov-line");
    expect(line?.textContent).toContain("carried no as_of date");
    expect(line?.textContent).toContain("the day you dropped it");
    const time = line?.querySelector("time");
    expect(time?.getAttribute("datetime")).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00Z$/);
    // The date shown IS today's UTC day — the default the adapter documents.
    expect(time?.getAttribute("datetime")?.slice(0, 10)).toBe(new Date().toISOString().slice(0, 10));
  });

  it("a spreadsheet the engine cannot index is refused beside the slot and yields no verdict", async () => {
    const w = mount();
    const dup = "item_id,name,variation,price\nsku-1,Burger,,9.00\nsku-1,Burger,,9.00\n";
    await dropFile(w.fileInput("The feed"), "dup.csv", dup);
    await waitFor(() => expect(w.slot("The feed")).toHaveTextContent('Row 3 (item_id "sku-1")'));
    expect(w.slot("The feed").querySelector(".fd-status.error")?.getAttribute("role")).toBe("alert");

    w.run();
    const alert = await screen.findByText(/No verdict\./);
    expect(alert.closest(".wb-error")?.textContent).toContain("repeats an item_id");
    expect(w.liveSlab()).toBeNull();
  });

  it("text that is neither shape is told so; JSON that opens with { still gets the JSON parser's message", () => {
    const w = mount();
    fireEvent.change(w.paste("The feed"), { target: { value: "this is not a feed {{{" } });
    expect(w.slot("The feed")).toHaveTextContent(/either shape this slot reads/);
    fireEvent.change(w.paste("The feed"), { target: { value: "{ this is not a feed" } });
    expect(w.slot("The feed")).toHaveTextContent(/Not valid JSON/);
  });

  it("both slots offer the spreadsheet template beside the JSON copy", () => {
    mount();
    expect(screen.getAllByRole("button", { name: "Download the spreadsheet template" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Download it to test uploading" })).toHaveLength(2);
    // The picker's filter names the second shape.
    for (const input of document.querySelectorAll('input[type="file"]')) {
      expect(input.getAttribute("accept")).toContain(".csv");
    }
  });

  it("the bundled-pair door is untouched: one click still runs the JSON pair and labels it bundled", async () => {
    const w = mount();
    fireEvent.click(screen.getByRole("button", { name: "Run the bundled pair" }));
    await waitFor(() => expect(w.liveSlab()).not.toBeNull());
    const slab = w.liveSlab() as HTMLElement;
    expect(slab.querySelectorAll(".wk-all-list > li")).toHaveLength(16);
    expect(slab.querySelector(".wk-prov")?.textContent).toContain("record side: bundled catalog");
    expect(w.slot("The feed")).toHaveTextContent(/25 rows read$|25 rows read[^f]/);
    expect(w.slot("The feed")).not.toHaveTextContent(/from a spreadsheet/);
    vi.restoreAllMocks();
  });
});
