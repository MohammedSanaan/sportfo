-- Athlete Registration restructure:
--   1. Secondary Sports: a new multi-select field, distinct from
--      primary_sport, using the same sports catalog. Stored as a text[]
--      column on athlete_sports -- the same structural pattern already
--      established for support_needed, rather than a normalized child
--      table (a single athlete's secondary-sport list is small, unordered,
--      and never queried/filtered on its own the way e.g. achievements
--      are, so a child table would add join overhead with no real
--      benefit here).
--   2. get_public_athlete_profile gains secondary_sports in its return
--      columns, so the public profile can show it (see task spec: "if
--      appropriate for public athlete identity, include them safely").
--
-- Sport Discipline and Position/Role are DELIBERATELY not touched by this
-- migration -- the UI now merges them into one "Sport Discipline /
-- Position / Role" field, but that's an application-layer decision (see
-- PersonalDetailsSection/SportsInformationSection and
-- registration-draft.ts's deriveDisciplinePosition): going forward the
-- merged value is written into the existing sport_discipline column
-- (position_role is simply no longer populated on new saves), and on load
-- a record that still only has position_role set falls back to it, or
-- both are joined for display if a legacy record has two different
-- values in each. No schema change is needed for that -- reusing an
-- existing column, not duplicating one, per the task's explicit
-- instruction not to create new columns just because a field moved/
-- merged visually.
--
-- Club/Academy and Coach/Mentor moving from Personal Details to Sports
-- Information in the UI is a pure form-layout change too -- both already
-- live on athlete_profiles (club_academy, coach_mentor) and the
-- save_athlete_registration RPC already accepts/writes them via
-- p_club_academy/p_coach_mentor; nothing about that storage changes here.

alter table public.athlete_sports
  add column if not exists secondary_sports text[];

comment on column public.athlete_sports.secondary_sports is
  'Additional sports the athlete also participates in, distinct from primary_sport (enforced at the application layer, never includes the current primary sport). Category is derived only from primary_sport and is never affected by this list.';

-- ---------------------------------------------------------------------------
-- save_athlete_registration: append p_secondary_sports.
--
-- Same failure mode as the previous phase's migration (CREATE OR REPLACE
-- does not replace a function whose argument list changed -- it creates a
-- second overload) -- the old 41-parameter signature is dropped explicitly
-- first, verified directly against the live function via
-- pg_get_function_identity_arguments() before writing this.
-- ---------------------------------------------------------------------------
drop function if exists public.save_athlete_registration(
  p_profile_status text, p_full_name text, p_date_of_birth date, p_gender text,
  p_nationality text, p_country text, p_city text, p_mobile_number text,
  p_email text, p_school_college text, p_club_academy text, p_coach_mentor text,
  p_awards_recognition text, p_scholarship_recipient boolean, p_primary_sport text,
  p_sport_category text, p_sport_discipline text, p_position_role text,
  p_skill_level text, p_achievements jsonb, p_preferred_language text,
  p_emergency_contact text, p_aadhaar_or_govt_id text, p_competition_level text,
  p_support_needed text[], p_support_needed_other text, p_employment_type text,
  p_organization text, p_job_title text, p_years_experience text,
  p_track_suit_size text, p_tshirt_size text, p_shorts_size text, p_shoe_size text,
  p_short_bio text, p_instagram_url text, p_facebook_url text, p_other_url text,
  p_profile_photo_path text, p_state text, p_competition_level_other text
);

