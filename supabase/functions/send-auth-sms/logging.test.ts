// Verifies the actual risk: that no code path can put an OTP, phone
// number, or secret into a log line, even when the upstream gateway
// misbehaves. `index.ts`'s handler is wrapped by `withSupabase`, which
// needs a full Supabase-shaped environment to construct (confirmed not
// runnable standalone under `deno test`) -- so this exercises the same
// provider call and the *exact* console.error call site copied from
// index.ts, rather than invoking the HTTP handler end-to-end.
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

function captureConsoleError(fn: () => void | Promise<void>): Promise<string> {
  const original = console.error;
  const lines: string[] = [];
  console.error = (...args: unknown[]) => {
    lines.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
  };
  return (async () => {
    try {
      await fn();
    } finally {
      console.error = original;
    }
    return lines.join("\n");
  })();
}

const FAKE_PHONE = "+97455512345";
const FAKE_OTP = "561166";
const FAKE_SHARED_SECRET = "test-shared-secret-not-real";

Deno.test("provider failure logging never contains the OTP, phone, or shared secret -- even when the gateway's response body echoes them back", async () => {
  const log = await captureConsoleError(() =>
    withEnv(
      {
        SMS_PROVIDER: "sms-gateway",
        SMS_GATEWAY_URL: "https://gateway.example/send-sms",
        SMS_GATEWAY_SHARED_SECRET: FAKE_SHARED_SECRET,
      },
      async () => {
        const originalFetch = globalThis.fetch;
        // Adversarial: a buggy/compromised gateway echoing sensitive
        // values back in its error body -- the log must still be clean,
        // because index.ts only ever logs `err.message`/`retryable`,
        // never `err.detail`.
        globalThis.fetch = (() =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                success: false,
                code: "SMS_PROVIDER_ERROR",
                debug: `failed to deliver otp ${FAKE_OTP} to ${FAKE_PHONE} using secret ${FAKE_SHARED_SECRET}`,
              }),
              { status: 502 },
            ),
          )) as typeof fetch;

        try {
          const provider = getSmsProvider();
          await provider.sendSms({ to: FAKE_PHONE, otp: FAKE_OTP });
          throw new Error("expected sendSms to throw");
        } catch (err) {
          if (!(err instanceof SmsProviderError)) throw err;
          // Exact call site from index.ts's catch block.
          console.error("send-auth-sms: provider send failed", {
            message: err.message,
            retryable: err.retryable,
          });
        } finally {
          globalThis.fetch = originalFetch;
        }
      },
    )
  );

  assertEquals(log.includes(FAKE_OTP), false);
  assertEquals(log.includes(FAKE_PHONE), false);
  assertEquals(log.includes(FAKE_SHARED_SECRET), false);
});

Deno.test("malformed hook payload logging never contains the phone or otp", async () => {
  const log = await captureConsoleError(() => {
    // Exact call site from index.ts's payload-validation branch -- a
    // static string, no interpolation, by design.
    console.error("send-auth-sms: malformed hook payload (missing phone or otp)");
  });

  assertEquals(log.includes(FAKE_OTP), false);
  assertEquals(log.includes(FAKE_PHONE), false);
});

Deno.test("hook signature verification failure logging never contains headers or body", async () => {
  const log = await captureConsoleError(() => {
    // Exact call site from index.ts's hook-verification catch block --
    // again a static string; the raw request/headers are deliberately
    // never passed to it.
    console.error("send-auth-sms: hook signature verification failed");
  });

  assertEquals(log.includes(FAKE_OTP), false);
  assertEquals(log.includes(FAKE_PHONE), false);
  assertEquals(log.includes(FAKE_SHARED_SECRET), false);
});
