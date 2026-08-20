const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Add your personal, sports, and background information in minutes.",
  },
  {
    number: "02",
    title: "Showcase Your Journey",
    description: "Add achievements and certificates that define your athletic career.",
  },
  {
    number: "03",
    title: "Get Discovered",
    description: "Share a public profile link and be found by anyone looking for talent.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          How SportFo Works
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface p-7"
          >
            <span className="text-3xl font-bold text-brand-200">{step.number}</span>
            <h3 className="text-lg font-semibold text-ink-900">{step.title}</h3>
            <p className="text-sm text-ink-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
