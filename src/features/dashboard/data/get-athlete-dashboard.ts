import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { calculateProfileStrength } from "@/lib/athlete/profile-strength";
import { getOwnAccountIdentity } from "@/lib/account/identity";
import { buildProfilePhotoUrl } from "@/lib/storage/profile-photo";
import type { AthleteDashboardData, DashboardPlatformCounts } from "../types";

// The one server-side entry point for everything the Athlete Dashboard
// renders -- no component below this queries Supabase directly. Every
// field is either real, RLS-scoped data or an explicit `{ available:
// false }` marker; nothing here is fabricated to fill a visual gap (see
// UnavailableSection in ../types.ts).
//
// Returns null only when the caller has no submitted athlete registration
// at all -- the route itself is expected to redirect away before ever
// reaching that case (see src/app/dashboard/page.tsx), but this function
// stays honest about its own precondition rather than silently returning
// a half-empty shape.
export async function getAthleteDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AthleteDashboardData | null> {
  const [{ draft, error: draftError }, identity, countsResult] = await Promise.all([
    loadAthleteDraft(supabase, userId),
    getOwnAccountIdentity(supabase, userId),
    supabase.rpc("get_public_registration_counts"),
  ]);

  if (draftError || !draft || draft.profile.profile_status !== "submitted") {
    return null;
  }

  const { profile, achievements } = draft;

  const platformCounts = parsePlatformCounts(countsResult.data);
  if (countsResult.error) {
    console.error("getAthleteDashboardData: platform counts failed:", countsResult.error);
  }

  return {
    identity: {
      // Prefers the profile's own current full_name over the (possibly
      // stale, set-once-at-submission) registrations.display_name --
      // an athlete who updates their name later should see it reflected
      // immediately here.
      fullName: profile.full_name ?? identity.displayName,
      sportfoId: identity.sportfoId,
      isAdmin: identity.isAdmin,
      photoUrl: buildProfilePhotoUrl(profile.profile_photo_path),
      skillLevel: draft.sport?.skill_level ?? null,
    },
    profile: {
      isPublic: profile.is_public,
      publicSlug: profile.public_slug,
      profileStatus: "submitted",
    },
    profileStrength: calculateProfileStrength(draft),
    stats: {
      achievementsCount: achievements.length,
      verifiedCount: achievements.filter((a) => a.verification_status === "verified").length,
    },
    // No opportunities/events/trials/jobs/sponsorships/courses tables and
    // no public coach/academy discovery RPC exist in SportFo today (see
    // the DB audit for this phase) -- every one of these stays an honest
    // "not available yet" rather than inventing sample content.
    opportunities: { available: false },
    coaches: { available: false },
    academies: { available: false },
    notifications: { available: false },
    platformCounts,
  };
}

function parsePlatformCounts(data: unknown): DashboardPlatformCounts | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const { athletes, academies, sponsors } = record;
  if (typeof athletes !== "number" || typeof academies !== "number" || typeof sponsors !== "number") {
    return null;
  }
  return { athletes, academies, sponsors };
}
