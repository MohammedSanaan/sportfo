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
      competitionLevel: "",
      supportNeeded: [],
      supportNeededOther: "",
    },
    achievements: [],
    additionalRecognition: {
      awards: "",
      scholarshipRecipient: "",
    },
    employment: {
      employmentType: "",
      organization: "",
      jobTitle: "",
      yearsExperience: "",
    },
    apparelLogistics: {
      trackSuitSize: "",
      tshirtSize: "",
      shortsSize: "",
      shoeSize: "",
    },
    profileSetup: {
      photo: null,
      photoPath: null,
      shortBio: "",
      instagramUrl: "",
      facebookUrl: "",
      otherUrl: "",
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

test("competition level, support needed, employment, apparel, and profile setup fields map to their RPC parameters", () => {
  const values = baseValues();
  values.sportsInformation.competitionLevel = "state";
  values.sportsInformation.supportNeeded = ["Coaching & Training", "Other"];
  values.sportsInformation.supportNeededOther = "Video analysis";
  values.employment.employmentType = "student";
  values.apparelLogistics.shoeSize = "9";
  values.profileSetup.shortBio = "Sprinter from Bengaluru.";
  values.profileSetup.instagramUrl = "https://instagram.com/testathlete";
  values.profileSetup.photoPath = "user-1/photo.jpg";

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  assert.equal(args.p_competition_level, "state");
  assert.deepEqual(args.p_support_needed, ["Coaching & Training", "Other"]);
  assert.equal(args.p_support_needed_other, "Video analysis");
  assert.equal(args.p_employment_type, "student");
  assert.equal(args.p_shoe_size, "9");
  assert.equal(args.p_short_bio, "Sprinter from Bengaluru.");
  assert.equal(args.p_instagram_url, "https://instagram.com/testathlete");
  assert.equal(args.p_profile_photo_path, "user-1/photo.jpg");
});

test("empty support needed selection maps to null, not an empty array", () => {
  const args = buildSaveRegistrationArgs(baseValues(), "draft", "+919876543210");

  assert.equal(args.p_support_needed, null);
});

test("achievement certificate level is mapped, verification status is never sent", () => {
  const values = baseValues();
  values.achievements = [
    {
      id: "achv-1",
      title: "State Champion",
      type: "medal",
      organization: "State Athletics Body",
      date: "2024-01-01",
      description: "",
      certificateLevel: "state",
      verificationStatus: "verified",
      document: null,
      documentPath: null,
    },
  ];

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
  assert.equal(achievement.certificate_level, "state");
  assert.equal("verification_status" in achievement, false);
});
