import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth-user";
import {
  searchPublicAthletes,
  loadPublicAthleteCountries,
  parseDiscoveryFilters,
  type RawDiscoverySearchParams,
} from "@/lib/athlete/discovery";
import { Container } from "@/components/ui/Container";
import { AthleteDiscoveryGrid } from "@/features/discovery/components/AthleteDiscoveryGrid";
import { DiscoveryFiltersForm } from "@/features/discovery/components/DiscoveryFiltersForm";
import { DiscoveryPagination } from "@/features/discovery/components/DiscoveryPagination";
import { DiscoveryStatus } from "@/features/discovery/components/DiscoveryStatus";
import { getServerTranslations } from "@/i18n/server";

// Static, deliberately simple metadata -- no per-query/per-filter dynamic
// SEO for this milestone (see task scope).
export const metadata: Metadata = {
  title: "Discover Athletes | SportFo",
  description: "Discover athletes by sport, location and experience on SportFo.",
};

interface AthletesPageProps {
  searchParams: Promise<RawDiscoverySearchParams>;
}

export default async function AthletesPage({ searchParams }: AthletesPageProps) {
  // In src/proxy.ts's PROTECTED_ROUTES -- that's an optimistic check only,
  // so this re-verifies the session directly with Supabase, same pattern
  // as AthleteRegistrationScreen. Discover Athletes is authenticated-only
  // (unlike /a/[slug], which stays intentionally public); a signed-out
  // visitor is bounced to /auth and returned here after login.
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth?next=/athletes");
  }

  const rawParams = await searchParams;
  const filters = parseDiscoveryFilters(rawParams);
  const hasActiveFilters = Boolean(
    filters.query ||
      filters.sport ||
      filters.country ||
      filters.city ||
      filters.skillLevel ||
      filters.competitionLevel ||
      filters.parallelTrack,
  );

  const supabase = await createClient();
  const [result, countries, { locale, t }] = await Promise.all([
    searchPublicAthletes(supabase, filters),
    loadPublicAthleteCountries(supabase),
    getServerTranslations(),
  ]);
  // The redirect above already guarantees a signed-in user by this point --
  // isLoggedIn is always true here, but AthleteDiscoveryGrid/
  // AthleteExpandedPanel keep the prop rather than assuming their caller's
  // auth state, in case a future public-preview mode reuses them.
  const isLoggedIn = Boolean(user);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {t("athletes.pageTitle")}
        </h1>
        <p className="text-base text-ink-500 sm:text-lg">{t("athletes.pageDescription")}</p>
      </div>

      <DiscoveryFiltersForm filters={filters} countries={countries} locale={locale} />

      {result.error ? (
        <DiscoveryStatus variant="error" locale={locale} />
      ) : result.totalCount === 0 ? (
        <DiscoveryStatus variant={hasActiveFilters ? "no-matches" : "no-athletes"} locale={locale} />
      ) : result.athletes.length === 0 ? (
        <DiscoveryStatus variant="out-of-range" locale={locale} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">
              <span className="font-semibold text-ink-800">{result.totalCount}</span>{" "}
              {result.totalCount === 1 ? t("athletes.athleteFound") : t("athletes.athletesFound")}
            </p>
            {hasActiveFilters && (
              <Link
                href="/athletes"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                {t("athletes.clearFilters")}
              </Link>
            )}
          </div>

          <AthleteDiscoveryGrid athletes={result.athletes} locale={locale} isLoggedIn={isLoggedIn} />

          <DiscoveryPagination
            page={result.page}
            totalPages={result.totalPages}
            searchParams={rawParams}
            locale={locale}
          />
        </>
      )}
    </Container>
  );
}
