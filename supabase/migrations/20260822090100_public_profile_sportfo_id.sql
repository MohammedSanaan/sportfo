-- Adds sportfo_id to the public profile read surface. SportFo ID is
-- intentionally public (it exists specifically to be a shareable account
-- identifier -- see supabase/migrations/20260822090000_sportfo_users.sql),
-- unlike mobile_number/email/date_of_birth/gender, none of which this
-- function has ever returned and still does not. The internal auth.users
-- UUID is still never touched or exposed anywhere in this function.
--
-- Postgres does not allow CREATE OR REPLACE to change a RETURNS TABLE
-- shape -- the function must be dropped and recreated.
drop function if exists public.get_public_athlete_profile(text);

create function public.get_public_athlete_profile(p_slug text)
returns table (
  full_name text,
  primary_sport text,
  sport_discipline text,
  position_role text,
  skill_level text,
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
