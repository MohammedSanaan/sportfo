import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AthleteDraft } from "./registration-draft";

// Same shape as loadAthleteDraft (registration-draft.ts), but keyed by the
// athlete_profiles primary key rather than the owning user id -- this is
// what the profile view route (/athlete/[id]) looks up by. RLS ("Athletes
// can view own profile" / "own sports" / "own achievements") still scopes
// every query to the caller's own rows, so a non-owner (or logged-out
// request) simply gets no profile back rather than someone else's data.
export async function loadAthleteProfileById(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<{ draft: AthleteDraft | null; error: boolean }> {
  const { data: profile, error: profileError } = await supabase
    .from("athlete_profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) {
    console.error("loadAthleteProfileById: profile fetch failed:", profileError);
    return { draft: null, error: true };
  }
  if (!profile) {
    return { draft: null, error: false };
  }

  const [sportResult, achievementsResult] = await Promise.all([
    supabase
      .from("athlete_sports")
      .select("*")
      .eq("athlete_profile_id", profile.id)
      .maybeSingle(),
    supabase
      .from("athlete_achievements")
      .select("*")
      .eq("athlete_profile_id", profile.id)
      .order("created_at", { ascending: true }),
  ]);

  if (sportResult.error || achievementsResult.error) {
    console.error(
      "loadAthleteProfileById: sport/achievements fetch failed:",
      sportResult.error,
      achievementsResult.error,
    );
    return { draft: null, error: true };
  }

  return {
    draft: {
      profile,
      sport: sportResult.data ?? null,
      achievements: achievementsResult.data ?? [],
    },
    error: false,
  };
}
