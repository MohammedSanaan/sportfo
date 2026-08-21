-- Slug generation, the owner-facing visibility toggle, and the public-safe
-- read path for /a/<slug>.
--
-- Security model for public reads: anon is never granted SELECT on
-- athlete_profiles, athlete_sports, or athlete_achievements (RLS is
-- row-level, not column-level -- a row-level "is_public" policy on the base
-- tables would still let a direct PostgREST query request mobile_number or
-- email columns on an allowed row). Instead, two narrow SECURITY DEFINER
-- functions are the only public read surface: each selects a fixed,
-- hand-picked column list, so no client request can ever widen what comes
-- back. anon gets EXECUTE on exactly these two functions and nothing else.

grant usage on schema public to anon;

-- ---------------------------------------------------------------------------
-- generate_athlete_public_slug: sanitizes a full name into a lowercase,
-- hyphenated, URL-safe base slug, then appends -2, -3, ... until it finds
-- one that is neither reserved nor already taken. SECURITY DEFINER is
-- required here (unlike the rest of this codebase's functions) because
-- checking "is this slug already taken" must see every athlete's row, not
-- just the caller's own -- normal RLS would otherwise hide every other
-- user's public_slug and defeat the uniqueness check. It only ever returns
-- a generated candidate string; it never returns any row or column, so
-- there is no privilege-elevation data leak. The actual uniqueness
-- guarantee is still the UNIQUE constraint on athlete_profiles.public_slug
-- (see the previous migration) -- this function's EXISTS check is only a
-- best-effort pick for a nice, human-friendly slug under normal concurrency;
-- set_athlete_profile_visibility (below) retries on a real unique_violation.
create or replace function public.generate_athlete_public_slug(p_full_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix int := 1;
  v_reserved text[] := array[
    'a', 'admin', 'api', 'app', 'assets', 'athlete', 'athletes', 'auth',
    'coach', 'coaches', 'contact', 'dashboard', 'favicon', 'help', 'home',
    'login', 'logout', 'new', 'privacy', 'profile', 'public', 'recruiter',
    'recruiters', 'register', 'robots', 'settings', 'signin', 'signup',
    'sitemap', 'sponsor', 'sponsors', 'sportfo', 'static', 'support',
    'terms', 'www'
  ];
begin
  v_base := lower(coalesce(trim(p_full_name), ''));
  v_base := regexp_replace(v_base, '[^a-z0-9\s-]', '', 'g');
  v_base := regexp_replace(v_base, '[\s_-]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  v_base := substr(v_base, 1, 40);
  v_base := trim(both '-' from v_base);

  if v_base is null or char_length(v_base) < 3 then
    v_base := 'athlete';
  end if;

  v_candidate := v_base;
  loop
    if not (v_candidate = any (v_reserved))
       and not exists (
         select 1 from public.athlete_profiles where public_slug = v_candidate
       )
    then
      return v_candidate;
    end if;

    v_suffix := v_suffix + 1;
    if v_suffix > 1000 then
      -- Pathological collision chain -- fall back to a short random
      -- suffix rather than looping forever. The unique constraint (and
      -- the caller's retry-on-unique_violation) is the real backstop.
      return v_base || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    end if;
    v_candidate := v_base || '-' || v_suffix::text;
  end loop;
end;
$$;

revoke all on function public.generate_athlete_public_slug(text) from public;
grant execute on function public.generate_athlete_public_slug(text) to authenticated;

-- ---------------------------------------------------------------------------
-- set_athlete_profile_visibility: the only way is_public/public_slug ever
-- change. SECURITY INVOKER (the default, and this codebase's convention --
-- see owns_athlete_profile/save_athlete_registration): the caller's own
-- "Athletes can update own profile" RLS policy is what actually authorizes
-- the write, derived from auth.uid() only, never from a client-supplied id.
-- A slug is generated at most once per profile (first time it is made
-- public) and then persists unchanged for every later toggle, so a shared
-- link never breaks even if the athlete's name or visibility changes later.
create or replace function public.set_athlete_profile_visibility(p_is_public boolean)
returns table (public_slug text, is_public boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.athlete_profiles%rowtype;
  v_slug text;
  v_attempt int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile
  from public.athlete_profiles
  where user_id = auth.uid();

  if not found then
    raise exception 'Athlete profile not found';
  end if;

  if p_is_public and v_profile.profile_status <> 'submitted' then
    raise exception 'Only a submitted profile can be made public';
  end if;

  if p_is_public and v_profile.public_slug is null then
    loop
      v_attempt := v_attempt + 1;
      v_slug := public.generate_athlete_public_slug(v_profile.full_name);
      begin
        update public.athlete_profiles
        set public_slug = v_slug, is_public = true
        where id = v_profile.id;
        exit;
      exception when unique_violation then
        if v_attempt >= 5 then
          raise;
        end if;
      end;
    end loop;
  else
    update public.athlete_profiles
    set is_public = p_is_public
    where id = v_profile.id;
  end if;

  return query
    select p.public_slug, p.is_public
    from public.athlete_profiles p
    where p.id = v_profile.id;
end;
$$;

revoke all on function public.set_athlete_profile_visibility(boolean) from public;
grant execute on function public.set_athlete_profile_visibility(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- get_public_athlete_profile: the entire public read surface for personal/
-- sports data. Column list is deliberately hand-picked and narrow -- no
-- mobile_number, email, date_of_birth, gender, user_id, id, timestamps, or
-- any other column not listed here can ever be returned, regardless of
-- what the base tables contain now or grow to contain later.
create or replace function public.get_public_athlete_profile(p_slug text)
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
  coach_mentor text
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
    p.coach_mentor
  from public.athlete_profiles p
  left join public.athlete_sports s on s.athlete_profile_id = p.id
  where p.public_slug = p_slug
    and p.is_public = true
    and p.profile_status = 'submitted'
  limit 1;
$$;

revoke all on function public.get_public_athlete_profile(text) from public;
grant execute on function public.get_public_athlete_profile(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_public_athlete_achievements: same narrow-column-list principle.
-- document_path (the private Storage object path) is never returned --
-- has_document is a boolean derived from it, safe to expose, and is exactly
-- what the public profile UI needs to show a "Certificate available" badge
-- without exposing (or letting anyone sign a URL for) the file itself.
create or replace function public.get_public_athlete_achievements(p_slug text)
returns table (
  title text,
  achievement_type text,
  issuing_organization text,
  achievement_date date,
  description text,
  has_document boolean
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    a.title,
    a.achievement_type,
    a.issuing_organization,
    a.achievement_date,
    a.description,
    (a.document_path is not null) as has_document
  from public.athlete_achievements a
  join public.athlete_profiles p on p.id = a.athlete_profile_id
  where p.public_slug = p_slug
    and p.is_public = true
    and p.profile_status = 'submitted'
  order by a.achievement_date desc nulls last, a.created_at desc;
$$;

revoke all on function public.get_public_athlete_achievements(text) from public;
grant execute on function public.get_public_athlete_achievements(text) to anon, authenticated;
