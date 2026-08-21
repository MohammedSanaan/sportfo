import type { AthleteDraft } from "./registration-draft";

export interface ProfileStrength {
  filled: number;
  total: number;
  percent: number;
  label: "Getting started" | "Good" | "Strong";
}

// Purely derived from data the schema already has -- no new columns. Each
// check mirrors a field the profile view actually renders, so the score
// reflects how complete the *visible* profile is, not internal bookkeeping
// fields like id/timestamps/profile_status.
export function computeProfileStrength(draft: AthleteDraft): ProfileStrength {
  const { profile, sport, achievements } = draft;

  const checks = [
    Boolean(profile.full_name),
    Boolean(profile.date_of_birth),
    Boolean(profile.gender),
    Boolean(profile.nationality),
    Boolean(profile.city && profile.country),
    Boolean(profile.school_college),
    Boolean(profile.club_academy),
    Boolean(profile.coach_mentor),
    Boolean(sport?.primary_sport),
    Boolean(sport?.sport_discipline),
    Boolean(sport?.position_role),
    Boolean(sport?.skill_level),
    achievements.length > 0,
    Boolean(profile.awards_recognition),
    profile.scholarship_recipient !== null,
  ];

  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  const percent = Math.round((filled / total) * 100);

  const label: ProfileStrength["label"] =
    percent >= 80 ? "Strong" : percent >= 50 ? "Good" : "Getting started";

  return { filled, total, percent, label };
}

export interface ProfileStrengthItem {
  label: string;
  complete: boolean;
}

export interface ProfileStrengthChecklist {
  percentage: number;
  items: ProfileStrengthItem[];
}

// Every item is derived directly from persisted data the athlete actually
// entered -- never a fabricated or estimated signal (no profile views,
// connections, recruiter interest, or other invented analytics). Four
// equally-weighted checks, matching the ones named in the design brief.
export function calculateProfileStrength(draft: AthleteDraft): ProfileStrengthChecklist {
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
    { label: "Personal details complete", complete: personalComplete },
    { label: "Sports information complete", complete: sportsComplete },
    { label: "At least one achievement added", complete: hasAchievement },
    { label: "Public profile enabled", complete: isPublic },
  ];

  const percentage = Math.round(
    (items.filter((item) => item.complete).length / items.length) * 100,
  );

  return { percentage, items };
}
