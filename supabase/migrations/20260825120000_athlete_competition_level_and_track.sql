-- Competition level (the grassroots-to-international ladder) and parallel
-- track (which institutional pathway an athlete competes through) --
-- requested by the team as new filterable/displayable attributes for
-- discovery. Both live on athlete_sports (one row per athlete's sport
-- today), same table as primary_sport/skill_level, since they describe the
-- athlete's standing *within that sport*, not the person overall.
--
-- Nullable, no default: existing rows (and the registration form, until it
-- is updated to collect these) simply have no value yet -- never a fake
-- "Taluk" or "School / College" default standing in for real data.

alter table public.athlete_sports
  add column if not exists competition_level text
    check (competition_level in (
      'taluk', 'district', 'division', 'state', 'national', 'international'
    )),
  add column if not exists parallel_track text
    check (parallel_track in (
      'school-college', 'university', 'corporate', 'professional'
    ));

comment on column public.athlete_sports.competition_level is
  'Highest competition tier the athlete competes at for this sport: taluk < district < division < state < national < international.';
comment on column public.athlete_sports.parallel_track is
  'Institutional pathway the athlete competes through: school-college, university, corporate, or professional/league.';

-- ---------------------------------------------------------------------------
-- Discovery: add both as optional filters, same "null = no filter, exact
-- match otherwise" pattern as p_sport/p_skill_level. Postgres can't
-- CREATE OR REPLACE a function to add parameters, so it's dropped first.
-- ---------------------------------------------------------------------------
drop function if exists public.search_public_athletes(text, text, text, text, text, integer, integer);

create or replace function public.search_public_athletes(
  p_query text default null,
  p_sport text default null,
  p_country text default null,
  p_city text default null,
  p_skill_level text default null,
  p_competition_level text default null,
  p_parallel_track text default null,
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
      s.competition_level,
      s.parallel_track,
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
      and (p_competition_level is null or s.competition_level = p_competition_level)
      and (p_parallel_track is null or s.parallel_track = p_parallel_track)
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
            'competition_level', paged.competition_level,
            'parallel_track', paged.parallel_track,
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
    'total_count', (select count(*) from filtered),
    'page', (select page from normalized),
    'page_size', (select page_size from normalized)
  );
$$;

revoke all on function public.search_public_athletes(text, text, text, text, text, text, text, integer, integer) from public;
grant execute on function public.search_public_athletes(text, text, text, text, text, text, text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public profile read: same narrow-column-list discipline as the rest of
-- this function's history (see 20260822090100_public_profile_sportfo_id.sql)
-- -- add the two new columns to the fixed SELECT list, nothing else changes.
-- ---------------------------------------------------------------------------
drop function if exists public.get_public_athlete_profile(text);

create function public.get_public_athlete_profile(p_slug text)
returns table (
  full_name text,
  primary_sport text,
  sport_discipline text,
  position_role text,
  skill_level text,
  competition_level text,
  parallel_track text,
  nationality text,
  country text,
  city text,
  school_college text,
  club_academy text,
  coach_mentor text,
  sportfo_id text
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    p.full_name,
    s.primary_sport,
    s.sport_discipline,
    s.position_role,
    s.skill_level,
    s.competition_level,
    s.parallel_track,
    p.nationality,
    p.country,
    p.city,
    p.school_college,
    p.club_academy,
    p.coach_mentor,
    su.sportfo_id
  from public.athlete_profiles p
  left join public.athlete_sports s on s.athlete_profile_id = p.id
  left join public.sportfo_users su on su.user_id = p.user_id
  where p.public_slug = p_slug
    and p.is_public = true
    and p.profile_status = 'submitted'
  limit 1;
$$;

revoke all on function public.get_public_athlete_profile(text) from public;
grant execute on function public.get_public_athlete_profile(text) to anon, authenticated;
