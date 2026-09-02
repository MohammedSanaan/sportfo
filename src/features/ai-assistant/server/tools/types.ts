import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AuthenticatedSportFoUser } from "../security/authorization.ts";
import type { AIToolParameterSchema } from "../providers/provider.ts";

// Everything a tool is allowed to use to do its job. Notably: no raw
// request, no model-supplied arguments object here at all for Phase 1A
// (see EMPTY_TOOL_PARAMETERS below) -- a tool can only ever act on `user`,
// which came from the authenticated session (security/authorization.ts),
// never from anything the model or client asserted.
export interface ToolContext {
  user: AuthenticatedSportFoUser;
  supabase: SupabaseClient<Database>;
}

export interface ToolDefinition<TResult> {
  name: string;
  description: string;
  parameters: AIToolParameterSchema;
  execute(context: ToolContext): Promise<TResult>;
}

// Every Phase 1A tool operates only on "my own" data derived from
// ToolContext.user -- none of them accept model-supplied arguments at
// all, so there is no argument surface for the model to smuggle a
// user_id/auth_user_id/owner_id through (see task spec's TOOL EXECUTION
// SECURITY section, and orchestrator.ts, which never lets a tool_call's
// `arguments` reach a tool's execute() function). Shared so every tool's
// schema sent to the provider is byte-identical.
export const EMPTY_TOOL_PARAMETERS: AIToolParameterSchema = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};
