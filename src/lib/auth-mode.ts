export type AuthMode = "demo" | "otp";

// Explicit opt-in only -- anything other than exactly "demo" (unset,
// "otp", a typo) keeps the existing real phone OTP flow, which is the
// safe default a production deployment should always fall back to.
// NEXT_PUBLIC_ vars are available via process.env both in the browser
// bundle and in server-side code, so this works identically in Client
// Components, Server Components, and Server Actions.
export function getAuthMode(): AuthMode {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "demo" ? "demo" : "otp";
}

// user_metadata key demo-mode auth stores the athlete's self-reported,
// unverified mobile number under. Deliberately distinct from the real
// `auth.users.phone` column (which anonymous/demo users never have) so
// there is never ambiguity about which one is a Supabase-verified phone.
export const DEMO_PHONE_METADATA_KEY = "demo_phone";
