-- Transactional upsert for the athlete registration form: writes
-- athlete_profiles, athlete_sports (single MVP row), and athlete_achievements
-- (full add/edit/remove sync) in one function call so a partial failure
-- (e.g. sports write succeeds, achievements write fails) can never leave
-- profile_status advanced without its related rows. A PL/pgSQL function
-- body runs as a single transaction, which is the cleanest way to get that
-- guarantee without hand-rolling a client-side multi-statement transaction
-- (the JS client has no such primitive) or standing up a second backend.
--
-- security invoker (the default) is used deliberately, same reasoning as
-- owns_athlete_profile(): the function runs as the calling authenticated
-- role, so the existing RLS policies on athlete_profiles/athlete_sports/
-- athlete_achievements are what actually authorize every write here. There
-- is no privilege elevation and no ownership logic duplicated in SQL beyond
-- deriving the profile id from auth.uid() -- never from a parameter.

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

  if p_primary_sport is not null or p_sport_discipline is not null
     or p_position_role is not null or p_skill_level is not null then
    insert into public.athlete_sports (
      athlete_profile_id, primary_sport, sport_discipline, position_role, skill_level
    ) values (
      v_profile.id, p_primary_sport, p_sport_discipline, p_position_role, p_skill_level
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
  text, boolean, text, text, text, text, jsonb
) to authenticated;
