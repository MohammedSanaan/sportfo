import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export type PublicAthleteProfile =
  Database["public"]["Functions"]["get_public_athlete_profile"]["Returns"][number];
export type PublicAthleteAchievement =
  Database["public"]["Functions"]["get_public_athlete_achievements"]["Returns"][number];

export interface PublicAthleteData {
  profile: PublicAthleteProfile;
  achievements: PublicAthleteAchievement[];
}

// The only public read path for /a/<slug>. Both RPCs are SECURITY DEFINER
// functions with a fixed, hand-picked column list and their own
// is_public/profile_status check baked in (see
// supabase/migrations/20260820100100_athlete_public_profiles_rls.sql) --
// there is no private column this can leak, and no need to duplicate the
// visibility gate here. A slug that doesn't resolve to a public, submitted
// profile (unknown, private, or still-draft) just comes back with no rows,
// so the caller's notFound() path is identical in every one of those cases
// -- callers can't distinguish "doesn't exist" from "exists but hidden".
export async function loadPublicAthleteProfile(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PublicAthleteData | null> {
  const [profileResult, achievementsResult] = await Promise.all([
    supabase.rpc("get_public_athlete_profile", { p_slug: slug }),
    supabase.rpc("get_public_athlete_achievements", { p_slug: slug }),
  ]);

  if (profileResult.error) {
    console.error("loadPublicAthleteProfile: profile fetch failed:", profileResult.error);
    return null;
  }

  const profile = profileResult.data?.[0];
  if (!profile) {
    return null;
  }

  if (achievementsResult.error) {
    console.error(
      "loadPublicAthleteProfile: achievements fetch failed:",
      achievementsResult.error,
    );
    return null;
  }

  return { profile, achievements: achievementsResult.data ?? [] };
}
