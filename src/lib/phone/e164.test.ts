import test from "node:test";
import assert from "node:assert/strict";
import { toE164, isValidE164, maskPhoneNumber } from "./e164.ts";

test("toE164 concatenates dial code and digits, stripping non-digit characters", () => {
  assert.equal(toE164("+91", "98765 43210"), "+919876543210");
  assert.equal(toE164("+974", "9876500003"), "+9749876500003");
});

test("isValidE164 accepts well-formed international numbers", () => {
  assert.equal(isValidE164("+919876543210"), true);
  assert.equal(isValidE164("+9749876500003"), true);
});

test("isValidE164 rejects blank, too-short, and malformed values", () => {
  assert.equal(isValidE164(""), false);
  assert.equal(isValidE164("+91"), false);
  assert.equal(isValidE164("9876543210"), false); // missing leading +
  assert.equal(isValidE164("+0123456789"), false); // leading 0 after +
});

// The Emergency Contact field only ever passes digits through (its number
// input strips everything else on every keystroke -- see
// EmergencyContactField.tsx's onChange), but isValidE164 is the actual
// safety net if that were ever bypassed.
test("isValidE164 rejects alphabetic garbage", () => {
  assert.equal(isValidE164("+91abcdefghij"), false);
  assert.equal(isValidE164("not-a-phone-number"), false);
});

test("maskPhoneNumber hides all but the last two digits", () => {
  assert.equal(maskPhoneNumber("+974", "9876500003"), "+974 ••••••••03");
});
