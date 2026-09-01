// The single source of truth for Create-vs-Edit mode -- real submitted-
// profile state only, never the URL, which button was clicked, or client
// storage (see task spec). Every caller (AthleteRegistrationScreen, the
// /athlete/register and /register/[category] page titles) derives
// isEditMode by passing a profile_status value (or null/undefined when no
// athlete_profiles row exists yet) through this one function, so the rule
// can never drift between call sites.
export function isEditModeFromStatus(profileStatus: string | null | undefined): boolean {
  return profileStatus === "submitted";
}
