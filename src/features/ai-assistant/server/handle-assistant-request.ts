import { randomUUID } from "node:crypto";
import type { AIProvider } from "./providers/provider.ts";
import type { ResolvedAuth } from "./security/authorization.ts";
import { validateAssistantRequest } from "./validate-request.ts";
import { runAssistant } from "./orchestrator.ts";
import type { ToolDefinition } from "./tools/types.ts";
import { AssistantError, statusForCategory } from "./errors.ts";
import { assistantRateLimiter } from "./rate-limit.ts";
import { SPORTFO_ASSISTANT_PROMPT_VERSION } from "./system-prompt.ts";
import { logAssistantEvent } from "./logging.ts";
import type { AssistantChatResponseBody, AssistantErrorResponseBody } from "./types/assistant.ts";

export interface HandleAssistantRequestParams {
  auth: ResolvedAuth | null;
  rawBody: unknown;
  // Test-only injection points -- production never passes these, so
  // runAssistant falls back to the real provider/tool registry.
  provider?: AIProvider;
  tools?: ToolDefinition<unknown>[];
}

export interface HandleAssistantRequestResult {
  status: number;
  body: AssistantChatResponseBody | AssistantErrorResponseBody;
}

// The entire assistant request pipeline -- auth gate, rate limit,
// validate, orchestrate, map errors to a safe response -- as a plain
// function with zero dependency on Next.js's request-scoped APIs. This is
// deliberately factored OUT of app/api/assistant/route.ts (which stays a
// thin transport/controller layer that only resolves auth from the real
// Request and parses its JSON body) so the whole pipeline can be unit
// tested directly, and so the same pipeline could be called from a
// different transport later (a different route, a queue worker, ...)
// without duplicating any of this logic.
export async function handleAssistantRequest(
  params: HandleAssistantRequestParams,
): Promise<HandleAssistantRequestResult> {
  const requestId = randomUUID();
  const start = Date.now();

  try {
    if (!params.auth) {
      throw new AssistantError("UNAUTHENTICATED", "Sign in to use the SportFo Assistant.");
    }
    const { user, supabase } = params.auth;

    const rateLimit = assistantRateLimiter.check(user.id);
    if (!rateLimit.allowed) {
      throw new AssistantError("RATE_LIMITED", "Too many assistant requests. Please wait a moment and try again.");
    }

    const validation = validateAssistantRequest(params.rawBody);
    if (!validation.ok) {
      throw new AssistantError("INVALID_REQUEST", validation.message);
    }

    const result = await runAssistant({
      requestId,
      user,
      supabase,
      messages: validation.value.messages,
      locale: validation.value.locale ?? "en",
      provider: params.provider,
      tools: params.tools,
    });

    logAssistantEvent({
      requestId,
      event: "request_success",
      durationMs: Date.now() - start,
      success: true,
    });

    return {
      status: 200,
      body: {
        message: { role: "assistant", content: result.content },
        meta: { requestId, promptVersion: SPORTFO_ASSISTANT_PROMPT_VERSION },
      },
    };
  } catch (error) {
    const assistantError =
      error instanceof AssistantError
        ? error
        : new AssistantError("INTERNAL_ERROR", "Something went wrong. Please try again.");

    if (!(error instanceof AssistantError)) {
      // Only a truly-unexpected error's raw detail is logged, and only
      // server-side, correlatable by requestId -- the client only ever
      // gets the generic INTERNAL_ERROR message constructed above, never
      // this error's own message or stack (see the safe body below).
      console.error(`assistant request ${requestId} failed:`, error);
    }

    logAssistantEvent({
      requestId,
      event: "request_error",
      durationMs: Date.now() - start,
      success: false,
      errorCategory: assistantError.category,
    });

    return {
      status: statusForCategory(assistantError.category),
      body: { error: { category: assistantError.category, message: assistantError.message, requestId } },
    };
  }
}
