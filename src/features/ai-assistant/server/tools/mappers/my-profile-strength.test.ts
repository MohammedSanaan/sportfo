import test from "node:test";
import assert from "node:assert/strict";
import { toMyProfileStrengthResult } from "./my-profile-strength.ts";
import { calculateProfileStrength } from "../../../../../lib/athlete/profile-strength.ts";
import { buildDraftFixture } from "./test-fixtures.ts";

test("reuses calculateProfileStrength's own percentage and item labels -- never a second calculation", () => {
  const draft = buildDraftFixture();
  const canonical = calculateProfileStrength(draft);
  const result = toMyProfileStrengthResult(draft);

  assert.equal(result.percentage, canonical.percentage);
  assert.deepEqual(
    result.completedItems,
    canonical.items.filter((item) => item.complete).map((item) => item.label),
  );
  assert.deepEqual(
    result.missingItems,
    canonical.items.filter((item) => !item.complete).map((item) => item.label),
  );
});

test("a fully complete fixture profile is 100% with no missing items", () => {
  const result = toMyProfileStrengthResult(buildDraftFixture());
  assert.equal(result.hasProfile, true);
  assert.equal(result.percentage, 100);
  assert.deepEqual(result.missingItems, []);
});

test("missing sections show up by label, not silently dropped", () => {
  const draft = buildDraftFixture({ sport: null, achievements: [] });
  const result = toMyProfileStrengthResult(draft);
  assert.ok(result.missingItems.includes("Sports information complete"));
  assert.ok(result.missingItems.includes("At least one achievement added"));
});

test("no draft at all is handled safely", () => {
  assert.deepEqual(toMyProfileStrengthResult(null), {
    hasProfile: false,
    percentage: 0,
    completedItems: [],
    missingItems: [],
  });
});
