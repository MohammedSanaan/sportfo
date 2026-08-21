import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { testConfig, VALID_OTP, VALID_PHONE } from "./helpers.js";
import type { GatewayConfig } from "../src/config.js";
import type { Msg91Outcome } from "../src/providers/msg91.js";

function authHeader(config: GatewayConfig) {
  return { authorization: `Bearer ${config.smsGatewaySharedSecret}` };
}

test("POST /send-sms rejects a malformed phone number (400)", async () => {
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: true }) as Msg91Outcome,
  });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: "not-a-phone-number", otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { success: false, code: "INVALID_REQUEST" });
  await app.close();
});

test("POST /send-sms rejects a phone number missing the country code +", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: async () => ({ ok: true }) });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: "97455512345", otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 400);
  await app.close();
});

test("POST /send-sms rejects a missing otp (400)", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: async () => ({ ok: true }) });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { success: false, code: "INVALID_REQUEST" });
  await app.close();
});

test("POST /send-sms rejects a non-6-digit otp (400)", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: async () => ({ ok: true }) });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE, otp: "12345" },
  });

  assert.equal(response.statusCode, 400);
  await app.close();
});

test("POST /send-sms with invalid JSON body returns the stable error shape (not Fastify's default)", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: async () => ({ ok: true }) });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { ...authHeader(config), "content-type": "application/json" },
    payload: "{ this is not valid json",
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { success: false, code: "INVALID_REQUEST" });
  await app.close();
});

test("POST /send-sms passes exactly {to, otp} through to the provider on a valid request", async () => {
  const config = testConfig();
  let received: unknown;
  const app = await buildApp({
    config,
    sendSms: async (_cfg, input) => {
      received = input;
      return { ok: true };
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { success: true });
  assert.deepEqual(received, { to: VALID_PHONE, otp: VALID_OTP });
  await app.close();
});

test("POST /send-sms maps a provider error to 502 SMS_PROVIDER_ERROR", async () => {
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: false, category: "provider_error" }),
  });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.json(), { success: false, code: "SMS_PROVIDER_ERROR" });
  await app.close();
});

test("POST /send-sms maps a provider timeout to 504 SMS_PROVIDER_TIMEOUT", async () => {
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: false, category: "provider_timeout" }),
  });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.statusCode, 504);
  assert.deepEqual(response.json(), { success: false, code: "SMS_PROVIDER_TIMEOUT" });
  await app.close();
});

test("POST /send-sms response never contains the otp value anywhere in the body", async () => {
  const config = testConfig();
  const app = await buildApp({ config, sendSms: async () => ({ ok: true }) });

  const response = await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: authHeader(config),
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });

  assert.equal(response.body.includes(VALID_OTP), false);
  await app.close();
});
