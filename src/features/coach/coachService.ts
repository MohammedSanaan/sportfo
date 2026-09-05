import type { CoachErrorBody, CoachMessage, CoachPageContext, CoachRequestBody, CoachResponseBody } from "@/lib/coach/types";

// The only thing the client knows about Gemini: a POST to our own
// server route. No API key, no provider SDK, no provider-specific
// request/response shape ever reaches this module -- swapping the AI
// provider later only touches src/app/api/coach/route.ts.
export async function askCoach(
  messages: CoachMessage[],
  context: CoachPageContext,
): Promise<CoachMessage> {
  const payload: CoachRequestBody = { messages, context };

  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as CoachErrorBody | null;
    throw new Error(body?.error || "I'm having a little trouble connecting right now. Please try again in a moment.");
  }

  const body = (await response.json()) as CoachResponseBody;
  return body.message;
}
