import test from "node:test";
import assert from "node:assert/strict";
import { deriveDisciplinePosition } from "./discipline-position.ts";

test("returns empty string when there is no sport row", () => {
  assert.equal(deriveDisciplinePosition(null), "");
});

test("returns empty string when neither field is set", () => {
  assert.equal(deriveDisciplinePosition({ sport_discipline: null, position_role: null }), "");
});

test("uses sport_discipline directly once it already holds the merged value", () => {
  assert.equal(
    deriveDisciplinePosition({ sport_discipline: "Sprint / Striker", position_role: null }),
    "Sprint / Striker",
  );
});

test("falls back to position_role when only it is set (never loses legacy position-only data)", () => {
  assert.equal(
    deriveDisciplinePosition({ sport_discipline: null, position_role: "Goalkeeper" }),
    "Goalkeeper",
  );
});

test("joins both when a legacy record has two different values, losing neither", () => {
  assert.equal(
    deriveDisciplinePosition({ sport_discipline: "Sprint", position_role: "Striker" }),
    "Sprint / Striker",
  );
});

test("does not duplicate when both fields happen to hold the same value", () => {
  assert.equal(
    deriveDisciplinePosition({ sport_discipline: "All-rounder", position_role: "All-rounder" }),
    "All-rounder",
  );
});
