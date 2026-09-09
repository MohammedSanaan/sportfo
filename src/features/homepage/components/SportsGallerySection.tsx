import type { TFunc } from "@/i18n/dictionary";
import { SPORTS_GALLERY_ITEMS } from "@/lib/sports-gallery-data";
import { SportsGalleryInteractive } from "./SportsGalleryInteractive";

// Gives the nav's "Sports" link (href="#sports", prepared but inert until
// a matching section id exists -- see Header.tsx) somewhere real to land.
// A 3D drag carousel of the sports SportFo covers, sitting between
// Community and Opportunities same as the other homepage proof sections.
export function SportsGallerySection({ t }: { t: TFunc }) {
  const items = SPORTS_GALLERY_ITEMS.map((item) => ({
    ...item,
    description: t("home.sportsGallery.cardDescription", { sport: item.name }),
  }));

  return (
    <section id="sports" className="scroll-mt-16 bg-white px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.sportsGallery.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
          {t("home.sportsGallery.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.sportsGallery.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-6xl sm:mt-10">
        <SportsGalleryInteractive
          items={items}
          viewAthletesLabel={t("home.sportsGallery.viewAthletes")}
          dragHintLabel={t("home.sportsGallery.dragHint")}
          closeLabel={t("home.sportsGallery.close")}
        />
      </div>
    </section>
  );
}
