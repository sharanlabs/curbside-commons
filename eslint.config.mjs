import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".agents/**",
    ".claude/**",
    ".remember/**",
    "reference/**",
    "evals/rag/corpus-snapshot/**",
    "screenshots/**",
    // Lane worktrees (git worktree add .worktrees/<lane>) are full checkouts
    // that lint on their own; linting them from main double-counts every file.
    ".worktrees/**",
  ]),
]);
