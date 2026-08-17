// Supabase Auth stores the verified phone in E.164 shape but without a
// leading "+" (e.g. "97455512345"). Normalizes it for display/storage so
// the rest of the app can always treat it as a proper E.164 string.
export function formatAuthPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.startsWith("+") ? phone : `+${phone}`;
}
