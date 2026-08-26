import type { ReactNode } from "react";
import Image from "next/image";
import { AthleteAvatar } from "./AthleteAvatar";
import { Badge } from "./Badge";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface ProfileHeroProps {
  fullName: string | null;
  primarySport: string;
  skillLevel: string;
  city: string | null;
  country: string | null;
  actions?: ReactNode;
  // The public profile page has no other <h1> on the page, so the
  // athlete's name is it. The owner page has its own page-level heading
  // ("My SportFo Profile") above this component, so the name there is
  // demoted to h2 to keep one h1 per page.
  headingLevel?: "h1" | "h2";
  // When provided (the public profile only), renders a taller, more
  // premium "cover photo" banner instead of the compact flat navy strip.
  // A generic, brandless, peopleless athletics photo -- never implies
  // this is a picture of the athlete themselves, just atmosphere, the
  // same treatment already established for the landing hero and /auth.
  bannerImage?: string;
  // Intentionally public identifier -- never the internal auth UUID. Omitted
  // entirely (not just blank) when not provided, e.g. before the public
  // profile RPC is extended to return it.
  sportfoId?: string | null;
  locale: Locale;
}

function LocationPinIcon() {
  return (
    <svg
      aria-hidden
      width="13"
      height="13"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-ink-400"
    >
      <path
        d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ProfileHero({
  fullName,
  primarySport,
  skillLevel,
  city,
  country,
  actions,
  headingLevel = "h1",
  bannerImage,
  sportfoId,
  locale,
}: ProfileHeroProps) {
  const t = (key: string) => translate(locale, key);
  const location = [city, country].filter(Boolean).join(", ");
  const sportLine = [primarySport, skillLevel].filter(Boolean).join(" • ");
  const NameHeading = headingLevel;

  return (
    <section className="overflow-hidden rounded-3xl border border-border-default bg-surface shadow-sm">
      <div
        className={
          bannerImage
            ? "relative h-40 sm:h-52 lg:h-60"
            : "relative h-24 sm:h-28"
        }
      >
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-navy-950/78" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,102,240,0.4),_transparent_60%)]" />
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-5">
            <AthleteAvatar
              fullName={fullName}
              size="xl"
              className={
                bannerImage
                  ? "-mt-16 ring-4 ring-surface sm:-mt-20"
                  : "-mt-12 ring-4 ring-surface sm:-mt-14"
              }
            />
            <div className="flex flex-col items-center gap-1.5 pb-1 text-center sm:items-start sm:text-left">
              <Badge>{t("athletes.sportfoAthleteBadge")}</Badge>
              <NameHeading className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                {fullName || t("athletes.athleteFallback")}
              </NameHeading>
              {sportLine && <p className="text-base font-medium text-ink-600">{sportLine}</p>}
              {sportfoId && (
                <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                  {t("account.sportfoId")}: <span className="text-ink-600 normal-case">{sportfoId}</span>
                </p>
              )}
              {location && (
                <p className="flex items-center gap-1 text-sm text-ink-400">
                  <LocationPinIcon />
                  {location}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
