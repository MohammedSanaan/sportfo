import type { Metadata } from "next";
import { buildMockAthleteDraft } from "@/lib/dev/mock-athlete-draft";
import { mapDraftToFormValues } from "@/lib/athlete/registration-draft";
import { AthleteRegistrationForm } from "@/features/athlete-registration/components/AthleteRegistrationForm";
import { PreviewBanner } from "../PreviewBanner";

export const metadata: Metadata = {
  title: "Preview: Athlete Registration | SportFo",
};

// Dev-only: same registration form the real /athlete/register route uses,
// pre-filled with sample data. There's no real Supabase session here, so
// Save Draft / Create Profile will show a "session expired" banner instead
// of persisting -- this route is for reviewing layout/UX, not for testing
// the save flow (use the real flow, logged in, for that).
export default function AthleteRegistrationPreviewPage() {
  const draft = buildMockAthleteDraft();
  const authPhone = draft.profile.mobile_number ?? "";

  return (
    <>
      <PreviewBanner label="Athlete Registration form (Save/Submit won't persist)" />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Create Your Athlete Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-500">
            Build your professional sports profile and showcase your talent,
            experience and achievements.
          </p>
        </div>
        <AthleteRegistrationForm
          authPhone={authPhone}
          initialValues={mapDraftToFormValues(draft, authPhone)}
        />
      </div>
    </>
  );
}
