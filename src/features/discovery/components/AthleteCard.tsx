import Link from "next/link";
import { getInitials } from "@/lib/format";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import type { PublicAthleteSearchResult } from "@/lib/athlete/discovery";

interface AthleteCardProps {
  athlete: PublicAthleteSearchResult;
}

// The whole card is a single <Link> -- no nested buttons/links inside --
// so it stays a single focusable, single accessible-name control ("View
// Profile" is just its visual CTA text, not a second interactive element).
export function AthleteCard({ athlete }: AthleteCardProps) {
  const location = [athlete.city, athlete.country].filter(Boolean).join(", ");
  const sportLine = [
    getOptionLabel(PRIMARY_SPORTS, athlete.primary_sport),
    getOptionLabel(SKILL_LEVELS, athlete.skill_level),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      href={`/a/${athlete.public_slug}`}
      className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface p-6 shadow-sm transition-colors hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white"
        >
          {getInitials(athlete.full_name)}
        </div>
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
            SportFo Athlete
          </span>
          <h3 className="text-base font-semibold text-ink-900">
            {athlete.full_name || "Athlete"}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        {sportLine && <p className="text-ink-600">{sportLine}</p>}
        {location && <p className="text-ink-500">{location}</p>}
        {athlete.nationality && <p className="text-ink-400">{athlete.nationality}</p>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-default pt-4">
        <span className="text-xs text-ink-500">
          {athlete.achievement_count} {athlete.achievement_count === 1 ? "achievement" : "achievements"}
        </span>
        <span className="text-sm font-medium text-brand-700">View Profile →</span>
      </div>
    </Link>
  );
}
