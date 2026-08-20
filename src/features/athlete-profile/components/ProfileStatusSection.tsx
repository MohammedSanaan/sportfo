import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import { computeProfileStrength } from "@/lib/athlete/profile-strength";

interface ProfileStatusSectionProps {
  draft: AthleteDraft;
  isOwner: boolean;
}

export function ProfileStatusSection({ draft, isOwner }: ProfileStatusSectionProps) {
  const submitted = draft.profile.profile_status === "submitted";
  const strength = computeProfileStrength(draft);

  return (
    <SectionCard title="Profile Status">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-ink-600">
            {submitted
              ? "This profile has been submitted through SportFo's registration process."
              : "This profile is still a draft and hasn't been submitted yet."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={submitted ? "success" : "warning"}>
              {submitted ? "Submitted" : "Draft"}
            </Badge>
            {/* No admin/manual verification workflow exists in the schema yet --
                this reflects registration status only, not a reviewed "verified" badge. */}
          </div>
        </div>

        {isOwner && (
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink-800">Profile Strength</span>
              <span className="text-ink-500">
                {strength.label} · {strength.percent}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width]"
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">
              {strength.filled} of {strength.total} profile details completed.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
