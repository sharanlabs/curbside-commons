import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  UCP_PINNED_VERSION,
  buildUcpSearchResponse,
  generateCatalog,
} from "@/lib/packs/listings";
import { runUcpConformance } from "@/lib/packs/listings/conformance";
import { DEMO_CLAIM } from "@/lib/packs/listings/demo/copy";

/**
 * C10 honesty surface (plan §4 C10; P3-6 W1 gate advisory) — machine-checked:
 *  (a) NO real-platform-access / "no-AI" claim appears in pack sources, the CLI,
 *      or the fixture READMEs (an affirmative-overclaim grep-gate);
 *  (b) the UCP-touching artifacts carry an explicit simulated/honesty label;
 *  (c) every conformance report pins the spec version and the simulated flag.
 *
 * The banned patterns match ONLY affirmative overclaims — honest negations
 * ("no real platform access", "not recorded from any real marketplace") are not
 * caught, which is why the sources that make those honest disclaimers pass.
 */

const root = process.cwd();

function packSources(): string[] {
  const dir = join(root, "lib", "packs", "listings");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(dir, f));
}

// D1: the demo engine sources + the public demo surface (page + view) + the
// committed transcript goldens. Every file a viewer reads or the demo emits sits
// inside the same honesty gate as the corpus docs.
function demoSources(): string[] {
  const dir = join(root, "lib", "packs", "listings", "demo");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(dir, f));
}

// de-slop 2026-07-20: DemoView.tsx deleted (route-orphaned since the /demo stub;
// liveness-proven — no route import).
// 2026-08-02: the /demo redirect stub itself was deleted with the rest of the
// retired route set, so `app/demo/page.tsx` leaves this list — there is no page
// left to scan. The demo ENGINE sources and the committed transcript goldens
// stay in the gate: the CLI still emits them, so a viewer-facing string still
// exists to police. No glob replaces the removed entry.
const demoScanned = [
  ...demoSources(),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.txt"),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
];

// Pub slice (plan §5 Pub): the root README and the publication writeup are the
// primary PUBLIC prose surfaces — they sit inside the same honesty gates as
// every other viewer-facing artifact (both the platform-claims gate and the
// demo framing gate below).
const publicProse = [
  join(root, "README.md"),
  join(root, "docs", "PUBLICATION.md"),
];

// Redesign C-REDO (2026-07-14): every landing component is a viewer-facing prose
// surface — read the whole dir so a NEW landing component can never slip the gate
// (this closes the F-07 gap where the fixed allowlist excluded them).
function landingSources(): string[] {
  const dir = join(root, "components", "landing");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(dir, f));
}

// S2 (plan v3.3, F-04): the site SHELL joins the same honesty gates — the landing
// page and the global layout (whose footer carries the semantic disclosure
// contract) are viewer-facing prose surfaces exactly like the report/demo views.
const siteShell = [
  join(root, "app", "page.tsx"),
  join(root, "app", "layout.tsx"),
  // Landing grounding + the landing components (redesign C-REDO).
  join(root, "lib", "landing", "specimen.ts"),
  ...landingSources(),
  // Playground slice (owner commission 2026-07-13): the in-browser verifier's
  // page + client + seam are viewer-facing prose surfaces — same gates.
  join(root, "app", "playground", "page.tsx"),
  // The two-file workbench (owner commission 2026-07-27) replaced the
  // single-field paste client as the page's working surface; both of its
  // components are viewer-facing prose and carry the same C10 gates.
  join(root, "components", "playground", "AuditWorkbench.tsx"),
  join(root, "components", "playground", "FileDrop.tsx"),
  join(root, "components", "playground", "verify-in-browser.ts"),
  join(root, "components", "playground", "TryLiveBench.tsx"),
  // (The /legacy archive landing was in this list until 2026-08-02, when the
  // archived module's routes were deleted from the product — git history is the
  // archive now. Its entry is removed rather than globbed; every remaining
  // viewer-facing prose surface is still named explicitly below.)
  // Fee surface (NYC showcase N1+N2, 2026-07-16): the /fees page + its view,
  // paste client, data module, and browser seam — same gates.
  join(root, "app", "fees", "page.tsx"),
  join(root, "components", "fees", "FeesView.tsx"),
  join(root, "components", "fees", "FeePlaygroundClient.tsx"),
  join(root, "components", "fees", "fee-report-data.ts"),
  join(root, "components", "fees", "audit-in-browser.ts"),
  // Proof + docs surfaces (build pieces 2–3, 2026-07-20): new viewer-facing
  // prose surfaces — grill-me hardening catch (session 30) closed this gap the
  // same night these pages shipped, before it could go stale.
  join(root, "app", "proof", "page.tsx"),
  join(root, "components", "proof", "CalibrationPlate.tsx"),
  join(root, "components", "proof", "CountFig.tsx"),
  join(root, "app", "docs", "page.tsx"),
];

