import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Shared by the /auth page (server client) and the post-verification client
// flow (browser client) -- both run under the athlete's own authenticated
// session, so RLS ("Athletes can view own profile") scopes this to at most
// one row. No service-role client is ever used here.
export function lookupOwnAthleteProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  return supabase
    .from("athlete_profiles")
    .select("id, profile_status")
    .eq("user_id", userId)
    .maybeSingle();
}
