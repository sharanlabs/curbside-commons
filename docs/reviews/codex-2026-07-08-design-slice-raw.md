   112	        <span className="rpt-sim-tag">SIMULATED</span>
   113	        <span className="rpt-sim-text">
   114	          Synthetic test data — an invented restaurant, invented menu, invented prices. Not real
   115	          DoorDash / Square / Uber&nbsp;Eats / Grubhub data, access, or business impact. The
   116	          verification rules and the pinned data-format standard are real; the restaurant, its
   117	          menu, and its records are invented.
   118	        </span>
   119	      </div>
   120	
   121	      <header className="rpt-head">
   122	        <p className="rpt-eyebrow">Verifier report · listings truth check</p>
   123	        <h1 className="rpt-title">What the copy says vs. what the restaurant&rsquo;s records say</h1>
   124	        <p className="rpt-intro">
   125	          A serving copy of a menu (what an AI shopping assistant would read) checked, line by line,
   126	          against the restaurant&rsquo;s own system-of-record. Below is every difference the checker
   127	          caught &mdash; each in plain words first, then the exact receipts. Deterministic and $0,
   128	          with no AI calls in this verifier runtime: the same input always gives this same report.
   129	        </p>
   130	      </header>
   131	
   132	      {/* Surface toggle — the same SOR, two serving surfaces (C3). */}
   133	      <div className="rpt-toolbar" role="tablist" aria-label="serving surface">
   134	        {(Object.keys(SURFACES) as SurfaceKey[]).map((key) => (
   135	          <button
   136	            key={key}
   137	            role="tab"
   138	            type="button"
   139	            aria-selected={surface === key}
   140	            className={`rpt-tab ${surface === key ? "active" : ""}`}
   141	            onClick={() => setSurface(key)}
   142	          >
   143	            {SURFACES[key].label}
   144	          </button>
   145	        ))}
   146	      </div>
   147	
   148	      <Verdict report={report} />
   149	
   150	      {/* C10 header surface — spec pin · matching mode · simulated flag — as a ledger. */}
   151	      <dl className="rpt-meta">
   152	        <div className="rpt-mrow">
   153	          <dt>surface</dt>
   154	          <dd>
   155	            {active.label} <span className="rpt-rc-sub">({active.plain})</span>
   156	          </dd>
   157	        </div>
   158	        <div className="rpt-mrow">
   159	          <dt>spec version</dt>
   160	          <dd className="rpt-mono">{report.specVersion}</dd>
   161	        </div>
   162	        <div className="rpt-mrow">
   163	          <dt>matching mode</dt>
   164	          <dd>
   165	            <span className="rpt-mono">{report.matchingMode}</span>
   166	            <span className="rpt-rc-sub">{report.matchingModePlain}</span>
   167	          </dd>
   168	        </div>
   169	        <div className="rpt-mrow">
   170	          <dt>data</dt>
   171	          <dd>
   172	            <span className="rpt-mono">simulated: {String(report.simulated)}</span>
   173	          </dd>
   174	        </div>
   175	      </dl>
   176	
   177	      <ol className="rpt-findings">
   178	        {report.rows.map((row, i) => (
   179	          <FindingCard key={`${row.claimId}:${row.ruleId}`} row={row} index={i} />
   180	        ))}
   181	      </ol>
   182	
   183	      <footer className="rpt-foot">
   184	        <p>
   185	          Every row above carries its four receipts &mdash; the claim, the catalog row it was checked
   186	          against, the rule it broke, and how severe it is. No language model runs in this verifier
   187	          &mdash; the comparison is exact, deterministic logic. Simulated prototype, run on demand
   188	          &mdash; not a live service. Human-led, AI-assisted, professionally reviewed.
   189	        </p>
   190	      </footer>
   191	    </main>
   192	  );
   193	}

codex
Verdict: BLOCK

Findings:

- P2 [app/globals.css:1189](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1189) introduces negative `letter-spacing` in the new Ledger section, with more at [1283](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1283), [1371](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1371), [1382](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1382), and [1647](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1647).  
  Failure scenario: the design slice ships with typography that violates the active frontend rule “Letter spacing must be 0, not negative,” and the report/demo visual system bakes that violation into the new owner-picked surface. Fix by using `letter-spacing: 0` in the changed Ledger rules.

Constraint checks:

