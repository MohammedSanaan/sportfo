import type { Locale } from "@/i18n/config";

export type Gender = "male" | "female" | "other";

export type SkillLevel =
  | "beginner"
  | "amateur"
  | "semi-professional"
  | "professional";

export type ScholarshipStatus = "yes" | "no";

export interface SelectOption {
  value: string;
  label: string;
}

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  gender: Gender | "";
  nationality: string;
  country: string;
  city: string;
  mobileNumber: string;
  email: string;
  // Communication-preference locale -- independent of the site's active UI
  // locale (see i18n/LocaleProvider); changing this never switches the app
  // language. "" only ever appears transiently before a default is applied
  // (see buildEmptyFormValues) -- the field is required on submit.
  preferredLanguage: Locale | "";
  // E.164 phone, or "" if left blank -- optional, never a login credential.
  emergencyContact: string;
  school: string;
  club: string;
  coachName: string;
  // Optional government ID (Aadhaar or equivalent). Sensitive -- never
  // rendered on any public profile/discovery surface; see
  // PersonalDetailsSection and the athlete_profiles RLS/RPC comments in
  // supabase/migrations/20260829122700_athlete_personal_details_extra_fields.sql.
  aadhaarOrGovtId: string;
}

export type CompetitionLevel = "taluk" | "district" | "division" | "state" | "national";

// Canonical English values stored as-is (matches the athlete_sports.
// support_needed text[] CHECK-free column) -- a multi-select, so kept as a
// plain string[] rather than a closed union.
export const SUPPORT_NEEDED_VALUES = [
  "Coaching & Training",
  "Nutrition Guidance",
  "Physiotherapy / Sports Medicine",
  "Strength & Conditioning",
  "Mental Wellness / Sports Psychology",
  "Competition Entry Support",
  "Travel & Accommodation Support",
  "Sponsorship / Financial Assistance",
  "Equipment & Gear Support",
  "Exposure / Media Coverage",
  "Career Guidance",
  "Scholarship Support",
  "Internship / Job Opportunities",
  "Other",
] as const;

export interface SportsInformation {
  primarySport: string;
  // Kept as a separate canonical value, never combined into primarySport
  // (e.g. never "Team Sports - Cricket") -- see src/lib/sports/catalog.ts
  // for how it's resolved from primarySport.
  sportCategory: string;
  discipline: string;
  position: string;
  skillLevel: SkillLevel | "";
  // Highest competition tier the athlete has achieved/participated at.
  competitionLevel: CompetitionLevel | "";
  // Multi-select -- the kinds of support the athlete is looking for.
  supportNeeded: string[];
  // Free-text detail, shown only when supportNeeded includes "Other".
  supportNeededOther: string;
}

export type CertificateLevel =
  | "taluk"
  | "district"
  | "division"
  | "state"
  | "national"
  | "international";

// Admin-controlled only -- the athlete has read-only visibility (see
// AchievementsSection). "pending" is always the value for a brand-new
// achievement; only an admin RPC can move it to verified/rejected.
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface Achievement {
  // Present once the achievement has been persisted -- absent for rows the
  // athlete has added locally but not yet saved. Round-tripped through
  // Save Draft/Create Profile so repeat saves update existing rows instead
  // of duplicating them.
  id?: string;
  title: string;
  type: string;
  organization: string;
  date: string;
  description: string;
  // The competition tier this specific achievement was earned at.
  certificateLevel: CertificateLevel | "";
  // Read-only -- absent for a row that hasn't been saved yet (nothing to
  // verify), "pending" the moment it's first persisted. Never sent back to
  // the server; see registration-payload.ts, which drops it from the RPC
  // payload entirely, matching the RPC's own refusal to accept it.
  verificationStatus?: VerificationStatus;
  // A freshly picked, not-yet-uploaded file. Cleared back to null once it's
  // been uploaded and documentPath is set -- never sent to the server or
  // persisted anywhere itself.
  document: File | null;
  // The Storage object path for an already-uploaded document, or null/
  // undefined if none exists yet. Mirrors athlete_achievements.document_path.
  documentPath?: string | null;
}

export interface AdditionalRecognition {
  awards: string;
  scholarshipRecipient: ScholarshipStatus | "";
}

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "freelance"
  | "internship"
  | "self-employed"
  | "student"
  | "unemployed";

export type YearsExperience = "0-1" | "2-3" | "4-6" | "7-10" | "10+";

export interface Employment {
  employmentType: EmploymentType | "";
  organization: string;
  jobTitle: string;
  yearsExperience: YearsExperience | "";
}

export type ApparelSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
export type ShortsSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
// India/UK numeric shoe sizing -- stored as text (matches the dropdown
// values exactly), never cast to a number.
export type ShoeSize = "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13";

export interface ApparelLogistics {
  trackSuitSize: ApparelSize | "";
  tshirtSize: ApparelSize | "";
  shortsSize: ShortsSize | "";
  shoeSize: ShoeSize | "";
}

export interface ProfileSetup {
  // A freshly picked, not-yet-uploaded photo. Cleared back to null once
  // it's been uploaded and photoPath is set -- never sent to the server or
  // persisted anywhere itself (same document/documentPath split as an
  // Achievement's file).
  photo: File | null;
  photoPath?: string | null;
  shortBio: string;
  instagramUrl: string;
  facebookUrl: string;
  otherUrl: string;
}

export interface AthleteRegistrationFormValues {
  personalDetails: PersonalDetails;
  sportsInformation: SportsInformation;
  achievements: Achievement[];
  additionalRecognition: AdditionalRecognition;
  employment: Employment;
  apparelLogistics: ApparelLogistics;
  profileSetup: ProfileSetup;
}
