// The SportFo-owned provider abstraction. Nothing outside
// providers/openai-provider.ts is allowed to import the OpenAI SDK or know
// about the Responses API's request/response shapes -- the orchestrator,
// tools, and route all speak only the types in this file. A future
// non-OpenAI provider (or a second OpenAI model tier) only ever has to
// implement AIProvider; nothing above this layer changes.

// One turn of conversation state. This is intentionally NOT "OpenAI's
// input item" or "a chat completion message" -- it's the minimal shape
// SportFo's own orchestrator needs to represent: plain text turns, a
// request the model made to call a tool, and the result that came back.
// providers/openai-provider.ts is the only place that maps this to (and
// from) an actual provider's wire format.
export type AIConversationItem =
  | { type: "message"; role: "system" | "user" | "assistant"; content: string }
  | { type: "tool_call"; id: string; name: string; arguments: Record<string, unknown> }
  | { type: "tool_result"; toolCallId: string; name: string; result: unknown };

// A minimal JSON-Schema-like shape -- enough to describe a function tool's
// parameters to a provider's function-calling API without ever exposing
// that provider's own tool-schema type up through this abstraction.
export interface AIToolParameterSchema {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
}

export interface AIToolSpec {
  name: string;
  description: string;
  parameters: AIToolParameterSchema;
}

export interface AIToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// Captured whenever a provider reports it (not every provider always
// will) -- internal-only, never returned to a client (see
// server/logging.ts and types/assistant.ts's response body, which has no
// usage field).
export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AIGenerateParams {
  items: AIConversationItem[];
  tools: AIToolSpec[];
  maxOutputTokens: number;
}

export type AIGenerateResult =
  | { kind: "tool_calls"; toolCalls: AIToolCallRequest[]; usage?: AIUsage }
  | { kind: "message"; content: string; usage?: AIUsage };

export interface AIProvider {
  readonly name: string;
  generate(params: AIGenerateParams): Promise<AIGenerateResult>;
}
