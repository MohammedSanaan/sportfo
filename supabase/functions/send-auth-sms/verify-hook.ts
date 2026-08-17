import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

export interface SendSmsHookPayload {
  user: { phone: string };
  sms: { otp: string };
}

export class HookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HookVerificationError";
  }
}

// Supabase Auth Hooks sign requests per the Standard Webhooks spec
// (webhook-id / webhook-timestamp / webhook-signature headers), using a
// secret shaped "v1,whsec_<base64>". The `standardwebhooks` library checks
// signature validity AND timestamp freshness (replay protection), so a
// captured request can't be replayed later even if leaked.
//
// Takes the raw body text (not a parsed object) -- signature verification
// must run against the exact bytes that were signed, before any JSON
// parsing.
export function verifySendSmsHook(
  rawBody: string,
  headers: Headers,
  secret: string,
): SendSmsHookPayload {
  const base64Secret = secret.replace(/^v1,whsec_/, "");
  const webhook = new Webhook(base64Secret);

  try {
    return webhook.verify(rawBody, Object.fromEntries(headers)) as SendSmsHookPayload;
  } catch (cause) {
    throw new HookVerificationError(
      cause instanceof Error ? cause.message : "Invalid webhook signature",
    );
  }
}
