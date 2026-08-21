import Link from "next/link";
import { AthleteCard } from "@/features/discovery/components/AthleteCard";
import type { PublicAthleteSearchResult } from "@/lib/athlete/discovery";

interface DiscoverAthletesSectionProps {
  athletes: PublicAthleteSearchResult[];
}

// Renders nothing (rather than an empty/awkward section) if there are no
// public athletes yet -- no placeholder or fabricated cards.
export function DiscoverAthletesSection({ athletes }: DiscoverAthletesSectionProps) {
  if (athletes.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Discover Athletes
        </h2>
        <p className="max-w-xl text-base text-ink-500">
          Real athlete profiles already building their identity on SportFo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete) => (
          <AthleteCard key={athlete.public_slug} athlete={athlete} locale="en" />
        ))}
      </div>

      <Link
        href="/athletes"
        className="mx-auto text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
      >
        Explore all athletes →
      </Link>
    </section>
  );
}
