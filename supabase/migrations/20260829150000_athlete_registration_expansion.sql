-- Expands Athlete registration with Employment, Apparel & Logistics, and
-- Profile Setup sections, upgrades Sports Information (competition level,
-- support needed) and Achievements (certificate level, admin-only
-- verification status), and adds a reusable public profile-photo path to
-- every one of the 8 registration categories.
--
-- All new columns are nullable, additive, no backfill -- existing
-- athlete_profiles/athlete_sports/athlete_achievements rows and all 7 role
-- profile tables remain valid exactly as they are.
--
-- Note on athlete_sports.competition_level: an earlier, never-applied
-- migration file in this repo (20260825120000_athlete_competition_level_
-- and_track.sql) also introduced a `competition_level` column, but its
-- accompanying get_public_athlete_profile rewrite silently dropped
-- sport_category from the public RPC's return columns -- a real
-- regression against the live, working RPC. That file is left untouched
-- (never edit old migration history) but is NOT applied here; this
-- migration adds the same competition_level concept correctly, preserving
-- sport_category, and does not add that file's unrelated parallel_track
-- column (out of this task's scope).

-- ---------------------------------------------------------------------------
-- 1. athlete_sports: competition level + support needed
-- ---------------------------------------------------------------------------
alter table public.athlete_sports
  add column if not exists competition_level text
    check (competition_level in ('taluk', 'district', 'division', 'state', 'national')),
  add column if not exists support_needed text[],
  add column if not exists support_needed_other text;

comment on column public.athlete_sports.competition_level is
  'Highest competition level the athlete has achieved/participated at for this sport.';
comment on column public.athlete_sports.support_needed is
  'Multi-select: the kinds of support the athlete is looking for (coaching, nutrition, sponsorship, etc).';
comment on column public.athlete_sports.support_needed_other is
  'Free-text detail when support_needed includes "Other".';

-- ---------------------------------------------------------------------------
-- 2. athlete_achievements: certificate level + admin-only verification status
-- ---------------------------------------------------------------------------
alter table public.athlete_achievements
  add column if not exists certificate_level text
    check (certificate_level in ('taluk', 'district', 'division', 'state', 'national', 'international')),
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected'));

comment on column public.athlete_achievements.certificate_level is
  'The competition tier this specific achievement/certificate was earned at.';
comment on column public.athlete_achievements.verification_status is
  'Admin-controlled only. Always "pending" on insert; only an admin (via a
   SECURITY DEFINER RPC gated on is_current_user_admin()) may move it to
   verified/rejected. The athlete has read-only visibility -- direct client
   UPDATE of this column is explicitly revoked below, independent of the
   existing row-level "Athletes can update own achievements" policy, which
   still allows them to edit every other column on their own rows.';

-- Column-level privilege, not a row-level policy -- RLS says "you may
-- UPDATE rows you own", this says "...but never this one column", and
-- both must pass. A SECURITY DEFINER function (like the admin RPC added
-- below) executes as its owner and is unaffected by this REVOKE.
revoke update (verification_status) on public.athlete_achievements from authenticated, anon;

-- Secured admin path to actually change a status -- no admin review UI is
-- built in this pass (explicitly out of scope per task); this makes the
-- capability exist safely, ready for a future admin screen to call.
create or replace function public.admin_set_achievement_verification_status(
  p_achievement_id uuid,
  p_status text
)
returns public.athlete_achievements
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.athlete_achievements;
begin
  if not public.is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  if p_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Invalid verification_status: %', p_status;
  end if;

  update public.athlete_achievements
  set verification_status = p_status
  where id = p_achievement_id
  returning * into v_row;

  if not found then
    raise exception 'Achievement not found: %', p_achievement_id;
  end if;

  return v_row;
end;
$function$;

