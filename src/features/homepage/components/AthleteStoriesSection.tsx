import Link from "next/link";
import { HoverRevealCards, type CardItem } from "@/components/ui/cards";
import { getAllStories } from "@/lib/stories/data";
import type { TFunc } from "@/i18n/dictionary";

export function AthleteStoriesSection({ t }: { t: TFunc }) {
  // Same story data the /stories listing and /stories/[slug] detail pages
  // read from -- the teaser card, the full listing card, and the detail
  // page it opens all agree on title/category/image because they all come
  // from one place (src/lib/stories/data.ts).
  const stories: CardItem[] = getAllStories().map((story) => ({
    id: story.id,
    title: story.title,
    subtitle: story.category,
    imageUrl: story.coverImage,
    href: `/stories/${story.slug}`,
  }));

  return (
    <section id="stories" className="scroll-mt-16 bg-stitch-gray py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-2xl font-bold text-stitch-navy">
          {t("home.stories.heading")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stitch-text/70">
          {t("home.stories.subheading")}
        </p>

        <div className="mt-8">
          <HoverRevealCards items={stories} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/stories"
            className="inline-flex h-11 items-center justify-center rounded px-6 text-sm font-bold text-stitch-navy transition-colors hover:text-stitch-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-orange focus-visible:ring-offset-2"
          >
            {t("home.stories.viewAll")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
