import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  searchPublicAthletes,
  loadPublicAthleteCountries,
  parseDiscoveryFilters,
  type RawDiscoverySearchParams,
} from "@/lib/athlete/discovery";
import { Container } from "@/components/ui/Container";
import { AthleteCard } from "@/features/discovery/components/AthleteCard";
import { DiscoveryFiltersForm } from "@/features/discovery/components/DiscoveryFiltersForm";
import { DiscoveryPagination } from "@/features/discovery/components/DiscoveryPagination";
import { DiscoveryStatus } from "@/features/discovery/components/DiscoveryStatus";

// Static, deliberately simple metadata -- no per-query/per-filter dynamic
// SEO for this milestone (see task scope). Not in src/proxy.ts's
// PROTECTED_ROUTES -- this route is public, same as /a/[slug].
export const metadata: Metadata = {
  title: "Discover Athletes | SportFo",
  description: "Discover athletes by sport, location and experience on SportFo.",
};

interface AthletesPageProps {
  searchParams: Promise<RawDiscoverySearchParams>;
}

export default async function AthletesPage({ searchParams }: AthletesPageProps) {
  const rawParams = await searchParams;
  const filters = parseDiscoveryFilters(rawParams);
  const hasActiveFilters = Boolean(
    filters.query || filters.sport || filters.country || filters.city || filters.skillLevel,
  );

  const supabase = await createClient();
  const [result, countries] = await Promise.all([
    searchPublicAthletes(supabase, filters),
    loadPublicAthleteCountries(supabase),
  ]);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Discover Athletes
        </h1>
        <p className="text-base text-ink-500 sm:text-lg">
          Find talent by sport, location and experience.
        </p>
      </div>

      <DiscoveryFiltersForm filters={filters} countries={countries} />

      {result.error ? (
        <DiscoveryStatus variant="error" />
      ) : result.totalCount === 0 ? (
        <DiscoveryStatus variant={hasActiveFilters ? "no-matches" : "no-athletes"} />
      ) : result.athletes.length === 0 ? (
        <DiscoveryStatus variant="out-of-range" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">
              <span className="font-semibold text-ink-800">{result.totalCount}</span>{" "}
              {result.totalCount === 1 ? "athlete" : "athletes"} found
            </p>
            {hasActiveFilters && (
              <Link
                href="/athletes"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.athletes.map((athlete) => (
              <AthleteCard key={athlete.public_slug} athlete={athlete} />
            ))}
          </div>

          <DiscoveryPagination
            page={result.page}
            totalPages={result.totalPages}
            searchParams={rawParams}
          />
        </>
      )}
    </Container>
  );
}
