import Image from "next/image";
import Link from "next/link";
import type { TFunc } from "@/i18n/dictionary";

// Premium 2-column layout: copy left, a single framed local sports photo
// right (no hotlinked/external image -- see the integration report for
// the licensing note on this asset set). Same eyebrow pill, navy/orange
// tokens, and rounded-lg/shadow card language as the rest of this
// homepage rather than a new design system.
export function AboutSportFoSection({ t }: { t: TFunc }) {
  return (
    <section id="about" className="scroll-mt-16 bg-white px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
            {t("home.about.eyebrow")}
          </span>

          <h2 className="mt-5 text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl lg:text-5xl">
            {t("home.about.title")}
          </h2>

          <div className="mt-6 flex flex-col gap-4">
            <p className="text-lg leading-relaxed font-semibold text-stitch-navy">
              {t("home.about.intro")}
            </p>
            <p className="text-base leading-relaxed text-gray-600">{t("home.about.description")}</p>
            <p className="text-base leading-relaxed text-gray-600">{t("home.about.challenge")}</p>
            <p className="text-base leading-relaxed font-semibold text-stitch-blue">
              {t("home.about.change")}
            </p>
            <p className="text-base leading-relaxed font-semibold text-stitch-navy italic">
              {t("home.about.exists")}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="#sports"
              className="inline-flex h-13 w-full items-center justify-center rounded border border-stitch-navy px-8 text-base font-bold text-stitch-navy transition-colors duration-300 hover:bg-stitch-navy hover:text-white sm:w-auto"
            >
              {t("home.about.exploreSports")}
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-13 w-full items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover sm:w-auto"
            >
              {t("home.about.joinSportfo")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] lg:max-w-none">
          <Image
            src="/images/carousel/basketball.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
