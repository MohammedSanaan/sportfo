import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/stories/types";
import type { TFunc } from "@/i18n/dictionary";
import { cn } from "@/lib/cn";

interface StoryCardProps {
  story: Story;
  t: TFunc;
  className?: string;
  /** First card in a grid gets eager loading + priority sizing hints. */
  priority?: boolean;
}

// Same card language as the Opportunities section (rounded-lg, top orange
// accent border, stitch-card-lift/stitch-card-image hover) -- reused here
// rather than the homepage teaser's HoverRevealCards, which only reveals a
// title on hover/focus and has no room for an excerpt. A listing/related
// grid is read, not skimmed, so the card shows its excerpt and metadata up
// front -- important on mobile too, where "hover" never fires at all.
export function StoryCard({ story, t, className, priority = false }: StoryCardProps) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className={cn(
        "stitch-card-lift group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] outline-none transition-colors duration-300 hover:border-t-stitch-orange-hover focus-visible:ring-2 focus-visible:ring-stitch-orange focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <Image
          src={story.coverImage}
          alt={story.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="stitch-card-image object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="text-xs font-semibold tracking-wide text-stitch-orange uppercase">
          {story.category}
        </span>
        <h3 className="mt-2 text-lg leading-snug font-bold text-stitch-navy">{story.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{story.excerpt}</p>
        <span className="mt-4 text-sm font-semibold text-stitch-blue">
          {t("storiesPage.readStory")} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
