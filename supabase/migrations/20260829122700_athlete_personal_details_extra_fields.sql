-- Adds three new Personal Details fields to the Athlete registration:
-- preferred_language, emergency_contact, aadhaar_or_govt_id.
--
-- All three are nullable, additive columns -- existing athlete_profiles
-- rows remain valid with no backfill. preferred_language is a required
-- field in the UI form going forward, but is left nullable here (not a
-- NOT NULL + default) so a pre-existing row that predates this column
-- never fails any constraint; the application layer supplies a safe
-- fallback (the visitor's current UI locale, or English) when the column
-- is null.
--
-- aadhaar_or_govt_id is sensitive government-ID data. It follows the
-- existing owner-only-RLS pattern already in place on this table (see
-- 20260815120100_athlete_registration_rls.sql -- "Athletes can view own
-- profile" is the only SELECT policy on athlete_profiles) and must never
-- be added to any of the public/admin-facing SECURITY DEFINER RPCs that
-- hand-pick their own column lists off this table:
--   get_public_athlete_profile, get_public_athlete_achievements,
--   get_public_athlete_countries, search_public_athletes
-- (all defined in supabase/migrations/20260820*.sql). None of those are
-- touched by this migration, and none should ever select this column.
alter table public.athlete_profiles
  add column preferred_language text,
  add column emergency_contact text,
  add column aadhaar_or_govt_id text;

comment on column public.athlete_profiles.preferred_language is
  'Communication-preference locale code (en/hi/kn/ta/te/ml) -- independent of the site UI locale cookie, never auto-switches it.';
comment on column public.athlete_profiles.emergency_contact is
  'Optional E.164 phone for a parent/guardian/emergency contact, for events and trials -- not a login credential.';
comment on column public.athlete_profiles.aadhaar_or_govt_id is
  'Sensitive government ID for future KYC/fraud prevention. Owner-only via existing RLS; must never be selected by any public or admin-facing RPC.';

-- Extend save_athlete_registration with the three new parameters, appended
-- at the end with DEFAULT NULL so the signature change is backward
-- compatible. Everything else in the function is unchanged from
-- 20260817090000_save_athlete_registration_rpc.sql.
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
  p_achievements jsonb default '[]'::jsonb,
  p_preferred_language text default null,
  p_emergency_contact text default null,
  p_aadhaar_or_govt_id text default null
)
returns jsonb
language plpgsql
set search_path to ''
as $function$
declare
  v_profile public.athlete_profiles;
  v_sport public.athlete_sports;
  v_sport_json jsonb;
  v_achievement jsonb;
  v_achievement_row public.athlete_achievements;
  v_result_achievements jsonb := '[]'::jsonb;
  v_keep_ids uuid[];
  v_registration public.registrations;
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
    awards_recognition, scholarship_recipient, profile_status,
    preferred_language, emergency_contact, aadhaar_or_govt_id
  ) values (
    auth.uid(), p_full_name, p_date_of_birth, p_gender, p_nationality,
    p_country, p_city, p_mobile_number, p_email, p_school_college,
    p_club_academy, p_coach_mentor, p_awards_recognition,
    p_scholarship_recipient, p_profile_status,
    p_preferred_language, p_emergency_contact, p_aadhaar_or_govt_id
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
    profile_status = excluded.profile_status,
    preferred_language = excluded.preferred_language,
    emergency_contact = excluded.emergency_contact,
    aadhaar_or_govt_id = excluded.aadhaar_or_govt_id
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

  -- 4. registrations: common cross-category tracking row. Same transaction
  -- as the writes above, so a failure anywhere in this function rolls the
  -- profile/sport/achievement writes back too -- there is no path that
  -- leaves an athlete_profiles row without a matching registrations row.
  insert into public.registrations (
    user_id, sportfo_user_id, registration_type, profile_id, display_name,
    status, registered_at
  ) values (
    auth.uid(),
    (select id from public.sportfo_users where user_id = auth.uid()),
    'athlete',
    v_profile.id,
    v_profile.full_name,
    p_profile_status,
    case when p_profile_status = 'submitted' then now() else null end
  )
  on conflict (user_id, registration_type) do update set
    profile_id = excluded.profile_id,
    display_name = excluded.display_name,
    status = excluded.status,
    -- Set once, the first time status becomes 'submitted' -- re-saving
    -- later (editing an already-submitted profile) must never bump the
    -- athlete's original registration date.
    registered_at = case
      when public.registrations.registered_at is not null then public.registrations.registered_at
      when excluded.status = 'submitted' then now()
      else null
    end
  returning * into v_registration;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'sport', v_sport_json,
    'achievements', v_result_achievements,
    'registration', to_jsonb(v_registration)
  );
end;
$function$;
