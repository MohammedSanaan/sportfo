import type { GatewayConfig } from "../config.js";
import { toMsg91MobileFormat } from "../lib/phone.js";

const MSG91_FLOW_ENDPOINT = "https://api.msg91.com/api/v5/flow/";
const OUTBOUND_TIMEOUT_MS = 4000;

export type Msg91FailureCategory = "provider_error" | "provider_timeout" | "unexpected_response";

export type Msg91Outcome =
  | { ok: true }
  | {
      ok: false;
      category: Msg91FailureCategory;
      // Safe diagnostic metadata only -- never the request/response body,
      // phone, OTP, or AuthKey. `hasRequestId` is a boolean, never the
      // request ID value itself (MSG91 doesn't document that value as
      // non-sensitive, so we don't assume it is).
      msg91HttpStatus?: number;
      msg91ResponseType?: string;
      hasRequestId?: boolean;
    };

interface Msg91FlowResponse {
  type?: string;
  message?: string;
}

// MSG91's Flow API delivers a pre-approved DLT template (configured on
// MSG91's side, keyed by MSG91_TEMPLATE_ID) with the OTP substituted into
// its `otp` template variable -- this service never constructs the SMS
// text itself. `fetchImpl` defaults to the global fetch but is injectable
// so tests can supply a stub instead of hitting the real network.
export async function sendViaMsg91(
  config: Pick<GatewayConfig, "msg91AuthKey" | "msg91TemplateId" | "msg91SenderId">,
  input: { to: string; otp: string },
  fetchImpl: typeof fetch = fetch,
): Promise<Msg91Outcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImpl(MSG91_FLOW_ENDPOINT, {
      method: "POST",
      headers: {
        authkey: config.msg91AuthKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        flow_id: config.msg91TemplateId,
        sender: config.msg91SenderId,
        recipients: [
          {
            mobiles: toMsg91MobileFormat(input.to),
            otp: input.otp,
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === "AbortError";
    return { ok: false, category: timedOut ? "provider_timeout" : "provider_error" };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return { ok: false, category: "provider_error", msg91HttpStatus: response.status };
  }

  // MSG91 can return HTTP 200 with a body indicating failure (e.g.
  // "flow id missing", destination rejected) -- the body's `type` field,
  // not just the HTTP status, is what's checked. The response body itself
  // is never logged (may carry provider-side detail); only the safe,
  // categorized fields on the returned outcome are.
  let body: Msg91FlowResponse;
  try {
    body = (await response.json()) as Msg91FlowResponse;
  } catch {
    return { ok: false, category: "unexpected_response", msg91HttpStatus: response.status };
  }

  if (body.type === "success") {
    // Per MSG91's documented contract, a genuine successful submission
    // always returns a request/tracking ID in `message`. Trusting
    // `type === "success"` alone -- without confirming that id is
    // actually present -- would silently accept a response shape MSG91's
    // own docs say shouldn't happen for a real success, e.g.
    // `{"type":"success"}` with no id. That's exactly the gap between "HTTP
    // success + valid Request ID" and "malformed/unexpected response" this
    // distinguishes.
    const hasRequestId = typeof body.message === "string" && body.message.trim().length > 0;
    if (hasRequestId) {
      return { ok: true };
    }
    return {
      ok: false,
      category: "unexpected_response",
      msg91HttpStatus: response.status,
      msg91ResponseType: body.type,
      hasRequestId: false,
    };
  }

  return {
    ok: false,
    category: "provider_error",
    msg91HttpStatus: response.status,
    msg91ResponseType: typeof body.type === "string" ? body.type : undefined,
    hasRequestId: typeof body.message === "string" && body.message.trim().length > 0,
  };
}
