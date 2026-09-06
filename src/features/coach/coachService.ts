import type { CoachErrorBody, CoachMessage, CoachPageContext, CoachRequestBody } from "@/lib/coach/types";

type StreamEvent =
  | { type: "chunk"; text: string }
  | { type: "done"; id: string; content: string }
  | { type: "error"; message: string };

export interface AskCoachStreamHandlers {
  /** Called with each new piece of text as it arrives, in order. */
  onChunk: (text: string) => void;
}

const GENERIC_ERROR = "I'm having a little trouble connecting right now. Please try again in a moment.";

// The only thing the client knows about Gemini: a POST to our own server
// route, which streams back a small line-based protocol (see
// src/app/api/coach/route.ts) -- no API key, no provider SDK, no
// provider-specific chunk shape ever reaches this module. Resolves with
// the final, complete message once the stream signals "done"; rejects
// with a friendly message on any failure, mid-stream or otherwise.
export async function askCoach(
  messages: CoachMessage[],
  context: CoachPageContext,
  handlers: AskCoachStreamHandlers,
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

  if (!response.body) {
    throw new Error(GENERIC_ERROR);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonText = trimmed.slice(5).trim();
      if (!jsonText) continue;

      let event: StreamEvent;
      try {
        event = JSON.parse(jsonText);
      } catch {
        continue; // A single malformed line shouldn't abort an otherwise-good stream.
      }

      if (event.type === "chunk") {
        handlers.onChunk(event.text);
      } else if (event.type === "done") {
        return { id: event.id, role: "coach", content: event.content };
      } else if (event.type === "error") {
        throw new Error(event.message || GENERIC_ERROR);
      }
    }
  }

  // The stream ended without an explicit "done" or "error" line -- an
  // interrupted connection rather than a clean finish.
  throw new Error(GENERIC_ERROR);
}
