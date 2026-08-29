import type { SelectOption } from "@/types/athlete";
import { SUPPORT_NEEDED_VALUES } from "@/types/athlete";
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

// The grassroots-to-national competition ladder, lowest to highest --
// order matters wherever this list drives a <select>, so it always reads
// top-down as "lowest tier first" rather than alphabetically. Exactly 5
// values -- matches athlete_sports.competition_level's CHECK constraint
// (see supabase/migrations/20260829150000_athlete_registration_expansion.sql).
// Deliberately no "international" tier here (unlike CERTIFICATE_LEVELS
// below, which does have one) -- an individual achievement can be earned
// at an international meet even for an athlete whose own highest ongoing
// competition level is National.
export const COMPETITION_LEVELS: SelectOption[] = [
  { value: "taluk", label: "Taluk" },
  { value: "district", label: "District" },
  { value: "division", label: "Division / Zonal" },
  { value: "state", label: "State" },
  { value: "national", label: "National" },
];

// The tier a single achievement/certificate was earned at -- a separate
// scale from COMPETITION_LEVELS above (6 values, includes International/
// Olympics), matches athlete_achievements.certificate_level's CHECK
// constraint.
export const CERTIFICATE_LEVELS: SelectOption[] = [
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

// "medal" is deliberately kept as the value for the medal option (rather
// than e.g. "medal-gold-silver-bronze") -- some existing athlete_achievements
// rows already store "medal" from before this list was expanded, and
// reusing the same value means those rows keep a proper translated label
// instead of falling back to the raw stored string.
export const ACHIEVEMENT_TYPES: SelectOption[] = [
  { value: "participation", label: "Participation" },
  { value: "merit-rank", label: "Merit / Rank" },
  { value: "medal", label: "Medal (Gold / Silver / Bronze)" },
  { value: "selection-trials-qualified", label: "Selection / Trials Qualified" },
  { value: "championship-winner", label: "Championship Winner" },
  { value: "record-holder", label: "Record Holder" },
  { value: "other", label: "Other" },
];

export const EMPLOYMENT_TYPES: SelectOption[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed" },
];

export const YEARS_EXPERIENCE: SelectOption[] = [
  { value: "0-1", label: "0–1 years" },
  { value: "2-3", label: "2–3 years" },
  { value: "4-6", label: "4–6 years" },
  { value: "7-10", label: "7–10 years" },
  { value: "10+", label: "10+ years" },
];

export const APPAREL_SIZES: SelectOption[] = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "XXXL", label: "XXXL" },
];

// Shorts run one size smaller than the track suit / t-shirt range -- no
// XXXL option, matching ShortsSize in src/types/athlete.ts.
export const SHORTS_SIZES: SelectOption[] = APPAREL_SIZES.filter(
  (option) => option.value !== "XXXL",
);

// India/UK numeric shoe sizing, 4-13 -- clearly distinct from US sizing,
// which SportFo does not use anywhere in this form.
export const SHOE_SIZES: SelectOption[] = Array.from({ length: 10 }, (_, index) => {
  const size = String(index + 4);
  return { value: size, label: size };
});

// The 14 canonical support-needed options -- value and label are
// deliberately identical (the literal canonical string stored in
// athlete_sports.support_needed, see SUPPORT_NEEDED_VALUES in
// src/types/athlete.ts). Translated via options.supportNeeded.{value} in
// translateOptions -- none of these values contain a "." character, so
// they're safe as a dictionary key segment even with spaces/slashes/&.
export const SUPPORT_NEEDED: SelectOption[] = SUPPORT_NEEDED_VALUES.map((value) => ({
  value,
  label: value,
}));

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
