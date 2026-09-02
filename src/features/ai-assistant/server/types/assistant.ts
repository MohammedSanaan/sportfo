// The client-independent request/response contract for POST
// /api/assistant. Deliberately plain data -- no Next.js types, no React
// types, no OpenAI SDK types -- so SportFo Web, SportFo Mobile, and a
// future SportFo Voice Assistant can all speak this exact shape without
// depending on how any one of them is built.
import type { AssistantErrorCategory } from "../errors.ts";

export type AssistantMessageRole = "user" | "assistant";

export interface AssistantMessageInput {
  role: AssistantMessageRole;
  content: string;
}

// What a client sends. Deliberately does NOT have a user/owner id field of
// any kind -- the server always derives the caller from the authenticated
// session (see security/authorization.ts). See validate-request.ts, which
// explicitly rejects a body that tries to add one.
export interface AssistantChatRequestBody {
  messages: AssistantMessageInput[];
  locale?: string;
}

export interface AssistantResponseMessage {
  role: "assistant";
  content: string;
}

export interface AssistantChatResponseMeta {
  requestId: string;
  promptVersion: string;
}

// What a client gets back on success. Never a raw OpenAI Response object,
// never token usage/billing detail (see server/logging.ts for where that
// stays -- internal only).
export interface AssistantChatResponseBody {
  message: AssistantResponseMessage;
  meta: AssistantChatResponseMeta;
}

export interface AssistantErrorResponseBody {
  error: {
    category: AssistantErrorCategory;
    message: string;
    requestId: string;
  };
}
