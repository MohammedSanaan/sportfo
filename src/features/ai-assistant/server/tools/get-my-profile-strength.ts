// Thin composition -- see get-my-identity.ts's header comment for why this
// file isn't itself unit-tested (see mappers/my-profile-strength.test.ts
// instead, which covers the canonical-reuse behavior directly).
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { toMyProfileStrengthResult, type MyProfileStrengthResult } from "./mappers/my-profile-strength.ts";
import { EMPTY_TOOL_PARAMETERS, type ToolDefinition } from "./types.ts";

export type { MyProfileStrengthResult } from "./mappers/my-profile-strength.ts";
export { toMyProfileStrengthResult } from "./mappers/my-profile-strength.ts";

export const getMyProfileStrengthTool: ToolDefinition<MyProfileStrengthResult> = {
  name: "getMyProfileStrength",
  description:
    "Get the current authenticated user's own SportFo athlete profile completeness: overall percentage, which sections are already complete, and which are still missing.",
  parameters: EMPTY_TOOL_PARAMETERS,
  async execute({ user, supabase }) {
    const { draft } = await loadAthleteDraft(supabase, user.id);
    return toMyProfileStrengthResult(draft);
  },
};
