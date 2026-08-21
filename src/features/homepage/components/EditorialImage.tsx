import Image from "next/image";
import { cn } from "@/lib/cn";
import { MEDIA, type Media, type MediaKey } from "../data/media";

/**
 * The only way photography enters this page.
 *
 * The source set is openly-licensed stock shot by many different people in
 * many different conditions. Rendering any of it raw would read as a mood
 * board. Instead every image is desaturated toward the brand's cool axis,
 * pushed under a navy grade and finished with grain, so a floodlit pitch and
 * a studio portrait sit in the same world.
 *
 * `grade` controls how far under the navy the image sits:
 *   backdrop — photography behind content that has to dominate it, such as
 *              the sport panels where white linework is drawn on top
 *   deep     — full-bleed backgrounds that type must stay legible on top of
 *   medium   — editorial panels that carry their own captions
 *   light    — portraits in cards, where the face still has to read
 *   vivid    — small cards on a dark backdrop where the photo itself IS the
 *              content (the hero's sport carousel): no navy wash, no cool
 *              multiply cast, just enough of a grade to sit in the same
 *              family as everything else. Reach for this before reaching
 *              outside EditorialImage for a raw <Image> -- it's still the
 *              one place photography enters the page, just the mildest
 *              setting on the existing dial.
 */
export function EditorialImage({
  media,
  grade = "medium",
  priority,
  sizes = "100vw",
  // Position is a prop rather than something the caller passes through
  // `className`: the project's `cn` is a plain join with no conflict
  // resolution, so an `absolute` passed in would silently lose to a
  // hardcoded `relative` here and collapse the image to zero height.
  inset = false,
  className,
  imageClassName,
  children,
}: {
  media: MediaKey;
  grade?: "backdrop" | "deep" | "medium" | "light" | "vivid";
  priority?: boolean;
  sizes?: string;
  inset?: boolean;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}) {
  // Widened to Media so `focus` reads as optional: the literal union from
  // `as const` only carries the key on the entries that define one.
  const { src, alt, focus }: Media = MEDIA[media];

  const filter = {
    backdrop: "saturate(0.12) contrast(1.15) brightness(0.42)",
    deep: "saturate(0.45) contrast(1.12) brightness(0.92)",
    medium: "saturate(0.6) contrast(1.05) brightness(0.86)",
    light: "saturate(0.8) contrast(1.02) brightness(0.97)",
    vivid: "saturate(0.95) contrast(1.06) brightness(1.03)",
  }[grade];

  const wash = {
    backdrop: "bg-navy-975/55",
    deep: "bg-navy-975/35",
    medium: "bg-navy-950/32",
    light: "bg-navy-950/10",
    vivid: "bg-transparent",
  }[grade];

  return (
    <div
      className={cn(
        "sf-grain overflow-hidden",
        inset ? "absolute inset-0" : "relative",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        style={{ objectPosition: focus ?? "50% 50%", filter }}
        className={cn("object-cover", imageClassName)}
      />
      {/* Navy grade — unifies the set and buys contrast for overlaid type. */}
      <div aria-hidden className={cn("absolute inset-0", wash)} />
      {/* A cool cast in the shadows, warmth pulled out of the highlights --
          skipped for "vivid", which is the whole point of that grade: this
          multiply layer is what was reading as "a dark blue wash over the
          photo" when the photo itself needs to stay legible. */}
      {grade !== "vivid" && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand-900/25 via-transparent to-navy-975/45 mix-blend-multiply"
        />
      )}
      {children}
    </div>
  );
}
