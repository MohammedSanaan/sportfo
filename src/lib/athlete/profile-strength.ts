import type { AthleteDraft } from "./registration-draft";

export interface ProfileStrengthItem {
  label: string;
  complete: boolean;
  // Anchor on /athlete/register (the same edit form used by the "Complete
  // Profile" CTA) pointing straight at the section that resolves this
  // item -- a real id AthleteRegistrationForm renders (see
  // findStepIndexForSectionId in wizard-steps.ts, which jumps the wizard to
  // whichever step owns this id before scrolling to it), never a
  // fabricated route.
  href: string;
}

export interface ProfileStrength {
  percentage: number;
  items: ProfileStrengthItem[];
}

// Every item is derived directly from persisted data the athlete actually
// entered -- never a fabricated or estimated signal (no profile views,
// connections, recruiter interest, or other invented analytics). Four
// equally-weighted checks, matching the ones named in the design brief.
export function calculateProfileStrength(draft: AthleteDraft): ProfileStrength {
  const { profile, sport, achievements } = draft;

  const personalComplete = Boolean(
    profile.full_name &&
      profile.date_of_birth &&
      profile.gender &&
      profile.nationality &&
      profile.country &&
      profile.city &&
      profile.email,
  );

  const sportsComplete = Boolean(sport?.primary_sport && sport?.skill_level);
  const hasAchievement = achievements.length > 0;
  const isPublic = profile.is_public;

  const items: ProfileStrengthItem[] = [
    { label: "Personal details complete", complete: personalComplete, href: "/athlete/register#section-personal" },
    { label: "Sports information complete", complete: sportsComplete, href: "/athlete/register#section-sport" },
    { label: "At least one achievement added", complete: hasAchievement, href: "/athlete/register#section-achievements" },
    { label: "Public profile enabled", complete: isPublic, href: "/athlete/register#section-profile" },
  ];

  const percentage = Math.round(
    (items.filter((item) => item.complete).length / items.length) * 100,
  );

  return { percentage, items };
}
