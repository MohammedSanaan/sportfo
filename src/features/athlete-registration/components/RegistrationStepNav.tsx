const STEPS = [
  { href: "#section-personal", label: "Personal" },
  { href: "#section-sport", label: "Sport" },
  { href: "#section-achievements", label: "Achievements" },
  { href: "#section-review", label: "Review" },
];

// Purely a visual jump-to-section aid -- plain anchor links, no active-step
// tracking, no gating of which sections render. All sections are always
// mounted and always editable; this never touches the form's persistence
// flow (Save Draft / Create Athlete Profile work exactly as before
// regardless of scroll position).
export function RegistrationStepNav() {
  return (
    <nav aria-label="Registration sections" className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, index) => (
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
