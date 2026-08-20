import { SectionCard } from "@/components/ui/SectionCard";
import type { AthleteProfileRow } from "@/types/database";
import { ageFromDateOfBirth, formatDate, genderLabel } from "@/lib/athlete/profile-display";
import { InfoGrid } from "./InfoGrid";

interface KeyInformationSectionProps {
  profile: AthleteProfileRow;
}

export function KeyInformationSection({ profile }: KeyInformationSectionProps) {
  const age = ageFromDateOfBirth(profile.date_of_birth);
  const dob = formatDate(profile.date_of_birth);

  return (
    <SectionCard title="Key Information">
      <InfoGrid
        items={[
          { label: "Date of Birth", value: dob && age !== null ? `${dob} (Age ${age})` : dob },
          { label: "Gender", value: genderLabel(profile.gender) },
          { label: "Nationality", value: profile.nationality },
          { label: "School / College", value: profile.school_college },
          { label: "Club / Academy", value: profile.club_academy },
          { label: "Coach / Mentor", value: profile.coach_mentor },
          { label: "Email", value: profile.email },
          { label: "Mobile Number", value: profile.mobile_number },
        ]}
      />
    </SectionCard>
  );
}
