// Pure mapper -- see my-identity.ts's header comment for why this lives in
// its own file, separate from ../get-my-achievements.ts's `execute()`.
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import { countByVerificationStatus } from "../achievement-counts.ts";

export interface MyAchievementSummary {
  title: string | null;
  type: string | null;
  date: string | null;
  verificationStatus: string;
}

export interface MyAchievementsResult {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  achievements: MyAchievementSummary[];
}

// title/type/date/status only, per achievement. Never document_path (a
// private storage path -- see task spec: "Do not include raw private
// storage paths. If certificates require signed URLs: DO NOT expose them
// through AI Phase 1"), never the database row id, never certificate/
// medal detail the task didn't ask this phase to surface. See
// my-achievements.test.ts.
export function toMyAchievementsResult(draft: AthleteDraft | null): MyAchievementsResult {
  const achievements = draft?.achievements ?? [];
  const counts = countByVerificationStatus(achievements);

  return {
    ...counts,
    achievements: achievements.map((achievement) => ({
      title: achievement.title,
      type: achievement.achievement_type,
      date: achievement.achievement_date,
      verificationStatus: achievement.verification_status,
    })),
  };
}
