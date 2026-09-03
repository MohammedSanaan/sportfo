import Link from "next/link";
import { lexend } from "@/features/homepage/lexend";
import { getServerTranslations } from "@/i18n/server";

// Reached when /stories/[slug] doesn't match any known story slug -- a
// safe, on-brand 404 rather than a crash or a blank page, same pattern as
// src/app/register/[category]/not-found.tsx.
export default async function StoryNotFound() {
  const { t } = await getServerTranslations();

  return (
    <div
      className={`${lexend.variable} flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-white px-4 py-16 text-center font-stitch`}
    >
      <h1 className="text-2xl font-bold text-stitch-navy sm:text-3xl">
        {t("storyDetail.notFoundTitle")}
      </h1>
      <p className="mt-3 max-w-md text-base text-stitch-text/70">
        {t("storyDetail.notFoundDescription")}
      </p>
      <Link
        href="/stories"
        className="mt-6 inline-flex h-12 items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
      >
        {t("storyDetail.notFoundAction")}
      </Link>
    </div>
  );
}
