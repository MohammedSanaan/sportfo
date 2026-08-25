import type { SelectOption } from "@/types/athlete";
import { SPORT_OPTIONS } from "@/lib/sports/catalog";

// The full canonical SportFo sports list -- see src/lib/sports/catalog.ts,
// the single source of truth for sport options and sport->category
// resolution. Re-exported here so existing importers (discovery filters,
// profile display) don't need to change their import path.
export const PRIMARY_SPORTS: SelectOption[] = SPORT_OPTIONS;

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
