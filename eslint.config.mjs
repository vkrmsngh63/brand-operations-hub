import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createRequire } from "node:module";

// Custom local rules (hand-rolled, no plugin extraction). The rule files
// live in `eslint-rules/` next to this config; see
// `docs/DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` §2 for the locked design.
const require = createRequire(import.meta.url);
const noPropReadsInRunloop = require("./eslint-rules/no-prop-reads-in-runloop.js");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      local: { rules: { "no-prop-reads-in-runloop": noPropReadsInRunloop } },
    },
    rules: { "local/no-prop-reads-in-runloop": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Don't lint the rule's own test fixtures (they intentionally violate
    // the rule).
    "eslint-rules/**/*.test.mjs",
    // Playwright suite has its own TS handling and ships a generated
    // bundle of src/lib/authFetch.ts; main eslint config doesn't apply.
    "tests/**",
    "playwright.config.ts",
  ]),
]);

export default eslintConfig;
