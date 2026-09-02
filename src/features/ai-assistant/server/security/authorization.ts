import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createClient as createWebSessionClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getOwnSportfoId } from "@/lib/sportfo-id/server";

// The ownership/authorization identity for the AI feature. `id` (auth.
// users.id, a UUID) is the ONLY value ever used to scope a tool's
// Supabase queries (via RLS) or a rate-limit key -- it is never sent to a
// client (see tools/*, whose results never include it) and never
// displayed. `sportfoId` is the business/display identifier (SF######) --
// safe to show, but NEVER used in place of `id` for authorization. See
// task spec's "IMPORTANT IDENTITY RULE".
export interface AuthenticatedSportFoUser {
  id: string;
  sportfoId: string | null;
}

export interface ResolvedAuth {
  user: AuthenticatedSportFoUser;
  // Scoped to this exact user via whichever strategy resolved them (cookie
  // session or bearer token) -- every tool query made through this client
  // is RLS-scoped to that same user, regardless of which strategy ran.
  supabase: SupabaseClient<Database>;
}

const BEARER_PREFIX = "Bearer ";

// Resolves the caller's identity from trusted server-side context ONLY.
// The request body is never consulted here, and never could be -- there is
// no user_id/auth_user_id/owner_id field in AssistantChatRequestBody at
// all (see types/assistant.ts) for a client to even attempt to set.
//
// Two strategies, matching SportFo's two client shapes (see task spec's
// MOBILE COMPATIBILITY section):
//  - Web: the same Supabase session cookie every other Server Component/
//    Route Handler already uses (src/lib/supabase/server.ts), re-verified
//    with `auth.getUser()` rather than trusted from the cookie alone --
//    identical to how the rest of SportFo authenticates today. This path
//    is completely unchanged by the bearer-token path existing.
//  - Mobile: an `Authorization: Bearer <supabase-access-token>` header,
//    verified the same way (`auth.getUser(token)`) against a plain,
//    cookie-less Supabase client. No SportFo Mobile client calls this yet
//    -- this is a real, working adapter (not a stub) so a future mobile
//    client can start sending this header without this file changing.
//
// Both strategies resolve to the exact same AuthenticatedSportFoUser
// shape, and both re-verify against Supabase Auth directly -- neither
// trusts anything the caller merely asserts.
export async function resolveAuthenticatedUser(request: Request): Promise<ResolvedAuth | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith(BEARER_PREFIX)) {
    return resolveBearerTokenUser(authHeader.slice(BEARER_PREFIX.length).trim());
  }

  return resolveWebSessionUser();
}

async function resolveWebSessionUser(): Promise<ResolvedAuth | null> {
  const supabase = await createWebSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const sportfoId = await getOwnSportfoId(supabase, user.id);
  return { user: { id: user.id, sportfoId }, supabase };
}

async function resolveBearerTokenUser(accessToken: string): Promise<ResolvedAuth | null> {
  if (!accessToken) return null;

  const { url, anonKey } = getSupabaseEnv();
  // A plain, session-less client -- no cookies, no persisted session, no
  // auto-refresh. Passing the token explicitly to getUser() verifies THIS
  // token against Supabase Auth directly; the client never reads or
  // trusts any ambient session state. The same header is set globally so
  // every subsequent query this client makes (see tools/*) is RLS-scoped
  // to this token's user too, not just the identity check itself.
  const supabase = createSupabaseClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) return null;

  const sportfoId = await getOwnSportfoId(supabase, user.id);
  return { user: { id: user.id, sportfoId }, supabase };
}
