import type { Story } from "@/lib/stories/types";
import type { TFunc } from "@/i18n/dictionary";
import { formatDisplayDate } from "@/lib/format";

export function StoryMeta({ story, t }: { story: Story; t: TFunc }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stitch-text/70">
      <span className="font-semibold text-stitch-navy">{story.author}</span>
      <span aria-hidden>&middot;</span>
      <time dateTime={story.publishedAt}>{formatDisplayDate(story.publishedAt)}</time>
      <span aria-hidden>&middot;</span>
      <span>{t("storyDetail.minRead", { count: story.readTimeMinutes })}</span>
    </div>
  );
}
