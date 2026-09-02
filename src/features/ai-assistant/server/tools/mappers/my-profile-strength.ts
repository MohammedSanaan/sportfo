// Pure mapper -- see my-identity.ts's header comment for why this lives in
// its own file, separate from ../get-my-profile-strength.ts's `execute()`.
//
// calculateProfileStrength is imported by RELATIVE path, not the usual
// "@/lib/athlete/profile-strength" alias -- that module itself has zero
// runtime imports of its own (only `import type { AthleteDraft } from
// "./registration-draft"`), which is exactly what keeps THIS file safely
// loadable end-to-end under `node --test` (see my-profile-strength.test.ts).
// AthleteDraft is imported as a type only, so its resolution path doesn't
// matter -- it's fully erased at compile/strip time either way.
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import { calculateProfileStrength } from "../../../../../lib/athlete/profile-strength.ts";

export interface MyProfileStrengthResult {
  hasProfile: boolean;
  percentage: number;
  completedItems: string[];
  missingItems: string[];
}

// Reuses the SAME calculateProfileStrength the Athlete Dashboard and
// Profile page already render from -- never a second, independently
// -maintained strength calculation that could silently disagree with what
// the athlete sees on screen (see task spec's "GET MY PROFILE STRENGTH").
export function toMyProfileStrengthResult(draft: AthleteDraft | null): MyProfileStrengthResult {
  if (!draft) {
    return { hasProfile: false, percentage: 0, completedItems: [], missingItems: [] };
  }

  const strength = calculateProfileStrength(draft);
  return {
    hasProfile: true,
    percentage: strength.percentage,
    completedItems: strength.items.filter((item) => item.complete).map((item) => item.label),
    missingItems: strength.items.filter((item) => !item.complete).map((item) => item.label),
  };
}
