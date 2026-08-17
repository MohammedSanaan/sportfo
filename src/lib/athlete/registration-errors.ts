// Translates persistence failures (RPC/Postgrest errors, or a plain thrown
// error) into copy that's safe to show an athlete -- raw Postgres/Postgrest
// messages can leak column/constraint names. Callers are expected to
// console.error the original error themselves for development diagnostics.
export function friendlySaveError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message).toLowerCase()
      : "";

  if (message.includes("not authenticated")) {
    return "Your session has expired. Please sign in again.";
  }

  if (message.includes("not found for this profile")) {
    return "One of your achievements couldn't be updated. Please refresh the page and try again.";
  }

  if (
    message.includes("check constraint") ||
    message.includes("invalid input syntax") ||
    message.includes("violates")
  ) {
    return "Some of the information entered isn't valid. Please review the form and try again.";
  }

  if (message.includes("network") || message.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }

  return "Something went wrong while saving. Please try again.";
}
