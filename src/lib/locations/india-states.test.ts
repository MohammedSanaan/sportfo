import test from "node:test";
import assert from "node:assert/strict";
import { INDIA_STATES_AND_UTS, normalizeIndiaState, isIndiaCountryValue } from "./india-states.ts";

test("all 28 States are present", () => {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];
  assert.equal(states.length, 28);
  const values = INDIA_STATES_AND_UTS.map((o) => o.value);
  for (const state of states) {
    assert.ok(values.includes(state), `expected "${state}" in the catalog`);
  }
});

test("all 8 Union Territories are present", () => {
  const uts = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  assert.equal(uts.length, 8);
  const values = INDIA_STATES_AND_UTS.map((o) => o.value);
  for (const ut of uts) {
    assert.ok(values.includes(ut), `expected "${ut}" in the catalog`);
  }
});

test("exactly 36 total entries, no duplicates", () => {
  assert.equal(INDIA_STATES_AND_UTS.length, 36);
  const unique = new Set(INDIA_STATES_AND_UTS.map((o) => o.value));
  assert.equal(unique.size, 36);
});

test("value equals label for every entry (proper noun, not a slug)", () => {
  for (const option of INDIA_STATES_AND_UTS) {
    assert.equal(option.value, option.label);
  }
});

test("list is alphabetically sorted", () => {
  const labels = INDIA_STATES_AND_UTS.map((o) => o.label);
  const sorted = [...labels].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(labels, sorted);
});

test("Karnataka, Kerala, Delhi, Jammu and Kashmir, and Puducherry are all selectable", () => {
  const values = INDIA_STATES_AND_UTS.map((o) => o.value);
  for (const name of ["Karnataka", "Kerala", "Delhi", "Jammu and Kashmir", "Puducherry"]) {
    assert.ok(values.includes(name), `expected "${name}" to be selectable`);
  }
});

test("normalizeIndiaState matches case/whitespace differences to the canonical value", () => {
  assert.equal(normalizeIndiaState("karnataka"), "Karnataka");
  assert.equal(normalizeIndiaState("  Karnataka  "), "Karnataka");
  assert.equal(normalizeIndiaState("KARNATAKA"), "Karnataka");
  assert.equal(normalizeIndiaState("tamil   nadu"), "Tamil Nadu");
});

test("normalizeIndiaState preserves an unrecognized value unchanged, never deletes it", () => {
  assert.equal(normalizeIndiaState("Some Old Free-Text Region"), "Some Old Free-Text Region");
  assert.equal(normalizeIndiaState(""), "");
});

test("isIndiaCountryValue recognizes India case-insensitively, trimmed", () => {
  assert.equal(isIndiaCountryValue("India"), true);
  assert.equal(isIndiaCountryValue("india"), true);
  assert.equal(isIndiaCountryValue("  INDIA  "), true);
  assert.equal(isIndiaCountryValue("Qatar"), false);
  assert.equal(isIndiaCountryValue(""), false);
});
