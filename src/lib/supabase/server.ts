import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "./env";

// Server-side Supabase client for use in Server Components, Route Handlers,
// and Server Actions. Must be created per-request (it closes over the
// request's cookie store), so this returns a fresh client rather than a
// singleton.
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render, where cookies can't be
          // written. Safe to ignore -- src/proxy.ts refreshes the session
          // (and writes cookies) on every request instead.
        }
      },
    },
  });
}
