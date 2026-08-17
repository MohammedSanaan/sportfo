// Provider-independent SMS sending. This is intentionally minimal: one
// interface, one concrete implementation, and a factory that reads which
// provider is configured. The point is to keep the hook handler itself
// (index.ts) free of any one vendor's request/response shape, so switching
// providers later means adding one more `case` and an env var, not
// rewriting the hook.

export interface SmsProvider {
  sendSms(input: { to: string; message: string }): Promise<void>;
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

// A generic JSON/HTTP SMS gateway adapter: POSTs { to, message, sender_id }
// with a bearer API key. This is a placeholder shape -- real gateways vary
// (Twilio is form-encoded with the account SID in the URL; many regional
// providers use GET with query params, etc.). Swap this implementation for
// whichever vendor is actually selected; the interface above is what stays
// stable.
class GenericHttpSmsProvider implements SmsProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly senderId: string | undefined,
  ) {}

  async sendSms({ to, message }: { to: string; message: string }): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OUTBOUND_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to,
          message,
          ...(this.senderId ? { sender_id: this.senderId } : {}),
        }),
        signal: controller.signal,
      });
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "AbortError";
      throw new SmsProviderError(
        timedOut ? "SMS provider request timed out" : "SMS provider request failed",
        true,
        cause instanceof Error ? cause.message : String(cause),
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new SmsProviderError(
        `SMS provider responded with ${response.status}`,
        retryable,
        await response.text().catch(() => "<unreadable body>"),
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
    case "generic-http": {
      const baseUrl = Deno.env.get("SMS_API_BASE_URL");
      const apiKey = Deno.env.get("SMS_API_KEY");
      const senderId = Deno.env.get("SMS_SENDER_ID");

      if (!baseUrl || !apiKey) {
        throw new SmsProviderError(
          "SMS_API_BASE_URL / SMS_API_KEY is not configured",
          false,
        );
      }

      return new GenericHttpSmsProvider(baseUrl, apiKey, senderId);
    }
    default:
      throw new SmsProviderError(`Unknown SMS_PROVIDER: ${providerName}`, false);
  }
}
