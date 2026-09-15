import Link from "next/link";
import { AthleteAvatar } from "@/components/ui/AthleteAvatar";
import { Badge } from "@/components/ui/Badge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AthleteProfileHeroProps {
  fullName: string | null;
  primarySport: string;
  skillLevel: string;
  city: string | null;
  country: string | null;
  sportfoId: string | null;
  photoUrl: string | null;
  locale: Locale;
}

function LocationPinIcon() {
  return (
    <svg aria-hidden width="13" height="13" viewBox="0 0 20 20" fill="none" className="shrink-0 text-ink-400">
      <path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// The owner-only equivalent of the shared (public-profile) ProfileHero --
// a separate component rather than a themed variant of that one, since
// ProfileHero must stay pixel-identical for /a/[slug] (see task's "audit
// shared components carefully" instruction). Every value here is real:
// fullName/photoUrl/sportfoId come straight from the authenticated
// athlete's own row (see src/app/athlete/profile/page.tsx), never a
// fabricated name/photo/location.
export function AthleteProfileHero({
  fullName,
  primarySport,
  skillLevel,
  city,
  country,
  sportfoId,
  photoUrl,
  locale,
}: AthleteProfileHeroProps) {
  const t = (key: string) => translate(locale, key);
  const location = [city, country].filter(Boolean).join(", ");
  const sportLine = [primarySport, skillLevel].filter(Boolean).join(" · ");

  return (
    <section className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-800 sm:h-32" />

      <div className="flex flex-col gap-6 px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:gap-5 sm:text-left">
            <AthleteAvatar
              fullName={fullName}
              size="2xl"
              photoUrl={photoUrl}
              className="-mt-12 shrink-0 ring-4 ring-surface sm:-mt-14"
            />
            <div className="flex flex-col items-center gap-1.5 pb-1 sm:items-start">
              <Badge variant="brand">{t("athletes.sportfoAthleteBadge")}</Badge>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                {fullName || t("athletes.athleteFallback")}
              </h1>
              {sportLine && <p className="text-base font-medium text-ink-700">{sportLine}</p>}
              {location && (
                <p className="flex items-center gap-1 text-sm text-ink-500">
                  <LocationPinIcon />
                  {location}
                </p>
              )}
              {sportfoId && (
                <p className="mt-1 flex flex-col items-center sm:items-start">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-ink-400 uppercase">
                    {t("account.sportfoId")}
                  </span>
                  <span className="text-sm font-bold tracking-wide text-brand-700">{sportfoId}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <Link
              href="/athlete/register"
              className="inline-flex min-h-10 items-center rounded-lg border border-border-default bg-surface-muted px-4 py-2 text-center text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {t("profile.actions.editProfile")}
            </Link>
            <LogoutButton
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-lg border border-border-default bg-transparent px-4 py-2 text-center text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
