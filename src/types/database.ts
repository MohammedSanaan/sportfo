// Thin, friendly aliases over the generated Supabase `Database` type.
//
// Deliberately kept separate from src/types/athlete.ts (the React Hook Form
// data shape). The two will need a mapping layer once submission is wired up
// -- form field names are camelCase and grouped for the UI, while these rows
// are the flat, snake_case shape Postgres actually stores. Coupling the form
// types directly to generated database types would leak schema changes
// straight into form components; this file is the seam where that mapping
// will live.
import type { Database } from "./supabase";

export type AthleteProfileRow =
  Database["public"]["Tables"]["athlete_profiles"]["Row"];
export type AthleteProfileInsert =
  Database["public"]["Tables"]["athlete_profiles"]["Insert"];
export type AthleteProfileUpdate =
  Database["public"]["Tables"]["athlete_profiles"]["Update"];

export type AthleteSportRow =
  Database["public"]["Tables"]["athlete_sports"]["Row"];
export type AthleteSportInsert =
  Database["public"]["Tables"]["athlete_sports"]["Insert"];
export type AthleteSportUpdate =
  Database["public"]["Tables"]["athlete_sports"]["Update"];

export type AthleteAchievementRow =
  Database["public"]["Tables"]["athlete_achievements"]["Row"];
export type AthleteAchievementInsert =
  Database["public"]["Tables"]["athlete_achievements"]["Insert"];
export type AthleteAchievementUpdate =
  Database["public"]["Tables"]["athlete_achievements"]["Update"];

// Supabase's type generator reads column types, not CHECK constraint
// expressions, so generated columns like `profile_status` come through as
// plain `string`. These literal unions mirror the CHECK constraints defined
// in supabase/migrations/20260815120000_athlete_registration_tables.sql --
// keep them in sync if that migration changes.
export type ProfileStatus = "draft" | "submitted";
export type DbGender = "male" | "female" | "other";
export type DbSkillLevel =
  | "beginner"
  | "amateur"
  | "semi-professional"
  | "professional";
