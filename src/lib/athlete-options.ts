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

// The grassroots-to-international competition ladder, lowest to highest --
// order matters wherever this list drives a <select>, so it always reads
// top-down as "lowest tier first" rather than alphabetically.
export const COMPETITION_LEVELS: SelectOption[] = [
  { value: "taluk", label: "Taluk" },
  { value: "district", label: "District" },
  { value: "division", label: "Division / Zonal" },
  { value: "state", label: "State" },
  { value: "national", label: "National" },
  { value: "international", label: "International / Olympics" },
];

// Which institutional pathway the athlete competes through -- independent
// of competition_level (e.g. a University-track athlete can still compete
// at National level).
export const PARALLEL_TRACKS: SelectOption[] = [
  { value: "school-college", label: "School / College" },
  { value: "university", label: "University" },
  { value: "corporate", label: "Corporate" },
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

// Read-only display views (the athlete profile page) show the friendly
// label for a stored option value rather than the raw "semi-professional"
// -style value -- falls back to the raw value itself for anything not in
// the list, rather than hiding data the athlete actually entered.
export function getOptionLabel(
  options: SelectOption[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}
