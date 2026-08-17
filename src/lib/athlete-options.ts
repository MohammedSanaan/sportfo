import type { SelectOption } from "@/types/athlete";

// Static for now. Designed to be swapped for a database-backed fetch later
// without changing how consuming components read the list.
export const PRIMARY_SPORTS: SelectOption[] = [
  { value: "football", label: "Football" },
  { value: "cricket", label: "Cricket" },
  { value: "basketball", label: "Basketball" },
  { value: "swimming", label: "Swimming" },
  { value: "athletics", label: "Athletics" },
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Badminton" },
  { value: "volleyball", label: "Volleyball" },
];

export const SKILL_LEVELS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "amateur", label: "Amateur" },
  { value: "semi-professional", label: "Semi-Professional" },
  { value: "professional", label: "Professional" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const ACHIEVEMENT_TYPES: SelectOption[] = [
  { value: "medal", label: "Medal" },
  { value: "award", label: "Award" },
  { value: "certification", label: "Certification" },
  { value: "tournament-result", label: "Tournament Result" },
  { value: "scholarship", label: "Scholarship" },
  { value: "other", label: "Other" },
];

export const SCHOLARSHIP_OPTIONS: SelectOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
