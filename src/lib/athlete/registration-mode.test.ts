import test from "node:test";
import assert from "node:assert/strict";
import { isEditModeFromStatus } from "./registration-mode.ts";

test("no athlete_profiles row (null) -> create mode", () => {
  assert.equal(isEditModeFromStatus(null), false);
});

test("no status resolved (undefined) -> create mode", () => {
  assert.equal(isEditModeFromStatus(undefined), false);
});

test("a draft-only row (never submitted) -> still create mode, not edit", () => {
  // A first-time athlete who has only ever hit Save Draft must still see
  // "Create Athlete Profile" -- edit mode is specifically about an
  // already-*submitted* profile (the only state /athlete/profile itself
  // ever renders for), never merely "a row exists".
  assert.equal(isEditModeFromStatus("draft"), false);
});

test("a submitted row -> edit mode", () => {
  assert.equal(isEditModeFromStatus("submitted"), true);
});

test("an unrecognized status never accidentally reads as edit mode", () => {
  assert.equal(isEditModeFromStatus("something-unexpected"), false);
});
