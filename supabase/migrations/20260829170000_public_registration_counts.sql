-- A single, safe aggregate-counts RPC for the Athlete Dashboard's "platform
-- stats" strip (real Athletes/Academies/Sponsors counts, replacing the
-- reference design's hardcoded "5,000+ / 120+ / 150+"). `registrations`
-- only has an owner-scoped SELECT policy ("Users can view own
-- registrations" -- auth.uid() = user_id), so a regular authenticated
-- user querying it directly only ever sees their own row(s); this
-- SECURITY DEFINER function is the one safe way to expose a global count
-- without granting broader table access. It returns COUNTS ONLY -- no
-- names, ids, or any per-row data -- so it's safe for any authenticated
-- user, not just admins (matches the existing get_public_athlete_countries
-- pattern of a narrow, count/list-only public RPC).
create or replace function public.get_public_registration_counts()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
  select jsonb_build_object(
    'athletes', count(*) filter (where registration_type = 'athlete'),
    'academies', count(*) filter (where registration_type = 'academy_coach_parent'),
    'sponsors', count(*) filter (where registration_type = 'sponsor_csr')
  )
  from public.registrations
  where status = 'submitted';
$function$;

revoke all on function public.get_public_registration_counts() from public;
grant execute on function public.get_public_registration_counts() to authenticated, anon;
