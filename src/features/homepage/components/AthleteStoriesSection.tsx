import { HoverRevealCards, type CardItem } from "@/components/ui/cards";
import type { TFunc } from "@/i18n/dictionary";

const STORY_IMAGES = [
  "/images/carousel/cricket.jpg",
  "/images/carousel/athletics.jpg",
  "/images/carousel/tennis.jpg",
  "/images/carousel/swimming.jpg",
] as const;

export function AthleteStoriesSection({ t }: { t: TFunc }) {
  const stories: CardItem[] = [
    {
      id: "story-1",
      title: t("home.stories.story1Title"),
      subtitle: t("home.stories.story1Subtitle"),
      imageUrl: STORY_IMAGES[0],
    },
    {
      id: "story-2",
      title: t("home.stories.story2Title"),
      subtitle: t("home.stories.story2Subtitle"),
      imageUrl: STORY_IMAGES[1],
    },
    {
      id: "story-3",
      title: t("home.stories.story3Title"),
      subtitle: t("home.stories.story3Subtitle"),
      imageUrl: STORY_IMAGES[2],
    },
    {
      id: "story-4",
      title: t("home.stories.story4Title"),
      subtitle: t("home.stories.story4Subtitle"),
      imageUrl: STORY_IMAGES[3],
    },
  ];

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
      </div>
    </section>
  );
}
