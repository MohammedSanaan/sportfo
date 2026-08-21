import Link from "next/link";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

const navLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

// Isolated into its own async Server Component (rather than awaiting
// directly in Header) so it can be wrapped in <Suspense> -- the session
// check shouldn't delay the rest of the shared layout from streaming.
export async function AuthNav({ locale }: { locale: Locale }) {
  const user = await getAuthUser();
  const t = (key: string) => translate(locale, key);

  if (user) {
    return (
      <>
        <Link href="/athlete/register" className={navLinkClassName}>
          {t("nav.athleteRegistration")}
        </Link>
        <LogoutButton locale={locale} />
      </>
    );
  }

  return (
    <>
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