// Wave 1 / S4-docs (2026-10-12; plan docs/plan-menu-integrity-crew-2026-10-09.md
// §§ 6, 7, 8, 17, Appendix W1b): the governance model, the model-risk register and
// the pilot kit are the documents a platform's risk, ops and procurement readers
// are HANDED — the most claim-dense prose in the repo (partner names, "shaped
// like" inputs, cost-benefit). Every file is named explicitly; a new pilot-kit
// document must be added here by hand — never a directory glob — so adding one is
// a visible decision, not a silent gap.
const pilotDocs = [
  join(root, "docs", "governance-model.md"),
  join(root, "docs", "model-risk-register.md"),
  join(root, "docs", "pilot-kit", "README.md"),
  join(root, "docs", "pilot-kit", "pilot-proposal.md"),
  join(root, "docs", "pilot-kit", "data-request-spec.md"),
  join(root, "docs", "pilot-kit", "security-one-pager.md"),
  join(root, "docs", "pilot-kit", "success-metrics.md"),
  join(root, "docs", "pilot-kit", "demo-script-10min.md"),
  join(root, "docs", "pilot-kit", "executive-brief.md"),
  join(root, "docs", "pilot-kit", "five-minute-walk.md"),
];

const scannedFiles = [
  ...packSources(),
  ...publicProse,
  ...siteShell,
  ...pilotDocs,
  join(root, "SECURITY.md"),
  join(root, "bin", "check.mjs"),
  join(root, "fixtures", "README.md"),
  join(root, "fixtures", "synthetic-restaurant", "README.md"),
  join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "README.md"),
  join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "PROVENANCE.json"),
  // W3 public report surface (M1 Codex P3): the page a viewer actually reads
  // must sit inside the same honesty gate as the corpus docs. (ReportView was
  // superseded by the v9 takeover's Jewel + Ledger, build piece 1 2026-07-20.)
  join(root, "components", "report", "Jewel.tsx"),
  join(root, "components", "report", "Ledger.tsx"),
  join(root, "app", "report", "page.tsx"),
  // Outbound delivery builders (the L-2 one-shots' payload sources): the strings
  // a RECIPIENT reads must sit inside the same honesty gate as the corpus docs
  // (session-32 email-HTML slice; the s30 grill lesson — new surfaces join the scan).
  join(root, "lib", "delivery", "slack.ts"),
  join(root, "lib", "delivery", "email.ts"),
  // The `.eml` composition, extracted 2026-08-02 so the site's DELIVERY station
  // renders the builder's own strings instead of retyping them. It holds the
  // banner, verdict line, and body a RECIPIENT reads — the s30 lesson ("new
  // surfaces join the scan") applies to a file that inherits recipient-facing
  // prose just as much as to one that invents it.
  join(root, "lib", "delivery", "email-message.ts"),
  join(root, "lib", "delivery", "email-html.ts"),
  ...demoScanned,
];

const BANNED_CLAIMS: readonly RegExp[] = [
  /\bno AI was used\b/i,
  /\bAI built this\b/i,
  /\bbuilt (?:entirely )?by AI\b/i,
  /\breal[- ](?:time )?(?:DoorDash|Square|Uber\s?Eats|Grubhub)\s+(?:data|access|feed|account|integration|API)/i,
  /\b(?:connected|integrated) to (?:DoorDash|Square|Uber|Grubhub|the (?:live )?marketplace)\b/i,
  /\bactual (?:DoorDash|Square|marketplace|merchant) (?:data|account|orders?)\b/i,
  /\bproduction (?:merchant|platform|marketplace) data\b/i,
  /\bwe have (?:real |live )?(?:platform |marketplace )?access\b/i,
];

// F-08: one ISOLATED planted claim per banned pattern (never combined under a
// single `some()`), so a pattern that silently stopped matching is caught on its
// own — a combined probe would stay green as long as ANY one pattern still bit.
const BANNED_PROBES: ReadonlyArray<readonly [RegExp, string]> = [
  [BANNED_CLAIMS[0], "no AI was used to build this"],
  [BANNED_CLAIMS[1], "AI built this dashboard"],
  [BANNED_CLAIMS[2], "this was built entirely by AI"],
  [BANNED_CLAIMS[3], "the page shows real-time DoorDash data"],
  [BANNED_CLAIMS[4], "the app is connected to DoorDash"],
  [BANNED_CLAIMS[5], "displays actual DoorDash orders"],
  [BANNED_CLAIMS[6], "renders production platform data"],
  [BANNED_CLAIMS[7], "we have live platform access"],
];

