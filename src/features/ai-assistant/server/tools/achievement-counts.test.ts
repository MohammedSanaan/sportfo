import test from "node:test";
import assert from "node:assert/strict";
import { countByVerificationStatus } from "./achievement-counts.ts";

test("counts each status independently", () => {
  const result = countByVerificationStatus([
    { verification_status: "verified" },
    { verification_status: "verified" },
    { verification_status: "pending" },
    { verification_status: "rejected" },
    { verification_status: "rejected" },
    { verification_status: "rejected" },
  ]);
  assert.deepEqual(result, { total: 6, verified: 2, pending: 1, rejected: 3 });
});

test("empty list -> all zero", () => {
  assert.deepEqual(countByVerificationStatus([]), { total: 0, verified: 0, pending: 0, rejected: 0 });
});

test("an unrecognized status counts toward total but no specific bucket", () => {
  const result = countByVerificationStatus([{ verification_status: "something-else" }]);
  assert.deepEqual(result, { total: 1, verified: 0, pending: 0, rejected: 0 });
});
