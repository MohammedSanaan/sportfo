"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { formatAuthPhone } from "@/lib/phone/format-auth-phone";
import { buildSaveRegistrationArgs } from "@/lib/athlete/registration-payload";
import { friendlySaveError } from "@/lib/athlete/registration-errors";
import type { Achievement, AthleteRegistrationFormValues } from "@/types/athlete";

export type SaveRegistrationResult =
  | { ok: true; achievements: Achievement[]; profileStatus: "draft" | "submitted" }
  | { ok: false; error: string };

interface RpcAchievement {
  id: string;
  title: string | null;
  achievement_type: string | null;
  issuing_organization: string | null;
  achievement_date: string | null;
  description: string | null;
}

interface RpcResult {
  profile: { profile_status: string };
  achievements: RpcAchievement[];
}

// save_athlete_registration returns `jsonb`, which the type generator can
// only widen to `Json` -- narrow it by hand rather than casting blindly.
function parseRpcResult(data: unknown): RpcResult | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const profile = record.profile;
  if (!profile || typeof profile !== "object" || !("profile_status" in profile)) {
    return null;
  }

  const achievements = Array.isArray(record.achievements) ? record.achievements : null;
  if (!achievements) return null;

  return {
    profile: profile as RpcResult["profile"],
    achievements: achievements as RpcAchievement[],
  };
}

async function persistRegistration(
  values: AthleteRegistrationFormValues,
  status: "draft" | "submitted",
): Promise<SaveRegistrationResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const supabase = await createClient();
  const args = buildSaveRegistrationArgs(values, status, formatAuthPhone(user.phone));

  const { data, error } = await supabase.rpc("save_athlete_registration", args);

  if (error) {
    console.error(`save_athlete_registration (${status}) failed:`, error);
    return { ok: false, error: friendlySaveError(error) };
  }

  const result = parseRpcResult(data);
  if (!result) {
    console.error(`save_athlete_registration (${status}) returned an unexpected shape:`, data);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }

  const achievements: Achievement[] = result.achievements.map((row) => ({
    id: row.id,
    title: row.title ?? "",
    type: row.achievement_type ?? "",
    organization: row.issuing_organization ?? "",
    date: row.achievement_date ?? "",
    description: row.description ?? "",
    document: null,
  }));

  return {
    ok: true,
    achievements,
    profileStatus: result.profile.profile_status === "submitted" ? "submitted" : "draft",
  };
}

export async function saveAthleteDraft(
  values: AthleteRegistrationFormValues,
): Promise<SaveRegistrationResult> {
  return persistRegistration(values, "draft");
}

export async function createAthleteProfile(
  values: AthleteRegistrationFormValues,
): Promise<SaveRegistrationResult> {
  return persistRegistration(values, "submitted");
}
