import type { Achievement } from "@/types/athlete";

// A "+ Add Achievement" card the athlete hasn't touched yet -- no text
// fields filled in and no file picked. Persisting this as an empty row on
// every Save Draft was Step 5's known rough edge; skip it instead.
//
// An achievement that already has a real `id` is never treated as blank
// even if every field is currently empty -- clearing fields isn't how
// removal works (the "Remove" button is, which already takes it out of the
// field array entirely), so an existing row must never be silently dropped
// just because its fields are temporarily empty.
export function isBlankAchievement(achievement: Achievement): boolean {
  if (achievement.id) return false;

  const fieldsEmpty =
    achievement.title.trim() === "" &&
    achievement.type.trim() === "" &&
    achievement.organization.trim() === "" &&
    achievement.date.trim() === "" &&
    achievement.description.trim() === "";

  return fieldsEmpty && achievement.document === null;
}
