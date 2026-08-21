import type { AthleteDraft } from "@/lib/athlete/registration-draft";

// Sample data for the /preview routes only -- never touches Supabase, RLS,
// or auth. Lets the UI be reviewed end-to-end without a real OTP sign-in.
// Remove this file and src/app/preview when preview routes are no longer
// needed.
export function buildMockAthleteDraft(): AthleteDraft {
  const now = "2026-08-01T00:00:00.000Z";
  const profileId = "preview-profile-id";

  return {
    profile: {
      id: profileId,
      user_id: "preview-user-id",
      full_name: "Aditi Sharma",
      date_of_birth: "2006-04-12",
      gender: "female",
      nationality: "Indian",
      country: "India",
      city: "Pune",
      mobile_number: "+91 98765 43210",
      email: "aditi.sharma@example.com",
      school_college: "St. Xavier's College",
      club_academy: "Pune Elite Badminton Academy",
      coach_mentor: "Rohan Deshpande",
      awards_recognition:
        "State-level Badminton Champion (2024, 2025). Selected for the national junior training camp.",
      scholarship_recipient: true,
      profile_status: "submitted",
      is_public: true,
      public_slug: "aditi-sharma",
      created_at: now,
      updated_at: now,
    },
    sport: {
      id: "preview-sport-id",
      athlete_profile_id: profileId,
      primary_sport: "badminton",
      sport_discipline: "Singles",
      position_role: "Forecourt Specialist",
      skill_level: "semi-professional",
      created_at: now,
      updated_at: now,
    },
    achievements: [
      {
        id: "preview-achievement-1",
        athlete_profile_id: profileId,
        title: "State Championship Gold Medal",
        achievement_type: "medal",
        issuing_organization: "Maharashtra State Badminton Association",
        achievement_date: "2025-03-14",
        description: "Won gold in the U19 singles category.",
        document_path: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "preview-achievement-2",
        athlete_profile_id: profileId,
        title: "National Junior Camp Selection",
        achievement_type: "certification",
        issuing_organization: "Badminton Association of India",
        achievement_date: "2025-11-02",
        description: "Selected among 24 athletes nationwide for the junior elite training camp.",
        document_path: null,
        created_at: now,
        updated_at: now,
      },
    ],
  };
}
