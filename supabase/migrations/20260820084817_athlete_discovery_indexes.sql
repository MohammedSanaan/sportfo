-- Indexes to support the /athletes discovery query (search_public_athletes,
-- next migration). Deliberately just two -- enough to keep the common
-- filter combinations off a full sequential scan as the public-athlete
-- count grows, without indexing every column the query merely touches.
--
-- public_slug is already uniquely indexed (athlete_profiles_public_slug_key,
-- see 20260820082333_athlete_public_profiles.sql) and needs nothing new.

-- ---------------------------------------------------------------------------
-- athlete_profiles: every discovery query starts from
-- "is_public = true AND profile_status = 'submitted'" -- a partial index on
-- exactly that predicate keeps the scan restricted to the (much smaller)
-- publicly-discoverable subset regardless of total row count. country is
-- the leading column (the most commonly applied discovery filter beyond
-- the base predicate); city, a secondary filter, rides along in the same
-- index rather than needing one of its own.
-- ---------------------------------------------------------------------------
create index if not exists athlete_profiles_discovery_idx
  on public.athlete_profiles (country, city)
  where is_public = true and profile_status = 'submitted';

-- ---------------------------------------------------------------------------
-- athlete_sports: primary_sport and skill_level are both discovery filters
-- but live on the joined sports table, not athlete_profiles. A composite
-- index serves a primary_sport-only filter, a skill_level-only filter (via
-- a bitmap scan), and a combined primary_sport + skill_level filter.
-- ---------------------------------------------------------------------------
create index if not exists athlete_sports_discovery_idx
  on public.athlete_sports (primary_sport, skill_level);
