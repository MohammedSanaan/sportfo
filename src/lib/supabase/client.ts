"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "./env";

// Browser-side Supabase client for use in Client Components. Safe to call
// repeatedly -- @supabase/ssr's browser client is cheap to construct and
// reads the session from cookies each time.
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
