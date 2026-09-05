import { NextResponse } from "next/server";
import { buildCoachSystemInstruction } from "@/lib/coach/systemInstruction";
import type { CoachErrorBody, CoachMessage, CoachRequestBody, CoachResponseBody } from "@/lib/coach/types";

// Server-only: GEMINI_API_KEY is read here and never sent to the client.
// Do NOT prefix it with NEXT_PUBLIC_ -- that would bundle it into
// client-side JS. See .env.example for setup.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

function friendlyError(message: string, status: number) {
  return NextResponse.json<CoachErrorBody>({ error: message }, { status });
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

// Gemini's generateContent expects alternating user/model turns with no
// system role in `contents` -- the persona/knowledge instead goes in the
// dedicated `systemInstruction` field built per-request in
// buildCoachSystemInstruction (so it can fold in the current-page context).
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
  if (!GEMINI_API_KEY) {
    // Logged server-side only -- the client only ever sees the friendly
    // message below, never this detail or the missing-key state itself.
    console.error("[coach] GEMINI_API_KEY is not set.");
    return friendlyError(
      "I'm not able to connect right now. Please try again later.",
      503,
    );
  }

  let body: CoachRequestBody;
  try {
    body = await request.json();
  } catch {
    return friendlyError("That request didn't come through correctly. Please try again.", 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || !body.messages.every(isValidMessage)) {
    return friendlyError("That request didn't come through correctly. Please try again.", 400);
  }

  const contents = toGeminiContents(body.messages);
  if (contents.length === 0) {
    return friendlyError("Please type a message for Coach to respond to.", 400);
  }

  const systemInstruction = buildCoachSystemInstruction(body.context);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.6,
          // Generous headroom: this model family can spend some of
          // maxOutputTokens on internal reasoning before the visible
          // answer, so a low ceiling risks truncating Coach's reply
          // mid-sentence.
          maxOutputTokens: 2048,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (response.status === 429) {
      return friendlyError(
        "I'm getting a lot of questions right now. Please try again in a moment.",
        429,
      );
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[coach] Gemini API error ${response.status}: ${detail}`);
      return friendlyError(
        "I'm having a little trouble connecting right now. Please try again in a moment.",
        502,
      );
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[coach] Gemini API returned no usable text.", JSON.stringify(data));
      return friendlyError(
        "I couldn't quite put together an answer for that. Could you rephrase it?",
        502,
      );
    }

    return NextResponse.json<CoachResponseBody>({
      message: { id: crypto.randomUUID(), role: "coach", content: text.trim() },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return friendlyError("That took too long to respond. Please try again.", 504);
    }
    console.error("[coach] Unexpected error calling Gemini API:", error);
    return friendlyError(
      "I'm having a little trouble connecting right now. Please try again in a moment.",
      500,
    );
  }
}
