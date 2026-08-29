import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { sanitizeFilename, friendlyStorageError } from "./achievement-documents";

// The one reusable public bucket for a profile photo / organization logo
// across all 8 SportFo registration categories -- deliberately separate
// from the private athlete-achievements / role-registration-uploads
// buckets (ID proofs, licenses, proposals, certificates stay private).
// Public by design (an avatar-style bucket, unguessable UUID-based paths),
// but never linked/shown anywhere until the profile itself is public.
const BUCKET = "profile-photos";

// {authenticated_user_id}/{uuid}-{safe_filename} -- same shape as the
// private buckets' path convention, just without a sub-folder per
// achievement/field, since there's only ever one current photo per account.
export function buildProfilePhotoPath(userId: string, filename: string): string {
  const safeName = sanitizeFilename(filename);
  return `${userId}/${crypto.randomUUID()}-${safeName}`;
}

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

// Uploads directly from the browser using the visitor's own authenticated
// session -- Storage RLS ("Users can upload own profile photo") is what
// actually enforces that `userId` is really the caller.
export async function uploadProfilePhoto(
  supabase: SupabaseClient<Database>,
  input: { userId: string; file: File },
): Promise<UploadResult> {
  const path = buildProfilePhotoPath(input.userId, input.file.name);

  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadProfilePhoto failed:", error.message);
    return { ok: false, error: friendlyStorageError(error) };
  }

  return { ok: true, path };
}

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

export async function deleteProfilePhotoObject(
  supabase: SupabaseClient<Database>,
  path: string,
): Promise<DeleteResult> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("deleteProfilePhotoObject failed:", error.message);
    return { ok: false, error: friendlyStorageError(error) };
  }
  return { ok: true };
}

// The bucket is public -- a plain, deterministic CDN-style URL (never
// signed), so it can be built from just the project URL + path with no
// Supabase client instance at all. Safe to call from a Server Component,
// a presentational card, or the browser alike.
export function buildProfilePhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

// Client-instance variant, for call sites that already have one handy --
// functionally identical to buildProfilePhotoUrl above.
export function getProfilePhotoUrl(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
