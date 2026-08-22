-- SportFo permanent public account identity: SF followed by 6 digits
-- (e.g. SF482193). This is deliberately separate from auth.users.id (the
-- internal Supabase Auth UUID, never displayed anywhere) and from any
-- role-specific profile (athlete_profiles today; coach/creator/academy
-- profiles later). One row per authenticated account; the id is assigned
-- once, never changes, and is never reused, regardless of how many roles
-- that account later takes on.

-- ---------------------------------------------------------------------------
-- sportfo_users
-- ---------------------------------------------------------------------------
create table public.sportfo_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  sportfo_id text not null unique check (sportfo_id ~ '^SF[0-9]{6}$'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sportfo_users is
  'One permanent public SportFo ID (SF + 6 digits) per authenticated account. Account-level identity -- independent of Athlete/Coach/Creator role.';
comment on column public.sportfo_users.user_id is
  'Owning auth.users id (internal identity). Never displayed in the UI -- see sportfo_id for the public-facing identifier.';
comment on column public.sportfo_users.sportfo_id is
  'Permanent public identifier, e.g. SF482193. Assigned exactly once by ensure_sportfo_id(); never changes, never reused, always stored uppercase.';

drop trigger if exists sportfo_users_set_updated_at on public.sportfo_users;
create trigger sportfo_users_set_updated_at
  before update on public.sportfo_users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: an account can read only its own row. There is deliberately no
-- insert/update/delete policy for authenticated (or anon) at all -- the
-- only write path is ensure_sportfo_id() below (SECURITY DEFINER), so a
-- client can never submit, overwrite, or claim an arbitrary sportfo_id
-- such as "SF000001" through the normal Data API.
-- ---------------------------------------------------------------------------
alter table public.sportfo_users enable row level security;

grant usage on schema public to authenticated;
grant select on public.sportfo_users to authenticated;

create policy "Users can view own sportfo_users row"
  on public.sportfo_users
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ensure_sportfo_id: idempotent get-or-create, called after every
-- successful authentication (not just first registration). Returns the
-- caller's existing SportFo ID unchanged if one is already assigned;
-- otherwise generates one and retries on collision. SECURITY DEFINER is
-- required because the INSERT must succeed despite there being no
-- authenticated-role insert policy -- this function is the only write path
-- to this table, by design (see RLS comment above).
-- ---------------------------------------------------------------------------
create or replace function public.ensure_sportfo_id()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing text;
  v_candidate text;
  v_attempt int := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select sportfo_id into v_existing
  from public.sportfo_users
  where user_id = v_user_id;

  if v_existing is not null then
    return v_existing;
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_candidate := 'SF' || lpad(floor(random() * 1000000)::int::text, 6, '0');

    begin
      insert into public.sportfo_users (user_id, sportfo_id)
      values (v_user_id, v_candidate);
      return v_candidate;
    exception
      when unique_violation then
        -- Either this sportfo_id candidate collided with another account's
        -- id, or a concurrent call for this same user_id already won the
        -- race and inserted first -- check for the latter before treating
        -- it as a candidate collision and retrying.
        select sportfo_id into v_existing
        from public.sportfo_users
        where user_id = v_user_id;

        if v_existing is not null then
          return v_existing;
        end if;

        if v_attempt >= 20 then
          raise exception 'Could not generate a unique SportFo ID after % attempts', v_attempt;
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.ensure_sportfo_id() from public;
grant execute on function public.ensure_sportfo_id() to authenticated;

-- ---------------------------------------------------------------------------
-- sportfo_id_exists: the entire safe surface for "log in with SportFo ID"
-- identity resolution. Returns ONLY a boolean -- never the account's phone,
-- email, user_id, or any other column -- so a signed-out visitor can check
-- whether an id is registered without ever learning who it belongs to.
-- Case-insensitive input (matches the "case-insensitive when entered"
-- requirement); the stored value itself is always canonical uppercase.
-- ---------------------------------------------------------------------------
create or replace function public.sportfo_id_exists(p_sportfo_id text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.sportfo_users
    where sportfo_id = upper(trim(p_sportfo_id))
  );
$$;

revoke all on function public.sportfo_id_exists(text) from public;
grant execute on function public.sportfo_id_exists(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Backfill: every existing auth.users account gets exactly one SportFo ID.
-- Idempotent (only inserts for accounts missing a row, so safe to run this
-- migration more than once in dev); never touches auth.users,
-- athlete_profiles, or any other existing table or column.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  v_candidate text;
  v_attempt int;
begin
  for r in
    select u.id
    from auth.users u
    left join public.sportfo_users su on su.user_id = u.id
    where su.user_id is null
  loop
    v_attempt := 0;
    loop
      v_attempt := v_attempt + 1;
      v_candidate := 'SF' || lpad(floor(random() * 1000000)::int::text, 6, '0');
      begin
        insert into public.sportfo_users (user_id, sportfo_id)
        values (r.id, v_candidate);
        exit;
      exception
        when unique_violation then
          if v_attempt >= 20 then
            raise exception 'Could not backfill a unique SportFo ID for user %', r.id;
          end if;
      end;
    end loop;
  end loop;
end $$;