// ---------------------------------------------------------------------------
// S1.5 (2026-10-31) — THREE NEW PROBE FAMILIES, sentence-scoped.
//
// Codex cross-check 2026-10-12 § 5: the eight patterns above ACCEPT "Trusted by
// DoorDash", "DoorDash-approved menu verification" and "We saved merchants
// $108,000 per month". The Wave 1 acceptance review (2026-10-31 01:14) planted
// "Trusted by every major delivery platform and approved for production use."
// in docs/governance-model.md and the gate stayed GREEN. These families close
// that gap. They are ADDED; no existing pattern is changed or weakened.
//
//  ENDORSEMENT  "trusted by / approved by / endorsed by / partnered with / in
//               partnership with <party>", "<platform>-approved", "official
//               <platform> partner|integration|…". No carrier exempts these;
//               only a negation in the same clause ("not endorsed by …") does.
//  ACCESS       "<platform> data", "<platform>'s export", "integrated with /
//               connected to <platform>" — exempt when the SAME SENTENCE
//               carries a nominative carrier ("shaped like", "public
//               integration docs", "not from", "not affiliated", "nominative")
//               or a negation of the access.
//  SAVED-MONEY  "saved … $", "we saved", "prevented … refunds", "reduced … by
//               N %", "cut … costs" — exempt when the same sentence carries
//               "illustrative", "hypothesis", "synthetic", "assumption",
//               "would" or "could".
// A "sentence" is a span ended by . ! or ? (whitespace collapsed first, so a
// claim wrapped across lines or split across JSX elements is one sentence).
//
// RED proofs (2026-10-31, measured; commands in the return packet):
//  - each family's planted phrases are asserted RED below, in isolation, and
//    each carrier/negation exemption is asserted GREEN on its own sentence;
//    the corpus needed NO rewording — one measured false positive (an honest
//    "Not real DoorDash / … / Grubhub data" in a 2026-07-13 mockup) narrowed
//    the negation window from 40 to 60 characters;
//  - pilotDocs (Wave 1 acceptance review item (c), whose pilotDocs list had no
//    RED proof): at 01:44 the review's sentence "Trusted by every major
//    delivery platform and approved for production use." appended to
//    docs/governance-model.md (sha256/16 ee8cf657f22ab766 → 7ca5719b41ee22f3)
//    → this file 1 failed / 267 passed, on the governance-model row of the
//    new-family scan (the eight old patterns still accept it); the saved copy
//    restored → ee8cf657f22ab766, 268/268. Re-run at 01:50 on the doc as
//    rewritten by the exec-layer lane (main 204ade5 merged in): 40e5a7dec9133864
//    → 5daee02dabed78e5 → 1 failed / 274 passed; restored → 40e5a7dec9133864,
//    275/275 (no sentence of the rewritten pilot kit, governance model or
//    risk register trips a new probe);
//  - the attribute probe: alt="Trusted by DoorDash" planted after <body> in the
//    built out/index.html (05d70866ce86938a → 3502792dce26421d) → the
//    attribute test RED while both visible-text scans stayed GREEN (the gap it
//    closes); the saved copy restored → 05d70866ce86938a, green.
// ---------------------------------------------------------------------------

/**
 * Named platforms a sentence could falsely claim a relationship with (the
 * orchestrator's anchor list of 2026-10-31 — DoorDash, Uber Eats, Grubhub,
 * Square, Toast, Google, OpenAI — plus Uber, Instacart and Postmates). The
 * endorsement probes anchor on one of these, or on an unnamed "…platform(s)"
 * party, so governance terms like "human-approved audit" or "approved by a
 * named person" stay green.
 */
const PLATFORM = String.raw`(?:DoorDash|Uber\s?Eats|Uber|Grubhub|Square|Toast|Instacart|Postmates|Google|OpenAI)`;
/** Unnamed parties an endorsement claim can lean on ("every major delivery platform"). */
const PLATFORMS_GENERIC = String.raw`(?:(?:every|all|the|major|leading|top|big|large|national|several|many)\s+)*(?:(?:US|food|delivery|ordering|marketplace|commerce|restaurant)\s+)*(?:platforms?|marketplaces?)`;
const PARTY = `(?:${PLATFORM}|${PLATFORMS_GENERIC})`;

type ProbeFamily = "endorsement" | "access" | "saved-money";
interface ClaimProbe {
  readonly family: ProbeFamily;
  readonly pattern: RegExp;
}

const NEW_CLAIM_PROBES: readonly ClaimProbe[] = [
  { family: "endorsement", pattern: new RegExp(String.raw`\btrusted by ${PARTY}\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\b${PLATFORM}[- ]approved\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\bapproved by ${PARTY}\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\bendorsed by ${PARTY}\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\bpartnered with ${PARTY}\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\bin partnership with ${PARTY}\b`, "i") },
  { family: "endorsement", pattern: new RegExp(String.raw`\bofficial ${PLATFORM}\b`, "i") },
  { family: "access", pattern: new RegExp(String.raw`\b${PLATFORM}(?:'s|’s)? data\b`, "i") },
  { family: "access", pattern: new RegExp(String.raw`\b${PLATFORM}(?:'s|’s) exports?\b`, "i") },
  { family: "access", pattern: new RegExp(String.raw`\bintegrated with ${PLATFORM}\b`, "i") },
  { family: "access", pattern: new RegExp(String.raw`\bconnected to ${PLATFORM}\b`, "i") },
  { family: "saved-money", pattern: /\bsaved\b[^.!?]{0,60}\$\s?\d/i },
  { family: "saved-money", pattern: /\bwe saved\b/i },
  { family: "saved-money", pattern: /\bprevented\b[^.!?]{0,60}\brefunds?\b/i },
  { family: "saved-money", pattern: /\breduced\b[^.!?]{0,60}\bby\s+\d+(?:\.\d+)?\s?(?:%|percent)/i },
  { family: "saved-money", pattern: /\bcut\b[^.!?]{0,40}\bcosts?\b/i },
];

