import { assertEquals, assertRejects } from "jsr:@std/assert";
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

Deno.test("getSmsProvider throws when generic-http is missing base url/key", () =>
  withEnv(
    { SMS_PROVIDER: "generic-http", SMS_API_BASE_URL: undefined, SMS_API_KEY: undefined },
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

Deno.test("generic-http provider sends the expected request and succeeds on 2xx", () =>
  withEnv(
    {
      SMS_PROVIDER: "generic-http",
      SMS_API_BASE_URL: "https://gateway.example/send",
      SMS_API_KEY: "test-key",
      SMS_SENDER_ID: "SportFo",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      let capturedInit: RequestInit | undefined;
      globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        capturedInit = init;
        return Promise.resolve(new Response("ok", { status: 200 }));
      }) as typeof fetch;

      try {
        const provider = getSmsProvider();
        await provider.sendSms({ to: "+97455512345", message: "Your code is: 123456" });
      } finally {
        globalThis.fetch = originalFetch;
      }

      const body = JSON.parse(String(capturedInit?.body));
      assertEquals(body, {
        to: "+97455512345",
        message: "Your code is: 123456",
        sender_id: "SportFo",
      });
      assertEquals(
        (capturedInit?.headers as Record<string, string>).Authorization,
        "Bearer test-key",
      );
    },
  ));

Deno.test("generic-http provider throws a retryable error on 5xx", () =>
  withEnv(
    {
      SMS_PROVIDER: "generic-http",
      SMS_API_BASE_URL: "https://gateway.example/send",
      SMS_API_KEY: "test-key",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (() =>
        Promise.resolve(new Response("upstream down", { status: 502 }))) as typeof fetch;

      try {
        const provider = getSmsProvider();
        await assertRejects(
          () => provider.sendSms({ to: "+97455512345", message: "x" }),
          SmsProviderError,
        );
        try {
          await provider.sendSms({ to: "+97455512345", message: "x" });
        } catch (err) {
          assertEquals((err as SmsProviderError).retryable, true);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  ));

Deno.test("generic-http provider throws a non-retryable error on 4xx", () =>
  withEnv(
    {
      SMS_PROVIDER: "generic-http",
      SMS_API_BASE_URL: "https://gateway.example/send",
      SMS_API_KEY: "test-key",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (() =>
        Promise.resolve(new Response("bad number", { status: 400 }))) as typeof fetch;

      try {
        const provider = getSmsProvider();
        try {
          await provider.sendSms({ to: "+97455512345", message: "x" });
          throw new Error("expected sendSms to throw");
        } catch (err) {
          assertEquals((err as SmsProviderError).retryable, false);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  ));

Deno.test("generic-http provider treats a timeout as retryable", () =>
  withEnv(
    {
      SMS_PROVIDER: "generic-http",
      SMS_API_BASE_URL: "https://gateway.example/send",
      SMS_API_KEY: "test-key",
    },
    async () => {
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
        try {
          await provider.sendSms({ to: "+97455512345", message: "x" });
          throw new Error("expected sendSms to throw");
        } catch (err) {
          assertEquals(err instanceof SmsProviderError, true);
          assertEquals((err as SmsProviderError).retryable, true);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  ));
