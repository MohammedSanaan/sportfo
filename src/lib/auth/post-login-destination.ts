import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  getProfileHrefForCategory,
  getRegistrationCategoryByType,
  type RegistrationCategoryConfig,
} from "@/lib/registration/categories";
import { resolveSafeNextPath } from "./safe-redirect";

export interface PostLoginDestination {
  /** Where to send this authenticated visitor. Always same-origin/relative. */
  destination: string;
  /** True only when the account has at least one *submitted* registration --
   * this, not "an explicit next was honored", is what should trigger the
   * personalized welcome banner. */
  hasSubmittedRegistration: boolean;
  displayName: string | null;
  sportfoId: string | null;
  category: RegistrationCategoryConfig | null;
}

// The one centralized place that decides where a signed-in visitor lands,
// used by both the /auth page (visitor is already signed in when they
// reach it) and AuthFlow (right after a fresh sign-in/verification). Takes
// a plain SupabaseClient rather than a specific server/browser client so
// it works from both a Server Component and a "use client" flow -- every
// query here is RLS-scoped to the caller's own rows regardless of which
// client instance is passed in.
//
// Priority order (see task spec):
//   1. An explicit, validated `?next=` -- e.g. a signed-out click on
//      /register/performance-expert or /athletes that bounced through
//      /auth. Always wins, even for an already-registered Athlete: that's
//      exactly how "add another role" (Community -> Performance Expert)
//      is supposed to work.
//   2. No next, but the account already has a *submitted* registration --
//      never re-send them to a blank registration form. Athlete gets the
//      new /dashboard (their real authenticated landing page -- My Profile
//      inside the dashboard still points at /athlete/profile); the other 7
//      categories don't have a dedicated dashboard yet, so they land back
//      on their own (pre-filled, see /register/[category]/page.tsx)
//      registration form, which doubles as their existing-registration
//      summary. See getProfileHrefForCategory for the separate "My
//      Profile" destination, which is intentionally NOT changed by this.
//   3. No next, and a registration was started but never submitted (a
//      draft) -- resume it, rather than dropping them on the community
//      section as if they'd never started.
//   4. No next, no registration at all (not even a draft) -- send them to
//      the Community/"Who We Serve" section to pick a category. Never
//      assume Athlete.
export async function getPostLoginDestination(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedNext: string | null | undefined,
): Promise<PostLoginDestination> {
  const safeNext = resolveSafeNextPath(requestedNext);

  const [sportfoUserResult, registrationsResult] = await Promise.all([
    supabase.from("sportfo_users").select("sportfo_id").eq("user_id", userId).maybeSingle(),
    supabase
      .from("registrations")
      .select("registration_type, display_name, status, registered_at, updated_at")
      .eq("user_id", userId),
  ]);

  if (sportfoUserResult.error || registrationsResult.error) {
    console.error(
      "getPostLoginDestination: lookup failed:",
      sportfoUserResult.error,
      registrationsResult.error,
    );
    return {
      destination: safeNext ?? "/#community",
      hasSubmittedRegistration: false,
      displayName: null,
      sportfoId: sportfoUserResult.data?.sportfo_id ?? null,
      category: null,
    };
  }

  const sportfoId = sportfoUserResult.data?.sportfo_id ?? null;
  const registrations = registrationsResult.data ?? [];

  // Most-recently-submitted registration wins for identity/profile
  // purposes -- same "most recent submitted" rule as the account menu
  // (see src/lib/account/identity.ts) so the two never disagree about
  // which role is "current".
  const submitted = registrations
    .filter((row) => row.status === "submitted")
    .sort((a, b) => (b.registered_at ?? "").localeCompare(a.registered_at ?? ""))[0];

  const submittedCategory = submitted
    ? (getRegistrationCategoryByType(submitted.registration_type) ?? null)
    : null;

  if (safeNext) {
    return {
      destination: safeNext,
      hasSubmittedRegistration: Boolean(submittedCategory),
      displayName: submitted?.display_name ?? null,
      sportfoId,
      category: submittedCategory,
    };
  }

  if (submittedCategory) {
    const destination =
      submittedCategory.id === "athlete"
        ? "/dashboard"
        : getProfileHrefForCategory(submittedCategory);
    return {
      destination,
      hasSubmittedRegistration: true,
      displayName: submitted?.display_name ?? null,
      sportfoId,
      category: submittedCategory,
    };
  }

  // No submitted registration -- fall back to the most recently touched
  // draft, if any, so a started-but-unfinished registration is resumed
  // rather than silently dropped.
  const latestDraft = [...registrations].sort((a, b) =>
    (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
  )[0];
  const draftCategory = latestDraft
    ? (getRegistrationCategoryByType(latestDraft.registration_type) ?? null)
    : null;

  if (draftCategory) {
    const destination =
      draftCategory.id === "athlete" ? "/athlete/register" : `/register/${draftCategory.slug}`;
    return {
      destination,
      hasSubmittedRegistration: false,
      displayName: latestDraft?.display_name ?? null,
      sportfoId,
      category: null,
    };
  }

  // Nothing started at all -- category selection, never an assumed Athlete.
  return {
    destination: "/#community",
    hasSubmittedRegistration: false,
    displayName: null,
    sportfoId,
    category: null,
  };
}
