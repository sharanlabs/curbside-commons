BLOCK

1. **P1 — The hero explicitly claims order placement.** `components/landing/CommonsScene.tsx:53,272-273` renders “THE AGENT PLACES THE ORDER” and “ORDER PLACED”; `evals/e2e/canonical.spec.ts:54-57` institutionalizes the prohibited claim. `docs/implementation-journal.md:564` simultaneously records that no such claim exists.

2. **P1 — The `d-4` violation is not established by the supplied statement.** `components/fees/fee-report-data.ts:299-300` and `lib/packs/fees/audit.ts:193-205` infer that no basic plan is offered because this merchant-month has no basic-fee line. The enacted condition concerns whether the platform offers that service (`docs/research/ll79-source-memo.md:36`). This contradicts the statement-only promise at `app/fees/page.tsx:33-37` and inflates the required five-violation headline at `evals/e2e/fees.spec.ts:22-26`.

3. **P1 — Rendered business figures remain hand-typed.** Despite `app/page.tsx:14-15` claiming all counts are grounded, literal “Six,” “Sixteen findings,” and “four example months” appear at `app/page.tsx:40-45,195-199,233-238`; `app/fees/page.tsx:18-21,39-41` separately hard-codes 17 and four. The proof factor is also ultimately literal at `lib/landing/specimen.ts:117,124,189-194`. Current matching values do not satisfy the fail-closed, engine-derived hard bar.

4. **P1 — A clean engine result is presented as proof of lawfulness despite unresolved checks.** `components/fees/FeesView.tsx:124-127` and `components/fees/FeePlaygroundClient.tsx:160-163` say every line is lawful, while `app/fees/page.tsx:55-57` admits that external-evidence rules remain unresolved and `components/fees/fee-report-data.ts:93-94` says categories are only audited as declared.

5. **P2 — The 11/6 display is a registry partition, not a complete statutory boundary.** `components/fees/fee-report-data.ts:169-182` and `evals/packs/fees-surface.test.ts:174-191` prove circular equality with the registry. Actual §20-563.3 also contains external-evidence duties in subdivisions (i), (j), and (k), recorded at `docs/research/ll79-source-memo.md:41` but absent from `lib/packs/fees/rules.ts:102-109`. `app/fees/page.tsx:33-37,55-57` does not label the 17-rule set as selected scope.

6. **P2 — Three external-evidence summaries misstate the enacted law.** `components/fees/fee-report-data.ts:138-160` drops the exigent-circumstances exception, invents a “written” notice requirement, and claims category-lock checks enforce clear disclosure. The source and actual predicate contradict those statements at `docs/research/ll79-source-memo.md:33,39,47` and `lib/packs/fees/rules.ts:148-150`.

7. **P2 — The cured-refund receipt omits the evidence that proves the cure.** `components/fees/fee-report-data.ts:265-268,280-288` excludes refunds, calls two non-refund entries “every” line, and shows only pre-refund arithmetic. The decisive $1.20 refund and date are at `fixtures/synthetic-restaurant/fees/statement.cured.json:15-46`. Tests only require a nonempty receipt and verdict tag at `evals/packs/fees-surface.test.ts:158-164` and `evals/e2e/fees.spec.ts:71-76`.

8. **P2 — One-shot CTA motion cannot be paused.** `components/landing/CommonsScene.tsx:372-376` starts a 7.2-second one-shot while `play` remains false. The control consequently says “Play motion,” and `components/landing/CommonsScene.tsx:379-386,556-559` starts continuous playback instead of stopping the active animation.

9. **P2 — The pause control exposes contradictory toggle semantics.** `components/landing/CommonsScene.tsx:556-559` combines changing action labels with `aria-pressed`, producing “Play motion, pressed” when paused. `evals/e2e/canonical.spec.ts:154-160` now blesses the regression instead of enforcing a coherent accessible state.

10. **P2 — The 12% visibility pause contract is not implemented.** The observer at `components/landing/CommonsScene.tsx:326-332` uses only `entry.isIntersecting`; that remains true below 12% visibility. The scene therefore continues until fully outside the viewport rather than pausing at the recorded threshold.

11. **P2 — The browser import walk still is not fail-closed.** `evals/packs/playground-golden.test.ts:105-121` recognizes only quoted-literal dynamic imports. Valid forms such as template-literal or composed import specifiers are silently absent from the loop at `playground-golden.test.ts:153-172`; its self-test at `playground-golden.test.ts:194-212` exercises only quoted literals.

12. **P2 — The rewritten narrative contract does not test chapter order.** `evals/e2e/canonical.spec.ts:27-48` claims to verify the seven chapters “in order,” but only performs independent visibility assertions; any permutation passes.

13. **P3 — The desktop nav collapses the brand instead of fitting the adopted lockup.** The eight labels at `components/Nav.tsx:11-21` compete inside the fixed measure at `app/globals.css:236-289,331-341`; the brand lacks nowrap protection and wraps at all supplied binding desktop widths, unlike the governing inline lockup at `mockups/claude-design-hero-v8-2026-07-16.dc.html:46-50`.

14. **P3 — Contrast documentation contains incorrect evidence.** `app/globals.css:16` still names the retired primary, and `app/globals.css:113,124` reports `#FFB020` as 2.40:1 on white; standard WCAG sRGB calculation is approximately 1.83:1.
