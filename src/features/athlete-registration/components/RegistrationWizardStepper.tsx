import { useTranslation } from "@/i18n/LocaleProvider";
import { WIZARD_STEPS } from "../wizard-steps";

interface RegistrationWizardStepperProps {
  activeIndex: number;
  /** Highest index the visitor has already reached -- steps up to and
   * including this one are clickable (jump back to edit, or forward to
   * one already validated); anything beyond it is disabled rather than
   * skippable, so validation is never bypassed by jumping ahead. */
  maxReachedIndex: number;
  onStepClick: (index: number) => void;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Real step-position nav (Section 8 of the production spec: "1 -- 2 -- 3
// -- 4 -- 5" with current/completed/upcoming states) -- replaces the old
// RegistrationStepNav, which was a flat row of anchor pills with no active-
// step concept (every section was always mounted). Desktop shows the full
// circle-and-line stepper with labels; a narrow viewport collapses to a
// compact "Step X of N: Label" line with a thin progress bar underneath,
// per the same section's "don't let the progress bar become overcrowded on
// mobile" requirement.
export function RegistrationWizardStepper({
  activeIndex,
  maxReachedIndex,
  onStepClick,
}: RegistrationWizardStepperProps) {
  const { t } = useTranslation();
  const total = WIZARD_STEPS.length;
  const activeStep = WIZARD_STEPS[activeIndex];

  return (
    <nav aria-label={t("register.wizard.stepIndicator", { current: activeIndex + 1, total })}>
      {/* Mobile: compact indicator + thin progress bar, no per-step circles. */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-ink-500">
          <span>{t("register.wizard.stepIndicator", { current: activeIndex + 1, total })}</span>
          <span className="font-semibold text-ink-800">{t(activeStep.labelKey)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop/tablet: full circle-and-line stepper. */}
      <ol className="hidden items-center sm:flex">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = index < maxReachedIndex;
          const isActive = index === activeIndex;
          const isReachable = index <= maxReachedIndex;
          const isLast = index === total - 1;

          return (
            <li key={step.id} className={isLast ? "flex items-center" : "flex flex-1 items-center"}>
              <button
                type="button"
                onClick={() => isReachable && onStepClick(index)}
                disabled={!isReachable}
                aria-current={isActive ? "step" : undefined}
                className="flex shrink-0 flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors " +
                    (isCompleted
                      ? "border-brand-600 bg-brand-600 text-white"
                      : isActive
                        ? "border-brand-600 bg-white text-brand-700"
                        : isReachable
                          ? "border-border-default bg-white text-ink-500 hover:border-brand-300"
                          : "border-border-default bg-surface-muted text-ink-300")
                  }
                >
                  {isCompleted ? <CheckIcon /> : index + 1}
                </span>
                <span
                  className={
                    "max-w-[6.5rem] text-center text-[11px] font-semibold whitespace-nowrap " +
                    (isActive ? "text-brand-700" : isReachable ? "text-ink-600" : "text-ink-300")
                  }
                >
                  {t(step.labelKey)}
                </span>
              </button>
              {!isLast && (
                <span
                  aria-hidden
                  className={
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors " +
                    (isCompleted ? "bg-brand-600" : "bg-border-default")
                  }
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
