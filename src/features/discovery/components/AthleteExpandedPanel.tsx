import Link from "next/link";
import {
  getOptionLabel,
  PRIMARY_SPORTS,
  SKILL_LEVELS,
  COMPETITION_LEVELS,
  PARALLEL_TRACKS,
} from "@/lib/athlete-options";
import { Badge } from "@/components/ui/Badge";
import { AthleteAvatar } from "@/components/ui/AthleteAvatar";
import type { PublicAthleteSearchResult } from "@/lib/athlete/discovery";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AthleteExpandedPanelProps {
  athlete: PublicAthleteSearchResult;
  locale: Locale;
  isLoggedIn: boolean;
  onClose: () => void;
}

// The card's "pop open" full view. Everyone gets the same preview details
// already present in the search result (sport, location, achievement
// count) -- there's no separate, richer dataset being hidden from signed-
// out visitors here. What's actually gated is the *destination*: the real
// full profile at /a/[slug]. Signed in, "View Full Profile" goes straight
// there; signed out, it goes to /auth instead, so a visitor can't tab past
// the prompt and land on the profile anyway.
export function AthleteExpandedPanel({
  athlete,
  locale,
  isLoggedIn,
  onClose,
}: AthleteExpandedPanelProps) {
  const t = (key: string) => translate(locale, key);
  const location = [athlete.city, athlete.country].filter(Boolean).join(", ");
  const sportLine = [
    getOptionLabel(PRIMARY_SPORTS, athlete.primary_sport),
    getOptionLabel(SKILL_LEVELS, athlete.skill_level),
  ]
    .filter(Boolean)
    .join(" • ");
  const competitionLevelLabel = getOptionLabel(COMPETITION_LEVELS, athlete.competition_level);
  const parallelTrackLabel = getOptionLabel(PARALLEL_TRACKS, athlete.parallel_track);

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <button
        type="button"
        onClick={onClose}
        aria-label={t("athletes.closePreview")}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface text-ink-500 shadow-sm transition-colors hover:border-border-strong hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <CloseIcon />
      </button>

      <div className="flex items-center gap-4">
        <AthleteAvatar fullName={athlete.full_name} size="lg" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <Badge>{t("athletes.sportfoAthleteBadge")}</Badge>
            {competitionLevelLabel && <Badge variant="success">{competitionLevelLabel}</Badge>}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-900">
            {athlete.full_name || t("athletes.athleteFallback")}
          </h2>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border-default py-5">
        {sportLine && <Field label={t("detailFields.primarySport")} value={sportLine} />}
        {competitionLevelLabel && (
          <Field label={t("detailFields.competitionLevel")} value={competitionLevelLabel} />
        )}
        {parallelTrackLabel && (
          <Field label={t("detailFields.parallelTrack")} value={parallelTrackLabel} />
        )}
        {location && <Field label={t("athletes.location")} value={location} />}
        {athlete.nationality && (
          <Field label={t("detailFields.nationality")} value={athlete.nationality} />
        )}
        <Field
          label={
            athlete.achievement_count === 1
              ? t("athletes.achievementSingular")
              : t("athletes.achievementPlural")
          }
          value={String(athlete.achievement_count)}
        />
      </dl>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {isLoggedIn ? (
          <Link
            href={`/a/${athlete.public_slug}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {t("athletes.viewFullProfile")}
          </Link>
        ) : (
          <>
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t("athletes.signInToViewProfile")}
            </Link>
            <p className="text-center text-[12px] text-ink-400">
              {t("athletes.signInPromptDescription")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-medium tracking-[0.12em] text-ink-400 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
