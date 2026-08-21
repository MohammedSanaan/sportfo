import { assertEquals } from "jsr:@std/assert";
import { getSmsProvider, SmsProviderError } from "./sms-provider.ts";

function withEnv(vars: Record<string, string | undefined>, fn: () => void | Promise<void>) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) previous[key] = Deno.env.get(key);
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) Deno.env.delete(key);
    else Deno.env.set(key, value);
  }
  return (async () => {
    try {
      await fn();
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) Deno.env.delete(key);
        else Deno.env.set(key, value);
      }
    }
  })();
}

const GATEWAY_ENV = {
  SMS_PROVIDER: "sms-gateway",
  SMS_GATEWAY_URL: "https://gateway.example/send-sms",
  SMS_GATEWAY_SHARED_SECRET: "test-shared-secret",
};

async function expectProviderError(
  fn: () => Promise<void>,
  expectedRetryable?: boolean,
): Promise<SmsProviderError> {
  try {
    await fn();
  } catch (err) {
    if (!(err instanceof SmsProviderError)) throw err;
    if (expectedRetryable !== undefined) {
      assertEquals(err.retryable, expectedRetryable);
    }
    return err;
  }
  throw new Error("expected sendSms to throw SmsProviderError");
}

Deno.test("getSmsProvider throws when SMS_PROVIDER is missing", () =>
  withEnv({ SMS_PROVIDER: undefined }, () => {
    let threw = false;
    try {
      getSmsProvider();
    } catch (err) {
      threw = err instanceof SmsProviderError;
    }
    assertEquals(threw, true);
  }));

Deno.test("getSmsProvider throws on an unknown provider name", () =>
  withEnv({ SMS_PROVIDER: "carrier-pigeon" }, () => {
    let threw = false;
    try {
      getSmsProvider();
    } catch (err) {
      threw = err instanceof SmsProviderError;
    }
    assertEquals(threw, true);
  }));

Deno.test("getSmsProvider throws when SMS_GATEWAY_URL is missing", () =>
  withEnv(
    {
      SMS_PROVIDER: "sms-gateway",
      SMS_GATEWAY_URL: undefined,
      SMS_GATEWAY_SHARED_SECRET: "test-shared-secret",
    },
    () => {
      let threw = false;
      try {
        getSmsProvider();
      } catch (err) {
        threw = err instanceof SmsProviderError;
      }
      assertEquals(threw, true);
    },
  ));

Deno.test("getSmsProvider throws when SMS_GATEWAY_SHARED_SECRET is missing", () =>
  withEnv(
    {
      SMS_PROVIDER: "sms-gateway",
      SMS_GATEWAY_URL: "https://gateway.example/send-sms",
      SMS_GATEWAY_SHARED_SECRET: undefined,
    },
    () => {
      let threw = false;
      try {
        getSmsProvider();
      } catch (err) {
        threw = err instanceof SmsProviderError;
      }
      assertEquals(threw, true);
    },
  ));

Deno.test("sms-gateway provider sends {to, otp} with Bearer auth and succeeds on gateway success", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl: string | URL | Request | undefined;
    let capturedInit: RequestInit | undefined;
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = input;
      capturedInit = init;
      return Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await provider.sendSms({ to: "+97455512345", otp: "561166" });
    } finally {
      globalThis.fetch = originalFetch;
    }

    assertEquals(capturedUrl, "https://gateway.example/send-sms");
    assertEquals(capturedInit?.method, "POST");
    const body = JSON.parse(String(capturedInit?.body));
    assertEquals(body, { to: "+97455512345", otp: "561166" });
    const headers = capturedInit?.headers as Record<string, string>;
    assertEquals(headers.Authorization, "Bearer test-shared-secret");
    assertEquals(headers["Content-Type"], "application/json");
  }));

Deno.test("sms-gateway provider treats a 401 as a non-retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: false, code: "UNAUTHORIZED" }), { status: 401 }),
      )) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        false,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats a 403 as a non-retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => Promise.resolve(new Response("forbidden", { status: 403 }))) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        false,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats a 4xx (bad request) as a non-retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: false, code: "INVALID_REQUEST" }), { status: 400 }),
      )) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        false,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats a 5xx as a retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: false, code: "SMS_PROVIDER_ERROR" }), { status: 502 }),
      )) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        true,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats a timeout as a retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    }) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        true,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats non-JSON 2xx body as a malformed/retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(new Response("<html>not json</html>", { status: 200 }))) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        true,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats 2xx with success!==true as a malformed/retryable error", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )) as typeof fetch;

    try {
      const provider = getSmsProvider();
      await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        true,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));

Deno.test("sms-gateway provider treats a plain network failure as a retryable error (not a timeout)", () =>
  withEnv(GATEWAY_ENV, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;

    try {
      const provider = getSmsProvider();
      const err = await expectProviderError(
        () => provider.sendSms({ to: "+97455512345", otp: "561166" }),
        true,
      );
      assertEquals(err.message, "SMS gateway request failed");
    } finally {
      globalThis.fetch = originalFetch;
    }
  }));
