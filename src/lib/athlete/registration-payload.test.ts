import test from "node:test";
import assert from "node:assert/strict";
import { buildSaveRegistrationArgs } from "./registration-payload.ts";
import type { AthleteRegistrationFormValues } from "../../types/athlete.ts";

function baseValues(
  overrides: Partial<AthleteRegistrationFormValues["personalDetails"]> = {},
): AthleteRegistrationFormValues {
  return {
    personalDetails: {
      fullName: "Test Athlete",
      dateOfBirth: "2000-01-01",
      gender: "male",
      nationality: "Indian",
      country: "India",
      city: "Bengaluru",
      mobileNumber: "+919876543210",
      email: "athlete@example.com",
      preferredLanguage: "en",
      emergencyContact: "",
      school: "",
      club: "",
      coachName: "",
      aadhaarOrGovtId: "",
      ...overrides,
    },
    sportsInformation: {
      primarySport: "",
      sportCategory: "",
      discipline: "",
      position: "",
      skillLevel: "",
    },
    achievements: [],
    additionalRecognition: {
      awards: "",
      scholarshipRecipient: "",
    },
  };
}

test("maps preferred language, emergency contact, and Aadhaar/Govt ID to their RPC parameters", () => {
  const args = buildSaveRegistrationArgs(
    baseValues({
      preferredLanguage: "hi",
      emergencyContact: "+919876500000",
      aadhaarOrGovtId: "1234 5678 9012",
    }),
    "submitted",
    "+919876543210",
  );

  assert.equal(args.p_preferred_language, "hi");
  assert.equal(args.p_emergency_contact, "+919876500000");
  assert.equal(args.p_aadhaar_or_govt_id, "1234 5678 9012");
});

test("blank optional Emergency Contact and Aadhaar/Govt ID map to null, never an empty string", () => {
  const args = buildSaveRegistrationArgs(baseValues(), "draft", "+919876543210");

  assert.equal(args.p_emergency_contact, null);
  assert.equal(args.p_aadhaar_or_govt_id, null);
});

test("mobile number always comes from the authenticated session, never the form's own field", () => {
  const args = buildSaveRegistrationArgs(
    baseValues({ mobileNumber: "+910000000000" }),
    "submitted",
    "+919876543210",
  );

  assert.equal(args.p_mobile_number, "+919876543210");
});

test("existing personal-detail fields still map correctly (no regression)", () => {
  const args = buildSaveRegistrationArgs(baseValues(), "submitted", "+919876543210");

  assert.equal(args.p_full_name, "Test Athlete");
  assert.equal(args.p_email, "athlete@example.com");
  assert.equal(args.p_school_college, null);
});
