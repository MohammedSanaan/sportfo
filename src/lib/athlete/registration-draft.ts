import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { DbGender, DbSkillLevel } from "@/types/database";
import type {
  AthleteRegistrationFormValues,
  CertificateLevel,
  CompetitionLevel,
  EmploymentType,
  VerificationStatus,
  YearsExperience,
  ApparelSize,
  ShortsSize,
  ShoeSize,
} from "@/types/athlete";
import { isLocale, type Locale } from "@/i18n/config";

type ProfileRow = Database["public"]["Tables"]["athlete_profiles"]["Row"];
type SportRow = Database["public"]["Tables"]["athlete_sports"]["Row"];
type AchievementRow = Database["public"]["Tables"]["athlete_achievements"]["Row"];

export interface AthleteDraft {
  profile: ProfileRow;
  sport: SportRow | null;
  achievements: AchievementRow[];
}

// Reads the athlete's own registration data back out. All three queries run
// under the caller's authenticated session, so RLS ("Athletes can view own
// profile" / "own sports" / "own achievements") is what actually scopes
// this -- there is no user_id filter to get wrong here.
export async function loadAthleteDraft(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ draft: AthleteDraft | null; error: boolean }> {
  const { data: profile, error: profileError } = await supabase
    .from("athlete_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("loadAthleteDraft: profile fetch failed:", profileError);
    return { draft: null, error: true };
  }
  if (!profile) {
    return { draft: null, error: false };
  }

  const [sportResult, achievementsResult] = await Promise.all([
    supabase
      .from("athlete_sports")
      .select("*")
      .eq("athlete_profile_id", profile.id)
      .maybeSingle(),
    supabase
      .from("athlete_achievements")
      .select("*")
      .eq("athlete_profile_id", profile.id)
      .order("created_at", { ascending: true }),
  ]);

  if (sportResult.error || achievementsResult.error) {
    console.error(
      "loadAthleteDraft: sport/achievements fetch failed:",
      sportResult.error,
      achievementsResult.error,
    );
    return { draft: null, error: true };
  }

  return {
    draft: {
      profile,
      sport: sportResult.data ?? null,
      achievements: achievementsResult.data ?? [],
    },
    error: false,
  };
}

// authPhone always wins over whatever is stored on the profile row -- the
// mobile number field displays the live, verified session identity, not a
// potentially-stale database copy of it. currentLocale is the visitor's
// live UI locale, used only as the Preferred Language fallback for a
// profile saved before this field existed (preferred_language null) --
// never overwrites a value the athlete already chose.
export function mapDraftToFormValues(
  draft: AthleteDraft,
  authPhone: string,
  currentLocale: Locale,
): AthleteRegistrationFormValues {
  const { profile, sport, achievements } = draft;

  return {
    personalDetails: {
      fullName: profile.full_name ?? "",
      dateOfBirth: profile.date_of_birth ?? "",
      gender: (profile.gender as DbGender | null) ?? "",
      nationality: profile.nationality ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
      mobileNumber: authPhone,
      email: profile.email ?? "",
      preferredLanguage: isLocale(profile.preferred_language)
        ? profile.preferred_language
        : currentLocale,
      emergencyContact: profile.emergency_contact ?? "",
      school: profile.school_college ?? "",
      club: profile.club_academy ?? "",
      coachName: profile.coach_mentor ?? "",
      aadhaarOrGovtId: profile.aadhaar_or_govt_id ?? "",
    },
    sportsInformation: {
      primarySport: sport?.primary_sport ?? "",
      sportCategory: sport?.sport_category ?? "",
      discipline: sport?.sport_discipline ?? "",
      position: sport?.position_role ?? "",
      skillLevel: (sport?.skill_level as DbSkillLevel | null) ?? "",
      competitionLevel: (sport?.competition_level as CompetitionLevel | null) ?? "",
      supportNeeded: sport?.support_needed ?? [],
      supportNeededOther: sport?.support_needed_other ?? "",
    },
    achievements: achievements.map((row) => ({
      id: row.id,
      title: row.title ?? "",
      type: row.achievement_type ?? "",
      organization: row.issuing_organization ?? "",
      date: row.achievement_date ?? "",
      description: row.description ?? "",
      certificateLevel: (row.certificate_level as CertificateLevel | null) ?? "",
      verificationStatus: (row.verification_status as VerificationStatus | null) ?? undefined,
      document: null,
      documentPath: row.document_path ?? null,
    })),
    additionalRecognition: {
      awards: profile.awards_recognition ?? "",
      scholarshipRecipient:
        profile.scholarship_recipient === null
          ? ""
          : profile.scholarship_recipient
            ? "yes"
            : "no",
    },
    employment: {
      employmentType: (profile.employment_type as EmploymentType | null) ?? "",
      organization: profile.organization ?? "",
      jobTitle: profile.job_title ?? "",
      yearsExperience: (profile.years_experience as YearsExperience | null) ?? "",
    },
    apparelLogistics: {
      trackSuitSize: (profile.track_suit_size as ApparelSize | null) ?? "",
      tshirtSize: (profile.tshirt_size as ApparelSize | null) ?? "",
      shortsSize: (profile.shorts_size as ShortsSize | null) ?? "",
      shoeSize: (profile.shoe_size as ShoeSize | null) ?? "",
    },
    profileSetup: {
      photo: null,
      photoPath: profile.profile_photo_path ?? null,
      shortBio: profile.short_bio ?? "",
      instagramUrl: profile.instagram_url ?? "",
      facebookUrl: profile.facebook_url ?? "",
      otherUrl: profile.other_url ?? "",
    },
  };
}

// India is SportFo's primary target market -- nationality/country default
// to it so most athletes never have to type it, while staying plain,
// editable text fields for anyone else. Preferred Language defaults to the
// visitor's current SportFo UI language (see task spec) -- a pure starting
// value for this independent preference field, never a live link back to
// the site's UI locale.
export function buildEmptyFormValues(
  authPhone: string,
  currentLocale: Locale,
): AthleteRegistrationFormValues {
  return {
    personalDetails: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      nationality: "Indian",
      country: "India",
      city: "",
      mobileNumber: authPhone,
      email: "",
      preferredLanguage: currentLocale,
      emergencyContact: "",
      school: "",
      club: "",
      coachName: "",
      aadhaarOrGovtId: "",
    },
    sportsInformation: {
      primarySport: "",
      sportCategory: "",
      discipline: "",
      position: "",
      skillLevel: "",
      competitionLevel: "",
      supportNeeded: [],
      supportNeededOther: "",
    },
    achievements: [],
    additionalRecognition: {
      awards: "",
      scholarshipRecipient: "",
    },
    employment: {
      employmentType: "",
      organization: "",
      jobTitle: "",
      yearsExperience: "",
    },
    apparelLogistics: {
      trackSuitSize: "",
      tshirtSize: "",
      shortsSize: "",
      shoeSize: "",
    },
    profileSetup: {
      photo: null,
      photoPath: null,
      shortBio: "",
      instagramUrl: "",
      facebookUrl: "",
      otherUrl: "",
    },
  };
}
