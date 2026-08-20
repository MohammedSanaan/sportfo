import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

// Routes that require an authenticated Supabase session. This is an
// optimistic check only (see the Next.js Proxy/authentication guides) --
// the real, secure check lives in the route's own Server Component
// (src/app/athlete/register/page.tsx), which re-verifies the session with
// Supabase directly rather than trusting Proxy alone.
const PROTECTED_ROUTES = ["/athlete/register", "/athlete/profile"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    const redirectResponse = NextResponse.redirect(new URL("/auth", request.url));
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
