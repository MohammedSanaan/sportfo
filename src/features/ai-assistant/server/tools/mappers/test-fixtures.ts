// Shared fixture builders for the mapper tests in this directory. Every
// field an AthleteProfileRow/AthleteSportRow/AthleteAchievementRow
// actually requires is filled in with a plausible, deliberately
// sensitive-looking value (a fake Aadhaar number, a fake private storage
// path, ...) so a test asserting "never exposed" is asserting against a
// fixture that actually HAS the sensitive data to leak, not one that
// merely lacks it. Types are imported `import type` only, so this file
// (like every *.ts it's imported from here) has zero runtime imports and
// loads cleanly under `node --test`.
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import type { AthleteAchievementRow, AthleteProfileRow, AthleteSportRow } from "@/types/database";

export function buildProfileFixture(overrides: Partial<AthleteProfileRow> = {}): AthleteProfileRow {
  return {
    aadhaar_or_govt_id: "1234-5678-9999",
    awards_recognition: null,
    city: "Bengaluru",
    club_academy: "SportFo Academy",
    coach_mentor: "Coach Rao",
    country: "India",
    created_at: "2026-01-01T00:00:00.000Z",
    date_of_birth: "2000-01-01",
    email: "athlete@example.com",
    emergency_contact: "+911234567890",
    employment_type: null,
    facebook_url: null,
    full_name: "Test Athlete",
    gender: "male",
    id: "profile-row-id",
    instagram_url: null,
    is_public: true,
    job_title: null,
    mobile_number: "+911234567890",
    nationality: "Indian",
    organization: null,
    other_url: null,
    preferred_language: "en",
    profile_photo_path: "private/photos/secret-photo.jpg",
    profile_status: "submitted",
    public_slug: "test-athlete",
    scholarship_recipient: null,
    school_college: null,
    shoe_size: null,
    short_bio: null,
    shorts_size: null,
    state: "Karnataka",
    track_suit_size: null,
    tshirt_size: null,
    updated_at: "2026-01-01T00:00:00.000Z",
    user_id: "11111111-1111-1111-1111-111111111111",
    years_experience: null,
    ...overrides,
  };
}

export function buildSportFixture(overrides: Partial<AthleteSportRow> = {}): AthleteSportRow {
  return {
    athlete_profile_id: "profile-row-id",
    competition_level: "district",
    competition_level_other: null,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "sport-row-id",
    position_role: null,
    primary_sport: "Cricket",
    secondary_sports: ["Badminton"],
    skill_level: "intermediate",
    sport_category: "Team Sports",
    sport_discipline: "Batting",
    support_needed: [],
    support_needed_other: null,
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function buildAchievementFixture(overrides: Partial<AthleteAchievementRow> = {}): AthleteAchievementRow {
  return {
    achievement_date: "2025-01-01",
    achievement_type: "medal",
    achievement_type_other: null,
    athlete_profile_id: "profile-row-id",
    certificate_level: null,
    created_at: "2026-01-01T00:00:00.000Z",
    description: null,
    document_path: "private/certificates/secret-certificate.pdf",
    id: "achievement-row-id",
    issuing_organization: "State Sports Federation",
    issuing_organization_other: null,
    medal_type: "gold",
    title: "State Championship",
    updated_at: "2026-01-01T00:00:00.000Z",
    verification_status: "verified",
    ...overrides,
  };
}

export function buildDraftFixture(overrides: Partial<AthleteDraft> = {}): AthleteDraft {
  return {
    profile: buildProfileFixture(),
    sport: buildSportFixture(),
    achievements: [buildAchievementFixture()],
    ...overrides,
  };
}
