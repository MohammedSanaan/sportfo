-- The previous migration (20260829122700) added three new parameters to
-- save_athlete_registration via CREATE OR REPLACE FUNCTION. Because
-- Postgres identifies a function by name *and* parameter list, adding
-- parameters changes its identity rather than replacing it in place --
-- CREATE OR REPLACE silently created a second overload instead, leaving
-- the original 19-parameter version still callable alongside the new
-- 22-parameter one. Two live overloads risks an ambiguous-call error (or
-- silently invoking the stale one, which knows nothing about
-- preferred_language/emergency_contact/aadhaar_or_govt_id) from any
-- caller that doesn't pass every one of the new named parameters.
-- Drop the stale, pre-migration overload explicitly by its exact old
-- signature so exactly one version of this function exists going forward.
drop function if exists public.save_athlete_registration(
  text, text, date, text, text, text, text, text, text, text, text, text,
  text, boolean, text, text, text, text, text, jsonb
);
