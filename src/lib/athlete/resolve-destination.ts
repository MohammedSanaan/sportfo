import type { Database } from "@/types/supabase";

type AthleteProfileLookup = Pick<
  Database["public"]["Tables"]["athlete_profiles"]["Row"],
  "id" | "profile_status"
> | null;

// No profile yet, or a draft in progress, both continue the registration
// flow. A submitted profile has its own dedicated view now.
export function resolveAthleteDestination(
  profile: AthleteProfileLookup,
): string {
  if (!profile || profile.profile_status === "draft") {
    return "/athlete/register";
  }
  return "/athlete/profile";
}
