import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthenticatedUser } from "@/features/ai-assistant/server/security/authorization";
import { handleAssistantRequest } from "@/features/ai-assistant/server/handle-assistant-request";
import { MAX_REQUEST_BYTES } from "@/features/ai-assistant/server/limits";
import { statusForCategory } from "@/features/ai-assistant/server/errors";

// Thin transport/controller layer ONLY. Auth resolution, rate limiting,
// request validation, prompt construction, tool selection/execution, and
// provider communication all live in
// features/ai-assistant/server/handle-assistant-request.ts (and what it
// calls) -- unit-tested directly there, with no Next.js runtime
// dependency. This file's only job is: authenticate, read the body, hand
// off, translate the result to an HTTP response. Nothing here queries
// Supabase directly, builds a prompt, or knows OpenAI exists.
//
// This is also SportFo's mobile-readiness seam in practice: a future
// SportFo Mobile client calls this exact same route with an
// `Authorization: Bearer <token>` header instead of a cookie --
// resolveAuthenticatedUser already handles both (see
// security/authorization.ts) -- so nothing here is coupled to
// browser-only cookies.
export async function POST(request: NextRequest) {
  // A coarse guard against a pathologically large body, before it's ever
  // buffered into memory. The real, precise per-message/total-conversation
  // limits are enforced inside handleAssistantRequest -> validate-request.ts;
  // this only exists to reject an obviously-oversized request cheaply.
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      {
        error: {
          category: "INVALID_REQUEST",
          message: `Request body exceeds the ${MAX_REQUEST_BYTES}-byte limit.`,
          requestId: randomUUID(),
        },
      },
      { status: statusForCategory("INVALID_REQUEST") },
    );
  }

  const auth = await resolveAuthenticatedUser(request);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    // Left undefined -- validateAssistantRequest (called inside
    // handleAssistantRequest) rejects a non-object body with a clear
    // INVALID_REQUEST rather than this route trying to interpret the
    // parse failure itself.
    rawBody = undefined;
  }

  const { status, body } = await handleAssistantRequest({ auth, rawBody });
  return NextResponse.json(body, { status });
}
