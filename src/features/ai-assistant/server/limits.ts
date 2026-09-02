// Centralized cost/abuse limits for the SportFo Assistant. Every number
// that bounds a request lives here -- nowhere else in this feature should
// hardcode a message count, character limit, tool-round cap, token
// budget, timeout, or retry count.
import {
  ASSISTANT_MAX_HISTORY_MESSAGES,
  ASSISTANT_MAX_INPUT_CHARS_PER_MESSAGE,
} from "../shared/constants.ts";

// Client-visible limits (also exported from shared/constants.ts so a
// future web/mobile client can label/pre-validate against the same
// numbers) -- re-exported here so every server file can import limits
// from one place.
export const MAX_HISTORY_MESSAGES = ASSISTANT_MAX_HISTORY_MESSAGES;
export const MAX_INPUT_CHARS_PER_MESSAGE = ASSISTANT_MAX_INPUT_CHARS_PER_MESSAGE;

// Server-only limits below.

// Combined character budget across every message in one request, on top
// of the per-message cap above -- caps total token usage even if every
// individual message is under MAX_INPUT_CHARS_PER_MESSAGE.
export const MAX_TOTAL_INPUT_CHARS = 20_000;

// A crude, cheap pre-parse guard in the route itself (see
// app/api/assistant/route.ts) against a pathologically large request body
// -- rejected by Content-Length before it's ever buffered into memory.
// Comfortably above MAX_TOTAL_INPUT_CHARS to allow for JSON structure
// overhead (message objects, role fields, etc.) without being so large it
// stops meaning anything.
export const MAX_REQUEST_BYTES = 100_000;

// Tool round-trip loop (see server/orchestrator.ts): user message -> model
// -> tool call(s) -> tool result(s) -> model -> ... . Each iteration of
// this loop is one "round". Capped so a model that keeps requesting tools
// instead of answering can never hang a request indefinitely.
export const MAX_TOOL_ROUNDS = 4;

// Upper bound on the model's own output tokens per call -- keeps a single
// reply bounded in cost and latency regardless of how much tool data was
// fed back to it.
export const MAX_RESPONSE_TOKENS = 800;

// Per-call provider timeout. No assistant request should be able to hang
// indefinitely waiting on OpenAI.
export const PROVIDER_TIMEOUT_MS = 20_000;

// Bounded, explicit retry count for the OpenAI client -- see task spec:
// never blindly retry model requests; only a very small bounded count for
// safe, transient provider failures (network blips, 5xx). The OpenAI SDK
// only retries idempotent, safe-to-repeat failures by default, and Phase
// 1A has no write tools to worry about retrying anyway.
export const PROVIDER_MAX_RETRIES = 1;
