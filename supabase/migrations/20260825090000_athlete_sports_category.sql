-- Adds sport_category to athlete_sports: the Athlete Registration form's
-- Sport -> Category selector (see src/lib/sports/catalog.ts) needs to
-- persist the athlete's chosen category alongside primary_sport as a
-- separate value -- never combined into one string.
--
-- Both save_athlete_registration and get_public_athlete_profile must be
-- dropped and recreated (not CREATE OR REPLACE) because their parameter
-- list / RETURNS TABLE shape is changing.

alter table public.athlete_sports
  add column if not exists sport_category text;

comment on column public.athlete_sports.sport_category is
  'SportFo category resolved from primary_sport (see src/lib/sports/catalog.ts). Kept separate from primary_sport, never combined into one string.';

-- ---------------------------------------------------------------------------
-- save_athlete_registration: add p_sport_category
-- ---------------------------------------------------------------------------

drop function if exists public.save_athlete_registration(
  text, text, date, text, text, text, text, text, text, text, text, text,
  text, boolean, text, text, text, text, jsonb
);

create or replace function public.save_athlete_registration(
  p_profile_status text,
  p_full_name text,
  p_date_of_birth date,
  p_gender text,
  p_nationality text,
  p_country text,
  p_city text,
  p_mobile_number text,
  p_email text,
  p_school_college text,
  p_club_academy text,
  p_coach_mentor text,
  p_awards_recognition text,
  p_scholarship_recipient boolean,
  p_primary_sport text,
  p_sport_category text,
  p_sport_discipline text,
  p_position_role text,
  p_skill_level text,
  p_achievements jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.athlete_profiles;
  v_sport public.athlete_sports;
  v_sport_json jsonb;
  v_achievement jsonb;
  v_achievement_row public.athlete_achievements;
  v_result_achievements jsonb := '[]'::jsonb;
  v_keep_ids uuid[];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_profile_status not in ('draft', 'submitted') then
    raise exception 'Invalid profile_status: %', p_profile_status;
  end if;

  -- 1. athlete_profiles: one row per user, upserted by the unique user_id.
  insert into public.athlete_profiles (
    user_id, full_name, date_of_birth, gender, nationality, country, city,
    mobile_number, email, school_college, club_academy, coach_mentor,
    awards_recognition, scholarship_recipient, profile_status
  ) values (
    auth.uid(), p_full_name, p_date_of_birth, p_gender, p_nationality,
    p_country, p_city, p_mobile_number, p_email, p_school_college,
    p_club_academy, p_coach_mentor, p_awards_recognition,
    p_scholarship_recipient, p_profile_status
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    date_of_birth = excluded.date_of_birth,
    gender = excluded.gender,
    nationality = excluded.nationality,
    country = excluded.country,
    city = excluded.city,
    mobile_number = excluded.mobile_number,
    email = excluded.email,
    school_college = excluded.school_college,
    club_academy = excluded.club_academy,
    coach_mentor = excluded.coach_mentor,
    awards_recognition = excluded.awards_recognition,
    scholarship_recipient = excluded.scholarship_recipient,
    profile_status = excluded.profile_status
  returning * into v_profile;

  -- 2. athlete_sports: MVP keeps a single row per profile. No unique
  -- constraint exists on athlete_profile_id (deliberately, so multi-sport
  -- support later is a pure application change), so delete-then-insert
  -- inside this one transaction is what keeps it from ever accumulating
  -- duplicate rows while still allowing the schema to grow.
  delete from public.athlete_sports where athlete_profile_id = v_profile.id;

  if p_primary_sport is not null or p_sport_category is not null
     or p_sport_discipline is not null or p_position_role is not null
     or p_skill_level is not null then
    insert into public.athlete_sports (
      athlete_profile_id, primary_sport, sport_category, sport_discipline,
      position_role, skill_level
    ) values (
      v_profile.id, p_primary_sport, p_sport_category, p_sport_discipline,
      p_position_role, p_skill_level
    )
    returning * into v_sport;
    v_sport_json := to_jsonb(v_sport);
  end if;

  -- 3. athlete_achievements: full sync against the submitted list.
  -- Existing rows carry their real id (update); new rows have none
  -- (insert); anything previously saved but no longer present is removed.
  v_keep_ids := array(
    select (elem->>'id')::uuid
    from jsonb_array_elements(p_achievements) elem
    where elem ? 'id' and elem->>'id' is not null
  );

  delete from public.athlete_achievements
  where athlete_profile_id = v_profile.id
    and not (v_keep_ids is not null and id = any(v_keep_ids));

  for v_achievement in select * from jsonb_array_elements(p_achievements)
  loop
    if v_achievement ? 'id' and v_achievement->>'id' is not null then
      update public.athlete_achievements set
        title = v_achievement->>'title',
        achievement_type = v_achievement->>'achievement_type',
        issuing_organization = v_achievement->>'issuing_organization',
        achievement_date = nullif(v_achievement->>'achievement_date', '')::date,
        description = v_achievement->>'description'
      where id = (v_achievement->>'id')::uuid
        and athlete_profile_id = v_profile.id
      returning * into v_achievement_row;

      if not found then
        raise exception 'Achievement % not found for this profile', v_achievement->>'id';
      end if;
    else
      insert into public.athlete_achievements (
        athlete_profile_id, title, achievement_type, issuing_organization,
        achievement_date, description
      ) values (
        v_profile.id,
        v_achievement->>'title',
        v_achievement->>'achievement_type',
        v_achievement->>'issuing_organization',
        nullif(v_achievement->>'achievement_date', '')::date,
        v_achievement->>'description'
      )
      returning * into v_achievement_row;
    end if;

    -- Appended in input order (not selection order) so the caller can zip
    -- the response back onto the form's achievement list by index.
    v_result_achievements := v_result_achievements || to_jsonb(v_achievement_row);
  end loop;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'sport', v_sport_json,
    'achievements', v_result_achievements
  );
end;
$$;

grant execute on function public.save_athlete_registration(
  text, text, date, text, text, text, text, text, text, text, text, text,
  text, boolean, text, text, text, text, text, jsonb
) to authenticated;

-- ---------------------------------------------------------------------------
-- get_public_athlete_profile: return sport_category alongside primary_sport
-- ---------------------------------------------------------------------------

drop function if exists public.get_public_athlete_profile(text);

create function public.get_public_athlete_profile(p_slug text)
returns table (
  full_name text,
  primary_sport text,
  sport_category text,
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
    s.sport_category,
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
