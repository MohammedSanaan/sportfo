import test from "node:test";
import assert from "node:assert/strict";
import { toMyVerificationSummaryResult } from "./my-verification-summary.ts";
import { buildAchievementFixture, buildDraftFixture } from "./test-fixtures.ts";

test("aggregates verification counts correctly", () => {
  const draft = buildDraftFixture({
    achievements: [
      buildAchievementFixture({ verification_status: "verified" }),
      buildAchievementFixture({ verification_status: "pending" }),
      buildAchievementFixture({ verification_status: "pending" }),
    ],
  });
  assert.deepEqual(toMyVerificationSummaryResult(draft), { total: 3, verified: 1, pending: 2, rejected: 0 });
});

test("no draft at all is handled safely", () => {
  assert.deepEqual(toMyVerificationSummaryResult(null), { total: 0, verified: 0, pending: 0, rejected: 0 });
});

test("result shape carries no per-achievement detail or moderation notes", () => {
  const result = toMyVerificationSummaryResult(buildDraftFixture()) as unknown as Record<string, unknown>;
  assert.deepEqual(Object.keys(result).sort(), ["pending", "rejected", "total", "verified"]);
});
