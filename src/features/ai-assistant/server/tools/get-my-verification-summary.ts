// Thin composition -- see get-my-identity.ts's header comment for why
// this file isn't itself unit-tested (see
// mappers/my-verification-summary.test.ts instead).
import { loadAthleteDraft } from "@/lib/athlete/registration-draft";
import {
  toMyVerificationSummaryResult,
  type MyVerificationSummaryResult,
} from "./mappers/my-verification-summary.ts";
import { EMPTY_TOOL_PARAMETERS, type ToolDefinition } from "./types.ts";

export type { MyVerificationSummaryResult } from "./mappers/my-verification-summary.ts";
export { toMyVerificationSummaryResult } from "./mappers/my-verification-summary.ts";

export const getMyVerificationSummaryTool: ToolDefinition<MyVerificationSummaryResult> = {
  name: "getMyVerificationSummary",
  description:
    "Get the current authenticated user's own aggregate SportFo achievement verification counts: total, verified, pending, and rejected. No individual achievement detail or moderation notes.",
  parameters: EMPTY_TOOL_PARAMETERS,
  async execute({ user, supabase }) {
    const { draft } = await loadAthleteDraft(supabase, user.id);
    return toMyVerificationSummaryResult(draft);
  },
};
