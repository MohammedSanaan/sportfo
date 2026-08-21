import { SectionCard } from "@/components/ui/SectionCard";
import type { ProfileStrength } from "@/lib/athlete/profile-strength";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface ProfileStrengthCardProps {
  strength: ProfileStrength;
  locale: Locale;
}

export function ProfileStrengthCard({ strength, locale }: ProfileStrengthCardProps) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const completeCount = strength.items.filter((item) => item.complete).length;

  return (
    <SectionCard title={t("profile.strength.title")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-ink-900">{strength.percentage}%</span>
          <span className="text-sm text-ink-500">
            {t("profile.strength.complete", { complete: completeCount, total: strength.items.length })}
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={strength.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("profile.strength.title")}
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
