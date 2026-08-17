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
  document_path: string | null;
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
    documentPath: row.document_path ?? null,
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

export type DocumentActionResult = { ok: true } | { ok: false; error: string };

// Records where an achievement's supporting document lives in Storage (or
// clears it back to null on removal). The actual file bytes never pass
// through here -- upload/delete against Storage happen from the browser
// client directly; this only ever writes a path string.
//
// `.select('id')` after the update is what lets us tell a real 0-rows
// update (stale/foreign achievement id -- RLS scoped this to the caller's
// own rows) apart from success, since a plain `.update()` doesn't error on
// affecting zero rows.
export async function setAchievementDocumentPath(
  achievementId: string,
  documentPath: string | null,
): Promise<DocumentActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athlete_achievements")
    .update({ document_path: documentPath })
    .eq("id", achievementId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("setAchievementDocumentPath failed:", error);
    return { ok: false, error: friendlySaveError(error) };
  }

  if (!data) {
    return {
      ok: false,
      error: "This achievement could not be found. Please refresh the page and try again.",
    };
  }

  return { ok: true };
}

export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };

const SIGNED_URL_EXPIRES_IN_SECONDS = 120;

// Generated fresh on every call, never persisted -- the private bucket
// stays private and a link only exists for the ~2 minutes needed to open
// it. The document_path lookup runs under the caller's own RLS-scoped
// session, so this can't be used to fetch another athlete's document even
// with a guessed achievement id.
export async function getAchievementDocumentSignedUrl(
  achievementId: string,
): Promise<SignedUrlResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const supabase = await createClient();
  const { data: achievement, error: lookupError } = await supabase
    .from("athlete_achievements")
    .select("document_path")
    .eq("id", achievementId)
    .maybeSingle();

  if (lookupError) {
    console.error("getAchievementDocumentSignedUrl lookup failed:", lookupError);
    return { ok: false, error: friendlySaveError(lookupError) };
  }

  if (!achievement?.document_path) {
    return { ok: false, error: "No document is on file for this achievement." };
  }

  const { data, error } = await supabase.storage
    .from("athlete-achievements")
    .createSignedUrl(achievement.document_path, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error || !data) {
    console.error("getAchievementDocumentSignedUrl signing failed:", error);
    return { ok: false, error: "Couldn't open this document. Please try again." };
  }

  return { ok: true, url: data.signedUrl };
}
