// Supabase's Send SMS Hook delivers `user.phone` in E.164 digit shape but
// WITHOUT a leading "+" (e.g. "97455512345", not "+97455512345") -- this
// is how Supabase Auth stores/passes phone numbers internally, confirmed
// against Supabase's own documentation. The SMS gateway's own validation
// requires a properly "+"-prefixed E.164 string (and its MSG91 conversion
// assumes one is present), so normalization belongs here, at the
// Supabase-specific integration boundary, rather than loosening the
// gateway's contract.
export function normalizeHookPhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}
