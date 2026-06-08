import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Async data-loading pattern (useEffect → load()) is intentional throughout the codebase.
      // The rule fires on any function call that internally calls setState, even asynchronously.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
