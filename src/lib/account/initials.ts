// "Mohammed Sanaan" -> "MS". Single-word names fall back to the first two
// letters ("Sanaan" -> "SA"); a blank/whitespace-only name returns "".
// Never generates a random/placeholder image -- this is the only avatar
// SportFo shows when no photo exists (which is always, today -- no
// avatar/photo column exists on any profile table yet).
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
