// Thin composition: real Supabase loader + pure mapper. Deliberately not
// itself unit-tested (see mappers/my-identity.test.ts for the actual logic
// coverage) -- same reasoning as app/api/assistant/route.ts staying thin
// and untested: it's just two already-trusted pieces wired together.
// tools/index.ts (which imports this file) is only ever reached via
// orchestrator.ts's LAZY `import("./tools")` -- see orchestrator.ts's
// getDefaultTools() -- so this file being effectively bundler-only
// (identity.ts has its own further "@/" value imports) never blocks
// `node --test` from loading orchestrator.ts/handle-assistant-request.ts.
import { getOwnAccountIdentity } from "@/lib/account/identity";
import { toMyIdentityResult, type MyIdentityResult } from "./mappers/my-identity.ts";
import { EMPTY_TOOL_PARAMETERS, type ToolDefinition } from "./types.ts";

export type { MyIdentityResult } from "./mappers/my-identity.ts";
export { toMyIdentityResult } from "./mappers/my-identity.ts";

export const getMyIdentityTool: ToolDefinition<MyIdentityResult> = {
  name: "getMyIdentity",
  description:
    "Get the current authenticated user's own safe SportFo identity: their SportFo ID, display name, and role. Never returns internal account identifiers or private data.",
  parameters: EMPTY_TOOL_PARAMETERS,
  async execute({ user, supabase }) {
    const identity = await getOwnAccountIdentity(supabase, user.id);
    return toMyIdentityResult(identity);
  },
};
