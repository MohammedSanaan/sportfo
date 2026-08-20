import type { ReactNode } from "react";
import { AthleteAvatar } from "./AthleteAvatar";
import { Badge } from "./Badge";

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
}

// A compact navy "banner" strip behind an overlapping avatar -- the same
// premium-profile pattern as a cover photo, without needing one: no
// stock/AI photography exists in this codebase, and a literal photo would
// risk implying a real, specific place/person.
export function ProfileHero({
  fullName,
  primarySport,
  skillLevel,
  city,
  country,
  actions,
  headingLevel = "h1",
}: ProfileHeroProps) {
  const location = [city, country].filter(Boolean).join(", ");
  const sportLine = [primarySport, skillLevel].filter(Boolean).join(" • ");
  const NameHeading = headingLevel;

  return (
    <section className="overflow-hidden rounded-3xl border border-border-default bg-surface shadow-sm">
      <div className="relative h-24 bg-navy-950 sm:h-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,102,240,0.4),_transparent_60%)]" />
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-5">
            <AthleteAvatar
              fullName={fullName}
              size="xl"
              className="-mt-12 ring-4 ring-surface sm:-mt-14"
            />
            <div className="flex flex-col items-center gap-1.5 pb-1 text-center sm:items-start sm:text-left">
              <Badge>SportFo Athlete</Badge>
              <NameHeading className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                {fullName || "Athlete"}
              </NameHeading>
              {sportLine && <p className="text-base font-medium text-ink-600">{sportLine}</p>}
              {location && <p className="text-sm text-ink-400">{location}</p>}
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
