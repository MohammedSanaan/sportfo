// Constants safe to import from ANY layer -- SportFo Web, SportFo Mobile,
// a future SportFo Voice Assistant, or the server itself. Nothing here is
// a secret or a server-only value (no model name, no provider detail, no
// API key); it exists purely so a future client can label the assistant
// consistently and optionally pre-validate input locally before ever
// calling POST /api/assistant. That's a UX nicety only -- the server
// re-validates everything itself regardless of what a client sends (see
// features/ai-assistant/server/validate-request.ts), so nothing security
// -relevant depends on a client actually enforcing these.
//
// Bumped whenever server/system-prompt.ts's behavior/instructions change
// in a way worth distinguishing in logs or client display.
export const SPORTFO_ASSISTANT_PROMPT_VERSION = "v1";

// Mirrored by server/limits.ts's MAX_HISTORY_MESSAGES /
// MAX_INPUT_CHARS_PER_MESSAGE, which are the actual server-enforced
// limits -- these are exported from here so both sides read one number.
export const ASSISTANT_MAX_HISTORY_MESSAGES = 20;
export const ASSISTANT_MAX_INPUT_CHARS_PER_MESSAGE = 4000;
