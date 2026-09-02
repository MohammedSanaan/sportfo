// Thin composition -- see get-my-identity.ts's header comment for why
// this file isn't itself unit-tested (see mappers/my-achievements.test.ts
// instead).
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { toMyAchievementsResult, type MyAchievementsResult } from "./mappers/my-achievements.ts";
import { EMPTY_TOOL_PARAMETERS, type ToolDefinition } from "./types.ts";

export type { MyAchievementsResult, MyAchievementSummary } from "./mappers/my-achievements.ts";
export { toMyAchievementsResult } from "./mappers/my-achievements.ts";

export const getMyAchievementsTool: ToolDefinition<MyAchievementsResult> = {
  name: "getMyAchievements",
  description:
    "Get the current authenticated user's own SportFo achievements: total count, counts by verification status, and a safe summary of each achievement (title, type, date, verification status). Never returns document files or storage paths.",
  parameters: EMPTY_TOOL_PARAMETERS,
  async execute({ user, supabase }) {
    const { draft } = await loadAthleteDraft(supabase, user.id);
    return toMyAchievementsResult(draft);
  },
};
