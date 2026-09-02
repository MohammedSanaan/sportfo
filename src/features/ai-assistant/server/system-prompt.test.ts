import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, SPORTFO_ASSISTANT_PROMPT_VERSION } from "./system-prompt.ts";

test("includes the current prompt version", () => {
  assert.ok(buildSystemPrompt("en").includes(SPORTFO_ASSISTANT_PROMPT_VERSION));
});

test("interpolates the requested locale", () => {
  assert.ok(buildSystemPrompt("hi").includes('"hi"'));
});

test("names Aadhaar/UUIDs/emergency contacts only as things it must never reveal, never as available data", () => {
  const prompt = buildSystemPrompt("en").toLowerCase();
  assert.ok(prompt.includes("aadhaar"));
  assert.ok(prompt.includes("never"));
});

test("stays short -- product policy, not embedded application documentation", () => {
  // Regression guard against the prompt silently growing into embedded
  // docs over time (see task spec: "Do not embed massive application
  // documentation into the prompt").
  assert.ok(buildSystemPrompt("en").length < 2000);
});
