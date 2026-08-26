import type { Database } from "@/types/supabase";
import type { ProfileStatus } from "@/types/database";
import type { Achievement, AthleteRegistrationFormValues } from "@/types/athlete";

type RpcArgs = Database["public"]["Functions"]["save_athlete_registration"]["Args"];

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function scholarshipToBoolean(value: string): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function mapAchievement(achievement: Achievement) {
  const payload: Record<string, unknown> = {
    title: emptyToNull(achievement.title),
    achievement_type: emptyToNull(achievement.type),
    issuing_organization: emptyToNull(achievement.organization),
    achievement_date: emptyToNull(achievement.date),
    description: emptyToNull(achievement.description),
  };
  // Only include `id` for achievements that already exist in the database --
  // its presence is how the RPC tells an update from an insert.
  if (achievement.id) payload.id = achievement.id;
  return payload;
}

// Builds the exact argument shape save_athlete_registration expects.
//
// The generated Supabase Functions["Args"] type marks every parameter as
// non-nullable `string`/`boolean` because pg_catalog doesn't expose SQL
// nullability for function parameters to the type generator -- every one of
// these is declared nullable in the migration and Postgres accepts null for
// all of them. The cast at the call site (registration-actions.ts) papers
// over that generator gap, not a real type mismatch.
export function buildSaveRegistrationArgs(
  values: AthleteRegistrationFormValues,
  status: ProfileStatus,
  authenticatedPhone: string,
): RpcArgs {
  const { personalDetails, sportsInformation, achievements, additionalRecognition } =
    values;

  return {
    p_profile_status: status,
    p_full_name: emptyToNull(personalDetails.fullName),
    p_date_of_birth: emptyToNull(personalDetails.dateOfBirth),
    p_gender: emptyToNull(personalDetails.gender),
    p_nationality: emptyToNull(personalDetails.nationality),
    p_country: emptyToNull(personalDetails.country),
    p_city: emptyToNull(personalDetails.city),
    // The mobile number is the athlete's verified login identity, not a
    // browser-editable value -- always the authenticated Supabase session's
    // phone, never whatever the client submitted for this field.
    p_mobile_number: emptyToNull(authenticatedPhone),
    p_email: emptyToNull(personalDetails.email),
    p_school_college: emptyToNull(personalDetails.school),
    p_club_academy: emptyToNull(personalDetails.club),
    p_coach_mentor: emptyToNull(personalDetails.coachName),
    p_awards_recognition: emptyToNull(additionalRecognition.awards),
    p_scholarship_recipient: scholarshipToBoolean(
      additionalRecognition.scholarshipRecipient,
    ),
    p_primary_sport: emptyToNull(sportsInformation.primarySport),
    p_sport_category: emptyToNull(sportsInformation.sportCategory),
    p_sport_discipline: emptyToNull(sportsInformation.discipline),
    p_position_role: emptyToNull(sportsInformation.position),
    p_skill_level: emptyToNull(sportsInformation.skillLevel),
    p_achievements: achievements.map(mapAchievement),
  } as RpcArgs;
}