/** Same-sentence carriers that make an ACCESS mention a nominative reference. */
const ACCESS_CARRIER = /shaped like|public integration docs|not from|not affiliated|nominative/i;
/** Same-sentence carriers that make a SAVED-MONEY figure an explicit model, not a result. */
const SAVED_CARRIER = /\b(?:illustrative|hypothes[ie]s|synthetic|assumptions?|would|could)\b/i;
/** A negation shortly before the match, in the same sentence ("is not endorsed by …"). */
// 60 characters: "Not real DoorDash / Square / Uber Eats / Grubhub data" (a committed
// mockup's honest negation, 2026-07-13) puts 41 characters between the two —
// narrowed from 40 on that measured false positive.
const NEGATED_BEFORE = /\b(?:not|never|no|nor|without|isn't|aren't|wasn't|doesn't|don't|cannot|can't)\b[^.!?]{0,60}$/i;

/** Normalized sentences of a text: whitespace collapsed, split after . ! ?. */
function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((x) => x.trim() !== "");
}

/** Every new-family claim a text makes, with its family and matched words. */
function newClaimViolations(text: string): string[] {
  const out: string[] = [];
  for (const sentence of sentencesOf(text)) {
    for (const { family, pattern } of NEW_CLAIM_PROBES) {
      const m = pattern.exec(sentence);
      if (!m) continue;
      if (NEGATED_BEFORE.test(sentence.slice(0, m.index))) continue;
      if (family === "access" && ACCESS_CARRIER.test(sentence)) continue;
      if (family === "saved-money" && SAVED_CARRIER.test(sentence)) continue;
      out.push(`${family}: "${m[0]}" in "${sentence.slice(0, 160)}"`);
    }
  }
  return out;
}

// One planted claim per probe, RED in isolation (F-08 discipline), and one
// exempt sentence per carrier/negation, GREEN on its own.
const NEW_PROBE_PLANTS: ReadonlyArray<readonly [number, string]> = [
  [0, "Trusted by DoorDash."],
  [1, "DoorDash-approved menu verification."],
  [2, "This check was approved by Uber Eats."],
  [3, "The workflow is endorsed by Grubhub."],
  [4, "We partnered with Square on menus."],
  [5, "Built in partnership with Toast."],
  [6, "An official OpenAI partner tool."],
  [7, "The report reads Google data nightly."],
  [8, "We replay Uber Eats's export each morning."],
  [9, "The verifier is integrated with Grubhub."],
  [10, "Our checker is connected to Toast."],
  [11, "We saved merchants $108,000 per month."],
  [12, "Last quarter we saved real money."],
  [13, "The crew prevented 400 refunds."],
  [14, "Menu errors were reduced by 35%."],
  [15, "The pilot cut refund costs in half."],
];
const NEW_PROBE_EXEMPT: readonly string[] = [
  "The feed is shaped like the public integration docs, not from the platform, and holds no DoorDash data.",
  "Inputs use field names from Uber Eats's export, as a nominative reference only.",
  "This prototype is not endorsed by DoorDash.",
  "An illustrative model: a merchant who saved $1,000 a month would recover the fee.",
  "Under the stated assumption, the crew could have prevented 12 refunds.",
  "Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats or Grubhub.",
  "Every proposal is a human-approved audit step, approved by a named person.",
];

