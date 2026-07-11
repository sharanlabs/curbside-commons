import { defineConfig, devices } from "@playwright/test";

/**
 * ARTIFACT-MODE e2e config (plan v3.3 S5; the RELEASE GATE runs both contracts
 * under this): statically serves a RECORDED `out/` export via
 * scripts-ts/serve-artifact.mts — NO `next dev`, NO build. The same specs in
 * evals/e2e/ run under both this and the dev config (playwright.config.ts);
 * a contract that only passes in dev mode is a defect.
 *
 * Run: npm run test:e2e:artifact  (requires an existing out/ — it will NOT build one)
 */
export default defineConfig({
  testDir: "./evals/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3200",
    trace: "off",
  },
  projects: [{ name: "chromium-artifact", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts-ts/serve-artifact.mts 3200 out",
    url: "http://localhost:3200",
    // NEVER reuse a listener: a stale server on this port would silently swap the
    // artifact under test (batch-C P1). Fail loud if the port is occupied.
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
