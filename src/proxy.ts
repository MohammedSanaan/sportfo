import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

// Routes that require an authenticated Supabase session. This is an
// optimistic check only (see the Next.js Proxy/authentication guides) --
// the real, secure check lives in each route's own Server Component/Server
// Action, which re-verifies the session with Supabase directly rather than
// trusting Proxy alone.
//
// Registration routes (/athlete/register, /register/*) are deliberately
// NOT here -- they're public-to-view, auth-required-only-at-submit (see
// AthleteRegistrationScreen and GenericCategoryForm, which check auth
// themselves at Save/Submit time and redirect to /auth?mode=register&next=
// with the in-progress form preserved). Gating them here would bounce
// every guest straight to /auth the instant they opened a category card,
// before they ever saw the form -- exactly the bug this list previously
// caused.
const PROTECTED_ROUTES = ["/athlete/profile", "/admin", "/athletes", "/dashboard"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    // Carries the visitor's original destination through /auth so a
    // signed-out click on e.g. /athletes returns them there after login
    // instead of always landing on the default destination. /auth itself
    // re-validates this (see resolveSafeNextPath) rather than trusting it
    // just because Proxy generated it -- the query param is still
    // attacker-visible/editable in the browser.
    // Bare /admin immediately redirects to /admin/dashboard once reached
    // (see src/app/admin/page.tsx) -- send the "next" straight there so
    // login round-trips to the real destination in one hop.
    const nextPath = pathname === "/admin" ? "/admin/dashboard" : pathname;
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", nextPath);
    const redirectResponse = NextResponse.redirect(authUrl);
    // Carry over any cookie changes updateSupabaseSession already queued
    // (e.g. clearing an invalid/expired session) instead of discarding them.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimization so Proxy isn't invoked (and
    // the session isn't refreshed) on every asset request.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
