import test from "node:test";
import assert from "node:assert/strict";
import { runAssistant } from "./orchestrator.ts";
import { AssistantError } from "./errors.ts";
import type { AIGenerateParams, AIGenerateResult, AIProvider } from "./providers/provider.ts";
import type { ToolDefinition } from "./tools/types.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const fakeUser = { id: "11111111-1111-1111-1111-111111111111", sportfoId: "SF000123" };
// Never touched by any fake tool below -- every test either passes
// tools: [] or a fake tool whose execute() ignores context.supabase.
const fakeSupabase = {} as unknown as SupabaseClient<Database>;

function baseParams(overrides: Partial<Parameters<typeof runAssistant>[0]> = {}) {
  return {
    requestId: "req-test",
    user: fakeUser,
    supabase: fakeSupabase,
    messages: [{ role: "user" as const, content: "hi" }],
    locale: "en",
    tools: [],
    ...overrides,
  };
}

test("returns the provider's final message when no tool call is requested", async () => {
  const provider: AIProvider = { name: "fake", async generate() { return { kind: "message", content: "Hello!" }; } };
  const result = await runAssistant(baseParams({ provider }));
  assert.equal(result.content, "Hello!");
  assert.equal(result.toolRounds, 0);
});

test("the provider can be fully mocked -- no OPENAI_API_KEY or network call needed", async () => {
  let callCount = 0;
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      callCount++;
      return { kind: "message", content: "ok" };
    },
  };
  await runAssistant(baseParams({ provider }));
  assert.equal(callCount, 1);
});

test("tool invocation can be mocked -- the tool's execute() result flows back into the next provider call", async () => {
  let executed = false;
  const fakeTool: ToolDefinition<{ ok: boolean }> = {
    name: "getMyIdentity",
    description: "fake",
    parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    async execute() {
      executed = true;
      return { ok: true };
    },
  };

  let round = 0;
  const provider: AIProvider = {
    name: "fake",
    async generate(params: AIGenerateParams): Promise<AIGenerateResult> {
      round++;
      if (round === 1) {
        return { kind: "tool_calls", toolCalls: [{ id: "call_1", name: "getMyIdentity", arguments: {} }] };
      }
      const toolResult = params.items.find((item) => item.type === "tool_result");
      assert.ok(toolResult && toolResult.type === "tool_result" && toolResult.toolCallId === "call_1");
      return { kind: "message", content: "Done" };
    },
  };

  const result = await runAssistant(baseParams({ provider, tools: [fakeTool] }));
  assert.equal(executed, true);
  assert.equal(result.content, "Done");
  assert.equal(result.toolRounds, 1);
});

test("the tool loop terminates at MAX_TOOL_ROUNDS instead of looping forever", async () => {
  let calls = 0;
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      calls++;
      return { kind: "tool_calls", toolCalls: [{ id: `call_${calls}`, name: "getMyIdentity", arguments: {} }] };
    },
  };
  const fakeTool: ToolDefinition<{ ok: boolean }> = {
    name: "getMyIdentity",
    description: "fake",
    parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    async execute() {
      return { ok: true };
    },
  };

  await assert.rejects(
    runAssistant(baseParams({ provider, tools: [fakeTool] })),
    (error: unknown) => error instanceof AssistantError && error.category === "TOOL_FAILURE",
  );
  assert.equal(calls, 4); // MAX_TOOL_ROUNDS
});

test("a malformed/hallucinated tool call (unknown tool name) fails safely, not with a crash", async () => {
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      return { kind: "tool_calls", toolCalls: [{ id: "call_1", name: "doesNotExist", arguments: {} }] };
    },
  };

  await assert.rejects(
    runAssistant(baseParams({ provider, tools: [] })),
    (error: unknown) => error instanceof AssistantError && error.category === "TOOL_FAILURE",
  );
});

test("a tool that throws degrades gracefully -- the request still completes instead of failing entirely", async () => {
  const flakyTool: ToolDefinition<unknown> = {
    name: "getMyAchievements",
    description: "fake",
    parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    async execute() {
      throw new Error("supabase boom");
    },
  };
  let round = 0;
  const provider: AIProvider = {
    name: "fake",
    async generate(params: AIGenerateParams) {
      round++;
      if (round === 1) {
        return { kind: "tool_calls", toolCalls: [{ id: "call_1", name: "getMyAchievements", arguments: {} }] };
      }
      const toolResult = params.items.find((item) => item.type === "tool_result");
      assert.ok(toolResult && toolResult.type === "tool_result");
      if (toolResult && toolResult.type === "tool_result") {
        assert.equal((toolResult.result as { error?: boolean }).error, true);
      }
      return { kind: "message", content: "Sorry, that's unavailable." };
    },
  };

  const result = await runAssistant(baseParams({ provider, tools: [flakyTool] }));
  assert.equal(result.content, "Sorry, that's unavailable.");
});

test("a tool result carrying a forbidden field (e.g. Aadhaar) is caught by the safety net before it reaches the model", async () => {
  const leakyTool: ToolDefinition<unknown> = {
    name: "getMyProfileSummary",
    description: "fake",
    parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    async execute() {
      return { aadhaarOrGovtId: "1234-5678-9999" };
    },
  };
  let round = 0;
  const provider: AIProvider = {
    name: "fake",
    async generate(params: AIGenerateParams) {
      round++;
      if (round === 1) {
        return { kind: "tool_calls", toolCalls: [{ id: "call_1", name: "getMyProfileSummary", arguments: {} }] };
      }
      const toolResultItem = params.items.find((item) => item.type === "tool_result");
      const serialized = JSON.stringify(
        toolResultItem && toolResultItem.type === "tool_result" ? toolResultItem.result : null,
      );
      assert.equal(serialized.includes("1234-5678-9999"), false);
      return { kind: "message", content: "ok" };
    },
  };

  await runAssistant(baseParams({ provider, tools: [leakyTool] }));
});

test("a raw provider error is wrapped into a safe PROVIDER_UNAVAILABLE AssistantError, never leaked", async () => {
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      throw new Error("connection reset by peer at 10.0.0.5:443 -- internal detail");
    },
  };

  await assert.rejects(runAssistant(baseParams({ provider })), (error: unknown) => {
    assert.ok(error instanceof AssistantError);
    assert.equal((error as AssistantError).category, "PROVIDER_UNAVAILABLE");
    assert.equal((error as Error).message.includes("10.0.0.5"), false);
    return true;
  });
});
