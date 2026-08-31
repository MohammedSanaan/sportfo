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
    // Only kept when type is actually "other" -- a stale specify value left
    // over from a since-changed selection must never persist once the
    // dropdown has moved on to a real option (the RPC's UPDATE always
    // overwrites this column outright, never coalesces, so this is the one
    // place that has to actively clear it).
    achievement_type_other: achievement.type === "other" ? emptyToNull(achievement.typeOther) : null,
    issuing_organization: emptyToNull(achievement.organization),
    issuing_organization_other:
      achievement.organization === "other" ? emptyToNull(achievement.organizationOther) : null,
    achievement_date: emptyToNull(achievement.date),
    description: emptyToNull(achievement.description),
    certificate_level: emptyToNull(achievement.certificateLevel),
    // Only kept when type is actually "medal" -- same "clear a now-stale
    // specify value at payload-build time" pattern as achievement_type_other/
    // issuing_organization_other above, rather than a client-side effect
    // that clears the form field itself.
    medal_type: achievement.type === "medal" ? emptyToNull(achievement.medalType) : null,
    // verification_status is deliberately never sent -- it's read-only for
    // the athlete (see AchievementForm's badge) and the RPC itself never
    // reads this key from the input jsonb, only writes it (default
    // 'pending' on insert, otherwise untouched on update).
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
  const {
    personalDetails,
    sportsInformation,
    achievements,
    additionalRecognition,
    employment,
    apparelLogistics,
    profileSetup,
  } = values;

  // "Other" is only ever a real selection alongside the rest of the array
  // -- an empty array is sent as null (matching every other empty-field
  // convention in this payload), never `[]`, to keep "no support needed
  // selected" and "field intentionally cleared" indistinguishable from
  // every other optional field here.
  const supportNeeded = sportsInformation.supportNeeded.length > 0
    ? sportsInformation.supportNeeded
    : null;
  // Same "empty selection is null, never []" convention as supportNeeded.
  const secondarySports = sportsInformation.secondarySports.length > 0
    ? sportsInformation.secondarySports
    : null;

  return {
    p_profile_status: status,
    p_full_name: emptyToNull(personalDetails.fullName),
    p_date_of_birth: emptyToNull(personalDetails.dateOfBirth),
    p_gender: emptyToNull(personalDetails.gender),
    p_nationality: emptyToNull(personalDetails.nationality),
    p_country: emptyToNull(personalDetails.country),
    p_city: emptyToNull(personalDetails.city),
    p_state: emptyToNull(personalDetails.state),
    // The mobile number is the athlete's verified login identity, not a
    // browser-editable value -- always the authenticated Supabase session's
    // phone, never whatever the client submitted for this field.
    p_mobile_number: emptyToNull(authenticatedPhone),
    p_email: emptyToNull(personalDetails.email),
    p_school_college: emptyToNull(personalDetails.school),
    // Club/Academy and Coach/Mentor Name are collected in the Sports
    // Information section now (see task spec), but still write to the
    // exact same athlete_profiles.club_academy/coach_mentor columns.
    p_club_academy: emptyToNull(sportsInformation.club),
    p_coach_mentor: emptyToNull(sportsInformation.coachName),
    p_preferred_language: emptyToNull(personalDetails.preferredLanguage),
    p_emergency_contact: emptyToNull(personalDetails.emergencyContact),
    p_aadhaar_or_govt_id: emptyToNull(personalDetails.aadhaarOrGovtId),
    p_awards_recognition: emptyToNull(additionalRecognition.awards),
    p_scholarship_recipient: scholarshipToBoolean(
      additionalRecognition.scholarshipRecipient,
    ),
    p_primary_sport: emptyToNull(sportsInformation.primarySport),
    p_sport_category: emptyToNull(sportsInformation.sportCategory),
    // The merged "Sport Discipline / Position / Role" field is written
    // into the existing sport_discipline column; position_role is no
    // longer collected as a separate value and is always sent null from
    // here on (see deriveDisciplinePosition in registration-draft.ts for
    // how a pre-merge record's two separate values are safely combined
    // for display without ever being lost).
    p_sport_discipline: emptyToNull(sportsInformation.disciplinePosition),
    // The generated Args type marks this non-nullable `string` for the same
    // generator-gap reason explained above (the RPC's own SQL signature has
    // no DEFAULT for this specific param, but the column and the function
    // body both accept null) -- a narrow cast on just this literal, not the
    // whole payload.
    p_position_role: null as unknown as string,
    p_skill_level: emptyToNull(sportsInformation.skillLevel),
    p_competition_level: emptyToNull(sportsInformation.competitionLevel),
    p_competition_level_other:
      sportsInformation.competitionLevel === "other"
        ? emptyToNull(sportsInformation.competitionLevelOther)
        : null,
    p_support_needed: supportNeeded,
    p_support_needed_other: emptyToNull(sportsInformation.supportNeededOther),
    p_secondary_sports: secondarySports,
    p_employment_type: emptyToNull(employment.employmentType),
    p_organization: emptyToNull(employment.organization),
    p_job_title: emptyToNull(employment.jobTitle),
    p_years_experience: emptyToNull(employment.yearsExperience),
    p_track_suit_size: emptyToNull(apparelLogistics.trackSuitSize),
    p_tshirt_size: emptyToNull(apparelLogistics.tshirtSize),
    p_shorts_size: emptyToNull(apparelLogistics.shortsSize),
    p_shoe_size: emptyToNull(apparelLogistics.shoeSize),
    p_short_bio: emptyToNull(profileSetup.shortBio),
    p_instagram_url: emptyToNull(profileSetup.instagramUrl),
    p_facebook_url: emptyToNull(profileSetup.facebookUrl),
    p_other_url: emptyToNull(profileSetup.otherUrl),
    // Never the raw File -- persistAndSync (AthleteRegistrationForm.tsx)
    // uploads it and writes the resulting Storage path into
    // profileSetup.photoPath *before* this function is called, so by the
    // time buildSaveRegistrationArgs runs there's only ever a path (or
    // null) left to send. Uses coalesce(new, existing) at the database
    // layer, so omitting a re-upload here never erases a previously
    // uploaded photo.
    p_profile_photo_path: emptyToNull(profileSetup.photoPath),
    p_achievements: achievements.map(mapAchievement),
  } as RpcArgs;
}
