-- Common registration tracking (analytics/history) shared across all 8
-- SportFo registration categories, the 7 non-Athlete role-specific profile
-- tables, the admin privilege flag needed to gate the new analytics
-- dashboard, and a shared private storage bucket for their document
-- uploads. Athlete's own tables (athlete_profiles/athlete_sports/
-- athlete_achievements) and its athlete-achievements bucket are untouched.

-- ---------------------------------------------------------------------------
-- sportfo_users.is_admin
--
-- Account-level privilege flag, not a role/profile concept -- lives on the
-- one-row-per-account identity table, same reasoning as sportfo_id itself.
-- No INSERT/UPDATE policy is ever granted on this table to `authenticated`
-- (only the pre-existing owner-only SELECT policy), so there is no
-- client-reachable write path to this column at all -- the only way to
-- become an admin is a direct database change (Supabase SQL editor /
-- service role). That is what makes is_current_user_admin() a real
-- authorization boundary rather than client-trusted state.
-- ---------------------------------------------------------------------------
alter table public.sportfo_users
  add column if not exists is_admin boolean not null default false;

comment on column public.sportfo_users.is_admin is
  'Grants access to /admin/dashboard. No client-reachable write path exists for this column -- settable only via direct DB access.';

-- ---------------------------------------------------------------------------
-- registrations
--
-- One row per (account, category): common tracking for analytics,
-- registration history, and status -- never category-specific form fields
-- (those live on the role-specific profile tables below). profile_id
-- points at the relevant role table's row but, because Postgres has no
-- native polymorphic foreign key, is not itself FK-constrained; integrity
-- for it is the responsibility of the transactional RPCs that write both
-- rows together (save_athlete_registration, save_role_registration).
-- ---------------------------------------------------------------------------
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sportfo_user_id uuid references public.sportfo_users (id) on delete set null,

  registration_type text not null check (registration_type in (
    'athlete', 'academy_coach_parent', 'performance_expert', 'media_creator',
    'management_legal', 'event_operations', 'sponsor_csr', 'talent_analytics'
  )),
  profile_id uuid not null,

  -- A short, common display label (the name/org the visitor entered) --
  -- lets the admin dashboard list registrations without joining across 8
  -- differently-shaped profile tables for every row. Never a substitute
  -- for the full profile record, and never phone/email/document paths.
  display_name text,

  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'verified', 'rejected')),

  -- Set once, the first time status becomes 'submitted' -- stays null for
  -- a draft-only registration and never moves after that first submit.
  -- Authoritative timestamp for every dashboard KPI/trend query.
  registered_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, registration_type)
);

comment on table public.registrations is
  'Common cross-category registration tracking (analytics/history/status). Category-specific form fields live on the role-specific profile tables, never here.';
comment on column public.registrations.profile_id is
  'Points at the row in the relevant role-specific profile table (see registration_type). Not FK-constrained -- Postgres has no polymorphic FK; integrity is enforced by the transactional RPCs that write both together.';
comment on column public.registrations.registered_at is
  'Set once, the first time status becomes ''submitted''. Null for a draft-only registration.';

create index registrations_registered_at_idx on public.registrations (registered_at);
create index registrations_registration_type_idx on public.registrations (registration_type);
create index registrations_status_idx on public.registrations (status);
-- Serves the admin dashboard's most common query shape (filter by category
-- and/or status, ordered by recency) with one index instead of three
-- separate single-column scans.
create index registrations_type_status_registered_at_idx
  on public.registrations (registration_type, status, registered_at desc);

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;

-- Owners can read their own registration history directly. Writes happen
-- through the transactional RPCs (security invoker, so these same
-- policies are what authorizes them), same pattern as athlete_profiles.
create policy "Users can view own registrations"
  on public.registrations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own registrations"
  on public.registrations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own registrations"
  on public.registrations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Role-specific profile tables (the 7 non-Athlete categories).
--
-- Same shape as athlete_profiles' ownership model: one row per account
-- (unique user_id), owner-only RLS. No profile_status column here --
-- registrations.status is the single source of truth for draft/submitted/
-- verified/rejected; these tables only ever hold the last-submitted field
-- values. registration_id is the real FK back to the tracking row
-- (nullable/on delete set null so a tracking-row issue can never cascade
-- into silently deleting someone's submitted profile data).
-- ---------------------------------------------------------------------------

create table public.academy_coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  academy_coach_name text,
  sports_offered text,
  age_groups_trained text,
  coach_certification text,
  experience_level text,
  location text,
  academy_info_path text,
  id_proof_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.academy_coach_profiles is 'Role-specific profile for the Academies, Coaches & Parents registration category.';

create table public.performance_expert_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  full_name text,
  expertise text,
  experience_level text,
  services_offered text,
  certifications text,
  location text,
  certificate_path text,
  id_proof_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.performance_expert_profiles is 'Role-specific profile for the Performance Experts registration category.';

create table public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  full_name text,
  portfolio_link text,
  content_type text,
  social_media_handles text,
  location text,
  portfolio_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.creator_profiles is 'Role-specific profile for the Media & Creators registration category.';

create table public.management_legal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  full_name text,
  role text,
  license_number text,
  organization text,
  experience_level text,
  location text,
  license_path text,
  id_proof_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.management_legal_profiles is 'Role-specific profile for the Sports Management & Legal registration category.';

create table public.event_staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  full_name text,
  role text,
  certification text,
  experience_years integer,
  availability text,
  location text,
  id_proof_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.event_staff_profiles is 'Role-specific profile for the Event & Operations Staff registration category.';

create table public.sponsor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  organization_name text,
  contact_person text,
  sponsorship_interest text[],
  budget_range text,
  sports_focus text,
  location text,
  proposal_path text,
  id_proof_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.sponsor_profiles is 'Role-specific profile for the Sponsors & CSR registration category.';

create table public.talent_analytics_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid unique references public.registrations (id) on delete set null,
  full_name text,
  role text,
  tools_used text,
  experience_years integer,
  sports_specialization text,
  location text,
  portfolio_report_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
comment on table public.talent_analytics_profiles is 'Role-specific profile for the Talent Discovery & Analytics registration category.';

-- Triggers + RLS: identical owner-only pattern for all 7 tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'academy_coach_profiles', 'performance_expert_profiles', 'creator_profiles',
    'management_legal_profiles', 'event_staff_profiles', 'sponsor_profiles',
    'talent_analytics_profiles'
  ]
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on public.%I;', t, t
    );
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t, t
    );
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy "Users can view own profile" on public.%I for select to authenticated using (auth.uid() = user_id);',
      t
    );
    execute format(
      'create policy "Users can insert own profile" on public.%I for insert to authenticated with check (auth.uid() = user_id);',
      t
    );
    execute format(
      'create policy "Users can update own profile" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Shared storage bucket for the 7 categories' document uploads (ID proofs,
-- certificates, portfolios, proposals). Same private-bucket, owner-scoped
-- pattern as the existing athlete-achievements bucket. Path convention:
-- {user_id}/{registration_type}/{field_id}-{timestamp}.{ext}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'role-registration-uploads',
  'role-registration-uploads',
  false,
  10485760, -- 10 MB, matches src/lib/file-validation.ts
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "Users can upload own role registration documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'role-registration-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own role registration documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'role-registration-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own role registration documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'role-registration-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'role-registration-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own role registration documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'role-registration-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
