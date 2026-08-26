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

const PROMISE_CARD_CLASS =
  "stitch-card-lift flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 border-t-4 border-t-stitch-blue bg-white px-6 py-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-navy";

// Promise copy is authored as a single comma-joined sentence per locale;
// split on the first comma so it renders as two clean lines inside the
// card instead of one long wrapping run.
function renderPromiseLines(text: string) {
  const commaIndex = text.indexOf(",");
  if (commaIndex === -1) return <span>{text}</span>;

  const first = text.slice(0, commaIndex);
  const second = text.slice(commaIndex + 1).trim();

  return (
    <>
      <span className="block">{first}</span>
      <span className="block">{second}</span>
    </>
  );
}

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

        <div className="mx-auto mt-14 max-w-2xl text-center">
          <p className="text-xl leading-snug font-medium text-balance text-gray-600 sm:text-2xl">
            {t("home.bridge.line1")}
            <br />
            {t("home.bridge.line2")}
          </p>
          <p className="mt-3 text-2xl leading-snug font-bold text-balance text-stitch-navy sm:text-3xl">
            <span className="text-stitch-orange">{t("home.bridge.line3")}</span>
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 pt-2 sm:grid-cols-3 sm:gap-8">
          <div className={PROMISE_CARD_CLASS}>
            <p className="text-sm leading-relaxed font-medium text-gray-700 sm:text-base">
              {renderPromiseLines(t("home.promise.find"))}
            </p>
          </div>
          <div className={PROMISE_CARD_CLASS}>
            <p className="text-sm leading-relaxed font-medium text-gray-700 sm:text-base">
              {renderPromiseLines(t("home.promise.support"))}
            </p>
          </div>
          <div className={PROMISE_CARD_CLASS}>
            <p className="text-sm leading-relaxed font-medium text-gray-700 sm:text-base">
              {renderPromiseLines(t("home.promise.reward"))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
