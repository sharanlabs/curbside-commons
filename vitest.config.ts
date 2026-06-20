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
      // type decls carry no logic; tests cover themselves.
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["lib/data/**", "**/*.d.ts"],
      // Ratchet (Phase-A): a floor set just below the achieved coverage (statements
      // ~85 / branches ~75 / functions ~88 / lines ~89). Guards regressions; enforced on
      // `npm run coverage`. The inherently-network Gemini REST helpers (live ListModels /
      // generateObject) are exercised only by the key-gated live test, so the floor leaves
      // headroom for them. Raise as coverage rises.
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
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
