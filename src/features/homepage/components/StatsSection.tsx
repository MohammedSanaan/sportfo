const STATS = [
  { value: "50K+", label: "Children Coached" },
  { value: "120+", label: "Tournaments Organized" },
  { value: "96%", label: "Parent Satisfaction" },
  { value: "14", label: "Cities Across India" },
] as const;

export function StatsSection() {
  return (
    <section className="border-y border-gray-300 bg-gray-200 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-gray-300 px-4 text-center sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-2 py-4">
            <div className="text-3xl font-bold text-stitch-navy md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm font-semibold text-gray-700 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
