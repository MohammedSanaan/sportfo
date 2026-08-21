import type { TFunc } from "@/i18n/dictionary";

export function StatsSection({ t }: { t: TFunc }) {
  const stats = [
    { value: "50K+", label: t("home.stats.childrenCoached") },
    { value: "120+", label: t("home.stats.tournamentsOrganized") },
    { value: "96%", label: t("home.stats.parentSatisfaction") },
    { value: "14", label: t("home.stats.citiesAcrossIndia") },
  ];

  return (
    <section className="border-y border-gray-300 bg-gray-200 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-gray-300 px-4 text-center sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="px-2 py-4">
            <div className="text-3xl font-bold text-stitch-navy md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm font-semibold text-gray-700 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
