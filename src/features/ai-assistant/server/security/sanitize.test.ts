import test from "node:test";
import assert from "node:assert/strict";
import { assertNoForbiddenFields, FORBIDDEN_RESULT_KEYS } from "./sanitize.ts";

test("passes a clean, allowlisted result shape", () => {
  assert.doesNotThrow(() => assertNoForbiddenFields({ sportfoId: "SF000123", displayName: "Test", role: "athlete" }));
});

test("throws on a top-level Aadhaar field", () => {
  assert.throws(() => assertNoForbiddenFields({ aadhaarOrGovtId: "1234" }), /aadhaarOrGovtId/);
});

test("throws on a snake_case emergency contact field", () => {
  assert.throws(() => assertNoForbiddenFields({ emergency_contact: "+911234567890" }), /emergency_contact/);
});

test("throws on a private document path nested inside an array several levels deep", () => {
  assert.throws(
    () => assertNoForbiddenFields({ achievements: [{ title: "State Meet", documentPath: "private/secret.pdf" }] }),
    /documentPath/,
  );
});

test("throws on an internal database id or auth user id anywhere in the tree", () => {
  assert.throws(() => assertNoForbiddenFields({ profile: { id: "row-1" } }), /"id"/);
  assert.throws(() => assertNoForbiddenFields({ user_id: "11111111-1111-1111-1111-111111111111" }), /user_id/);
});

test("every field the task spec says must never be exposed is actually in the forbidden set", () => {
  for (const key of ["aadhaar_or_govt_id", "emergency_contact", "document_path", "user_id", "id"]) {
    assert.ok(FORBIDDEN_RESULT_KEYS.has(key), `expected "${key}" to be forbidden`);
  }
});
