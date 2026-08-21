"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { friendlySaveError } from "@/lib/athlete/registration-errors";

export type SetVisibilityResult =
  | { ok: true; isPublic: boolean; slug: string | null }
  | { ok: false; error: string };

// The only client-facing entry point for changing is_public/public_slug.
// set_athlete_profile_visibility (SECURITY INVOKER) derives the profile
// solely from auth.uid() -- there is no profile id parameter here or in
// the RPC, so there is no way for this action to be pointed at another
// athlete's profile.
export async function setProfileVisibility(isPublic: boolean): Promise<SetVisibilityResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_athlete_profile_visibility", {
    p_is_public: isPublic,
  });

  if (error) {
    console.error("setProfileVisibility failed:", error);
    return { ok: false, error: friendlySaveError(error) };
  }

  const row = data?.[0];
  if (!row) {
    console.error("setProfileVisibility returned an unexpected shape:", data);
    return {
      ok: false,
      error: "Something went wrong while updating visibility. Please try again.",
    };
  }

  return { ok: true, isPublic: row.is_public, slug: row.public_slug };
}
