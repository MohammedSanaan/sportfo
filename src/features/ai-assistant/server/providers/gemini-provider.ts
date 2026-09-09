import { ApiError, GoogleGenAI, Type } from "@google/genai";
import type { Content, FunctionDeclaration, GenerateContentResponseUsageMetadata, Part, Schema, Tool } from "@google/genai";
import { getAIModelConfig } from "./model-config.ts";
import { PROVIDER_MAX_RETRIES, PROVIDER_TIMEOUT_MS } from "../limits.ts";
import { AssistantError } from "../errors.ts";
import type { AIConversationItem, AIGenerateParams, AIGenerateResult, AIProvider, AIToolCallRequest, AIToolSpec, AIUsage } from "./provider.ts";

// The ONLY file in the SportFo Assistant allowed to import the
// @google/genai SDK or know about the Gemini API's request/response
// shapes -- exactly like providers/openai-provider.ts is for OpenAI's
// Responses API. Everything above this (orchestrator, tools, route)
// speaks only the AIProvider/AIConversationItem types in ./provider;
// swapping/adding providers never touches anything else.
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI | null = null;

  async generate(params: AIGenerateParams): Promise<AIGenerateResult> {
    // Reads env (and throws a clear error if unconfigured) on every call,
    // not at construction -- see getAIModelConfig. The client itself is
    // still cached across calls once a key is known to be present.
    const config = getAIModelConfig();
    const client = this.getClient(config.apiKey);

    let parts: Part[];
    let usage: AIUsage | undefined;
    try {
      const response = await client.models.generateContent({
        model: config.model,
        contents: toGeminiContents(params.items),
        config: {
          systemInstruction: toSystemInstruction(params.items),
          tools: toGeminiTools(params.tools),
          maxOutputTokens: params.maxOutputTokens,
          // Bounded, explicit retry count -- never the SDK's own default
          // blind-retry behavior (5 attempts, up to 60s backoff each) left
          // unconfigured (see task spec's RETRY POLICY, and
          // openai-provider.ts's matching PROVIDER_MAX_RETRIES). `attempts`
          // includes the initial call, so +1 matches maxRetries semantics.
          httpOptions: {
            timeout: PROVIDER_TIMEOUT_MS,
            retryOptions: { attempts: PROVIDER_MAX_RETRIES + 1 },
          },
        },
      });
      parts = response.candidates?.[0]?.content?.parts ?? [];
      usage = toAIUsage(response.usageMetadata);
    } catch (error) {
      throw mapGeminiError(error);
    }

    return mapGeminiParts(parts, usage);
  }

  private getClient(apiKey: string): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }
}

// Folds every "system" message into Gemini's dedicated systemInstruction
// field (Gemini's `contents` array only accepts "user"/"model" turns, no
// system role) -- in practice there is always exactly one, from
// system-prompt.ts's buildSystemPrompt, but this stays correct if that
// ever changes.
function isSystemMessage(item: AIConversationItem): item is { type: "message"; role: "system"; content: string } {
  return item.type === "message" && item.role === "system";
}

function toSystemInstruction(items: AIConversationItem[]): string | undefined {
  const systemTexts = items.filter(isSystemMessage).map((item) => item.content);
  return systemTexts.length > 0 ? systemTexts.join("\n\n") : undefined;
}

// Maps SportFo's own conversation representation to Gemini's `contents`
// array. This -- and toGeminiTools/mapGeminiParts below -- are the entire
// translation boundary between SportFo's types and Gemini's; nothing else
// in this file (or anywhere else) needs to know the Gemini API's shape.
function toGeminiContents(items: AIConversationItem[]): Content[] {
  const contents: Content[] = [];

  for (const item of items) {
    if (item.type === "message") {
      if (item.role === "system") continue; // handled by toSystemInstruction instead
      contents.push({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      });
      continue;
    }

    if (item.type === "tool_call") {
      // Echoing the same id back on both the functionCall and the
      // matching functionResponse (below) is what lets Gemini correlate
      // parallel calls -- see FunctionCall.id's docs in the SDK types.
      contents.push({
        role: "model",
        parts: [{ functionCall: { id: item.id, name: item.name, args: item.arguments } }],
      });
      continue;
    }

    contents.push({
      role: "user",
      parts: [{ functionResponse: { id: item.toolCallId, name: item.name, response: toFunctionResponsePayload(item.result) } }],
    });
  }

  return contents;
}

// Gemini's FunctionResponse.response must be a JSON object -- every
// Phase 1A tool result already is one (see tools/mappers/*.ts and
// orchestrator.ts's own `{ error: true, message: ... }` failure shape),
// but this stays safe for any non-object result by wrapping it under an
// "output" key, per the field's own documented convention.
function toFunctionResponsePayload(result: unknown): Record<string, unknown> {
  if (result && typeof result === "object" && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }
  return { output: result };
}

