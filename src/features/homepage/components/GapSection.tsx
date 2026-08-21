import type { TFunc } from "@/i18n/dictionary";

// The problem statement, positioned right after "Who We Serve" and before
// the existing solution/process section -- deliberately no stats or claimed
// outcomes here, just the gap SportFo is designed to close. Reuses the same
// card radius/shadow/type scale as WhoWeServeSection's role cards and
// EcosystemHero's headline rhythm rather than introducing new values.
export function GapSection({ t }: { t: TFunc }) {
  const cards = [
    { title: t("home.gap.card1Title"), body: t("home.gap.card1Body") },
    { title: t("home.gap.card2Title"), body: t("home.gap.card2Body") },
    { title: t("home.gap.card3Title"), body: t("home.gap.card3Body") },
  ];

  return (
    <section className="bg-stitch-gray px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.gap.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-3xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl lg:text-6xl">
          {t("home.gap.title")}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left md:grid-cols-3 md:gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="stitch-card-lift flex h-full flex-col rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover sm:p-8"
            >
              <h3 className="text-lg font-bold text-stitch-navy">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
