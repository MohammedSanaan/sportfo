-- Achievements & Certificates: Issuing Organization becomes a canonical
-- dropdown (was free text) and both Issuing Organization and Achievement
-- Type get a dedicated "specify" column for their "Other" option -- never
-- collapsed into the generic Description field. Both new columns are
-- nullable free text (no CHECK constraint), same pattern as the existing
-- achievement_type/issuing_organization columns: the dropdown's canonical
-- values are enforced at the application layer (see athlete-options.ts),
-- not the database, so existing free-text issuing_organization values from
-- before this change remain valid rows -- they just won't match a known
-- dropdown option and will display as their raw stored text.
alter table public.athlete_achievements
  add column if not exists issuing_organization_other text,
  add column if not exists achievement_type_other text;

comment on column public.athlete_achievements.issuing_organization_other is
  'Free-text organization name, shown only when issuing_organization = ''other''.';
comment on column public.athlete_achievements.achievement_type_other is
  'Free-text achievement type, shown only when achievement_type = ''other''.';

-- ---------------------------------------------------------------------------
-- The athlete-writable UPDATE/INSERT column allow-lists were locked down to
-- an explicit list (not a blanket table-level grant) in
-- 20260829150100_lock_down_achievement_verification_status_column.sql and
-- 20260829150200_lock_down_achievement_verification_status_insert.sql --
-- unlike Supabase's default blanket grant, a newly added column here does
-- NOT automatically become writable, so both allow-lists must be reissued
-- to include the two new columns. verification_status is (still,
-- deliberately) absent from both.
-- ---------------------------------------------------------------------------
revoke update on public.athlete_achievements from authenticated, anon;

grant update (
  title, achievement_type, achievement_type_other, certificate_level,
  issuing_organization, issuing_organization_other, achievement_date,
  description, document_path, updated_at
) on public.athlete_achievements to authenticated;

revoke insert on public.athlete_achievements from authenticated, anon;

grant insert (
  id, athlete_profile_id, title, achievement_type, achievement_type_other,
  certificate_level, issuing_organization, issuing_organization_other,
  achievement_date, description, document_path, created_at, updated_at
) on public.athlete_achievements to authenticated;

