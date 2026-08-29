-- The previous migration's `revoke update (verification_status) on
-- public.athlete_achievements from authenticated, anon` was a no-op: the
-- role already had a broader TABLE-level UPDATE grant (no column list,
-- Supabase's default "GRANT UPDATE ON ALL TABLES IN SCHEMA public") which
-- covers every column including ones added later, and revoking a
-- column-specific privilege can't strip access granted by a wider
-- table-level privilege. Verified this was still live via
-- information_schema.column_privileges after applying.
--
-- The correct fix: revoke the table-level UPDATE grant entirely, then
-- re-grant UPDATE to `authenticated` with an explicit column list that
-- excludes verification_status. `anon` never had a matching RLS policy
-- for this table anyway (all 4 policies are scoped to `authenticated`
-- only), so anon's UPDATE grant -- table- or column-level -- was already
-- fully inert; removed here rather than re-granted, tightening it rather
-- than reproducing a no-op grant.
revoke update on public.athlete_achievements from authenticated, anon;

grant update (
  title, achievement_type, certificate_level, issuing_organization,
  achievement_date, description, document_path, updated_at
) on public.athlete_achievements to authenticated;
