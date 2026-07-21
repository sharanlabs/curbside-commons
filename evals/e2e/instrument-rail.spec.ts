import { test } from "@playwright/test";

/**
 * SECTION RAIL contract — RETIRED (consolidated e2e rewrite, 2026-07-20).
 *
 * The "On this page" section rail (components/data-surfaces/SectionRail) was
 * carried by the canonical data dashboards at /demo /eval /metrics /cost. The
 * v9 takeover merged that dashboard set into chapter 04 (/proof) and turned the
 * old routes into meta-refresh redirect stubs; SectionRail is now rendered only
 * inside the unused DemoView, i.e. on no served route. With no surface to bind,
 * the rail contract is retired rather than re-pointed (there is no equivalent
 * reading-position instrument on the v9 chapters). The tombstone is kept, over a
 * silent delete, so the retirement is on the record.
 */
test.skip("section rail — retired: SectionRail is rendered on no served v9 route", async () => {});
