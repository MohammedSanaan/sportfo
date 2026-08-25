import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_SPORTS,
  SPORT_CATEGORIES,
  getCategoriesForSport,
  getUnresolvedSports,
  getMultiCategorySports,
  SPORTS_CATALOG,
} from "./catalog.ts";

test("canonical sports list has no duplicates and is alphabetically sorted", () => {
  const sorted = [...CANONICAL_SPORTS].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(CANONICAL_SPORTS, sorted);
  assert.equal(new Set(CANONICAL_SPORTS).size, CANONICAL_SPORTS.length);
});

test("every resolved category belongs to the canonical category list", () => {
  for (const entry of SPORTS_CATALOG) {
    for (const category of entry.categories) {
      assert.ok(
        (SPORT_CATEGORIES as readonly string[]).includes(category),
        `${entry.sport} resolved to unknown category "${category}"`,
      );
    }
  }
});

const SINGLE_CATEGORY_CASES: Array<[string, string]> = [
  ["Cricket", "Team Sports"],
  ["Badminton", "Racquet & Paddle Sports"],
  ["Boxing", "Combat Sports"],
  ["Archery", "Target Sports"],
  ["Swimming", "Water Sports"],
  ["Yoga", "Yoga & Wellness"],
  ["Wheelchair Basketball", "Para Sports"],
  ["Mixed Martial Arts (MMA)", "Combat Sports"],
  ["Power Lifting", "Strength Sports"],
  ["Cycling – Road", "Cycling & Racing"],
  ["Athletics – Javelin Throw", "Athletics"],
  ["Gymnastics – Artistic", "Gymnastics"],
  ["Skiing – Alpine", "Winter Sports"],
];

for (const [sport, expectedCategory] of SINGLE_CATEGORY_CASES) {
  test(`${sport} -> ${expectedCategory}`, () => {
    assert.deepEqual(getCategoriesForSport(sport), [expectedCategory]);
  });
}

const MULTI_CATEGORY_CASES: Array<[string, string[]]> = [
  ["Kabaddi", ["Indian Indigenous Sports", "Team Sports"]],
  ["Surfing", ["Beach Sports", "Water Sports"]],
  ["Ice Hockey", ["Team Sports", "Winter Sports"]],
  ["Water Polo", ["Team Sports", "Water Sports"]],
  ["Roll Ball", ["Roller & Skating Sports", "Team Sports"]],
];

for (const [sport, expectedCategories] of MULTI_CATEGORY_CASES) {
  test(`${sport} is multi-category -> ${expectedCategories.join(" + ")}`, () => {
    assert.deepEqual(getCategoriesForSport(sport), expectedCategories);
  });
}

test("changing sport from Cricket to Badminton changes category with no stale value", () => {
  const cricketCategories = getCategoriesForSport("Cricket");
  const badmintonCategories = getCategoriesForSport("Badminton");
  assert.deepEqual(cricketCategories, ["Team Sports"]);
  assert.deepEqual(badmintonCategories, ["Racquet & Paddle Sports"]);
  assert.notDeepEqual(cricketCategories, badmintonCategories);
});

test("unresolved sports are exactly the expected set (no silent guesses)", () => {
  assert.deepEqual(
    [...getUnresolvedSports()].sort(),
    ["E-Sports", "Fencing", "Hockey", "Korf Ball", "Others", "Tug of War", "Wushu"].sort(),
  );
});

test("multi-category sports match the full supplied set", () => {
  const multi = getMultiCategorySports()
    .map((entry) => entry.sport)
    .sort();
  assert.deepEqual(
    multi,
    [
      "Canoeing",
      "Circle Style Kabaddi",
      "Ice Hockey",
      "Ice Skating",
      "Kabaddi",
      "Kayaking",
      "Kho-Kho",
      "Roll Ball",
      "Rowing",
      "Silambam",
      "Stand-Up Paddleboarding",
      "Surfing",
      "Water Polo",
    ].sort(),
  );
});

test("unmapped sport returns an empty category list, never a guess", () => {
  assert.deepEqual(getCategoriesForSport("Others"), []);
  assert.deepEqual(getCategoriesForSport("E-Sports"), []);
});

test("unknown/blank sport input never throws", () => {
  assert.deepEqual(getCategoriesForSport(""), []);
  assert.deepEqual(getCategoriesForSport(null), []);
  assert.deepEqual(getCategoriesForSport(undefined), []);
  assert.deepEqual(getCategoriesForSport("Not A Real Sport"), []);
});
