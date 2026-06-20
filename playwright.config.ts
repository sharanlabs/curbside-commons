import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e for the desktop console. Separate from Vitest (which owns evals/**\/*.test.ts);
 * Playwright owns evals/e2e/**\/*.spec.ts. Runs against the dev server on a dedicated port.
 * reducedMotion is forced on (the WCAG/respect-reduced-motion check; the console has no motion,
 * so this just asserts everything renders on a settled DOM).
 */
export default defineConfig({
  testDir: "./evals/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
