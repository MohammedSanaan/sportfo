import Image from "next/image";
import type { TFunc } from "@/i18n/dictionary";

const STORY_IMAGES = [
  "/images/carousel/football.jpg",
  "/images/carousel/tennis.jpg",
  "/images/profile-banner-track.jpg",
] as const;

export function AthleteStoriesSection({ t }: { t: TFunc }) {
  const stories = [
    { title: t("home.stories.story1Title"), rating: true },
    { title: t("home.stories.story2Title"), rating: true },
    { title: t("home.stories.story3Quote"), rating: false },
  ];

  return (
    <section id="stories" className="scroll-mt-16 bg-stitch-gray py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold text-stitch-navy">
          {t("home.stories.heading")}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map((story, i) => (
            <div
              key={story.title}
              className="relative h-64 overflow-hidden rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
              <Image
                src={STORY_IMAGES[i]}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
              <div className="stitch-story-scrim absolute inset-0" />
              <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                <h3
                  className={
                    story.rating
                      ? "mb-1 text-lg font-bold text-white"
                      : "mb-1 text-sm font-bold text-white"
                  }
                >
                  {story.title}
                </h3>
                {story.rating ? (
                  <div className="flex justify-center text-sm text-stitch-orange" aria-label="5 out of 5 stars">
                    ★★★★★
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
