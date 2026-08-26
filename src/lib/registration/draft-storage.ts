// A short-lived sessionStorage handoff for a guest's in-progress
// registration form when they hit the auth checkpoint at submit time (see
// task: "Registration pages must be viewable before authentication...
// Authentication can be required at the appropriate SAVE/SUBMIT step").
// Same tab-scoped, ephemeral, consume-once pattern as
// src/lib/account/welcome-storage.ts -- never a query param, never
// localStorage (a stale draft must not resurface in a later, unrelated
// session).
//
// Callers are responsible for stripping File objects before saving --
// File instances aren't JSON-serializable, and per the task's explicit
// instruction, ID-proof/other uploads must never be persisted (even
// transiently) client-side. A caller with file fields should null them
// out and surface a "please reselect your file(s)" notice after restoring.
const STORAGE_PREFIX = "sportfo:register-draft:";

export function saveRegistrationDraft(categorySlug: string, values: unknown) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + categorySlug, JSON.stringify(values));
  } catch {
    // Private browsing / storage disabled -- the draft restore is a
    // nice-to-have, never worth blocking the auth redirect over.
  }
}

// Read-once: removes the entry immediately so returning to this category
// later (a fresh visit, not the auth round-trip) never resurrects it.
export function consumeRegistrationDraft<T>(categorySlug: string): T | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + categorySlug);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_PREFIX + categorySlug);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearRegistrationDraft(categorySlug: string) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + categorySlug);
  } catch {
    // Nothing to clean up if storage isn't available.
  }
}
