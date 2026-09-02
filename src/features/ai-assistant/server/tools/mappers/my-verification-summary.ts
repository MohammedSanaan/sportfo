// Pure mapper -- see my-identity.ts's header comment for why this lives in
// its own file, separate from ../get-my-verification-summary.ts's
// `execute()`.
import type { AthleteDraft } from "@/lib/athlete/registration-draft";
import { countByVerificationStatus, type AchievementStatusCounts } from "../achievement-counts.ts";

export type MyVerificationSummaryResult = AchievementStatusCounts;

// Shares countByVerificationStatus with my-achievements.ts's mapper so the
// two tools can never disagree on a count. Deliberately no per-achievement
// detail and no moderation notes.
export function toMyVerificationSummaryResult(draft: AthleteDraft | null): MyVerificationSummaryResult {
  return countByVerificationStatus(draft?.achievements ?? []);
}
