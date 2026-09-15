import Link from "next/link";
import type { ProfileStrength } from "@/lib/athlete/profile-strength";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface ProfileStrengthCardProps {
  strength: ProfileStrength;
  locale: Locale;
}

// Real calculateProfileStrength() data only -- the same four checks the
// Dashboard's sidebar card and this page have always used (personal
// details / sports information / at least one achievement / public
// profile enabled). The redesign's reference screenshot shows a different
// checklist (including "upload your profile photo"), but changing what
// counts toward the score is a product decision outside a UI-only task --
// see the final report's "mismatch" note. Nothing here invents a new item
// or a fabricated percentage.
export function ProfileStrengthCard({ strength, locale }: ProfileStrengthCardProps) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const completeCount = strength.items.filter((item) => item.complete).length;
  const isComplete = strength.percentage >= 100;

  return (
    <section className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2 border-b border-border-default pb-4">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden>
            <path d="M3 16.5V11M8 16.5V6M13 16.5V9M18 16.5V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="text-base font-bold text-ink-900 sm:text-lg">{t("profile.strength.title")}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-ink-900">{strength.percentage}%</span>
          <span className="text-sm font-medium text-ink-500">
            {t("profile.strength.complete", { complete: completeCount, total: strength.items.length })}
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={strength.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("profile.strength.title")}
          className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-rose-500 transition-all duration-300"
            style={{ width: `${strength.percentage}%` }}
          />
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {strength.items.map((item) => {
            const marker = (
              <span
                aria-hidden
                className={
                  item.complete
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-xs font-bold text-success-500"
                    : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-default text-xs text-ink-400"
                }
              >
                {item.complete ? "✓" : ""}
              </span>
            );

            if (item.complete) {
              return (
                <li key={item.label} className="flex items-center gap-2.5 text-sm">
                  {marker}
                  <span className="text-ink-700">{item.label}</span>
                </li>
              );
            }

            return (
              <li key={item.label} className="text-sm">
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {marker}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {!isComplete && (
          <div className="flex justify-end">
            <Link
              href="/athlete/register"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              {t("profile.strength.completeProfileCta")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
