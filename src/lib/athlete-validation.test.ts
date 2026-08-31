import test from "node:test";
import assert from "node:assert/strict";
import { emailRule, mobileNumberRule } from "./athlete-validation.ts";

function runValidate(rule: { validate: (value: string) => true | string }, value: string) {
  return rule.validate(value);
}

test("mobileNumberRule rejects letters", () => {
  assert.equal(runValidate(mobileNumberRule, "98765abcde"), "Enter a valid mobile number.");
});

test("mobileNumberRule rejects an obviously too-short number", () => {
  assert.equal(runValidate(mobileNumberRule, "12345"), "Enter a valid mobile number.");
});

test("mobileNumberRule rejects an obviously too-long number", () => {
  assert.equal(runValidate(mobileNumberRule, "1234567890123456"), "Enter a valid mobile number.");
});

test("mobileNumberRule accepts a valid India (+91) number", () => {
  assert.equal(runValidate(mobileNumberRule, "+91 98765 43210"), true);
});

test("mobileNumberRule accepts a valid international (non-India) number", () => {
  // +974 (Qatar), 8 national digits -- confirms this never assumes every
  // number is Indian.
  assert.equal(runValidate(mobileNumberRule, "+974 3456 7890"), true);
});

test("emailRule rejects malformed addresses", () => {
  for (const value of ["abc", "abc@", "abc@domain"]) {
    assert.equal(runValidate(emailRule, value), "Enter a valid email address.");
  }
});

test("emailRule accepts a valid address", () => {
  assert.equal(runValidate(emailRule, "name@example.com"), true);
});

test("emailRule trims surrounding whitespace before validating", () => {
  assert.equal(runValidate(emailRule, "  name@example.com  "), true);
});

test("emailRule treats a whitespace-only value as required, not malformed", () => {
  assert.equal(runValidate(emailRule, "   "), "Email address is required.");
});