describe("C10 platform-claims grep-gate (no real-platform-access claims)", () => {
  it.each(scannedFiles)("%s makes no real-platform-access / no-AI claim", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("every banned pattern has exactly one dedicated probe (kept in lockstep)", () => {
    expect(BANNED_PROBES.length).toBe(BANNED_CLAIMS.length);
    BANNED_PROBES.forEach(([p], i) => expect(p).toBe(BANNED_CLAIMS[i]));
  });

  it.each(BANNED_PROBES)(
    "the gate bites in isolation: %s matches its own planted claim",
    (pattern, planted) => {
      expect(pattern.test(planted), `pattern ${pattern} failed to catch "${planted}"`).toBe(true);
    },
  );
});

describe("C10 S1.5 probe families — endorsement · access/affiliation · saved-money (sentence-scoped)", () => {
  it("every new probe has exactly one dedicated planted phrase (lockstep)", () => {
    expect(NEW_PROBE_PLANTS.map(([i]) => i)).toEqual(NEW_CLAIM_PROBES.map((_p, i) => i));
  });

  it.each(NEW_PROBE_PLANTS)("probe #%i bites in isolation: %s", (i, planted) => {
    expect(NEW_CLAIM_PROBES[i].pattern.test(planted), `${NEW_CLAIM_PROBES[i].pattern} missed "${planted}"`).toBe(true);
    expect(newClaimViolations(planted).length, `newClaimViolations missed "${planted}"`).toBeGreaterThan(0);
  });

  it.each(NEW_PROBE_EXEMPT)("an honest sentence stays green: %s", (sentence) => {
    expect(newClaimViolations(sentence)).toEqual([]);
  });

  it("Codex's three accepted phrases (2026-10-12 § 5) are RED now, and the eight old patterns still miss them", () => {
    for (const phrase of ["Trusted by DoorDash", "DoorDash-approved menu verification", "We saved merchants $108,000 per month"]) {
      expect(BANNED_CLAIMS.some((p) => p.test(phrase)), `old patterns now catch "${phrase}"?`).toBe(false);
      expect(newClaimViolations(phrase).length, phrase).toBeGreaterThan(0);
    }
  });

  it("the Wave 1 acceptance review's planted sentence is RED (it was accepted on 2026-10-31 01:14)", () => {
    expect(newClaimViolations("Trusted by every major delivery platform and approved for production use.")).not.toEqual([]);
  });

  it("a carrier in ANOTHER sentence does not exempt the claim (sentence scope, not file scope)", () => {
    expect(newClaimViolations("Inputs are shaped like the public integration docs. The report reads DoorDash data.")).toHaveLength(1);
    expect(newClaimViolations("This is illustrative. We saved merchants $108,000 per month.")).not.toEqual([]);
    expect(newClaimViolations("We saved merchants $108,000 per month. This is illustrative.")).not.toEqual([]);
  });

  it("a claim wrapped across lines is still one sentence", () => {
    expect(newClaimViolations("Merchants were\n   saved\n $108,000 per month.")).toHaveLength(1);
  });

  it.each(scannedFiles)("%s makes no endorsement / access / saved-money claim", (file) => {
    expect(newClaimViolations(readFileSync(file, "utf8"))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SITE-WIDE (F-07): the fixed source allowlist above cannot cover every rendered
// surface (a page composed from components that are not themselves listed, the
// 404 …). The AUTHORITATIVE site-wide gate scans the NORMALIZED
// VISIBLE TEXT of every built out/**/*.html — a false claim on ANY route is
// caught, and a claim split across JSX elements/lines (which a raw-source regex
// misses, F-08) is rejoined by tag-stripping before the scan. Rendered HTML has
// no code comments, so this is comprehensive without benign false positives.
//
// Freshness: this runs against a built out/ and REFUSES a stale one (phase-F
// batch finding #9 — accepting any existing out/ made the site-wide gate
// fail-open: edited source scanned yesterday's HTML). If out/ is absent OR older
// than the newest page source under app/, components/, or lib/, it rebuilds ONCE
// (self-sufficient — never a silently-skipped honesty gate). `npm run verify`
// builds BEFORE the test run for the same reason, so there this is instant.
// ---------------------------------------------------------------------------

const outDir = join(root, "out");

function newestMtimeMs(dir: string): number {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestMtimeMs(full));
    else newest = Math.max(newest, statSync(full).mtimeMs);
  }
  return newest;
}

function ensureBuilt(): void {
  if (existsSync(outDir)) {
    const built = statSync(join(outDir, "index.html")).mtimeMs;
    const newestSource = Math.max(
      newestMtimeMs(join(root, "app")),
      newestMtimeMs(join(root, "components")),
      newestMtimeMs(join(root, "lib")),
    );
    if (built >= newestSource) return;
  }
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

function htmlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

/**
 * Reduce a built HTML page to its normalized VISIBLE text: drop <script>/<style>
 * blocks (embedded data, not visible copy), strip every tag (rejoining a claim
 * split across elements/lines), decode a few entities, and collapse whitespace.
 */
export function visibleText(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;|&#39;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&sect;/g, "§")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The text a page carries OUTSIDE its visible copy (S1.5; Codex cross-check
 * 2026-10-12 § 5): `visibleText` strips every tag, so an `alt`, `aria-label`,
 * `title`, `placeholder` or meta `content` value — read aloud by a screen
 * reader, shown as a tooltip, or quoted by a search result — escaped the scan.
 * Each value is returned on its own so a claim cannot borrow a carrier from a
 * neighbouring attribute.
 */
export function attributeTexts(html: string): string[] {
  const out: string[] = [];
  const re = /\s(alt|aria-label|aria-description|title|placeholder|content)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  for (const m of html.matchAll(re)) {
    const raw = m[3] ?? m[4] ?? "";
    out.push(
      raw
        .replace(/&amp;/g, "&")
        .replace(/&quot;|&#34;/g, '"')
        .replace(/&#39;|&#x27;|&apos;/g, "'")
        .replace(/&nbsp;/g, " "),
    );
  }
  return out;
}

describe("C10 SITE-WIDE banned-claim scan (normalized visible text of every built out/**/*.html)", () => {
  it(
    "no rendered page carries a banned real-platform / no-AI claim",
    { timeout: 600_000 },
    () => {
      ensureBuilt();
      const pages = htmlFiles(outDir);
      expect(pages.length, "out/ has no HTML pages — did the build run?").toBeGreaterThan(0);

      const violations: string[] = [];
      for (const file of pages) {
        const text = visibleText(readFileSync(file, "utf8"));
        for (const pattern of BANNED_CLAIMS) {
          const m = text.match(pattern);
          if (m) violations.push(`${pattern} in ${relative(root, file)}: "${m[0]}"`);
        }
      }
      expect(violations, `banned claims rendered on the built site:\n${violations.join("\n")}`).toEqual(
        [],
      );
    },
  );

  it(
    "S1.5: no rendered page carries an endorsement / access / saved-money claim (new families, visible text)",
    { timeout: 600_000 },
    () => {
      ensureBuilt();
      const violations: string[] = [];
      for (const file of htmlFiles(outDir)) {
        for (const v of newClaimViolations(visibleText(readFileSync(file, "utf8")))) violations.push(`${relative(root, file)}: ${v}`);
      }
      expect(violations, violations.join("\n")).toEqual([]);
    },
  );

  it(
    "S1.5: no alt / aria-label / title / placeholder / meta-content value on any built page carries a banned or new-family claim",
    { timeout: 600_000 },
    () => {
      ensureBuilt();
      const pages = htmlFiles(outDir);
      let values = 0;
      const violations: string[] = [];
      for (const file of pages) {
        for (const text of attributeTexts(readFileSync(file, "utf8"))) {
          values++;
          for (const pattern of BANNED_CLAIMS) {
            const m = text.match(pattern);
            if (m) violations.push(`${pattern} in ${relative(root, file)} attribute: "${m[0]}"`);
          }
          for (const v of newClaimViolations(text)) violations.push(`${relative(root, file)} attribute: ${v}`);
        }
      }
      expect(values, "no attribute values were extracted — did the build run?").toBeGreaterThan(0);
      expect(violations, violations.join("\n")).toEqual([]);
    },
  );

  it("S1.5: the attribute probe bites where the visible-text scan cannot (a planted alt / meta description)", () => {
    const planted =
      '<head><meta name="description" content="Integrated with DoorDash for real menus"></head>' +
      '<body><img alt="Trusted by DoorDash" src="x.png"><button aria-label="We saved merchants $108,000">Go</button></body>';
    const text = visibleText(planted);
    expect(BANNED_CLAIMS.some((p) => p.test(text)) || newClaimViolations(text).length > 0, "visible text should NOT see these").toBe(false);
    const attrs = attributeTexts(planted);
    expect(attrs).toEqual(expect.arrayContaining(["Trusted by DoorDash", "We saved merchants $108,000"]));
    const caught = attrs.flatMap((a) => [...newClaimViolations(a), ...BANNED_CLAIMS.filter((p) => p.test(a)).map(String)]);
    expect(caught.length).toBeGreaterThanOrEqual(3);
  });

  it("the visible-text normalizer rejoins a claim split across JSX / lines (F-08)", () => {
    // A claim broken across elements + newlines in source becomes contiguous in
    // rendered HTML; tag-stripping + whitespace collapse must rejoin it so the
    // pattern still matches (a raw per-line source scan would have missed it).
    const split = '<p>the app is\n  connected\n  to <span class="brand">DoorDash</span>.</p>';
    const text = visibleText(split);
    expect(text).toContain("connected to DoorDash");
    expect(BANNED_CLAIMS.some((p) => p.test(text))).toBe(true);
  });
});

describe("C10 simulated labels on the UCP-touching artifacts", () => {
  it.each([
    "ucp.ts",
    "ucp-wire.ts",
    "ucp-corpus.ts",
    "conformance.ts",
  ])("lib/packs/listings/%s carries an explicit simulated/simulation label", (f) => {
    const text = readFileSync(join(root, "lib", "packs", "listings", f), "utf8");
    expect(/simulat(ed|ion)/i.test(text)).toBe(true);
  });

  it("the pinned-schema README labels the schemas as an untrusted pinned fetch", () => {
    const text = readFileSync(join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "README.md"), "utf8");
    expect(/pinned/i.test(text)).toBe(true);
    expect(text).toContain("Apache-2.0");
  });
});

describe("C10 spec-version pin + simulated flag in every conformance report", () => {
  it("a conformance report header pins the UCP spec version and simulated:true", () => {
    const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
    const report = runUcpConformance(buildUcpSearchResponse(sor), { op: "search" });
    expect(report.specVersion).toContain(UCP_PINNED_VERSION);
    expect(report.simulated).toBe(true);
  });
});

describe("D1 demo honesty surface (plan §5 D1, C7/C10)", () => {
  // The C7 headline is the ONLY sanctioned framing; framing the AGENT as the
  // thing caught is banned everywhere in the demo (Codex amendment 6).
  const BANNED_FRAMING: readonly RegExp[] = [
    /\bcaught the agent\b/i,
    /\bagent (?:gets|is|was|got) caught\b/i,
    /\bthe agent gets caught\b/i,
  ];

  it("the C7 verbatim claim is single-sourced in the demo copy module (engine)", () => {
    const copySrc = readFileSync(join(root, "lib", "packs", "listings", "demo", "copy.ts"), "utf8");
    expect(copySrc).toContain(DEMO_CLAIM);
    // The verbatim claim must never contain the banned headline.
    expect(/\bthe agent gets caught\b/i.test(DEMO_CLAIM)).toBe(false);
  });

  it("the root README quotes the C7 claim VERBATIM (drift-locked to copy.ts)", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");
    expect(readme).toContain(DEMO_CLAIM);
  });

  it.each([...demoScanned, ...publicProse, ...siteShell])("%s never frames the agent as 'caught' (banned headline)", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_FRAMING) {
      const m = text.match(pattern);
      expect(m === null, `banned framing ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the framing gate actually bites (a planted 'agent gets caught' would be caught)", () => {
    const planted = "Watch as the agent gets caught red-handed.";
    expect(BANNED_FRAMING.some((p) => p.test(planted))).toBe(true);
  });

  it("the CLI demo surfaces keep their honest simulated labels (engine copy + committed transcript)", () => {
    // Freeze-reversal (decision-log 2026-07-14): the WEB SIMULATED banner was
    // removed from DemoView, but the CLI/repo stays honest — the engine copy and
    // the committed transcript golden keep their labels. (The removed DemoView.tsx
    // assertion is covered by the report/demo view edits + the mockup scan below.)
    const copySrc = readFileSync(join(root, "lib", "packs", "listings", "demo", "copy.ts"), "utf8");
    expect(/simulated/i.test(copySrc)).toBe(true);
    const transcript = readFileSync(
      join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
      "utf8",
    );
    expect(transcript).toContain('"simulated": true');
    expect(/simulated/i.test(transcript)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FOOTER (freeze-reversal, decision-log 2026-07-14, line ~175) — SUPERSEDES the
// 2026-07-10 S2 semantic-disclosure contract + the SIMULATED banner-parity lock.
// The public site is DISCLAIMER-FREE: the removed footer/banner contracts are
// replaced by an HONEST-CONTENT + NO-FALSE-CLAIM contract. The honest technical
// framing now lives in the repo README, not the site. The C10 BANNED_CLAIMS
// grep-gate above stays green and keeps its teeth (unchanged).
// ---------------------------------------------------------------------------

describe("footer is disclaimer-free + honest (app/layout.tsx, freeze-reversal 2026-07-14)", () => {
  const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");

  // Bind to the FOOTER BLOCK specifically (not the whole file), with JSX comments
  // stripped, so nothing outside the rendered footer satisfies or defeats the gate.
  const footerMatch = layoutSrc.match(/<footer[\s\S]*?<\/footer>/);
  const footerRaw = footerMatch?.[0] ?? "";

  const normalizeJsx = (s: string) =>
    s
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{["'` ]*\}/g, " ")
      .replace(/&ldquo;|&rdquo;/g, '"')
      .replace(/&rsquo;/g, "'")
      .replace(/\s+/g, " ");

  const normalized = footerMatch ? normalizeJsx(footerRaw) : "";

  it("the layout renders exactly one footer block", () => {
    expect(footerMatch, "app/layout.tsx must contain a <footer> block").not.toBeNull();
  });

  // HONEST CONTENT that MUST be present.
  // The credit line is PLAIN TEXT as of 2026-08-02: the profile link went with
  // the rest of the source-repository chrome (real-product voice, owner
  // directive). The pin moves to the credit ITSELF, which is the honest content
  // this test exists to protect — a page that names who is responsible for it.
  // The false-claims teeth below (BANNED_CLAIMS + the planted-claim probe) are
  // untouched.
  it("the footer carries the author/credit line", () => {
    expect(/Built and directed by\s+Sharan Kumar/.test(normalized), "author credit missing").toBe(
      true,
    );
  });

  it("the footer carries no source-repository or archive chrome", () => {
    expect(/github\.com/i.test(footerRaw), "footer still links a source repository").toBe(false);
    expect(/\/legacy/.test(footerRaw), "footer still links the retired archive").toBe(false);
  });

  it("the footer carries the honest build-provenance line", () => {
    // BUILD_INFO.label is injected by next.config.ts and rendered in the footer.
    expect(/BUILD_INFO\.label/.test(footerRaw), "build-provenance line missing from footer").toBe(
      true,
    );
  });

  // DISCLAIMER-FREE — the reversed disclosures/brands are GONE from the footer.
  // This is the red half: it FAILS against the pre-reversal footer.
  const REMOVED: ReadonlyArray<[name: string, pattern: RegExp]> = [
    ["prototype/simulated-data disclaimer", /simulated data throughout/i],
    ["replay-of-committed-fixtures disclaimer", /static replay of committed/i],
    ["no-sends posture disclaimer", /initiates no sends/i],
    ["owner-armed-send disclaimer", /owner-armed send/i],
    ["non-affiliation disclaimer", /Not affiliated with, endorsed by, or connected to/i],
    ["real-brand names", /DoorDash|Uber\s?Eats|Grubhub|DataSF/i],
  ];
  it.each(REMOVED)("the footer no longer carries: %s", (_name, pattern) => {
    expect(pattern.test(normalized), `disclaimer/brand should be removed: ${pattern}`).toBe(false);
  });

  // TEETH — the disclaimer-free footer contains NONE of the C10 banned claims.
  it("the footer contains none of the BANNED_CLAIMS", () => {
    for (const pattern of BANNED_CLAIMS) {
      const m = normalized.match(pattern);
      expect(m === null, `banned claim ${pattern} in footer: ${m?.[0]}`).toBe(true);
    }
  });

  it("the footer BANNED_CLAIMS check bites (a planted false claim in a footer would be caught)", () => {
    const plantedFooter =
      "Curbside Commons is connected to DoorDash and shows production platform data; no AI was used.";
    expect(BANNED_CLAIMS.some((p) => p.test(plantedFooter))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RULES.md §4(b) — the permanent "what is real" carrier (amended 2026-07-20,
// decision-log row; owner structured-ask, resolving the acceptance-gate BLOCK
// on this session's build). The rule now requires TWO enforced things instead
// of a literal "simulated" label everywhere: (a) BANNED_CLAIMS stays green
// (checked above, site-wide) and (b) one findable, accurate "what is real"
// page stays footer-linked from every page, never deleted. This is the
// red-green tooth for (b) — it must fail if either half goes missing.
// ---------------------------------------------------------------------------

describe("RULES.md §4(b) — the /docs 'what is real' page stays footer-linked (never deleted)", () => {
  it("the footer links to /docs on every page (app/layout.tsx, shared chrome)", () => {
    const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");
    const footer = layoutSrc.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
    expect(footer).toMatch(/href="\/docs"/);
  });

  it("/docs states plainly what is real and what is invented", () => {
    const docsSrc = readFileSync(join(root, "app", "docs", "page.tsx"), "utf8");
    expect(docsSrc).toMatch(/What is real, and what is invented\./);
    expect(docsSrc).toMatch(/invented/i);
    expect(docsSrc).toMatch(/No real platform feed\s+or statement was audited\./i);
  });
});

describe("mockup claim scan (every committed mockup HTML, recursive)", () => {
  // F-04: mockups sat outside every honesty scan. Scan them all for the same
  // affirmative overclaims. Only the sanctioned honest PREDICATE — "not
  // affiliated with, endorsed by, or connected to" — is removed before the
  // scan (in plain HTML its "connected to <brand>" tail would false-positive
  // the connected-to pattern that markup happens to break in JSX/markdown).
  // Batch-A Codex P2 (accepted-fixed): strip ONLY the predicate words, never
  // the rest of the sentence, so an overclaim sharing the sentence still gets
  // scanned — the brand list that follows the predicate matches no banned
  // pattern on its own.
  const NON_AFFILIATION_PREDICATE =
    /not affiliated\s+with,?\s*endorsed\s+by,?\s*or\s+connected\s+to\b/gi;

  const mockupFiles = readdirSync(join(root, "mockups"), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(root, "mockups", f));

  it("the mockup set is non-empty (the scan actually covers something)", () => {
    expect(mockupFiles.length).toBeGreaterThan(0);
  });

  it.each(mockupFiles)("%s makes no affirmative real-platform/no-AI claim", (file) => {
    const text = readFileSync(file, "utf8").replace(NON_AFFILIATION_PREDICATE, " ");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
    // S1.5: the three new families over the same stripped text.
    expect(newClaimViolations(text), file).toEqual([]);
  });

  it("the mockup scan bites: a planted overclaim in its OWN sentence is caught", () => {
    const planted =
      "Not affiliated with, endorsed by, or connected to DoorDash. This dashboard shows actual DoorDash data live.";
    const stripped = planted.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(true);
  });

  it("the mockup scan bites: an overclaim sharing the DISCLAIMER'S OWN sentence is caught (predicate-only strip)", () => {
    // Batch-A Codex P2 adversarial case: the old sentence-wide strip would have
    // erased this whole line; the predicate-only strip must leave the overclaim.
    const planted =
      "Not affiliated with, endorsed by, or connected to DoorDash — this dashboard shows actual DoorDash data live.";
    const stripped = planted.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(true);
  });

  it("the strip removes only the predicate: the honest disclaimer still passes clean", () => {
    const honest =
      "Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats, Grubhub, DataSF, or any business.";
    const stripped = honest.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(false);
  });
});
