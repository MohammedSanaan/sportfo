-- Row Level Security for the athlete registration tables.
--
-- Current Supabase projects do not auto-expose newly created public-schema
-- tables to the anon/authenticated Data API roles (see
-- `auto_expose_new_tables` in supabase/config.toml) -- explicit GRANTs are
-- required in addition to RLS policies. GRANTs decide whether a role may
-- attempt an operation at all; RLS policies then decide which rows it can
-- see or touch. Only `authenticated` is granted access: athlete data is
-- never intended to be readable by anonymous requests.

alter table public.athlete_profiles enable row level security;
alter table public.athlete_sports enable row level security;
alter table public.athlete_achievements enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update on public.athlete_profiles to authenticated;
grant select, insert, update, delete on public.athlete_sports to authenticated;
grant select, insert, update, delete on public.athlete_achievements to authenticated;

-- ---------------------------------------------------------------------------
-- Shared ownership check for child tables.
--
-- athlete_sports and athlete_achievements don't carry their own user_id;
-- ownership is validated by joining back to athlete_profiles.user_id. This
-- is centralized in one function so every child-table policy uses the exact
-- same ownership rule instead of eight duplicated subqueries.
-- security invoker (the default) is used deliberately: the function only
-- ever sees rows the calling user's own RLS policies already allow, so no
-- privilege elevation is needed.
-- ---------------------------------------------------------------------------
create or replace function public.owns_athlete_profile(profile_id uuid)
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_profiles p
    where p.id = profile_id
      and p.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- athlete_profiles: read/insert/update own profile only. No delete policy
-- is created -- accounts are expected to be removed via auth.users deletion,
-- which cascades (see the previous migration), not by athletes deleting
-- their own profile row directly.
-- ---------------------------------------------------------------------------
create policy "Athletes can view own profile"
  on public.athlete_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Athletes can insert own profile"
  on public.athlete_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Athletes can update own profile"
  on public.athlete_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- athlete_sports: full CRUD scoped to rows under the athlete's own profile.
-- ---------------------------------------------------------------------------
create policy "Athletes can view own sports"
  on public.athlete_sports
  for select
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can insert own sports"
  on public.athlete_sports
  for insert
  to authenticated
  with check (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can update own sports"
  on public.athlete_sports
  for update
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id))
  with check (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can delete own sports"
  on public.athlete_sports
  for delete
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id));

-- ---------------------------------------------------------------------------
-- athlete_achievements: full CRUD scoped to rows under the athlete's own
-- profile.
-- ---------------------------------------------------------------------------
create policy "Athletes can view own achievements"
  on public.athlete_achievements
  for select
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can insert own achievements"
  on public.athlete_achievements
  for insert
  to authenticated
  with check (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can update own achievements"
  on public.athlete_achievements
  for update
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id))
  with check (public.owns_athlete_profile(athlete_profile_id));

create policy "Athletes can delete own achievements"
  on public.athlete_achievements
  for delete
  to authenticated
  using (public.owns_athlete_profile(athlete_profile_id));
