import { assertEquals } from "jsr:@std/assert";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { HookVerificationError, verifySendSmsHook } from "./verify-hook.ts";

// A fresh, random test-only secret -- never a real hook secret.
const TEST_BASE64_SECRET = btoa("test-secret-bytes-not-real-1234");
const TEST_SECRET = `v1,whsec_${TEST_BASE64_SECRET}`;

function signTestPayload(payload: string) {
  const wh = new Webhook(TEST_BASE64_SECRET);
  const id = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = wh.sign(id, new Date(Number(timestamp) * 1000), payload);
  return new Headers({
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": signature,
  });
}

Deno.test("verifySendSmsHook accepts a correctly signed payload", () => {
  const payload = JSON.stringify({
    user: { phone: "+97455512345" },
    sms: { otp: "561166" },
  });
  const headers = signTestPayload(payload);

  const result = verifySendSmsHook(payload, headers, TEST_SECRET);
  assertEquals(result.user.phone, "+97455512345");
  assertEquals(result.sms.otp, "561166");
});

Deno.test("verifySendSmsHook rejects a tampered payload", () => {
  const payload = JSON.stringify({ user: { phone: "+97455512345" }, sms: { otp: "561166" } });
  const headers = signTestPayload(payload);
  const tamperedPayload = JSON.stringify({ user: { phone: "+97455512345" }, sms: { otp: "999999" } });

  let threw = false;
  try {
    verifySendSmsHook(tamperedPayload, headers, TEST_SECRET);
  } catch (err) {
    threw = err instanceof HookVerificationError;
  }
  assertEquals(threw, true);
});

Deno.test("verifySendSmsHook rejects a request signed with the wrong secret", () => {
  const payload = JSON.stringify({ user: { phone: "+97455512345" }, sms: { otp: "561166" } });
  const headers = signTestPayload(payload);
  const wrongSecret = `v1,whsec_${btoa("a-completely-different-secret!!")}`;

  let threw = false;
  try {
    verifySendSmsHook(payload, headers, wrongSecret);
  } catch (err) {
    threw = err instanceof HookVerificationError;
  }
  assertEquals(threw, true);
});

Deno.test("verifySendSmsHook rejects a request missing signature headers", () => {
  const payload = JSON.stringify({ user: { phone: "+97455512345" }, sms: { otp: "561166" } });

  let threw = false;
  try {
    verifySendSmsHook(payload, new Headers(), TEST_SECRET);
  } catch (err) {
    threw = err instanceof HookVerificationError;
  }
  assertEquals(threw, true);
});
