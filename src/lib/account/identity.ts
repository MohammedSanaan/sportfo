import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  getProfileHrefForCategory,
  getRegistrationCategoryByType,
  type RegistrationCategoryConfig,
} from "@/lib/registration/categories";

export interface AccountIdentity {
  // Never the internal auth.users UUID -- always the account's permanent
  // public SportFo ID (see sportfo_users), or null in the rare case
  // ensure_sportfo_id() hasn't run yet for this session.
  sportfoId: string | null;
  isAdmin: boolean;
  // The visitor's own display name for their most recently *submitted*
  // registration (any category). Null until they've submitted at least
  // one -- never a fabricated name.
  displayName: string | null;
  // The category of that same most-recent submission, or null. There is
  // no active-role system yet (see REGISTRATION_CATEGORIES/task notes), so
  // this is a reasonable "current role" default -- structurally ready for
  // real role switching later without a rebuild, never faked in the
  // meantime.
  category: RegistrationCategoryConfig | null;
  // Where "View Profile" should go: the real Athlete profile page for
  // athletes, or the visitor's own (pre-filled) registration form for the
  // other 7 categories -- no dedicated read-only profile page exists for
  // those yet, so this is the closest real, non-broken route rather than
  // an invented URL. Null when there's nothing to link to at all.
  profileHref: string | null;
}

const EMPTY_IDENTITY: AccountIdentity = {
  sportfoId: null,
  isAdmin: false,
  displayName: null,
  category: null,
  profileHref: null,
};

// Both queries are RLS-scoped to the caller's own rows (owner-only SELECT
// policies on sportfo_users and registrations) -- this can never resolve
// another account's identity, admin status, or registration data.
export async function getOwnAccountIdentity(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AccountIdentity> {
  const [sportfoUserResult, registrationResult] = await Promise.all([
    supabase.from("sportfo_users").select("sportfo_id, is_admin").eq("user_id", userId).maybeSingle(),
    supabase
      .from("registrations")
      .select("registration_type, display_name")
      .eq("user_id", userId)
      .eq("status", "submitted")
      .order("registered_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (sportfoUserResult.error || registrationResult.error) {
    console.error(
      "getOwnAccountIdentity failed:",
      sportfoUserResult.error,
      registrationResult.error,
    );
    return EMPTY_IDENTITY;
  }

  const registration = registrationResult.data;
  const category = registration ? (getRegistrationCategoryByType(registration.registration_type) ?? null) : null;

  return {
    sportfoId: sportfoUserResult.data?.sportfo_id ?? null,
    isAdmin: sportfoUserResult.data?.is_admin ?? false,
    displayName: registration?.display_name ?? null,
    category,
    profileHref: category ? getProfileHrefForCategory(category) : null,
  };
}