-- ---------------------------------------------------------------------------
-- save_athlete_registration: identical signature (still just p_achievements
-- jsonb for the achievement array) -- a plain CREATE OR REPLACE, no DROP
-- needed. Only the achievement insert/update column lists change, reading
-- the two new keys from each achievement's jsonb the same way the existing
-- ones already are.
-- ---------------------------------------------------------------------------
create or replace function public.save_athlete_registration(p_profile_status text, p_full_name text, p_date_of_birth date, p_gender text, p_nationality text, p_country text, p_city text, p_mobile_number text, p_email text, p_school_college text, p_club_academy text, p_coach_mentor text, p_awards_recognition text, p_scholarship_recipient boolean, p_primary_sport text, p_sport_category text, p_sport_discipline text, p_position_role text, p_skill_level text, p_achievements jsonb DEFAULT '[]'::jsonb, p_preferred_language text DEFAULT NULL::text, p_emergency_contact text DEFAULT NULL::text, p_aadhaar_or_govt_id text DEFAULT NULL::text, p_competition_level text DEFAULT NULL::text, p_support_needed text[] DEFAULT NULL::text[], p_support_needed_other text DEFAULT NULL::text, p_employment_type text DEFAULT NULL::text, p_organization text DEFAULT NULL::text, p_job_title text DEFAULT NULL::text, p_years_experience text DEFAULT NULL::text, p_track_suit_size text DEFAULT NULL::text, p_tshirt_size text DEFAULT NULL::text, p_shorts_size text DEFAULT NULL::text, p_shoe_size text DEFAULT NULL::text, p_short_bio text DEFAULT NULL::text, p_instagram_url text DEFAULT NULL::text, p_facebook_url text DEFAULT NULL::text, p_other_url text DEFAULT NULL::text, p_profile_photo_path text DEFAULT NULL::text)
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
  -- profile_photo_path uses coalesce(new, existing) like every other
  -- upload path column elsewhere in this schema -- omitting a newly
  -- uploaded photo (null) on a later save must never erase an existing one.
  insert into public.athlete_profiles (
    user_id, full_name, date_of_birth, gender, nationality, country, city,
    mobile_number, email, school_college, club_academy, coach_mentor,
    awards_recognition, scholarship_recipient, profile_status,
    preferred_language, emergency_contact, aadhaar_or_govt_id,
    employment_type, organization, job_title, years_experience,
    track_suit_size, tshirt_size, shorts_size, shoe_size,
    short_bio, instagram_url, facebook_url, other_url, profile_photo_path
  ) values (
    auth.uid(), p_full_name, p_date_of_birth, p_gender, p_nationality,
    p_country, p_city, p_mobile_number, p_email, p_school_college,
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

  -- 2. athlete_sports: MVP keeps a single row per profile. No unique
  -- constraint exists on athlete_profile_id (deliberately, so multi-sport
  -- support later is a pure application change), so delete-then-insert
  -- inside this one transaction is what keeps it from ever accumulating
  -- duplicate rows while still allowing the schema to grow.
  delete from public.athlete_sports where athlete_profile_id = v_profile.id;

  if p_primary_sport is not null or p_sport_category is not null
     or p_sport_discipline is not null or p_position_role is not null
     or p_skill_level is not null or p_competition_level is not null
     or p_support_needed is not null then
    insert into public.athlete_sports (
      athlete_profile_id, primary_sport, sport_category, sport_discipline,
      position_role, skill_level, competition_level, support_needed,
      support_needed_other
    ) values (
      v_profile.id, p_primary_sport, p_sport_category, p_sport_discipline,
      p_position_role, p_skill_level, p_competition_level, p_support_needed,
      p_support_needed_other
    )
    returning * into v_sport;
    v_sport_json := to_jsonb(v_sport);
  end if;

  -- 3. athlete_achievements: full sync against the submitted list.
  -- Existing rows carry their real id (update); new rows have none
  -- (insert); anything previously saved but no longer present is removed.
  -- verification_status is never taken from the client here: a brand-new
  -- row gets the column's own DEFAULT 'pending', and an update never
  -- touches verification_status at all, so re-editing an achievement can
  -- never silently reset (or forge) its review status.
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
        description = v_achievement->>'description'
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
        achievement_date, description
      ) values (
        v_profile.id,
        v_achievement->>'title',
        v_achievement->>'achievement_type',
        v_achievement->>'achievement_type_other',
        v_achievement->>'certificate_level',
        v_achievement->>'issuing_organization',
        v_achievement->>'issuing_organization_other',
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

-- ---------------------------------------------------------------------------
-- get_public_athlete_achievements: appends achievement_type_other and
-- issuing_organization_other to the return columns -- neither is sensitive
-- (same privacy class as the achievement_type/issuing_organization columns
-- they annotate; no PII, no document exposure), so this is a plain
-- append, not a privacy regression. Return column set is changing, so
-- DROP-then-CREATE rather than CREATE OR REPLACE.
-- ---------------------------------------------------------------------------
drop function if exists public.get_public_athlete_achievements(text);

create function public.get_public_athlete_achievements(p_slug text)
returns table(
  title text,
  achievement_type text,
  achievement_type_other text,
  certificate_level text,
  verification_status text,
  issuing_organization text,
  issuing_organization_other text,
  achievement_date date,
  description text,
  has_document boolean
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    a.title,
    a.achievement_type,
    a.achievement_type_other,
    a.certificate_level,
    a.verification_status,
    a.issuing_organization,
    a.issuing_organization_other,
    a.achievement_date,
    a.description,
    (a.document_path is not null) as has_document
  from public.athlete_achievements a
  join public.athlete_profiles p on p.id = a.athlete_profile_id
  where p.public_slug = p_slug
    and p.is_public = true
    and p.profile_status = 'submitted'
  order by a.achievement_date desc nulls last, a.created_at desc;
$function$;
