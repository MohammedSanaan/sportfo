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
// "Discover Athletes" lives in Header's main left-side nav (always
// visible, signed in or not -- see Header.tsx's discoverAthletesLink)
// instead of here, so this component only renders the auth-state-
// dependent actions themselves (AccountMenu/logout for signed-in users,
// Sign In/Join SportFo for guests). /athletes still has its own server-
// side auth check and its entry in src/proxy.ts's PROTECTED_ROUTES, so a
// guest clicking it there is redirected rather than shown the page.
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
      );
    }

    // Fallback for the rare case a SportFo ID genuinely isn't available yet
    // (e.g. this exact request raced ensure_sportfo_id() at login) -- the
    // account is still fully authenticated, so navigation must not break.
    return (
      <>
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
  //
  // Mobile renders these as one intentional CTA block (Join as the filled
  // primary action, Login as a lighter secondary one underneath) instead of
  // two plain items indistinguishable from the scroll-nav list above them.
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2">
        <JoinCommunityLink className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-600 text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2">
          {t("nav.joinSportfo")}
        </JoinCommunityLink>
        <Link
          href="/auth"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-border-default text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted"
        >
          {t("nav.signIn")}
        </Link>
      </div>
    );
  }

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
