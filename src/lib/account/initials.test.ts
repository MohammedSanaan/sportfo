import test from "node:test";
import assert from "node:assert/strict";
import { getInitials } from "./initials.ts";

test("two-word name uses first letter of first and last word", () => {
  assert.equal(getInitials("Mohammed Sanaan"), "MS");
});

test("three-plus-word name still uses first and last word only", () => {
  assert.equal(getInitials("Priya Anjali Sharma"), "PS");
});

test("single-word name uses its first two letters", () => {
  assert.equal(getInitials("Sanobar"), "SA");
});

test("blank/whitespace/null/undefined all return empty string", () => {
  assert.equal(getInitials(""), "");
  assert.equal(getInitials("   "), "");
  assert.equal(getInitials(null), "");
  assert.equal(getInitials(undefined), "");
});

test("collapses repeated internal whitespace", () => {
  assert.equal(getInitials("Mohammed    Sanaan"), "MS");
});

test("always uppercases regardless of input case", () => {
  assert.equal(getInitials("mohammed sanaan"), "MS");
});
