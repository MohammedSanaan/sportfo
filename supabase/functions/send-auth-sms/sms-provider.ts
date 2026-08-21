// Provider-independent SMS sending. This is intentionally minimal: one
// interface, one concrete implementation, and a factory that reads which
// provider is configured. The point is to keep the hook handler itself
// (index.ts) free of any one vendor's request/response shape, so switching
// providers later means adding one more `case` and an env var, not
// rewriting the hook.

export interface SmsProvider {
  sendSms(input: { to: string; otp: string }): Promise<void>;
}

// Thrown for any provider-side failure (config, timeout, rejection). The
// hook handler maps this to a safe, generic response -- it never surfaces
// `detail` to the caller, only to server logs.
export class SmsProviderError extends Error {
  // `retryable` maps to Auth's 429/503 retry contract; anything else is
  // treated as a hard failure.
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "SmsProviderError";
  }
}

const OUTBOUND_TIMEOUT_MS = 4000; // stays well under the Auth Hook's 5s budget

interface GatewayResponseBody {
  success?: unknown;
}

// Talks to SportFo's own SMS gateway service (see /sms-gateway) rather than
// MSG91 directly -- the gateway is what actually holds the MSG91 AuthKey
// and runs from the static IP MSG91 has whitelisted. This function never
// constructs SMS copy itself; it only ever forwards {to, otp}.
class SmsGatewayProvider implements SmsProvider {
  constructor(
    private readonly gatewayUrl: string,
    private readonly sharedSecret: string,
  ) {}

  async sendSms({ to, otp }: { to: string; otp: string }): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(this.gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.sharedSecret}`,
        },
        body: JSON.stringify({ to, otp }),
        signal: controller.signal,
      });
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "AbortError";
      throw new SmsProviderError(
        timedOut ? "SMS gateway request timed out" : "SMS gateway request failed",
        true,
        cause instanceof Error ? cause.message : String(cause),
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new SmsProviderError(
        `SMS gateway responded with ${response.status}`,
        retryable,
        await response.text().catch(() => "<unreadable body>"),
      );
    }

    // A 2xx status alone isn't proof of success -- confirm the body
    // actually says so. Guards against a misconfigured proxy/load
    // balancer in front of the gateway returning 200 with something
    // else entirely (an HTML error page, an empty body, etc).
    let body: GatewayResponseBody;
    try {
      body = (await response.json()) as GatewayResponseBody;
    } catch {
      throw new SmsProviderError("SMS gateway returned a malformed response", true);
    }

    if (body.success !== true) {
      throw new SmsProviderError(
        "SMS gateway reported failure",
        true,
        JSON.stringify(body).slice(0, 200),
      );
    }
  }
}

export function getSmsProvider(): SmsProvider {
  const providerName = Deno.env.get("SMS_PROVIDER");

  if (!providerName) {
    throw new SmsProviderError("SMS_PROVIDER is not configured", false);
  }

  switch (providerName) {
    case "sms-gateway": {
      const gatewayUrl = Deno.env.get("SMS_GATEWAY_URL");
      const sharedSecret = Deno.env.get("SMS_GATEWAY_SHARED_SECRET");

      if (!gatewayUrl || !sharedSecret) {
        throw new SmsProviderError(
          "SMS_GATEWAY_URL / SMS_GATEWAY_SHARED_SECRET is not configured",
          false,
        );
      }

      return new SmsGatewayProvider(gatewayUrl, sharedSecret);
    }
    default:
      throw new SmsProviderError(`Unknown SMS_PROVIDER: ${providerName}`, false);
  }
}
