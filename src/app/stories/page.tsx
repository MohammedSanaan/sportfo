import type { Metadata } from "next";
import { lexend } from "@/features/homepage/lexend";
import { getAllStories } from "@/lib/stories/data";
import { StoryCard } from "@/features/stories/components/StoryCard";
import { getServerTranslations } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Stories | SportFo",
  description:
    "Real journeys, honest struggles, and the everyday discipline behind India's grassroots sport, told by SportFo.",
};

// Dedicated listing route (distinct from the homepage's #stories teaser
// section) -- the canonical place every story card and every story's
// "Back to Stories" link points to, so it survives being opened directly,
// shared, refreshed, or reached from a search engine.
export default async function StoriesPage() {
  const { t } = await getServerTranslations();
  const stories = getAllStories();

  return (
    <div className={`${lexend.variable} flex flex-1 flex-col bg-white font-stitch text-stitch-text`}>
      <section className="bg-stitch-navy px-4 py-14 text-center sm:py-16">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/30 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-white/90 uppercase">
          {t("storiesPage.eyebrow")}
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-white sm:text-4xl md:text-5xl">
          {t("storiesPage.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          {t("storiesPage.subtitle")}
        </p>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {stories.map((story, index) => (
            <StoryCard key={story.id} story={story} t={t} priority={index === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}
