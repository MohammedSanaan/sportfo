import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getOwnSportfoId } from "@/lib/sportfo-id/server";
import { AccountMenu } from "./AccountMenu";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

const navLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

// Isolated into its own async Server Component (rather than awaiting
// directly in Header) so it can be wrapped in <Suspense> -- the session
// check shouldn't delay the rest of the shared layout from streaming.
//
// "Discover Athletes" used to be its own standalone link in the main
// header nav; now that the main nav is the Home/About/Community/... set,
// it's preserved here instead (in the account area for signed-in users,
// alongside Sign In/Join SportFo for guests) rather than being deleted.
export async function AuthNav({
  locale,
  variant = "desktop",
}: {
  locale: Locale;
  variant?: "desktop" | "mobile";
}) {
  const user = await getAuthUser();
  const t = (key: string) => translate(locale, key);

  if (user) {
    const supabase = await createClient();
    // Both are RLS-scoped to this user's own rows -- neither can ever
    // return another account's SportFo ID or profile. A missing
    // sportfo_users row (should be rare: ensure_sportfo_id() runs at every
    // login, see AuthFlow) never blocks rendering the rest of the header.
    const [sportfoId, { data: profile }] = await Promise.all([
      getOwnSportfoId(supabase, user.id),
      lookupOwnAthleteProfile(supabase, user.id),
    ]);

    if (sportfoId) {
      return (
        <AccountMenu
          sportfoId={sportfoId}
          roleLabel={profile?.profile_status === "submitted" ? t("account.roleAthlete") : null}
          myProfileHref="/athlete/register"
          myProfileLabel={t("nav.athleteRegistration")}
          discoverAthletesHref="/athletes"
          discoverAthletesLabel={t("nav.discoverAthletes")}
          activeAsLabel={t("account.activeAs")}
          sportfoIdLabel={t("account.sportfoId")}
          activeAccountLabel={t("account.activeAccount")}
          locale={locale}
          variant={variant}
        />
      );
    }

    // Fallback for the rare case a SportFo ID genuinely isn't available yet
    // (e.g. this exact request raced ensure_sportfo_id() at login) -- the
    // account is still fully authenticated, so navigation must not break.
    return (
      <>
        <Link href="/athletes" className={navLinkClassName}>
          {t("nav.discoverAthletes")}
        </Link>
        <Link href="/athlete/register" className={navLinkClassName}>
          {t("nav.athleteRegistration")}
        </Link>
        <LogoutButton locale={locale} />
      </>
    );
  }

  return (
    <>
      <Link href="/athletes" className={navLinkClassName}>
        {t("nav.discoverAthletes")}
      </Link>
      <Link href="/auth" className={navLinkClassName}>
        {t("nav.signIn")}
      </Link>
      <Link
        href="/auth"
        className="ml-0 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 sm:ml-1"
      >
        {t("nav.joinSportfo")}
      </Link>
    </>
  );
}
