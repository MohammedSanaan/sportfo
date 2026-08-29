-- Closes a gap the previous lockdown migration
-- (20260829150100_lock_down_achievement_verification_status_column.sql)
-- left open: it only revoked UPDATE on verification_status, but Supabase's
-- default schema-wide grant also includes a blanket, no-column-list INSERT
-- grant to `authenticated` on every table -- which still let a client call
-- `supabase.from('athlete_achievements').insert({ ..., verification_status:
-- 'verified' })` directly (bypassing save_athlete_registration entirely,
-- which never lists verification_status in its own INSERT and relies on
-- the column's DEFAULT 'pending') to self-certify a brand-new achievement
-- as already verified.
--
-- Same fix shape as the UPDATE lockdown: a column-specific REVOKE cannot
-- override a broader table-level grant, so the blanket INSERT grant must
-- be revoked first, then re-granted as an explicit allow-list that leaves
-- verification_status out.
revoke insert on public.athlete_achievements from authenticated, anon;

grant insert (
  id, athlete_profile_id, title, achievement_type, certificate_level,
  issuing_organization, achievement_date, description, document_path,
  created_at, updated_at
) on public.athlete_achievements to authenticated;
