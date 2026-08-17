import { cache } from "react";
import { createClient } from "./server";

// Server Component-only: re-verifies the session with Supabase Auth
// (`getUser()`, not `getSession()`) rather than trusting Proxy's optimistic
// check. `cache()` de-dupes repeated calls within a single render pass.
//
// Importing `next/headers` (via `./server`) already makes this module
// unusable from Client Components -- Next.js errors at build time if a
// Client Component tries to import it, so no separate server-only guard is
// needed.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
});
