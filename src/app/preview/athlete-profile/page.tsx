import type { Metadata } from "next";
import { buildMockAthleteDraft } from "@/lib/dev/mock-athlete-draft";
import { AthleteProfileView } from "@/features/athlete-profile/components/AthleteProfileView";
import { PreviewBanner } from "../PreviewBanner";

export const metadata: Metadata = {
  title: "Preview: Athlete Profile | SportFo",
};

// Dev-only: renders the real profile UI against sample data instead of a
// live Supabase session, so the page can be reviewed without an OTP
// sign-in. No auth/RLS involved -- see src/lib/dev/mock-athlete-draft.ts.
export default function AthleteProfilePreviewPage() {
  const draft = buildMockAthleteDraft();
  return (
    <>
      <PreviewBanner label="Athlete Profile (sample data, not a real account)" />
      <AthleteProfileView draft={draft} isOwner />
    </>
  );
}
