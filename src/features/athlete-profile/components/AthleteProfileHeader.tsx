import { getInitials } from "@/lib/format";

interface AthleteProfileHeaderProps {
  fullName: string | null;
  primarySport: string;
  skillLevel: string;
  city: string | null;
  country: string | null;
}

export function AthleteProfileHeader({
  fullName,
  primarySport,
  skillLevel,
  city,
  country,
}: AthleteProfileHeaderProps) {
  const location = [city, country].filter(Boolean).join(", ");
  const sportLine = [primarySport, skillLevel].filter(Boolean).join(" • ");

  return (
    <section className="rounded-xl border border-border-default bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        <div
          aria-hidden
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl"
        >
          {getInitials(fullName)}
        </div>

        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            SportFo Athlete
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {fullName || "Athlete"}
          </h1>
          {sportLine && <p className="text-base text-ink-600">{sportLine}</p>}
          {location && <p className="text-sm text-ink-400">{location}</p>}
        </div>
      </div>
    </section>
  );
}
