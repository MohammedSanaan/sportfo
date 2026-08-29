// Explicit opt-in only -- anything other than exactly "true" (unset, "false",
// a typo) keeps the existing honest real/empty dashboard state, which is the
// safe default a production deployment must always fall back to. Same
// pattern as getAuthMode() in src/lib/auth-mode.ts. NEXT_PUBLIC_ vars are
// available via process.env both in the browser bundle and in server-side
// code, so this works identically in Server Components and Client
// Components.
export function isDashboardDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DASHBOARD_DEMO_DATA === "true";
}
