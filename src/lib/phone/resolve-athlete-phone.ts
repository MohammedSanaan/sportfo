import type { User } from "@supabase/supabase-js";
import { getAuthMode, DEMO_PHONE_METADATA_KEY } from "@/lib/auth-mode";
import { formatAuthPhone } from "./format-auth-phone";

// The one place that decides which Supabase-held value is the athlete's
// trustworthy mobile number for the currently active auth mode -- never
// derived from client-submitted form data. Used identically by the
// registration Server Actions (what gets written to the database) and the
// registration page (what's shown, read-only, in the form).
//
// OTP mode: the phone Supabase Auth itself verified via SMS.
// Demo mode: the self-reported number the athlete entered at /auth, which
// demo sign-in stored in the anonymous user's own user_metadata -- real
// Supabase-held data, but explicitly unverified (auth.users.phone is null
// for anonymous users).
export function resolveAthleteMobileNumber(user: User): string {
  if (getAuthMode() === "demo") {
    const value = user.user_metadata?.[DEMO_PHONE_METADATA_KEY];
    return typeof value === "string" ? value : "";
  }
  return formatAuthPhone(user.phone);
}
