import type { CoachErrorBody, CoachMessage, CoachPageContext, CoachRequestBody, CoachResponseBody } from "@/lib/coach/types";

const GENERIC_ERROR = "I'm having a little trouble connecting right now. Please try again in a moment.";

// The only thing the client knows about the AI backend: a POST to our own
// server route, which now returns a single JSON reply (see
// src/app/api/coach/route.ts, which delegates to the same
// orchestrator/Gemini provider /api/assistant uses) -- no API key, no
// provider SDK, no provider-specific response shape ever reaches this
// module. Resolves with the complete message on success; rejects with a
// friendly message on any failure.
export async function askCoach(
  messages: CoachMessage[],
  context: CoachPageContext,
  signal?: AbortSignal,
): Promise<CoachMessage> {
  const payload: CoachRequestBody = { messages, context };

  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as CoachErrorBody | null;
    throw new Error(body?.error || GENERIC_ERROR);
  }

  const body = (await response.json().catch(() => null)) as CoachResponseBody | null;
  if (!body?.message) {
    throw new Error(GENERIC_ERROR);
  }

  return body.message;
}
