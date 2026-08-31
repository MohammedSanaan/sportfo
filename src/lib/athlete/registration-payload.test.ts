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
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      mobileNumber: "+919876543210",
      email: "athlete@example.com",
      preferredLanguage: "en",
      emergencyContact: "",
      school: "",
      aadhaarOrGovtId: "",
      ...overrides,
    },
    sportsInformation: {
      primarySport: "",
      secondarySports: [],
      sportCategory: "",
      disciplinePosition: "",
      skillLevel: "",
      competitionLevel: "",
      competitionLevelOther: "",
      club: "",
      coachName: "",
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

test("Club/Academy and Coach/Mentor Name are read from sportsInformation (moved from personalDetails)", () => {
  const values = baseValues();
  values.sportsInformation.club = "Alvas Sports Club";
  values.sportsInformation.coachName = "Rahul Sharma";

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  assert.equal(args.p_club_academy, "Alvas Sports Club");
  assert.equal(args.p_coach_mentor, "Rahul Sharma");
});

test("merged Sport Discipline / Position / Role writes into p_sport_discipline; p_position_role is always null", () => {
  const values = baseValues();
  values.sportsInformation.disciplinePosition = "Sprint";

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  assert.equal(args.p_sport_discipline, "Sprint");
  assert.equal(args.p_position_role, null);
});

test("Secondary Sports map to p_secondary_sports; empty selection maps to null", () => {
  const withSports = baseValues();
  withSports.sportsInformation.secondarySports = ["Badminton", "Swimming"];
  const argsWithSports = buildSaveRegistrationArgs(withSports, "submitted", "+919876543210");
  assert.deepEqual(argsWithSports.p_secondary_sports, ["Badminton", "Swimming"]);

  const argsEmpty = buildSaveRegistrationArgs(baseValues(), "draft", "+919876543210");
  assert.equal(argsEmpty.p_secondary_sports, null);
});

test("achievement certificate level and issuing organization are mapped, verification status is never sent", () => {
  const values = baseValues();
  values.achievements = [
    {
      id: "achv-1",
      title: "State Champion",
      type: "medal",
      typeOther: "",
      organization: "state-sports-authority",
      organizationOther: "",
      date: "2024-01-01",
      description: "",
      certificateLevel: "state",
      medalType: "gold",
      verificationStatus: "verified",
      document: null,
      documentPath: null,
    },
  ];

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
  assert.equal(achievement.certificate_level, "state");
  assert.equal(achievement.issuing_organization, "state-sports-authority");
  assert.equal("verification_status" in achievement, false);
});

test("State/Taluk/City/District/Country and competition level Other map to their RPC parameters", () => {
  const values = baseValues({ city: "Mysuru Taluk", state: "Karnataka", country: "India" });
  values.sportsInformation.competitionLevel = "other";
  values.sportsInformation.competitionLevelOther = "Inter-club invitational";

  const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");

  assert.equal(args.p_city, "Mysuru Taluk");
  assert.equal(args.p_state, "Karnataka");
  assert.equal(args.p_country, "India");
  assert.equal(args.p_competition_level, "other");
  assert.equal(args.p_competition_level_other, "Inter-club invitational");
});

test("blank optional State and non-Other competition level map to null", () => {
  const values = baseValues({ state: "" });
  values.sportsInformation.competitionLevel = "national";
  values.sportsInformation.competitionLevelOther = "";

  const args = buildSaveRegistrationArgs(values, "draft", "+919876543210");

  assert.equal(args.p_state, null);
  assert.equal(args.p_competition_level_other, null);
});

test("Gold, Silver, and Bronze medal type each map to the RPC's achievement payload", () => {
  for (const medal of ["gold", "silver", "bronze"] as const) {
    const values = baseValues();
    values.achievements = [
      {
        title: "Regional Championship",
        type: "medal",
        typeOther: "",
        organization: "",
        organizationOther: "",
        date: "",
        description: "",
        certificateLevel: "",
        medalType: medal,
        document: null,
        documentPath: null,
      },
    ];

    const args = buildSaveRegistrationArgs(values, "submitted", "+919876543210");
    const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
    assert.equal(achievement.medal_type, medal);
  }
});

test("a stale medal type is cleared once achievement type moves off 'medal'", () => {
  const values = baseValues();
  values.achievements = [
    {
      title: "Participation Certificate",
      type: "participation",
      typeOther: "",
      organization: "",
      organizationOther: "",
      date: "",
      description: "",
      certificateLevel: "",
      // Left over from when this row previously had type = "medal" -- must
      // never be persisted once the athlete picked a different type.
      medalType: "gold",
      document: null,
      documentPath: null,
    },
  ];

  const args = buildSaveRegistrationArgs(values, "draft", "+919876543210");
  const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
  assert.equal(achievement.medal_type, null);
});

test("Other issuing organization/achievement type specify text is sent only when the dropdown is actually 'other'", () => {
  const values = baseValues();
  values.achievements = [
    {
      title: "Community Sports Award",
      type: "other",
      typeOther: "Community Spirit Award",
      organization: "other",
      organizationOther: "Local Panchayat Sports Committee",
      date: "",
      description: "",
      certificateLevel: "",
      medalType: "",
      document: null,
      documentPath: null,
    },
  ];

  const args = buildSaveRegistrationArgs(values, "draft", "+919876543210");
  const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
  assert.equal(achievement.achievement_type_other, "Community Spirit Award");
  assert.equal(achievement.issuing_organization_other, "Local Panchayat Sports Committee");
});

test("a stale Other specify value is cleared once the dropdown moves off 'other'", () => {
  const values = baseValues();
  values.achievements = [
    {
      title: "State Championship",
      type: "medal",
      // Left over from when this row previously had type = "other" -- must
      // never be persisted once the athlete picked a real option instead.
      typeOther: "stale leftover text",
      organization: "state-sports-authority",
      organizationOther: "stale leftover org text",
      date: "",
      description: "",
      certificateLevel: "",
      medalType: "gold",
      document: null,
      documentPath: null,
    },
  ];

  const args = buildSaveRegistrationArgs(values, "draft", "+919876543210");
  const achievement = (args.p_achievements as Record<string, unknown>[] | undefined)?.[0] ?? {};
  assert.equal(achievement.achievement_type_other, null);
  assert.equal(achievement.issuing_organization_other, null);
});
