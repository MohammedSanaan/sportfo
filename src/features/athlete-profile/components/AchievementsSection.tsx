"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import type { AthleteAchievementRow } from "@/types/database";
import { achievementTypeLabel, formatDate } from "@/lib/athlete/profile-display";
import { getAchievementDocumentSignedUrl } from "@/features/athlete-registration/actions";

interface AchievementsSectionProps {
  achievements: AthleteAchievementRow[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <SectionCard
      title="Achievements & Certificates"
      description={achievements.length > 0 ? undefined : "No achievements added yet."}
    >
      {achievements.length === 0 ? (
        <p className="text-sm text-ink-400">
          Achievements, medals, and certifications will appear here once added.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function AchievementCard({ achievement }: { achievement: AthleteAchievementRow }) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleViewDocument() {
    setIsOpening(true);
    setError(null);
    const result = await getAchievementDocumentSignedUrl(achievement.id);
    setIsOpening(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  const type = achievementTypeLabel(achievement.achievement_type);
  const date = formatDate(achievement.achievement_date);

  return (
    <div className="rounded-lg border border-border-default p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">
            {achievement.title || "Untitled achievement"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            {type && <Badge variant="neutral">{type}</Badge>}
            {achievement.issuing_organization && <span>{achievement.issuing_organization}</span>}
            {date && <span>{date}</span>}
          </div>
        </div>

        {achievement.document_path && (
          <button
            type="button"
            onClick={handleViewDocument}
            disabled={isOpening}
            className="shrink-0 text-sm font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOpening ? "Opening..." : "View document"}
          </button>
        )}
      </div>

      {achievement.description && (
        <p className="mt-2 text-sm text-ink-600">{achievement.description}</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
