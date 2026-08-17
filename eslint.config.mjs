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
    // Supabase CLI-managed local dev runtime artifacts, not app source.
    "supabase/.branches/**",
    "supabase/.temp/**",
    // Deno runtime code (Supabase Edge Functions) -- linted separately,
    // not with this project's Node/React ESLint config.
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
