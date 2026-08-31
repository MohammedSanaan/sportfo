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
    <section className="rounded-2xl border border-white/10 bg-[#0d1430] p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-2 border-b border-white/[0.08] pb-4">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4d7cff]/15 text-[#7ea3ff]">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden>
            <path d="M3 16.5V11M8 16.5V6M13 16.5V9M18 16.5V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="text-base font-bold text-[#e8ecf8] sm:text-lg">{t("profile.strength.title")}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-[#e8ecf8]">{strength.percentage}%</span>
          <span className="text-sm font-medium text-[#8b96b8]">
            {t("profile.strength.complete", { complete: completeCount, total: strength.items.length })}
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={strength.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("profile.strength.title")}
          className="h-2.5 w-full overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4d7cff] to-[#ff2f6d] transition-all duration-300"
            style={{ width: `${strength.percentage}%` }}
          />
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {strength.items.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden
                className={
                  item.complete
                    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300"
                    : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-[#5c6a99]"
                }
              >
                {item.complete ? "✓" : ""}
              </span>
              <span className={item.complete ? "text-[#cddaff]" : "text-[#8b96b8]"}>{item.label}</span>
            </li>
          ))}
        </ul>

        {!isComplete && (
          <div className="flex justify-end">
            <Link
              href="/athlete/register"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#4d7cff] px-5 text-sm font-bold text-white transition-colors hover:bg-[#6a92ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430] sm:w-auto"
            >
              {t("profile.strength.completeProfileCta")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
