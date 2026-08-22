import type { TFunc } from "@/i18n/dictionary";

// Vision's translated copy embeds the two phrases to emphasize using a
// [[...]] marker (each locale wraps its own equivalent phrase, in its own
// word order, around the same marker) rather than hardcoding English
// phrase-matching -- this is the only way to keep a single `description`
// key per the i18n spec while still highlighting locale-appropriate text.
function renderHighlighted(text: string) {
  const parts = text.split(/\[\[(.+?)\]\]/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-stitch-orange">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

const CARD_CLASS =
  "stitch-card-lift flex h-full flex-col rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover sm:p-8";

export function VisionMissionSection({ t }: { t: TFunc }) {
  return (
    <section className="bg-stitch-gray px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 md:gap-8">
          <div className={CARD_CLASS}>
            <span className="text-xs font-semibold tracking-[0.14em] text-stitch-blue uppercase">
              {t("home.vision.title")}
            </span>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              {renderHighlighted(t("home.vision.description"))}
            </p>
          </div>

          <div className={CARD_CLASS}>
            <span className="text-xs font-semibold tracking-[0.14em] text-stitch-blue uppercase">
              {t("home.mission.title")}
            </span>
            <p className="mt-4 text-base leading-relaxed text-gray-700">
              {t("home.mission.description")}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-xl leading-snug font-medium text-gray-600 sm:text-2xl">
            {t("home.bridge.line1")}
            <br />
            {t("home.bridge.line2")}
          </p>
          <p className="mt-3 text-2xl leading-snug font-bold text-stitch-navy sm:text-3xl">
            <span className="text-stitch-orange">{t("home.bridge.line3")}</span>
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-x-8 gap-y-4 border-t border-gray-300 pt-8 text-center sm:grid-cols-3">
          <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
            {t("home.promise.find")}
          </p>
          <p className="text-sm leading-relaxed text-gray-700 sm:text-base sm:border-x sm:border-gray-300 sm:px-6">
            {t("home.promise.support")}
          </p>
          <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
            {t("home.promise.reward")}
          </p>
        </div>
      </div>
    </section>
  );
}
