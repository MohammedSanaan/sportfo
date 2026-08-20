const FEATURES = [
  "Personal details, sports information, and background in one place",
  "Achievements and certificates that showcase your journey",
  "A stable, shareable public profile link, always up to date",
];

export function SportingIdentitySection() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Your Sporting Identity
        </h2>
        <p className="text-base text-ink-500">
          One professional profile that brings together everything about your athletic
          career — built to be shared, not scattered across screenshots and PDFs.
        </p>
      </div>

      <div className="rounded-2xl border border-border-default bg-surface p-7 shadow-sm">
        <ul className="flex flex-col gap-4">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
              >
                ✓
              </span>
              <span className="text-sm text-ink-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
