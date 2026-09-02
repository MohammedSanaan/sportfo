// Thin composition -- see get-my-identity.ts's header comment for why
// this file isn't itself unit-tested (see mappers/my-profile-summary.test.ts
// instead) and why loadAthleteDraft's own further "@/" imports are fine
// here (this file is only ever reached via orchestrator.ts's lazy
// `import("./tools")`).
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import { toMyProfileSummaryResult, type MyProfileSummaryResult } from "./mappers/my-profile-summary.ts";
import { EMPTY_TOOL_PARAMETERS, type ToolDefinition } from "./types.ts";

export type { MyProfileSummaryResult } from "./mappers/my-profile-summary.ts";
export { toMyProfileSummaryResult } from "./mappers/my-profile-summary.ts";

export const getMyProfileSummaryTool: ToolDefinition<MyProfileSummaryResult> = {
  name: "getMyProfileSummary",
  description:
    "Get the current authenticated user's own safe SportFo athlete profile summary: sport, category, skill level, competition level, club/academy, coach/mentor, and profile visibility. Never returns identity documents or contact details.",
  parameters: EMPTY_TOOL_PARAMETERS,
  async execute({ user, supabase }) {
    const { draft } = await loadAthleteDraft(supabase, user.id);
    return toMyProfileSummaryResult(draft);
  },
};