create or replace function public.save_athlete_registration(p_profile_status text, p_full_name text, p_date_of_birth date, p_gender text, p_nationality text, p_country text, p_city text, p_mobile_number text, p_email text, p_school_college text, p_club_academy text, p_coach_mentor text, p_awards_recognition text, p_scholarship_recipient boolean, p_primary_sport text, p_sport_category text, p_sport_discipline text, p_position_role text, p_skill_level text, p_achievements jsonb DEFAULT '[]'::jsonb, p_preferred_language text DEFAULT NULL::text, p_emergency_contact text DEFAULT NULL::text, p_aadhaar_or_govt_id text DEFAULT NULL::text, p_competition_level text DEFAULT NULL::text, p_support_needed text[] DEFAULT NULL::text[], p_support_needed_other text DEFAULT NULL::text, p_employment_type text DEFAULT NULL::text, p_organization text DEFAULT NULL::text, p_job_title text DEFAULT NULL::text, p_years_experience text DEFAULT NULL::text, p_track_suit_size text DEFAULT NULL::text, p_tshirt_size text DEFAULT NULL::text, p_shorts_size text DEFAULT NULL::text, p_shoe_size text DEFAULT NULL::text, p_short_bio text DEFAULT NULL::text, p_instagram_url text DEFAULT NULL::text, p_facebook_url text DEFAULT NULL::text, p_other_url text DEFAULT NULL::text, p_profile_photo_path text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_competition_level_other text DEFAULT NULL::text, p_secondary_sports text[] DEFAULT NULL::text[])
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

  insert into public.athlete_profiles (
    user_id, full_name, date_of_birth, gender, nationality, country, city, state,
    mobile_number, email, school_college, club_academy, coach_mentor,
    awards_recognition, scholarship_recipient, profile_status,
    preferred_language, emergency_contact, aadhaar_or_govt_id,
    employment_type, organization, job_title, years_experience,
    track_suit_size, tshirt_size, shorts_size, shoe_size,
    short_bio, instagram_url, facebook_url, other_url, profile_photo_path
  ) values (
    auth.uid(), p_full_name, p_date_of_birth, p_gender, p_nationality,
    p_country, p_city, p_state, p_mobile_number, p_email, p_school_college,
    p_club_academy, p_coach_mentor, p_awards_recognition,
    p_scholarship_recipient, p_profile_status,
    p_preferred_language, p_emergency_contact, p_aadhaar_or_govt_id,
    p_employment_type, p_organization, p_job_title, p_years_experience,
    p_track_suit_size, p_tshirt_size, p_shorts_size, p_shoe_size,
    p_short_bio, p_instagram_url, p_facebook_url, p_other_url, p_profile_photo_path
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    date_of_birth = excluded.date_of_birth,
    gender = excluded.gender,
    nationality = excluded.nationality,
    country = excluded.country,
    city = excluded.city,
    state = excluded.state,
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
    aadhaar_or_govt_id = excluded.aadhaar_or_govt_id,
    employment_type = excluded.employment_type,
    organization = excluded.organization,
    job_title = excluded.job_title,
    years_experience = excluded.years_experience,
    track_suit_size = excluded.track_suit_size,
    tshirt_size = excluded.tshirt_size,
    shorts_size = excluded.shorts_size,
    shoe_size = excluded.shoe_size,
    short_bio = excluded.short_bio,
    instagram_url = excluded.instagram_url,
    facebook_url = excluded.facebook_url,
    other_url = excluded.other_url,
    profile_photo_path = coalesce(excluded.profile_photo_path, public.athlete_profiles.profile_photo_path)
  returning * into v_profile;

  delete from public.athlete_sports where athlete_profile_id = v_profile.id;

  if p_primary_sport is not null or p_sport_category is not null
     or p_sport_discipline is not null or p_position_role is not null
     or p_skill_level is not null or p_competition_level is not null
     or p_support_needed is not null or p_secondary_sports is not null then
    insert into public.athlete_sports (
      athlete_profile_id, primary_sport, sport_category, sport_discipline,
      position_role, skill_level, competition_level, competition_level_other,
      support_needed, support_needed_other, secondary_sports
    ) values (
      v_profile.id, p_primary_sport, p_sport_category, p_sport_discipline,
      p_position_role, p_skill_level, p_competition_level, p_competition_level_other,
      p_support_needed, p_support_needed_other, p_secondary_sports
    )
    returning * into v_sport;
    v_sport_json := to_jsonb(v_sport);
  end if;

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
        achievement_type_other = v_achievement->>'achievement_type_other',
        certificate_level = v_achievement->>'certificate_level',
        issuing_organization = v_achievement->>'issuing_organization',
        issuing_organization_other = v_achievement->>'issuing_organization_other',
        achievement_date = nullif(v_achievement->>'achievement_date', '')::date,
        description = v_achievement->>'description',
        medal_type = v_achievement->>'medal_type'
      where id = (v_achievement->>'id')::uuid
        and athlete_profile_id = v_profile.id
      returning * into v_achievement_row;

      if not found then
        raise exception 'Achievement % not found for this profile', v_achievement->>'id';
      end if;
    else
      insert into public.athlete_achievements (
        athlete_profile_id, title, achievement_type, achievement_type_other,
        certificate_level, issuing_organization, issuing_organization_other,
        achievement_date, description, medal_type
      ) values (
        v_profile.id,
        v_achievement->>'title',
        v_achievement->>'achievement_type',
        v_achievement->>'achievement_type_other',
        v_achievement->>'certificate_level',
        v_achievement->>'issuing_organization',
        v_achievement->>'issuing_organization_other',
        nullif(v_achievement->>'achievement_date', '')::date,
        v_achievement->>'description',
        v_achievement->>'medal_type'
      )
      returning * into v_achievement_row;
    end if;

    v_result_achievements := v_result_achievements || to_jsonb(v_achievement_row);
  end loop;

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

-- ---------------------------------------------------------------------------
-- get_public_athlete_profile: append secondary_sports to the return columns.
-- Postgres cannot CREATE OR REPLACE a function while changing its RETURNS
-- TABLE column list, so this is DROP-then-CREATE (same pattern as the
-- achievement_type_other/issuing_organization_other addition in
-- 20260829160000_achievement_issuing_organization_and_type_other.sql) --
-- grants must be reissued afterward since DROP removes them.
-- ---------------------------------------------------------------------------
drop function if exists public.get_public_athlete_profile(text);

create function public.get_public_athlete_profile(p_slug text)
returns table(
  full_name text,
  primary_sport text,
  sport_category text,
  sport_discipline text,
  position_role text,
  skill_level text,
  competition_level text,
  nationality text,
  country text,
  city text,
  school_college text,
  club_academy text,
  coach_mentor text,
  sportfo_id text,
  profile_photo_path text,
  short_bio text,
  instagram_url text,
  facebook_url text,
  other_url text,
  secondary_sports text[]
)
language sql
stable security definer
set search_path to ''
as $function$
  select
    p.full_name,
    s.primary_sport,
    s.sport_category,
    s.sport_discipline,
    s.position_role,
    s.skill_level,
    s.competition_level,
    p.nationality,
    p.country,
    p.city,
    p.school_college,
    p.club_academy,
    p.coach_mentor,
    su.sportfo_id,
    p.profile_photo_path,
    p.short_bio,
    p.instagram_url,
    p.facebook_url,
    p.other_url,
    s.secondary_sports
  from public.athlete_profiles p
  left join public.athlete_sports s on s.athlete_profile_id = p.id
  left join public.sportfo_users su on su.user_id = p.user_id
  where p.public_slug = p_slug
    and p.is_public = true
    and p.profile_status = 'submitted'
  limit 1;
$function$;

revoke all on function public.get_public_athlete_profile(text) from public;
grant execute on function public.get_public_athlete_profile(text) to anon, authenticated;
