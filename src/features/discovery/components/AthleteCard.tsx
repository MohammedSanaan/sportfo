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

interface AthleteCardProps {
  athlete: PublicAthleteSearchResult;
  locale: Locale;
}

// Presentational only -- this is the collapsed face of an ExpandableCard
// (see /athletes/page.tsx), which already wraps it in the single focusable,
// clickable <button> that opens the full-detail modal. No Link/button of
// its own, so there's no nested-interactive-control issue.
export function AthleteCard({ athlete, locale }: AthleteCardProps) {
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
    <div className="group flex h-full flex-col gap-5 rounded-2xl border border-border-default bg-surface p-6 shadow-sm transition-all duration-150 hover:border-brand-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <AthleteAvatar fullName={athlete.full_name} size="md" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <Badge>{t("athletes.sportfoAthleteBadge")}</Badge>
            {competitionLevelLabel && <Badge variant="success">{competitionLevelLabel}</Badge>}
          </div>
          <h3 className="text-lg font-semibold leading-tight text-ink-900">
            {athlete.full_name || t("athletes.athleteFallback")}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        {sportLine && <p className="font-medium text-ink-700">{sportLine}</p>}
        {parallelTrackLabel && <p className="text-ink-500">{parallelTrackLabel}</p>}
        {location && <p className="text-ink-500">{location}</p>}
        {athlete.nationality && <p className="text-ink-400">{athlete.nationality}</p>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-default pt-4">
        <span className="text-xs font-medium text-ink-500">
          {athlete.achievement_count}{" "}
          {athlete.achievement_count === 1
            ? t("athletes.achievementSingular")
            : t("athletes.achievementPlural")}
        </span>
        <span className="text-sm font-semibold text-brand-700 transition-transform group-hover:translate-x-0.5">
          {t("athletes.viewProfile")} →
        </span>
      </div>
    </div>
  );
}
