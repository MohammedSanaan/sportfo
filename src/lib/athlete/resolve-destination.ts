import type { Database } from "@/types/supabase";

type AthleteProfileLookup = Pick<
  Database["public"]["Tables"]["athlete_profiles"]["Row"],
  "id" | "profile_status"
> | null;

// No profile yet, or a draft in progress, both continue the registration
// flow. A submitted profile has no dedicated destination yet -- the athlete
// profile page is a later milestone -- so it temporarily lands back on the
// public landing page rather than a fake dashboard. Update this once that
// page exists.
export function resolveAthleteDestination(
  profile: AthleteProfileLookup,
): string {
  if (!profile || profile.profile_status === "draft") {
    return "/athlete/register";
  }
  return "/";
}
