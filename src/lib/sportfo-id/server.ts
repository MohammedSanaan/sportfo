import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Read-only lookup for Server Components (header, profile pages). RLS
// ("Users can view own sportfo_users row") scopes this to at most one row
// -- the caller's own -- so this is never a path for looking up someone
// else's id. Returns null if, for any reason, the row doesn't exist yet
// (should be rare: ensure_sportfo_id() runs at every login) rather than
// throwing, since a missing SportFo ID must never block rendering the
// rest of the page.
export async function getOwnSportfoId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("sportfo_users")
    .select("sportfo_id")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.sportfo_id ?? null;
}
