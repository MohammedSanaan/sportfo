import { buildCoachSystemInstruction } from "@/lib/coach/systemInstruction";
import { getClientIp, isRateLimited } from "@/lib/coach/rateLimit";
import type { CoachMessage, CoachRequestBody } from "@/lib/coach/types";

// Server-only: GEMINI_API_KEY is read here and never sent to the client.
// Do NOT prefix it with NEXT_PUBLIC_ -- that would bundle it into
// client-side JS. See .env.example for setup.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
// alt=sse: Gemini's streaming endpoint, one "data: {...}" line per chunk as
// it's generated, instead of waiting for the full response -- see the
// measurement note below on why this matters more than prompt size did.
const GEMINI_STREAM_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
// Measured directly against the live API before this change: a plain
// "How do I register?" request with the real system instruction (~450
// prompt tokens -- small) still took 11.5s end-to-end, and the response's
// own usageMetadata showed why: 670 "thoughtsTokenCount" (this model's
// internal reasoning) against only 120 visible answer tokens. Prompt size
// was never the bottleneck; the model defaulting to heavy extended
// reasoning on simple, directly-answerable platform questions was. Capping
// thinkingBudget cut the thinking-token count sharply in repeat tests
// (413, then 326 at lower budgets) with no loss of answer correctness or
// completeness in the samples checked. 512 is a middle value: enough
// headroom for the bilingual voice-mode format (two full answers plus a
// route-link line) without paying for reasoning depth this assistant's
// questions don't need. Streaming (below) is the other half of the fix --
// it's what actually gets a first token in front of the user sooner,
// since capping the budget shortens but doesn't eliminate the pre-answer
// thinking phase.
const THINKING_BUDGET = 512;
// Generous enough to cover a slow thinking phase plus a full bilingual
// two-language answer, but bounded so a hung connection doesn't leave the
// client waiting forever. Streaming means this now guards the *whole*
// response lifetime, not "how long until anything is visible" -- the
// first chunk should arrive well before this in practice.
const STREAM_TIMEOUT_MS = 45_000;

const encoder = new TextEncoder();

function sseLine(payload: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function preStreamErrorResponse(message: string, status: number): Response {
  // Mirrors the pre-streaming friendly-error shape (`{"error": "..."}`)
  // for requests that fail before we ever open the stream (rate limit,
  // missing key, malformed body) -- coachService.ts checks `response.ok`
  // before attempting to read a stream, so these never need SSE framing.
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

// Gemini's generateContent/streamGenerateContent expect alternating
// user/model turns with no system role in `contents` -- the
// persona/knowledge instead goes in the dedicated `systemInstruction`
// field built per-request in buildCoachSystemInstruction (so it can fold
// in the current-page context).
function toGeminiContents(messages: CoachMessage[]) {
  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role === "coach" ? "model" : "user",
      parts: [{ text: message.content.slice(0, MAX_MESSAGE_LENGTH) }],
    }));
}

export async function POST(request: Request) {
  // Guard a paid, unauthenticated route from being hammered by a script
  // rather than a person -- see src/lib/coach/rateLimit.ts for the
  // trade-offs of this single-instance, in-memory approach.
  if (isRateLimited(getClientIp(request))) {
    return preStreamErrorResponse("I'm getting a lot of questions right now. Please try again in a moment.", 429);
  }

  if (!GEMINI_API_KEY) {
    // Logged server-side only -- the client only ever sees the friendly
    // message below, never this detail or the missing-key state itself.
    console.error("[coach] GEMINI_API_KEY is not set.");
    return preStreamErrorResponse("I'm not able to connect right now. Please try again later.", 503);
  }

  let body: CoachRequestBody;
  try {
    body = await request.json();
  } catch {
    return preStreamErrorResponse("That request didn't come through correctly. Please try again.", 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || !body.messages.every(isValidMessage)) {
    return preStreamErrorResponse("That request didn't come through correctly. Please try again.", 400);
  }

  const contents = toGeminiContents(body.messages);
  if (contents.length === 0) {
    return preStreamErrorResponse("Please type a message for Coach to respond to.", 400);
  }

  const systemInstruction = buildCoachSystemInstruction(body.context);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${GEMINI_STREAM_ENDPOINT}&key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return preStreamErrorResponse("That took too long to respond. Please try again.", 504);
    }
    console.error("[coach] Unexpected error calling Gemini API:", error);
    return preStreamErrorResponse("I'm having a little trouble connecting right now. Please try again in a moment.", 500);
  }

  if (upstream.status === 429) {
    clearTimeout(timeout);
    return preStreamErrorResponse("I'm getting a lot of questions right now. Please try again in a moment.", 429);
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const detail = await upstream.text().catch(() => "");
    console.error(`[coach] Gemini API error ${upstream.status}: ${detail}`);
    return preStreamErrorResponse("I'm having a little trouble connecting right now. Please try again in a moment.", 502);
  }

  const messageId = crypto.randomUUID();
  let fullText = "";
  let sawAnyText = false;

  // Re-frame Gemini's own SSE stream into our own minimal protocol (see
  // coachService.ts for the matching parser): {type:"chunk"} for each
  // piece of new text, {type:"done"} once, or {type:"error"} if something
  // goes wrong mid-stream (after we've already committed to a 200 -- an
  // HTTP status can't change at that point, so this is the only way to
  // signal failure to a client already reading the body as a stream).
  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function emitDelta(text: string) {
        if (!text) return;
        sawAnyText = true;
        fullText += text;
        streamController.enqueue(sseLine({ type: "chunk", text }));
      }

      try {
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
            if (!jsonText || jsonText === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonText);
              const text: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              emitDelta(text ?? "");
            } catch {
              // A single malformed line shouldn't abort an otherwise-good
              // stream -- Gemini hasn't been observed to send these, but
              // skipping is strictly safer than crashing mid-answer.
            }
          }
        }

        if (!sawAnyText) {
          console.error("[coach] Gemini stream produced no usable text.");
          streamController.enqueue(
            sseLine({ type: "error", message: "I couldn't quite put together an answer for that. Could you rephrase it?" }),
          );
        } else {
          streamController.enqueue(sseLine({ type: "done", id: messageId, content: fullText.trim() }));
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          streamController.enqueue(sseLine({ type: "error", message: "That took too long to respond. Please try again." }));
        } else {
          console.error("[coach] Error while reading Gemini stream:", error);
          streamController.enqueue(
            sseLine({ type: "error", message: "I'm having a little trouble connecting right now. Please try again in a moment." }),
          );
        }
      } finally {
        clearTimeout(timeout);
        streamController.close();
      }
    },
    cancel() {
      // The client navigated away, closed Coach, or aborted -- stop
      // pulling from Gemini rather than paying for tokens nobody reads.
      clearTimeout(timeout);
      upstream.body?.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
