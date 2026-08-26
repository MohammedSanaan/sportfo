import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getOwnAccountIdentity } from "@/lib/account/identity";
import { AccountMenu } from "./AccountMenu";
import { JoinCommunityLink } from "./JoinCommunityLink";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

const navLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

// Isolated into its own async Server Component (rather than awaiting
// directly in Header) so it can be wrapped in <Suspense> -- the session
// check shouldn't delay the rest of the shared layout from streaming.
//
// "Discover Athletes" lives in the account area (not the main Home/About/
// Community/... nav) for authenticated users only -- it's an
// authenticated-only feature (see /athletes' own server-side auth check
// and its entry in src/proxy.ts's PROTECTED_ROUTES), so a guest never
// sees the link at all, not just a version that would redirect them.
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
    // RLS-scoped to this user's own rows throughout -- can never resolve
    // another account's name, SportFo ID, admin status, or registrations.
    const identity = await getOwnAccountIdentity(supabase, user.id);

    if (identity.sportfoId) {
      const roleLabel = identity.category ? t(`account.roles.${identity.category.id}`) : null;

      return (
        <>
          <Link href="/athletes" className={navLinkClassName}>
            {t("nav.discoverAthletes")}
          </Link>
          <AccountMenu
            displayName={identity.displayName}
            sportfoId={identity.sportfoId}
            roleLabel={roleLabel}
            profileHref={identity.profileHref}
            isAdmin={identity.isAdmin}
            dashboardHref="/admin/dashboard"
            sportfoIdLabel={t("account.sportfoId")}
            sportfoUserLabel={t("account.sportfoUser")}
            viewProfileLabel={t("account.viewProfile")}
            viewDashboardLabel={t("account.viewDashboard")}
            signOutLabel={t("account.signOut")}
            signingOutLabel={t("nav.loggingOut")}
            locale={locale}
            variant={variant}
          />
        </>
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

  // Guest: no Discover Athletes (authenticated-only), just Login and the
  // Join SportFo CTA -- which scrolls to Community/"Who We Serve" (the
  // real category-selection gateway) rather than jumping straight to
  // /auth or assuming Athlete.
  return (
    <>
      <Link href="/auth" className={navLinkClassName}>
        {t("nav.signIn")}
      </Link>
      <JoinCommunityLink className="ml-0 inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 sm:ml-1">
        {t("nav.joinSportfo")}
      </JoinCommunityLink>
    </>
  );
}
