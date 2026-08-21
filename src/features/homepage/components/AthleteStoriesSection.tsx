import Image from "next/image";

const STORIES = [
  {
    title: "From Gully Cricket to State Trials",
    image: { src: "/images/carousel/football.jpg", alt: "" },
    rating: true,
  },
  {
    title: "Two Setbacks, No Comeback",
    image: { src: "/images/carousel/tennis.jpg", alt: "" },
    rating: true,
  },
  {
    title:
      "“My daughter was too shy, join a team, Six months later, she's leading warm-ups.”",
    image: { src: "/images/profile-banner-track.jpg", alt: "" },
    rating: false,
  },
] as const;

export function AthleteStoriesSection() {
  return (
    <section className="bg-stitch-gray py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold text-stitch-navy">
          Inspiring Athlete Stories
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STORIES.map((story) => (
            <div
              key={story.title}
              className="relative h-64 overflow-hidden rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
              <Image
                src={story.image.src}
                alt={story.image.alt}
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
