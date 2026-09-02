// Safe, categorized error type for the SportFo Assistant. Every failure
// path in this feature should end up as an AssistantError before it
// reaches a client -- see handle-assistant-request.ts, which is the one
// place that turns these into an HTTP status + JSON body. Client-facing
// `message` text must always be hand-written and safe (never a raw
// provider/DB error's own message, which could leak internal detail) --
// see the callers that construct these.
export type AssistantErrorCategory =
  | "UNAUTHENTICATED"
  | "INVALID_REQUEST"
  | "PROVIDER_UNAVAILABLE"
  | "TOOL_FAILURE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AssistantError extends Error {
  readonly category: AssistantErrorCategory;

  constructor(category: AssistantErrorCategory, message: string) {
    super(message);
    this.name = "AssistantError";
    this.category = category;
  }
}

const STATUS_BY_CATEGORY: Record<AssistantErrorCategory, number> = {
  UNAUTHENTICATED: 401,
  INVALID_REQUEST: 400,
  PROVIDER_UNAVAILABLE: 503,
  TOOL_FAILURE: 502,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function statusForCategory(category: AssistantErrorCategory): number {
  return STATUS_BY_CATEGORY[category];
}
