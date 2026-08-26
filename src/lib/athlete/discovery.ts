import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export interface PublicAthleteSearchResult {
  public_slug: string;
  full_name: string | null;
  primary_sport: string | null;
  skill_level: string | null;
  competition_level: string | null;
  parallel_track: string | null;
  country: string | null;
  city: string | null;
  nationality: string | null;
  achievement_count: number;
}

interface SearchPublicAthletesRpcResult {
  athletes: PublicAthleteSearchResult[];
  total_count: number;
}

// search_public_athletes returns `jsonb`, which the type generator can
// only widen to `Json` -- narrow it by hand rather than casting blindly.
// Same pattern as parseRpcResult in
// src/features/athlete-registration/actions.ts for save_athlete_registration.
function parseSearchResult(data: unknown): SearchPublicAthletesRpcResult | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const athletes = Array.isArray(record.athletes) ? record.athletes : null;
  if (!athletes) return null;
  if (typeof record.total_count !== "number") return null;

  return {
    athletes: athletes as PublicAthleteSearchResult[],
    total_count: record.total_count,
  };
}

export const DISCOVERY_PAGE_SIZE = 12;

export interface DiscoveryFilters {
  query: string | null;
  sport: string | null;
  country: string | null;
  city: string | null;
  skillLevel: string | null;
  competitionLevel: string | null;
  parallelTrack: string | null;
  page: number;
}

export interface DiscoveryResult {
  athletes: PublicAthleteSearchResult[];
  totalCount: number;
  totalPages: number;
  page: number;
  error: boolean;
}

// The only public read path for /athletes. search_public_athletes is a
// SECURITY DEFINER RPC with the same discipline as the public-profile RPCs
// (see supabase/migrations/20260820150100_athlete_discovery_rpc.sql): a
// fixed public-safe column list, its own is_public/profile_status gate,
// and pagination + total count computed in one query via a window
// function -- no second round trip, no client-side pagination over the
// full result set.
export async function searchPublicAthletes(
  supabase: SupabaseClient<Database>,
  filters: DiscoveryFilters,
): Promise<DiscoveryResult> {
  const { data, error } = await supabase.rpc("search_public_athletes", {
    p_query: filters.query ?? undefined,
    p_sport: filters.sport ?? undefined,
    p_country: filters.country ?? undefined,
    p_city: filters.city ?? undefined,
    p_skill_level: filters.skillLevel ?? undefined,
    p_competition_level: filters.competitionLevel ?? undefined,
    p_parallel_track: filters.parallelTrack ?? undefined,
    p_page: filters.page,
    p_page_size: DISCOVERY_PAGE_SIZE,
  });

  if (error) {
    console.error("searchPublicAthletes failed:", error);
    return { athletes: [], totalCount: 0, totalPages: 0, page: filters.page, error: true };
  }

  const result = parseSearchResult(data);
  if (!result) {
    console.error("searchPublicAthletes returned an unexpected shape:", data);
    return { athletes: [], totalCount: 0, totalPages: 0, page: filters.page, error: true };
  }

  // total_count is computed independently of how many rows this specific
  // page contains (see 20260820150200_athlete_discovery_rpc_total_count_fix.sql),
  // so it stays correct even when athletes is empty because the page is
  // genuinely out of range.
  const totalPages =
    result.total_count > 0 ? Math.ceil(result.total_count / DISCOVERY_PAGE_SIZE) : 0;

  return {
    athletes: result.athletes,
    totalCount: result.total_count,
    totalPages,
    page: filters.page,
    error: false,
  };
}

// The country filter's option list -- see get_public_athlete_countries for
// why this is derived from real data rather than a hardcoded dataset. India
// is SportFo's primary target market, so it's always pinned first when
// present rather than falling wherever it lands alphabetically.
export async function loadPublicAthleteCountries(
  supabase: SupabaseClient<Database>,
): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_public_athlete_countries");
  if (error) {
    console.error("loadPublicAthleteCountries failed:", error);
    return [];
  }
  const countries = (data ?? [])
    .map((row) => row.country)
    .filter((country): country is string => Boolean(country));

  const india = countries.filter((country) => country === "India");
  const rest = countries.filter((country) => country !== "India");
  return [...india, ...rest];
}

export interface RawDiscoverySearchParams {
  q?: string | string[];
  sport?: string | string[];
  country?: string | string[];
  city?: string | string[];
  skill?: string | string[];
  competitionLevel?: string | string[];
  track?: string | string[];
  page?: string | string[];
}

function firstValue(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ?? null;
}

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

// An unknown/tampered query param (a repeated key, a non-numeric page, a
// nonsense sport/skill value that matches no option) never throws -- it
// degrades to "no filter" or "page 1", and search_public_athletes's own
// exact-match/clamped-pagination logic handles the rest safely.
export function parseDiscoveryFilters(
  searchParams: RawDiscoverySearchParams,
): DiscoveryFilters {
  const query = firstValue(searchParams.q)?.trim() || null;
  const city = firstValue(searchParams.city)?.trim() || null;

  return {
    query,
    sport: firstValue(searchParams.sport) || null,
    country: firstValue(searchParams.country) || null,
    city,
    skillLevel: firstValue(searchParams.skill) || null,
    competitionLevel: firstValue(searchParams.competitionLevel) || null,
    parallelTrack: firstValue(searchParams.track) || null,
    page: parsePage(firstValue(searchParams.page)),
  };
}
