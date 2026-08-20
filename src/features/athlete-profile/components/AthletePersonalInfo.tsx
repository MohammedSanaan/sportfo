import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, GENDER_OPTIONS } from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
import type { AthleteProfileRow } from "@/types/database";
import { DetailField } from "./DetailField";

interface AthletePersonalInfoProps {
  profile: AthleteProfileRow;
}

export function AthletePersonalInfo({ profile }: AthletePersonalInfoProps) {
  return (
    <SectionCard title="Personal Information">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField label="Full Name" value={profile.full_name ?? ""} />
        <DetailField
          label="Date of Birth"
          value={formatDisplayDate(profile.date_of_birth)}
        />
        <DetailField
          label="Gender"
          value={getOptionLabel(GENDER_OPTIONS, profile.gender)}
        />
        <DetailField label="Nationality" value={profile.nationality ?? ""} />
        <DetailField label="Country" value={profile.country ?? ""} />
        <DetailField label="City" value={profile.city ?? ""} />
        <DetailField label="Mobile Number" value={profile.mobile_number ?? ""} />
        <DetailField label="Email Address" value={profile.email ?? ""} />
      </div>
    </SectionCard>
  );
}
