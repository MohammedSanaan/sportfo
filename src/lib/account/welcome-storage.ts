// A tiny sessionStorage handoff between AuthFlow (which already knows the
// visitor's real name/role/SportFo ID right after login, from the same
// getPostLoginDestination() call that decided where to send them) and
// WelcomeToast (mounted globally in the root layout, so it can show up on
// whichever page the visitor actually lands on). Deliberately not a query
// param -- a name and SportFo ID are real account data, not something
// that belongs sitting in a shareable/bookmarkable URL or browser history.
// sessionStorage (not localStorage) so it can never resurface a stale
// welcome after the tab is reopened later.
const STORAGE_KEY = "sportfo:welcome";

export interface WelcomePayload {
  displayName: string | null;
  roleId: string | null;
  sportfoId: string | null;
}

export function storeWelcomePayload(payload: WelcomePayload) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private browsing / storage disabled -- the welcome toast is a nice-
    // to-have, never worth failing sign-in over.
  }
}

// Read-once: removes the entry immediately so a later refresh, a second
// tab reading the same session, or navigating back never repeats the toast.
export function consumeWelcomePayload(): WelcomePayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as WelcomePayload;
  } catch {
    return null;
  }
}
