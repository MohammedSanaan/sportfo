import OpenAI from "openai";
import { getAIModelConfig } from "./model-config.ts";
import { PROVIDER_MAX_RETRIES, PROVIDER_TIMEOUT_MS } from "../limits.ts";
import type {
  AIConversationItem,
  AIGenerateParams,
  AIGenerateResult,
  AIProvider,
  AIToolSpec,
} from "./provider.ts";

type ResponsesInputItem = OpenAI.Responses.ResponseInputItem;
type ResponsesTool = OpenAI.Responses.Tool;
type ResponsesFunctionToolCall = OpenAI.Responses.ResponseFunctionToolCall;

// The ONLY file in the SportFo Assistant allowed to import the OpenAI SDK
// or know about the Responses API's request/response shapes. Everything
// above this (orchestrator, tools, route) speaks only the
// AIProvider/AIConversationItem types in ./provider, which are entirely
// SportFo-owned -- swapping providers later means writing a new class
// here, not touching anything else.
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI | null = null;

  async generate(params: AIGenerateParams): Promise<AIGenerateResult> {
    // Reads env (and throws a clear error if unconfigured) on every call,
    // not at construction -- see getAIModelConfig. The client itself is
    // still cached across calls once a key is known to be present.
    const config = getAIModelConfig();
    const client = this.getClient(config.apiKey);

    const response = await client.responses.create(
      {
        model: config.model,
        input: toResponsesInput(params.items),
        tools: toResponsesTools(params.tools),
        tool_choice: params.tools.length > 0 ? "auto" : "none",
        max_output_tokens: params.maxOutputTokens,
        stream: false,
      },
      { timeout: PROVIDER_TIMEOUT_MS },
    );

    const usage = response.usage
      ? { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens }
      : undefined;

    const toolCalls = response.output.filter(
      (item): item is ResponsesFunctionToolCall => item.type === "function_call",
    );

    if (toolCalls.length > 0) {
      return {
        kind: "tool_calls",
        toolCalls: toolCalls.map((call) => ({
          id: call.call_id,
          name: call.name,
          arguments: safeParseArguments(call.arguments),
        })),
        usage,
      };
    }

    return { kind: "message", content: response.output_text ?? "", usage };
  }

  private getClient(apiKey: string): OpenAI {
    if (!this.client) {
      // Bounded, explicit retry count -- never the SDK's own default
      // blind-retry behavior left unconfigured (see task spec's RETRY
      // POLICY: only small, bounded retries for transient failures).
      this.client = new OpenAI({ apiKey, maxRetries: PROVIDER_MAX_RETRIES });
    }
    return this.client;
  }
}

// Maps SportFo's own conversation representation to the Responses API's
// `input` array. This -- and toResponsesTools below -- are the entire
// translation boundary between SportFo's types and OpenAI's; nothing else
// in this file (or anywhere else) needs to know the Responses API's shape.
function toResponsesInput(items: AIConversationItem[]): ResponsesInputItem[] {
  return items.map((item): ResponsesInputItem => {
    if (item.type === "message") {
      return { type: "message", role: item.role, content: item.content };
    }
    if (item.type === "tool_call") {
      return {
        type: "function_call",
        call_id: item.id,
        name: item.name,
        arguments: JSON.stringify(item.arguments),
      };
    }
    return {
      type: "function_call_output",
      call_id: item.toolCallId,
      output: JSON.stringify(item.result),
    };
  });
}

function toResponsesTools(tools: AIToolSpec[]): ResponsesTool[] {
  return tools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    // AIToolParameterSchema is already a plain JSON-Schema object;
    // FunctionTool.parameters is only typed SDK-side as an untyped index
    // signature (`{[key: string]: unknown} | null`), which TypeScript
    // doesn't structurally match against our named-fields interface even
    // though every value is compatible -- a safe shape cast, not a cast
    // away from a narrower type.
    parameters: tool.parameters as unknown as Record<string, unknown>,
    strict: true,
  }));
}

function safeParseArguments(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    // A malformed/non-JSON arguments string from the model -- treated as
    // no arguments rather than thrown. Every Phase 1A tool takes zero
    // model-supplied arguments anyway (see tools/types.ts's
    // EMPTY_TOOL_PARAMETERS), so this only matters as a defensive default
    // for whatever a future tool-with-arguments might receive.
    return {};
  }
}

// Exported for direct unit testing without an API key or network call --
// see openai-provider.test.ts.
export const __test__ = { toResponsesInput, toResponsesTools, safeParseArguments };
