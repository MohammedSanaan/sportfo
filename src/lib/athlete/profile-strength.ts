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
