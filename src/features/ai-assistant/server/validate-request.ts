// Relative, not the usual "@/i18n/config" alias -- i18n/config.ts has no
// runtime imports of its own, which is what keeps this file (and
// everything that value-imports it, like handle-assistant-request.ts)
// loadable end-to-end under `node --test` with no path-alias resolution
// (see validate-request.test.ts).
import { isLocale } from "../../../i18n/config.ts";
import { MAX_HISTORY_MESSAGES, MAX_INPUT_CHARS_PER_MESSAGE, MAX_TOTAL_INPUT_CHARS } from "./limits.ts";
import type { AssistantChatRequestBody, AssistantMessageInput } from "./types/assistant.ts";

export type ValidationResult =
  | { ok: true; value: AssistantChatRequestBody }
  | { ok: false; message: string };

const DEFAULT_LOCALE = "en";

// A client-asserted identity field is rejected outright, never silently
// stripped -- a client relying on one of these should find out
// immediately rather than have it quietly ignored. The server always
// derives the real user from the authenticated session (see
// security/authorization.ts); this is just an explicit, loud guard on top
// of that, matching the task spec's "request cannot choose another user
// ID" requirement.
const FORBIDDEN_IDENTITY_KEYS = ["userId", "user_id", "authUserId", "auth_user_id", "ownerId", "owner_id"];

// Hand-rolled rather than a schema library -- this project has no Zod (or
// equivalent) dependency anywhere yet (see AthleteRegistrationForm/
// GenericCategoryForm, which validate via plain react-hook-form rules), so
// this follows the same convention rather than introducing a new one.
export function validateAssistantRequest(rawBody: unknown): ValidationResult {
  if (!rawBody || typeof rawBody !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const body = rawBody as Record<string, unknown>;

  for (const forbiddenKey of FORBIDDEN_IDENTITY_KEYS) {
    if (forbiddenKey in body) {
      return {
        ok: false,
        message: `"${forbiddenKey}" is not accepted -- the server determines the user from the authenticated session.`,
      };
    }
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, message: '"messages" must be a non-empty array.' };
  }
  if (body.messages.length > MAX_HISTORY_MESSAGES) {
    return { ok: false, message: `"messages" cannot contain more than ${MAX_HISTORY_MESSAGES} entries.` };
  }

  const messages: AssistantMessageInput[] = [];
  let totalChars = 0;

  for (let index = 0; index < body.messages.length; index++) {
    const raw: unknown = body.messages[index];
    if (!raw || typeof raw !== "object") {
      return { ok: false, message: `messages[${index}] must be an object.` };
    }
    const entry = raw as Record<string, unknown>;

    if (entry.role !== "user" && entry.role !== "assistant") {
      return { ok: false, message: `messages[${index}].role must be "user" or "assistant".` };
    }
    if (typeof entry.content !== "string" || entry.content.trim().length === 0) {
      return { ok: false, message: `messages[${index}].content must be a non-empty string.` };
    }
    if (entry.content.length > MAX_INPUT_CHARS_PER_MESSAGE) {
      return {
        ok: false,
        message: `messages[${index}].content exceeds the ${MAX_INPUT_CHARS_PER_MESSAGE}-character limit.`,
      };
    }

    totalChars += entry.content.length;
    if (totalChars > MAX_TOTAL_INPUT_CHARS) {
      return {
        ok: false,
        message: `Combined message content exceeds the ${MAX_TOTAL_INPUT_CHARS}-character conversation limit.`,
      };
    }

    messages.push({ role: entry.role, content: entry.content });
  }

  // The final turn must be the new question -- a request that ends on an
  // assistant message has nothing for the assistant to actually answer.
  if (messages[messages.length - 1].role !== "user") {
    return { ok: false, message: "The last message must be from the user." };
  }

  let locale = DEFAULT_LOCALE;
  if (body.locale !== undefined) {
    if (typeof body.locale !== "string") {
      return { ok: false, message: '"locale" must be a string.' };
    }
    // An unrecognized locale falls back to the default rather than
    // rejecting the whole request -- this is a display preference, not a
    // security boundary (see system-prompt.ts, which only ever uses this
    // to steer reply language).
    locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  }

  return { ok: true, value: { messages, locale } };
}
