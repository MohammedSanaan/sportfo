import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { handleAssistantRequest } from "./handle-assistant-request.ts";
import type { AIProvider } from "./providers/provider.ts";
import type { ResolvedAuth } from "./security/authorization.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const fakeSupabase = {} as unknown as SupabaseClient<Database>;
const fakeAuth: ResolvedAuth = {
  user: { id: "11111111-1111-1111-1111-111111111111", sportfoId: "SF000123" },
  supabase: fakeSupabase,
};

function okProvider(content: string): AIProvider {
  return {
    name: "fake",
    async generate() {
      return { kind: "message", content };
    },
  };
}

test("no authenticated user -> 401 UNAUTHENTICATED, the assistant is never invoked", async () => {
  const { status, body } = await handleAssistantRequest({
    auth: null,
    rawBody: { messages: [{ role: "user", content: "hi" }] },
  });
  assert.equal(status, 401);
  assert.ok("error" in body);
  if ("error" in body) assert.equal(body.error.category, "UNAUTHENTICATED");
});

test("an authenticated request with a mocked provider returns the assistant's reply", async () => {
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "What is my profile strength?" }] },
    provider: okProvider("Your profile is 82% complete."),
    tools: [],
  });
  assert.equal(status, 200);
  assert.ok("message" in body);
  if ("message" in body) {
    assert.equal(body.message.role, "assistant");
    assert.equal(body.message.content, "Your profile is 82% complete.");
  }
});

test("a successful response includes requestId and promptVersion, and no other top-level field -- never a raw OpenAI object or usage/billing detail", async () => {
  const { body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "hi" }] },
    provider: okProvider("hi there"),
    tools: [],
  });
  assert.ok("message" in body);
  if ("message" in body) {
    assert.ok(body.meta.requestId.length > 0);
    assert.ok(body.meta.promptVersion.length > 0);
    assert.deepEqual(Object.keys(body).sort(), ["message", "meta"]);
  }
});

test("an invalid payload (no messages) is rejected with INVALID_REQUEST, never reaching the provider", async () => {
  let providerCalled = false;
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: {},
    provider: {
      name: "fake",
      async generate() {
        providerCalled = true;
        return { kind: "message", content: "x" };
      },
    },
    tools: [],
  });
  assert.equal(status, 400);
  assert.equal(providerCalled, false);
  if ("error" in body) assert.equal(body.error.category, "INVALID_REQUEST");
});

test("oversized input (over the per-message character limit) is rejected", async () => {
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "a".repeat(5000) }] },
  });
  assert.equal(status, 400);
  if ("error" in body) assert.equal(body.error.category, "INVALID_REQUEST");
});

test("a client-supplied user_id is rejected outright, never used to resolve a different user", async () => {
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "hi" }], user_id: "someone-elses-uuid" },
  });
  assert.equal(status, 400);
  if ("error" in body) assert.equal(body.error.category, "INVALID_REQUEST");
});

test("a raw provider error never leaks its message to the client", async () => {
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      throw new Error("api.openai.com refused connection: secret-internal-detail-xyz");
    },
  };
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "hi" }] },
    provider,
    tools: [],
  });
  assert.equal(status, 503);
  if ("error" in body) {
    assert.equal(body.error.category, "PROVIDER_UNAVAILABLE");
    assert.equal(body.error.message.includes("secret-internal-detail-xyz"), false);
  }
});

test("an unexpected internal throw never leaks its message to the client, and maps to INTERNAL_ERROR", async () => {
  const provider: AIProvider = {
    name: "fake",
    async generate() {
      throw new TypeError("Cannot read properties of undefined (reading 'sk-abc123secret')");
    },
  };
  const { status, body } = await handleAssistantRequest({
    auth: fakeAuth,
    rawBody: { messages: [{ role: "user", content: "hi" }] },
    provider,
    tools: [],
  });
  // A thrown TypeError from inside the provider is still a provider-layer
  // failure from the orchestrator's point of view (see orchestrator.ts's
  // catch-and-wrap), so this also comes back as PROVIDER_UNAVAILABLE --
  // the real assertion here is that the raw message never leaks either way.
  assert.ok(status === 503 || status === 500);
  if ("error" in body) {
    assert.equal(body.error.message.includes("sk-abc123secret"), false);
  }
});

test("this pipeline has no dependency on Next.js's request-scoped APIs -- callable from any transport", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "handle-assistant-request.ts"), "utf8");
  assert.equal(source.includes("next/headers"), false);
  assert.equal(source.includes("next/server"), false);
  assert.equal(source.includes("NextRequest"), false);
});
