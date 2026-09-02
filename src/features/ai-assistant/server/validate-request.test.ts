import test from "node:test";
import assert from "node:assert/strict";
import { validateAssistantRequest } from "./validate-request.ts";
import { MAX_HISTORY_MESSAGES, MAX_INPUT_CHARS_PER_MESSAGE } from "./limits.ts";

test("accepts a well-formed single-message request", () => {
  assert.equal(
    validateAssistantRequest({ messages: [{ role: "user", content: "What is my profile strength?" }] }).ok,
    true,
  );
});

test("rejects a non-object body", () => {
  assert.equal(validateAssistantRequest("nope").ok, false);
  assert.equal(validateAssistantRequest(null).ok, false);
  assert.equal(validateAssistantRequest(undefined).ok, false);
  assert.equal(validateAssistantRequest(42).ok, false);
});

test("rejects a body with no messages array", () => {
  assert.equal(validateAssistantRequest({}).ok, false);
  assert.equal(validateAssistantRequest({ messages: [] }).ok, false);
  assert.equal(validateAssistantRequest({ messages: "hi" }).ok, false);
});

test('rejects a userId/user_id/ownerId-style field -- the client cannot choose another user', () => {
  for (const key of ["userId", "user_id", "authUserId", "auth_user_id", "ownerId", "owner_id"]) {
    const body = { messages: [{ role: "user", content: "hi" }], [key]: "someone-elses-uuid" };
    assert.equal(validateAssistantRequest(body).ok, false, `expected "${key}" to be rejected`);
  }
});

test("rejects more than MAX_HISTORY_MESSAGES entries", () => {
  const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 1 }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: "hi",
  }));
  assert.equal(validateAssistantRequest({ messages }).ok, false);
});

test("rejects a message over the per-message character limit", () => {
  const body = { messages: [{ role: "user", content: "a".repeat(MAX_INPUT_CHARS_PER_MESSAGE + 1) }] };
  assert.equal(validateAssistantRequest(body).ok, false);
});

test("rejects combined content over the total conversation character limit", () => {
  const bigMessage = "a".repeat(MAX_INPUT_CHARS_PER_MESSAGE);
  const messages = Array.from({ length: MAX_HISTORY_MESSAGES }, (_, i) => ({
    role: i % 2 === 0 ? "assistant" : "user",
    content: bigMessage,
  }));
  messages[messages.length - 1] = { role: "user", content: bigMessage };
  assert.equal(validateAssistantRequest({ messages }).ok, false);
});

test("rejects an empty/whitespace-only message", () => {
  assert.equal(validateAssistantRequest({ messages: [{ role: "user", content: "   " }] }).ok, false);
});

test("rejects an invalid role", () => {
  assert.equal(validateAssistantRequest({ messages: [{ role: "system", content: "hi" }] }).ok, false);
});

test("rejects a conversation that doesn't end on a user message", () => {
  const body = {
    messages: [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ],
  };
  assert.equal(validateAssistantRequest(body).ok, false);
});

test("falls back to the default locale for an unrecognized locale instead of rejecting the request", () => {
  const result = validateAssistantRequest({ messages: [{ role: "user", content: "hi" }], locale: "xx-not-real" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.locale, "en");
});

test("accepts a recognized supported locale", () => {
  const result = validateAssistantRequest({ messages: [{ role: "user", content: "hi" }], locale: "hi" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.locale, "hi");
});

test("rejects a non-string locale", () => {
  const result = validateAssistantRequest({ messages: [{ role: "user", content: "hi" }], locale: 5 });
  assert.equal(result.ok, false);
});
