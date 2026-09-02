import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getAIProvider } from "./providers/index.ts";
import type { AIConversationItem, AIProvider, AIToolCallRequest, AIToolSpec, AIUsage } from "./providers/provider.ts";
import type { ToolContext, ToolDefinition } from "./tools/types.ts";
import { buildSystemPrompt } from "./system-prompt.ts";
import { AssistantError } from "./errors.ts";
import { assertNoForbiddenFields } from "./security/sanitize.ts";
import { logAssistantEvent } from "./logging.ts";
import { MAX_RESPONSE_TOKENS, MAX_TOOL_ROUNDS } from "./limits.ts";
import type { AuthenticatedSportFoUser } from "./security/authorization.ts";
import type { AssistantMessageInput } from "./types/assistant.ts";

export interface RunAssistantParams {
  requestId: string;
  user: AuthenticatedSportFoUser;
  supabase: SupabaseClient<Database>;
  messages: AssistantMessageInput[];
  locale: string;
  // Test-only injection points. Production always omits both, so
  // getAIProvider()/ASSISTANT_TOOLS run for real -- see providers.test.ts
  // and orchestrator.test.ts, which inject fakes here instead.
  provider?: AIProvider;
  tools?: ToolDefinition<unknown>[];
}

export interface RunAssistantResult {
  content: string;
  usage?: AIUsage;
  toolRounds: number;
}

// Conversation input -> system prompt -> provider invocation -> tool
// selection/execution -> tool-result loop -> safe final response. This is
// the ONE place that owns that whole cycle -- the route only calls
// handle-assistant-request.ts, which calls this; nothing here talks to
// Next.js, and nothing here talks to the OpenAI SDK directly (that's
// providers/openai-provider.ts's job alone).
export async function runAssistant(params: RunAssistantParams): Promise<RunAssistantResult> {
  const { requestId, user, supabase, messages, locale } = params;
  const provider = params.provider ?? getAIProvider();
  const tools = params.tools ?? (await getDefaultTools());
  const context: ToolContext = { user, supabase };

  const toolSpecs: AIToolSpec[] = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));

  const items: AIConversationItem[] = [
    { type: "message", role: "system", content: buildSystemPrompt(locale) },
    ...messages.map((message): AIConversationItem => ({
      type: "message",
      role: message.role,
      content: message.content,
    })),
  ];

  let usage: AIUsage | undefined;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const providerStart = Date.now();
    let result;
    try {
      result = await provider.generate({ items, tools: toolSpecs, maxOutputTokens: MAX_RESPONSE_TOKENS });
    } catch (error) {
      logAssistantEvent({
        requestId,
        event: "provider_call",
        model: provider.name,
        durationMs: Date.now() - providerStart,
        success: false,
      });
      if (error instanceof AssistantError) throw error;
      // Never surface the raw provider error (could contain request/
      // response detail) to the caller -- see errors.ts's category
      // contract and handle-assistant-request.test.ts's "OpenAI API
      // errors sanitized" case.
      throw new AssistantError(
        "PROVIDER_UNAVAILABLE",
        "The AI provider is currently unavailable. Please try again shortly.",
      );
    }

    logAssistantEvent({
      requestId,
      event: "provider_call",
      model: provider.name,
      durationMs: Date.now() - providerStart,
      success: true,
    });
    if (result.usage) usage = result.usage;

    if (result.kind === "message") {
      return { content: result.content, usage, toolRounds: round };
    }

    for (const call of result.toolCalls) {
      items.push({ type: "tool_call", id: call.id, name: call.name, arguments: call.arguments });
      items.push(await executeTool(call, context, tools, requestId));
    }
  }

  // The model kept requesting tools instead of answering for
  // MAX_TOOL_ROUNDS straight rounds -- stop rather than loop forever (see
  // task spec: "Add a reasonable maximum number of tool rounds to prevent
  // loops. Do not allow infinite tool recursion.").
  throw new AssistantError(
    "TOOL_FAILURE",
    "The assistant could not complete this request after multiple tool attempts. Please try rephrasing your question.",
  );
}

// The real tool registry is loaded lazily -- ONLY when a caller doesn't
// supply its own `tools` list -- via a dynamic import rather than a
// static top-level one. tools/index.ts (through each get-my-*.ts tool's
// real Supabase loader, e.g. loadAthleteDraft) transitively imports
// several pre-existing app modules that use the "@/..." path alias as a
// VALUE import (resolved by Next.js's bundler, not by plain Node module
// resolution). A static top-level `import ... from "./tools/index.ts"` here would
// make orchestrator.ts itself unloadable under `node --test`, which has
// no path-alias resolver -- deferring it to a dynamic import reached only
// at actual request time keeps this file fully portable/testable, and
// every orchestrator test supplies its own fake `tools` so this path is
// never exercised by the test suite at all.
async function getDefaultTools(): Promise<ToolDefinition<unknown>[]> {
  const { ASSISTANT_TOOLS } = await import("./tools/index.ts");
  return ASSISTANT_TOOLS;
}

function findTool(tools: ToolDefinition<unknown>[], name: string): ToolDefinition<unknown> | undefined {
  return tools.find((tool) => tool.name === name);
}

async function executeTool(
  call: AIToolCallRequest,
  context: ToolContext,
  tools: ToolDefinition<unknown>[],
  requestId: string,
): Promise<AIConversationItem> {
  const tool = findTool(tools, call.name);

  if (!tool) {
    // A tool call for a name that isn't in the registry at all -- the only
    // named tools the model was ever offered are `tools` itself (see
    // toolSpecs above), so this means a malformed/hallucinated tool call.
    // Fails the whole request loudly rather than silently no-opting, since
    // there is no safe way to guess what the model actually wanted.
    throw new AssistantError("TOOL_FAILURE", "The assistant attempted an unsupported action.");
  }

  const start = Date.now();
  try {
    const result = await tool.execute(context);
    // Defense-in-depth, independent of each tool's own hand-picked-field
    // mapper -- see security/sanitize.ts.
    assertNoForbiddenFields(result);
    logAssistantEvent({
      requestId,
      event: "tool_call",
      toolName: tool.name,
      durationMs: Date.now() - start,
      success: true,
    });
    return { type: "tool_result", toolCallId: call.id, name: call.name, result };
  } catch (error) {
    // A single tool failing (a Supabase error, a sanitize violation, ...)
    // degrades gracefully -- the model gets told this specific lookup is
    // unavailable and can say so to the user, rather than the whole
    // request failing over one flaky lookup. The real error never leaves
    // the server; only requestId/toolName/duration are logged (see
    // logging.ts).
    logAssistantEvent({
      requestId,
      event: "tool_call",
      toolName: tool.name,
      durationMs: Date.now() - start,
      success: false,
    });
    console.error(`assistant request ${requestId}: tool "${tool.name}" failed:`, error);
    return {
      type: "tool_result",
      toolCallId: call.id,
      name: call.name,
      result: { error: true, message: "This information is temporarily unavailable." },
    };
  }
}
