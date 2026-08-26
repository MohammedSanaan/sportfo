import Link from "next/link";
import { AthleteRegistrationForm } from "./AthleteRegistrationForm";
import { RegistrationStepNav } from "./RegistrationStepNav";
import { AlreadyRegisteredNotice } from "@/components/ui/AlreadyRegisteredNotice";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteDraft, mapDraftToFormValues } from "@/lib/athlete/registration-draft";
import { resolveAthleteMobileNumber } from "@/lib/phone/resolve-athlete-phone";
import { getServerTranslations } from "@/i18n/server";

interface AthleteRegistrationScreenProps {
  /** This screen's own canonical URL -- used both as the draft-load-failure
   * "reload" link and as the `next` target a signed-out visitor is returned
   * to after verifying at Save Draft/Create Profile time (see
   * AthleteRegistrationForm). /athlete/register by default; the /register
   * hub passes /register/athlete so either path round-trips back to itself
   * instead of silently switching URLs on the visitor. */
  reloadHref?: string;
  /** Heading + intro copy are the caller's job on the hub route (it has
   * its own "Register with SportFo" / "Select Your Category" header) --
   * only /athlete/register itself wants this screen's own title. */
  showHeading?: boolean;
}

// The one real, Supabase-backed Athlete registration flow -- reused as-is
// by both /athlete/register (its original, permanent URL) and
// /register/athlete (the new category hub). Draft loading and form logic
// live here exactly once; neither caller duplicates any of it. Public to
// view (no auth gate here) -- auth is only required at Save Draft/Create
// Profile, enforced by AthleteRegistrationForm itself.
export async function AthleteRegistrationScreen({
  reloadHref = "/athlete/register",
  showHeading = true,
}: AthleteRegistrationScreenProps) {
  // Public-to-view, auth-required-only-at-submit (see task spec) -- a
  // guest gets the real, blank Athlete form here, with no draft to load
  // (there's no account yet to load one for). AthleteRegistrationForm
  // itself checks auth at Save Draft/Create Profile time and redirects to
  // /auth?mode=register&next={reloadHref}, preserving the in-progress
  // form -- this screen no longer gates on auth just to render.
  const user = await getAuthUser();
  const authPhone = user ? resolveAthleteMobileNumber(user) : "";
  const supabase = await createClient();
  const { draft, error: draftLoadFailed } = user
    ? await loadAthleteDraft(supabase, user.id)
    : { draft: null, error: false };
  const { locale, t } = await getServerTranslations();

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {showHeading && (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {t("register.pageTitle")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-ink-500">{t("register.pageDescription")}</p>
          </div>
          {!draftLoadFailed && <RegistrationStepNav locale={locale} />}
        </div>
      )}

      {draftLoadFailed ? (
        // Rendering a blank form here would risk Save Draft silently
        // overwriting a real, already-saved draft with empty fields --
        // safer to block on a retry than to guess.
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-medium">{t("register.loadFailed")}</p>
          <p className="mt-1">
            {t("common.pleasePrefix")}{" "}
            <Link href={reloadHref} className="font-medium underline">
              {t("register.reload")}
            </Link>
            . {t("register.contactSupport")}
          </p>
        </div>
      ) : (
        <>
          {draft?.profile.profile_status === "submitted" && (
            <AlreadyRegisteredNotice
              title={t("register.alreadyRegistered.title")}
              description={t("register.alreadyRegistered.description")}
              profileHref="/athlete/profile"
              profileLabel={t("account.viewProfile")}
              exploreCommunityLabel={t("register.success.exploreCommunity")}
            />
          )}
          <AthleteRegistrationForm
            authPhone={authPhone}
            initialValues={draft ? mapDraftToFormValues(draft, authPhone) : undefined}
            reloadHref={reloadHref}
          />
        </>
      )}
    </div>
  );
}
