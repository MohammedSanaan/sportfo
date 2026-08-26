-- RPCs for the common registration-tracking phase:
--   - save_athlete_registration is extended (same signature, purely
--     additive body change) to also upsert a `registrations` tracking row
--     in the same transaction -- Athlete's own persistence is untouched.
--   - save_role_registration is the one transactional, generic entry point
--     for the 7 non-Athlete categories: profile upsert + registrations
--     upsert + registration_id backfill, all in a single function body
--     (Postgres functions run inside the caller's transaction, so any
--     exception here rolls back everything -- there is no path that can
--     leave a profile row without its registrations row or vice versa).
--   - get_own_role_registration lets a role-registration form reload the
--     visitor's own previously-submitted data (pre-fill), same idea as
--     loadAthleteDraft for the Athlete flow.
--   - is_current_user_admin + four admin_* read RPCs back the new
--     /admin/dashboard: every one of them re-checks admin status itself
--     (never trusts the caller reached this far only because a page-level
--     check passed), and none of them ever selects phone/email/document
--     paths -- only registrations + sportfo_id.

-- ---------------------------------------------------------------------------
-- save_athlete_registration: additive only. Same parameter list and return
-- shape as before; the only change is upserting a `registrations` row
-- alongside the existing athlete_profiles/athlete_sports/achievements
-- writes, inside the same transaction.
-- ---------------------------------------------------------------------------
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
$$;

-- Signature unchanged from the previous migration -- grant restated for
-- clarity, not strictly required.
grant execute on function public.save_athlete_registration(
  text, text, date, text, text, text, text, text, text, text, text, text,
  text, boolean, text, text, text, text, text, jsonb
) to authenticated;

-- One-time backfill: every already-submitted athlete_profiles row (from
-- before this migration) gets its registrations row too, so dashboard
-- history/KPIs reflect real pre-existing data, not just registrations
-- created after today. Idempotent via the same (user_id, registration_type)
-- conflict target, safe to re-run.
insert into public.registrations (
  user_id, sportfo_user_id, registration_type, profile_id, display_name,
  status, registered_at, created_at, updated_at
)
select
  p.user_id,
  su.id,
  'athlete',
  p.id,
  p.full_name,
  p.profile_status,
  case when p.profile_status = 'submitted' then p.updated_at else null end,
  p.created_at,
  p.updated_at
from public.athlete_profiles p
left join public.sportfo_users su on su.user_id = p.user_id
on conflict (user_id, registration_type) do nothing;

