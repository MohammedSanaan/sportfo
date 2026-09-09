import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "@google/genai";
import { AssistantError } from "../errors.ts";
import { GeminiProvider, __test__ } from "./gemini-provider.ts";

const { toSystemInstruction, toGeminiContents, toFunctionResponsePayload, toGeminiTools, toFunctionDeclaration, toAIUsage, mapGeminiParts, mapGeminiError } = __test__;

test("folds system-role messages into a single systemInstruction string, not into contents", () => {
  const instruction = toSystemInstruction([
    { type: "message", role: "system", content: "You are the SportFo Assistant." },
    { type: "message", role: "user", content: "hi" },
  ]);
  assert.equal(instruction, "You are the SportFo Assistant.");
});

test("returns undefined systemInstruction when there is no system message", () => {
  assert.equal(toSystemInstruction([{ type: "message", role: "user", content: "hi" }]), undefined);
});

test("maps a user/assistant message to Gemini's user/model roles, excluding system messages", () => {
  const contents = toGeminiContents([
    { type: "message", role: "system", content: "policy" },
    { type: "message", role: "user", content: "hello" },
    { type: "message", role: "assistant", content: "hi there" },
  ]);
  assert.deepEqual(contents, [
    { role: "user", parts: [{ text: "hello" }] },
    { role: "model", parts: [{ text: "hi there" }] },
  ]);
});

test("maps a tool_call item to a model-role functionCall part, echoing the same id", () => {
  const [item] = toGeminiContents([{ type: "tool_call", id: "call_1", name: "getMyIdentity", arguments: {} }]);
  assert.deepEqual(item, { role: "model", parts: [{ functionCall: { id: "call_1", name: "getMyIdentity", args: {} } }] });
});

test("maps a tool_result item to a user-role functionResponse part with the matching id", () => {
  const [item] = toGeminiContents([
    { type: "tool_result", toolCallId: "call_1", name: "getMyIdentity", result: { sportfoId: "SF1" } },
  ]);
  assert.deepEqual(item, {
    role: "user",
    parts: [{ functionResponse: { id: "call_1", name: "getMyIdentity", response: { sportfoId: "SF1" } } }],
  });
});

test("toFunctionResponsePayload passes an object result through unchanged", () => {
  assert.deepEqual(toFunctionResponsePayload({ percentage: 82, missingItems: ["profilePhoto"] }), {
    percentage: 82,
    missingItems: ["profilePhoto"],
  });
});

test("toFunctionResponsePayload wraps a non-object result under an 'output' key -- Gemini requires an object", () => {
  assert.deepEqual(toFunctionResponsePayload("plain string"), { output: "plain string" });
  assert.deepEqual(toFunctionResponsePayload(null), { output: null });
  assert.deepEqual(toFunctionResponsePayload([1, 2, 3]), { output: [1, 2, 3] });
});

test("toGeminiTools returns undefined for an empty tool list -- omitted rather than sent empty", () => {
  assert.equal(toGeminiTools([]), undefined);
});

test("maps SportFo tool specs to a single Gemini Tool with one functionDeclaration per tool -- never a generic runSql/queryDatabase escape hatch", () => {
  const [tool] = toGeminiTools([
    { name: "getMyIdentity", description: "desc 1", parameters: { type: "object", properties: {}, required: [], additionalProperties: false } },
    { name: "getMyAchievements", description: "desc 2", parameters: { type: "object", properties: {}, required: [], additionalProperties: false } },
  ])!;
  assert.equal(tool.functionDeclarations?.length, 2);
  assert.equal(tool.functionDeclarations?.[0]?.name, "getMyIdentity");
  assert.equal(tool.functionDeclarations?.[1]?.name, "getMyAchievements");
});

test("toFunctionDeclaration maps an AIToolSpec to a Gemini OBJECT-typed function declaration", () => {
  const declaration = toFunctionDeclaration({
    name: "getMyIdentity",
    description: "Look up the current user's identity",
    parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
  });
  assert.equal(declaration.name, "getMyIdentity");
  assert.equal(declaration.description, "Look up the current user's identity");
  assert.equal(declaration.parameters?.type, "OBJECT");
  assert.deepEqual(declaration.parameters?.properties, {});
  assert.deepEqual(declaration.parameters?.required, []);
});

test("toAIUsage maps Gemini's usageMetadata into SportFo's AIUsage shape", () => {
  assert.deepEqual(toAIUsage({ promptTokenCount: 120, candidatesTokenCount: 45 }), { inputTokens: 120, outputTokens: 45 });
});

test("toAIUsage returns undefined when usageMetadata is absent -- matches openai-provider's optional usage", () => {
  assert.equal(toAIUsage(undefined), undefined);
});

test("toAIUsage defaults a missing token count to 0 rather than leaking undefined", () => {
  assert.deepEqual(toAIUsage({ promptTokenCount: 10 }), { inputTokens: 10, outputTokens: 0 });
});

