-- /athletes discovery: search, filter, and page-based pagination over
-- public, submitted athlete profiles only.
--
-- Security model matches the public-profile RPCs from the previous
-- milestone (see 20260820082419_athlete_public_profiles_rls.sql) exactly:
-- anon has no table-level SELECT on athlete_profiles/athlete_sports/
-- athlete_achievements, so a SECURITY INVOKER function called by anon
-- would see nothing at all (no anon RLS policy exists, and there is no
-- anon grant on these tables -- this is intentional and unchanged).
-- SECURITY DEFINER is required to read across every athlete's row while
-- searching; the function's own WHERE clause (is_public = true AND
-- profile_status = 'submitted') is what keeps this safe, exactly as it is
-- for get_public_athlete_profile/get_public_athlete_achievements, and the
-- SELECT list is a fixed, hand-picked set of public-safe columns -- the
-- same discipline applies here as there.

create or replace function public.search_public_athletes(
  p_query text default null,
  p_sport text default null,
  p_country text default null,
  p_city text default null,
  p_skill_level text default null,
  p_page integer default 1,
  p_page_size integer default 12
)
returns table (
  public_slug text,
  full_name text,
  primary_sport text,
  skill_level text,
  country text,
  city text,
  nationality text,
  achievement_count integer,
  total_count bigint
)
language sql
security definer
stable
set search_path = ''
as $$
  with normalized as (
    -- Trimmed to a case-insensitive, whitespace-tolerant search term (or
    -- null, meaning "no name filter"); page/page_size clamped so an
    -- unknown or tampered value (0, negative, absurdly large, non-numeric
    -- already rejected by the integer parameter type itself) can never
    -- produce an expensive or out-of-range query -- it just degrades to a
    -- safe default or an empty page, never an error.
    select
      nullif(trim(coalesce(p_query, '')), '') as q,
      greatest(coalesce(p_page, 1), 1) as page,
      least(greatest(coalesce(p_page_size, 12), 1), 50) as page_size
  ),
  filtered as (
    select
      p.id,
      p.public_slug,
      p.full_name,
      s.primary_sport,
      s.skill_level,
      p.country,
      p.city,
      p.nationality
    from public.athlete_profiles p
    left join public.athlete_sports s on s.athlete_profile_id = p.id
    where p.is_public = true
      and p.profile_status = 'submitted'
      and p.public_slug is not null
      and (
        (select q from normalized) is null
        or p.full_name ilike '%' || (select q from normalized) || '%'
      )
      and (p_sport is null or s.primary_sport = p_sport)
      and (p_country is null or p.country = p_country)
      and (p_city is null or p.city ilike '%' || trim(p_city) || '%')
      and (p_skill_level is null or s.skill_level = p_skill_level)
  )
  select
    f.public_slug,
    f.full_name,
    f.primary_sport,
    f.skill_level,
    f.country,
    f.city,
    f.nationality,
    (
      select count(*)::integer
      from public.athlete_achievements a
      where a.athlete_profile_id = f.id
    ) as achievement_count,
    -- Computed over the full filtered set before LIMIT/OFFSET apply (window
    -- functions run before the final row-limiting step in Postgres's
    -- logical query order), so this is the true total across every page,
    -- not just the current one -- one query, no second round trip.
    count(*) over ()::bigint as total_count
  from filtered f
  order by f.full_name nulls last, f.public_slug
  limit (select page_size from normalized)
  offset ((select page from normalized) - 1) * (select page_size from normalized);
$$;

revoke all on function public.search_public_athletes(text, text, text, text, text, integer, integer) from public;
grant execute on function public.search_public_athletes(text, text, text, text, text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_public_athlete_countries: the country filter's option list. There is
-- no canonical country dataset anywhere in this codebase (registration's
-- Country field is free text -- see AthletePersonalInfo/PersonalDetails),
-- so rather than hardcoding one, the filter offers exactly the country
-- values that already exist among public, submitted profiles -- always
-- accurate, never a dropdown option that would return zero results.
-- ---------------------------------------------------------------------------
create or replace function public.get_public_athlete_countries()
returns table (country text)
language sql
security definer
stable
set search_path = ''
as $$
  select distinct p.country
  from public.athlete_profiles p
  where p.is_public = true
    and p.profile_status = 'submitted'
    and p.country is not null
    and trim(p.country) <> ''
  order by p.country;
$$;

revoke all on function public.get_public_athlete_countries() from public;
grant execute on function public.get_public_athlete_countries() to anon, authenticated;
