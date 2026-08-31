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
  // Rendered/labelled as "Taluk / City / District" in the form (see
  // PersonalDetailsSection) -- the property/column name stays `city` so
  // every existing reader (discovery filters, AthleteCard, public/own
  // profile display, profile-strength calc) keeps working unchanged.
  city: string;
  // New: rendered between city and country in Personal Details. Optional --
  // free text for now, no reusable state catalog exists in the project yet.
  state: string;
  country: string;
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
  // club/coachName moved to SportsInformation (see task spec) -- still the
  // same athlete_profiles.club_academy/coach_mentor columns, just read/
  // written from a different spot in the form values shape.
  // Optional government ID (Aadhaar or equivalent). Sensitive -- never
  // rendered on any public profile/discovery surface; see
  // PersonalDetailsSection and the athlete_profiles RLS/RPC comments in
  // supabase/migrations/20260829122700_athlete_personal_details_extra_fields.sql.
  aadhaarOrGovtId: string;
}

export type CompetitionLevel =
  | "taluk"
  | "district"
  | "division"
  | "state"
  | "national"
  | "international"
  | "other";

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
  // Other sports the athlete also participates in -- always a subset of
  // the same sports catalog as primarySport, and never contains the
  // current primarySport value (enforced in SecondarySportsField/
  // SportsInformationSection, not just at the type level). Purely
  // additional athlete capability/interest signal -- never affects
  // sportCategory, which is derived from primarySport alone.
  secondarySports: string[];
  // Kept as a separate canonical value, never combined into primarySport
  // (e.g. never "Team Sports - Cricket") -- see src/lib/sports/catalog.ts
  // for how it's resolved from primarySport.
  sportCategory: string;
  // Merged "Sport Discipline / Position / Role" free-text field (replaces
  // the old separate discipline + position fields). Persisted into the
  // existing athlete_sports.sport_discipline column -- see
  // registration-draft.ts's deriveDisciplinePosition for how an older
  // record with sport_discipline/position_role stored separately is
  // safely combined for display without losing either value.
  disciplinePosition: string;
  skillLevel: SkillLevel | "";
  // Highest competition tier the athlete has achieved/participated at.
  competitionLevel: CompetitionLevel | "";
  // Free-text detail, shown only when competitionLevel === "other".
  competitionLevelOther: string;
  // Moved from PersonalDetails (see task spec) -- same
  // athlete_profiles.club_academy/coach_mentor columns as before, just
  // read/written from here now.
  club: string;
  coachName: string;
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

// The body that issued/certified a specific achievement -- a separate
// concept from CertificateLevel (the tier) and from personalDetails.school/
// club (the athlete's own affiliation). Canonical values only enforced at
// the application layer (see athlete-options.ts) -- the database column has
// no CHECK constraint, matching achievement_type/certificate_level.
export type IssuingOrganization =
  | "taluk-sports-authority"
  | "district-sports-authority"
  | "division-zonal-sports-authority"
  | "state-sports-authority"
  | "national-sports-federation-sai"
  | "international-federation-olympic-committee"
  | "school-college-university"
  | "private-academy-club"
  | "other";

// Admin-controlled only -- the athlete has read-only visibility (see
// AchievementsSection). "pending" is always the value for a brand-new
// achievement; only an admin RPC can move it to verified/rejected.
export type VerificationStatus = "pending" | "verified" | "rejected";

export type MedalType = "gold" | "silver" | "bronze";

export interface Achievement {
  // Present once the achievement has been persisted -- absent for rows the
  // athlete has added locally but not yet saved. Round-tripped through
  // Save Draft/Create Profile so repeat saves update existing rows instead
  // of duplicating them.
  id?: string;
  title: string;
  // Canonical Achievement Type value (see ACHIEVEMENT_TYPES) -- kept as a
  // plain string, not the narrower union, since an achievement saved before
  // this vocabulary existed may hold an older/unrecognized value and must
  // still round-trip without being coerced or dropped.
  type: string;
  // Free-text detail, shown only when type === "other". Never conflated
  // with `description` -- a dedicated field, matching organizationOther.
  typeOther: string;
  // Canonical Issuing Organization value (see ISSUING_ORGANIZATIONS) -- see
  // `type` above for why this stays a plain string rather than
  // IssuingOrganization | "".
  organization: string;
  // Free-text detail, shown only when organization === "other". The actual
  // organization name is never lost by only storing the literal "Other".
  organizationOther: string;
  date: string;
  description: string;
  // The competition tier this specific achievement was earned at.
  certificateLevel: CertificateLevel | "";
  // Set only when type === "medal" -- cleared (never persisted) for any
  // other achievement type, see buildSaveRegistrationArgs' mapAchievement.
  medalType: MedalType | "";
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
