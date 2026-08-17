create table public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  gender text,
  dob date,
  nationality text,
  address text,
  city text,
  state text,
  pincode text,
  contact_number text,
  email text,
  school text,
  club text,
  coach text,

  primary_sports text[] not null default '{}',
  sub_category text,
  position text,
  skill_level text,

  achievements jsonb not null default '[]',
  awards text,
  scholarship_recipient text,

  profile_strength smallint,
  verified boolean not null default false
);

alter table public.athlete_profiles enable row level security;

create policy "anon can insert athlete profiles"
  on public.athlete_profiles
  for insert
  to anon
  with check (true);

create policy "anon can view athlete profiles"
  on public.athlete_profiles
  for select
  to anon
  using (true);;
