-- Fix: search_public_athletes previously returned total_count as a column
-- on each result row via `count(*) over ()`. That value only exists on
-- rows that survive LIMIT/OFFSET -- when the requested page is genuinely
-- out of range (offset skips past every matching row), the function
-- returns zero rows entirely, so total_count was silently unreadable and
-- the caller fell back to 0. That made an out-of-range page
-- indistinguishable from "no public athletes exist at all", which the
-- discovery page then displayed as the wrong empty-state message.
--
-- Fixed by returning a single jsonb envelope -- { athletes, total_count,
-- page, page_size } -- instead of `returns table(...)`. total_count is
-- now computed as a separate aggregate over the *unpaginated* filtered
-- set, so it is always correct regardless of how many rows (zero or
-- more) the requested page itself contains. This mirrors the existing
-- jsonb-envelope pattern already used by save_athlete_registration (see
-- 20260817090000_save_athlete_registration_rpc.sql).
--
-- Postgres does not allow CREATE OR REPLACE to change a function's return
-- type, so the old table-returning overload is dropped first; grants are
-- re-applied from scratch immediately after (dropping a function also
-- drops its grants).

drop function if exists public.search_public_athletes(text, text, text, text, text, integer, integer);

create or replace function public.search_public_athletes(
  p_query text default null,
  p_sport text default null,
  p_country text default null,
  p_city text default null,
  p_skill_level text default null,
  p_page integer default 1,
  p_page_size integer default 12
)
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  with normalized as (
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
    cross join normalized n
    where p.is_public = true
      and p.profile_status = 'submitted'
      and p.public_slug is not null
      and (n.q is null or p.full_name ilike '%' || n.q || '%')
      and (p_sport is null or s.primary_sport = p_sport)
      and (p_country is null or p.country = p_country)
      and (p_city is null or p.city ilike '%' || trim(p_city) || '%')
      and (p_skill_level is null or s.skill_level = p_skill_level)
  ),
  paged as (
    select
      f.*,
      (
        select count(*)::integer
        from public.athlete_achievements a
        where a.athlete_profile_id = f.id
      ) as achievement_count
    from filtered f
    order by f.full_name nulls last, f.public_slug
    limit (select page_size from normalized)
    offset ((select page from normalized) - 1) * (select page_size from normalized)
  )
  select jsonb_build_object(
    'athletes', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'public_slug', paged.public_slug,
            'full_name', paged.full_name,
            'primary_sport', paged.primary_sport,
            'skill_level', paged.skill_level,
            'country', paged.country,
            'city', paged.city,
            'nationality', paged.nationality,
            'achievement_count', paged.achievement_count
          )
        )
        from paged
      ),
      '[]'::jsonb
    ),
    -- Independent of `paged` -- correct on every page, including one past
    -- the last, where `paged` itself is empty.
    'total_count', (select count(*) from filtered),
    'page', (select page from normalized),
    'page_size', (select page_size from normalized)
  );
$$;

revoke all on function public.search_public_athletes(text, text, text, text, text, integer, integer) from public;
grant execute on function public.search_public_athletes(text, text, text, text, text, integer, integer) to anon, authenticated;
