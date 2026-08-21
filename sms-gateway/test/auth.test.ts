import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { testConfig, VALID_OTP, VALID_PHONE } from "./helpers.js";
import type { Msg91Outcome } from "../src/providers/msg91.js";

const stubSendSms = async (): Promise<Msg91Outcome> => ({ ok: true });

test("POST /send-sms with no Authorization header is rejected (401)", async () => {
  const app = await buildApp({ config: testConfig(), sendSms: stubSendSms });
  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), { success: false, code: "UNAUTHORIZED" });
  await app.close();
});

test("POST /send-sms with the wrong shared secret is rejected (401)", async () => {
  const app = await buildApp({ config: testConfig(), sendSms: stubSendSms });
  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: "Bearer not-the-real-secret" },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), { success: false, code: "UNAUTHORIZED" });
  await app.close();
});

test("POST /send-sms with a malformed Authorization header (not Bearer) is rejected (401)", async () => {
  const app = await buildApp({ config: testConfig(), sendSms: stubSendSms });
  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: "Basic dGVzdDp0ZXN0" },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /send-sms with an empty Bearer token is rejected (401)", async () => {
  const app = await buildApp({ config: testConfig(), sendSms: stubSendSms });
  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: "Bearer " },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /send-sms with the correct shared secret is authorized", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: stubSendSms });
  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: `Bearer ${config.smsGatewaySharedSecret}` },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 200);
  await app.close();
});
