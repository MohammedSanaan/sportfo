// Validates a user-entered URL before it's ever rendered as a clickable
// external link (see AthleteBioSection) -- only http(s) is accepted, so a
// stray "javascript:" or other unexpected scheme in stored data can never
// become an active link.
export function isSafeExternalUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