// A 429 is reported as a distinct, safe RATE_LIMITED category rather than
// folded into the orchestrator's generic PROVIDER_UNAVAILABLE catch-all.
// Every other ApiError (invalid key, invalid model, 5xx, ...) is
// downgraded to a plain Error carrying only the status code -- an
// ApiError's own message can include upstream response detail (never the
// API key itself, but still internal) that must not reach a client. A
// non-ApiError failure (network error, timeout's AbortError, ...) is left
// as-is: its message is already provider-detail-free, and orchestrator.ts
// folds it into the same safe PROVIDER_UNAVAILABLE category, exactly like
// providers/openai-provider.ts leaves its own SDK errors to do. Kept as a
// pure function so this mapping is directly testable without a real
// network call (see gemini-provider.test.ts).
function mapGeminiError(error: unknown): Error {
  if (error instanceof ApiError && error.status === 429) {
    return new AssistantError(
      "RATE_LIMITED",
      "Too many assistant requests right now. Please wait a moment and try again.",
    );
  }
  if (error instanceof ApiError) {
    return new Error(`Gemini API error ${error.status}`);
  }
  return error instanceof Error ? error : new Error("Gemini request failed.");
}

function toGeminiTools(tools: AIToolSpec[]): Tool[] | undefined {
  if (tools.length === 0) return undefined;
  return [{ functionDeclarations: tools.map(toFunctionDeclaration) }];
}

function toFunctionDeclaration(tool: AIToolSpec): FunctionDeclaration {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      // AIToolParameterSchema is already a plain JSON-Schema-shaped
      // object; Gemini's Schema.properties is only typed SDK-side as
      // Record<string, Schema>, which every Phase 1A tool's empty
      // `properties: {}` trivially satisfies -- a safe shape cast, not a
      // cast away from a narrower type (see openai-provider.ts's matching
      // `parameters as unknown as ...` cast for its own tool schema).
      properties: tool.parameters.properties as Record<string, Schema>,
      required: tool.parameters.required,
    },
  };
}

function toAIUsage(usageMetadata: GenerateContentResponseUsageMetadata | undefined): AIUsage | undefined {
  if (!usageMetadata) return undefined;
  return {
    inputTokens: usageMetadata.promptTokenCount ?? 0,
    outputTokens: usageMetadata.candidatesTokenCount ?? 0,
  };
}

// Turns the model's response parts into SportFo's own AIGenerateResult.
// Kept as a pure function (parts in, result out) so it -- and every helper
// above -- can be unit tested with plain objects, no real SDK response
// class or network call needed (see gemini-provider.test.ts).
function mapGeminiParts(parts: Part[], usage: AIUsage | undefined): AIGenerateResult {
  const toolCalls = mapFunctionCallParts(parts);
  if (toolCalls.length > 0) {
    return { kind: "tool_calls", toolCalls, usage };
  }

  const textParts = parts.filter((part) => typeof part.text === "string" && !part.thought);
  if (textParts.length > 0) {
    return { kind: "message", content: textParts.map((part) => part.text).join(""), usage };
  }

  // Neither a function call nor any text -- a shape Gemini isn't expected
  // to return in practice (e.g. every candidate blocked before generating
  // anything). Bubbles up as a plain Error, folded into the same safe
  // PROVIDER_UNAVAILABLE category as any other bad response by
  // orchestrator.ts -- never surfaced with any raw response detail.
  throw new Error("Gemini returned a response with no text and no function call.");
}

function mapFunctionCallParts(parts: Part[]): AIToolCallRequest[] {
  return parts
    .filter((part) => part.functionCall)
    .map((part, index) => {
      const call = part.functionCall!;
      // A malformed function call missing its own name can't be routed to
      // any SportFo tool -- fail this call loudly and safely rather than
      // guessing a name; orchestrator.ts's executeTool() already treats an
      // unrecognized tool name as a safe TOOL_FAILURE, so an empty name
      // (never a real registered tool) reaches that same safe path.
      return {
        id: call.id ?? `call_${index}_${call.name ?? "unknown"}`,
        name: call.name ?? "",
        arguments: (call.args as Record<string, unknown> | undefined) ?? {},
      };
    });
}

// Exported for direct unit testing without an API key or network call --
// see gemini-provider.test.ts.
export const __test__ = {
  toSystemInstruction,
  toGeminiContents,
  toFunctionResponsePayload,
  toGeminiTools,
  toFunctionDeclaration,
  toAIUsage,
  mapGeminiParts,
  mapGeminiError,
};
