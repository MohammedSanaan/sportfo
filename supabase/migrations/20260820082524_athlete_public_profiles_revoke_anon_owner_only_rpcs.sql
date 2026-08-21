-- Supabase grants EXECUTE on every new public-schema function to anon and
-- authenticated by default (ALTER DEFAULT PRIVILEGES at the project level),
-- independent of any REVOKE ... FROM PUBLIC in the migration that created
-- the function -- REVOKE FROM PUBLIC only removes the PUBLIC pseudo-role's
-- grant, not the separate default-privilege grant made directly to anon.
-- The security advisor caught this: generate_athlete_public_slug and
-- set_athlete_profile_visibility were reachable by anon even though the
-- previous migration's grant statements only named authenticated.
--
-- Neither function currently leaks private data to anon even as called
-- (set_athlete_profile_visibility requires auth.uid(), which is null for
-- anon; generate_athlete_public_slug only returns a generated slug
-- string), but both are meant strictly for signed-in owners, so revoke the
-- unintended anon grant explicitly rather than relying on that behavior.

revoke execute on function public.generate_athlete_public_slug(text) from anon;
revoke execute on function public.set_athlete_profile_visibility(boolean) from anon;
