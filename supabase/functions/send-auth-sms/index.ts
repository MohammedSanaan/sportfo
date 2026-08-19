// Supabase Auth "Send SMS" hook target. Auth continues to own OTP
// generation, expiry, rate limiting, and verification -- this function's
// only job is delivering the SMS Auth already generated. It is never
// called by the SportFo frontend directly; the flow is always
// Frontend -> Supabase Auth -> this hook -> SMS provider.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { verifySendSmsHook, HookVerificationError } from "./verify-hook.ts";
import { isValidOtp } from "./message.ts";
import { getSmsProvider, SmsProviderError } from "./sms-provider.ts";

interface HookErrorBody {
  error: { http_code: number; message: string };
}

function hookError(httpCode: number, message: string, extraHeaders?: HeadersInit) {
  const body: HookErrorBody = { error: { http_code: httpCode, message } };
  return new Response(JSON.stringify(body), {
    status: httpCode,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// This is an Auth Hook target, not a user-facing API: it must only ever be
// reachable by a request signed with the Send SMS Hook secret, never by an
// apiKey. `auth: 'none'` skips @supabase/server's built-in publishable/
// secret key check (see config.toml: verify_jwt = false for this
// function) -- verifySendSmsHook() below is what actually authorizes the
// request, the same pattern used for third-party webhooks like Stripe.
export default {
  fetch: withSupabase({ auth: "none" }, async (req) => {
    if (req.method !== "POST") {
      return hookError(405, "Method not allowed");
    }

    const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    if (!hookSecret) {
      console.error("send-auth-sms: SEND_SMS_HOOK_SECRET is not configured");
      return hookError(500, "Hook is not configured");
    }

    // Signature verification needs the exact raw bytes that were signed --
    // read as text before any JSON parsing.
    const rawBody = await req.text();

    let payload;
    try {
      payload = verifySendSmsHook(rawBody, req.headers, hookSecret);
    } catch (err) {
      if (err instanceof HookVerificationError) {
        // Deliberately no detail from `err` in the response, and nothing
        // from the request body/headers logged here.
        console.error("send-auth-sms: hook signature verification failed");
        return hookError(401, "Invalid hook signature");
      }
      throw err;
    }

    const phone = payload?.user?.phone;
    const otp = payload?.sms?.otp;

    if (typeof phone !== "string" || phone.length === 0 || !isValidOtp(otp)) {
      console.error("send-auth-sms: malformed hook payload (missing phone or otp)");
      return hookError(400, "Malformed hook payload");
    }

    try {
      const provider = getSmsProvider();
      await provider.sendSms({ to: phone, otp });
    } catch (err) {
      if (err instanceof SmsProviderError) {
        // `err.detail` (the gateway's response body, or a raw network
        // failure message) is logged for diagnostics only -- never included
        // in the response. It also never contains the OTP: the gateway's
        // own responses never echo it back (verified in sms-gateway's own
        // tests), and `to`/`otp` themselves are never logged here either.
        console.error("send-auth-sms: provider send failed", {
          message: err.message,
          retryable: err.retryable,
        });

        if (err.retryable) {
          return hookError(503, "SMS provider temporarily unavailable", {
            "retry-after": "2",
          });
        }
        return hookError(500, "Failed to send verification code");
      }
      console.error("send-auth-sms: unexpected error", err instanceof Error ? err.message : err);
      return hookError(500, "Failed to send verification code");
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
};
