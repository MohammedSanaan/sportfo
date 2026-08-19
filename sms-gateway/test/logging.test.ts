import { test } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { buildApp } from "../src/app.js";
import { testConfig, VALID_OTP, VALID_PHONE } from "./helpers.js";

function collectingStream(): { stream: Writable; lines: () => string } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return { stream, lines: () => chunks.join("\n") };
}

test("logs never contain the otp or phone number on a successful send", async () => {
  const { stream, lines } = collectingStream();
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: true }),
    loggerStream: stream,
  });

  await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: `Bearer ${config.smsGatewaySharedSecret}` },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });
  await app.close();

  const log = lines();
  assert.equal(log.includes(VALID_OTP), false);
  assert.equal(log.includes(VALID_PHONE), false);
});

test("logs never contain the otp, phone, or shared secret on an auth failure", async () => {
  const { stream, lines } = collectingStream();
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: true }),
    loggerStream: stream,
  });

  await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: "Bearer some-wrong-guess-at-the-secret" },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });
  await app.close();

  const log = lines();
  assert.equal(log.includes(VALID_OTP), false);
  assert.equal(log.includes(VALID_PHONE), false);
  assert.equal(log.includes(config.smsGatewaySharedSecret), false);
  assert.equal(log.includes("some-wrong-guess-at-the-secret"), false);
});

test("logs never contain the MSG91 auth key or the otp on a provider error", async () => {
  const { stream, lines } = collectingStream();
  const config = testConfig();
  const app = await buildApp({
    config,
    sendSms: async () => ({ ok: false, category: "provider_error" }),
    loggerStream: stream,
  });

  await app.inject({
    method: "POST",
    url: "/send-sms",
    headers: { authorization: `Bearer ${config.smsGatewaySharedSecret}` },
    payload: { to: VALID_PHONE, otp: VALID_OTP },
  });
  await app.close();

  const log = lines();
  assert.equal(log.includes(VALID_OTP), false);
  assert.equal(log.includes(VALID_PHONE), false);
  assert.equal(log.includes(config.msg91AuthKey), false);
});
