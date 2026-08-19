import type { GatewayConfig } from "../config.js";
import { toMsg91MobileFormat } from "../lib/phone.js";

const MSG91_FLOW_ENDPOINT = "https://api.msg91.com/api/v5/flow/";
const OUTBOUND_TIMEOUT_MS = 4000;

export type Msg91Outcome =
  | { ok: true }
  | { ok: false; category: "provider_error" | "provider_timeout" };

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
    return { ok: false, category: "provider_error" };
  }

  // MSG91 can return HTTP 200 with a body indicating failure (e.g.
  // "flow id missing", destination rejected) -- the body's `type` field,
  // not just the HTTP status, is the real success signal. The response
  // body itself is never logged (may carry provider-side detail); only
  // this categorized outcome is.
  let body: Msg91FlowResponse;
  try {
    body = (await response.json()) as Msg91FlowResponse;
  } catch {
    return { ok: false, category: "provider_error" };
  }

  return body.type === "success" ? { ok: true } : { ok: false, category: "provider_error" };
}
