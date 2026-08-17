import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const BUCKET = "athlete-achievements";
const MAX_FILENAME_LENGTH = 80;

// Strips directory components and anything that isn't safe in a Storage
// object key. The result is always a single flat path segment, so path
// traversal (`../..`, embedded `/`) is structurally impossible regardless
// of what the original filename contained.
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.\-_]+/, "")
    .slice(0, MAX_FILENAME_LENGTH);
  return cleaned.length > 0 ? cleaned : "file";
}

// {authenticated_user_id}/{achievement_id}/{uuid}-{safe_filename}
// The uuid prefix avoids overwriting a previous upload that happened to
// share the same original filename -- relying on filename uniqueness alone
// isn't safe.
export function buildAchievementDocumentPath(
  userId: string,
  achievementId: string,
  filename: string,
): string {
  const safeName = sanitizeFilename(filename);
  return `${userId}/${achievementId}/${crypto.randomUUID()}-${safeName}`;
}

// Best-effort recovery of a human-readable filename from a stored path, for
// display only (e.g. "state-championship.pdf" from ".../<uuid>-state-championship.pdf").
export function displayFilenameFromPath(path: string): string {
  const lastSegment = path.split("/").pop() ?? path;
  const uuidPrefixPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  return lastSegment.replace(uuidPrefixPattern, "");
}

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

// Uploads directly from the browser using the athlete's own authenticated
// session -- Storage RLS ("Athletes can upload own achievement documents")
// is what actually enforces that `userId` is really the caller, not
// anything in this function. File bytes never pass through the Next.js
// server this way, which matters for a 10 MB upload.
export async function uploadAchievementDocument(
  supabase: SupabaseClient<Database>,
  input: { userId: string; achievementId: string; file: File },
): Promise<UploadResult> {
  const path = buildAchievementDocumentPath(
    input.userId,
    input.achievementId,
    input.file.name,
  );

  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadAchievementDocument failed:", error.message);
    return { ok: false, error: friendlyStorageError(error) };
  }

  return { ok: true, path };
}

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

// Callers that need the athlete to know if this failed (the explicit
// "Remove document" button) check `.ok`. Callers doing automatic cleanup
// (old file after a replace, or a removed achievement's leftover document)
// can just log a failure and move on -- by that point the database is
// already the source of truth; a leftover object is wasted storage, not a
// correctness problem.
export async function deleteAchievementDocumentObject(
  supabase: SupabaseClient<Database>,
  path: string,
): Promise<DeleteResult> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("deleteAchievementDocumentObject failed:", error.message);
    return { ok: false, error: friendlyStorageError(error) };
  }
  return { ok: true };
}

function friendlyStorageError(error: { message?: string; statusCode?: string }): string {
  const message = (error.message ?? "").toLowerCase();

  if (message.includes("exceeded") || message.includes("too large")) {
    return "File is too large to upload.";
  }
  if (message.includes("mime") || message.includes("type not allowed")) {
    return "Unsupported file type.";
  }
  if (message.includes("row-level security") || message.includes("permission")) {
    return "You don't have permission to upload this document.";
  }
  if (message.includes("network") || message.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }
  return "Failed to upload document. Please try again.";
}
