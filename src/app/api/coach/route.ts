import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedUser } from "@/features/ai-assistant/server/security/authorization";
import { runAssistant } from "@/features/ai-assistant/server/orchestrator";
import { validateAssistantRequest } from "@/features/ai-assistant/server/validate-request";
import { AssistantError, statusForCategory } from "@/features/ai-assistant/server/errors";
import { logAssistantEvent } from "@/features/ai-assistant/server/logging";
import { buildCoachSystemInstruction } from "@/lib/coach/systemInstruction";
import { getClientIp, isRateLimited } from "@/lib/coach/rateLimit";
import type { CoachErrorBody, CoachMessage, CoachRequestBody, CoachResponseBody } from "@/lib/coach/types";

// Coach's public, guest-friendly entry point. As of this migration it no
// longer talks to Gemini itself (no SDK import, no API key read, no raw
// REST fetch) -- it is a thin adapter in front of the exact same
// orchestrator/provider/tool stack /api/assistant uses (see
// features/ai-assistant/server/orchestrator.ts), so SportFo has ONE AI
// backend, not two. This file's only remaining jobs: rate-limit an
// unauthenticated route, optionally resolve a real signed-in identity
// (enabling real tool calls), fold Coach's persona/knowledge/page-context
// into the current turn, and translate the result back into Coach's own
// wire shape -- unchanged from before, so the client needs no contract
// migration beyond dropping the old SSE stream (see coachService.ts).
//
// Deliberately NOT routed through handle-assistant-request.ts: that
// module's UNAUTHENTICATED throw is correct for /api/assistant (a
// profile-data API that requires a real identity) but wrong for Coach,
// whose primary use case is guiding signed-out visitors around the public
// site. Calling runAssistant() directly, with an empty tool list for
// guests, achieves that without touching /api/assistant's own auth
// contract or the orchestrator itself.
const GENERIC_ERROR = "I'm having a little trouble connecting right now. Please try again in a moment.";

function errorResponse(message: string, status: number): Response {
  const body: CoachErrorBody = { error: message };
  return Response.json(body, { status });
}

function isValidMessage(value: unknown): value is CoachMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    "content" in value &&
    (value as CoachMessage).role !== undefined &&
    typeof (value as CoachMessage).content === "string"
  );
}

function toAssistantRole(role: CoachMessage["role"]): "user" | "assistant" {
  return role === "coach" ? "assistant" : "user";
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const start = Date.now();

  // Guards a paid, unauthenticated route from being hammered by a script
  // rather than a person -- see src/lib/coach/rateLimit.ts for the
  // trade-offs of this single-instance, in-memory approach. Unchanged from
  // before this migration.
  if (isRateLimited(getClientIp(request))) {
    return errorResponse("I'm getting a lot of questions right now. Please try again in a moment.", 429);
  }

  let rawBody: CoachRequestBody;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse("That request didn't come through correctly. Please try again.", 400);
  }

  if (!Array.isArray(rawBody?.messages) || rawBody.messages.length === 0 || !rawBody.messages.every(isValidMessage)) {
    return errorResponse("That request didn't come through correctly. Please try again.", 400);
  }

  // Reuses the exact same validation/limits the assistant applies (message
  // count, per-message and total character caps, locale resolution) --
  // see validate-request.ts, which is left completely unchanged. Coach's
  // own "coach" role is remapped to "assistant" first since that module
  // only knows the assistant's user/assistant vocabulary.
  const validation = validateAssistantRequest({
    messages: rawBody.messages.map((message) => ({ role: toAssistantRole(message.role), content: message.content })),
    locale: rawBody.context?.locale,
  });
  if (!validation.ok) {
    return errorResponse("That request didn't come through correctly. Please try again.", 400);
  }

  const auth = await resolveAuthenticatedUser(request);

  // Folds Coach's persona, verified SportFo knowledge base, and
  // current-page context into the CURRENT turn only (never into earlier
  // history already in the array) -- this is Coach-specific framing, so it
  // lives here rather than in system-prompt.ts, which stays exactly as
  // /api/assistant's other (and future) callers already rely on it. A
  // guest visitor is told plainly that no tools/personal data are
  // available this turn, so Gemini never pretends to look something up it
  // has no way to fetch.
  const guestNotice = auth
    ? ""
    : "\n\nThe current visitor is not signed in, so no personal profile data or tools are available this turn -- answer using only the general SportFo knowledge above, and if asked something that needs a signed-in profile, say so and point them to /auth.";
  const preamble = buildCoachSystemInstruction(rawBody.context) + guestNotice;
  const messages = validation.value.messages.map((message, index, all) =>
    index === all.length - 1 ? { ...message, content: `${preamble}\n\n---\n\nUSER MESSAGE:\n${message.content}` } : message,
  );

  const supabase = auth?.supabase ?? (await createClient());
  const user = auth?.user ?? { id: "", sportfoId: null };
  // A guest gets no tool access at all -- there is no authenticated
  // identity to scope a tool query to (see tools/types.ts's ToolContext).
  // A signed-in visitor gets the exact same real tool registry
  // /api/assistant offers, by simply leaving `tools` unset and letting
  // runAssistant() load its own default (see orchestrator.ts).
  const tools = auth ? undefined : [];

  try {
    const result = await runAssistant({
      requestId,
      user,
      supabase,
      messages,
      locale: validation.value.locale ?? "en",
      tools,
    });

    logAssistantEvent({
      requestId,
      event: "request_success",
      route: "coach",
      userId: auth?.user.id,
      durationMs: Date.now() - start,
      success: true,
    });

    const body: CoachResponseBody = { message: { id: randomUUID(), role: "coach", content: result.content } };
    return Response.json(body);
  } catch (error) {
    const assistantError =
      error instanceof AssistantError ? error : new AssistantError("INTERNAL_ERROR", GENERIC_ERROR);

    if (!(error instanceof AssistantError)) {
      // Only a truly-unexpected error's raw detail is logged, and only
      // server-side, correlatable by requestId -- the client only ever
      // gets the generic message below, never this error's own message or
      // stack. Matches handle-assistant-request.ts's equivalent handling.
      console.error(`coach request ${requestId} failed:`, error);
    }

    logAssistantEvent({
      requestId,
      event: "request_error",
      route: "coach",
      userId: auth?.user.id,
      durationMs: Date.now() - start,
      success: false,
      errorCategory: assistantError.category,
    });

    return errorResponse(GENERIC_ERROR, statusForCategory(assistantError.category));
  }
}
