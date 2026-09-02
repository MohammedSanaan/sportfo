import test from "node:test";
import assert from "node:assert/strict";
import { toMyAchievementsResult } from "./my-achievements.ts";
import { buildAchievementFixture, buildDraftFixture } from "./test-fixtures.ts";

test("counts are correct across mixed verification statuses", () => {
  const draft = buildDraftFixture({
    achievements: [
      buildAchievementFixture({ id: "a1", verification_status: "verified" }),
      buildAchievementFixture({ id: "a2", verification_status: "verified" }),
      buildAchievementFixture({ id: "a3", verification_status: "pending" }),
      buildAchievementFixture({ id: "a4", verification_status: "rejected" }),
    ],
  });
  const result = toMyAchievementsResult(draft);
  assert.equal(result.total, 4);
  assert.equal(result.verified, 2);
  assert.equal(result.pending, 1);
  assert.equal(result.rejected, 1);
  assert.equal(result.achievements.length, 4);
});

test("never exposes the document storage path, database row id, or athlete_profile_id", () => {
  const result = toMyAchievementsResult(buildDraftFixture());
  const [summary] = result.achievements as unknown as Record<string, unknown>[];
  assert.deepEqual(Object.keys(summary).sort(), ["date", "title", "type", "verificationStatus"]);
  assert.equal("documentPath" in summary, false);
  assert.equal("document_path" in summary, false);
  assert.equal("id" in summary, false);
  assert.equal("athleteProfileId" in summary, false);
});

test("no draft at all -> zero counts, empty list, handled safely", () => {
  assert.deepEqual(toMyAchievementsResult(null), { total: 0, verified: 0, pending: 0, rejected: 0, achievements: [] });
});
