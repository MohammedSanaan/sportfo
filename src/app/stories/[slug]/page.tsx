import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lexend } from "@/features/homepage/lexend";
import { getAllStorySlugs, getRelatedStories, getStoryBySlug } from "@/lib/stories/data";
import { StoryContent } from "@/features/stories/components/StoryContent";
import { StoryMeta } from "@/features/stories/components/StoryMeta";
import { RelatedStories } from "@/features/stories/components/RelatedStories";
import { getServerTranslations } from "@/i18n/server";

interface StoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Pre-renders all known stories at build time; a slug outside this set
// still safely reaches notFound() below rather than crashing (dynamicParams
// defaults to true, so this is a perf hint, not a whitelist gate).
export function generateStaticParams() {
  return getAllStorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return { title: "Story Not Found | SportFo" };
  }

  return {
    title: `${story.title} | SportFo Stories`,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: "article",
      images: [{ url: story.heroImage }],
    },
    twitter: { card: "summary_large_image", title: story.title, description: story.excerpt },
  };
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const { t } = await getServerTranslations();
  const relatedStories = getRelatedStories(slug);

  return (
    <div className={`${lexend.variable} flex flex-1 flex-col bg-white font-stitch text-stitch-text`}>
      <article className="px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stitch-blue transition-colors hover:text-stitch-navy"
          >
            <span aria-hidden>←</span>
            {t("storyDetail.back")}
          </Link>

          <span className="mt-6 inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
            {story.category}
          </span>

          <h1 className="mt-4 text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
            {story.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stitch-text/80 sm:text-xl">
            {story.excerpt}
          </p>

          <StoryMeta story={story} t={t} />
        </div>

        {/* Hero image allowed to run wider than the reading column (spec
            section 10), but capped well short of full-bleed/full-viewport
            so it never dominates the screen on mobile (spec section 9). */}
        <div className="relative mx-auto mt-8 aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-lg sm:aspect-[16/9]">
          <Image
            src={story.heroImage}
            alt={story.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 56rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="py-10 sm:py-14">
          <StoryContent blocks={story.content} />
        </div>

        <div className="mx-auto max-w-2xl border-t border-border-default py-10 text-center">
          <Link
            href="/stories"
            className="inline-flex h-12 items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
          >
            {t("storyDetail.exploreAllCta")}
          </Link>
        </div>
      </article>

      <RelatedStories stories={relatedStories} t={t} />
    </div>
  );
}
