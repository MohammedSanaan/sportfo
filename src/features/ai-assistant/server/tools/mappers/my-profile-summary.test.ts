import test from "node:test";
import assert from "node:assert/strict";
import { toMyProfileSummaryResult } from "./my-profile-summary.ts";
import { buildDraftFixture, buildProfileFixture } from "./test-fixtures.ts";

test("a submitted profile maps exactly the fields the task spec allows", () => {
  const result = toMyProfileSummaryResult(buildDraftFixture());
  assert.deepEqual(result, {
    hasProfile: true,
    primarySport: "Cricket",
    secondarySports: ["Badminton"],
    sportCategory: "Team Sports",
    skillLevel: "intermediate",
    competitionLevel: "district",
    clubAcademy: "SportFo Academy",
    coachMentor: "Coach Rao",
    profileVisibility: "public",
  });
});

test("never exposes Aadhaar, emergency contact, mobile number, email, or the photo storage path", () => {
  const result = toMyProfileSummaryResult(buildDraftFixture()) as unknown as Record<string, unknown>;
  for (const forbidden of [
    "aadhaarOrGovtId",
    "aadhaar_or_govt_id",
    "emergencyContact",
    "emergency_contact",
    "mobileNumber",
    "mobile_number",
    "email",
    "profilePhotoPath",
    "profile_photo_path",
    "dateOfBirth",
    "date_of_birth",
  ]) {
    assert.equal(forbidden in result, false, `must not expose "${forbidden}"`);
  }
});

test("a draft-only (never submitted) profile is reported as not having a profile yet", () => {
  const draft = buildDraftFixture({ profile: buildProfileFixture({ profile_status: "draft" }) });
  assert.equal(toMyProfileSummaryResult(draft).hasProfile, false);
});

test("no draft at all is handled safely -- an empty, still-typed shape, never a throw", () => {
  const result = toMyProfileSummaryResult(null);
  assert.equal(result.hasProfile, false);
  assert.equal(result.primarySport, null);
  assert.deepEqual(result.secondarySports, []);
  assert.equal(result.profileVisibility, "private");
});

test("a private profile maps profileVisibility to \"private\"", () => {
  const draft = buildDraftFixture({ profile: buildProfileFixture({ is_public: false }) });
  assert.equal(toMyProfileSummaryResult(draft).profileVisibility, "private");
});