revoke all on function public.admin_set_achievement_verification_status(uuid, text) from public;
grant execute on function public.admin_set_achievement_verification_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. athlete_profiles: Employment, Apparel & Logistics, Profile Setup
-- ---------------------------------------------------------------------------
alter table public.athlete_profiles
  add column if not exists employment_type text
    check (employment_type in (
      'full-time', 'part-time', 'freelance', 'internship', 'self-employed',
      'student', 'unemployed'
    )),
  add column if not exists organization text,
  add column if not exists job_title text,
  add column if not exists years_experience text
    check (years_experience in ('0-1', '2-3', '4-6', '7-10', '10+')),
  add column if not exists track_suit_size text
    check (track_suit_size in ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  add column if not exists tshirt_size text
    check (tshirt_size in ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  add column if not exists shorts_size text
    check (shorts_size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  add column if not exists shoe_size text
    check (shoe_size in ('4', '5', '6', '7', '8', '9', '10', '11', '12', '13')),
  add column if not exists short_bio text,
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists other_url text,
  add column if not exists profile_photo_path text;

comment on column public.athlete_profiles.employment_type is 'Employment section -- private, never on any public RPC.';
comment on column public.athlete_profiles.short_bio is 'Profile Setup bio -- public-eligible when the profile itself is public.';
comment on column public.athlete_profiles.profile_photo_path is
  'Path in the public "profile-photos" storage bucket. Public-readable by design (matches an avatar-style bucket), but never linked/shown anywhere until the athlete chooses to make their profile public via set_athlete_profile_visibility -- same visibility model as the rest of the public profile.';

-- ---------------------------------------------------------------------------
-- 4. profile_photo_path on all 7 non-Athlete role profile tables -- same
-- reusable public bucket, so every one of the 8 SportFo registration
-- categories can carry a profile photo / organization logo.
-- ---------------------------------------------------------------------------
alter table public.academy_coach_profiles add column if not exists profile_photo_path text;
alter table public.performance_expert_profiles add column if not exists profile_photo_path text;
alter table public.creator_profiles add column if not exists profile_photo_path text;
alter table public.management_legal_profiles add column if not exists profile_photo_path text;
alter table public.event_staff_profiles add column if not exists profile_photo_path text;
alter table public.sponsor_profiles add column if not exists profile_photo_path text;
alter table public.talent_analytics_profiles add column if not exists profile_photo_path text;

-- ---------------------------------------------------------------------------
-- 5. Public "profile-photos" storage bucket -- one reusable bucket for all
-- 8 categories' profile photo / organization logo, kept entirely separate
-- from the private athlete-achievements / role-registration-uploads
-- buckets (ID proofs, licenses, proposals, certificates stay private).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone can view profile photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'profile-photos');

create policy "Users can upload own profile photo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own profile photo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own profile photo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 6. save_athlete_registration: extend with the new Sports/Achievements/
-- Employment/Apparel/Profile Setup parameters. Same lesson as the previous
-- migration in this repo -- adding parameters via CREATE OR REPLACE
-- creates a second overload instead of truly replacing the function, so
-- the old 23-parameter signature is dropped explicitly at the end.
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
  p_achievements jsonb default '[]'::jsonb,
  p_preferred_language text default null,
  p_emergency_contact text default null,
  p_aadhaar_or_govt_id text default null,
  p_competition_level text default null,
  p_support_needed text[] default null,
  p_support_needed_other text default null,
  p_employment_type text default null,
  p_organization text default null,
  p_job_title text default null,
  p_years_experience text default null,
  p_track_suit_size text default null,
  p_tshirt_size text default null,
  p_shorts_size text default null,
  p_shoe_size text default null,
  p_short_bio text default null,
  p_instagram_url text default null,
  p_facebook_url text default null,
  p_other_url text default null,
  p_profile_photo_path text default null
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
        certificate_level = v_achievement->>'certificate_level',
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
        athlete_profile_id, title, achievement_type, certificate_level,
        issuing_organization, achievement_date, description
      ) values (
        v_profile.id,
        v_achievement->>'title',
        v_achievement->>'achievement_type',
        v_achievement->>'certificate_level',
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

drop function if exists public.save_athlete_registration(
  text, text, date, text, text, text, text, text, text, text, text, text,
  text, boolean, text, text, text, text, text, jsonb, text, text, text
);

-- ---------------------------------------------------------------------------
-- 7. save_role_registration: same signature (p_registration_type, p_status,
-- p_fields) -- profile_photo_path flows through p_fields->>'profilePhoto'
-- exactly like every other upload field already does, so this is a plain
-- CREATE OR REPLACE with no overload risk. Adds profile_photo_path to all
-- 7 branches' insert/on-conflict-update, same coalesce(new, existing)
-- pattern the other upload-path columns already use.
-- ---------------------------------------------------------------------------
create or replace function public.save_role_registration(p_registration_type text, p_status text, p_fields jsonb)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
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
      academy_info_path, id_proof_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'sportsOffered', p_fields->>'ageGroupsTrained',
      p_fields->>'coachCertification', p_fields->>'experienceLevel', p_fields->>'location',
      p_fields->>'uploadAcademyInfo', p_fields->>'uploadIdProof', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      academy_coach_name = excluded.academy_coach_name,
      sports_offered = excluded.sports_offered,
      age_groups_trained = excluded.age_groups_trained,
      coach_certification = excluded.coach_certification,
      experience_level = excluded.experience_level,
      location = excluded.location,
      academy_info_path = coalesce(excluded.academy_info_path, public.academy_coach_profiles.academy_info_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.academy_coach_profiles.id_proof_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.academy_coach_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'performance_expert' then
    v_display_name := p_fields->>'fullName';
    insert into public.performance_expert_profiles (
      user_id, full_name, expertise, experience_level, services_offered,
      certifications, location, certificate_path, id_proof_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'expertise', p_fields->>'experienceLevel',
      p_fields->>'servicesOffered', p_fields->>'certifications', p_fields->>'location',
      p_fields->>'uploadCertificate', p_fields->>'uploadIdProof', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      expertise = excluded.expertise,
      experience_level = excluded.experience_level,
      services_offered = excluded.services_offered,
      certifications = excluded.certifications,
      location = excluded.location,
      certificate_path = coalesce(excluded.certificate_path, public.performance_expert_profiles.certificate_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.performance_expert_profiles.id_proof_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.performance_expert_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'media_creator' then
    v_display_name := p_fields->>'fullName';
    insert into public.creator_profiles (
      user_id, full_name, portfolio_link, content_type, social_media_handles,
      location, portfolio_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'portfolioLink', p_fields->>'contentType',
      p_fields->>'socialMediaHandles', p_fields->>'location', p_fields->>'uploadPortfolio',
      p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      portfolio_link = excluded.portfolio_link,
      content_type = excluded.content_type,
      social_media_handles = excluded.social_media_handles,
      location = excluded.location,
      portfolio_path = coalesce(excluded.portfolio_path, public.creator_profiles.portfolio_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.creator_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'management_legal' then
    v_display_name := p_fields->>'fullName';
    insert into public.management_legal_profiles (
      user_id, full_name, role, license_number, organization, experience_level,
      location, license_path, id_proof_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'licenseNumber',
      p_fields->>'organization', p_fields->>'experienceLevel', p_fields->>'location',
      p_fields->>'uploadLicense', p_fields->>'uploadIdProof', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      license_number = excluded.license_number,
      organization = excluded.organization,
      experience_level = excluded.experience_level,
      location = excluded.location,
      license_path = coalesce(excluded.license_path, public.management_legal_profiles.license_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.management_legal_profiles.id_proof_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.management_legal_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'event_operations' then
    v_display_name := p_fields->>'fullName';
    insert into public.event_staff_profiles (
      user_id, full_name, role, certification, experience_years, availability,
      location, id_proof_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'certification',
      nullif(p_fields->>'experienceYears', '')::integer, p_fields->>'availability',
      p_fields->>'location', p_fields->>'uploadIdProof', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      certification = excluded.certification,
      experience_years = excluded.experience_years,
      availability = excluded.availability,
      location = excluded.location,
      id_proof_path = coalesce(excluded.id_proof_path, public.event_staff_profiles.id_proof_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.event_staff_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'sponsor_csr' then
    v_display_name := p_fields->>'organizationName';
    insert into public.sponsor_profiles (
      user_id, organization_name, contact_person, sponsorship_interest,
      budget_range, sports_focus, location, proposal_path, id_proof_path,
      profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'contactPerson',
      case when p_fields ? 'sponsorshipInterest'
        then array(select jsonb_array_elements_text(p_fields->'sponsorshipInterest'))
        else null
      end,
      p_fields->>'budgetRange', p_fields->>'sportsFocus', p_fields->>'location',
      p_fields->>'uploadProposal', p_fields->>'uploadIdProof', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      organization_name = excluded.organization_name,
      contact_person = excluded.contact_person,
      sponsorship_interest = excluded.sponsorship_interest,
      budget_range = excluded.budget_range,
      sports_focus = excluded.sports_focus,
      location = excluded.location,
      proposal_path = coalesce(excluded.proposal_path, public.sponsor_profiles.proposal_path),
      id_proof_path = coalesce(excluded.id_proof_path, public.sponsor_profiles.id_proof_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.sponsor_profiles.profile_photo_path)
    returning * into v_profile;

  elsif p_registration_type = 'talent_analytics' then
    v_display_name := p_fields->>'fullName';
    insert into public.talent_analytics_profiles (
      user_id, full_name, role, tools_used, experience_years,
      sports_specialization, location, portfolio_report_path, profile_photo_path
    ) values (
      v_user_id, v_display_name, p_fields->>'role', p_fields->>'toolsUsed',
      nullif(p_fields->>'experienceYears', '')::integer, p_fields->>'sportsSpecialization',
      p_fields->>'location', p_fields->>'uploadPortfolioReport', p_fields->>'profilePhoto'
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      role = excluded.role,
      tools_used = excluded.tools_used,
      experience_years = excluded.experience_years,
      sports_specialization = excluded.sports_specialization,
      location = excluded.location,
      portfolio_report_path = coalesce(excluded.portfolio_report_path, public.talent_analytics_profiles.portfolio_report_path),
      profile_photo_path = coalesce(excluded.profile_photo_path, public.talent_analytics_profiles.profile_photo_path)
    returning * into v_profile;
  end if;

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
$function$;

-- ---------------------------------------------------------------------------
-- 8. get_own_role_registration: expose profile_photo_path back to the
-- form's own pre-fill (same "return whatever this account already saved"
-- contract as every other field it already returns) for all 7 branches.
-- ---------------------------------------------------------------------------
create or replace function public.get_own_role_registration(p_registration_type text)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
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
      'uploadAcademyInfo', academy_info_path, 'uploadIdProof', id_proof_path,
      'profilePhoto', profile_photo_path
    ) into v_fields from public.academy_coach_profiles where user_id = v_user_id;
  elsif p_registration_type = 'performance_expert' then
    select jsonb_build_object(
      'fullName', full_name, 'expertise', expertise, 'experienceLevel', experience_level,
      'servicesOffered', services_offered, 'certifications', certifications, 'location', location,
      'uploadCertificate', certificate_path, 'uploadIdProof', id_proof_path,
      'profilePhoto', profile_photo_path
    ) into v_fields from public.performance_expert_profiles where user_id = v_user_id;
  elsif p_registration_type = 'media_creator' then
    select jsonb_build_object(
      'fullName', full_name, 'portfolioLink', portfolio_link, 'contentType', content_type,
      'socialMediaHandles', social_media_handles, 'location', location,
      'uploadPortfolio', portfolio_path, 'profilePhoto', profile_photo_path
    ) into v_fields from public.creator_profiles where user_id = v_user_id;
  elsif p_registration_type = 'management_legal' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'licenseNumber', license_number,
      'organization', organization, 'experienceLevel', experience_level, 'location', location,
      'uploadLicense', license_path, 'uploadIdProof', id_proof_path,
      'profilePhoto', profile_photo_path
    ) into v_fields from public.management_legal_profiles where user_id = v_user_id;
  elsif p_registration_type = 'event_operations' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'certification', certification,
      'experienceYears', experience_years, 'availability', availability, 'location', location,
      'uploadIdProof', id_proof_path, 'profilePhoto', profile_photo_path
    ) into v_fields from public.event_staff_profiles where user_id = v_user_id;
  elsif p_registration_type = 'sponsor_csr' then
    select jsonb_build_object(
      'organizationName', organization_name, 'contactPerson', contact_person,
      'sponsorshipInterest', to_jsonb(coalesce(sponsorship_interest, array[]::text[])),
      'budgetRange', budget_range, 'sportsFocus', sports_focus, 'location', location,
      'uploadProposal', proposal_path, 'uploadIdProof', id_proof_path,
      'profilePhoto', profile_photo_path
    ) into v_fields from public.sponsor_profiles where user_id = v_user_id;
  elsif p_registration_type = 'talent_analytics' then
    select jsonb_build_object(
      'fullName', full_name, 'role', role, 'toolsUsed', tools_used,
      'experienceYears', experience_years, 'sportsSpecialization', sports_specialization,
      'location', location, 'uploadPortfolioReport', portfolio_report_path,
      'profilePhoto', profile_photo_path
    ) into v_fields from public.talent_analytics_profiles where user_id = v_user_id;
  else
    raise exception 'Unsupported registration_type: %', p_registration_type;
  end if;

  return jsonb_build_object('status', v_status, 'fields', coalesce(v_fields, '{}'::jsonb));
end;
$function$;

-- ---------------------------------------------------------------------------
-- 9. Public profile RPCs: add the newly-public-eligible fields
-- (competition_level, profile_photo_path, short_bio, social links) while
-- preserving every column already returned today (sport_category
-- included). Employment/apparel/Aadhaar/emergency contact are
-- deliberately NOT added -- they stay private.
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
  other_url text
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
    p.other_url
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

-- get_public_athlete_achievements: add certificate_level and
-- verification_status -- neither is sensitive (no PII, no document
-- content), and a "Verified" badge on a public certificate is exactly the
-- kind of trust signal a public profile should be able to show.
-- has_document stays boolean-only; document_path itself is never exposed.
drop function if exists public.get_public_athlete_achievements(text);

create function public.get_public_athlete_achievements(p_slug text)
returns table (
  title text,
  achievement_type text,
  certificate_level text,
  verification_status text,
  issuing_organization text,
  achievement_date date,
  description text,
  has_document boolean
)
language sql
stable security definer
set search_path to ''
as $function$
  select
    a.title,
    a.achievement_type,
    a.certificate_level,
    a.verification_status,
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
$function$;

revoke all on function public.get_public_athlete_achievements(text) from public;
grant execute on function public.get_public_athlete_achievements(text) to anon, authenticated;

-- search_public_athletes: add competition_level + profile_photo_path so
-- the Discover Athletes grid can show a real avatar and the same
-- competition-level filter/display the individual profile page now has.
drop function if exists public.search_public_athletes(text, text, text, text, text, integer, integer);

create or replace function public.search_public_athletes(
  p_query text default null,
  p_sport text default null,
  p_country text default null,
  p_city text default null,
  p_skill_level text default null,
  p_competition_level text default null,
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
      p.country,
      p.city,
      p.nationality,
      p.profile_photo_path
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
            'country', paged.country,
            'city', paged.city,
            'nationality', paged.nationality,
            'achievement_count', paged.achievement_count,
            'profile_photo_path', paged.profile_photo_path
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

revoke all on function public.search_public_athletes(text, text, text, text, text, text, integer, integer) from public;
grant execute on function public.search_public_athletes(text, text, text, text, text, text, integer, integer) to anon, authenticated;
