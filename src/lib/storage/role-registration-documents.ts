import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { sanitizeFilename, friendlyStorageError } from "./achievement-documents";

const BUCKET = "role-registration-uploads";

// {authenticated_user_id}/{registration_type}/{field_id}-{uuid}-{safe_filename}
// Same shape as achievement documents' path convention -- the uuid prefix
// avoids overwriting a previous upload that happened to share a filename.
export function buildRoleRegistrationDocumentPath(
  userId: string,
  registrationType: string,
  fieldId: string,
  filename: string,
): string {
  const safeName = sanitizeFilename(filename);
  return `${userId}/${registrationType}/${fieldId}-${crypto.randomUUID()}-${safeName}`;
}

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

// Uploads directly from the browser using the visitor's own authenticated
// session -- Storage RLS ("Users can upload own role registration
// documents") is what actually enforces that `userId` is really the
// caller, not anything in this function.
export async function uploadRoleRegistrationDocument(
  supabase: SupabaseClient<Database>,
  input: { userId: string; registrationType: string; fieldId: string; file: File },
): Promise<UploadResult> {
  const path = buildRoleRegistrationDocumentPath(
    input.userId,
    input.registrationType,
    input.fieldId,
    input.file.name,
  );

  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadRoleRegistrationDocument failed:", error.message);
    return { ok: false, error: friendlyStorageError(error) };
  }

  return { ok: true, path };
}
