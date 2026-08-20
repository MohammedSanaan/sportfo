import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import type { AthleteProfileRow } from "@/types/database";

interface RecognitionSectionProps {
  profile: AthleteProfileRow;
}

// Only rendered by the parent when there's something to show -- awards
// text and/or a known scholarship answer -- per "scholarship information
// where applicable."
export function RecognitionSection({ profile }: RecognitionSectionProps) {
  return (
    <SectionCard title="Recognition">
      <div className="flex flex-col gap-4">
        {profile.awards_recognition && (
          <p className="text-sm text-ink-700">{profile.awards_recognition}</p>
        )}
        {profile.scholarship_recipient !== null && (
          <Badge variant={profile.scholarship_recipient ? "success" : "neutral"}>
            {profile.scholarship_recipient ? "Scholarship Recipient" : "Not a Scholarship Recipient"}
          </Badge>
        )}
      </div>
    </SectionCard>
  );
}
