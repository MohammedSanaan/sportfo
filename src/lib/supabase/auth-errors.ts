import type { AuthError } from "@supabase/supabase-js";

// Translates Supabase Auth errors (and plain network failures) into
// copy that's safe to show an athlete -- never the raw error message,
// which can leak internal provider details (e.g. SMS vendor errors).
// Callers are expected to console.error the original error themselves for
// development diagnostics.
export function friendlyAuthErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    // fetch() throws a bare TypeError ("Failed to fetch") on network loss.
    return "Network error. Check your connection and try again.";
  }

  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const authError = error as Partial<AuthError> & { message: string };
  const status = authError.status;
  const message = authError.message.toLowerCase();

  if (status === 429 || message.includes("rate limit") || message.includes("too many")) {
    return "You've requested too many codes. Please wait a moment before trying again.";
  }

  if (message.includes("expired")) {
    return "That code has expired. Request a new one.";
  }

  if (message.includes("otp") || (message.includes("token") && message.includes("invalid"))) {
    return "That code isn't right. Double-check it and try again.";
  }

  if (message.includes("phone") && message.includes("invalid")) {
    return "Enter a valid mobile number.";
  }

  if (message.includes("provider") || message.includes("unsupported")) {
    return "SMS delivery isn't available right now. Please try again shortly.";
  }

  if (status !== undefined && status >= 500) {
    return "Something went wrong on our end. Please try again shortly.";
  }

  return "Something went wrong. Please try again.";
}
