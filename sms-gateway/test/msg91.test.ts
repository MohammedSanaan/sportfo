import { test } from "node:test";
import assert from "node:assert/strict";
import { sendViaMsg91 } from "../src/providers/msg91.js";
import { testConfig, VALID_OTP, VALID_PHONE } from "./helpers.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("sendViaMsg91 sends the expected request shape (flow_id/sender/recipients, mobile without +)", async () => {
  const config = testConfig();
  let capturedUrl: string | URL | Request | undefined;
  let capturedInit: RequestInit | undefined;

  const fakeFetch: typeof fetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return jsonResponse(200, { type: "success", message: "req-id-123" });
  };

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, true);
  assert.equal(capturedUrl, "https://api.msg91.com/api/v5/flow/");

  const headers = capturedInit?.headers as Record<string, string>;
  assert.equal(headers.authkey, config.msg91AuthKey);
  assert.equal(headers["Content-Type"], "application/json");

  const body = JSON.parse(String(capturedInit?.body));
  assert.equal(body.flow_id, config.msg91TemplateId);
  assert.equal(body.sender, config.msg91SenderId);
  assert.equal(body.recipients.length, 1);
  assert.equal(body.recipients[0].mobiles, "974555123456"); // no leading '+'
  assert.equal(body.recipients[0].otp, VALID_OTP);
});

test("sendViaMsg91 treats HTTP 200 with type:error as a provider error", async () => {
  const config = testConfig();
  const fakeFetch: typeof fetch = async () =>
    jsonResponse(200, { type: "error", message: "invalid mobile number" });

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.category, "provider_error");
});

test("sendViaMsg91 treats a 4xx HTTP response as a provider error", async () => {
  const config = testConfig();
  const fakeFetch: typeof fetch = async () => new Response("bad request", { status: 400 });

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.category, "provider_error");
});

test("sendViaMsg91 treats a 5xx HTTP response as a provider error", async () => {
  const config = testConfig();
  const fakeFetch: typeof fetch = async () => new Response("upstream down", { status: 502 });

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.category, "provider_error");
});

test("sendViaMsg91 treats an aborted/timed-out request as provider_timeout", async () => {
  const config = testConfig();
  const fakeFetch: typeof fetch = async (_url, init) => {
    return new Promise((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener("abort", () => {
        reject(new DOMException("The operation was aborted", "AbortError"));
      });
    });
  };

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.category, "provider_timeout");
});

test("sendViaMsg91 treats a plain network failure as a provider error (not a timeout)", async () => {
  const config = testConfig();
  const fakeFetch: typeof fetch = async () => {
    throw new TypeError("Failed to fetch");
  };

  const outcome = await sendViaMsg91(config, { to: VALID_PHONE, otp: VALID_OTP }, fakeFetch);

  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.equal(outcome.category, "provider_error");
});
