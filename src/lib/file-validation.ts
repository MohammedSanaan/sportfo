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
