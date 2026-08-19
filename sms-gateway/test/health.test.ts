import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { testConfig } from "./helpers.js";

test("GET /health returns 200 {status: ok} with no auth required", async () => {
  const app = await buildApp({ config: testConfig() });
  const response = await app.inject({ method: "GET", url: "/health" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
  await app.close();
});

test("GET /health does not leak configuration", async () => {
  const app = await buildApp({ config: testConfig() });
  const response = await app.inject({ method: "GET", url: "/health" });
  const text = response.body;

  assert.equal(text.includes("msg91"), false);
  assert.equal(text.toLowerCase().includes("secret"), false);
  assert.equal(text.toLowerCase().includes("key"), false);
  await app.close();
});
