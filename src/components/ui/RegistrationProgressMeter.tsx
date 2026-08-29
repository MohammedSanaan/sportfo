interface RegistrationProgressMeterProps {
  percent: number;
  message: string;
  percentLabel: string;
  ariaLabel: string;
}

// Purely presentational -- the "how much is filled in" computation is
// form-shape-specific (see RegistrationProgressBar for the typed Athlete
// form, GenericRegistrationProgressBar for the generic hub form), but the
// bar itself is the same UI everywhere. Never a gate on Save Draft/
// Register Now -- those stay governed by each field's own validation.
export function RegistrationProgressMeter({
  percent,
  message,
  percentLabel,
  ariaLabel,
}: RegistrationProgressMeterProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-default bg-surface px-4 py-3.5 sm:px-5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-ink-500">
        <span>{message}</span>
        <span>{percentLabel}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
