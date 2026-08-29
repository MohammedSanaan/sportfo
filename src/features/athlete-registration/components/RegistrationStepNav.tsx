import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

// Purely a visual jump-to-section aid -- plain anchor links, no active-step
// tracking, no gating of which sections render. All sections are always
// mounted and always editable; this never touches the form's persistence
// flow (Save Draft / Create Athlete Profile work exactly as before
// regardless of scroll position).
export function RegistrationStepNav({ locale }: { locale: Locale }) {
  const steps = [
    { href: "#section-personal", label: translate(locale, "register.stepPersonal") },
    { href: "#section-sport", label: translate(locale, "register.stepSport") },
    { href: "#section-achievements", label: translate(locale, "register.stepAchievements") },
    { href: "#section-employment", label: translate(locale, "register.stepEmployment") },
    { href: "#section-apparel", label: translate(locale, "register.stepApparel") },
    { href: "#section-profile", label: translate(locale, "register.stepProfile") },
    { href: "#section-verify", label: translate(locale, "register.stepVerify") },
  ];

  return (
    <nav aria-label="Registration sections" className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <a
          key={step.href}
          href={step.href}
          className="flex items-center gap-2 rounded-full border border-border-default bg-surface px-3.5 py-2 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-ink-500">
            {index + 1}
          </span>
          {step.label}
        </a>
      ))}
    </nav>
  );
}