-- ---------------------------------------------------------------------------
-- save_role_registration: the one transactional entry point for the 7
-- non-Athlete categories. registration_type selects which profile table
-- gets upserted; p_fields is the category's field payload (camelCase keys
-- matching GenericCategoryForm's own field ids client-side). Explicit
-- per-category branches rather than dynamic SQL -- registration_type is
-- validated against a fixed allowlist before it ever influences which
-- statement runs, so there is no identifier-injection surface.
--
-- File path fields (idProofPath, etc.) use coalesce(new, existing) so a
-- re-submission that didn't re-upload a file never clobbers a
-- previously-uploaded path with null; every other field is a plain
-- overwrite, including clearing an optional field back to blank.
-- ---------------------------------------------------------------------------
create or replace function public.save_role_registration(
  p_registration_type text,
  p_status text,
  p_fields jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile record;
  v_display_name text;
  v_registration public.registrations;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_status not in ('draft', 'submitted') then
    raise exception 'Invalid status: %', p_status;
  end if;

  if p_registration_type not in (
    'academy_coach_parent', 'performance_expert', 'media_creator',
    'management_legal', 'event_operations', 'sponsor_csr', 'talent_analytics'
  ) then
    raise exception 'Unsupported registration_type for save_role_registration: %', p_registration_type;
  end if;

  if p_registration_type = 'academy_coach_parent' then
    v_display_name := p_fields->>'academyCoachName';
    insert into public.academy_coach_profiles (
      user_id, academy_coach_name, sports_offered, age_groups_trained,
      coach_certification, experience_level, location,
      academy_info_path, id_proof_path
    ) values (
      v_user_id, v_display_name, p_fields->>'sportsOffered', p_fields->>'ageGroupsTrained',
      p_fields->>'coachCertification', p_fields->>'experienceLevel', p_fields->>'location',
      p_fields->>'uploadAcademyInfo', p_fields->>'uploadIdProof'
    )
    on conflict (user_id) do update set
      academy_coach_name = excluded.academy_coach_name,
      sports_offered = excluded.sports_offered,
      age_groups_trained = excluded.age_groups_trained,
      coach_certification = excluded.coach_certification,
      experience_level = excluded.experience_level,
      location = excluded.location,
      academy_info_path = coalesce(excluded.academy_info_path, public.academy_coach_profiles.academy_info_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.academy_coach_profiles.id_proof_path)
    returning * into v_profile;

  elsif p_registration_type = 'performance_expert' then
    v_display_name := p_fields->>'fullName';
    insert into public.performance_expert_profiles (
      user_id, full_name, expertise, experience_level, services_offered,
      certifications, location, certificate_path, id_proof_path
    ) values (
      v_user_id, v_display_name, p_fields->>'expertise', p_fields->>'experienceLevel',
      p_fields->>'servicesOffered', p_fields->>'certifications', p_fields->>'location',
      p_fields->>'uploadCertificate', p_fields->>'uploadIdProof'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      expertise = excluded.expertise,
      experience_level = excluded.experience_level,
      services_offered = excluded.services_offered,
      certifications = excluded.certifications,
      location = excluded.location,
      certificate_path = coalesce(excluded.certificate_path, public.performance_expert_profiles.certificate_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.performance_expert_profiles.id_proof_path)
    returning * into v_profile;

  elsif p_registration_type = 'media_creator' then
    v_display_name := p_fields->>'fullName';
    insert into public.creator_profiles (
      user_id, full_name, portfolio_link, content_type, social_media_handles,
      location, portfolio_path
    ) values (
      v_user_id, v_display_name, p_fields->>'portfolioLink', p_fields->>'contentType',
      p_fields->>'socialMediaHandles', p_fields->>'location', p_fields->>'uploadPortfolio'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      portfolio_link = excluded.portfolio_link,
      content_type = excluded.content_type,
      social_media_handles = excluded.social_media_handles,
      location = excluded.location,
      portfolio_path = coalesce(excluded.portfolio_path, public.creator_profiles.portfolio_path)
    returning * into v_profile;

  elsif p_registration_type = 'management_legal' then
    v_display_name := p_fields->>'fullName';
    insert into public.management_legal_profiles (
      user_id, full_name, role, license_number, organization, experience_level,
      location, license_path, id_proof_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'licenseNumber',
      p_fields->>'organization', p_fields->>'experienceLevel', p_fields->>'location',
      p_fields->>'uploadLicense', p_fields->>'uploadIdProof'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      license_number = excluded.license_number,
      organization = excluded.organization,
      experience_level = excluded.experience_level,
      location = excluded.location,
      license_path = coalesce(excluded.license_path, public.management_legal_profiles.license_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.management_legal_profiles.id_proof_path)
    returning * into v_profile;

  elsif p_registration_type = 'event_operations' then
    v_display_name := p_fields->>'fullName';
    insert into public.event_staff_profiles (
      user_id, full_name, role, certification, experience_years, availability,
      location, id_proof_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'certification',
      nullif(p_fields->>'experienceYears', '')::integer, p_fields->>'availability',
      p_fields->>'location', p_fields->>'uploadIdProof'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      certification = excluded.certification,
      experience_years = excluded.experience_years,
      availability = excluded.availability,
      location = excluded.location,
      id_proof_path = coalesce(excluded.id_proof_path, public.event_staff_profiles.id_proof_path)
    returning * into v_profile;

  elsif p_registration_type = 'sponsor_csr' then
    v_display_name := p_fields->>'organizationName';
    insert into public.sponsor_profiles (
      user_id, organization_name, contact_person, sponsorship_interest,
      budget_range, sports_focus, location, proposal_path, id_proof_path
    ) values (
      v_user_id, v_display_name, p_fields->>'contactPerson',
      case when p_fields ? 'sponsorshipInterest'
        then array(select jsonb_array_elements_text(p_fields->'sponsorshipInterest'))
        else null
      end,
      p_fields->>'budgetRange', p_fields->>'sportsFocus', p_fields->>'location',
      p_fields->>'uploadProposal', p_fields->>'uploadIdProof'
    )
    on conflict (user_id) do update set
      organization_name = excluded.organization_name,
      contact_person = excluded.contact_person,
      sponsorship_interest = excluded.sponsorship_interest,
      budget_range = excluded.budget_range,
      sports_focus = excluded.sports_focus,
      location = excluded.location,
      proposal_path = coalesce(excluded.proposal_path, public.sponsor_profiles.proposal_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.sponsor_profiles.id_proof_path)
    returning * into v_profile;

  elsif p_registration_type = 'talent_analytics' then
    v_display_name := p_fields->>'fullName';
    insert into public.talent_analytics_profiles (
      user_id, full_name, role, tools_used, experience_years,
      sports_specialization, location, portfolio_report_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'toolsUsed',
      nullif(p_fields->>'experienceYears', '')::integer, p_fields->>'sportsSpecialization',
      p_fields->>'location', p_fields->>'uploadPortfolioReport'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      tools_used = excluded.tools_used,
      experience_years = excluded.experience_years,
      sports_specialization = excluded.sports_specialization,
      location = excluded.location,
      portfolio_report_path = coalesce(excluded.portfolio_report_path, public.talent_analytics_profiles.portfolio_report_path)
    returning * into v_profile;
  end if;

  -- registrations: common tracking row, same transaction as the profile
  -- upsert above -- a failure past this point rolls the profile write
  -- back too, so a profile can never exist without its tracking row.
  insert into public.registrations (
    user_id, sportfo_user_id, registration_type, profile_id, display_name,
    status, registered_at
  ) values (
    v_user_id,
    (select id from public.sportfo_users where user_id = v_user_id),
    p_registration_type,
    v_profile.id,
    v_display_name,
    p_status,
    case when p_status = 'submitted' then now() else null end
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

  -- Backfill the profile row's registration_id now that we have it. Only
  -- ever null->set on first insert in practice (later saves already carry
  -- it), written per-branch since each targets a different table.
  if p_registration_type = 'academy_coach_parent' then
    update public.academy_coach_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'performance_expert' then
    update public.performance_expert_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'media_creator' then
    update public.creator_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'management_legal' then
    update public.management_legal_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'event_operations' then
    update public.event_staff_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'sponsor_csr' then
    update public.sponsor_profiles set registration_id = v_registration.id where id = v_profile.id;
  elsif p_registration_type = 'talent_analytics' then
    update public.talent_analytics_profiles set registration_id = v_registration.id where id = v_profile.id;
  end if;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'registration', to_jsonb(v_registration)
  );
end;
$$;

revoke all on function public.save_role_registration(text, text, jsonb) from public;
grant execute on function public.save_role_registration(text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- get_own_role_registration: pre-fill support for GenericCategoryForm,
-- mirroring loadAthleteDraft's role for the Athlete flow. Returns the
-- caller's own previously-saved fields (camelCase keys matching the form)
-- plus status, or null if nothing has been saved yet for that category.
-- ---------------------------------------------------------------------------
create or replace function public.get_own_role_registration(p_registration_type text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_status text;
  v_fields jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select status into v_status
  from public.registrations
  where user_id = v_user_id and registration_type = p_registration_type;

  if not found then
    return null;
  end if;

  if p_registration_type = 'academy_coach_parent' then
    select jsonb_build_object(
      'academyCoachName', academy_coach_name, 'sportsOffered', sports_offered,
      'ageGroupsTrained', age_groups_trained, 'coachCertification', coach_certification,
      'experienceLevel', experience_level, 'location', location,
      'uploadAcademyInfo', academy_info_path, 'uploadIdProof', id_proof_path
    ) into v_fields from public.academy_coach_profiles where user_id = v_user_id;
  elsif p_registration_type = 'performance_expert' then
    select jsonb_build_object(
      'fullName', full_name, 'expertise', expertise, 'experienceLevel', experience_level,
      'servicesOffered', services_offered, 'certifications', certifications, 'location', location,
      'uploadCertificate', certificate_path, 'uploadIdProof', id_proof_path
    ) into v_fields from public.performance_expert_profiles where user_id = v_user_id;
  elsif p_registration_type = 'media_creator' then
    select jsonb_build_object(
      'fullName', full_name, 'portfolioLink', portfolio_link, 'contentType', content_type,
      'socialMediaHandles', social_media_handles, 'location', location,
      'uploadPortfolio', portfolio_path
    ) into v_fields from public.creator_profiles where user_id = v_user_id;
  elsif p_registration_type = 'management_legal' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'licenseNumber', license_number,
      'organization', organization, 'experienceLevel', experience_level, 'location', location,
      'uploadLicense', license_path, 'uploadIdProof', id_proof_path
    ) into v_fields from public.management_legal_profiles where user_id = v_user_id;
  elsif p_registration_type = 'event_operations' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'certification', certification,
      'experienceYears', experience_years, 'availability', availability, 'location', location,
      'uploadIdProof', id_proof_path
    ) into v_fields from public.event_staff_profiles where user_id = v_user_id;
  elsif p_registration_type = 'sponsor_csr' then
    select jsonb_build_object(
      'organizationName', organization_name, 'contactPerson', contact_person,
      'sponsorshipInterest', to_jsonb(coalesce(sponsorship_interest, array[]::text[])),
      'budgetRange', budget_range, 'sportsFocus', sports_focus, 'location', location,
      'uploadProposal', proposal_path, 'uploadIdProof', id_proof_path
    ) into v_fields from public.sponsor_profiles where user_id = v_user_id;
  elsif p_registration_type = 'talent_analytics' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'toolsUsed', tools_used,
      'experienceYears', experience_years, 'sportsSpecialization', sports_specialization,
      'location', location, 'uploadPortfolioReport', portfolio_report_path
    ) into v_fields from public.talent_analytics_profiles where user_id = v_user_id;
  else
    raise exception 'Unsupported registration_type: %', p_registration_type;
  end if;

  return jsonb_build_object('status', v_status, 'fields', coalesce(v_fields, '{}'::jsonb));
end;
$$;

revoke all on function public.get_own_role_registration(text) from public;
grant execute on function public.get_own_role_registration(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin authorization + read RPCs.
--
-- is_current_user_admin is SECURITY DEFINER (needs to read sportfo_users.
-- is_admin regardless of the owner-only SELECT policy) but the admin_*
-- RPCs below are also all SECURITY DEFINER themselves and each re-checks
-- is_current_user_admin() internally as their very first statement --
-- never trusting that a client only reached them because a page-level
-- check passed. None of them ever select phone/email/document paths.
-- ---------------------------------------------------------------------------
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select is_admin from public.sportfo_users where user_id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

-- All KPI/trend day-boundaries are computed in Asia/Kolkata, not server
-- UTC or the browser's local timezone -- SportFo is an India-focused
-- product, so "Today"/"This Week" etc. should mean the same wall-clock day
-- for every admin regardless of where the dashboard happens to be opened.
create or replace function public.admin_registration_kpis()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_tz constant text := 'Asia/Kolkata';
  v_now constant timestamptz := now();
  v_today_start timestamptz := date_trunc('day', v_now at time zone v_tz) at time zone v_tz;
  v_week_start timestamptz := date_trunc('week', v_now at time zone v_tz) at time zone v_tz;
  v_month_start timestamptz := date_trunc('month', v_now at time zone v_tz) at time zone v_tz;
  v_year_start timestamptz := date_trunc('year', v_now at time zone v_tz) at time zone v_tz;
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  return jsonb_build_object(
    'today', (select count(*) from public.registrations where registered_at >= v_today_start),
    'week', (select count(*) from public.registrations where registered_at >= v_week_start),
    'month', (select count(*) from public.registrations where registered_at >= v_month_start),
    'year', (select count(*) from public.registrations where registered_at >= v_year_start)
  );
end;
$$;

revoke all on function public.admin_registration_kpis() from public;
grant execute on function public.admin_registration_kpis() to authenticated;

-- Daily registration counts for the trend chart, inclusive of both
-- endpoints, bucketed by Asia/Kolkata calendar day (see admin_registration_
-- kpis for why). p_from/p_to are plain dates -- the caller decides the
-- range (Today/Last 7 Days/This Month/This Year/custom).
create or replace function public.admin_registration_trend(p_from date, p_to date)
returns table (day date, registrations bigint)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  if p_to < p_from or p_to - p_from > 366 then
    raise exception 'Invalid trend range';
  end if;

  return query
  select gs.day, count(r.id)
  from generate_series(p_from, p_to, interval '1 day') as gs(day)
  left join public.registrations r
    on (r.registered_at at time zone 'Asia/Kolkata')::date = gs.day::date
  group by gs.day
  order by gs.day;
end;
$$;

revoke all on function public.admin_registration_trend(date, date) from public;
grant execute on function public.admin_registration_trend(date, date) to authenticated;

-- Totals by category, optionally scoped to a date range. No mock values --
-- every number is a live count from `registrations`.
create or replace function public.admin_category_breakdown(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (registration_type text, registrations bigint)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select r.registration_type, count(*)
  from public.registrations r
  where r.registered_at is not null
    and (p_from is null or r.registered_at >= p_from)
    and (p_to is null or r.registered_at < p_to)
  group by r.registration_type
  order by count(*) desc;
end;
$$;

revoke all on function public.admin_category_breakdown(timestamptz, timestamptz) from public;
grant execute on function public.admin_category_breakdown(timestamptz, timestamptz) to authenticated;

-- Paginated registration listing for the admin table. Deliberately narrow
-- column set (sportfo_id, display_name, category, status, registered_at)
-- -- never phone, private email, or document paths.
create or replace function public.admin_list_registrations(
  p_category text default null,
  p_status text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_total bigint;
  v_rows jsonb;
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 100);
  v_offset integer;
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.registrations r
  where (p_category is null or r.registration_type = p_category)
    and (p_status is null or r.status = p_status)
    and (p_from is null or r.registered_at >= p_from)
    and (p_to is null or r.registered_at < p_to);

  select coalesce(jsonb_agg(row_data), '[]'::jsonb) into v_rows
  from (
    select jsonb_build_object(
      'id', r.id,
      'sportfo_id', su.sportfo_id,
      'display_name', r.display_name,
      'registration_type', r.registration_type,
      'status', r.status,
      'registered_at', r.registered_at
    ) as row_data
    from public.registrations r
    left join public.sportfo_users su on su.id = r.sportfo_user_id
    where (p_category is null or r.registration_type = p_category)
      and (p_status is null or r.status = p_status)
      and (p_from is null or r.registered_at >= p_from)
      and (p_to is null or r.registered_at < p_to)
    order by r.registered_at desc nulls last, r.created_at desc
    limit v_page_size offset v_offset
  ) paged;

  return jsonb_build_object('total', v_total, 'page', v_page, 'page_size', v_page_size, 'rows', v_rows);
end;
$$;

revoke all on function public.admin_list_registrations(text, text, timestamptz, timestamptz, integer, integer) from public;
grant execute on function public.admin_list_registrations(text, text, timestamptz, timestamptz, integer, integer) to authenticated;
