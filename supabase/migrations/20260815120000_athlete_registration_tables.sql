-- Athlete registration schema: athlete_profiles, athlete_sports, athlete_achievements.
--
-- Ownership model: every athlete-owned table traces back to a Supabase
-- auth.users row via athlete_profiles.user_id. Child tables (athlete_sports,
-- athlete_achievements) reference athlete_profiles rather than storing their
-- own user_id, so ownership is always validated through the parent profile
-- (see the RLS migration).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- athlete_profiles
--
-- One row per registered athlete, one-to-one with auth.users. Personal-detail
-- columns are nullable: "Save Draft" must be able to persist a partially
-- filled form, so required-ness is enforced by the application layer (React
-- Hook Form today, mirrored server-side when the submission flow is built)
-- rather than by NOT NULL constraints here. profile_status is the only
-- workflow signal the database needs to know about.
-- ---------------------------------------------------------------------------
create table if not exists public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,

  full_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  nationality text,
  country text,
  city text,
  mobile_number text,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  school_college text,
  club_academy text,
  coach_mentor text,

  awards_recognition text,
  scholarship_recipient boolean,

  profile_status text not null default 'draft'
    check (profile_status in ('draft', 'submitted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_profiles is
  'One primary registration/profile record per authenticated athlete (auth.users 1:1).';
comment on column public.athlete_profiles.user_id is
  'Owning auth.users id. Unique so each user has at most one athlete profile.';
comment on column public.athlete_profiles.profile_status is
  'draft = Save Draft, submitted = Create Athlete Profile.';

-- ---------------------------------------------------------------------------
-- athlete_sports
--
-- 1:N on athlete_profile_id by design, but the MVP only ever writes one row
-- per athlete. No uniqueness constraint is placed on athlete_profile_id so
-- that supporting multiple sports later is a pure application-layer change,
-- not a schema migration.
-- ---------------------------------------------------------------------------
create table if not exists public.athlete_sports (
  id uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null
    references public.athlete_profiles (id) on delete cascade,

  primary_sport text,
  sport_discipline text,
  position_role text,
  skill_level text
    check (skill_level in ('beginner', 'amateur', 'semi-professional', 'professional')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_sports is
  'Sports information for an athlete profile. One row today; schema supports many.';

create index if not exists athlete_sports_athlete_profile_id_idx
  on public.athlete_sports (athlete_profile_id);

-- ---------------------------------------------------------------------------
-- athlete_achievements
--
-- 1:N on athlete_profile_id. document_path stores only the Supabase Storage
-- object path (see the storage migration) -- never the file itself.
-- ---------------------------------------------------------------------------
create table if not exists public.athlete_achievements (
  id uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null
    references public.athlete_profiles (id) on delete cascade,

  title text,
  achievement_type text,
  issuing_organization text,
  achievement_date date,
  description text,
  document_path text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.athlete_achievements is
  'Optional achievements/certificates for an athlete profile.';
comment on column public.athlete_achievements.document_path is
  'Object path in the athlete-achievements storage bucket, not file contents.';

create index if not exists athlete_achievements_athlete_profile_id_idx
  on public.athlete_achievements (athlete_profile_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
--
-- Single trigger function reused by all three tables so updated_at is always
-- database-generated rather than trusted from the client.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists athlete_profiles_set_updated_at on public.athlete_profiles;
create trigger athlete_profiles_set_updated_at
  before update on public.athlete_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists athlete_sports_set_updated_at on public.athlete_sports;
create trigger athlete_sports_set_updated_at
  before update on public.athlete_sports
  for each row execute function public.set_updated_at();

drop trigger if exists athlete_achievements_set_updated_at on public.athlete_achievements;
create trigger athlete_achievements_set_updated_at
  before update on public.athlete_achievements
  for each row execute function public.set_updated_at();
