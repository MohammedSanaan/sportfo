import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import { ProfileHeader } from "./ProfileHeader";
import { KeyInformationSection } from "./KeyInformationSection";
import { SportsInformationSection } from "./SportsInformationSection";
import { AchievementsSection } from "./AchievementsSection";
import { RecognitionSection } from "./RecognitionSection";
import { ProfileStatusSection } from "./ProfileStatusSection";

interface AthleteProfileViewProps {
  draft: AthleteDraft;
  isOwner: boolean;
}

export function AthleteProfileView({ draft, isOwner }: AthleteProfileViewProps) {
  const { profile, sport, achievements } = draft;
  const hasRecognition = Boolean(
    profile.awards_recognition || profile.scholarship_recipient !== null,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <ProfileHeader draft={draft} isOwner={isOwner} />
      <KeyInformationSection profile={profile} />
      <SportsInformationSection sport={sport} />
      <AchievementsSection achievements={achievements} />
      {hasRecognition && <RecognitionSection profile={profile} />}
      <ProfileStatusSection draft={draft} isOwner={isOwner} />
    </div>
  );
}
