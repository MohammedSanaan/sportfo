import type { ProfileStrength } from "@/lib/athlete/profile-strength";

export interface DashboardIdentity {
  fullName: string | null;
  sportfoId: string | null;
  isAdmin: boolean;
  photoUrl: string | null;
  // Raw canonical value (e.g. "professional") -- the header badge
  // translates it via SKILL_LEVELS/translateOptions, same as everywhere
  // else in the app; never pre-translated here since this is server data.
  skillLevel: string | null;
}

export interface DashboardProfile {
  isPublic: boolean;
  publicSlug: string | null;
  // Always "submitted" in practice -- the /dashboard route itself only
  // renders for a submitted Athlete (see the route's own gate) -- kept
  // as the real union rather than a bare boolean so this type doesn't
  // quietly assume a precondition enforced somewhere else.
  profileStatus: "draft" | "submitted";
}

export interface DashboardStats {
  achievementsCount: number;
  verifiedCount: number;
}

// Every one of these sections has no backing data source in SportFo today
// (no opportunities/events/trials/jobs/sponsorships/courses tables, no
// public coach/academy discovery RPC -- see the migration audit for this
// phase). `available: false` is the ONLY state possible right now; the
// field exists (rather than just omitting the section) so a future phase
// that adds the real backend only has to flip this and populate `items`,
// never restructure the type or the components that read it.
export interface UnavailableSection {
  available: false;
}

export interface DashboardPlatformCounts {
  athletes: number;
  academies: number;
  sponsors: number;
}

export interface AthleteDashboardData {
  identity: DashboardIdentity;
  profile: DashboardProfile;
  profileStrength: ProfileStrength;
  stats: DashboardStats;
  opportunities: UnavailableSection;
  coaches: UnavailableSection;
  academies: UnavailableSection;
  notifications: UnavailableSection;
  // Null only if the count RPC itself fails -- the section is hidden
  // entirely in that case rather than showing a misleading "0".
  platformCounts: DashboardPlatformCounts | null;
}
