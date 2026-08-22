import Image from "next/image";
import Link from "next/link";
import type { TFunc } from "@/i18n/dictionary";

// Background is licensed local stock (see src/features/landing/components/
// Hero.tsx's carousel credit comment for the source/license of this set),
// not the temporary Stitch/googleusercontent preview image -- see the
// integration report for why.
export function EcosystemHero({ t }: { t: TFunc }) {
  return (
    <section className="relative flex min-h-[520px] w-full flex-col items-center justify-between overflow-hidden bg-stitch-navy px-4 py-16 sm:min-h-[600px] sm:py-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-track.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-80"
        />
        <div className="stitch-hero-scrim absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-2 text-center">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase drop-shadow-md sm:text-sm">
          {t("home.hero.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold whitespace-pre-line text-white drop-shadow-md sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
          {t("home.hero.title")}
        </h1>
        <h2 className="mt-3 text-lg leading-snug font-semibold text-white drop-shadow-md sm:mt-4 sm:text-xl md:text-2xl">
          {t("home.hero.secondaryTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-white drop-shadow-md sm:mt-6 sm:text-lg">
          {t("home.hero.description")}
        </p>
      </div>

      <div className="relative z-10 mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:mt-12 sm:w-auto sm:flex-row sm:gap-4">
        <Link
          href="#community"
          className="inline-flex h-13 w-full items-center justify-center rounded border border-white/50 px-8 text-base font-bold text-white transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-navy sm:w-auto"
        >
          {t("home.hero.explore")}
        </Link>
        <Link
          href="/auth"
          className="inline-flex h-13 w-full items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-navy sm:w-auto"
        >
          {t("home.hero.join")}
        </Link>
      </div>
    </section>
  );
}
