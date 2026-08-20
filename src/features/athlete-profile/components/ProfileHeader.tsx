import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import {
  initials,
  locationLine,
  skillLevelLabel,
  sportLabel,
} from "@/lib/athlete/profile-display";

interface ProfileHeaderProps {
  draft: AthleteDraft;
  isOwner: boolean;
}

export function ProfileHeader({ draft, isOwner }: ProfileHeaderProps) {
  const { profile, sport } = draft;
  const location = locationLine(profile.city, profile.country);
  const sport_ = sportLabel(sport?.primary_sport ?? null);
  const tagline = [sport_, sport?.position_role].filter(Boolean).join(" · ");

  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-sm">
      <div className="h-20 bg-gradient-to-r from-brand-600 to-brand-800 sm:h-24" />
      <div className="flex flex-col gap-4 px-4 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
        <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-brand-100 text-2xl font-bold text-brand-700 sm:-mt-12 sm:h-24 sm:w-24">
          {initials(profile.full_name)}
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {profile.full_name || "Unnamed Athlete"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
              {tagline && <span>{tagline}</span>}
              {tagline && location && <span aria-hidden>•</span>}
              {location && <span>{location}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={profile.profile_status === "submitted" ? "success" : "warning"}>
                {profile.profile_status === "submitted" ? "Profile Submitted" : "Draft"}
              </Badge>
              {sport?.skill_level && (
                <Badge variant="brand">{skillLevelLabel(sport.skill_level)}</Badge>
              )}
            </div>
          </div>

          {isOwner && (
            <Link href="/athlete/register" className="sm:shrink-0">
              <Button variant="secondary">Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
