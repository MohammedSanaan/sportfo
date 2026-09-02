import { getMyIdentityTool } from "./get-my-identity.ts";
import { getMyProfileSummaryTool } from "./get-my-profile-summary.ts";
import { getMyProfileStrengthTool } from "./get-my-profile-strength.ts";
import { getMyAchievementsTool } from "./get-my-achievements.ts";
import { getMyVerificationSummaryTool } from "./get-my-verification-summary.ts";
import type { ToolDefinition } from "./types.ts";

// The complete, fixed Phase 1A tool registry -- exactly the five
// read-only tools named in the task spec. No generic runSql/queryDatabase/
// supabaseQuery tool exists or ever should: the model can only call these
// named, typed, zero-argument SportFo domain tools (see
// tools/types.ts's EMPTY_TOOL_PARAMETERS).
export const ASSISTANT_TOOLS: ToolDefinition<unknown>[] = [
  getMyIdentityTool,
  getMyProfileSummaryTool,
  getMyProfileStrengthTool,
  getMyAchievementsTool,
  getMyVerificationSummaryTool,
];

// Takes an explicit `tools` list (rather than always reading
// ASSISTANT_TOOLS) so orchestrator.ts's tool loop can be exercised in
// tests against an injected fake registry -- see orchestrator.test.ts.
export function getToolByName(
  tools: ToolDefinition<unknown>[],
  name: string,
): ToolDefinition<unknown> | undefined {
  return tools.find((tool) => tool.name === name);
}

export type { ToolContext, ToolDefinition } from "./types.ts";
export { EMPTY_TOOL_PARAMETERS } from "./types.ts";

export { getMyIdentityTool, toMyIdentityResult } from "./get-my-identity.ts";
export type { MyIdentityResult } from "./get-my-identity.ts";

export { getMyProfileSummaryTool, toMyProfileSummaryResult } from "./get-my-profile-summary.ts";
export type { MyProfileSummaryResult } from "./get-my-profile-summary.ts";

export { getMyProfileStrengthTool, toMyProfileStrengthResult } from "./get-my-profile-strength.ts";
export type { MyProfileStrengthResult } from "./get-my-profile-strength.ts";

export { getMyAchievementsTool, toMyAchievementsResult } from "./get-my-achievements.ts";
export type { MyAchievementsResult, MyAchievementSummary } from "./get-my-achievements.ts";

export { getMyVerificationSummaryTool, toMyVerificationSummaryResult } from "./get-my-verification-summary.ts";
export type { MyVerificationSummaryResult } from "./get-my-verification-summary.ts";

export { countByVerificationStatus } from "./achievement-counts.ts";
export type { AchievementStatusCounts } from "./achievement-counts.ts";
