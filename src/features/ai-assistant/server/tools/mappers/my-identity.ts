// Pure mapper, deliberately kept in its own file with NO runtime
// dependency on anything that reaches Supabase (see ../get-my-identity.ts,
// which owns the actual `execute()` that calls getOwnAccountIdentity).
// AccountIdentity is imported as a type ONLY -- type-only imports are
// fully erased at compile/strip time, so this file has zero runtime
// imports at all and can be loaded directly by `node --test` (see
// my-identity.test.ts), same reasoning as src/lib/athlete/
// profile-strength.ts's own `import type { AthleteDraft } from
// "./registration-draft"`.
import type { AccountIdentity } from "@/lib/account/identity";

export interface MyIdentityResult {
  sportfoId: string | null;
  displayName: string | null;
  role: string | null;
}

// Deliberately drops everything on AccountIdentity except these three
// fields. `isAdmin` and `profileHref` are real signals the rest of the
// app uses, but neither is part of the safe identity shape the task spec
// asks for, so neither reaches the model. The internal auth.users UUID
// never even enters this function -- AccountIdentity itself never carries
// it.
export function toMyIdentityResult(identity: AccountIdentity): MyIdentityResult {
  return {
    sportfoId: identity.sportfoId,
    displayName: identity.displayName,
    role: identity.category?.id ?? null,
  };
}
