import type { AthleteAchievementRow } from "@/types/database";

export interface AchievementStatusCounts {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

// Single source of truth for achievement-by-status counting -- shared by
// getMyAchievements and getMyVerificationSummary so the two tools can
// never silently disagree on what "verified"/"pending"/"rejected" means.
export function countByVerificationStatus(
  achievements: Pick<AthleteAchievementRow, "verification_status">[],
): AchievementStatusCounts {
  return {
    total: achievements.length,
    verified: achievements.filter((a) => a.verification_status === "verified").length,
    pending: achievements.filter((a) => a.verification_status === "pending").length,
    rejected: achievements.filter((a) => a.verification_status === "rejected").length,
  };
}
