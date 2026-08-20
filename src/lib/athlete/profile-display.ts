import type { SelectOption } from "@/types/athlete";
import {
  ACHIEVEMENT_TYPES,
  GENDER_OPTIONS,
  PRIMARY_SPORTS,
  SKILL_LEVELS,
} from "@/lib/athlete-options";

// Stored values are slugs ("football", "semi-professional"); the profile
// view shows the human label from the same option lists the registration
// form uses, so the two stay in sync automatically. Falls back to the raw
// value for free-text fields (e.g. a discipline) that have no fixed list.
function findLabel(options: SelectOption[], value: string | null): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? value;
}

export function sportLabel(value: string | null): string | null {
  return findLabel(PRIMARY_SPORTS, value);
}

export function skillLevelLabel(value: string | null): string | null {
  return findLabel(SKILL_LEVELS, value);
}

export function genderLabel(value: string | null): string | null {
  return findLabel(GENDER_OPTIONS, value);
}

export function achievementTypeLabel(value: string | null): string | null {
  return findLabel(ACHIEVEMENT_TYPES, value);
}

export function initials(fullName: string | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function locationLine(city: string | null, country: string | null): string | null {
  return [city, country].filter(Boolean).join(", ") || null;
}

export function ageFromDateOfBirth(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
