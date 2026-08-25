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
  school: string;
  club: string;
  coachName: string;
}

export interface SportsInformation {
  primarySport: string;
  // Kept as a separate canonical value, never combined into primarySport
  // (e.g. never "Team Sports - Cricket") -- see src/lib/sports/catalog.ts
  // for how it's resolved from primarySport.
  sportCategory: string;
  discipline: string;
  position: string;
  skillLevel: SkillLevel | "";
}

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

export interface AthleteRegistrationFormValues {
  personalDetails: PersonalDetails;
  sportsInformation: SportsInformation;
  achievements: Achievement[];
  additionalRecognition: AdditionalRecognition;
}
