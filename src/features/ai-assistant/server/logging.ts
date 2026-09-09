import type { AssistantErrorCategory } from "./errors.ts";

// A closed, typed event shape -- deliberately the ONLY thing
// logAssistantEvent can log. There is no field here that could ever hold
// a raw user prompt, a tool's full result payload, a database row, or a
// provider error body, so it's structurally impossible to accidentally
// log any of the things the task spec says must never be logged
// (OPENAI_API_KEY, Aadhaar, Govt ID, emergency contact, certificate/
// document contents, whole profile rows). `userId` is the internal
// auth.users UUID -- safe to log server-side for correlation/debugging,
// but this event is never sent to any client.
export interface AssistantLogEvent {
  requestId: string;
  event: "request_success" | "request_error" | "tool_call" | "provider_call";
  userId?: string;
  toolName?: string;
  model?: string;
  durationMs?: number;
  success?: boolean;
  errorCategory?: AssistantErrorCategory;
  // Which entry point produced this event -- "assistant" (the default,
  // implicit) vs. "coach" (see app/api/coach/route.ts, which now runs the
  // exact same orchestrator/provider/tools as /api/assistant). Optional so
  // every existing call site is unaffected.
  route?: string;
}

// Single-line structured JSON -- easy to grep locally and ready to ship to
// a real log pipeline later without changing every call site.
export function logAssistantEvent(event: AssistantLogEvent): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...event }));
}