test("mapGeminiParts maps a single functionCall part to a tool_calls result", () => {
  const result = mapGeminiParts([{ functionCall: { id: "call_1", name: "getMyIdentity", args: {} } }], undefined);
  assert.deepEqual(result, {
    kind: "tool_calls",
    toolCalls: [{ id: "call_1", name: "getMyIdentity", arguments: {} }],
    usage: undefined,
  });
});

test("mapGeminiParts supports multiple function calls returned in one model turn", () => {
  const result = mapGeminiParts(
    [
      { functionCall: { id: "call_1", name: "getMyIdentity", args: {} } },
      { functionCall: { id: "call_2", name: "getMyAchievements", args: {} } },
    ],
    undefined,
  );
  assert.equal(result.kind, "tool_calls");
  assert.equal(result.kind === "tool_calls" && result.toolCalls.length, 2);
  assert.equal(result.kind === "tool_calls" && result.toolCalls[1]?.name, "getMyAchievements");
});

test("mapGeminiParts generates a stable synthetic id when Gemini omits FunctionCall.id", () => {
  const result = mapGeminiParts([{ functionCall: { name: "getMyIdentity", args: {} } }], undefined);
  assert.equal(result.kind, "tool_calls");
  assert.ok(result.kind === "tool_calls" && typeof result.toolCalls[0]?.id === "string" && result.toolCalls[0].id.length > 0);
});

test("mapGeminiParts treats a malformed function call missing its name as an unroutable tool call, not a crash", () => {
  const result = mapGeminiParts([{ functionCall: { args: {} } }], undefined);
  assert.equal(result.kind, "tool_calls");
  // An empty name never matches any registered SportFo tool -- orchestrator.ts's
  // executeTool() already turns an unrecognized name into a safe TOOL_FAILURE.
  assert.equal(result.kind === "tool_calls" && result.toolCalls[0]?.name, "");
});

test("mapGeminiParts maps text-only parts to a message result, joining multiple text parts", () => {
  const result = mapGeminiParts([{ text: "Hello, " }, { text: "world." }], { inputTokens: 5, outputTokens: 2 });
  assert.deepEqual(result, { kind: "message", content: "Hello, world.", usage: { inputTokens: 5, outputTokens: 2 } });
});

test("mapGeminiParts excludes thought parts from the final text", () => {
  const result = mapGeminiParts([{ text: "internal reasoning", thought: true }, { text: "the real answer" }], undefined);
  assert.deepEqual(result, { kind: "message", content: "the real answer", usage: undefined });
});

test("mapGeminiParts fails safely (throws) on a response with neither text nor a function call -- never a silently empty reply", () => {
  assert.throws(() => mapGeminiParts([], undefined), /no text and no function call/);
});

test("mapGeminiError maps a 429 ApiError to a safe RATE_LIMITED AssistantError, never leaking the raw SDK message", () => {
  const error = mapGeminiError(new ApiError({ message: "quota exceeded for project internal-detail-123", status: 429 }));
  assert.ok(error instanceof AssistantError);
  assert.equal((error as AssistantError).category, "RATE_LIMITED");
  assert.equal(error.message.includes("internal-detail-123"), false);
});

test("mapGeminiError sanitizes a non-429 ApiError to a generic Error carrying only the status, never the raw SDK message", () => {
  const error = mapGeminiError(new ApiError({ message: "invalid API key AIzaSy-secret-detail", status: 400 }));
  assert.ok(!(error instanceof AssistantError));
  assert.equal(error.message.includes("AIzaSy-secret-detail"), false);
  assert.match(error.message, /400/);
});

test("mapGeminiError sanitizes a provider-unavailable 503 ApiError the same way", () => {
  const error = mapGeminiError(new ApiError({ message: "upstream detail", status: 503 }));
  assert.ok(!(error instanceof AssistantError));
  assert.equal(error.message.includes("upstream detail"), false);
});

test("mapGeminiError passes a timeout (AbortError) through unchanged -- its message is already provider-detail-free, and orchestrator.ts folds it into PROVIDER_UNAVAILABLE", () => {
  const abortError = new DOMException("This operation was aborted", "AbortError");
  const error = mapGeminiError(abortError);
  assert.equal(error, abortError);
  assert.equal(error.name, "AbortError");
});

test("mapGeminiError never throws itself and always returns an Error, even for a non-Error rejection", () => {
  const error = mapGeminiError("a raw string rejection");
  assert.ok(error instanceof Error);
});

test("GeminiProvider is constructed with name 'gemini' and never reads GEMINI_API_KEY at construction time", () => {
  const previous = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const provider = new GeminiProvider();
    assert.equal(provider.name, "gemini");
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});

test("GeminiProvider.generate() throws a safe config error (not a raw SDK error) when GEMINI_API_KEY is missing", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.AI_PROVIDER = "gemini";
  delete process.env.GEMINI_API_KEY;
  try {
    const provider = new GeminiProvider();
    await assert.rejects(
      provider.generate({ items: [], tools: [], maxOutputTokens: 800 }),
      /GEMINI_API_KEY is not configured/,
    );
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