1. CONTENT FREEZE: CONFIRM. JSX diff only adds the new rail captions `Verdict`, `Meta`, `Findings`; existing banner, verdict/tally, meta values, receipts, and footer paragraph text remain unchanged in the diff.
2. PRINT ASSERTION TEETH: CONFIRM with a caveat. The test scopes to the `.rpt-sim { ... }` block and separately requires `-webkit-print-color-adjust` plus unprefixed `print-color-adjust`; the unprefixed regex does not match inside `-webkit-`. It is not a full CSS parser, but it has real regression teeth for the intended failure.
3. CSS SCOPING / TOKENS: REFUTE because of the negative-letter-spacing issue above. Otherwise scoped Ledger tokens are exactly present under `.rpt-wrap`: `#ffffff`, `#101014`, `#33333b`, `#50505a`, `#dcdcd4`, `#1b3eb8`, `#a8231b`, `#8a5a06`, `#55555e`; no new `:root`, landing, or nav edits in the diff; no new `box-shadow`, gradients, or positive border radii inside the Ledger section.
4. PRINT BLOCK PRESERVED: CONFIRM. The `@media print` block is byte-identical to HEAD; the new banner color-adjust lives on `.rpt-sim` outside the print block.
5. NO OUT-OF-SCOPE TOUCHES: CONFIRM for code/test scope. Diff contains only `app/globals.css`, `components/report/ReportView.tsx`, `components/demo/DemoView.tsx`, `evals/packs/report-view-c1.test.ts`, plus out-of-scope `docs/decision-log.md`; no `lib/`, `bin/`, fixtures, or other evals changes.
6. ACCESSIBILITY / DESKTOP-WEB SCOPE: CONFIRM. Heading order remains `h1` then new `h2` section rails; `aria-labelledby` points to visible rail headings; footer empty rail is `aria-hidden`; desktop scope is preserved with narrow-viewport guard CSS, not a mobile redesign.

Validation note: I attempted `npm run test -- report-view-c1`, but this read-only environment blocked Vitest temp directory creation with `EPERM`. I reviewed the test logic and diff directly; I could not independently execute the suite here.
tokens used
1,31,811
Verdict: BLOCK

Findings:

- P2 [app/globals.css:1189](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1189) introduces negative `letter-spacing` in the new Ledger section, with more at [1283](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1283), [1371](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1371), [1382](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1382), and [1647](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/app/globals.css:1647).  
  Failure scenario: the design slice ships with typography that violates the active frontend rule “Letter spacing must be 0, not negative,” and the report/demo visual system bakes that violation into the new owner-picked surface. Fix by using `letter-spacing: 0` in the changed Ledger rules.

Constraint checks:

1. CONTENT FREEZE: CONFIRM. JSX diff only adds the new rail captions `Verdict`, `Meta`, `Findings`; existing banner, verdict/tally, meta values, receipts, and footer paragraph text remain unchanged in the diff.
2. PRINT ASSERTION TEETH: CONFIRM with a caveat. The test scopes to the `.rpt-sim { ... }` block and separately requires `-webkit-print-color-adjust` plus unprefixed `print-color-adjust`; the unprefixed regex does not match inside `-webkit-`. It is not a full CSS parser, but it has real regression teeth for the intended failure.
3. CSS SCOPING / TOKENS: REFUTE because of the negative-letter-spacing issue above. Otherwise scoped Ledger tokens are exactly present under `.rpt-wrap`: `#ffffff`, `#101014`, `#33333b`, `#50505a`, `#dcdcd4`, `#1b3eb8`, `#a8231b`, `#8a5a06`, `#55555e`; no new `:root`, landing, or nav edits in the diff; no new `box-shadow`, gradients, or positive border radii inside the Ledger section.
4. PRINT BLOCK PRESERVED: CONFIRM. The `@media print` block is byte-identical to HEAD; the new banner color-adjust lives on `.rpt-sim` outside the print block.
5. NO OUT-OF-SCOPE TOUCHES: CONFIRM for code/test scope. Diff contains only `app/globals.css`, `components/report/ReportView.tsx`, `components/demo/DemoView.tsx`, `evals/packs/report-view-c1.test.ts`, plus out-of-scope `docs/decision-log.md`; no `lib/`, `bin/`, fixtures, or other evals changes.
6. ACCESSIBILITY / DESKTOP-WEB SCOPE: CONFIRM. Heading order remains `h1` then new `h2` section rails; `aria-labelledby` points to visible rail headings; footer empty rail is `aria-hidden`; desktop scope is preserved with narrow-viewport guard CSS, not a mobile redesign.

Validation note: I attempted `npm run test -- report-view-c1`, but this read-only environment blocked Vitest temp directory creation with `EPERM`. I reviewed the test logic and diff directly; I could not independently execute the suite here.
