import Image from "next/image";
import type { StoryContentBlock } from "@/lib/stories/types";

// A controlled reading width (max-w-2xl, ~65ch) at every breakpoint --
// the hero image above is allowed to run wider, but body copy never
// stretches into an uncomfortable line length even on a large desktop
// viewport (spec section 10: "controlled reading width").
export function StoryContent({ blocks }: { blocks: StoryContentBlock[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={index}
                className="mt-5 text-base leading-relaxed text-stitch-text first:mt-0 sm:text-[1.05rem]"
              >
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h2
                key={index}
                className="mt-10 text-xl leading-snug font-bold text-stitch-navy sm:mt-12 sm:text-2xl"
              >
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-8 border-l-4 border-stitch-orange py-1 pl-5 text-lg leading-snug font-semibold text-stitch-navy italic sm:text-xl"
              >
                {block.text}
              </blockquote>
            );
          case "image":
            return (
              <figure key={index} className="my-8">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    sizes="(min-width: 1024px) 42rem, 100vw"
                    className="object-cover"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="mt-2 text-center text-xs text-gray-500">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
