import Link from "next/link";
import { redirect } from "next/navigation";
import { AthleteRegistrationForm } from "./AthleteRegistrationForm";
import { RegistrationStepNav } from "./RegistrationStepNav";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { loadAthleteDraft, mapDraftToFormValues } from "@/lib/athlete/registration-draft";
import { resolveAthleteMobileNumber } from "@/lib/phone/resolve-athlete-phone";
import { getServerTranslations } from "@/i18n/server";

interface AthleteRegistrationScreenProps {
  /** Where an unauthenticated visitor is sent back to after signing in.
   * /athlete/register (its own canonical URL) by default; the /register
   * hub passes /register/athlete so the redirect round-trips back to the
   * hub instead of silently switching URLs on the visitor. */
  reloadHref?: string;
  /** Heading + intro copy are the caller's job on the hub route (it has
   * its own "Register with SportFo" / "Select Your Category" header) --
   * only /athlete/register itself wants this screen's own title. */
  showHeading?: boolean;
}

// The one real, Supabase-backed Athlete registration flow -- reused as-is
// by both /athlete/register (its original, permanent URL) and
// /register/athlete (the new category hub). All auth-gating, draft
// loading, and form logic lives here exactly once; neither caller
// duplicates any of it.
export async function AthleteRegistrationScreen({
  reloadHref = "/athlete/register",
  showHeading = true,
}: AthleteRegistrationScreenProps) {
  // Proxy (src/proxy.ts) already redirects unauthenticated requests
  // optimistically; this re-verifies the session directly with Supabase
  // rather than relying on Proxy alone.
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth");
  }

  const authPhone = resolveAthleteMobileNumber(user);
  const supabase = await createClient();
  const { draft, error: draftLoadFailed } = await loadAthleteDraft(supabase, user.id);
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
        <AthleteRegistrationForm
          authPhone={authPhone}
          initialValues={draft ? mapDraftToFormValues(draft, authPhone) : undefined}
        />
      )}
    </div>
  );
}
