import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

// Runs on every matched request (see src/proxy.ts). Server Components can't
// write cookies themselves, so refreshing the Supabase session here -- and
// writing the refreshed cookies onto the response -- is what keeps a session
// alive across navigations instead of silently expiring.
//
// `supabase.auth.getUser()` (not `getSession()`) is used deliberately: it
// revalidates the token against Supabase Auth rather than trusting whatever
// is sitting in the cookie.
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
