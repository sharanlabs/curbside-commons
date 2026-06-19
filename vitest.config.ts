import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 20_000,
    include: ["evals/**/*.test.ts", "evals/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary"],
      // Cover the deterministic business logic + API routes. Demo/seed data and
      // type decls carry no logic; tests cover themselves. Thresholds are added
      // as a ratchet once real lib/ code lands (Phase A).
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["lib/data/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      // fileURLToPath (not URL.pathname) so the alias decodes correctly even
      // though this project's absolute path contains spaces ("AI DoorDash ...").
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
