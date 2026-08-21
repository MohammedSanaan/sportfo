import { SectionCard } from "@/components/ui/SectionCard";
import type { ProfileStrengthChecklist } from "@/lib/athlete/profile-strength";

interface ProfileStrengthCardProps {
  strength: ProfileStrengthChecklist;
}

export function ProfileStrengthCard({ strength }: ProfileStrengthCardProps) {
  const completeCount = strength.items.filter((item) => item.complete).length;

  return (
    <SectionCard title="Profile Strength">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-ink-900">{strength.percentage}%</span>
          <span className="text-sm text-ink-500">
            {completeCount} of {strength.items.length} complete
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={strength.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile strength"
          className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${strength.percentage}%` }}
          />
        </div>

        <ul className="flex flex-col gap-2">
          {strength.items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className={
                  item.complete
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-xs font-bold text-success-500"
                    : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-ink-400"
                }
              >
                {item.complete ? "✓" : "–"}
              </span>
              <span className={item.complete ? "text-ink-700" : "text-ink-400"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
