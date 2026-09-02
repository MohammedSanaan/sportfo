import test from "node:test";
import assert from "node:assert/strict";
import { __test__ } from "./openai-provider.ts";

const { toResponsesInput, toResponsesTools, safeParseArguments } = __test__;

test("maps a plain message item to a Responses API message input", () => {
  const [item] = toResponsesInput([{ type: "message", role: "user", content: "hello" }]);
  assert.deepEqual(item, { type: "message", role: "user", content: "hello" });
});

test("maps a tool_call item to a function_call input with JSON-stringified arguments", () => {
  const [item] = toResponsesInput([{ type: "tool_call", id: "call_1", name: "getMyIdentity", arguments: {} }]);
  assert.deepEqual(item, { type: "function_call", call_id: "call_1", name: "getMyIdentity", arguments: "{}" });
});

test("maps a tool_result item to a function_call_output input with JSON-stringified result", () => {
  const [item] = toResponsesInput([
    { type: "tool_result", toolCallId: "call_1", name: "getMyIdentity", result: { sportfoId: "SF1" } },
  ]);
  assert.deepEqual(item, {
    type: "function_call_output",
    call_id: "call_1",
    output: JSON.stringify({ sportfoId: "SF1" }),
  });
});

test("maps an AIToolSpec to a strict OpenAI function tool -- never a generic runSql/queryDatabase escape hatch", () => {
  const [tool] = toResponsesTools([
    {
      name: "getMyIdentity",
      description: "desc",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  ]);
  assert.equal(tool.type, "function");
  assert.equal(tool.name, "getMyIdentity");
  assert.equal(tool.strict, true);
});

test("safeParseArguments parses a valid JSON object string", () => {
  assert.deepEqual(safeParseArguments('{"a":1}'), { a: 1 });
});

test("safeParseArguments returns {} for empty, malformed, or non-object JSON -- never throws", () => {
  assert.deepEqual(safeParseArguments(""), {});
  assert.deepEqual(safeParseArguments("not json"), {});
  assert.deepEqual(safeParseArguments("[1,2,3]"), {});
  assert.deepEqual(safeParseArguments('"just a string"'), {});
});
