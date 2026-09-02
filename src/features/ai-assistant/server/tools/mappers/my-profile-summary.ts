// Pure mapper -- see my-identity.ts's header comment for why this lives in
// its own file (zero runtime imports, directly testable) separately from
// ../get-my-profile-summary.ts's `execute()`.
import type { AthleteDraft } from "@/lib/athlete/registration-draft";

export interface MyProfileSummaryResult {
  hasProfile: boolean;
  primarySport: string | null;
  secondarySports: string[];
  sportCategory: string | null;
  skillLevel: string | null;
  competitionLevel: string | null;
  clubAcademy: string | null;
  coachMentor: string | null;
  profileVisibility: "public" | "private";
}

const EMPTY_RESULT: MyProfileSummaryResult = {
  hasProfile: false,
  primarySport: null,
  secondarySports: [],
  sportCategory: null,
  skillLevel: null,
  competitionLevel: null,
  clubAcademy: null,
  coachMentor: null,
  profileVisibility: "private",
};

// Deliberately narrow to exactly the fields listed in the task spec's
// "GET MY PROFILE SUMMARY" section. Every athlete_profiles/athlete_sports
// column NOT read here (aadhaar_or_govt_id, emergency_contact,
// mobile_number, email, profile_photo_path, dates of birth, ...) simply
// never enters this function's return value -- this is an allowlist of
// what gets read off `draft`, not a blocklist that has to be kept in sync
// as new columns are added. See my-profile-summary.test.ts, which asserts
// this against a fixture draft carrying every sensitive field populated.
export function toMyProfileSummaryResult(draft: AthleteDraft | null): MyProfileSummaryResult {
  if (!draft || draft.profile.profile_status !== "submitted") {
    return EMPTY_RESULT;
  }

  const { profile, sport } = draft;
  return {
    hasProfile: true,
    primarySport: sport?.primary_sport ?? null,
    secondarySports: sport?.secondary_sports ?? [],
    sportCategory: sport?.sport_category ?? null,
    skillLevel: sport?.skill_level ?? null,
    competitionLevel: sport?.competition_level ?? null,
    clubAcademy: profile.club_academy ?? null,
    coachMentor: profile.coach_mentor ?? null,
    profileVisibility: profile.is_public ? "public" : "private",
  };
}
