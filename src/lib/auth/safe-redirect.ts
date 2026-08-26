// Relative import (not the "@/..." alias) so this module -- and its test --
// can run directly under Node's built-in test runner without a bundler.
import { getRegistrationCategoryBySlug } from "../registration/categories.ts";

// A fixed, fake origin used purely to make the URL parser resolve `next`
// the same way a browser would -- if the resolved origin doesn't match
// this constant, `next` pointed somewhere other than this same app
// (an absolute external URL, a protocol-relative "//evil.example", a
// "javascript:" scheme, etc.) and is rejected. Never sent anywhere.
const SAFE_ORIGIN = "https://sportfo.invalid";

// Exact-match post-login destinations outside the registration hub.
// /admin/dashboard is included here so an anonymous admin who clicked
// straight into it round-trips back through /auth correctly -- the actual
// authorization check still happens entirely server-side on that page
// (is_current_user_admin()), never here; this only decides where a login
// is allowed to redirect to.
const ALLOWED_EXACT_PATHS = new Set([
  "/athlete/register",
  "/athlete/profile",
  "/admin/dashboard",
  "/athletes",
]);

// Validates a `?next=` post-login redirect target end to end: same-origin,
// path-only, AND matching one of SportFo's actual registration routes --
// not just "any internal path." Anything absent, malformed, or not one of
// these known routes returns null so the caller falls back to its existing
// safe default (resolveAthleteDestination). This is the one place that
// decides what a `next` value is allowed to point at; every consumer
// (the /auth page, AuthFlow) must go through this rather than trusting a
// query param directly, since it's attacker-controlled input regardless of
// how proxy.ts happens to generate it for its own redirects.
export function resolveSafeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;

  let pathname: string;
  try {
    const url = new URL(next, SAFE_ORIGIN);
    if (url.origin !== SAFE_ORIGIN) return null;
    pathname = url.pathname;
  } catch {
    return null;
  }

  if (ALLOWED_EXACT_PATHS.has(pathname)) return pathname;

  const registerMatch = pathname.match(/^\/register\/([^/]+)$/);
  if (registerMatch && getRegistrationCategoryBySlug(registerMatch[1])) {
    return pathname;
  }

  return null;
}
