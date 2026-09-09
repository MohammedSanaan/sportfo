import type { Story } from "@/lib/stories/types";
import type { TFunc } from "@/i18n/dictionary";
import { StoryCard } from "./StoryCard";

export function RelatedStories({ stories, t }: { stories: Story[]; t: TFunc }) {
  if (stories.length === 0) return null;

  return (
    <section className="border-t border-border-default bg-stitch-gray py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-stitch-navy sm:text-3xl">
          {t("storyDetail.relatedHeading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stitch-text/70 sm:text-base">
          {t("storyDetail.relatedSubheading")}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
