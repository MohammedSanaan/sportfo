export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_LABEL = "10 MB";

export function validateAchievementDocument(file: File | null): string | true {
  if (!file) {
    return true;
  }

  const acceptedTypes: readonly string[] = ACCEPTED_DOCUMENT_TYPES;
  const hasAcceptedType =
    acceptedTypes.includes(file.type) ||
    ACCEPTED_DOCUMENT_EXTENSIONS.some((extension) =>
      file.name.toLowerCase().endsWith(extension),
    );

  if (!hasAcceptedType) {
    return "Unsupported file type. Upload a PDF, JPG, or PNG.";
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_DOCUMENT_SIZE_LABEL}.`;
  }

  return true;
}

// A profile photo / organization logo -- image-only (no PDF, unlike a
// certificate/ID document), and a smaller size ceiling matching the
// public "profile-photos" Storage bucket's own file_size_limit (see the
// migration that created it) so a rejected-by-Storage upload never
// happens after the browser already thought it was valid.
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTO_SIZE_LABEL = "5 MB";

export function validateProfilePhoto(file: File | null): string | true {
  if (!file) {
    return true;
  }

  const acceptedTypes: readonly string[] = ACCEPTED_PHOTO_TYPES;
  const hasAcceptedType =
    acceptedTypes.includes(file.type) ||
    ACCEPTED_PHOTO_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));

  if (!hasAcceptedType) {
    return "Unsupported file type. Upload a JPEG, PNG, or WebP image.";
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_PHOTO_SIZE_LABEL}.`;
  }

  return true;
}
