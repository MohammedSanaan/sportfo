-- Storage bucket + policies for achievement supporting documents.
--
-- Path convention: {user_id}/{achievement_id}/{filename}
-- The first path segment is the owning auth.users id, which is all these
-- policies check -- achievement-level ownership is already enforced by the
-- athlete_achievements RLS policies at the database-row level. Storage RLS
-- is enabled by default on storage.objects in every Supabase project, so it
-- is not re-enabled here.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'athlete-achievements',
  'athlete-achievements',
  false,
  10485760, -- 10 MB, matches the client-side limit in src/lib/file-validation.ts
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "Athletes can upload own achievement documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'athlete-achievements'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Athletes can view own achievement documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'athlete-achievements'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Athletes can update own achievement documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'athlete-achievements'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'athlete-achievements'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Athletes can delete own achievement documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'athlete-achievements'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
