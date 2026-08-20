-- Public athlete profiles: adds the two columns needed to make a submitted
-- profile shareable at /a/<slug> -- public_slug (the stable URL segment)
-- and is_public (the athlete's own visibility choice). Both are additive,
-- nullable-by-default (public_slug) or safely defaulted (is_public), and
-- touch no existing row's meaning -- every current athlete_profiles row
-- stays exactly as valid as it was before this migration.
--
-- is_public defaults to false: privacy-by-default. Existing submitted
-- profiles (real users from prior testing/usage) must not become publicly
-- reachable just because this column was added -- publishing is something
-- each athlete opts into from /athlete/profile, never a side effect of a
-- migration.

alter table public.athlete_profiles
  add column if not exists public_slug text,
  add column if not exists is_public boolean not null default false;

comment on column public.athlete_profiles.public_slug is
  'Stable, unique, URL-safe slug for the public profile at /a/<slug>. Null until the athlete first publishes; generated once and never auto-changed (see generate_athlete_public_slug), so a shared link never breaks.';
comment on column public.athlete_profiles.is_public is
  'Athlete-controlled visibility for the public profile route. Defaults to false (private) so publishing is always an explicit opt-in.';

-- ---------------------------------------------------------------------------
-- Uniqueness: enforced at the database level, not just by the application.
-- A plain UNIQUE constraint is sufficient (rather than a partial index) --
-- Postgres never treats two NULLs as duplicates, so any number of
-- not-yet-published profiles (public_slug is null) coexist fine.
-- ---------------------------------------------------------------------------
alter table public.athlete_profiles
  add constraint athlete_profiles_public_slug_key unique (public_slug);

-- ---------------------------------------------------------------------------
-- Format: defense in depth. generate_athlete_public_slug() (next migration)
-- is the only intended writer of this column, but the constraint guarantees
-- no code path -- present or future -- can ever persist a slug that isn't
-- lowercase, URL-safe, hyphen-separated, and within a sane length, even if
-- it bypasses that function.
-- ---------------------------------------------------------------------------
alter table public.athlete_profiles
  add constraint athlete_profiles_public_slug_format_check
  check (
    public_slug is null
    or (
      public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(public_slug) between 3 and 60
    )
  );

-- ---------------------------------------------------------------------------
-- Reserved names: a slug can never collide with an existing or foreseeable
-- application route. Mirrors the reserved list in generate_athlete_public_slug
-- so the guarantee holds even for a slug written by some future code path
-- that doesn't call that function.
-- ---------------------------------------------------------------------------
alter table public.athlete_profiles
  add constraint athlete_profiles_public_slug_not_reserved_check
  check (
    public_slug is null
    or public_slug <> all (array[
      'a', 'admin', 'api', 'app', 'assets', 'athlete', 'athletes', 'auth',
      'coach', 'coaches', 'contact', 'dashboard', 'favicon', 'help', 'home',
      'login', 'logout', 'new', 'privacy', 'profile', 'public', 'recruiter',
      'recruiters', 'register', 'robots', 'settings', 'signin', 'signup',
      'sitemap', 'sponsor', 'sponsors', 'sportfo', 'static', 'support',
      'terms', 'www'
    ])
  );

-- ---------------------------------------------------------------------------
-- Business rule, enforced where it can never be bypassed: a public profile
-- must be submitted (never a draft) and must have a slug to be reachable
-- at. This is the DB-level guarantee behind "draft + is_public=true must
-- never render publicly" -- it can't happen, because the row can't exist.
-- ---------------------------------------------------------------------------
alter table public.athlete_profiles
  add constraint athlete_profiles_public_requires_slug_and_submitted_check
  check (
    not is_public
    or (public_slug is not null and profile_status = 'submitted')
  );
