import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { canonicalizeSportfoId } from "./format";

// Idempotent get-or-create -- called once per successful authentication
// (both demo and real OTP), never during a plain page load. Safe to call
// on every login: returns the existing id unchanged if one is already
// assigned, and never regenerates or reassigns it. See
// ensure_sportfo_id() in supabase/migrations/20260822090000_sportfo_users.sql
// for why this is safe under concurrent calls.
export async function ensureSportfoId(
  supabase: SupabaseClient<Database>,
): Promise<{ ok: true; sportfoId: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc("ensure_sportfo_id");
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not assign a SportFo ID." };
  }
  return { ok: true, sportfoId: data };
}

// The entire client-callable surface for "log in with SportFo ID"
// resolution -- returns ONLY whether the id is registered, never the
// account's phone, email, or any other identifying data. Safe to call
// while signed out (anon-granted, SECURITY DEFINER on the database side).
export async function checkSportfoIdExists(
  supabase: SupabaseClient<Database>,
  sportfoId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("sportfo_id_exists", {
    p_sportfo_id: canonicalizeSportfoId(sportfoId),
  });
  if (error) return false;
  return Boolean(data);
}
