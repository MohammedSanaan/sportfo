import test from "node:test";
import assert from "node:assert/strict";
import { toMyIdentityResult } from "./my-identity.ts";
import type { AccountIdentity } from "@/lib/account/identity";

test("maps sportfoId, displayName, and category id to role", () => {
  const identity: AccountIdentity = {
    sportfoId: "SF000123",
    isAdmin: false,
    displayName: "Test Athlete",
    category: { id: "athlete" } as AccountIdentity["category"],
    profileHref: "/athlete/profile",
  };
  assert.deepEqual(toMyIdentityResult(identity), {
    sportfoId: "SF000123",
    displayName: "Test Athlete",
    role: "athlete",
  });
});

test("role is null when there is no submitted registration yet", () => {
  const identity: AccountIdentity = {
    sportfoId: "SF000123",
    isAdmin: false,
    displayName: null,
    category: null,
    profileHref: null,
  };
  assert.equal(toMyIdentityResult(identity).role, null);
});

test("never returns the internal auth UUID, isAdmin, or profileHref", () => {
  const identity: AccountIdentity = {
    sportfoId: "SF000123",
    isAdmin: true,
    displayName: "Test Athlete",
    category: { id: "athlete" } as AccountIdentity["category"],
    profileHref: "/athlete/profile",
  };
  const result = toMyIdentityResult(identity) as unknown as Record<string, unknown>;
  assert.deepEqual(Object.keys(result).sort(), ["displayName", "role", "sportfoId"]);
  assert.equal("isAdmin" in result, false);
  assert.equal("id" in result, false);
  assert.equal("profileHref" in result, false);
});
